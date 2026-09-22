import { useState, useEffect } from 'react';
import { Student, AttendanceRecord } from '../../types';
import {
  fetchAdminStudents,
  fetchAdminAttendance,
  markBatchAttendance,
} from '../../services/storageService';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Save,
  Check,
  Users,
} from 'lucide-react';

interface AdminAttendanceTabProps {
  onDataChange: () => void;
}

export function AdminAttendanceTab({ onDataChange }: AdminAttendanceTabProps) {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedClass, setSelectedClass] = useState('Class 10');
  const [selectedSection, setSelectedSection] = useState('A');

  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceState, setAttendanceState] = useState<
    Record<string, { status: 'present' | 'absent' | 'late' | 'excused'; remarks: string }>
  >({});

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Load students for this class and any existing records for the date
  const loadClassAttendance = async () => {
    setIsLoading(true);
    setSaveSuccess(false);
    setSaveError(null);

    const [classStudents, dayRecords] = await Promise.all([
      fetchAdminStudents(selectedClass),
      fetchAdminAttendance(selectedDate, selectedClass),
    ]);

    // Filter by section if available
    const filteredStudents = classStudents.filter(
      (s) => !selectedSection || s.section === selectedSection
    );
    setStudents(filteredStudents);

    // Populate current attendance state
    const stateMap: Record<string, { status: 'present' | 'absent' | 'late' | 'excused'; remarks: string }> = {};
    filteredStudents.forEach((s) => {
      const existing = dayRecords.find((r) => r.studentId === s.id || r.studentId === s.studentId);
      stateMap[s.id] = {
        status: (existing?.status as any) || 'present',
        remarks: existing?.remarks || '',
      };
    });

    setAttendanceState(stateMap);
    setIsLoading(false);
  };

  useEffect(() => {
    loadClassAttendance();
  }, [selectedDate, selectedClass, selectedSection]);

  const handleStatusChange = (studentId: string, status: 'present' | 'absent' | 'late' | 'excused') => {
    setAttendanceState((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setAttendanceState((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks,
      },
    }));
  };

  const handleMarkAll = (status: 'present' | 'absent') => {
    setAttendanceState((prev) => {
      const updated = { ...prev };
      students.forEach((s) => {
        updated[s.id] = {
          ...updated[s.id],
          status,
        };
      });
      return updated;
    });
  };

  const handleSaveAttendance = async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    const records = students.map((s) => ({
      studentId: s.id,
      status: attendanceState[s.id]?.status || 'present',
      remarks: attendanceState[s.id]?.remarks || '',
    }));

    const ok = await markBatchAttendance(selectedDate, records);
    setIsSaving(false);

    if (ok) {
      setSaveSuccess(true);
      onDataChange();
      setTimeout(() => setSaveSuccess(false), 3000);
    } else {
      setSaveError('Failed to record attendance. Please try again.');
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

  const presentCount = Object.values(attendanceState).filter((v) => v.status === 'present').length;
  const absentCount = Object.values(attendanceState).filter((v) => v.status === 'absent').length;
  const lateCount = Object.values(attendanceState).filter((v) => v.status === 'late').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-serif text-slate-900">Daily Attendance Register</h2>
          <p className="text-xs text-slate-500 mt-1">
            Mark, review, and persist roll-call attendance for classes and student cohorts
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleMarkAll('present')}
            className="px-3 py-2 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-bold transition"
          >
            Mark All Present
          </button>
          <button
            onClick={() => handleMarkAll('absent')}
            className="px-3 py-2 bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-bold transition"
          >
            Mark All Absent
          </button>
          <button
            onClick={handleSaveAttendance}
            disabled={isSaving || students.length === 0}
            className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center space-x-1.5 transition disabled:opacity-60 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save Register'}</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center space-x-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Attendance register recorded and synchronized successfully!</span>
        </div>
      )}

      {saveError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Selector Strip */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Attendance Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Class</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
          >
            {classesList.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Section</label>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
          >
            <option value="A">Section A</option>
            <option value="B">Section B</option>
            <option value="C">Section C</option>
          </select>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 text-xs">
        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between">
          <span className="font-semibold text-emerald-800">Present</span>
          <span className="text-base font-extrabold text-emerald-900">{presentCount}</span>
        </div>
        <div className="p-3 bg-rose-50 rounded-xl border border-rose-100 flex items-center justify-between">
          <span className="font-semibold text-rose-800">Absent</span>
          <span className="text-base font-extrabold text-rose-900">{absentCount}</span>
        </div>
        <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-center justify-between">
          <span className="font-semibold text-amber-800">Late</span>
          <span className="text-base font-extrabold text-amber-900">{lateCount}</span>
        </div>
      </div>

      {/* Attendance Register Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-xs text-slate-500">Loading student roll call...</div>
        ) : students.length === 0 ? (
          <div className="p-10 text-center text-slate-500 text-xs">
            No students currently enrolled in {selectedClass} - Section {selectedSection}. Please enroll students in the Student Directory.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <th className="py-3 px-4 w-16">Roll</th>
                  <th className="py-3 px-4">Student ID</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Attendance Status</th>
                  <th className="py-3 px-4">Remarks (Optional)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((stu) => {
                  const currentStatus = attendanceState[stu.id]?.status || 'present';
                  const currentRemarks = attendanceState[stu.id]?.remarks || '';

                  return (
                    <tr key={stu.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">{stu.rollNo}</td>
                      <td className="py-3 px-4 font-mono text-slate-500">{stu.studentId}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{stu.name}</div>
                        <div className="text-[11px] text-slate-400">Parent: {stu.parentName}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="inline-flex rounded-lg p-0.5 bg-slate-100 border border-slate-200 space-x-1">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(stu.id, 'present')}
                            className={`px-3 py-1 rounded-md font-bold text-[11px] transition ${
                              currentStatus === 'present'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-emerald-700'
                            }`}
                          >
                            Present
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(stu.id, 'absent')}
                            className={`px-3 py-1 rounded-md font-bold text-[11px] transition ${
                              currentStatus === 'absent'
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-rose-700'
                            }`}
                          >
                            Absent
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(stu.id, 'late')}
                            className={`px-3 py-1 rounded-md font-bold text-[11px] transition ${
                              currentStatus === 'late'
                                ? 'bg-amber-500 text-white shadow-xs'
                                : 'text-slate-600 hover:text-amber-700'
                            }`}
                          >
                            Late
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(stu.id, 'excused')}
                            className={`px-3 py-1 rounded-md font-bold text-[11px] transition ${
                              currentStatus === 'excused'
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-blue-700'
                            }`}
                          >
                            Excused
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={currentRemarks}
                          onChange={(e) => handleRemarksChange(stu.id, e.target.value)}
                          placeholder="e.g. Fever, Medical leave"
                          className="w-full p-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-600 focus:bg-white focus:outline-none"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
