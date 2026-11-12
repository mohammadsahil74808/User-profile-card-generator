const express = require('express');
const cors = require('cors');
const path = require('path');
const CardProcessor = require('./public/js/processor.js');

const app = express();
const PORT = process.env.PORT || 3000;

// Security and utility middleware
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve frontend static assets from public/
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Health check endpoint to test connection status
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    server: 'Node.js Express Engine',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime())
  });
});

/**
 * Primary POST Endpoint: Process Profile Data and return formatted Profile Card
 */
app.post('/api/profile', (req, res) => {
  try {
    const rawData = req.body || {};
    
    // Process input data through core engine
    const result = CardProcessor.processProfileData(rawData, {
      processedBy: `Node.js Express Engine (Port ${PORT})`
    });

    // Return exact status code and response payload
    return res.status(result.status).json(result);
  } catch (err) {
    console.error('Server error processing profile:', err);
    return res.status(500).json({
      success: false,
      status: 500,
      error: 'Internal Server Error',
      message: 'An unexpected error occurred while formatting the profile card.'
    });
  }
});

/**
 * Custom error handler for malformed JSON bodies
 */
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      status: 400,
      error: 'Malformed JSON',
      message: 'The request body must be valid JSON.'
    });
  }
  next(err);
});

// Fallback route for SPA / 404
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Only listen if not imported by test runner
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`🚀 User Profile Card Generator Server running!`);
    console.log(`🌐 Local URL: http://localhost:${PORT}`);
    console.log(`📡 API POST Endpoint: http://localhost:${PORT}/api/profile`);
    console.log(`===============================================`);
  });
}

module.exports = app;
