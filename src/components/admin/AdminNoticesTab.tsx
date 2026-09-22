import { useState } from 'react';
import {
  Plus,
  Search,
  Pin,
  Trash2,
  Edit2,
  Bell,
  Eye,
  EyeOff,
  AlertTriangle,
  FileText,
  X,
  CheckCircle,
} from 'lucide-react';
import { Notice } from '../../types';
import { formatDate } from '../../utils/helpers';
import {
  saveNotice,
  deleteNotice,
  toggleNoticePin,
  toggleNoticePublish,
} from '../../services/storageService';
import { useToast } from '../common/Toast';

interface AdminNoticesTabProps {
  notices: Notice[];
  onDataChange: () => void;
}

export function AdminNoticesTab({ notices, onDataChange }: AdminNoticesTabProps) {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [form, setForm] = useState({
    title: '',
    category: 'general' as Notice['category'],
    targetAudience: 'all' as 'all' | 'students' | 'parents' | 'staff',
    date: new Date().toISOString().split('T')[0],
    summary: '',
    content: '',
    attachmentName: '',
    isPinned: false,
    isPublished: true,
    postedBy: 'Principal Office',
  });

  const filtered = notices.filter((n) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      n.title.toLowerCase().includes(q) ||
      n.summary.toLowerCase().includes(q) ||
      (n.content && n.content.toLowerCase().includes(q));

    if (!matchesSearch) return false;
    if (categoryFilter !== 'all' && n.category !== categoryFilter) return false;
    if (statusFilter === 'published' && n.isPublished === false) return false;
    if (statusFilter === 'draft' && n.isPublished !== false) return false;
    return true;
  });

  const handleOpenCreate = () => {
    setEditingNotice(null);
    setForm({
      title: '',
      category: 'general',
      targetAudience: 'all',
      date: new Date().toISOString().split('T')[0],
      summary: '',
      content: '',
      attachmentName: '',
      isPinned: false,
      isPublished: true,
      postedBy: 'Principal Office',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (n: Notice) => {
    setEditingNotice(n);
    setForm({
      title: n.title,
      category: n.category,
      targetAudience: n.targetAudience || 'all',
      date: n.date || new Date().toISOString().split('T')[0],
      summary: n.summary,
      content: n.content || n.summary,
      attachmentName: n.attachmentName || '',
      isPinned: Boolean(n.isPinned),
      isPublished: n.isPublished !== false,
      postedBy: n.postedBy || 'Principal Office',
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      showToast('Notice title is required.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Notice = {
        id: editingNotice ? editingNotice.id : `not-${Date.now()}`,
        title: form.title.trim(),
        category: form.category,
        targetAudience: form.targetAudience,
        date: form.date,
        summary: form.summary.trim() || form.title.trim(),
        content: form.content.trim() || form.summary.trim() || form.title.trim(),
        attachmentName: form.attachmentName.trim() || undefined,
        isPinned: form.isPinned,
        isPublished: form.isPublished,
        postedBy: form.postedBy.trim() || 'Principal Office',
        createdAt: editingNotice?.createdAt || new Date().toISOString(),
      };

      saveNotice(payload);
      onDataChange();
      setModalOpen(false);
      showToast(`Notice ${editingNotice ? 'updated' : 'published'} successfully.`, 'success');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePin = (id: string) => {
    toggleNoticePin(id);
    onDataChange();
    showToast('Notice priority updated.', 'info');
  };

  const handleTogglePublish = (id: string) => {
    toggleNoticePublish(id);
    onDataChange();
    showToast('Notice publish state toggled.', 'info');
  };

  const handleDelete = (id: string) => {
    deleteNotice(id);
    setDeleteConfirmId(null);
    onDataChange();
    showToast('Notice deleted.', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-heading flex items-center gap-2">
            <span>Official Notices & Circulars</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 font-bold">
              {filtered.length}
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Create, edit, pin, and manage public school circulars and exam schedules.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-xl bg-blue-950 hover:bg-blue-900 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Notice</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search circulars by keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-slate-50/50 focus:outline-hidden focus:ring-2 focus:ring-blue-900/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white font-semibold text-slate-700 capitalize"
          >
            <option value="all">All Categories</option>
            <option value="general">General</option>
            <option value="exam">Examination</option>
            <option value="holiday">Holiday</option>
            <option value="admission">Admission</option>
            <option value="event">Event</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white font-semibold text-slate-700"
          >
            <option value="all">All Visibility</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>
        </div>
      </div>

      {/* Notices List */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Bell className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-800">No Notices Found</h4>
          <p className="text-xs text-slate-400 mt-1">No circulars match your current filter criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((n) => {
            const isPub = n.isPublished !== false;
            return (
              <div
                key={n.id}
                className={`bg-white rounded-2xl p-5 border transition-all flex flex-col justify-between space-y-4 shadow-xs ${
                  n.isPinned ? 'border-amber-300 ring-2 ring-amber-400/20' : 'border-slate-200'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-blue-900 border border-blue-100">
                        {n.category}
                      </span>
                      {n.isPinned && (
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1">
                          <Pin className="w-2.5 h-2.5 fill-amber-700" />
                          Pinned
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${
                          isPub
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {isPub ? 'Published' : 'Draft'}
                      </span>
                      {n.isDemo && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-200 font-semibold">
                          Sample
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
                      {formatDate(n.date)}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">{n.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{n.summary}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400">By: {n.postedBy || 'Principal'}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleTogglePin(n.id)}
                      title={n.isPinned ? 'Unpin Notice' : 'Pin to Top'}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        n.isPinned
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'text-slate-500 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleTogglePublish(n.id)}
                      title={isPub ? 'Unpublish (Make Draft)' : 'Publish Notice'}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        isPub
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {isPub ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={() => handleOpenEdit(n)}
                      className="p-1.5 rounded-lg text-blue-900 hover:bg-blue-50 border border-slate-200 transition-colors"
                      title="Edit Notice"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setDeleteConfirmId(n.id)}
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors"
                      title="Delete Notice"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Notice Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setModalOpen(false)} />
          <div className="relative z-10 w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-blue-950 text-white p-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                  Official Communication
                </span>
                <h3 className="text-lg font-bold font-heading text-white">
                  {editingNotice ? 'Edit Notice' : 'Create New Circular'}
                </h3>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-1.5 text-slate-400 hover:text-white rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Notice Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Annual Sports Day 2026 Registration"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-900/20"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white capitalize"
                  >
                    <option value="general">General Circular</option>
                    <option value="exam">Examination</option>
                    <option value="holiday">Holiday</option>
                    <option value="admission">Admission</option>
                    <option value="event">Event</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Audience</label>
                  <select
                    value={form.targetAudience}
                    onChange={(e) => setForm({ ...form, targetAudience: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white"
                  >
                    <option value="all">Everyone (All)</option>
                    <option value="students">Students Only</option>
                    <option value="parents">Parents Only</option>
                    <option value="staff">Staff / Faculty</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Short Summary</label>
                <textarea
                  rows={2}
                  placeholder="Brief one or two line overview for the bulletin board..."
                  value={form.summary}
                  onChange={(e) => setForm({ ...form, summary: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-900/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Content</label>
                <textarea
                  rows={4}
                  placeholder="Full text of the circular, guidelines, timings, instructions..."
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-900/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Attachment File Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Schedule_2026.pdf (Optional)"
                    value={form.attachmentName}
                    onChange={(e) => setForm({ ...form, attachmentName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Author / Authority</label>
                  <input
                    type="text"
                    placeholder="Principal Office"
                    value={form.postedBy}
                    onChange={(e) => setForm({ ...form, postedBy: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isPinned}
                    onChange={(e) => setForm({ ...form, isPinned: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-900 focus:ring-blue-900"
                  />
                  <span className="font-bold text-slate-700">Pin to Notice Board</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isPublished}
                    onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-bold text-slate-700">Publish Immediately</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-blue-950 text-white font-bold hover:bg-blue-900 transition-colors shadow-xs"
                >
                  {editingNotice ? 'Update Notice' : 'Publish Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="text-base font-bold text-slate-900">Delete Notice</h4>
              <p className="text-xs text-slate-500">
                Are you sure you want to delete this notice circular?
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
