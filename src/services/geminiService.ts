import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini on the frontend as per system guidelines
// The API key is injected by the platform and handled securely within the environment
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export interface ScanResult {
  batchNumber: string;
  expiryMonth: number;
  expiryYear: number;
}

export interface ScanResponse {
  data: ScanResult | null;
  usage?: {
    promptTokens?: number;
    candidatesTokens?: number;
  };
}

export async function scanBatchImage(base64Image: string): Promise<ScanResponse> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Gemini API key is not configured.");
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image,
            },
          },
          {
            text: "Extract: batchNumber, expiryMonth (1-12), expiryYear (4-digit). Return JSON.",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            batchNumber: { type: Type.STRING },
            expiryMonth: { type: Type.NUMBER },
            expiryYear: { type: Type.NUMBER }
          },
          required: ["batchNumber", "expiryMonth", "expiryYear"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      return { data: null };
    }

    const data = JSON.parse(text);
    
    // Basic validation to ensure data is usable
    if (!data.batchNumber || !data.expiryMonth || !data.expiryYear) {
      return { data: null };
    }

    return {
      data,
      usage: {
        promptTokens: response.usageMetadata?.promptTokenCount,
        candidatesTokens: response.usageMetadata?.candidatesTokenCount
      }
    };
  } catch (error) {
    console.error("Gemini OCR Error:", error);
    throw error;
  }
}
