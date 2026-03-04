
import { AIProvider } from "../types";
import { generateCoachNote } from "./aiService";

export const getCoachReport = async (
  provider: AIProvider,
  token: string | undefined,
  isPro: boolean,
  wpm: number,
  accuracy: number,
  errors: number,
  missedChars: string[]
): Promise<string> => {
  return await generateCoachNote(provider, token, isPro, wpm, accuracy, errors, missedChars);
};
