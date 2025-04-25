// ✅ Fixed and Improved getAIClassification with AI JSON parsing

const OPENAI_ENDPOINT = import.meta.env.VITE_OPENAI_ENDPOINT;
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export const getAIClassification = async (title, description, startDate, endDate) => {
    if (!OPENAI_API_KEY) throw new Error('Missing OpenAI Key');
  
    const prompt = `
  Analyze the task and return:
  {
    "priority": "low" | "medium" | "high",
    "status": "pending" | "in_progress" | "completed"
  }
  Title: ${title}
  Description: ${description}
  Start: ${startDate || 'N/A'}
  End: ${endDate || 'N/A'}
  `;
  
    const res = await fetch(OPENAI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
      }),
    });
  
    if (!res.ok) throw new Error('Failed to classify AI task');
  
    const data = await res.json();
    const raw = data.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(raw.match(/{[\s\S]*}/)?.[0] || '{}');
  
    return {
      priority: parsed.priority || 'medium',
      status: parsed.status || 'pending',
    };
  };
  