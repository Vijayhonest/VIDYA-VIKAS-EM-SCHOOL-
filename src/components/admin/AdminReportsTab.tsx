import { useState, useEffect } from 'react';
import {
  BarChart3,
  FileSpreadsheet,
  Printer,
  Download,
  Calendar,
  CheckCircle2,
  Users,
  GraduationCap,
  IndianRupee,
  BookOpen,
  FileCheck,
  TrendingUp,
  Filter,
} from 'lucide-react';
import {
  fetchReportsSummary,
  fetchAdminStudents,
  fetchAdminAttendance,
  fetchAdminFees,
  fetchAdminExams,
  fetchAdminResults,
  fetchAdminHomework,
  getAdmissionEnquiries as getAdmissions,
} from '../../services/storageService';
import { useToast } from '../common/Toast';

type ReportType = 'attendance' | 'academic' | 'fee' | 'homework' | 'admissions';

export function AdminReportsTab() {
  const { showToast } = useToast();
  const [activeReport, setActiveReport] = useState<ReportType>('attendance');
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);

  // Raw data for export tables
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [fees, setFees] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [homework, setHomework] = useState<any[]>([]);
  const [admissions, setAdmissions] = useState<any[]>([]);

  useEffect(() => {
    loadAllReportData();
  }, []);

  const loadAllReportData = async () => {
    setIsLoading(true);
    try {
      const [sum, stu, att, f, ex, res, hw, adm] = await Promise.all([
        fetchReportsSummary(),
        fetchAdminStudents(),
        fetchAdminAttendance(),
        fetchAdminFees(),
        fetchAdminExams(),
        fetchAdminResults(),
        fetchAdminHomework(),
        getAdmissions(),
      ]);
      setSummary(sum);
      setStudents(stu);
      setAttendance(att);
      setFees(f);
      setExams(ex);
      setResults(res);
      setHomework(hw);
      setAdmissions(adm);
    } catch (err) {
      console.error('Error loading reports:', err);
      showToast('Failed to load reports summary.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // CSV Exporter helper
  const exportToCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((val) => `"${val}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${filename}.csv`, 'success');
  };

  const handleExportCurrent = () => {
    if (activeReport === 'attendance') {
      const headers = ['Date', 'Student ID', 'Student Name', 'Class', 'Section', 'Status', 'Remarks'];
      const rows = attendance.map((a) => [
        a.date,
        a.studentId,
        a.studentName,
        a.class,
        a.section,
        a.status,
        a.remarks || '',
      ]);
      exportToCSV('VidyaVikas_Attendance_Report', headers, rows);
    } else if (activeReport === 'academic') {
      const headers = ['Student ID', 'Student Name', 'Class', 'Exam ID', 'Total Marks', 'Max Marks', 'Percentage', 'Grade', 'Status'];
      const rows = results.map((r) => [
        r.studentId,
        r.studentName,
        r.class,
        r.examId,
        r.totalMarks,
        r.maxMarks,
        `${r.percentage}%`,
        r.grade,
        r.status,
      ]);
      exportToCSV('VidyaVikas_Academic_Report', headers, rows);
    } else if (activeReport === 'fee') {
      const headers = ['Student ID', 'Student Name', 'Class', 'Section', 'Total Fee', 'Discount', 'Paid', 'Due', 'Status', 'Due Date'];
      const rows = fees.map((f) => [
        f.studentId,
        f.studentName,
        f.class,
        f.section,
        f.totalFee,
        f.discount,
        f.paidAmount,
        f.dueAmount,
        f.status,
        f.dueDate || '',
      ]);
      exportToCSV('VidyaVikas_Fee_Collection_Report', headers, rows);
    } else if (activeReport === 'homework') {
      const headers = ['Title', 'Class', 'Section', 'Subject', 'Assigned Date', 'Due Date', 'Status'];
      const rows = homework.map((h) => [
        h.title,
        h.class,
        h.section,
        h.subject,
        h.assignedDate,
        h.dueDate,
        h.status,
      ]);
      exportToCSV('VidyaVikas_Homework_Report', headers, rows);
    } else if (activeReport === 'admissions') {
      const headers = ['Applicant Name', 'Applying For', 'Parent Name', 'Phone', 'Mandal', 'Status', 'Date'];
      const rows = admissions.map((a) => [
        a.studentName,
        a.classApplying,
        a.parentName,
        a.phone,
        a.mandal || '',
        a.status,
        a.createdAt,
      ]);
      exportToCSV('VidyaVikas_Admissions_Report', headers, rows);
    }
  };

  const printReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold font-serif text-blue-950 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-amber-500" />
            <span>Institutional Reports & Analytical Exports</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Generate and export verified summaries for Attendance, Academics, Dues, Homework, and Admissions for Kotauratla campus.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={printReport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
          <button
            onClick={handleExportCurrent}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition"
          >
            <Download className="w-4 h-4 text-emerald-200" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Report Switcher Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveReport('attendance')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeReport === 'attendance'
              ? 'bg-blue-950 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          Attendance Report ({attendance.length})
        </button>
        <button
          onClick={() => setActiveReport('academic')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeReport === 'academic'
              ? 'bg-blue-950 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          Academic Report ({results.length})
        </button>
        <button
          onClick={() => setActiveReport('fee')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeReport === 'fee'
              ? 'bg-blue-950 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          Fee Collection ({fees.length})
        </button>
        <button
          onClick={() => setActiveReport('homework')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeReport === 'homework'
              ? 'bg-blue-950 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          Homework Tracking ({homework.length})
        </button>
        <button
          onClick={() => setActiveReport('admissions')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeReport === 'admissions'
              ? 'bg-blue-950 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          Admissions Pipeline ({admissions.length})
        </button>
      </div>

      {/* REPORT CONTENT: Attendance */}
      {activeReport === 'attendance' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <div className="text-xs text-slate-500 font-semibold uppercase">Overall Attendance</div>
              <div className="text-2xl font-bold text-blue-950 mt-1">
                {summary?.attendance?.percentage || 0}%
              </div>
              <div className="text-xs text-emerald-600 font-medium mt-0.5">
                {summary?.attendance?.present || 0} presents recorded
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <div className="text-xs text-slate-500 font-semibold uppercase">Total Marked Days/Records</div>
              <div className="text-2xl font-bold text-slate-800 mt-1">
                {attendance.length}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">Daily roll call logs</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <div className="text-xs text-slate-500 font-semibold uppercase">Active Student Cohort</div>
              <div className="text-2xl font-bold text-slate-800 mt-1">
                {students.length}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">Kotauratla campus</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-800">
              Detailed Attendance Log ({attendance.length} entries)
            </div>
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-600 font-semibold sticky top-0">
                  <tr>
                    <th className="py-2.5 px-4">Date</th>
                    <th className="py-2.5 px-4">Student</th>
                    <th className="py-2.5 px-4">Class & Sec</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {attendance.slice(0, 50).map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50">
                      <td className="py-2 px-4 font-mono text-slate-500">{a.date}</td>
                      <td className="py-2 px-4 font-medium text-slate-900">{a.studentName}</td>
                      <td className="py-2 px-4">{a.class} - {a.section}</td>
                      <td className="py-2 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            a.status === 'present'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {a.status}
                        </span>
                      </td>
                      <td className="py-2 px-4 text-slate-400">{a.remarks || '—'}</td>
                    </tr>
                  ))}
                  {attendance.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        No attendance records found. Use the Attendance tab to record roll calls.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* REPORT CONTENT: Academic */}
      {activeReport === 'academic' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <div className="text-xs text-slate-500 font-semibold uppercase">Overall Exam Pass Rate</div>
              <div className="text-2xl font-bold text-emerald-700 mt-1">
                {summary?.academics?.passRate || 0}%
              </div>
              <div className="text-xs text-slate-400 mt-0.5">Across published examinations</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <div className="text-xs text-slate-500 font-semibold uppercase">Total Published Results</div>
              <div className="text-2xl font-bold text-slate-800 mt-1">
                {results.length}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">Student subject marksheets</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <div className="text-xs text-slate-500 font-semibold uppercase">Conducted Exams</div>
              <div className="text-2xl font-bold text-blue-900 mt-1">
                {exams.length}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">FA & SA evaluation terms</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-800">
              Academic Marks & Grade Book
            </div>
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-600 font-semibold sticky top-0">
                  <tr>
                    <th className="py-2.5 px-4">Student</th>
                    <th className="py-2.5 px-4">Class</th>
                    <th className="py-2.5 px-4">Total Score</th>
                    <th className="py-2.5 px-4">Percentage</th>
                    <th className="py-2.5 px-4">Grade</th>
                    <th className="py-2.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {results.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="py-2 px-4 font-semibold text-slate-900">{r.studentName}</td>
                      <td className="py-2 px-4">{r.class}</td>
                      <td className="py-2 px-4">{r.totalMarks} / {r.maxMarks}</td>
                      <td className="py-2 px-4 font-bold text-blue-950">{r.percentage}%</td>
                      <td className="py-2 px-4 font-bold text-amber-600">{r.grade}</td>
                      <td className="py-2 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            r.status === 'pass'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {results.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No marks entries available yet. Enter marks in Exams & Marks tab.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* REPORT CONTENT: Fee */}
      {activeReport === 'fee' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <div className="text-xs text-slate-500 font-semibold uppercase">Total Billed</div>
              <div className="text-xl font-bold text-slate-900 mt-1">
                ₹{(summary?.fees?.totalBilled || 0).toLocaleString('en-IN')}
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <div className="text-xs text-emerald-700 font-semibold uppercase">Total Collected</div>
              <div className="text-xl font-bold text-emerald-800 mt-1">
                ₹{(summary?.fees?.totalCollected || 0).toLocaleString('en-IN')}
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <div className="text-xs text-rose-700 font-semibold uppercase">Total Outstanding</div>
              <div className="text-xl font-bold text-rose-800 mt-1">
                ₹{(summary?.fees?.totalOutstanding || 0).toLocaleString('en-IN')}
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <div className="text-xs text-slate-500 font-semibold uppercase">Collection Rate</div>
              <div className="text-xl font-bold text-blue-900 mt-1">
                {summary?.fees?.collectionRate || 0}%
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-800">
              Fee Ledger Summary
            </div>
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-600 font-semibold sticky top-0">
                  <tr>
                    <th className="py-2.5 px-4">Student</th>
                    <th className="py-2.5 px-4">Class</th>
                    <th className="py-2.5 px-4">Net Fee</th>
                    <th className="py-2.5 px-4">Paid</th>
                    <th className="py-2.5 px-4">Due Balance</th>
                    <th className="py-2.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {fees.map((f) => (
                    <tr key={f.id} className="hover:bg-slate-50">
                      <td className="py-2 px-4 font-semibold text-slate-900">{f.studentName}</td>
                      <td className="py-2 px-4">{f.class} - {f.section}</td>
                      <td className="py-2 px-4">₹{f.netFee.toLocaleString('en-IN')}</td>
                      <td className="py-2 px-4 text-emerald-700 font-semibold">₹{f.paidAmount.toLocaleString('en-IN')}</td>
                      <td className="py-2 px-4 text-rose-700 font-bold">₹{f.dueAmount.toLocaleString('en-IN')}</td>
                      <td className="py-2 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                          {f.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {fees.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No fee ledger entries available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* REPORT CONTENT: Homework */}
      {activeReport === 'homework' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-800">
              Homework & Assignment Activity
            </div>
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-600 font-semibold sticky top-0">
                  <tr>
                    <th className="py-2.5 px-4">Assignment</th>
                    <th className="py-2.5 px-4">Class</th>
                    <th className="py-2.5 px-4">Subject</th>
                    <th className="py-2.5 px-4">Due Date</th>
                    <th className="py-2.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {homework.map((h) => (
                    <tr key={h.id} className="hover:bg-slate-50">
                      <td className="py-2 px-4 font-semibold text-slate-900">{h.title}</td>
                      <td className="py-2 px-4">{h.class}</td>
                      <td className="py-2 px-4 text-blue-900 font-medium">{h.subject}</td>
                      <td className="py-2 px-4 text-slate-500 font-mono">{h.dueDate}</td>
                      <td className="py-2 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                          {h.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {homework.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        No homework assignments recorded.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* REPORT CONTENT: Admissions */}
      {activeReport === 'admissions' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-800">
              Admissions Pipeline Enquiries
            </div>
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-600 font-semibold sticky top-0">
                  <tr>
                    <th className="py-2.5 px-4">Student</th>
                    <th className="py-2.5 px-4">Applying For</th>
                    <th className="py-2.5 px-4">Parent</th>
                    <th className="py-2.5 px-4">Phone</th>
                    <th className="py-2.5 px-4">Location</th>
                    <th className="py-2.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {admissions.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50">
                      <td className="py-2 px-4 font-semibold text-slate-900">{a.studentName}</td>
                      <td className="py-2 px-4 font-medium text-blue-900">{a.classApplying}</td>
                      <td className="py-2 px-4">{a.parentName}</td>
                      <td className="py-2 px-4 font-mono">{a.phone}</td>
                      <td className="py-2 px-4 text-slate-500">{a.mandal || 'Kotauratla'}</td>
                      <td className="py-2 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            a.status === 'admitted'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {admissions.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No admission applications found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
