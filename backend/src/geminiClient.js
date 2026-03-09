const { GoogleGenAI } = require("@google/genai");

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error(
    "Missing Gemini API key. Set GEMINI_API_KEY in the environment."
  );
}

const genAI = new GoogleGenAI({ apiKey });

async function getJournalingResponse(userText) {
  const prompt = `
You are a supportive journaling assistant.
Respond briefly, kindly, and help the user reflect on their feelings.

User entry:
${userText}
`;

  const response = await genAI.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return response.text;
}

module.exports = { getJournalingResponse };