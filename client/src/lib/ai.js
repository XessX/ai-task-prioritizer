// 📄 src/lib/ai.js - FINAL OPTIMIZED VERSION

const API_URL = import.meta.env.VITE_API_URL;

// 🎯 Predict Priority and Status using AI (OpenAI backend)
export const predictPriorityAndStatus = async ({ title, description, startDate, endDate }) => {
  try {
    const response = await fetch(`${API_URL}/ai/classify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, startDate, endDate }),
    });

    if (!response.ok) {
      throw new Error(`AI Classification API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      priority: data.priority || 'medium',
      status: data.status || 'pending',
    };
  } catch (err) {
    console.error('❌ AI Prediction Error:', err.message);
    // Emergency fallback
    return { priority: 'medium', status: 'pending' };
  }
};

// 🔥 Alias for TaskForm (for easier usage)
export const fetchTaskClassification = predictPriorityAndStatus;
