// 📄 server/services/aiClassifier.js

import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const classifyTask = async (title, description, startDate, endDate) => {
  const prompt = `
You are an AI assistant helping to classify tasks intelligently.

Analyze:
- Title: ${title || 'N/A'}
- Description: ${description || 'N/A'}
- Start Date: ${startDate || 'N/A'}
- End Date: ${endDate || 'N/A'}

👉 Output ONLY a JSON like:
{
  "priority": "low" | "medium" | "high",
  "status": "pending" | "in_progress" | "completed"
}

Rules:
- If endDate is today or tomorrow → "high"
- If due within 3 days → "medium"
- If description says "urgent", "ASAP", "1 day", "next week" → "high"
- Else → "low"
- StartDate after today → "pending"
- Ongoing → "in_progress"
- Title/Description contains "completed", "submitted", "done" → "completed"

⚠️ Only clean JSON output!
`;

  try {
    const result = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      timeout: 10000,
    });

    const match = result.choices[0]?.message?.content.match(/{[\s\S]*}/);
    const json = match ? JSON.parse(match[0]) : {};

    return {
      priority: json.priority || 'medium',
      status: json.status || 'pending',
    };
  } catch (err) {
    console.error('❌ AI Classifier fallback triggered:', err.message);

    const today = new Date();
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    let fallbackPriority = 'medium';
    let fallbackStatus = 'pending';

    if (end) {
      const daysLeft = (end - today) / (1000 * 60 * 60 * 24);
      if (daysLeft <= 1) fallbackPriority = 'high';
      else if (daysLeft <= 3) fallbackPriority = 'medium';
      else fallbackPriority = 'low';
    }

    const text = (title + ' ' + description).toLowerCase();
    if (text.includes('urgent') || text.includes('asap') || text.includes('1 day') || text.includes('next week')) {
      fallbackPriority = 'high';
    }

    if (text.includes('completed') || text.includes('submitted') || text.includes('done')) {
      fallbackStatus = 'completed';
    } else if (start && start <= today) {
      fallbackStatus = 'in_progress';
    } else {
      fallbackStatus = 'pending';
    }

    return { priority: fallbackPriority, status: fallbackStatus };
  }
};
