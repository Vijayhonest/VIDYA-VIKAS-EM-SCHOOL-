import { useState } from 'react';
import {
  Search,
  FileCheck,
  Trash2,
  Eye,
  Phone,
  Mail,
  Clock,
  AlertTriangle,
  X,
  CheckCircle2,
  Download,
  Printer,
} from 'lucide-react';
import { AdmissionEnquiry, AdmissionStatus } from '../../types';
import { formatDate } from '../../utils/helpers';
import { updateAdmissionStatus, deleteAdmissionEnquiry } from '../../services/storageService';
import { useToast } from '../common/Toast';

interface AdminAdmissionsTabProps {
  admissions: AdmissionEnquiry[];
  onDataChange: () => void;
}

export function AdminAdmissionsTab({ admissions, onDataChange }: AdminAdmissionsTabProps) {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedAdmission, setSelectedAdmission] = useState<AdmissionEnquiry | null>(null);
  const [counselorNotes, setCounselorNotes] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const filtered = admissions.filter((adm) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      adm.studentName.toLowerCase().includes(q) ||
      adm.applicationNo.toLowerCase().includes(q) ||
      adm.parentName.toLowerCase().includes(q) ||
      adm.phone.includes(q) ||
      (adm.gradeApplying && adm.gradeApplying.toLowerCase().includes(q));

    if (!matchesSearch) return false;
    if (statusFilter === 'all') return true;
    return adm.status === statusFilter;
  });

  const handleOpenDetail = (adm: AdmissionEnquiry) => {
    setSelectedAdmission(adm);
    setCounselorNotes(adm.notes || '');
  };

  const handleStatusChange = async (id: string, newStatus: AdmissionStatus) => {
    setIsUpdating(true);
    try {
      updateAdmissionStatus(id, newStatus);
      onDataChange();
      if (selectedAdmission && selectedAdmission.id === id) {
        setSelectedAdmission({ ...selectedAdmission, status: newStatus });
      }
      showToast(`Admission application marked as "${newStatus}".`, 'success');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveNotes = () => {
    if (!selectedAdmission) return;
    setIsUpdating(true);
    try {
      updateAdmissionStatus(selectedAdmission.id, selectedAdmission.status, counselorNotes);
      onDataChange();
      setSelectedAdmission({ ...selectedAdmission, notes: counselorNotes });
      showToast('Counselor notes saved successfully.', 'success');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleExportCSV = () => {
    if (filtered.length === 0) {
      showToast('No applications to export.', 'info');
      return;
    }
    const headers = [
      'Application No',
      'Student Name',
      'Grade Applying',
      'Parent / Guardian',
      'Phone Number',
      'Email',
      'DOB',
      'Gender',
      'Previous School',
      'Residential Address',
      'Status',
      'Submission Date',
      'Counselor Notes',
    ];
    const rows = filtered.map((a) => [
      `"${a.applicationNo || a.id}"`,
      `"${(a.studentName || '').replace(/"/g, '""')}"`,
      `"${a.gradeApplying || ''}"`,
      `"${(a.parentName || '').replace(/"/g, '""')}"`,
      `"${a.phone}"`,
      `"${a.email || ''}"`,
      `"${a.dob || ''}"`,
      `"${a.gender || ''}"`,
      `"${(a.previousSchool || '').replace(/"/g, '""')}"`,
      `"${(a.address || '').replace(/"/g, '""')}"`,
      `"${a.status}"`,
      `"${a.submittedAt}"`,
      `"${(a.notes || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Vidya_Vikas_Admissions_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${filtered.length} applications to CSV.`, 'success');
  };

  const handlePrintList = () => {
    window.print();
  };

  const handleDelete = (id: string) => {
    deleteAdmissionEnquiry(id);
    if (selectedAdmission?.id === id) setSelectedAdmission(null);
    setDeleteConfirmId(null);
    onDataChange();
    showToast('Admission application removed.', 'info');
  };

  const getStatusBadge = (status: AdmissionStatus) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-900 border-blue-200';
      case 'pending':
        return 'bg-amber-100 text-amber-900 border-amber-200';
      case 'contacted':
        return 'bg-purple-100 text-purple-900 border-purple-200';
      case 'closed':
        return 'bg-emerald-100 text-emerald-900 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-heading flex items-center gap-2">
            <span>Admission Applications</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 font-bold">
              {filtered.length}
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Review, verify, and update online student admissions enquiries for Vidya Vikas EM School.
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search applicant or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-900/20"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-semibold text-slate-700"
          >
            <option value="all">All Statuses ({admissions.length})</option>
            <option value="new">New ({admissions.filter((a) => a.status === 'new').length})</option>
            <option value="pending">Pending ({admissions.filter((a) => a.status === 'pending').length})</option>
            <option value="contacted">Contacted ({admissions.filter((a) => a.status === 'contacted').length})</option>
            <option value="closed">Closed ({admissions.filter((a) => a.status === 'closed').length})</option>
          </select>

          <button
            onClick={handleExportCSV}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-200"
            title="Export applications to CSV / Excel spreadsheet"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={handlePrintList}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-200"
            title="Print Admissions Summary"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Print</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <FileCheck className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">No Applications Found</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              No admission applications match the search or filter criteria. New public submissions will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Application #</th>
                  <th className="py-3.5 px-4">Student & Grade</th>
                  <th className="py-3.5 px-4">Parent / Phone</th>
                  <th className="py-3.5 px-4">Submitted</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((adm) => (
                  <tr key={adm.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-950 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span>{adm.applicationNo}</span>
                        {adm.isDemo && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-200 font-sans font-semibold">
                            Sample
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block">{adm.studentName}</span>
                      <span className="text-[11px] text-amber-800 font-semibold">{adm.gradeApplying}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-700 block">{adm.parentName}</span>
                      <a href={`tel:${adm.phone}`} className="text-blue-900 font-semibold hover:underline flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{adm.phone}</span>
                      </a>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {formatDate(adm.submittedAt || adm.createdAt)}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <select
                        value={adm.status}
                        onChange={(e) => handleStatusChange(adm.id, e.target.value as AdmissionStatus)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border capitalize ${getStatusBadge(adm.status)}`}
                      >
                        <option value="new">New</option>
                        <option value="pending">Pending</option>
                        <option value="contacted">Contacted</option>
                        <option value="closed">Closed</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenDetail(adm)}
                          className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-950 hover:bg-blue-100 font-semibold text-xs flex items-center gap-1 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(adm.id)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete application"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Application Detail View Modal */}
      {selectedAdmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setSelectedAdmission(null)} />
          <div className="relative z-10 w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-blue-950 text-white p-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                  Application Reference: {selectedAdmission.applicationNo}
                </span>
                <h3 className="text-lg font-bold font-heading text-white">
                  {selectedAdmission.studentName} — {selectedAdmission.gradeApplying}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAdmission(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
              {/* Status Selector Bar */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <span className="font-bold text-slate-700">Current Application Status:</span>
                <div className="flex items-center gap-1.5">
                  {(['new', 'pending', 'contacted', 'closed'] as AdmissionStatus[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => handleStatusChange(selectedAdmission.id, st)}
                      className={`px-3 py-1.5 rounded-xl font-bold capitalize transition-all ${
                        selectedAdmission.status === st
                          ? 'bg-blue-950 text-white shadow-xs'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Information Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Student Name</span>
                  <p className="text-sm font-bold text-slate-900">{selectedAdmission.studentName}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Parent / Guardian Name</span>
                  <p className="text-sm font-bold text-slate-900">{selectedAdmission.parentName}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Class Applying For</span>
                  <p className="text-sm font-bold text-amber-900">{selectedAdmission.gradeApplying}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Submission Date</span>
                  <p className="text-sm font-bold text-slate-900">
                    {formatDate(selectedAdmission.submittedAt || selectedAdmission.createdAt)}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Phone Number</span>
                  <a
                    href={`tel:${selectedAdmission.phone}`}
                    className="text-sm font-bold text-blue-950 hover:underline flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5 text-blue-900" />
                    <span>{selectedAdmission.phone}</span>
                  </a>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Email Address</span>
                  {selectedAdmission.email ? (
                    <a
                      href={`mailto:${selectedAdmission.email}`}
                      className="text-sm font-bold text-blue-950 hover:underline flex items-center gap-1.5 truncate"
                    >
                      <Mail className="w-3.5 h-3.5 text-blue-900" />
                      <span>{selectedAdmission.email}</span>
                    </a>
                  ) : (
                    <p className="text-xs text-slate-400 italic">Not provided</p>
                  )}
                </div>
              </div>

              {selectedAdmission.address && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Residential Address / Area</span>
                  <p className="text-xs text-slate-800">{selectedAdmission.address}</p>
                </div>
              )}

              {selectedAdmission.message && (
                <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/60 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-amber-900">Parent Message / Note</span>
                  <p className="text-xs text-slate-700 leading-relaxed">{selectedAdmission.message}</p>
                </div>
              )}

              {/* Counselor Internal Notes */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Administrative & Counselor Notes (Internal)
                </label>
                <textarea
                  rows={3}
                  value={counselorNotes}
                  onChange={(e) => setCounselorNotes(e.target.value)}
                  placeholder="Record phone follow-up results, document verification status, or fee discussion notes..."
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-900/20"
                />
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  disabled={isUpdating}
                  className="px-4 py-2 rounded-xl bg-blue-950 text-white font-bold text-xs hover:bg-blue-900 transition-colors"
                >
                  Save Internal Notes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="text-base font-bold text-slate-900">Confirm Deletion</h4>
              <p className="text-xs text-slate-500">
                Are you sure you want to permanently delete this admission application record?
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 shadow-xs"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
