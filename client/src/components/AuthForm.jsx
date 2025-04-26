// src/components/AuthForm.jsx

import React from 'react';
import { toast } from 'react-hot-toast';

export default function AuthForm({
  authForm,
  setAuthForm,
  isLogin,
  setIsLogin,
  showReset,
  setShowReset,
  resetEmail,
  setResetEmail,
  handleAuthSubmit,
  handlePasswordReset,
  toggleDark,
  darkMode,
  setGuestMode,
  setUser,
  resetFormState
}) {

  const validateAuthFields = () => {
    if (!authForm?.email || !authForm?.password) {
      toast.error('📧 Email and password required');
      return false;
    }
    return true;
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-50 to-purple-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-xl p-8 shadow-lg space-y-6">
        {!showReset ? (
          <>
            <h1 className="text-3xl font-bold text-center text-indigo-700 dark:text-indigo-400">
              {isLogin ? 'Login' : 'Register'}
            </h1>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (validateAuthFields()) handleAuthSubmit(e);
              }}
              className="space-y-4"
            >
              <input
                type="email"
                placeholder="Email"
                className="input w-full"
                value={authForm.email}
                onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                required
              />
              <input
                type="password"
                placeholder="Password"
                className="input w-full"
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                required
              />
              <button type="submit" className="button w-full">
                {isLogin ? 'Login' : 'Register'}
              </button>
            </form>

            <div className="flex flex-col gap-2 text-sm items-center mt-4">
              <button
                className="text-indigo-600 hover:underline"
                onClick={() => setShowReset(true)}
              >
                Forgot Password?
              </button>

              <div>
                {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                <button
                  className="text-indigo-600 hover:underline"
                  onClick={() => setIsLogin(!isLogin)}
                >
                  {isLogin ? 'Register' : 'Login'}
                </button>
              </div>

              <div>
                <button
                  className="text-gray-500 hover:underline"
                  onClick={() => {
                    setGuestMode(true);
                    setUser({});
                    localStorage.setItem('guest_mode', 'true');
                    resetFormState();
                    setResetEmail('');
                  }}
                >
                  Continue as Guest →
                </button>
              </div>

              <div>
                <button
                  onClick={toggleDark}
                  className="text-xs text-gray-500 hover:underline"
                >
                  {darkMode ? '☀️ Switch to Light Mode' : '🌙 Switch to Dark Mode'}
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-semibold text-center text-indigo-700 dark:text-indigo-400">
              🔐 Reset Password
            </h2>

            <input
              className="input w-full"
              placeholder="Enter your email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              required
            />

            <button
              className="button w-full"
              onClick={() => {
                if (!resetEmail) {
                  toast.error('📧 Enter your email');
                } else {
                  handlePasswordReset();
                }
              }}
            >
              Send Reset Link
            </button>

            <p className="text-center text-sm mt-4">
              <button
                className="text-indigo-600 hover:underline"
                onClick={() => {
                  setShowReset(false);
                  setResetEmail('');
                }}
              >
                ← Back to Login
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
