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
    if (!authForm.email || !authForm.password) {
      toast.error('📧 Email and password required');
      return false;
    }
    return true;
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-50 to-purple-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="w-full max-w-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-xl p-8 shadow-lg space-y-4 text-base md:text-lg">
        {!showReset ? (
          <>
            <h1 className="text-3xl font-bold text-center text-indigo-700 dark:text-indigo-400">
              {isLogin ? 'Login' : 'Register'}
            </h1>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (validateAuthFields()) handleAuthSubmit(e);
            }} className="space-y-3">
              <input
                type="email"
                placeholder="Email"
                className="input"
                value={authForm.email}
                onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
              />
              <input
                type="password"
                placeholder="Password"
                className="input"
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
              />
              <button className="button">{isLogin ? 'Login' : 'Register'}</button>
            </form>
            <div className="text-sm text-center space-y-2">
              <button className="text-indigo-600 hover:underline" onClick={() => setShowReset(true)}>Forgot Password?</button>
              <div>
                {isLogin ? 'No account?' : 'Have an account?'}{' '}
                <button className="text-indigo-600 hover:underline" onClick={() => setIsLogin(!isLogin)}>
                  {isLogin ? 'Register' : 'Login'}
                </button>
              </div>
              <div>
                <button className="text-gray-500 hover:underline" onClick={() => {
                  setGuestMode(true);
                  setUser({});
                  localStorage.setItem('guest_mode', 'true');
                  resetFormState();
                  setResetEmail('');
                }}>Continue as guest →</button>
              </div>
              <div>
                <button onClick={toggleDark} className="text-xs text-gray-500 hover:underline">
                  {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-xl font-semibold text-center text-indigo-700">🔐 Reset Password</h2>
            <input
              className="input"
              placeholder="Enter your email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
            />
            <button
              className="button"
              onClick={() => {
                if (!resetEmail) return toast.error('📧 Enter your email');
                handlePasswordReset();
              }}>
              Send Reset Link
            </button>
            <p className="text-center text-sm mt-3">
              <button className="text-indigo-600 hover:underline" onClick={() => { setShowReset(false); setResetEmail(''); }}>← Back to login</button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
