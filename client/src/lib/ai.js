// 📄 src/lib/ai.js - FINAL FIXED AUTHORIZED VERSION

const API_URL = import.meta.env.VITE_API_URL;

// 🔥 Get token helper
const getToken = () => {
  return localStorage.getItem('token') || '';
};

// 🎯 Predict Priority and Status using AI
export const predictPriorityAndStatus = async ({ title, description, startDate, endDate }) => {
  try {
    const response = await fetch(`${API_URL}/classify`, { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
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
    return { priority: 'medium', status: 'pending' };
  }
};

// 🔥 Alias
export const fetchTaskClassification = predictPriorityAndStatus;
