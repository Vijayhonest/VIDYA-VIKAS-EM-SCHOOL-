import { useState, useEffect } from 'react';
import { Exam, ExamResult, Student } from '../../types';
import {
  fetchAdminExams,
  createExam,
  fetchAdminResults,
  saveExamResult,
  deleteExamResult,
  fetchAdminStudents,
} from '../../services/storageService';
import {
  Award,
  Plus,
  Trash2,
  Calendar,
  X,
  AlertCircle,
  CheckCircle,
  FileCheck,
  User,
} from 'lucide-react';

interface AdminResultsTabProps {
  onDataChange: () => void;
}

export function AdminResultsTab({ onDataChange }: AdminResultsTabProps) {
  const [exams, setExams] = useState<Exam[]>([]);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filter
  const [selectedExamId, setSelectedExamId] = useState<string>('all');

  // New Exam Modal
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [examForm, setExamForm] = useState({
    name: '',
    academicYear: '2026–2027',
    startDate: '',
    endDate: '',
  });

  // Record Result Modal
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [resultForm, setResultForm] = useState({
    examId: '',
    examName: '',
    studentId: '',
    studentName: '',
    class: 'Class 10',
    section: 'A',
    rollNo: '',
    admissionNo: '',
    academicYear: '2026–2027',
    remarks: 'Consistent academic performance. Keep up the good work.',
    subjects: [
      { subject: 'Telugu', marksObtained: 88, maxMarks: 100, grade: 'A+' },
      { subject: 'Hindi', marksObtained: 82, maxMarks: 100, grade: 'A' },
      { subject: 'English', marksObtained: 85, maxMarks: 100, grade: 'A' },
      { subject: 'Mathematics', marksObtained: 92, maxMarks: 100, grade: 'A+' },
      { subject: 'Physical Science', marksObtained: 80, maxMarks: 100, grade: 'A' },
      { subject: 'Biological Science', marksObtained: 84, maxMarks: 100, grade: 'A' },
      { subject: 'Social Studies', marksObtained: 86, maxMarks: 100, grade: 'A' },
    ],
  });

  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadAll = async () => {
    setIsLoading(true);
    const [exList, resList, stuList] = await Promise.all([
      fetchAdminExams(),
      fetchAdminResults(),
      fetchAdminStudents(),
    ]);
    setExams(exList);
    setResults(resList);
    setStudents(stuList);
    if (exList.length > 0 && selectedExamId === 'all') {
      setSelectedExamId('all');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleOpenNewExam = () => {
    setExamForm({
      name: '',
      academicYear: '2026–2027',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
    });
    setFormError(null);
    setIsExamModalOpen(true);
  };

  const handleSaveExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examForm.name.trim() || !examForm.startDate) {
      setFormError('Please fill exam title and start date.');
      return;
    }

    setIsSaving(true);
    setFormError(null);
    const created = await createExam({
      name: examForm.name.trim(),
      academicYear: examForm.academicYear,
      classes: ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'],
      startDate: examForm.startDate,
      endDate: examForm.endDate || examForm.startDate,
      status: 'upcoming',
    });

    setIsSaving(false);
    if (created) {
      setIsExamModalOpen(false);
      loadAll();
      onDataChange();
    } else {
      setFormError('Failed to create examination.');
    }
  };

  const handleOpenRecordResult = () => {
    if (exams.length === 0) {
      alert('Please create at least one Examination first.');
      return;
    }
    const defaultExam = exams[0];
    const defaultStudent = students[0];

    setResultForm({
      examId: defaultExam.id,
      examName: defaultExam.name,
      studentId: defaultStudent ? defaultStudent.id : '',
      studentName: defaultStudent ? defaultStudent.name : '',
      class: defaultStudent ? defaultStudent.class : 'Class 10',
      section: defaultStudent ? defaultStudent.section : 'A',
      rollNo: defaultStudent ? defaultStudent.rollNo : '1',
      admissionNo: defaultStudent ? defaultStudent.admissionNo : '',
      academicYear: defaultExam.academicYear,
      remarks: 'Good performance. Keep up the dedication.',
      subjects: [
        { subject: 'Telugu', marksObtained: 85, maxMarks: 100, grade: 'A' },
        { subject: 'Hindi', marksObtained: 80, maxMarks: 100, grade: 'A' },
        { subject: 'English', marksObtained: 85, maxMarks: 100, grade: 'A' },
        { subject: 'Mathematics', marksObtained: 90, maxMarks: 100, grade: 'A+' },
        { subject: 'Science', marksObtained: 84, maxMarks: 100, grade: 'A' },
        { subject: 'Social Studies', marksObtained: 86, maxMarks: 100, grade: 'A' },
      ],
    });
    setFormError(null);
    setIsResultModalOpen(true);
  };

  const handleStudentSelectInForm = (studentId: string) => {
    const stu = students.find((s) => s.id === studentId);
    if (!stu) return;
    setResultForm((prev) => ({
      ...prev,
      studentId: stu.id,
      studentName: stu.name,
      class: stu.class,
      section: stu.section,
      rollNo: stu.rollNo,
      admissionNo: stu.admissionNo,
    }));
  };

  const handleSubjectMarkChange = (index: number, marks: number) => {
    const updated = [...resultForm.subjects];
    const max = updated[index].maxMarks || 100;
    const clamped = Math.max(0, Math.min(max, marks));
    const pct = (clamped / max) * 100;
    let grade = 'F';
    if (pct >= 90) grade = 'A+';
    else if (pct >= 80) grade = 'A';
    else if (pct >= 70) grade = 'B+';
    else if (pct >= 60) grade = 'B';
    else if (pct >= 50) grade = 'C';
    else if (pct >= 35) grade = 'D';

    updated[index] = {
      ...updated[index],
      marksObtained: clamped,
      grade,
    };
    setResultForm({ ...resultForm, subjects: updated });
  };

  const handleSaveResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resultForm.studentId || !resultForm.examId) {
      setFormError('Please select both an examination and student.');
      return;
    }

    const totalMarks = resultForm.subjects.reduce((sum, s) => sum + s.marksObtained, 0);
    const totalMax = resultForm.subjects.reduce((sum, s) => sum + s.maxMarks, 0);
    const percentage = totalMax > 0 ? Number(((totalMarks / totalMax) * 100).toFixed(1)) : 0;
    const isPassed = !resultForm.subjects.some((s) => s.marksObtained < s.maxMarks * 0.35);

    let overallGrade = 'F';
    if (percentage >= 90) overallGrade = 'A+';
    else if (percentage >= 80) overallGrade = 'A';
    else if (percentage >= 70) overallGrade = 'B+';
    else if (percentage >= 60) overallGrade = 'B';
    else if (percentage >= 50) overallGrade = 'C';
    else if (percentage >= 35) overallGrade = 'D';

    setIsSaving(true);
    setFormError(null);

    const saved = await saveExamResult({
      examId: resultForm.examId,
      examName: resultForm.examName,
      studentId: resultForm.studentId,
      studentName: resultForm.studentName,
      class: resultForm.class,
      section: resultForm.section,
      rollNo: resultForm.rollNo,
      admissionNo: resultForm.admissionNo,
      academicYear: resultForm.academicYear,
      subjects: resultForm.subjects,
      totalMarks,
      totalMaxMarks: totalMax,
      percentage,
      overallGrade,
      status: isPassed ? 'pass' : 'fail',
      remarks: resultForm.remarks,
    });

    setIsSaving(false);
    if (saved) {
      setIsResultModalOpen(false);
      loadAll();
      onDataChange();
    } else {
      setFormError('Failed to record student marks.');
    }
  };

  const handleDeleteResult = async (id: string, name: string) => {
    if (!window.confirm(`Delete marksheet for ${name}?`)) return;
    const ok = await deleteExamResult(id);
    if (ok) {
      loadAll();
      onDataChange();
    }
  };

  const filteredResults = selectedExamId === 'all'
    ? results
    : results.filter((r) => r.examId === selectedExamId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold font-serif text-slate-900">Examinations & Marksheets</h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900">
              {exams.length} Exams • {results.length} Marksheets
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Conduct terms and publish official marks, percentage, and teacher evaluation comments
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleOpenNewExam}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition cursor-pointer"
          >
            + Create Exam Term
          </button>
          <button
            onClick={handleOpenRecordResult}
            className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center space-x-1.5 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Record Student Marks</span>
          </button>
        </div>
      </div>

      {/* Filter by Exam */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-3">
        <span className="text-xs font-semibold text-slate-600">Filter Exam:</span>
        <select
          value={selectedExamId}
          onChange={(e) => setSelectedExamId(e.target.value)}
          className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
        >
          <option value="all">All Examinations</option>
          {exams.map((ex) => (
            <option key={ex.id} value={ex.id}>
              {ex.name} ({ex.academicYear})
            </option>
          ))}
        </select>
      </div>

      {/* Results List */}
      {isLoading ? (
        <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
          Loading marksheets...
        </div>
      ) : filteredResults.length === 0 ? (
        <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center text-slate-500 text-xs">
          No marksheets recorded for this selection. Click "Record Student Marks" to publish a marksheet.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredResults.map((res) => (
            <div key={res.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
                    {res.examName}
                  </span>
                  <h3 className="text-base font-bold text-slate-900">
                    {res.studentName} ({res.class} - {res.section})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Roll No: {res.rollNo} • Adm No: {res.admissionNo} • Year: {res.academicYear}
                  </p>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-2xl font-black text-blue-900">{res.percentage}%</div>
                    <span className="text-xs font-bold text-emerald-700 uppercase">
                      Grade: {res.overallGrade} ({res.status})
                    </span>
                  </div>

                  <button
                    onClick={() => handleDeleteResult(res.id, res.studentName)}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                    title="Delete Marksheet"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Subject Breakdown preview */}
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-xs">
                {res.subjects.map((sub, idx) => (
                  <div key={idx} className="p-2 bg-slate-50 rounded-lg border border-slate-100 text-center">
                    <div className="font-semibold text-slate-700 truncate" title={sub.subject}>
                      {sub.subject}
                    </div>
                    <div className="text-sm font-bold text-slate-900 mt-0.5">
                      {sub.marksObtained}/{sub.maxMarks}
                    </div>
                    <div className="text-[10px] font-bold text-blue-700 mt-0.5">{sub.grade}</div>
                  </div>
                ))}
              </div>

              {res.remarks && (
                <div className="mt-3 text-xs text-slate-600 bg-blue-50/50 p-2.5 rounded-xl border border-blue-100/60">
                  <strong>Remarks:</strong> {res.remarks}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Exam Modal */}
      {isExamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold font-serif text-slate-900">Create Exam Term</h3>
              <button onClick={() => setIsExamModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 my-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveExam} className="space-y-3 pt-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Examination Name *</label>
                <input
                  type="text"
                  value={examForm.name}
                  onChange={(e) => setExamForm({ ...examForm, name: e.target.value })}
                  placeholder="e.g. Quarterly Examination 2026"
                  required
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Academic Year</label>
                <input
                  type="text"
                  value={examForm.academicYear}
                  onChange={(e) => setExamForm({ ...examForm, academicYear: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    value={examForm.startDate}
                    onChange={(e) => setExamForm({ ...examForm, startDate: e.target.value })}
                    required
                    className="w-full p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={examForm.endDate}
                    onChange={(e) => setExamForm({ ...examForm, endDate: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsExamModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 font-semibold bg-blue-900 hover:bg-blue-800 text-white rounded-xl shadow-xs transition disabled:opacity-70"
                >
                  {isSaving ? 'Creating...' : 'Create Exam'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Marks Modal */}
      {isResultModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold font-serif text-slate-900">Record Student Marksheet</h3>
              <button onClick={() => setIsResultModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 my-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveResult} className="space-y-4 pt-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Select Examination *</label>
                  <select
                    value={resultForm.examId}
                    onChange={(e) => {
                      const ex = exams.find((x) => x.id === e.target.value);
                      if (ex) {
                        setResultForm({
                          ...resultForm,
                          examId: ex.id,
                          examName: ex.name,
                          academicYear: ex.academicYear,
                        });
                      }
                    }}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none font-medium"
                  >
                    {exams.map((ex) => (
                      <option key={ex.id} value={ex.id}>
                        {ex.name} ({ex.academicYear})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Select Student *</label>
                  <select
                    value={resultForm.studentId}
                    onChange={(e) => handleStudentSelectInForm(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none font-medium"
                  >
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.class}-{s.section}, Roll: {s.rollNo})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Subject Marks Input */}
              <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50">
                <div className="font-bold text-slate-800 mb-2">Subject Marks Entry (Out of Max Marks)</div>
                <div className="space-y-2">
                  {resultForm.subjects.map((sub, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-3 bg-white p-2 rounded-lg border border-slate-200">
                      <span className="font-semibold text-slate-800 w-36">{sub.subject}</span>
                      <div className="flex items-center space-x-2">
                        <label className="text-slate-500 text-[11px]">Marks:</label>
                        <input
                          type="number"
                          min={0}
                          max={sub.maxMarks}
                          value={sub.marksObtained}
                          onChange={(e) => handleSubjectMarkChange(idx, Number(e.target.value))}
                          className="w-16 p-1 border border-slate-200 rounded text-center font-bold text-slate-900"
                        />
                        <span className="text-slate-400">/ {sub.maxMarks}</span>
                        <span className="w-8 text-center font-bold text-blue-700">{sub.grade}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Teacher Remarks</label>
                <input
                  type="text"
                  value={resultForm.remarks}
                  onChange={(e) => setResultForm({ ...resultForm, remarks: e.target.value })}
                  placeholder="e.g. Good performance in sciences. Needs improvement in Hindi."
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsResultModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 font-semibold bg-blue-900 hover:bg-blue-800 text-white rounded-xl shadow-xs transition disabled:opacity-70"
                >
                  {isSaving ? 'Saving...' : 'Save & Publish Marksheet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
