// 📄 server/services/aiClassifier.js

import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const classifyTask = async (title, description, startDate, endDate) => {
  const today = new Date();
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;

  const prompt = `
You are a task classification AI.
Analyze:

- Title: "${title || 'N/A'}"
- Description: "${description || 'N/A'}"
- Start Date: "${startDate || 'N/A'}"
- End Date: "${endDate || 'N/A'}"

Rules for Priority:
- If end date is today or tomorrow → "high"
- If end date is within 3 days → "medium"
- If end date is later than 3 days → "low"
- If text mentions ("urgent", "asap", "now", "today", "soon", "tomorrow") → force "high"
- If description includes numbers >= 20 → boost priority one level up

Rules for Status:
- If title or description contains ("completed", "submitted", "done", "finished") → "completed"
- If start date is today or earlier → "in_progress"
- Else → "pending"

Important:
- Output ONLY valid JSON.
- No extra explanation.
Format:
{
  "priority": "low" | "medium" | "high",
  "status": "pending" | "in_progress" | "completed"
}
`;

  try {
    const result = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      timeout: 10000,
    });

    const content = result.choices?.[0]?.message?.content || '';
    const match = content.match(/{[\s\S]*}/);

    if (!match) throw new Error('Invalid AI output');

    const parsed = JSON.parse(match[0]);

    return {
      priority: parsed.priority || 'medium',
      status: parsed.status || 'pending',
    };
  } catch (err) {
    console.error('❌ AI fallback triggered:', err.message);

    // 🧠 Local fallback classification
    let fallbackPriority = 'low';
    let fallbackStatus = 'pending';

    if (end) {
      const daysLeft = Math.floor((end - today) / (1000 * 60 * 60 * 24));
      if (daysLeft <= 1) fallbackPriority = 'high';
      else if (daysLeft <= 3) fallbackPriority = 'medium';
      else fallbackPriority = 'low';
    }

    const text = (title + ' ' + description).toLowerCase();

    // Detect urgency
    const urgencyKeywords = ["urgent", "asap", "now", "today", "soon", "tomorrow"];
    if (urgencyKeywords.some(word => text.includes(word))) {
      fallbackPriority = 'high';
    }

    // Detect numbers >= 20 in description
    const numbers = description?.match(/\d+/g)?.map(Number) || [];
    if (numbers.some(num => num >= 20)) {
      if (fallbackPriority === 'low') fallbackPriority = 'medium';
      else if (fallbackPriority === 'medium') fallbackPriority = 'high';
    }

    // Determine status
    const completedKeywords = ["completed", "submitted", "done", "finished"];
    if (completedKeywords.some(word => text.includes(word))) {
      fallbackStatus = 'completed';
    } else if (start && start <= today) {
      fallbackStatus = 'in_progress';
    } else {
      fallbackStatus = 'pending';
    }

    return { priority: fallbackPriority, status: fallbackStatus };
  }
};
