// server/services/aiClassifier.js
import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const classifyTaskPriority = async (title, description) => {
  try {
    const prompt = `
You are an AI that classifies task priority: high, medium, or low.
Title: ${title}
Description: ${description}
Respond ONLY with one word: high, medium, or low.
`;

    const result = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
    });

    const priority = result.choices[0].message.content.trim().toLowerCase();
    return ['high', 'medium', 'low'].includes(priority) ? priority : 'low';
  } catch (err) {
    console.error('❌ OpenAI error:', err.message);
    return 'low';
  }
};
