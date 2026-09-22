import { useState, useEffect } from 'react';
import { Homework } from '../../types';
import {
  fetchAdminHomework,
  createHomework,
  deleteHomework,
} from '../../services/storageService';
import {
  FileText,
  Plus,
  Trash2,
  Calendar,
  Clock,
  BookOpen,
  X,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

interface AdminHomeworkTabProps {
  onDataChange: () => void;
}

export function AdminHomeworkTab({ onDataChange }: AdminHomeworkTabProps) {
  const [homeworkList, setHomeworkList] = useState<Homework[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState('all');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subject: 'Mathematics',
    class: 'Class 10',
    section: 'A',
    description: '',
    dueDate: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadHomework = async () => {
    setIsLoading(true);
    const data = await fetchAdminHomework();
    setHomeworkList(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadHomework();
  }, []);

  const handleOpenAdd = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dueStr = tomorrow.toISOString().split('T')[0];

    setFormData({
      title: '',
      subject: 'Mathematics',
      class: selectedClass !== 'all' ? selectedClass : 'Class 10',
      section: 'A',
      description: '',
      dueDate: dueStr,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete homework "${title}"?`)) return;
    const ok = await deleteHomework(id);
    if (ok) {
      loadHomework();
      onDataChange();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim() || !formData.dueDate) {
      setFormError('Please fill in title, description, and due date.');
      return;
    }

    setIsSaving(true);
    setFormError(null);

    const created = await createHomework({
      title: formData.title.trim(),
      subject: formData.subject,
      class: formData.class,
      section: formData.section,
      description: formData.description.trim(),
      dueDate: formData.dueDate,
    });

    setIsSaving(false);
    if (created) {
      setIsModalOpen(false);
      loadHomework();
      onDataChange();
    } else {
      setFormError('Failed to post homework.');
    }
  };

  const classesList = [
    'Class 1',
    'Class 2',
    'Class 3',
    'Class 4',
    'Class 5',
    'Class 6',
    'Class 7',
    'Class 8',
    'Class 9',
    'Class 10',
  ];

  const subjectsList = [
    'Telugu',
    'Hindi',
    'English',
    'Mathematics',
    'Physical Science',
    'Biological Science',
    'Social Studies',
    'Computer Science',
    'General Knowledge',
  ];

  const filtered = selectedClass === 'all'
    ? homeworkList
    : homeworkList.filter((h) => h.class === selectedClass);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold font-serif text-slate-900">Homework & Curriculum Assignments</h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900">
              {homeworkList.length} Tasks
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Publish daily exercises, track student submissions, and manage subject homework
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center space-x-2 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Assign New Homework</span>
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-3">
        <span className="text-xs font-semibold text-slate-600">Filter by Class:</span>
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
        >
          <option value="all">All Classes</option>
          {classesList.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Homework Grid */}
      {isLoading ? (
        <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
          Loading homework assignments...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center text-slate-500 text-xs">
          No homework assigned yet for selected criteria. Click "Assign New Homework" to post an assignment.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((hw) => (
            <div key={hw.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-blue-200 transition">
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-bold text-blue-900 bg-blue-100/80 px-2 py-0.5 rounded">
                    {hw.subject}
                  </span>
                  <span className="font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    {hw.class} - {hw.section}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">{hw.title}</h3>
                <p className="text-xs text-slate-600 line-clamp-3 whitespace-pre-line leading-relaxed">
                  {hw.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 mt-4 flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center space-x-1 text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Due: <strong>{hw.dueDate}</strong></span>
                </span>

                <button
                  onClick={() => handleDelete(hw.id, hw.title)}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition"
                  title="Delete Homework"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold font-serif text-slate-900">Assign New Homework</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 my-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 pt-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Class *</label>
                  <select
                    value={formData.class}
                    onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    {classesList.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Section</label>
                  <select
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="All">All Sections</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subject *</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    {subjectsList.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Submission Due Date *</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    required
                    className="w-full p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Homework Topic / Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Chapter 4 - Exercise 4.2 Problems 1 to 5"
                  required
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Instructions / Description *</label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Write clear instructions, textbook page numbers, and questions for students..."
                  required
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 font-semibold bg-blue-900 hover:bg-blue-800 text-white rounded-xl shadow-xs transition disabled:opacity-70"
                >
                  {isSaving ? 'Posting...' : 'Publish Homework'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
