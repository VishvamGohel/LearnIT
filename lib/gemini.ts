import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "mock-gemini-key";
const genAI = new GoogleGenerativeAI(apiKey);

export const getGeminiModel = () => {
  return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
};
