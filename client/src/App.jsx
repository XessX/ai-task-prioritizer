// src/App.jsx
import React, { useEffect, useRef, useState } from 'react';
import AuthForm from './components/AuthForm';
import TaskForm from './components/TaskForm';
import TaskBoard from './components/TaskBoard';
import ChartStats from './components/ChartStats';
import TaskFilter from './components/TaskFilter'; // ✅ Correct import
import { Toaster, toast } from 'react-hot-toast';
import { fetchTasksAPI, submitTaskAPI, deleteTaskAPI } from './lib/api';
import { useDarkMode } from './hooks/useDarkMode';
import { useSocket } from './hooks/useSocket';
import { classifyTaskBackend } from './lib/openaiBackend'; // ✅ Use backend classify

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', startDate: '', endDate: '', status: '', priority: '' });
  const [user, setUser] = useState(() => (localStorage.getItem('token') ? {} : null));
  const [guestMode, setGuestMode] = useState(() => localStorage.getItem('guest_mode') === 'true');
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [filters, setFilters] = useState({ priority: '', status: '', sortBy: '' });
  const formRef = useRef(null);

  const { darkMode, toggleDark } = useDarkMode();
  useSocket(setTasks, token);

  const getHeaders = () => {
    const currentToken = localStorage.getItem('token');
    return currentToken && !guestMode ? { Authorization: `Bearer ${currentToken}` } : {};
  };

  const resetFormState = () => {
    setForm({ title: '', description: '', startDate: '', endDate: '', status: '', priority: '' });
    setEditId(null);
  };

  const fetchTasks = async () => {
    try {
      const data = await fetchTasksAPI(guestMode, getHeaders);
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('❌ fetchTasks error:', err);
      toast.error('Failed to load tasks');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description) return toast.error('📝 Please fill all fields');
    try {
      let payload = { ...form };

      if (!form.status || !form.priority) {
        const ai = await classifyTaskBackend(form.title, form.description, form.startDate, form.endDate);
        payload = {
          ...form,
          priority: form.priority || ai.priority,
          status: form.status || ai.status
        };
      }

      await submitTaskAPI({ form: payload, editId, guestMode, getHeaders, setTasks });
      toast.success(editId ? '✅ Task updated' : '✅ Task added');
      resetFormState();
      fetchTasks();
    } catch (err) {
      console.error('❌ Submission failed:', err);
      toast.error('Error saving task');
    }
  };

  const handleDelete = async (id) => {
    const updated = tasks.filter(t => t.id !== id);
    setTasks(updated);
    try {
      await deleteTaskAPI(id, guestMode, getHeaders, setTasks);
      toast.success('🗑️ Task deleted');
      fetchTasks();
    } catch (err) {
      console.error('❌ Delete failed:', err);
      toast.error('Delete failed');
      fetchTasks();
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [token, guestMode]);

  const logout = () => {
    localStorage.clear();
    setToken(null);
    setUser(null);
    setTasks([]);
    setGuestMode(false);
    resetFormState();
  };

  const filteredTasks = tasks
    .filter(t => (filters.priority ? t.priority === filters.priority : true))
    .filter(t => (filters.status ? t.status === filters.status : true))
    .sort((a, b) => {
      if (filters.sortBy === 'start') return new Date(a.startDate) - new Date(b.startDate);
      if (filters.sortBy === 'end') return new Date(a.endDate) - new Date(b.endDate);
      return 0;
    });

  return (
    <>
      <Toaster />
      {!user && !guestMode ? (
        <AuthForm />
      ) : (
        <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-4">
          <div className="max-w-5xl mx-auto space-y-6">
            <header className="flex flex-col md:flex-row justify-between items-center gap-3">
              <h1 className="text-3xl font-bold">🧠 AI Task Prioritizer</h1>
              <div className="flex gap-2 text-sm">
                <button onClick={toggleDark} className="text-indigo-600">{darkMode ? '☀️ Light' : '🌙 Dark'}</button>
                <button onClick={logout} className="text-red-500">Logout</button>
              </div>
            </header>

            <TaskFilter filters={filters} setFilters={setFilters} />

            <div ref={formRef}>
              <TaskForm
                form={form}
                setForm={setForm}
                handleSubmit={handleSubmit}
                editId={editId}
              />
            </div>

            <TaskBoard
              tasks={filteredTasks}
              setTasks={setTasks}
              setForm={(val) => {
                setForm(val);
                formRef.current?.scrollIntoView({ behavior: 'smooth' });
              }}
              setEditId={setEditId}
              handleDelete={handleDelete}
            />

            <ChartStats tasks={tasks} />
          </div>
        </div>
      )}
    </>
  );
};

export default App;
