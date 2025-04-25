// server/services/aiClassifier.js

import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Classify a task using AI into priority and status based on title, description, and dates
 * @param {string} title 
 * @param {string} description 
 * @param {string|null} startDate 
 * @param {string|null} endDate 
 * @returns {Promise<{ priority: string, status: string }>}
 */
export const classifyTask = async (title, description, startDate, endDate) => {
  const prompt = `
You are an AI assistant for task management.

Given:
- Title: ${title || 'N/A'}
- Description: ${description || 'N/A'}
- Start Date: ${startDate || 'N/A'}
- End Date: ${endDate || 'N/A'}

👉 Analyze them and ONLY respond with JSON like:
{
  "priority": "low" | "medium" | "high",
  "status": "pending" | "in_progress" | "completed"
}

Guidelines:
- If the deadline (endDate) is very close or today → priority is "high".
- If the task is scheduled for the future → status can be "pending".
- If the task looks like it's ongoing → status "in_progress".
- If the task sounds done (e.g., "completed", "submitted") → status "completed".
- If the task is short term urgent → high priority.

Only return pure JSON without any extra text.
`;

  try {
    const result = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
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
