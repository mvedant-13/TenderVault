import { GoogleGenAI } from "@google/genai";
import fs from "fs/promises";
import path from "path";

let ai;
const getClient = () => {
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return ai;
};

const SUPPORTED_MIME_TYPES = {
  ".pdf": "application/pdf",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
};

const buildFileParts = async (documents = []) => {
  const parts = [];

  for (const doc of documents) {
    const ext = path.extname(doc.filePath).toLowerCase();
    const mimeType = SUPPORTED_MIME_TYPES[ext];
    if (!mimeType) continue;

    try {
      const absolutePath = path.join(process.cwd(), doc.filePath);
      const buffer = await fs.readFile(absolutePath);
      parts.push({
        inlineData: {
          mimeType,
          data: buffer.toString("base64"),
        },
      });
    } catch (error) {
      console.error(
        `Skipping document "${doc.fileName}" for AI summary — read failed:`,
        error.message,
      );
    }
  }

  return parts;
};

export const generateTenderSummary = async ({
  title,
  description,
  department,
  category,
  budget,
  deadline,
  documents = [],
}) => {
  try {
    const promptText = `Summarize this tender in 3-4 plain sentences for a vendor scanning a list of tenders. Focus on what work/goods/services are being procured and any key requirements. If attached tender documents are provided, use them as the primary source of detail — the text fields below are only a high-level starting point. Do not use markdown formatting.

Title: ${title}
Department: ${department}
Category: ${category}
Description: ${description}
Budget: ${budget}
Deadline: ${deadline}`;

    const fileParts = await buildFileParts(documents);

    const contents = [{ text: promptText }, ...fileParts];

    const result = await getClient().models.generateContent({
      model: "gemini-flash-latest",
      contents,
    });

    return result.text.trim();
  } catch (error) {
    console.error("Gemini summary generation error:", error.message);
    return null;
  }
};
