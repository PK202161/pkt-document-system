const express = require('express');
const multer = require('multer');
const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Setup multer for file upload (memory storage only)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/xml' || file.originalname.endsWith('.xml')) {
      cb(null, true);
    } else {
      cb(new Error('Only XML files are allowed'));
    }
  }
});

// N8N Configuration
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/pkt-document';

// Upload XML document (NEW VERSION - with N8N integration)
router.post('/upload', upload.single('xmlFile'), async (req, res) => {
  try {
    const { docType, docNumber } = req.body;
    const file = req.file;

    console.log('📤 Upload request:', { docType, docNumber, fileName: file?.originalname });

    if (!file) {
      return res.status(400).json({ 
        success: false,
        message: 'No file uploaded' 
      });
    }

    if (!docType || !['SO', 'EN', 'SH'].includes(docType)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid document type' 
      });
    }

    // Generate document number if not provided (from smart detection)
    const finalDocNumber = docNumber || `${docType}${Date.now()}`;
    
    console.log('💾 Saving metadata to database...');

    // Check if document already exists
    const existingDocument = await prisma.document.findUnique({
      where: { docNumber: finalDocNumber }
    });

    if (existingDocument) {
      console.log('⚠️ Document already exists:', finalDocNumber);
      return res.status(409).json({
        success: false,
        message: `Document ${finalDocNumber} already exists`,
        code: 'DOCUMENT_EXISTS',
        existingDocument: {
          id: existingDocument.id,
          docNumber: existingDocument.docNumber,
          docType: existingDocument.docType,
          status: existingDocument.status,
          createdAt: existingDocument.createdAt
        }
      });
    }

    // Save metadata to PKT database (NO XML CONTENT!)
    const document = await prisma.document.create({
      data: {
        docNumber: finalDocNumber,
        docType,
        filename: file.originalname,      // lowercase
        filesize: file.size,             // lowercase
        uploadedBy: 'admin', // TODO: from JWT token
        status: 'UPLOADED',
        processingstatus: 'PENDING'      // lowercase
      }
    });

    console.log('✅ Document metadata saved:', document.id);

    // Prepare data for N8N
    const xmlContent = file.buffer.toString('utf8');
    const n8nPayload = {
      documentId: document.id,
      docType: document.docType,
      docNumber: document.docNumber,
      fileName: document.filename,         // use lowercase field
      fileSize: document.filesize,         // use lowercase field
      xmlContent: xmlContent,
      uploadedAt: document.createdAt,
      uploadedBy: document.uploadedBy
    };

    console.log('🤖 Sending to N8N workflow...');

    try {
      // Send to N8N for processing
      const n8nResponse = await axios.post(N8N_WEBHOOK_URL, n8nPayload, {
        timeout: 10000, // 10 second timeout
        headers: {
          'Content-Type': 'application/json',
          'X-PKT-Source': 'document-upload'
        }
      });

      console.log('✅ N8N Response:', n8nResponse.status);

      // Update with N8N workflow ID if available
      if (n8nResponse.data?.workflowId) {
        await prisma.document.update({
          where: { id: document.id },
          data: { 
            n8nworkflowid: n8nResponse.data.workflowId,    // lowercase
            processingstatus: 'PROCESSING'                 // lowercase
          }
        });
      }

      // Success response to frontend
      res.json({
        success: true,
        message: 'File uploaded and sent to N8N for processing',
        document: {
          id: document.id,
          docNumber: document.docNumber,
          docType: document.docType,
          fileName: document.filename,              // use lowercase field
          status: document.status,
          processingStatus: document.processingstatus || 'PROCESSING'  // use lowercase field
        }
      });

    } catch (n8nError) {
      console.error('❌ N8N Error:', n8nError.message);
      
      // Update status to error
      await prisma.document.update({
        where: { id: document.id },
        data: { processingstatus: 'ERROR' }        // lowercase
      });

      // Still return success to user (file was uploaded, just N8N failed)
      res.json({
        success: true,
        message: 'File uploaded but N8N processing failed',
        document: {
          id: document.id,
          docNumber: document.docNumber,
          docType: document.docType,
          fileName: document.filename,              // use lowercase field
          status: document.status,
          processingStatus: document.processingstatus || 'ERROR'  // use lowercase field
        },
        warning: 'N8N processing unavailable'
      });
    }

  } catch (error) {
    console.error('💥 Upload error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Upload failed' 
    });
  }
});

// N8N Callback endpoint - for status updates
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { processingStatus, processedAt, n8nWorkflowId, processedData } = req.body;

    console.log(`🔄 N8N Status Update for document ${id}:`, { processingStatus });

    const updatedDocument = await prisma.document.update({
      where: { id: id },
      data: {
        processingstatus: processingStatus,                    // lowercase
        processedat: processedAt ? new Date(processedAt) : new Date(),  // lowercase
        n8nworkflowid: n8nWorkflowId || undefined             // lowercase
      }
    });

    res.json({
      success: true,
      message: 'Document status updated',
      document: updatedDocument
    });

  } catch (error) {
    console.error('❌ Status update error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Status update failed' 
    });
  }
});

// Get documents list (updated with processing status)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, docType, status } = req.query;
    
    const where = {};
    if (docType) where.docType = docType;
    if (status) where.status = status;

    const documents = await prisma.document.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: parseInt(limit),
      select: {
        id: true,
        docNumber: true,
        docType: true,
        filename: true,                    // lowercase
        filesize: true,                    // lowercase
        status: true,
        processingstatus: true,            // lowercase
        uploadedBy: true,
        createdAt: true,
        processedat: true,                 // lowercase
        n8nworkflowid: true                // lowercase
      }
    });

    // Map response to frontend-friendly format
    const mappedDocuments = documents.map(doc => ({
      id: doc.id,
      docNumber: doc.docNumber,
      docType: doc.docType,
      fileName: doc.filename,             // map to camelCase for frontend
      fileSize: doc.filesize,             // map to camelCase for frontend
      status: doc.status,
      processingStatus: doc.processingstatus,  // map to camelCase for frontend
      uploadedBy: doc.uploadedBy,
      createdAt: doc.createdAt,
      processedAt: doc.processedat,            // map to camelCase for frontend
      n8nWorkflowId: doc.n8nworkflowid         // map to camelCase for frontend
    }));

    const total = await prisma.document.count({ where });

    res.json({
      success: true,
      data: mappedDocuments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Documents fetch error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch documents' 
    });
  }
});

// Get single document details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const document = await prisma.document.findUnique({
      where: { id: id }
    });

    if (!document) {
      return res.status(404).json({ 
        success: false,
        message: 'Document not found' 
      });
    }

    // Map response to frontend-friendly format
    const mappedDocument = {
      id: document.id,
      docNumber: document.docNumber,
      docType: document.docType,
      fileName: document.filename,             // map to camelCase
      fileSize: document.filesize,             // map to camelCase
      status: document.status,
      processingStatus: document.processingstatus,  // map to camelCase
      uploadedBy: document.uploadedBy,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
      processedAt: document.processedat,            // map to camelCase
      n8nWorkflowId: document.n8nworkflowid         // map to camelCase
    };

    res.json({
      success: true,
      data: mappedDocument
    });

  } catch (error) {
    console.error('Document fetch error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch document' 
    });
  }
});

module.exports = router;
