import { GoogleGenAI } from "@google/genai";
import fs from 'fs';

async function generateLogo() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY not found");
    return;
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = "A high-resolution (500x500) square logo for a typing app called 'ZippyType'. The logo features a sharp, fast-looking 'Z' shape in a vibrant indigo and pink gradient. Below the 'Z' icon, the text 'ZippyType' is written in a modern, bold, clean sans-serif font. The background is completely transparent (no white or black background). The style is minimalist, professional, and high-tech, matching a high-performance typing trainer. The 'Z' icon has a subtle glow effect.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: prompt,
          },
        ],
      },
      config: {
        imageConfig: {
              aspectRatio: "1:1",
          },
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64Data = part.inlineData.data;
        const buffer = Buffer.from(base64Data, 'base64');
        fs.writeFileSync('Logo.png', buffer);
        console.log("Logo.png generated successfully");
        return;
      }
    }
    console.error("No image data found in response");
  } catch (error) {
    console.error("Error generating logo:", error);
  }
}

generateLogo();
