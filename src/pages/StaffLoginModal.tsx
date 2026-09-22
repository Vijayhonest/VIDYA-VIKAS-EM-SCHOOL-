import React, { useState } from 'react';
import { Lock, User, ArrowRight, AlertCircle, X, School, Eye, EyeOff, HelpCircle, ShieldCheck } from 'lucide-react';
import { staffService, StaffProfile } from '../services/staffService';

interface StaffLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (staff: StaffProfile) => void;
}

export const StaffLoginModal: React.FC<StaffLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgotHelp, setShowForgotHelp] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please provide your Staff ID and password.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const res = await staffService.login(username.trim(), password.trim());
    setIsLoading(false);

    if (res.success && res.staff) {
      onSuccess(res.staff);
      onClose();
    } else {
      setError(res.error || 'Invalid credentials. Please verify Staff ID and password.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-blue-950/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-blue-950 px-6 py-6 text-white text-center relative border-b border-blue-800">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-blue-300 hover:text-white p-1 rounded-lg hover:bg-blue-800 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-400 text-blue-950 mb-3 shadow-md">
            <School className="w-6 h-6" />
          </div>

          <div className="text-xs uppercase tracking-widest text-amber-300 font-semibold mb-1">
            Faculty & Staff Portal
          </div>
          <h2 className="text-xl font-bold font-serif text-white">Vidya Vikas EM School</h2>
          <p className="text-xs text-blue-200 mt-1">
            Attendance • Marks Entry • Homework • Academic Records
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {showForgotHelp && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
              <div className="font-semibold flex items-center space-x-1.5">
                <HelpCircle className="w-4 h-4 text-amber-600" />
                <span>Faculty Credentials Assistance</span>
              </div>
              <p className="text-amber-800">
                Staff login credentials and password resets are managed directly by the Principal's administrative desk.
              </p>
              <div className="font-medium text-blue-950 pt-1">
                Administrative Office: <a href="tel:9441971531" className="underline font-bold">9441971531</a>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Staff ID / Employee Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your assigned Staff ID"
                autoComplete="username"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowForgotHelp(!showForgotHelp)}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center space-x-2 text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-300 text-blue-900 focus:ring-blue-600"
              />
              <span>Remember this session</span>
            </label>
            <div className="flex items-center space-x-1 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-[11px]">Role Protected</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Staff Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          <div className="pt-2 text-center text-xs text-slate-500">
            Assigned faculty & academic staff only. Kotauratla campus.
          </div>
        </form>
      </div>
    </div>
  );
};
