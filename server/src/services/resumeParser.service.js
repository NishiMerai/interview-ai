import mammoth from 'mammoth';

export async function extractTextFromResume(file) {
  try {
    const mimeType = file.mimetype;

    // DOCX parsing
    if (
      mimeType ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      const result = await mammoth.extractRawText({
        buffer: file.buffer,
      });

      return result.value || '';
    }

    // PDF parsing
    if (mimeType === 'application/pdf') {
       const { PDFParse } = await import('pdf-parse');
       const parser = new PDFParse({ data: file.buffer });
       const result = await parser.getText();
       await parser.destroy();
       return result.text || '';
    }

    return '';
  } catch (error) {
    console.error('Resume parsing error:', error);

    return '';
  }
}
