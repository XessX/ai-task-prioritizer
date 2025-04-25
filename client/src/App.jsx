// src/App.jsx
import React, { useEffect, useRef, useState } from 'react';
import AuthForm from './components/AuthForm';
import TaskForm from './components/TaskForm';
import TaskBoard from './components/TaskBoard';
import ChartStats from './components/ChartStats';
import { Toaster, toast } from 'react-hot-toast';
import { fetchTasksAPI, submitTaskAPI, deleteTaskAPI } from './lib/api';
import { useDarkMode } from './hooks/useDarkMode';
import { useSocket } from './hooks/useSocket';
import { getAIClassification } from './lib/openai';

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    status: '',
    priority: ''
  });

  const [user, setUser] = useState(() => (localStorage.getItem('token') ? {} : null));
  const [guestMode, setGuestMode] = useState(() => localStorage.getItem('guest_mode') === 'true');
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  useSocket(setTasks, token); // 🔄 Real-time sync

  const [authForm, setAuthForm] = useState({ email: '', password: '' });
  const [isLogin, setIsLogin] = useState(true);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const { darkMode, toggleDark } = useDarkMode();
  const formRef = useRef(null);

  const getHeaders = () => {
    const currentToken = localStorage.getItem('token');
    return currentToken && !guestMode ? { Authorization: `Bearer ${currentToken}` } : {};
  };

  const resetFormState = () => {
    setForm({ title: '', description: '', dueDate: '', status: '', priority: '' });
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
      const ai = await getAIClassification(form.description);
      const payload = {
        ...form,
        priority: form.priority || ai.priority,
        status: form.status || ai.status,
        dueDate: form.dueDate || null
      };

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
    setTasks(updated); // Immediate UI update

    try {
      await deleteTaskAPI(id, guestMode, getHeaders, setTasks);
      toast.success('🗑️ Task deleted');
      fetchTasks(); // Optional: ensure sync
    } catch (err) {
      console.error('❌ Delete failed:', err);
      toast.error('Delete failed');
      fetchTasks(); // Fallback to full refresh
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isLogin ? 'login' : 'register';
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm),
      }).then(r => r.json());

      if (res.token) {
        localStorage.setItem('token', res.token);
        setToken(res.token);
        setUser({ email: authForm.email });
        setAuthForm({ email: '', password: '' });
        resetFormState();
        fetchTasks();
      } else {
        toast.success('✅ Registered! Please login.');
        setIsLogin(true);
      }
    } catch (err) {
      toast.error('❌ Auth failed');
    }
  };

  const handlePasswordReset = async () => {
    if (!resetEmail) return toast.error('Please enter your email.');
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail }),
      });
      toast.success(`🔐 Reset link sent to ${resetEmail}`);
      setShowReset(false);
      setResetEmail('');
    } catch {
      toast.error('❌ Failed to send reset link');
    }
  };

  const logout = () => {
    localStorage.clear();
    setToken(null);
    setUser(null);
    setTasks([]);
    setGuestMode(false);
    resetFormState();
  };

  useEffect(() => {
    fetchTasks();
  }, [token, guestMode]);

  return (
    <>
      <Toaster />
      {!user && !guestMode ? (
        <AuthForm
          authForm={authForm}
          setAuthForm={setAuthForm}
          isLogin={isLogin}
          setIsLogin={setIsLogin}
          showReset={showReset}
          setShowReset={setShowReset}
          resetEmail={resetEmail}
          setResetEmail={setResetEmail}
          handleAuthSubmit={handleAuthSubmit}
          handlePasswordReset={handlePasswordReset}
          toggleDark={toggleDark}
          darkMode={darkMode}
          setGuestMode={setGuestMode}
          setUser={setUser}
          resetFormState={resetFormState}
        />
      ) : (
        <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-4">
          <div className="max-w-5xl mx-auto space-y-6">
            <header className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">🧠 AI Task Prioritizer</h1>
              <div className="flex gap-3 items-center text-sm">
                <button onClick={toggleDark} className="text-indigo-600">
                  {darkMode ? '☀️ Light' : '🌙 Dark'}
                </button>
                <button onClick={logout} className="text-red-500">Logout</button>
              </div>
            </header>

            <div ref={formRef}>
              <TaskForm
                form={form}
                setForm={setForm}
                handleSubmit={handleSubmit}
                editId={editId}
              />
            </div>

            <TaskBoard
              tasks={tasks}
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
