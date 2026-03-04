import { GoogleGenAI } from "@google/genai";
import { AIProvider, Difficulty, GameMode } from "../types";

export const generateText = async (
  provider: AIProvider,
  token: string | undefined, // GitHub token or undefined for Gemini
  isPro: boolean,
  difficulty: Difficulty,
  category: string,
  seed: string | undefined,
  problemKeys: string[],
  textLength: 'short' | 'medium' | 'long',
  language: string,
  mode: GameMode
): Promise<string> => {
  if (provider === AIProvider.GITHUB) {
    if (!token) throw new Error("GitHub token is required for GitHub AI provider.");
    // Import dynamically or use the existing service
    const { fetchGithubTypingText } = await import("./githubService");
    return await fetchGithubTypingText(difficulty, category, seed, problemKeys, token, textLength, language);
  } else {
    // Gemini
    if (!isPro) {
        // Check if we have a fallback or if we should restrict
         // For now, assume Gemini is available if not Pro, but maybe limited
    }
    const { fetchTypingText } = await import("./geminiService");
    return await fetchTypingText(difficulty, category, seed, problemKeys, textLength, language, mode);
  }
};

export const generateCoachNote = async (
  provider: AIProvider,
  token: string | undefined,
  isPro: boolean,
  wpm: number,
  accuracy: number,
  errors: number,
  missedChars: string[]
): Promise<string> => {
  if (provider === AIProvider.GITHUB) {
    if (!token) throw new Error("GitHub token is required for GitHub AI provider.");
    const { fetchGithubCoachNote } = await import("./githubService");
    return await fetchGithubCoachNote(wpm, accuracy, errors, missedChars, token);
  } else {
    const { fetchCoachNote } = await import("./geminiService");
    return await fetchCoachNote(wpm, accuracy, errors, missedChars);
  }
};
