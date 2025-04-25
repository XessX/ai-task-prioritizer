const OPENAI_ENDPOINT = import.meta.env.VITE_OPENAI_ENDPOINT;
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export const getAIClassification = async (description) => {
  if (!OPENAI_API_KEY) throw new Error('Missing OpenAI Key');
  
  const res = await fetch(OPENAI_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{ role: "system", content: `Classify this task description: ${description}` }],
      temperature: 0.2
    })
  });

  if (!res.ok) {
    throw new Error('No valid AI match');
  }

  const data = await res.json();
  // Custom parsing based on your AI response
  return {
    priority: "medium",
    status: "todo"
  };
};
