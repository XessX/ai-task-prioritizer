export const getAIClassification = async (description) => {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{
            role: "user",
            content: `Task: "${description}".\n\nReturn a JSON like:\n{\n  "priority": "low|medium|high",\n  "status": "pending|in_progress|completed"\n}`
          }]
        })
      });
  
      const data = await res.json();
      const match = data?.choices?.[0]?.message?.content?.match(/{[^}]+}/);
      if (!match) throw new Error('No valid AI match');
      return JSON.parse(match[0]);
    } catch (err) {
      console.error("AI classification failed:", err);
      return { priority: "medium", status: "pending" };
    }
  };
  