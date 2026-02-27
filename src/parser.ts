export const parseLangFile = (content: string): Record<string, string> => {
  try {
    return JSON.parse(content);
  } catch (e) {
    console.error("Failed to parse lang file", e);
    return {};
  }
};
