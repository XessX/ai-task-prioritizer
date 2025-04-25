const BASE_API = import.meta.env.VITE_API_URL.replace(/\/+$/, ''); // remove trailing slash

export const fetchTasksAPI = async (guestMode, getHeaders) => {
    try {
      if (guestMode) {
        const guestData = localStorage.getItem('guest_tasks');
        return guestData ? JSON.parse(guestData) : [];
      }
  
      const res = await fetch(`${BASE_API}/tasks`, { headers: getHeaders() }); // ✅ no double /api
      if (!res.ok) throw new Error('Unauthorized - no token');
      return await res.json();
    } catch (error) {
      console.error('fetchTasksAPI Error:', error);
      return [];
    }
  };
  
  export const submitTaskAPI = async ({ form, editId, guestMode, getHeaders, setTasks }) => {
    if (guestMode) {
      const guest = JSON.parse(localStorage.getItem('guest_tasks') || '[]');
      const updated = editId
        ? guest.map(t => t.id === editId ? { ...t, ...form } : t)
        : [...guest, { ...form, id: Date.now() }];
      localStorage.setItem('guest_tasks', JSON.stringify(updated));
      setTasks(updated);
      return;
    }
  
    const url = editId ? `${BASE_API}/api/tasks/${editId}` : `${BASE_API}/api/tasks`;
    const method = editId ? 'PUT' : 'POST';
  
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...getHeaders()
      },
      body: JSON.stringify(form)
    });
  
    if (!res.ok) throw new Error('Submit task failed');
  };
  
  export const deleteTaskAPI = async (id, guestMode, getHeaders, setTasks) => {
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
  
    if (!res.ok) throw new Error('Failed to delete task');
  };
  