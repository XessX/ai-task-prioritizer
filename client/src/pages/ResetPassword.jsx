// src/pages/ResetPassword.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const api = import.meta.env.VITE_API_URL;

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [validToken, setValidToken] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      try {
        setLoading(true);
        const res = await axios.post(`${api}/auth/validate-token`, { token });
        if (res.data?.valid) {
          setValidToken(true);
        } else {
          toast.error('⛔ Invalid or expired reset link.');
          navigate('/');
        }
      } catch (err) {
        toast.error('⛔ Reset link validation failed.');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    validateToken();
  }, [token, navigate]);

  const handleReset = async (e) => {
    e.preventDefault();
    if (!password || !confirm) return toast.error('Please fill out all fields.');
    if (password !== confirm) return toast.error('Passwords do not match.');

    try {
      setLoading(true);
      const res = await axios.post(`${api}/auth/reset-password`, { token, password });
      if (res.data?.message) {
        toast.success('✅ Password reset successful. Please login.');
        navigate('/');
      } else {
        toast.error('❌ Password reset failed.');
      }
    } catch (err) {
      console.error('Reset error:', err);
      toast.error('❌ Reset failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-100 to-white to-purple-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="w-full max-w-sm bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl text-gray-900 dark:text-white">
        <h1 className="text-2xl font-bold mb-4 text-center">🔐 {validToken ? 'Set New Password' : 'Validating token...'}</h1>
        {validToken && (
          <form onSubmit={handleReset} className="space-y-4">
            <input
              type="password"
              placeholder="New password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Confirm new password"
              className="input"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            <button type="submit" disabled={loading} className="button">
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
