import mammoth from 'mammoth';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

export async function extractTextFromResume(file) {
  try {
    const mimeType = file.mimetype;
    console.log("Analyzing file MIME type:", mimeType);

    // DOCX parsing
    if (
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.originalname.endsWith('.docx')
    ) {
      console.log("Using Mammoth for DOCX extraction...");
      const result = await mammoth.extractRawText({
        buffer: file.buffer,
      });
      return result.value || '';
    }

    // PDF parsing
    if (mimeType === 'application/pdf' || file.originalname.endsWith('.pdf')) {
      console.log("Using pdf-parse for PDF extraction...");
      const data = await pdfParse(file.buffer);
      return data.text || '';
    }

    console.warn("Unsupported file type for extraction:", mimeType);
    return '';
  } catch (error) {
    console.error('Resume parsing error details:', error);
    return '';
  }
}
