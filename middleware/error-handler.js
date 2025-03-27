const { StatusCodes } = require('http-status-codes')
// const multer = require('multer')

const errorHandlerMiddleware = async (err, req, res, next) => {
    
    console.log(err)

    let customError = {
      //set default 
      statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
      msg: 'An error Occured'
    }

    if(err.name === 'ValidationError'){
      customError.msg = Object.values(err.errors).map((item) => item.message).join(',')
      customError.statusCode = 400
    }
  
    if(err.code && err.code === 11000){
      customError.msg = `Duplicate Value entered for ${Object.keys(err.keyValue)} field, please choose another value`
      customError.statusCode = StatusCodes.BAD_REQUEST
    }
  
    if(err.name == 'CastError'){
      customError.msg = `No item found with id : ${err.value}`
      customError.statusCode = 404
    }



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

    // return res.render("admin/error-500", {layout: noLayout, name: err.name,statusCode: customError.statusCode, message: customError.msg})
    return res.status(customError.statusCode).json({ 
        status: "failure",
        code: customError.statusCode,
        msg: customError.msg 
    })
  }

module.exports = errorHandlerMiddleware


