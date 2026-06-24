import fs from "fs";
import mammoth from "mammoth";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

export async function extractTextFromResume(file) {
  try {
    const mimeType = file.mimetype;
    const fileBuffer = file.buffer || fs.readFileSync(file.path);

    console.log("Analyzing file:", {
      originalname: file.originalname,
      mimetype: mimeType,
      path: file.path,
      hasBuffer: !!file.buffer,
      size: fileBuffer?.length,
    });

    if (
      mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.originalname.toLowerCase().endsWith(".docx")
    ) {
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      console.log("DOCX extracted length:", result.value.length);
      return result.value || "";
    }

    if (
      mimeType === "application/pdf" ||
      file.originalname.toLowerCase().endsWith(".pdf")
    ) {
      const data = await pdfParse(fileBuffer);
      console.log("PDF extracted length:", data.text.length);
      return data.text || "";
    }

    console.warn("Unsupported file type:", mimeType);
    return "";
  } catch (error) {
    console.error("Resume parsing error:", error);
    return "";
  }
}
