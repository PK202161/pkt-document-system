import React, { useState, useRef } from 'react';
import { Upload, X, FileText, CheckCircle, AlertCircle } from 'lucide-react';

interface FileItem {
  id: number;
  file: File;
  name: string;
  size: number;
  type: string;
  status: 'pending' | 'success' | 'error';
}

interface UploadResponse {
  success: boolean;
  message: string;
  document?: {
    id: number;
    docNumber: string;
    docType: string;
    status: string;
  };
}

const DocumentUpload: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<Record<number, number>>({});
  const [docType, setDocType] = useState<string>('SO');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const validateXMLFile = (file: File): boolean => {
    const isXMLType = file.type === 'text/xml' || 
                      file.type === 'application/xml' || 
                      file.name.toLowerCase().endsWith('.xml');
    return isXMLType;
  };

  const handleFiles = (fileList: FileList) => {
    const validFiles = Array.from(fileList).filter(validateXMLFile);
    
    if (validFiles.length === 0) {
      alert('กรุณาเลือกไฟล์ XML เท่านั้น');
      return;
    }

    const newFiles = validFiles.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'pending' as const
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (id: number) => {
    setFiles(prev => prev.filter(file => file.id !== id));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const uploadFiles = async (): Promise<void> => {
    if (files.length === 0) return;
    
    setUploading(true);
    
    for (const fileItem of files) {
      if (fileItem.status !== 'pending') continue;
      
      const formData = new FormData();
      formData.append('xmlFile', fileItem.file); // Backend expects 'xmlFile'
      formData.append('docType', docType);
      
      try {
        setUploadProgress(prev => ({ ...prev, [fileItem.id]: 0 }));
        
        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            const currentProgress = prev[fileItem.id] || 0;
            if (currentProgress < 90) {
              return { ...prev, [fileItem.id]: currentProgress + 10 };
            }
            return prev;
          });
        }, 200);
        
        const response = await fetch('http://localhost:3004/api/documents/upload', {
          method: 'POST',
          body: formData,
          credentials: 'include'
        });
        
        clearInterval(progressInterval);
        
        const result: UploadResponse = await response.json();
        
        if (response.ok && result.success) {
          setUploadProgress(prev => ({ ...prev, [fileItem.id]: 100 }));
          setFiles(prev => prev.map(f => 
            f.id === fileItem.id ? { ...f, status: 'success' } : f
          ));
          console.log('Upload success:', result);
        } else {
          throw new Error(result.message || 'Upload failed');
        }
      } catch (error) {
        console.error('Upload error:', error);
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id ? { ...f, status: 'error' } : f
        ));
      }
    }
    
    setUploading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">📄 Upload XML Documents</h2>
      
      {/* Document Type Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          📋 Document Type
        </label>
        <select
          value={docType}
          onChange={(e) => setDocType(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="SO">SO - Sales Order</option>
          <option value="EN">EN - Enterprise</option>
          <option value="SH">SH - Shipment</option>
        </select>
      </div>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-lg text-gray-600 mb-2">
          Drag and drop XML files here, or 
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-blue-500 hover:text-blue-600 ml-1 underline"
          >
            browse
          </button>
        </p>
        <p className="text-sm text-gray-500">
          <span className="font-medium text-red-600">XML files only</span> - Maximum 5MB per file
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          accept=".xml,text/xml,application/xml"
        />
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">📋 XML Files to Upload</h3>
          <div className="space-y-3">
            {files.map(fileItem => (
              <div key={fileItem.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="font-medium text-gray-800">{fileItem.name}</p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(fileItem.size)} • Type: {docType}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {fileItem.status === 'pending' && (
                    <button
                      onClick={() => removeFile(fileItem.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  
                  {uploadProgress[fileItem.id] !== undefined && fileItem.status === 'pending' && (
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress[fileItem.id]}%` }}
                      />
                    </div>
                  )}
                  
                  {fileItem.status === 'success' && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-sm text-green-600">Uploaded</span>
                    </div>
                  )}
                  
                  {fileItem.status === 'error' && (
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-500" />
                      <span className="text-sm text-red-600">Failed</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Button */}
      {files.length > 0 && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={uploadFiles}
            disabled={uploading || files.every(f => f.status !== 'pending')}
            className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 ${
              uploading || files.every(f => f.status !== 'pending')
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            <Upload className="w-4 h-4" />
            {uploading ? 'Uploading XML...' : 'Upload XML Files'}
          </button>
        </div>
      )}

      {/* Success Message */}
      {files.length > 0 && files.every(f => f.status === 'success') && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <p className="text-green-800 font-medium">
              ✅ All XML files uploaded successfully!
            </p>
          </div>
        </div>
      )}

      {/* Document Type Info */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-800 mb-2">📚 Document Types:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li><strong>SO:</strong> Sales Order documents</li>
          <li><strong>EN:</strong> Enterprise documents</li>
          <li><strong>SH:</strong> Shipment documents</li>
        </ul>
      </div>
    </div>
  );
};

export default DocumentUpload;