import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { api, User } from '../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
  initialMode?: 'login' | 'register';
  isDarkMode?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  initialMode = 'login',
  isDarkMode = true,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('student');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      if (mode === 'register') {
        const res = await api.register({
          username,
          email,
          password,
          full_name: fullName,
          role,
        });
        onAuthSuccess(res.user);
        onClose();
      } else {
        const res = await api.login({ username, password });
        onAuthSuccess(res.user);
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-md rounded-2xl border p-8 shadow-2xl transition-all duration-300 ${
          isDarkMode
            ? 'bg-neutral-950/95 border-neutral-800 text-neutral-100 shadow-cyan-500/5'
            : 'bg-white border-neutral-200 text-neutral-900 shadow-xl'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-5 right-5 p-2 rounded-full transition-colors ${
            isDarkMode ? 'hover:bg-neutral-800 text-neutral-400' : 'hover:bg-neutral-100 text-neutral-500'
          }`}
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3 bg-neutral-900 border border-neutral-700 text-white shadow-inner">
            <Sparkles size={22} className="text-cyan-400" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            {mode === 'login' ? 'Sign in to MOSEB LAB' : 'Join MOSEB STUDENT LAB'}
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            {mode === 'login'
              ? 'Access your saved 4D experiments & virtual laboratory notebooks'
              : 'Create your researcher account powered by SQLite & REST API'}
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs text-center">
            {errorMsg}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1 text-neutral-400">Username</label>
            <div className="relative">
              <UserIcon size={16} className="absolute left-3 top-3 text-neutral-500" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. alex_researcher"
                className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border outline-none transition-all ${
                  isDarkMode
                    ? 'bg-neutral-900 border-neutral-800 focus:border-cyan-500 text-white'
                    : 'bg-neutral-50 border-neutral-200 focus:border-blue-500 text-neutral-900'
                }`}
              />
            </div>
          </div>

          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-medium mb-1 text-neutral-400">Full Name</label>
                <div className="relative">
                  <UserIcon size={16} className="absolute left-3 top-3 text-neutral-500" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Alex Johnson"
                    className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border outline-none transition-all ${
                      isDarkMode
                        ? 'bg-neutral-900 border-neutral-800 focus:border-cyan-500 text-white'
                        : 'bg-neutral-50 border-neutral-200 focus:border-blue-500 text-neutral-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1 text-neutral-400">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-3 text-neutral-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@university.edu"
                    className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border outline-none transition-all ${
                      isDarkMode
                        ? 'bg-neutral-900 border-neutral-800 focus:border-cyan-500 text-white'
                        : 'bg-neutral-50 border-neutral-200 focus:border-blue-500 text-neutral-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1 text-neutral-400">Academic Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className={`w-full px-3 py-2 text-sm rounded-lg border outline-none transition-all ${
                    isDarkMode
                      ? 'bg-neutral-900 border-neutral-800 text-white'
                      : 'bg-neutral-50 border-neutral-200 text-neutral-900'
                  }`}
                >
                  <option value="student">Student Researcher</option>
                  <option value="instructor">Academic Instructor / Professor</option>
                  <option value="enthusiast">Science Enthusiast</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-medium mb-1 text-neutral-400">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-3 text-neutral-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border outline-none transition-all ${
                  isDarkMode
                    ? 'bg-neutral-900 border-neutral-800 focus:border-cyan-500 text-white'
                    : 'bg-neutral-50 border-neutral-200 focus:border-blue-500 text-neutral-900'
                }`}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-2.5 px-4 rounded-lg bg-white text-black font-semibold text-sm hover:bg-neutral-200 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-6 text-center text-xs text-neutral-400">
          {mode === 'login' ? (
            <span>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                className="text-cyan-400 font-semibold hover:underline cursor-pointer"
              >
                Sign up free
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-cyan-400 font-semibold hover:underline cursor-pointer"
              >
                Log in
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
