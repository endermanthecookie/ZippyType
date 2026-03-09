
import { GoogleGenAI } from "@google/genai";
import { Difficulty, GameMode } from "../types";

export const fetchTypingText = async (
  difficulty: Difficulty, 
  category: string = "General", 
  seed?: string,
  problemKeys: string[] = [],
  textLength: 'short' | 'medium' | 'long' = 'medium',
  language: string = 'en',
  mode: GameMode = GameMode.SOLO,
  subMode: 'daily' | 'speed' | 'accuracy' | 'themed' = 'daily'
): Promise<string> => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is missing");
  const ai = new GoogleGenAI({ apiKey });

  if (mode === GameMode.CODE) {
    // ... existing code logic ...
    const lang = ['javascript', 'python', 'typescript', 'java', 'c++'][Math.floor(Math.random() * 5)];
    const prompt = `Generate a valid, clean, and idiomatic ${lang} code snippet.
    It should be approximately ${textLength === 'short' ? '2-3' : textLength === 'medium' ? '4-6' : '8-12'} lines of code.
    Do not include comments. Do not include markdown code blocks (like \`\`\`). Just the raw code.
    Ensure indentation is consistent (2 or 4 spaces).`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      
      if (!response || !response.text) {
        throw new Error("Empty response from Gemini Core.");
      }
      
      let code = response.text.trim();
      code = code.replace(/```[a-z]*\n?/g, '').replace(/```/g, '');
      code = code.replace(/\t/g, '  ');
      
      return code;
    } catch (error) {
      console.error("Gemini Core Error:", error);
      throw error;
    }
  }

  const drillContext = problemKeys.length > 0 
    ? `IMPORTANT: This is a neuro-adaptive drill. The user is struggling with these keys: [${problemKeys.join(', ')}]. 
       Ensure the generated text contains an abnormally high frequency of these specific characters to help them practice.`
    : "";

  let theme = category !== "General" ? category : "fascinating trivia or life philosophy";
  let modeSpecificPrompt = "";

  if (subMode === 'speed') {
    modeSpecificPrompt = "Focus on short, common, high-frequency words that are easy to type fast. Avoid complex punctuation.";
    theme = "common English words and phrases";
  } else if (subMode === 'accuracy') {
    modeSpecificPrompt = "Focus on complex words, unusual letter combinations, numbers, and diverse punctuation to test precision.";
  } else if (subMode === 'themed') {
    modeSpecificPrompt = `Focus strictly on the theme of "${category}". Use vocabulary specific to this topic.`;
  }

  let lengthConstraint = "";
  if (textLength === 'short') lengthConstraint = "exactly 6 to 8 words total";
  else if (textLength === 'medium') lengthConstraint = "exactly 10 to 13 words total";
  else if (textLength === 'long') lengthConstraint = "exactly 20 to 25 words total";

  const prompt = `Generate a single ${difficulty} level typing practice sentence about "${theme}". 
  The language of the text MUST be: ${language}.
  ${seed ? `Base the content loosely on: ${seed}.` : ''}
  ${drillContext}
  ${modeSpecificPrompt}
  
  CRITICAL CONSTRAINTS:
  - You MUST generate a sentence that is ${lengthConstraint}. 
  - DO NOT exceed or fall short of this word count. Count the words carefully before returning.
  - Return ONLY the sentence text. No quotes. No extra labels.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    if (!response || !response.text) {
      throw new Error("Empty response from Gemini Core.");
    }
    
    return response.text.trim();
  } catch (error) {
    console.error("Gemini Core Error:", error);
    throw error;
  }
};

export const fetchCoachNote = async (wpm: number, accuracy: number, errors: number, missedChars: string[]): Promise<string> => {
  const prompt = `Act as a world-class typing coach. Analyze these stats: 
  WPM: ${wpm}, Accuracy: ${accuracy}%, Total Errors: ${errors}. 
  Frequently missed characters: ${missedChars.join(', ')}.
  Provide a single, insightful, motivating sentence of feedback (max 20 words).`;

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is missing");
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text?.trim() || "Great run! Focus on maintaining rhythm during difficult transitions.";
  } catch {
    return "Solid effort. Consistency is the key to unlocking true speed.";
  }
};
