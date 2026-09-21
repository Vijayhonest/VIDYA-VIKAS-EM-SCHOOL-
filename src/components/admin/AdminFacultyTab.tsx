import { useState } from 'react';
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
} from 'lucide-react';
import { FacultyMember } from '../../types';
import { saveFaculty, deleteFaculty, toggleFacultyActive } from '../../services/storageService';
import { useToast } from '../common/Toast';

interface AdminFacultyTabProps {
  faculty: FacultyMember[];
  onDataChange: () => void;
}

export function AdminFacultyTab({ faculty, onDataChange }: AdminFacultyTabProps) {
  const { showToast } = useToast();
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
    isActive: true,
    isLeadership: false,
  });

  const sortedFaculty = [...faculty].sort((a, b) => (a.displayOrder || 99) - (b.displayOrder || 99));

  const filtered = sortedFaculty.filter((f) => {
    const q = searchTerm.toLowerCase();
    const matches =
      f.name.toLowerCase().includes(q) ||
      f.designation.toLowerCase().includes(q) ||
      (f.subject && f.subject.toLowerCase().includes(q)) ||
      f.department.toLowerCase().includes(q);

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
      qualification: 'B.Ed / Graduate',
      experience: '3+ Years',
      shortProfile: '',
      photoUrl: '/faculty-placeholder.jpg',
      displayOrder: faculty.length + 1,
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-heading flex items-center gap-2">
            <span>Faculty & Staff Directory</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 font-bold">
              {filtered.length}
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage teacher profiles, designations, subject specializations, and display sequence.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 rounded-xl bg-blue-950 hover:bg-blue-900 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Staff Member</span>
        </button>
      </div>

      <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by teacher name or subject..."
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

      {filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-800">No Faculty Found</h4>
          <p className="text-xs text-slate-400 mt-1">No staff members match the current filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((member) => {
            const isActive = member.isActive !== false;
            return (
              <div
                key={member.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {member.department}
                      </span>
                      {member.isLeadership && (
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200">
                          Head
                        </span>
                      )}
                      {member.isDemo && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-200 font-semibold">
                          Sample
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-slate-400 font-mono">#{member.displayOrder || 1}</span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                      >
                        {isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">{member.name}</h3>
                    <p className="text-xs font-semibold text-amber-700">{member.designation}</p>
                    {member.subject && (
                      <p className="text-xs font-medium text-blue-900">Subject: {member.subject}</p>
                    )}
                    <p className="text-xs text-slate-500">{member.qualification}</p>
                  </div>

                  {member.shortProfile && (
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{member.shortProfile}</p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400">{member.experience} Exp</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleActive(member.id)}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                      }`}
                      title={isActive ? 'Deactivate staff profile' : 'Activate staff profile'}
                    >
                      {isActive ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => handleOpenEdit(member)}
                      className="p-1.5 rounded-lg text-blue-900 hover:bg-blue-50 border border-slate-200"
                      title="Edit Staff Member"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(member.id)}
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-slate-200"
                      title="Delete Staff Record"
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

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setModalOpen(false)} />
          <div className="relative z-10 w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-blue-950 text-white p-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                  Educator Profile
                </span>
                <h3 className="text-lg font-bold font-heading text-white">
                  {editingMember ? 'Edit Staff Member' : 'Add Staff Member'}
                </h3>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-1.5 text-slate-400 hover:text-white rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Teacher / Staff Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Smt. K. Ratnamala / Sri P. Ramesh"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-900/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Designation</label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Mathematics Teacher / Primary In-Charge"
                    value={form.designation}
                    onChange={(e) => setForm({ ...form, designation: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Subject Specialization</label>
                  <input
                    type="text"
                    placeholder="e.g. Physical Sciences, Telugu, English"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                    <option value="Physical Education">Physical Education</option>
                    <option value="Primary Wing">Primary Wing</option>
                    <option value="Leadership">Leadership & Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Display Sequence Order</label>
                  <input
                    type="number"
                    min={1}
                    value={form.displayOrder}
                    onChange={(e) => setForm({ ...form, displayOrder: parseInt(e.target.value, 10) || 1 })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Qualifications</label>
                  <input
                    type="text"
                    placeholder="e.g. M.Sc, B.Ed"
                    value={form.qualification}
                    onChange={(e) => setForm({ ...form, qualification: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Teaching Experience</label>
                  <input
                    type="text"
                    placeholder="e.g. 8+ Years"
                    value={form.experience}
                    onChange={(e) => setForm({ ...form, experience: e.target.value })}
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
