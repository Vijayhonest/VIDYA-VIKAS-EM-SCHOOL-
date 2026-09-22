import { useState, useEffect } from 'react';
import { TimetableEntry, DayOfWeek } from '../../types';
import {
  fetchAdminTimetable,
  createTimetableEntry,
  deleteTimetableEntry,
} from '../../services/storageService';
import {
  Calendar,
  Plus,
  Trash2,
  Clock,
  User,
  X,
  AlertCircle,
  BookOpen,
} from 'lucide-react';

interface AdminTimetableTabProps {
  onDataChange: () => void;
}

export function AdminTimetableTab({ onDataChange }: AdminTimetableTabProps) {
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState('Class 10');
  const [selectedSection, setSelectedSection] = useState('A');
  const [selectedDay, setSelectedDay] = useState('Monday');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    class: 'Class 10',
    section: 'A',
    dayOfWeek: 'Monday',
    period: 1,
    subject: 'Mathematics',
    teacherName: 'K. Srinivasa Rao',
    time: '09:00 AM - 09:45 AM',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadTimetable = async () => {
    setIsLoading(true);
    const data = await fetchAdminTimetable(selectedClass, selectedSection);
    setTimetable(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadTimetable();
  }, [selectedClass, selectedSection]);

  const handleOpenAdd = () => {
    setFormData({
      class: selectedClass,
      section: selectedSection,
      dayOfWeek: selectedDay,
      period: 1,
      subject: 'Mathematics',
      teacherName: 'K. Srinivasa Rao',
      time: '09:00 AM - 09:45 AM',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, subject: string) => {
    if (!window.confirm(`Delete period slot for "${subject}"?`)) return;
    const ok = await deleteTimetableEntry(id);
    if (ok) {
      loadTimetable();
      onDataChange();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject.trim() || !formData.teacherName.trim() || !formData.time.trim()) {
      setFormError('Please fill subject, teacher, and period timing.');
      return;
    }

    setIsSaving(true);
    setFormError(null);

    const created = await createTimetableEntry({
      class: formData.class,
      section: formData.section,
      dayOfWeek: formData.dayOfWeek as DayOfWeek,
      period: Number(formData.period),
      subject: formData.subject.trim(),
      teacherName: formData.teacherName.trim(),
      time: formData.time.trim(),
    });

    setIsSaving(false);
    if (created) {
      setIsModalOpen(false);
      loadTimetable();
      onDataChange();
    } else {
      setFormError('Failed to add timetable slot.');
    }
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
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

  const standardTimes: Record<number, string> = {
    1: '09:00 AM - 09:45 AM',
    2: '09:45 AM - 10:30 AM',
    3: '10:45 AM - 11:30 AM',
    4: '11:30 AM - 12:15 PM',
    5: '01:00 PM - 01:45 PM',
    6: '01:45 PM - 02:30 PM',
    7: '02:45 PM - 03:30 PM',
    8: '03:30 PM - 04:15 PM',
  };

  const filteredSlots = timetable
    .filter((t) => t.dayOfWeek.toLowerCase() === selectedDay.toLowerCase())
    .sort((a, b) => a.period - b.period);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-serif text-slate-900">Class Timetable Master</h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure weekly subject schedules, period timings, and assigned faculty for every class
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center space-x-2 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Period Slot</span>
        </button>
      </div>

      {/* Class & Section selectors */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-4">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-600">Select Class:</span>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
          >
            {classesList.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-600">Section:</span>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
          >
            <option value="A">Section A</option>
            <option value="B">Section B</option>
          </select>
        </div>
      </div>

      {/* Day Tabs */}
      <div className="flex flex-wrap gap-2">
        {daysOfWeek.map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              selectedDay.toLowerCase() === day.toLowerCase()
                ? 'bg-blue-900 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Timetable Slots Grid */}
      {isLoading ? (
        <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
          Loading timetable...
        </div>
      ) : filteredSlots.length === 0 ? (
        <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center text-slate-500 text-xs">
          No periods configured for {selectedDay} in {selectedClass} - Section {selectedSection}. Click "Add Period Slot" to schedule a class.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredSlots.map((slot) => (
            <div
              key={slot.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-blue-300 transition"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
                    Period {slot.period}
                  </span>
                  <span className="text-slate-500 font-mono text-[11px] flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{slot.time}</span>
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1">{slot.subject}</h3>
                <p className="text-xs text-slate-500 mt-1 flex items-center space-x-1">
                  <User className="w-3 h-3 text-slate-400" />
                  <span>{slot.teacherName}</span>
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-end">
                <button
                  onClick={() => handleDelete(slot.id, slot.subject)}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition"
                  title="Delete Slot"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Slot Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold font-serif text-slate-900">Add Period Slot</h3>
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
                  <label className="block font-semibold text-slate-700 mb-1">Day of Week</label>
                  <select
                    value={formData.dayOfWeek}
                    onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    {daysOfWeek.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Period Number</label>
                  <select
                    value={formData.period}
                    onChange={(e) => {
                      const p = Number(e.target.value);
                      setFormData({
                        ...formData,
                        period: p,
                        time: standardTimes[p] || formData.time,
                      });
                    }}
                    className="w-full p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                      <option key={n} value={n}>
                        Period {n}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Period Timing</label>
                <input
                  type="text"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  placeholder="e.g. 09:00 AM - 09:45 AM"
                  required
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject Name *</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g. Mathematics, Physical Science"
                  required
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Teacher Name *</label>
                <input
                  type="text"
                  value={formData.teacherName}
                  onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
                  placeholder="e.g. K. Srinivasa Rao"
                  required
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
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
                  {isSaving ? 'Saving...' : 'Save Slot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
