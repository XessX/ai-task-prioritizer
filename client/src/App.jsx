import React, { useState, useEffect } from 'react';
import axios from 'axios';

const api = import.meta.env.VITE_API_URL;

function App() {
  const [user, setUser] = useState(null);
  const [authForm, setAuthForm] = useState({ email: '', password: '' });
  const [isLogin, setIsLogin] = useState(true);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({ title: '', description: '' });
  const [editId, setEditId] = useState(null);
  const [guestMode, setGuestMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');

  const getHeaders = () =>
    token && !guestMode ? { Authorization: `Bearer ${token}` } : {};

  const fetchTasks = async () => {
    if (guestMode) {
      const local = JSON.parse(localStorage.getItem('guest_tasks')) || [];
      setTasks(Array.isArray(local) ? local : []);
    } else {
      try {
        const res = await axios.get(`${api}/tasks`, { headers: getHeaders() });
        const data = res.data;
  
        // Ensure data is an array
        setTasks(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('❌ Failed to fetch tasks:', error.message);
        setTasks([]); // fallback to empty
      }
    }
  };
  

  const saveGuestTasks = (tasksToSave) => {
    localStorage.setItem('guest_tasks', JSON.stringify(tasksToSave));
    setTasks(tasksToSave);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description) return;

    setLoading(true);

    if (guestMode) {
      const local = JSON.parse(localStorage.getItem('guest_tasks')) || [];
      const updated = editId
        ? local.map((task) =>
            task.id === editId ? { ...task, ...form } : task
          )
        : [...local, { id: Date.now(), ...form, priority: 'pending' }];
      saveGuestTasks(updated);
      setEditId(null);
      setForm({ title: '', description: '' });
      setLoading(false);
      return;
    }

    try {
      if (editId) {
        await axios.put(`${api}/tasks/${editId}`, form, {
          headers: getHeaders(),
        });
        setEditId(null);
      } else {
        await axios.post(`${api}/tasks`, form, {
          headers: getHeaders(),
        });
      }

      setForm({ title: '', description: '' });
      fetchTasks();
    } catch (error) {
      alert('❌ Error creating/updating task');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (guestMode) {
      const updated = tasks.filter((task) => task.id !== id);
      saveGuestTasks(updated);
      return;
    }

    try {
      await axios.delete(`${api}/tasks/${id}`, {
        headers: getHeaders(),
      });
      fetchTasks();
    } catch (error) {
      alert('❌ Error deleting task');
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isLogin ? 'login' : 'register';
      const res = await axios.post(`${api}/auth/${endpoint}`, authForm);
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        setUser({ email: authForm.email });
        setAuthForm({ email: '', password: '' });
        fetchTasks();
      } else {
        alert('✅ Registered! You can now log in.');
        setIsLogin(true);
      }
    } catch (err) {
      alert('❌ Auth failed');
    }
  };

  const handlePasswordReset = async () => {
    if (!resetEmail) return alert('Please enter your email.');
    try {
      await axios.post(`${api}/auth/forgot-password`, { email: resetEmail });
      alert(`🔐 Reset link sent to ${resetEmail}`);
      setShowReset(false);
    } catch {
      alert('❌ Failed to send reset link');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setTasks([]);
  };

useEffect(() => {
  if ((token && !guestMode) || guestMode) {
    fetchTasks();
  }
}, [guestMode]);


  // ---------------- AUTH UI ----------------
  if (!user && !guestMode) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-100 via-white to-purple-100 px-4">
        <div className="w-full max-w-sm bg-white rounded-lg shadow-xl p-6">
          {!showReset ? (
            <>
              <h1 className="text-2xl font-bold mb-4 text-center">
                {isLogin ? 'Login' : 'Register'}
              </h1>
              <form onSubmit={handleAuthSubmit} className="space-y-4">
                <input
                  className="w-full p-2 border rounded"
                  placeholder="Email"
                  type="email"
                  value={authForm.email}
                  onChange={(e) =>
                    setAuthForm({ ...authForm, email: e.target.value })
                  }
                />
                <input
                  className="w-full p-2 border rounded"
                  placeholder="Password"
                  type="password"
                  value={authForm.password}
                  onChange={(e) =>
                    setAuthForm({ ...authForm, password: e.target.value })
                  }
                />
                <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
                  {isLogin ? 'Login' : 'Register'}
                </button>
              </form>

              <div className="text-sm text-center mt-4">
                <button
                  className="text-blue-600 hover:underline block mb-2"
                  onClick={() => setShowReset(true)}
                >
                  Forgot Password?
                </button>
                <p>
                  {isLogin ? 'No account?' : 'Have an account?'}{' '}
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={() => setIsLogin(!isLogin)}
                  >
                    {isLogin ? 'Register here' : 'Login here'}
                  </button>
                </p>
                <p className="mt-3">
                  <button
                    onClick={() => setGuestMode(true)}
                    className="text-gray-600 underline text-sm"
                  >
                    Or continue as guest →
                  </button>
                </p>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-center mb-4">
                🔐 Reset Password
              </h2>
              <input
                className="w-full p-2 border rounded mb-3"
                placeholder="Enter your email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
              />
              <button
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                onClick={handlePasswordReset}
              >
                Send Reset Link
              </button>
              <p className="text-center mt-4">
                <button
                  className="text-sm text-blue-600 hover:underline"
                  onClick={() => setShowReset(false)}
                >
                  ← Back to login
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  // ---------------- MAIN UI ----------------
  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-white to-blue-50 px-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            🧠 AI Task Prioritizer
          </h1>
          <div>
            {!guestMode ? (
              <button onClick={logout} className="text-red-600 hover:underline">
                Logout
              </button>
            ) : (
              <button
                onClick={() => {
                  setGuestMode(false);
                  setTasks([]);
                }}
                className="text-blue-600 hover:underline"
              >
                Login
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <input
            className="w-full p-3 border rounded"
            placeholder="Task title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <textarea
            className="w-full p-3 border rounded"
            placeholder="Task description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <button
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            disabled={loading}
          >
            {loading ? 'Analyzing...' : editId ? 'Update Task' : 'Add Task'}
          </button>
        </form>

        <div className="space-y-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`p-4 rounded border shadow flex justify-between items-start ${
                task.priority === 'high'
                  ? 'border-red-500'
                  : task.priority === 'medium'
                  ? 'border-yellow-500'
                  : 'border-green-500'
              }`}
            >
              <div>
                <h2 className="font-semibold">{task.title}</h2>
                <p>{task.description}</p>
                <p className="text-sm italic text-gray-600">
                  Priority: {task.priority}
                </p>
              </div>
              <div className="flex flex-col items-center ml-4 space-y-1">
                <button
                  onClick={() => {
                    setForm({ title: task.title, description: task.description });
                    setEditId(task.id);
                  }}
                  className="text-blue-600 font-bold"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(task.id)}
                  className="text-red-600 font-bold"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
