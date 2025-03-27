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