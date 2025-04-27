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

Rules:
✅ Priority:
- End Date today or tomorrow → "high"
- Due within 3 days → "medium"
- Later than 3 days → "low"
- If text mentions "tomorrow", "now", urgent", "ASAP", "today", "soon" → force "high"
- If description includes large numbers (>=20) → boost priority by one level

✅ Status:
- If "completed", "submitted", "done" → "completed"
- If start date is today or earlier → "in_progress"
- Else → "pending"

❗ Output ONLY valid clean JSON like:
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
    });

    const content = result.choices?.[0]?.message?.content || '';
    const match = content.match(/{[\s\S]*}/);
    if (!match) throw new Error('Invalid AI JSON output');

    const parsed = JSON.parse(match[0]);
    return {
      priority: parsed.priority || 'medium',
      status: parsed.status || 'pending',
    };
  } catch (err) {
    console.error('❌ AI fallback triggered:', err.message);

    // 🧠 Improved Fallback
    let fallbackPriority = 'low';
    let fallbackStatus = 'pending';

    if (end) {
      const daysLeft = Math.floor((end - today) / (1000 * 60 * 60 * 24));
      if (daysLeft <= 1) fallbackPriority = 'high';
      else if (daysLeft <= 3) fallbackPriority = 'medium';
      else fallbackPriority = 'low';
    }

    const text = (title + ' ' + description).toLowerCase();

    // Urgency keywords
    if (text.includes('urgent') || text.includes('asap') || text.includes('today') || text.includes('soon') || text.includes('tomorrow')) {
      fallbackPriority = 'high';
    }

    // Numbers detected → boost priority
    const numbers = description.match(/\d+/g)?.map(Number) || [];
    const largeNumbers = numbers.filter(num => num >= 20);
    if (largeNumbers.length > 0) {
      if (fallbackPriority === 'low') fallbackPriority = 'medium';
      else if (fallbackPriority === 'medium') fallbackPriority = 'high';
    }

    // Status
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
