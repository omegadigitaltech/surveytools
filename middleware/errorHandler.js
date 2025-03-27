/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Handle multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      status: 'failure',
      code: 400,
      msg: 'File too large. Maximum file size is 5MB.'
    });
  }

  if (err.message && err.message.includes('Only PDF, DOCX, DOC and TXT files are allowed')) {
    return res.status(400).json({
      status: 'failure',
      code: 400,
      msg: 'Invalid file type. Only PDF, DOCX, DOC, and TXT files are allowed.'
    });
  }

  // Handle Gemini API errors
  if (err.message && err.message.includes('Failed to extract valid JSON from AI response')) {
    return res.status(500).json({
      status: 'failure',
      code: 500,
      msg: 'Unable to process the document. The AI could not extract questions from the document.'
    });
  }

  // Handle File upload errors
  if (err.message && (
    err.message.includes('File upload error') ||
    err.message.includes('uploadFile')
  )) {
    console.error('FileManager error:', err);
    return res.status(500).json({
      status: 'failure',
      code: 500,
      msg: 'Error uploading document to AI service. Please try again later.'
    });
  }

  // Handle Google Generative AI-specific error classes
  if (err.constructor && err.constructor.name === 'GoogleGenerativeAIError' || 
      err.constructor && err.constructor.name === 'GoogleGenerativeAIFetchError' ||
      err.message && err.message.includes('GoogleGenerativeAI')) {
    
    // API key errors
    if (err.message && err.message.includes('API key')) {
      console.error('API key error:', err);
      return res.status(500).json({
        status: 'failure',
        code: 500,
        msg: 'AI service configuration error. Please contact support.'
      });
    }
    
    // Format or payload errors
    if (err.message && (
      err.message.includes('Invalid JSON payload') || 
      err.message.includes('BadRequest') ||
      err.message.includes('Cannot find field') ||
      err.message.includes('fileUri')
    )) {
      console.error('Gemini API format error:', err);
      return res.status(500).json({
        status: 'failure',
        code: 500,
        msg: 'Error processing document format. Please try a simpler document.'
      });
    }
    
    // Generic AI service errors
    return res.status(500).json({
      status: 'failure',
      code: 500,
      msg: 'AI service error. Please try again later.'
    });
  }

  // Handle Gemini API quota or connectivity errors
  if (err.message && (
    err.message.includes('RESOURCE_EXHAUSTED') || 
    err.message.includes('QUOTA_EXCEEDED') ||
    err.message.includes('PERMISSION_DENIED')
  )) {
    return res.status(429).json({
      status: 'failure',
      code: 429,
      msg: 'AI service temporarily unavailable. Please try again later.'
    });
  }

  // Handle file processing errors
  if (err.message && (
    err.message.includes('Error extracting text from') ||
    err.message.includes('Unsupported file format')
  )) {
    return res.status(400).json({
      status: 'failure',
      code: 400,
      msg: 'Could not process the uploaded document. Please ensure it is a valid file and try again.'
    });
  }

  // Handle filesystem errors
  if (err.code && (
    err.code === 'ENOENT' ||
    err.code === 'EACCES' ||
    err.code === 'EPERM'
  )) {
    console.error('Filesystem error:', err);
    return res.status(500).json({
      status: 'failure',
      code: 500,
      msg: 'Server file system error. Please try again later.'
    });
  }

  // Handle MongoDB errors
  if (err.name === 'MongoError' || err.name === 'MongoServerError') {
    return res.status(500).json({
      status: 'failure',
      code: 500,
      msg: 'Database error occurred. Please try again later.'
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    status: 'failure',
    code: err.status || 500,
    msg: err.message || 'Internal Server Error'
  });
};

module.exports = errorHandler; 