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

export const generateBidScores = async ({ budget, bids }) => {
  try {
    const introText = `You are scoring vendor bids for a tender by PRICE COMPETITIVENESS ONLY — do not consider delivery time, vendor reputation, or anything else.

Tender budget: ${budget}

Below is each bid's id, quoted total price, and its uploaded quotation document(s), which contain an itemized price breakdown. Compare vendors PER-ITEM where items reasonably match across vendors (same or equivalent line item), not just on the overall quoted total — the itemized breakdown is more informative than the total alone.

For each bid, assign:
- aiScore: integer 0-100, where 100 = most price-competitive overall (considering both total price and per-item pricing relative to the other bids) and 0 = least competitive.
- aiFlags: array (can be empty) of short, factual PRICE-ONLY observations — e.g. a specific line item priced notably higher/lower than other vendors' equivalent item, an unusually low or high total, or a tie. Each flag: { "severity": "info"|"warning", "message": string }. Do NOT comment on document completeness, compliance, or anything non-price-related.

Return ONLY a JSON array, one entry per bid id, in exactly this shape and nothing else:
[{ "id": string, "aiScore": number, "aiFlags": [{ "severity": "info"|"warning", "message": string }] }]`;

    const contents = [{ text: introText }];

    for (const bid of bids) {
      contents.push({
        text: `--- Bid id: ${bid.id}, quoted total price: ${bid.quotedPrice} ---`,
      });
      const fileParts = await buildFileParts(bid.documents || []);
      contents.push(...fileParts);
    }

    const result = await getClient().models.generateContent({
      model: "gemini-flash-latest",
      contents,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(result.text);
    return Array.isArray(parsed) ? parsed : null;
  } catch (error) {
    console.error("Gemini bid scoring error:", error.message);
    return null;
  }
};
