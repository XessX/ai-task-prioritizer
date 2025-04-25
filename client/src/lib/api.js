// src/lib/api.js

const BASE_API = import.meta.env.VITE_API_URL;

// ✅ Fetch Tasks
export const fetchTasksAPI = async (guestMode, getHeaders) => {
  try {
    if (guestMode) {
      const guestData = localStorage.getItem('guest_tasks');
      return guestData ? JSON.parse(guestData) : [];
    }

    const headers = getHeaders();
    if (!headers.Authorization) {
      console.warn('No Authorization token found!');
      return []; // Avoid unnecessary request
    }

    const res = await fetch(`${BASE_API}/api/tasks`, { headers }); // ✅ corrected
    if (!res.ok) throw new Error('Unauthorized or server error');
    return await res.json();
  } catch (error) {
    console.error('fetchTasksAPI Error:', error);
    return [];
  }
};

// ✅ Submit Task
export const submitTaskAPI = async ({ form, editId, guestMode, getHeaders, setTasks }) => {
  try {
    if (guestMode) {
      const guest = JSON.parse(localStorage.getItem('guest_tasks') || '[]');
      const updated = editId
        ? guest.map(t => (t.id === editId ? { ...t, ...form } : t))
        : [...guest, { ...form, id: Date.now() }];
      localStorage.setItem('guest_tasks', JSON.stringify(updated));
      setTasks(updated);
      return;
    }

    const url = editId
      ? `${BASE_API}/api/tasks/${editId}`
      : `${BASE_API}/api/tasks`;
    const method = editId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...getHeaders()
      },
      body: JSON.stringify(form)
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Submit task failed');
    }
  } catch (error) {
    console.error('submitTaskAPI Error:', error);
    throw error;
  }
};

// ✅ Delete Task
export const deleteTaskAPI = async (id, guestMode, getHeaders, setTasks) => {
  try {
    if (guestMode) {
      const guest = JSON.parse(localStorage.getItem('guest_tasks') || '[]');
      const updated = guest.filter(t => t.id !== id);
      localStorage.setItem('guest_tasks', JSON.stringify(updated));
      setTasks(updated);
      return;
    }

    const res = await fetch(`${BASE_API}/api/tasks/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to delete task');
    }
  } catch (error) {
    console.error('deleteTaskAPI Error:', error);
    throw error;
  }
};
