// server/services/aiClassifier.js

import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const classifyTaskPriority = async (title, description) => {
  try {
    const prompt = `
You are an AI assistant that classifies task priority as high, medium, or low.
Title: ${title}
Description: ${description}
Reply ONLY with one of: high, medium, low.
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
    });

    const reply = completion.choices[0].message.content.trim().toLowerCase();
    return ['high', 'medium', 'low'].includes(reply) ? reply : 'low';
  } catch (err) {
    console.error('❌ OpenAI error:', err.message);
    return 'low'; // fallback if error
  }
};
