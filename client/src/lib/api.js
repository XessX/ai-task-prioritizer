const BASE_API = import.meta.env.VITE_API_URL;
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_ENDPOINT = import.meta.env.VITE_OPENAI_ENDPOINT;

// Helper
const getToken = () => localStorage.getItem('token');

// 🔥 Fetch Tasks
export const fetchTasksAPI = async (guestMode, getHeaders) => {
  try {
    if (guestMode) {
      const guestData = localStorage.getItem('guest_tasks');
      return guestData ? JSON.parse(guestData) : [];
    }
    const headers = getHeaders();
    if (!headers.Authorization) {
      console.warn('No Authorization token found!');
      return [];
    }
    const res = await fetch(`${BASE_API}/tasks`, { headers });
    if (!res.ok) throw new Error('Unauthorized or server error');
    return await res.json();
  } catch (error) {
    console.error('fetchTasksAPI Error:', error);
    return [];
  }
};

// 🔥 Submit (Create or Update) Task
export const submitTaskAPI = async ({ form, editId, guestMode, getHeaders, setTasks }) => {
  if (guestMode) {
    const guest = JSON.parse(localStorage.getItem('guest_tasks') || '[]');
    let updated;
    if (editId) {
      updated = guest.map(task => task.id === editId ? { ...task, ...form } : task);
    } else {
      const newTask = {
        ...form,
        id: Date.now().toString(),
        status: form.status || 'pending',
        priority: form.priority || 'medium',
        startDate: form.startDate || new Date().toISOString(),
        endDate: form.endDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString()
      };
      updated = [...guest, newTask];
    }
    localStorage.setItem('guest_tasks', JSON.stringify(updated));
    setTasks(updated);
    return;
  }

  const headers = {
    'Content-Type': 'application/json',
    ...getHeaders()
  };
  const url = editId ? `${BASE_API}/tasks/${editId}` : `${BASE_API}/tasks`;
  const res = await fetch(url, {
    method: editId ? 'PUT' : 'POST',
    headers,
    body: JSON.stringify(form)
  });
  if (!res.ok) throw new Error('Submit task failed');
};

// 🔥 Delete Task
export const deleteTaskAPI = async (id, guestMode, getHeaders, setTasks) => {
  if (guestMode) {
    const guest = JSON.parse(localStorage.getItem('guest_tasks') || '[]');
    const updated = guest.filter(task => task.id !== id);
    localStorage.setItem('guest_tasks', JSON.stringify(updated));
    setTasks(updated);
    return;
  }

  const headers = getHeaders();
  const res = await fetch(`${BASE_API}/tasks/${id}`, {
    method: 'DELETE',
    headers
  });
  if (!res.ok) throw new Error('Failed to delete task');
};

// 🔥 Mark Task as Completed
export const markTaskCompletedAPI = async (id, guestMode, getHeaders, setTasks, autoRemove = true) => {
  if (guestMode) {
    const guestTasks = JSON.parse(localStorage.getItem('guest_tasks') || '[]');
    let updated = guestTasks.map(task => task.id === id ? { ...task, status: 'completed' } : task);
    localStorage.setItem('guest_tasks', JSON.stringify(updated));
    setTasks(updated);

    if (autoRemove) {
      setTimeout(() => {
        updated = updated.filter(task => task.id !== id);
        localStorage.setItem('guest_tasks', JSON.stringify(updated));
        setTasks(updated);
      }, 3000);
    }
    return;
  }

  const headers = {
    'Content-Type': 'application/json',
    ...getHeaders()
  };

  const res = await fetch(`${BASE_API}/tasks/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ status: 'completed' })
  });
  if (!res.ok) throw new Error('Failed to mark task completed');

  if (autoRemove) {
    setTimeout(async () => {
      const fetchRes = await fetch(`${BASE_API}/tasks/${id}`, {
        method: 'DELETE',
        headers
      });
      if (!fetchRes.ok) console.warn('Auto-delete failed');
      const freshTasks = await fetchTasksAPI(false, getHeaders);
      setTasks(freshTasks);
    }, 3000);
  }
};

// ✅ NEW 🔥 Mark Task as In Progress (you missed this!)
export const markTaskInProgressAPI = async (id, guestMode, getHeaders, setTasks) => {
  if (guestMode) {
    const guestTasks = JSON.parse(localStorage.getItem('guest_tasks') || '[]');
    const updated = guestTasks.map(task => task.id === id ? { ...task, status: 'in_progress' } : task);
    localStorage.setItem('guest_tasks', JSON.stringify(updated));
    setTasks(updated);
    return;
  }

  const headers = {
    'Content-Type': 'application/json',
    ...getHeaders()
  };

  const res = await fetch(`${BASE_API}/tasks/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ status: 'in_progress' })
  });
  if (!res.ok) throw new Error('Failed to move task to in progress');
};

// 🧠✨ Ask OpenAI to prioritize
export const askOpenAIToPrioritizeTask = async (title, description, startDate, endDate) => {
  try {
    const prompt = `
You are an expert task prioritizer.
Analyze:
- Title: "${title}"
- Description: "${description}"
- Start Date: "${startDate || 'Not set'}"
- End Date: "${endDate || 'Not set'}"
Return clean JSON:
{
  "priority": "low" | "medium" | "high",
  "status": "pending" | "in_progress" | "completed"
}
`;
    const res = await fetch(OPENAI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2
      })
    });

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content;

    if (text) {
      const parsed = JSON.parse(text);
      return parsed;
    } else {
      throw new Error('No response from OpenAI');
    }
  } catch (error) {
    console.error('AI prioritization error:', error);
    return null;
  }
};
