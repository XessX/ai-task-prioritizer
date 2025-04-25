// services/aiClassifier.js
import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const classifyTask = async (title, description) => {
  const prompt = `
Classify this task and return JSON only:
Title: ${title}
Description: ${description}
Return:
{
  "priority": "low" | "medium" | "high",
  "status": "pending" | "in_progress" | "completed"
}
`;

  try {
    const result = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });

    const match = result.choices[0]?.message?.content.match(/{[\s\S]*}/);
    const json = match ? JSON.parse(match[0]) : {};

    return {
      priority: json.priority || 'medium',
      status: json.status || 'pending',
    };
  } catch (err) {
    console.error('❌ AI Classifier failed:', err.message);
    return { priority: 'medium', status: 'pending' };
  }
};
