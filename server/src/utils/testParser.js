import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { extractTextFromResume } from '../services/resumeParser.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testPerformance() {
  const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
  const files = [
    { name: '1782194777522-NISHI-RESUME-6.docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
    { name: '1782197369108-NISHI-RESUME-6.pdf', mime: 'application/pdf' }
  ];

  let log = '';

  for (const fileInfo of files) {
    const filePath = path.join(uploadsDir, fileInfo.name);
    if (!fs.existsSync(filePath)) {
      log += `File not found: ${fileInfo.name}\n`;
      continue;
    }

    const buffer = fs.readFileSync(filePath);
    const mockFile = {
      buffer,
      mimetype: fileInfo.mime,
      originalname: fileInfo.name
    };

    log += `--- Testing ${fileInfo.name} ---\n`;
    try {
      const text = await extractTextFromResume(mockFile);
      log += `Extracted text length: ${text.length}\n`;
      log += `Preview: ${text.substring(0, 500).replace(/\n/g, ' ')}\n`;
    } catch (err) {
      log += `Error parsing ${fileInfo.name}: ${err.message}\n${err.stack}\n`;
    }
    log += '\n';
  }

  fs.writeFileSync('parser_test_results.txt', log);
  console.log('Results written to parser_test_results.txt');
}

testPerformance().catch(err => {
    fs.writeFileSync('parser_test_error.txt', err.stack);
    console.error(err);
});
