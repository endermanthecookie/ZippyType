import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const langs = [
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'zh', name: 'Chinese (Simplified)' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
  { code: 'tr', name: 'Turkish' },
  { code: 'nl', name: 'Dutch' },
  { code: 'pl', name: 'Polish' },
  { code: 'sv', name: 'Swedish' },
  { code: 'da', name: 'Danish' },
  { code: 'fi', name: 'Finnish' },
  { code: 'no', name: 'Norwegian' },
  { code: 'el', name: 'Greek' }
];

const enContent = fs.readFileSync('./src/Lang/en.lang', 'utf-8');

async function translateAll() {
  for (const lang of langs) {
    console.log(`Translating to ${lang.name}...`);
    try {
      const prompt = `Translate the following JSON file to ${lang.name}. Keep the keys exactly the same. Return ONLY valid JSON, no markdown formatting, no backticks, no extra text.
      
      ${enContent}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const translatedText = response.text.trim();
      fs.writeFileSync(`./src/Lang/${lang.code}.lang`, translatedText);
      console.log(`Successfully translated ${lang.code}.lang`);
    } catch (e) {
      console.error(`Failed to translate ${lang.code}:`, e);
    }
  }
}

translateAll();
