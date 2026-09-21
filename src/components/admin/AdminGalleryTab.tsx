import { useState } from 'react';
import { Plus, Search, Image as ImageIcon, Trash2, Eye, EyeOff, AlertTriangle, X } from 'lucide-react';
import { GalleryItem } from '../../types';
import { formatDate } from '../../utils/helpers';
import { saveGalleryItem, deleteGalleryItem, toggleGalleryPublish } from '../../services/storageService';
import { useToast } from '../common/Toast';

interface AdminGalleryTabProps {
  gallery: GalleryItem[];
  onDataChange: () => void;
}

export function AdminGalleryTab({ gallery, onDataChange }: AdminGalleryTabProps) {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '',
    category: 'campus' as GalleryItem['category'],
    imageUrl: '/school-campus.jpg',
    caption: '',
    date: new Date().toISOString().split('T')[0],
    isPublished: true,
  });

  const filtered = gallery.filter((item) => {
    const q = searchTerm.toLowerCase();
    const matches =
      item.title.toLowerCase().includes(q) ||
      (item.caption && item.caption.toLowerCase().includes(q));

    if (!matches) return false;
    if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
    return true;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      showToast('Photo title is required.', 'error');
      return;
    }

    const payload: GalleryItem = {
      id: `gal-${Date.now()}`,
      title: form.title.trim(),
      category: form.category,
      imageUrl: form.imageUrl.trim() || '/school-campus.jpg',
      caption: form.caption.trim(),
      date: form.date,
      isPublished: form.isPublished,
    };

    saveGalleryItem(payload);
    onDataChange();
    setModalOpen(false);
    showToast('Photo added to gallery.', 'success');
  };

  const handleTogglePublish = (id: string) => {
    toggleGalleryPublish(id);
    onDataChange();
    showToast('Photo visibility updated.', 'info');
  };

  const handleDelete = (id: string) => {
    deleteGalleryItem(id);
    setDeleteConfirmId(null);
    onDataChange();
    showToast('Photo deleted from gallery.', 'info');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-heading flex items-center gap-2">
            <span>Photo Gallery Manager</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 font-bold">
              {filtered.length}
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Add, categorize, and curate campus photographs, celebration moments, and student activities.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-blue-950 hover:bg-blue-900 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Photo</span>
        </button>
      </div>

      <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search photos by title or caption..."
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
          <option value="campus">Campus & Classrooms</option>
          <option value="events">Celebrations & Events</option>
          <option value="sports">Sports & Physical Activities</option>
          <option value="activities">Academic Activities</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <ImageIcon className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-800">No Photos Found</h4>
          <p className="text-xs text-slate-400 mt-1">No images match your filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item) => {
            const isPub = item.isPublished !== false;
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs flex flex-col justify-between"
              >
                <div className="aspect-16/10 bg-slate-100 relative">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <span className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-black/70 text-white backdrop-blur-xs">
                    {item.category}
                  </span>
                  {item.isDemo && (
                    <span className="absolute top-2 right-2 text-[9px] font-semibold px-2 py-0.5 rounded-md bg-amber-500 text-blue-950 shadow-xs">
                      Sample
                    </span>
                  )}
                </div>

                <div className="p-4 space-y-2">
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">{item.title}</h3>
                  {item.caption && (
                    <p className="text-xs text-slate-500 line-clamp-2">{item.caption}</p>
                  )}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                    <span>{formatDate(item.date)}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleTogglePublish(item.id)}
                        className={`p-1 rounded-md border ${
                          isPub
                            ? 'text-emerald-700 hover:bg-emerald-50 border-emerald-200'
                            : 'text-slate-500 hover:bg-slate-100 border-slate-200'
                        }`}
                        title={isPub ? 'Unpublish from gallery' : 'Publish to gallery'}
                      >
                        {isPub ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(item.id)}
                        className="p-1 rounded-md text-rose-600 hover:bg-rose-50 border border-slate-200"
                        title="Delete photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setModalOpen(false)} />
          <div className="relative z-10 w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-blue-950 text-white p-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                  Media Library
                </span>
                <h3 className="text-lg font-bold font-heading text-white">Add Photo to Gallery</h3>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-1.5 text-slate-400 hover:text-white rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Photo Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Science Laboratory Session"
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
                    onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white"
                  >
                    <option value="campus">Campus & Infrastructure</option>
                    <option value="events">Celebrations & Events</option>
                    <option value="sports">Sports</option>
                    <option value="activities">Academic Activities</option>
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Image URL / Path</label>
                <input
                  type="text"
                  placeholder="/school-campus.jpg or image URL"
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Caption / Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief caption describing the scene..."
                  value={form.caption}
                  onChange={(e) => setForm({ ...form, caption: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-900/20"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isPublished}
                    onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600"
                  />
                  <span className="font-bold text-slate-700">Publish Immediately in Gallery</span>
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
                  className="px-5 py-2 rounded-xl bg-blue-950 text-white font-bold hover:bg-blue-900 shadow-xs"
                >
                  Save Photo
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
              <h4 className="text-base font-bold text-slate-900">Delete Photo</h4>
              <p className="text-xs text-slate-500">
                Are you sure you want to remove this image from the gallery?
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
