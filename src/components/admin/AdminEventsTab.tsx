import { useState } from 'react';
import {
  Plus,
  Search,
  Calendar,
  Trash2,
  Edit2,
  Clock,
  MapPin,
  Eye,
  EyeOff,
  AlertTriangle,
  X,
} from 'lucide-react';
import { SchoolEvent } from '../../types';
import { formatDate } from '../../utils/helpers';
import { saveEvent, deleteEvent, toggleEventPublish } from '../../services/storageService';
import { useToast } from '../common/Toast';

interface AdminEventsTabProps {
  events: SchoolEvent[];
  onDataChange: () => void;
}

export function AdminEventsTab({ events, onDataChange }: AdminEventsTabProps) {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<'all' | 'upcoming' | 'past'>('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<SchoolEvent | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '',
    category: 'cultural' as SchoolEvent['category'],
    date: new Date().toISOString().split('T')[0],
    time: '09:00 AM – 12:30 PM',
    venue: 'School Main Ground, Kotauratla',
    description: '',
    highlightsStr: '',
    isUpcoming: true,
    isPublished: true,
  });

  const filtered = events.filter((e) => {
    const q = searchTerm.toLowerCase();
    const matches =
      e.title.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q) ||
      (e.venue && e.venue.toLowerCase().includes(q));

    if (!matches) return false;
    if (categoryFilter !== 'all' && e.category !== categoryFilter) return false;
    if (timeFilter === 'upcoming' && !e.isUpcoming) return false;
    if (timeFilter === 'past' && e.isUpcoming) return false;
    return true;
  });

  const handleOpenCreate = () => {
    setEditingEvent(null);
    setForm({
      title: '',
      category: 'cultural',
      date: new Date().toISOString().split('T')[0],
      time: '09:00 AM – 12:30 PM',
      venue: 'School Main Ground, Kotauratla',
      description: '',
      highlightsStr: '',
      isUpcoming: true,
      isPublished: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (evt: SchoolEvent) => {
    setEditingEvent(evt);
    setForm({
      title: evt.title,
      category: evt.category,
      date: evt.date,
      time: evt.time || '09:00 AM – 12:30 PM',
      venue: evt.venue || 'School Campus, Kotauratla',
      description: evt.description,
      highlightsStr: evt.highlights ? evt.highlights.join('\n') : '',
      isUpcoming: evt.isUpcoming !== false,
      isPublished: evt.isPublished !== false,
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      showToast('Event title is required.', 'error');
      return;
    }

    const highlights = form.highlightsStr
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload: SchoolEvent = {
      id: editingEvent ? editingEvent.id : `evt-${Date.now()}`,
      title: form.title.trim(),
      category: form.category,
      date: form.date,
      time: form.time.trim(),
      venue: form.venue.trim(),
      description: form.description.trim(),
      highlights,
      isUpcoming: form.isUpcoming,
      isPublished: form.isPublished,
    };

    saveEvent(payload);
    onDataChange();
    setModalOpen(false);
    showToast(`Event ${editingEvent ? 'updated' : 'created'} successfully.`, 'success');
  };

  const handleTogglePublish = (id: string) => {
    toggleEventPublish(id);
    onDataChange();
    showToast('Event publication status updated.', 'info');
  };

  const handleDelete = (id: string) => {
    deleteEvent(id);
    setDeleteConfirmId(null);
    onDataChange();
    showToast('Event deleted.', 'info');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-heading flex items-center gap-2">
            <span>School Events & Calendar</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 font-bold">
              {filtered.length}
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage upcoming celebrations, sports competitions, exams, and annual celebrations.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 rounded-xl bg-blue-950 hover:bg-blue-900 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Event</span>
        </button>
      </div>

      <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-slate-50/50 focus:ring-2 focus:ring-blue-900/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white font-semibold text-slate-700 capitalize"
          >
            <option value="all">All Categories</option>
            <option value="academic">Academic</option>
            <option value="cultural">Cultural</option>
            <option value="sports">Sports</option>
            <option value="national">National</option>
            <option value="exhibition">Exhibition</option>
          </select>

          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value as any)}
            className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white font-semibold text-slate-700"
          >
            <option value="all">All Timelines</option>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past Events</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Calendar className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-800">No Events Found</h4>
          <p className="text-xs text-slate-400 mt-1">No events match your current filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((evt) => {
            const isPub = evt.isPublished !== false;
            return (
              <div
                key={evt.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-1 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200">
                      {evt.category}
                    </span>
                    <div className="flex items-center gap-1">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${
                          isPub
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {isPub ? 'Published' : 'Draft'}
                      </span>
                      {evt.isDemo && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-200 font-semibold">
                          Sample
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug">{evt.title}</h3>

                  <div className="space-y-1 text-slate-500 text-xs">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-900 shrink-0" />
                      <span>{formatDate(evt.date)}</span>
                    </div>
                    {evt.time && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-blue-900 shrink-0" />
                        <span>{evt.time}</span>
                      </div>
                    )}
                    {evt.venue && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-blue-900 shrink-0" />
                        <span className="truncate">{evt.venue}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{evt.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span
                    className={`text-[11px] font-bold ${
                      evt.isUpcoming ? 'text-blue-900' : 'text-slate-400'
                    }`}
                  >
                    {evt.isUpcoming ? 'Upcoming Event' : 'Past Event'}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleTogglePublish(evt.id)}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        isPub
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                      }`}
                      title={isPub ? 'Unpublish Event' : 'Publish Event'}
                    >
                      {isPub ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => handleOpenEdit(evt)}
                      className="p-1.5 rounded-lg text-blue-900 hover:bg-blue-50 border border-slate-200"
                      title="Edit Event"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(evt.id)}
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-slate-200"
                      title="Delete Event"
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

      {/* Event Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setModalOpen(false)} />
          <div className="relative z-10 w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-blue-950 text-white p-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                  Calendar Event
                </span>
                <h3 className="text-lg font-bold font-heading text-white">
                  {editingEvent ? 'Edit Event' : 'Add New Event'}
                </h3>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-1.5 text-slate-400 hover:text-white rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Annual Science Fair & Exhibition 2026"
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
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white capitalize"
                  >
                    <option value="academic">Academic</option>
                    <option value="cultural">Cultural</option>
                    <option value="sports">Sports</option>
                    <option value="national">National</option>
                    <option value="exhibition">Exhibition</option>
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Time</label>
                  <input
                    type="text"
                    placeholder="09:00 AM – 12:30 PM"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Venue</label>
                  <input
                    type="text"
                    placeholder="School Ground, Kotauratla"
                    value={form.venue}
                    onChange={(e) => setForm({ ...form, venue: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Event Description</label>
                <textarea
                  rows={3}
                  placeholder="Overview of the event, scheduled competitions, participating classes..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-900/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Highlights / Key Schedule (1 per line)
                </label>
                <textarea
                  rows={3}
                  placeholder="Morning assembly & flag hoisting&#10;Principal address&#10;Prize distribution ceremony"
                  value={form.highlightsStr}
                  onChange={(e) => setForm({ ...form, highlightsStr: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isUpcoming}
                    onChange={(e) => setForm({ ...form, isUpcoming: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-900"
                  />
                  <span className="font-bold text-slate-700">Upcoming Event</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isPublished}
                    onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600"
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
                  className="px-5 py-2 rounded-xl bg-blue-950 text-white font-bold hover:bg-blue-900 shadow-xs"
                >
                  {editingEvent ? 'Update Event' : 'Add Event'}
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
              <h4 className="text-base font-bold text-slate-900">Delete Event</h4>
              <p className="text-xs text-slate-500">
                Are you sure you want to permanently delete this event?
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
