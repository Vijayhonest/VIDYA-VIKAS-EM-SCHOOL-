import { useState, useEffect } from 'react';
import { Student } from '../../types';
import {
  fetchAdminStudents,
  createStudent,
  updateStudent,
  deleteStudent,
} from '../../services/storageService';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  X,
  Phone,
  GraduationCap,
  Eye,
  EyeOff,
  Key,
} from 'lucide-react';

interface AdminStudentsTabProps {
  onDataChange: () => void;
}

export function AdminStudentsTab({ onDataChange }: AdminStudentsTabProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    class: 'Class 10',
    section: 'A',
    rollNo: '',
    admissionNo: '',
    dob: '',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    bloodGroup: 'O+',
    parentName: '',
    parentPhone: '',
    address: 'Kotauratla, Anakapalle',
    password: '',
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const generateSecurePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
    let res = '';
    for (let i = 0; i < 8; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, password: res }));
    setShowPassword(true);
  };

  const loadStudents = async () => {
    setIsLoading(true);
    const data = await fetchAdminStudents(selectedClass, searchQuery);
    setStudents(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadStudents();
  }, [selectedClass]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadStudents();
  };

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFormData({
      name: '',
      class: selectedClass !== 'all' ? selectedClass : 'Class 10',
      section: 'A',
      rollNo: '',
      admissionNo: `VV-ADM-${Math.floor(1000 + Math.random() * 9000)}`,
      dob: '2012-05-15',
      gender: 'Male',
      bloodGroup: 'O+',
      parentName: '',
      parentPhone: '',
      address: 'Kotauratla, Anakapalle',
      password: '',
    });
    setFormError(null);
    setFormSuccess(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (stu: Student) => {
    setEditingStudent(stu);
    setFormData({
      name: stu.name,
      class: stu.class,
      section: stu.section,
      rollNo: stu.rollNo,
      admissionNo: stu.admissionNo,
      dob: stu.dob || '',
      gender: stu.gender || 'Male',
      bloodGroup: stu.bloodGroup || 'O+',
      parentName: stu.parentName,
      parentPhone: stu.parentPhone,
      address: stu.address || '',
      password: '',
    });
    setFormError(null);
    setFormSuccess(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove student "${name}"?`)) return;
    const ok = await deleteStudent(id);
    if (ok) {
      loadStudents();
      onDataChange();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.parentPhone.trim()) {
      setFormError('Please fill student name and parent contact phone.');
      return;
    }

    if (!editingStudent && (!formData.password || formData.password.length < 6)) {
      setFormError('Please provide an initial student password of at least 6 characters, or click Auto-Generate.');
      return;
    }

    if (editingStudent && formData.password && formData.password.length < 6) {
      setFormError('New password must be at least 6 characters.');
      return;
    }

    setIsSaving(true);
    setFormError(null);

    if (editingStudent) {
      const updated = await updateStudent(editingStudent.id, {
        name: formData.name.trim(),
        class: formData.class,
        section: formData.section,
        rollNo: formData.rollNo.trim(),
        admissionNo: formData.admissionNo.trim(),
        dob: formData.dob,
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        parentName: formData.parentName.trim(),
        parentPhone: formData.parentPhone.trim(),
        address: formData.address.trim(),
        ...(formData.password ? { password: formData.password } : {}),
      });

      setIsSaving(false);
      if (updated) {
        setFormSuccess('Student profile updated successfully!');
        setTimeout(() => {
          setIsModalOpen(false);
          loadStudents();
          onDataChange();
        }, 1000);
      } else {
        setFormError('Failed to update student profile.');
      }
    } else {
      const created = await createStudent({
        name: formData.name.trim(),
        class: formData.class,
        section: formData.section,
        rollNo: formData.rollNo.trim() || '1',
        admissionNo: formData.admissionNo.trim(),
        dob: formData.dob,
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        parentName: formData.parentName.trim() || 'Guardian',
        parentPhone: formData.parentPhone.trim(),
        address: formData.address.trim(),
        password: formData.password,
      });

      setIsSaving(false);
      if (created) {
        setFormSuccess('Student enrolled and registered successfully!');
        setTimeout(() => {
          setIsModalOpen(false);
          loadStudents();
          onDataChange();
        }, 1000);
      } else {
        setFormError('Failed to enroll student.');
      }
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

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold font-serif text-slate-900">Student Enrollment Directory</h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900">
              {students.length} Students
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage student records, admission credentials, parent links, and class assignments
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center space-x-2 transition cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Enroll New Student</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <form onSubmit={handleSearch} className="flex items-center space-x-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, student ID, or admission no..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold hover:bg-slate-700 transition"
          >
            Search
          </button>
        </form>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-semibold text-slate-600">Filter Class:</span>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
          >
            <option value="all">All Classes</option>
            {classesList.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Student List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading student directory...</div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No students found matching current filters. Click "Enroll New Student" to add a student.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <th className="py-3 px-4">Student ID / Adm No</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Class & Sec</th>
                  <th className="py-3 px-4">Roll No</th>
                  <th className="py-3 px-4">Parent / Guardian</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((stu) => (
                  <tr key={stu.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-mono font-medium text-blue-900">
                      <div>{stu.studentId}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{stu.admissionNo}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{stu.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {stu.gender} • {stu.bloodGroup || 'Blood Grp N/A'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                        {stu.class} - {stu.section}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-700">{stu.rollNo}</td>
                    <td className="py-3 px-4 text-slate-800 font-medium">{stu.parentName}</td>
                    <td className="py-3 px-4 text-slate-600 font-mono flex items-center space-x-1 pt-3.5">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{stu.parentPhone}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        stu.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {stu.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => handleOpenEdit(stu)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-blue-900 hover:bg-slate-100 transition"
                          title="Edit Student"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(stu.id, stu.name)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Delete Student"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Enroll / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold font-serif text-slate-900">
                {editingStudent ? `Edit Student: ${editingStudent.name}` : 'Enroll New Student'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 my-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="p-3 my-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 pt-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Student Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Rajamandrau Harsha"
                    required
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Admission Number *</label>
                  <input
                    type="text"
                    value={formData.admissionNo}
                    onChange={(e) => setFormData({ ...formData, admissionNo: e.target.value })}
                    required
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Class *</label>
                  <select
                    value={formData.class}
                    onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none font-medium"
                  >
                    {classesList.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Section *</label>
                    <select
                      value={formData.section}
                      onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none font-medium"
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Roll No *</label>
                    <input
                      type="text"
                      value={formData.rollNo}
                      onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                      placeholder="e.g. 15"
                      required
                      className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Blood Group</label>
                    <input
                      type="text"
                      value={formData.bloodGroup}
                      onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                      placeholder="e.g. O+, B+"
                      className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Parent / Guardian Name *</label>
                  <input
                    type="text"
                    value={formData.parentName}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    placeholder="e.g. Rajamandrau Venkatesh"
                    required
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Parent Mobile Number *</label>
                  <input
                    type="tel"
                    value={formData.parentPhone}
                    onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                    placeholder="e.g. 9441971531"
                    required
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Residential Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Village / Town, Mandal, District"
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-slate-700 text-sm">
                      {editingStudent ? 'Reset Portal Password (leave empty to keep unchanged)' : 'Initial Portal Password (min 6 characters)'}
                    </label>
                    <button
                      type="button"
                      onClick={generateSecurePassword}
                      className="text-xs font-semibold text-blue-800 hover:text-blue-950 flex items-center gap-1 cursor-pointer"
                    >
                      <Key className="w-3.5 h-3.5" />
                      <span>Auto-Generate</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder={editingStudent ? 'Enter new password if updating' : 'Enter secure password or click Auto-Generate'}
                      className="w-full p-2.5 pr-10 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Student can log in using either their generated Student ID or Admission Number with this password.
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
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
                  {isSaving ? 'Saving...' : editingStudent ? 'Save Changes' : 'Enroll Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
