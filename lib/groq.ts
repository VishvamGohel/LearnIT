import Groq from "groq-sdk";

const apiKey = process.env.GROQ_API_KEY || "mock-groq-key";
export const groqClient = new Groq({ apiKey });

export const getGroqModelName = () => {
  return "llama-3.3-70b-versatile";
};
