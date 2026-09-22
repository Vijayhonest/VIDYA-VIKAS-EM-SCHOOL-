import { useState } from 'react';
import { Eye, EyeOff, Lock, User, AlertCircle, HelpCircle, GraduationCap, ArrowRight, X } from 'lucide-react';
import { studentService } from '../services/studentService';
import { Student } from '../types';

interface StudentLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (student: Student) => void;
}

export function StudentLoginModal({ isOpen, onClose, onLoginSuccess }: StudentLoginModalProps) {
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgotHelp, setShowForgotHelp] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId.trim() || !password.trim()) {
      setError('Please provide both your Student ID / Admission Number and password.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await studentService.login(studentId.trim(), password.trim());
    setIsLoading(false);

    if (result.success && result.student) {
      onLoginSuccess(result.student);
      onClose();
    } else {
      setError(result.error || 'Invalid credentials. Please check your Student ID and password.');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-blue-950/60 backdrop-blur-sm animate-in fade-in duration-200"
      onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}
      tabIndex={-1}
    >
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-blue-100 overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-900 to-blue-800 text-white p-6 pb-7">
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 p-1.5 rounded-full text-blue-200 hover:text-white hover:bg-blue-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-blue-950 flex items-center justify-center font-bold shadow-md">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif tracking-tight">Student Portal</h2>
              <p className="text-xs text-blue-200">Vidya Vikas EM School, Kotauratla</p>
            </div>
          </div>
          <p className="text-xs text-blue-100/90 mt-2">
            Sign in with your Student ID or Admission Number to access your classes, homework, attendance, timetable, and exam results.
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {showForgotHelp && (
            <div className="mb-4 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
              <div className="font-semibold mb-1 flex items-center space-x-1.5">
                <HelpCircle className="w-4 h-4 text-amber-600" />
                <span>Password Recovery Assistance</span>
              </div>
              <p className="text-amber-800">
                Please contact the school administrative desk or class teacher with your Student ID:
              </p>
              <div className="mt-2 font-medium text-blue-900">
                School Helpline: <a href="tel:9441971531" className="underline font-bold">9441971531</a>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotHelp(false)}
                className="mt-2 text-xs text-amber-700 underline hover:text-amber-900 font-semibold"
              >
                Dismiss
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Student ID / Admission No.
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="Enter Student ID or Admission Number"
                  autoComplete="username"
                  required
                  className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
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
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
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
                <span>Remember me</span>
              </label>
              <span className="text-[11px] text-slate-400">Student Access</span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 bg-blue-900 hover:bg-blue-800 active:bg-blue-950 text-white font-semibold rounded-xl shadow-md shadow-blue-900/10 flex items-center justify-center space-x-2 transition disabled:opacity-70 cursor-pointer"
            >
              {isLoading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In to Student Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
            For login assistance, contact the school administrative office at <a href="tel:9441971531" className="text-blue-900 font-semibold underline">9441971531</a>.
          </div>
        </div>
      </div>
    </div>
  );
}
