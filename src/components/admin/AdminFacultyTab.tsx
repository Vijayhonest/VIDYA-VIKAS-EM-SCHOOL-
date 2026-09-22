import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Users,
  Trash2,
  Edit2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  X,
  GraduationCap,
  Calendar,
  CheckSquare,
  Clock,
  Phone,
  Mail,
  BookOpen,
} from 'lucide-react';
import { FacultyMember, StaffAttendanceRecord } from '../../types';
import {
  saveFaculty,
  deleteFaculty,
  toggleFacultyActive,
  fetchStaffAttendance,
  saveStaffAttendanceBatch,
} from '../../services/storageService';
import { useToast } from '../common/Toast';

interface AdminFacultyTabProps {
  faculty: FacultyMember[];
  onDataChange: () => void;
}

export function AdminFacultyTab({ faculty, onDataChange }: AdminFacultyTabProps) {
  const { showToast } = useToast();
  const [activeSubTab, setActiveSubTab] = useState<'directory' | 'attendance'>('directory');

  // Directory states
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FacultyMember | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    designation: '',
    subject: '',
    department: 'Languages',
    qualification: '',
    experience: '3+ Years',
    shortProfile: '',
    photoUrl: '/faculty-placeholder.jpg',
    displayOrder: 1,
    assignedClasses: 'Class 6 - 10',
    phone: '9441971531',
    email: '',
    isActive: true,
    isLeadership: false,
  });

  // Staff Attendance states
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [staffAttendance, setStaffAttendance] = useState<Record<string, { status: 'present' | 'absent' | 'half-day' | 'leave'; remarks: string }>>({});
  const [isSavingAttendance, setIsSavingAttendance] = useState(false);

  useEffect(() => {
    async function loadAttendanceForDate() {
      try {
        const records = await fetchStaffAttendance(attendanceDate);
        const map: Record<string, { status: 'present' | 'absent' | 'half-day' | 'leave'; remarks: string }> = {};

        // Default all active faculty to present if no records
        faculty.forEach((f) => {
          map[f.id] = { status: 'present', remarks: '' };
        });

        // Overlay saved records
        records.forEach((r) => {
          map[r.facultyId] = { status: r.status, remarks: r.remarks || '' };
        });

        setStaffAttendance(map);
      } catch (err) {
        console.error('Error loading staff attendance:', err);
      }
    }
    loadAttendanceForDate();
  }, [attendanceDate, faculty]);

  const sortedFaculty = [...faculty].sort((a, b) => (a.displayOrder || 99) - (b.displayOrder || 99));

  const filtered = sortedFaculty.filter((f) => {
    const q = searchTerm.toLowerCase();
    const matches =
      f.name.toLowerCase().includes(q) ||
      f.designation.toLowerCase().includes(q) ||
      (f.subject && f.subject.toLowerCase().includes(q)) ||
      f.department.toLowerCase().includes(q) ||
      (f.assignedClasses && f.assignedClasses.toLowerCase().includes(q));

    if (!matches) return false;
    if (departmentFilter !== 'all' && f.department !== departmentFilter) return false;
    if (statusFilter === 'active' && f.isActive === false) return false;
    if (statusFilter === 'inactive' && f.isActive !== false) return false;
    return true;
  });

  const handleOpenCreate = () => {
    setEditingMember(null);
    setForm({
      name: '',
      designation: 'Teacher',
      subject: '',
      department: 'Languages',
      qualification: 'B.Ed / Post Graduate',
      experience: '3+ Years',
      shortProfile: '',
      photoUrl: '/faculty-placeholder.jpg',
      displayOrder: faculty.length + 1,
      assignedClasses: 'Class 6 - 10',
      phone: '9441971531',
      email: '',
      isActive: true,
      isLeadership: false,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (m: FacultyMember) => {
    setEditingMember(m);
    setForm({
      name: m.name,
      designation: m.designation,
      subject: m.subject || '',
      department: m.department,
      qualification: m.qualification,
      experience: m.experience,
      shortProfile: m.shortProfile,
      photoUrl: m.photoUrl || '/faculty-placeholder.jpg',
      displayOrder: m.displayOrder || 1,
      assignedClasses: m.assignedClasses || 'Class 6 - 10',
      phone: m.phone || '9441971531',
      email: m.email || '',
      isActive: m.isActive !== false,
      isLeadership: Boolean(m.isLeadership),
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      showToast('Staff member name is required.', 'error');
      return;
    }

    const payload: FacultyMember = {
      id: editingMember ? editingMember.id : `fac-${Date.now()}`,
      name: form.name.trim(),
      designation: form.designation.trim() || 'Teacher',
      subject: form.subject.trim() || 'General Curriculum',
      department: form.department,
      qualification: form.qualification.trim() || 'Graduate / Trained Teacher',
      experience: form.experience.trim() || 'Experienced',
      shortProfile: form.shortProfile.trim(),
      photoUrl: form.photoUrl.trim() || '/faculty-placeholder.jpg',
      displayOrder: Number(form.displayOrder) || 1,
      assignedClasses: form.assignedClasses.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      isActive: form.isActive,
      isLeadership: form.isLeadership,
    };

    saveFaculty(payload);
    onDataChange();
    setModalOpen(false);
    showToast(`Staff member ${editingMember ? 'updated' : 'added'} successfully.`, 'success');
  };

  const handleToggleActive = (id: string) => {
    toggleFacultyActive(id);
    onDataChange();
    showToast('Staff active status updated.', 'info');
  };

  const handleDelete = (id: string) => {
    deleteFaculty(id);
    setDeleteConfirmId(null);
    onDataChange();
    showToast('Faculty member record removed.', 'info');
  };

  // Staff Attendance Handlers
  const handleMarkAllStaff = (status: 'present' | 'absent') => {
    const updated = { ...staffAttendance };
    faculty.forEach((f) => {
      updated[f.id] = { status, remarks: updated[f.id]?.remarks || '' };
    });
    setStaffAttendance(updated);
  };

  const handleSaveStaffAttendance = async () => {
    setIsSavingAttendance(true);
    try {
      const records = faculty.map((f) => ({
        facultyId: f.id,
        facultyName: f.name,
        designation: f.designation,
        status: staffAttendance[f.id]?.status || 'present',
        remarks: staffAttendance[f.id]?.remarks || '',
      }));

      const ok = await saveStaffAttendanceBatch(attendanceDate, records);
      if (ok) {
        showToast(`Staff attendance for ${attendanceDate} saved.`, 'success');
      } else {
        showToast('Failed to save staff attendance.', 'error');
      }
    } catch (err) {
      showToast('Error saving staff attendance.', 'error');
    } finally {
      setIsSavingAttendance(false);
    }
  };

  const presentCount = Object.values(staffAttendance).filter((s) => s.status === 'present').length;
  const absentCount = Object.values(staffAttendance).filter((s) => s.status === 'absent').length;
  const leaveCount = Object.values(staffAttendance).filter((s) => s.status === 'leave').length;

  return (
    <div className="space-y-6">
      {/* Header & Subtabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold font-serif text-blue-950 flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-500" />
            <span>Faculty & Staff Management</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Maintain teacher directories, assigned subjects/classes, contact information, and daily staff attendance.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveSubTab('directory')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeSubTab === 'directory'
                  ? 'bg-blue-950 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Staff Directory ({faculty.length})
            </button>
            <button
              onClick={() => setActiveSubTab('attendance')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeSubTab === 'attendance'
                  ? 'bg-blue-950 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Daily Staff Attendance
            </button>
          </div>

          {activeSubTab === 'directory' && (
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Add Staff</span>
            </button>
          )}
        </div>
      </div>

      {/* SUB-TAB 1: STAFF DIRECTORY */}
      {activeSubTab === 'directory' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by teacher name, subject, or assigned classes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-slate-50/50 focus:ring-2 focus:ring-blue-900/20"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white font-semibold text-slate-700"
              >
                <option value="all">All Departments</option>
                <option value="Leadership">Leadership & Administration</option>
                <option value="Languages">Languages</option>
                <option value="Science & Mathematics">Science & Mathematics</option>
                <option value="Social Sciences">Social Sciences</option>
                <option value="Physical Education">Physical Education</option>
                <option value="Primary Wing">Primary Wing</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white font-semibold text-slate-700"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>

          {/* Faculty Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((m) => {
              const isActive = m.isActive !== false;
              return (
                <div
                  key={m.id}
                  className={`bg-white rounded-2xl border p-5 space-y-4 shadow-xs hover:shadow-md transition relative flex flex-col justify-between ${
                    isActive ? 'border-slate-200' : 'border-slate-200 bg-slate-50/70 opacity-75'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start gap-3.5">
                      <img
                        src={m.photoUrl || '/faculty-placeholder.jpg'}
                        alt={m.name}
                        referrerPolicy="no-referrer"
                        className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-2xs shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=300&q=80';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-bold text-slate-900 truncate">{m.name}</h3>
                          {m.isLeadership && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-300 shrink-0">
                              Lead
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-semibold text-blue-900">{m.designation}</p>
                        <p className="text-[11px] text-slate-500 truncate">{m.subject}</p>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">
                          <strong>Classes:</strong> {m.assignedClasses || 'All Primary & High School'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-mono text-[11px]">{m.phone || '9441971531'}</span>
                      </div>
                      {m.qualification && (
                        <div className="text-[11px] text-slate-500 truncate">
                          <strong>Edu:</strong> {m.qualification} • {m.experience}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <button
                      onClick={() => handleToggleActive(m.id)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-[10px] uppercase border ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {isActive ? <CheckCircle className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3 text-slate-400" />}
                      <span>{isActive ? 'Active' : 'Inactive'}</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(m)}
                        className="p-1.5 rounded-lg text-blue-900 hover:bg-blue-50 border border-slate-200 transition"
                        title="Edit profile"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(m.id)}
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-slate-200 transition"
                        title="Delete profile"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: STAFF DAILY ATTENDANCE */}
      {activeSubTab === 'attendance' && (
        <div className="space-y-6">
          {/* Attendance Date Control & Action Bar */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
                <Calendar className="w-4 h-4 text-blue-900" />
                <span className="font-semibold text-slate-600">Roll Call Date:</span>
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="bg-white border border-slate-200 px-2 py-1 rounded-lg font-bold text-slate-800 text-xs focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={() => handleMarkAllStaff('present')}
                  className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200 hover:bg-emerald-100"
                >
                  All Present
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold">
                  Present: {presentCount}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 font-bold">
                  Absent: {absentCount}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 font-bold">
                  Leave: {leaveCount}
                </span>
              </div>

              <button
                onClick={handleSaveStaffAttendance}
                disabled={isSavingAttendance}
                className="px-5 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-xs transition"
              >
                {isSavingAttendance ? 'Saving...' : 'Save Attendance'}
              </button>
            </div>
          </div>

          {/* Roll Call Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="py-3 px-4">Faculty Member</th>
                  <th className="py-3 px-4">Designation & Dept</th>
                  <th className="py-3 px-4">Assigned Classes</th>
                  <th className="py-3 px-4">Attendance Status</th>
                  <th className="py-3 px-4">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {faculty.map((f) => {
                  const current = staffAttendance[f.id] || { status: 'present', remarks: '' };
                  return (
                    <tr key={f.id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{f.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{f.phone || '9441971531'}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-blue-950">{f.designation}</div>
                        <div className="text-[11px] text-slate-500">{f.department}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {f.assignedClasses || 'General Primary/High'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          {(['present', 'absent', 'half-day', 'leave'] as const).map((st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={() =>
                                setStaffAttendance({
                                  ...staffAttendance,
                                  [f.id]: { ...current, status: st },
                                })
                              }
                              className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase transition ${
                                current.status === st
                                  ? st === 'present'
                                    ? 'bg-emerald-600 text-white shadow-2xs'
                                    : st === 'absent'
                                    ? 'bg-rose-600 text-white shadow-2xs'
                                    : 'bg-amber-500 text-white shadow-2xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          placeholder="Optional notes..."
                          value={current.remarks}
                          onChange={(e) =>
                            setStaffAttendance({
                              ...staffAttendance,
                              [f.id]: { ...current, remarks: e.target.value },
                            })
                          }
                          className="w-full max-w-xs px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:bg-white"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: Add / Edit Staff */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 font-heading">
                {editingMember ? 'Edit Staff Profile' : 'Add New Staff Member'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Smt. K. Sarada Devi, M.Sc., B.Ed."
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Designation</label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Science Teacher"
                    value={form.designation}
                    onChange={(e) => setForm({ ...form, designation: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                  <select
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white"
                  >
                    <option value="Languages">Languages</option>
                    <option value="Science & Mathematics">Science & Mathematics</option>
                    <option value="Social Sciences">Social Sciences</option>
                    <option value="Primary Wing">Primary Wing</option>
                    <option value="Physical Education">Physical Education</option>
                    <option value="Leadership">Leadership & Administration</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Subject Specialization</label>
                  <input
                    type="text"
                    placeholder="e.g. Mathematics & Physics"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Classes</label>
                  <input
                    type="text"
                    placeholder="e.g. Class 8, 9, 10"
                    value={form.assignedClasses}
                    onChange={(e) => setForm({ ...form, assignedClasses: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    placeholder="e.g. 9441971531"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Qualification</label>
                  <input
                    type="text"
                    placeholder="e.g. M.Sc., B.Ed."
                    value={form.qualification}
                    onChange={(e) => setForm({ ...form, qualification: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Short Profile / Bio</label>
                <textarea
                  rows={2}
                  placeholder="Dedicated educator fostering foundational concepts and student engagement..."
                  value={form.shortProfile}
                  onChange={(e) => setForm({ ...form, shortProfile: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-900/20"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isLeadership}
                    onChange={(e) => setForm({ ...form, isLeadership: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-900"
                  />
                  <span className="font-bold text-slate-700">School Leadership Role</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600"
                  />
                  <span className="font-bold text-slate-700">Active Educator Profile</span>
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
                  {editingMember ? 'Update Staff' : 'Add Staff'}
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
              <h4 className="text-base font-bold text-slate-900">Delete Staff Record</h4>
              <p className="text-xs text-slate-500">
                Are you sure you want to remove this faculty profile?
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
