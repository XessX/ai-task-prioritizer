export const classifyTaskBackend = async (title, description, startDate, endDate) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/classify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({ title, description, startDate, endDate })
  });

  if (!res.ok) throw new Error('Failed to classify task from backend');

  const data = await res.json();
  return {
    priority: data.priority || 'medium',
    status: data.status || 'pending'
  };
};
