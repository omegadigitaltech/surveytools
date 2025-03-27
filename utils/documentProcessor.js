const fs = require('fs').promises;
const path = require('path');
const pdfParse = require('pdf-parse');
const { DocxParser } = require('docx-parser');

/**
 * Extracts text content from various document formats
 * @param {string} filePath - Path to the document file
 * @returns {Promise<Object>} - Object containing extracted text and file as base64
 */
async function extractTextFromDocument(filePath) {
  const fileExtension = path.extname(filePath).toLowerCase();
  
  try {
    // Read the file as base64
    const fileBuffer = await fs.readFile(filePath);
    const base64File = fileBuffer.toString('base64');
    const mimeType = getMimeType(fileExtension);
    const base64String = `data:${mimeType};base64,${base64File}`;
    
    let extractedText;
    switch (fileExtension) {
      case '.pdf':
        extractedText = await extractTextFromPdf(filePath);
        break;
      case '.docx':
      case '.doc':
        extractedText = await extractTextFromDocx(filePath);
        break;
      case '.txt':
        extractedText = await extractTextFromTxt(filePath);
        break;
      default:
        throw new Error('Unsupported file format');
    }
    
    return {
      text: extractedText,
      base64File: base64String,
      fileName: path.basename(filePath),
      fileType: fileExtension.substring(1) // Remove the leading dot
    };
  } catch (error) {
    console.error('Error extracting text from document:', error);
    throw error;
  }
}

/**
 * Get MIME type based on file extension
 */
function getMimeType(extension) {
  switch (extension.toLowerCase()) {
    case '.pdf':
      return 'application/pdf';
    case '.docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case '.doc':
      return 'application/msword';
    case '.txt':
      return 'text/plain';
    default:
      return 'application/octet-stream';
  }
}

/**
 * Extracts text from PDF files
 */
async function extractTextFromPdf(filePath) {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const pdfData = await pdfParse(dataBuffer);
    return pdfData.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw error;
  }
}

/**
 * Extracts text from DOCX files
 */
async function extractTextFromDocx(filePath) {
  try {
    return new Promise((resolve, reject) => {
      const parser = new DocxParser();
      parser.parseDocx(filePath, (error, text) => {
        if (error) {
          reject(error);
        } else {
          resolve(text);
        }
      });
    });
  } catch (error) {
    console.error('Error extracting text from DOCX:', error);
    throw error;
  }
}

/**
 * Extracts text from TXT files
 */
async function extractTextFromTxt(filePath) {
  try {
    const text = await fs.readFile(filePath, 'utf8');
    return text;
  } catch (error) {
    console.error('Error extracting text from TXT:', error);
    throw error;
  }
}

module.exports = {
  extractTextFromDocument
}; 