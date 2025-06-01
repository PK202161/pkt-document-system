const express = require('express');
const multer = require('multer');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Setup multer for file upload
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

// Upload XML document
router.post('/upload', upload.single('xmlFile'), async (req, res) => {
  try {
    const { docType } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    if (!docType || !['SO', 'EN', 'SH'].includes(docType)) {
      return res.status(400).json({ message: 'Invalid document type' });
    }

    const xmlContent = file.buffer.toString('utf8');
    const docNumber = `${docType}${Date.now()}`;

    // Save to database
    const document = await prisma.document.create({
      data: {
        docNumber,
        docType,
        xmlContent,
        uploadedBy: 'admin', // ยังไม่มี auth middleware
        status: 'UPLOADED'
      }
    });

    res.json({
      success: true,
      message: 'File uploaded successfully',
      document: {
        id: document.id,
        docNumber: document.docNumber,
        docType: document.docType,
        status: document.status
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Upload failed' });
  }
});

// Get documents list
router.get('/', async (req, res) => {
  try {
    const documents = await prisma.document.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    res.json({
      success: true,
      documents
    });
  } catch (error) {
    console.error('Fetch documents error:', error);
    res.status(500).json({ message: 'Failed to fetch documents' });
  }
});

module.exports = router;
