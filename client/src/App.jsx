import React, { useEffect, useRef, useState } from 'react';
import AuthForm from './components/AuthForm';
import TaskForm from './components/TaskForm';
import TaskBoard from './components/TaskBoard';
import ChartStats from './components/ChartStats';
import TaskFilter from './components/TaskFilter';
import { Toaster, toast } from 'react-hot-toast';
import { fetchTasksAPI, submitTaskAPI, deleteTaskAPI } from './lib/api';
import { predictPriorityAndStatus } from './lib/ai';
import { useDarkMode } from './hooks/useDarkMode';
import { useSocket } from './hooks/useSocket';

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', startDate: '', endDate: '', status: '', priority: '' });
  const [user, setUser] = useState(() => (localStorage.getItem('token') ? {} : null));
  const [guestMode, setGuestMode] = useState(() => localStorage.getItem('guest_mode') === 'true');
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [authForm, setAuthForm] = useState({ email: '', password: '' });
  const [isLogin, setIsLogin] = useState(true);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [filters, setFilters] = useState({ priority: '', status: '', sortBy: '' });
  const [loadingSubmit, setLoadingSubmit] = useState(false); // ✅ Add spinner control

  const formRef = useRef(null);
  const { darkMode, toggleDark } = useDarkMode();
  useSocket(setTasks, token, guestMode);

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

  useEffect(() => {
    if (token || guestMode) fetchTasks();
  }, [token, guestMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description) return toast.error('📝 Please fill all fields');

    setLoadingSubmit(true);

    let payload = { ...form };

    try {
      // Always predict fresh (better than checking if priority or status exist)
      const aiResult = await predictPriorityAndStatus({
        title: payload.title,
        description: payload.description,
        startDate: payload.startDate,
        endDate: payload.endDate
      });

      payload.priority = aiResult.priority;
      payload.status = aiResult.status;

      toast.success(`✨ AI Priority: ${aiResult.priority}`);
      toast.success(`✨ AI Status: ${aiResult.status}`);
    } catch (err) {
      console.error('AI fallback:', err.message);
      payload.priority = 'medium';
      payload.status = 'pending';
    }

    if (guestMode) {
      const guestTasks = JSON.parse(localStorage.getItem('guest_tasks') || '[]');
      let updated;

      if (editId) {
        updated = guestTasks.map(task => task.id === editId ? { ...task, ...payload } : task);
        toast.success('✅ Task updated');
      } else {
        const newTask = {
          ...payload,
          id: Date.now().toString(),
          startDate: payload.startDate || new Date().toISOString(),
          endDate: payload.endDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString()
        };
        updated = [...guestTasks, newTask];
        toast.success('🎯 New task added!');
      }

      localStorage.setItem('guest_tasks', JSON.stringify(updated));
      setTasks(updated);
    } else {
      try {
        await submitTaskAPI({ form: payload, editId, guestMode, getHeaders, setTasks });
        toast.success(editId ? '✅ Task updated' : '🎯 New task added!');
        fetchTasks();
      } catch (err) {
        console.error('❌ API submit failed:', err);
        toast.error('API Submit Failed');
      }
    }
    resetFormState();
    setLoadingSubmit(false);
  };

  const handleDelete = async (id) => {
    try {
      if (guestMode) {
        const guestTasks = JSON.parse(localStorage.getItem('guest_tasks')) || [];
        const updated = guestTasks.filter(task => task.id !== id);
        localStorage.setItem('guest_tasks', JSON.stringify(updated));
        setTasks(updated);
        toast.success('🗑️ Task deleted');
      } else {
        await deleteTaskAPI(id, guestMode, getHeaders, setTasks);
        toast.success('🗑️ Task deleted');
        fetchTasks();
      }
    } catch (err) {
      console.error('❌ Delete failed:', err);
      toast.error('Delete failed');
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (!authForm.email || !authForm.password) return toast.error('📧 Email and password required');
    try {
      const endpoint = isLogin ? 'login' : 'register';
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm)
      }).then(r => r.json());

      if (res.token) {
        localStorage.setItem('token', res.token);
        localStorage.removeItem('guest_mode');
        setToken(res.token);
        setUser({ email: authForm.email });
        setGuestMode(false);
        setAuthForm({ email: '', password: '' });
        resetFormState();
        fetchTasks();
        toast.success('✅ Login successful');
      } else if (res.message) {
        toast.success(res.message);
        setIsLogin(true);
      } else if (res.error) {
        toast.error(res.error);
      } else {
        toast.error('❌ Unexpected auth error');
      }
    } catch (err) {
      console.error('❌ Auth error:', err);
      toast.error('Authentication failed');
    }
  };

  const handlePasswordReset = async () => {
    if (!resetEmail) return toast.error('📧 Enter your email.');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, {
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
    window.location.reload();
  };

  const filteredTasks = tasks
    .filter(t => (filters.priority ? t.priority === filters.priority : true))
    .filter(t => (filters.status ? t.status === filters.status : true))
    .sort((a, b) => {
      if (filters.sortBy === 'start') return new Date(a.startDate) - new Date(b.startDate);
      if (filters.sortBy === 'end') return new Date(a.endDate) - new Date(b.endDate);
      return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
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
          setUser={setUser}
          setGuestMode={(val) => {
            setGuestMode(val);
            if (val) {
              if (!localStorage.getItem('guest_tasks')) {
                localStorage.setItem('guest_tasks', '[]');
              }
              localStorage.setItem('guest_mode', 'true');
              toast.success('✨ Welcome Guest Mode!');
            }
          }}
          resetFormState={resetFormState}
          handleAuthSubmit={handleAuthSubmit}
          handlePasswordReset={handlePasswordReset}
          toggleDark={toggleDark}
          darkMode={darkMode}
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
                loading={loadingSubmit} // Pass loading to form
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
