import { useState } from 'react';
import {
  Shield,
  Key,
  Trash2,
  RefreshCcw,
  AlertTriangle,
  History,
  Lock,
  CheckCircle,
  Database,
  Server,
  FileText,
} from 'lucide-react';
import { ActivityLog } from '../../types';
import { clearDemoData, resetToDefaults, getActivityLogs } from '../../services/storageService';
import { authService } from '../../services/authService';
import { useToast } from '../common/Toast';
import { formatDate } from '../../utils/helpers';

interface AdminSettingsTabProps {
  onDataChange: () => void;
}

export function AdminSettingsTab({ onDataChange }: AdminSettingsTabProps) {
  const { showToast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);

  const [confirmModal, setConfirmModal] = useState<'clearDemo' | 'resetDefaults' | null>(null);
  const logs = getActivityLogs();

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      showToast('Please enter your current administrator password.', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New password confirmation does not match.', 'error');
      return;
    }

    setIsChangingPass(true);
    try {
      const res = await authService.changePassword(newPassword);
      if (res.success) {
        showToast('Administrator password updated successfully on server.', 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        showToast(res.message || 'Failed to update administrator password.', 'error');
      }
    } catch {
      showToast('Network error while updating password.', 'error');
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleClearDemoConfirm = () => {
    clearDemoData();
    onDataChange();
    setConfirmModal(null);
    showToast('All sample/demo records have been successfully cleared.', 'success');
  };

  const handleResetDefaultsConfirm = () => {
    resetToDefaults();
    onDataChange();
    setConfirmModal(null);
    showToast('System data reset to baseline seed records.', 'info');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-heading flex items-center gap-2">
          <span>Security & System Settings</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Manage administrator security, purge sample records, and review access audit trails.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Security & Password */}
        <div className="lg:col-span-6 space-y-6">
          {/* Password Form */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-blue-950 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Key className="w-4 h-4 text-amber-600" />
              <span>Change Administrator Password</span>
            </h3>

            <p className="text-xs text-slate-500">
              Update the server-side credentials for the staff & administrator control portal.
            </p>

            <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Current Password *</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current admin password"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-900/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">New Password *</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-900/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Confirm New Password *</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-900/20"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isChangingPass}
                  className="w-full py-2.5 rounded-xl bg-blue-950 hover:bg-blue-900 text-white font-bold text-xs shadow-xs transition-colors"
                >
                  {isChangingPass ? 'Updating Credentials...' : 'Save New Password'}
                </button>
              </div>
            </form>
          </div>

          {/* Database & Data Clean-up */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-blue-950 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Database className="w-4 h-4 text-amber-600" />
              <span>Data Management & Clean-up</span>
            </h3>

            <p className="text-xs text-slate-500">
              Easily clear out development sample records or restore default baseline templates.
            </p>

            <div className="space-y-3 pt-2">
              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-amber-950">Purge Sample / Demo Records</h4>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    Removes all sample demo notices, applications, and enquiries. Real records created by you will remain intact.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setConfirmModal('clearDemo')}
                  className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shrink-0 shadow-xs"
                >
                  Clear Demo Data
                </button>
              </div>

              <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-rose-950">Reset to Seed Defaults</h4>
                  <p className="text-[11px] text-rose-800 mt-0.5">
                    Restores all circulars, staff, and events back to the original baseline seed template.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setConfirmModal('resetDefaults')}
                  className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shrink-0 shadow-xs"
                >
                  Reset Defaults
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: System Status & Audit Trail */}
        <div className="lg:col-span-6 space-y-6">
          {/* Server Architecture Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-blue-950 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Server className="w-4 h-4 text-amber-600" />
              <span>Server & Storage Status</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Backend Server</span>
                <p className="font-bold text-slate-900">Node.js Express (Port 3000)</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Database Storage</span>
                <p className="font-bold text-slate-900">data/database.json</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Admin Auth</span>
                <p className="font-bold text-emerald-700">Token-Protected (Server API)</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Location Ingress</span>
                <p className="font-bold text-slate-900">Kotauratla, Anakapalle</p>
              </div>
            </div>
          </div>

          {/* Activity Audit Trail */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-blue-950 flex items-center gap-2">
                <History className="w-4 h-4 text-amber-600" />
                <span>Administrative Audit Trail</span>
              </h3>
              <span className="text-xs text-slate-400">{logs.length} events logged</span>
            </div>

            {logs.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                No recent administrative actions logged yet.
              </p>
            ) : (
              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5">
                      <p className="font-semibold text-slate-800">{log.action}</p>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                        {log.entityType} • By {log.performedBy || 'Admin'}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0 whitespace-nowrap">
                      {formatDate(log.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Clear Demo Confirmation Modal */}
      {confirmModal === 'clearDemo' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="text-base font-bold text-slate-900">Clear Sample Demo Data</h4>
              <p className="text-xs text-slate-500">
                This will delete all sample demo notices, enquiries, applications, and gallery records tagged as demo. Are you sure?
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setConfirmModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleClearDemoConfirm}
                className="flex-1 py-2.5 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 shadow-xs"
              >
                Clear Demo Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Defaults Confirmation Modal */}
      {confirmModal === 'resetDefaults' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="text-base font-bold text-slate-900">Reset System to Defaults</h4>
              <p className="text-xs text-slate-500">
                This will reset all school information, circulars, staff, and calendar events to baseline templates. All current changes will be overwritten.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setConfirmModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleResetDefaultsConfirm}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 shadow-xs"
              >
                Reset All Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
