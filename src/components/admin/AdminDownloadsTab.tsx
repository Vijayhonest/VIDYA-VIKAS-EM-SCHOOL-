import { useState } from 'react';
import {
  Plus,
  Search,
  Download,
  Trash2,
  FileText,
  AlertTriangle,
  X,
  Edit2,
  Eye,
  EyeOff,
  ExternalLink,
} from 'lucide-react';
import { DownloadItem } from '../../types';
import { formatDate } from '../../utils/helpers';
import {
  saveDownloadItem,
  deleteDownloadItem,
  toggleDownloadPublish,
} from '../../services/storageService';
import { useToast } from '../common/Toast';

interface AdminDownloadsTabProps {
  downloads: DownloadItem[];
  onDataChange: () => void;
}

const CATEGORIES: Array<{ id: DownloadItem['category']; label: string }> = [
  { id: 'admission', label: 'Admission Forms' },
  { id: 'prospectus', label: 'Prospectus' },
  { id: 'academic', label: 'Curriculum & Books' },
  { id: 'calendar', label: 'Academic Calendar' },
  { id: 'guideline', label: 'Guidelines & Rules' },
  { id: 'circular', label: 'Circulars' },
  { id: 'other', label: 'Other Documents' },
];

export function AdminDownloadsTab({ downloads, onDataChange }: AdminDownloadsTabProps) {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DownloadItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '',
    category: 'academic' as DownloadItem['category'],
    fileName: '',
    fileSize: '1.2 MB',
    fileType: 'PDF Document',
    description: '',
    isPublished: true,
  });

  const filtered = downloads.filter((d) => {
    const q = searchTerm.toLowerCase();
    const matches =
      d.title.toLowerCase().includes(q) ||
      (d.description && d.description.toLowerCase().includes(q)) ||
      d.fileName.toLowerCase().includes(q);

    if (!matches) return false;
    if (categoryFilter !== 'all' && d.category !== categoryFilter) return false;
    return true;
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setForm({
      title: '',
      category: 'academic',
      fileName: '',
      fileSize: '1.2 MB',
      fileType: 'PDF Document',
      description: '',
      isPublished: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (item: DownloadItem) => {
    setEditingItem(item);
    setForm({
      title: item.title,
      category: item.category,
      fileName: item.fileName,
      fileSize: item.fileSize,
      fileType: item.fileType,
      description: item.description,
      isPublished: item.isPublished !== false,
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      showToast('Document title is required.', 'error');
      return;
    }

    const payload: DownloadItem = {
      id: editingItem ? editingItem.id : `dl-${Date.now()}`,
      title: form.title.trim(),
      category: form.category,
      fileName:
        form.fileName.trim() ||
        `${form.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.pdf`,
      fileSize: form.fileSize.trim() || '1.0 MB',
      fileType: form.fileType.trim() || 'PDF Document',
      description: form.description.trim() || 'Official school document for download.',
      lastUpdated: new Date().toISOString().split('T')[0],
      downloadCount: editingItem ? editingItem.downloadCount : 0,
      isPublished: form.isPublished,
    };

    saveDownloadItem(payload);
    onDataChange();
    setModalOpen(false);
    showToast(
      editingItem ? 'Download document updated.' : 'Downloadable resource added.',
      'success'
    );
  };

  const handleTogglePublish = (item: DownloadItem) => {
    toggleDownloadPublish(item.id);
    onDataChange();
    showToast(
      item.isPublished === false
        ? `Published "${item.title}".`
        : `Unpublished "${item.title}".`,
      'info'
    );
  };

  const handleTestDownload = (item: DownloadItem) => {
    const link = document.createElement('a');
    link.href = `/api/downloads/${item.id}/file`;
    const cleanFileName = item.fileName.endsWith('.pdf')
      ? item.fileName.replace(/\.pdf$/i, '.html')
      : item.fileName;
    link.setAttribute('download', cleanFileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Downloading test copy of ${item.title}...`, 'info');
  };

  const handleDelete = (id: string) => {
    deleteDownloadItem(id);
    setDeleteConfirmId(null);
    onDataChange();
    showToast('Resource removed.', 'info');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-heading flex items-center gap-2">
            <span>Downloads & Documents Manager</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 font-bold">
              {filtered.length}
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Organize official syllabi, admission applications, parent handbooks, prospectus brochures, and circulars.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 rounded-xl bg-blue-950 hover:bg-blue-900 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Document</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search documents by title, description or file name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-slate-50/50 focus:ring-2 focus:ring-blue-900/20"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white font-semibold text-slate-700"
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Download className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-800">No Documents Found</h4>
          <p className="text-xs text-slate-400 mt-1">No resources match the selected filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => {
            const isPub = item.isPublished !== false;
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-blue-950 border border-blue-100">
                      {item.category}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          isPub
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {isPub ? 'Published' : 'Unpublished'}
                      </span>
                      {item.isDemo && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-200 font-semibold">
                          Sample
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3 pt-1">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-900 border border-amber-200/60 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-xs font-mono text-slate-500 mt-0.5 truncate">
                        {item.fileName}
                      </p>
                    </div>
                  </div>

                  {item.description && (
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="space-x-1.5">
                    <span className="font-semibold text-slate-700">{item.fileSize}</span>
                    <span>•</span>
                    <span>{item.downloadCount || 0} dl</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleTogglePublish(item)}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        isPub
                          ? 'text-emerald-700 hover:bg-emerald-50 border-emerald-200'
                          : 'text-slate-500 hover:bg-slate-100 border-slate-200'
                      }`}
                      title={isPub ? 'Unpublish Document' : 'Publish Document'}
                    >
                      {isPub ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => handleTestDownload(item)}
                      className="p-1.5 rounded-lg text-blue-700 hover:bg-blue-50 border border-blue-200"
                      title="Test Download Document"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 rounded-lg text-amber-700 hover:bg-amber-50 border border-amber-200"
                      title="Edit Document"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(item.id)}
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-slate-200"
                      title="Delete Document"
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

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setModalOpen(false)} />
          <div className="relative z-10 w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-blue-950 text-white p-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                  Document Repository
                </span>
                <h3 className="text-lg font-bold font-heading text-white">
                  {editingItem ? 'Edit Download Resource' : 'Add Download Resource'}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Document Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Academic Syllabus 2026–27 (Classes I–X)"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-900/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value as DownloadItem['category'] })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">File Name</label>
                  <input
                    type="text"
                    placeholder="Syllabus_2026.pdf"
                    value={form.fileName}
                    onChange={(e) => setForm({ ...form, fileName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">File Size</label>
                  <input
                    type="text"
                    placeholder="e.g. 1.5 MB"
                    value={form.fileSize}
                    onChange={(e) => setForm({ ...form, fileSize: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">File Format</label>
                  <input
                    type="text"
                    placeholder="PDF Document"
                    value={form.fileType}
                    onChange={(e) => setForm({ ...form, fileType: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Outline syllabus structure, recommended textbooks, and term evaluation guidelines."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="doc-is-published"
                  checked={form.isPublished}
                  onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-900 focus:ring-blue-900/20"
                />
                <label htmlFor="doc-is-published" className="text-xs font-semibold text-slate-700">
                  Publish to Public Downloads Center immediately
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-950 hover:bg-blue-900 text-white text-xs font-bold transition-colors shadow-xs"
                >
                  {editingItem ? 'Save Changes' : 'Add Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">Remove Document Resource?</h4>
              <p className="text-xs text-slate-500 mt-1">
                This document will be permanently deleted from the repository. Public visitors will no longer be able to download it.
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
