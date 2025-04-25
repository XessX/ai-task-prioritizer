// src/pages/ResetPassword.jsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const api = import.meta.env.VITE_API_URL;

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    if (!password || !confirm) return alert('Please fill out all fields.');
    if (password !== confirm) return alert('Passwords do not match.');
    try {
      setLoading(true);
      await axios.post(`${api}/auth/reset-password`, { token, password });
      alert('✅ Password reset successful.');
      navigate('/');
    } catch {
      alert('❌ Reset failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-100 to-white to-purple-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="w-full max-w-sm bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl text-gray-900 dark:text-white">
        <h1 className="text-2xl font-bold mb-4 text-center">🔐 Reset Password</h1>
        <form onSubmit={handleReset} className="space-y-4">
          <input type="password" placeholder="New password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
          <input type="password" placeholder="Confirm new password" className="input" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          <button type="submit" disabled={loading} className="button">{loading ? 'Resetting...' : 'Reset Password'}</button>
        </form>
      </div>
    </div>
  );
}
