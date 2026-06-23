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

    // PDF fallback
    if (mimeType === 'application/pdf') {
      return `
PDF uploaded successfully.


Please upload DOCX for full parsing or downgrade Node.js to v20 LTS.
`;
    }

    return '';
  } catch (error) {
    console.error('Resume parsing error:', error);

    return '';
  }
}
