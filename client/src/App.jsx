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
import TaskFilter from './components/TaskFilter';

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', startDate: '', endDate: '', status: '', priority: '' });
  const [user, setUser] = useState(() => (localStorage.getItem('token') ? {} : null));
  const [guestMode, setGuestMode] = useState(() => localStorage.getItem('guest_mode') === 'true');
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [filters, setFilters] = useState({ priority: '', status: '', sortBy: '' });

  useSocket(setTasks, token);
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
      const ai = await getAIClassification(form.title, form.description, form.startDate, form.endDate);
      const payload = {
        ...form,
        priority: form.priority || ai.priority,
        status: form.status || ai.status,
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
        toast.success('✅ Login successful');
      } else if (res.message) {
        toast.success(res.message);
        if (!isLogin) setIsLogin(true);
      } else if (res.error) {
        toast.error(res.error);
      } else {
        toast.error('❌ Unknown auth response');
      }
    } catch (err) {
      console.error('❌ Auth error:', err);
      toast.error('❌ Auth failed');
    }
  };

  const handlePasswordReset = async () => {
    if (!resetEmail) return toast.error('Please enter your email.');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail }),
      }).then(r => r.json());
      if (res.error) return toast.error(res.error);
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
