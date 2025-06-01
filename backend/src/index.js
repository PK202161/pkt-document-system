const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3004;

// Middleware
app.use(cors({
  origin: [
    'http://172.16.2.12:3002', 
    'http://localhost:3002',
    'http://172.16.2.12:3000',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'PKT Document Management API Server is running!',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Test endpoint for frontend
app.get('/api/auth/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Backend API is working!',
    timestamp: new Date().toISOString()
  });
});

// Simple login endpoint (temporary)
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  console.log('Login attempt:', { username, password });
  
  // Simple validation (replace with real auth later)
  if (username === 'admin' && password === 'admin123') {
    res.json({
      success: true,
      message: 'Login successful',
      token: 'temporary-token-' + Date.now(),
      user: {
        id: 1,
        username: 'admin',
        role: 'administrator'
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid username or password'
    });
  }
});

// Simple document upload endpoint (temporary)
app.post('/api/documents/upload', (req, res) => {
  res.json({
    success: true,
    message: 'Document upload endpoint (placeholder)',
    data: {
      id: Date.now(),
      filename: 'test.xml',
      uploadTime: new Date().toISOString()
    }
  });
});

// Get documents endpoint (temporary)
app.get('/api/documents', (req, res) => {
  res.json({
    success: true,
    message: 'Document list endpoint (placeholder)',
    data: []
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    success: false, 
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 PKT Document Management API Server running on port ${PORT}`);
  console.log(`📋 Server URL: http://172.16.2.12:${PORT}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
});

module.exports = app;