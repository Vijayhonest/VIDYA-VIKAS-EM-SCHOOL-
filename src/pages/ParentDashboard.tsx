import React, { useState, useEffect } from 'react';
import {
  Parent,
  Student,
  AttendanceStats,
  AttendanceRecord,
  Homework,
  TimetableEntry,
  ExamResult,
  Notice,
} from '../types';
import { parentService } from '../services/parentService';
import {
  School,
  LayoutDashboard,
  Users,
  CheckCircle2,
  FileText,
  Award,
  CreditCard,
  MessageCircle,
  Bell,
  MessageSquare,
  User,
  LogOut,
  Home,
  Calendar,
  Clock,
  Printer,
  ChevronDown,
  Download,
  AlertCircle,
  Menu,
  X,
  Send,
  MoreHorizontal,
  ChevronRight,
  ShieldCheck,
  Check,
} from 'lucide-react';

interface ParentDashboardProps {
  initialParent: Parent;
  initialChildren: Student[];
  onLogout: () => void;
  onExitToPublic: () => void;
}

type ParentTabType =
  | 'dashboard'
  | 'child_profile'
  | 'attendance'
  | 'homework'
  | 'results'
  | 'fees'
  | 'remarks'
  | 'notices'
  | 'contact';

interface FeeInfo {
  id: string;
  studentId: string;
  studentName: string;
  totalFee: number;
  paidAmount: number;
  dueAmount: number;
  status: 'paid' | 'partial' | 'pending';
  dueDate: string;
  payments: Array<{
    id: string;
    receiptNo: string;
    date: string;
    amount: number;
    paymentMode: string;
    collectedBy: string;
    remarks: string;
  }>;
}

interface TeacherRemark {
  id: string;
  date: string;
  teacherName: string;
  subject: string;
  remark: string;
  category: string;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({
  initialParent,
  initialChildren,
  onLogout,
  onExitToPublic,
}) => {
  const [parent] = useState<Parent>(initialParent);
  const [children, setChildren] = useState<Student[]>(initialChildren);
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    initialChildren[0]?.studentId || ''
  );
  const selectedChild = children.find((c) => c.studentId === selectedStudentId) || children[0];

  const [activeTab, setActiveTab] = useState<ParentTabType>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  // Child Data States
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats>({
    totalWorkingDays: 78,
    present: 71,
    absent: 5,
    late: 2,
    excused: 0,
    percentage: 91,
  });
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [homeworkList, setHomeworkList] = useState<Homework[]>([]);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);

  // Fee Details
  const [feeInfo, setFeeInfo] = useState<FeeInfo>({
    id: 'fee-1',
    studentId: selectedChild?.studentId || 'VV-STU-001',
    studentName: selectedChild?.name || 'K. Venkata Sai',
    totalFee: 16000,
    paidAmount: 16000,
    dueAmount: 0,
    status: 'paid',
    dueDate: '2026-11-30',
    payments: [
      {
        id: 'rec-1',
        receiptNo: 'VV-REC-1042',
        date: '2026-06-12',
        amount: 16000,
        paymentMode: 'Bank Transfer / Counter',
        collectedBy: 'School Accounts Desk',
        remarks: 'Annual Term-1 & Term-2 Full Composite Fee Cleared',
      },
    ],
  });

  // Teacher Remarks
  const [teacherRemarks, setTeacherRemarks] = useState<TeacherRemark[]>([
    {
      id: 'rem-1',
      date: '2026-09-18',
      teacherName: 'K. Lakshmi Narayana',
      subject: 'Physical Science',
      remark: 'Shows exceptional interest during experiments and laboratory sessions. Homework is submitted with neat diagrams.',
      category: 'Academic Excellence',
    },
    {
      id: 'rem-2',
      date: '2026-09-12',
      teacherName: 'V. Ramanamma',
      subject: 'English & Grammar',
      remark: 'Active in group discussions and reading comprehension. Recommended to practice cursive writing exercises.',
      category: 'Classroom Participation',
    },
    {
      id: 'rem-3',
      date: '2026-09-04',
      teacherName: 'Class Teacher',
      subject: 'General Conduct',
      remark: 'Very polite, punctual, and helpful with fellow students during morning assembly routines.',
      category: 'Discipline & Values',
    },
  ]);

  // Message to school
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [contactSuccess, setContactSuccess] = useState<string | null>(null);

  // Load Child Specific Data
  useEffect(() => {
    async function loadChildData() {
      if (!selectedChild) return;

      try {
        const [att, hw, res, not] = await Promise.all([
          parentService.getChildAttendance(selectedChild.studentId),
          parentService.getChildHomework(selectedChild.studentId),
          parentService.getChildResults(selectedChild.studentId),
          parentService.getNotices(),
        ]);

        if (att) {
          setAttendanceStats(att.stats);
          setAttendanceRecords(att.records);
        }
        if (hw) setHomeworkList(hw);
        if (res) setResults(res);
        if (not) setNotices(not);

        // Fetch Fee details
        try {
          const feeRes = await fetch(`/api/parent/student/${selectedChild.studentId}/fees`, {
            headers: { Authorization: `Bearer ${parentService.getToken()}` },
          });
          if (feeRes.ok) {
            const fData = await feeRes.json();
            setFeeInfo(fData);
          }
        } catch (e) {
          // ignore
        }

        // Fetch Remarks
        try {
          const remRes = await fetch(`/api/parent/student/${selectedChild.studentId}/remarks`, {
            headers: { Authorization: `Bearer ${parentService.getToken()}` },
          });
          if (remRes.ok) {
            const rData = await remRes.json();
            setTeacherRemarks(rData);
          }
        } catch (e) {
          // ignore
        }
      } catch (err) {
        console.error('Error fetching child details:', err);
      }
    }

    loadChildData();
  }, [selectedChild]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactMessage.trim()) return;

    setIsSendingMessage(true);
    setContactSuccess(null);

    const res = await parentService.sendEnquiry(
      `Parent of ${selectedChild?.name || 'Student'}: ${contactSubject || 'General Inquiry'}`,
      contactMessage
    );
    setIsSendingMessage(false);

    if (res.success) {
      setContactSuccess('Your message has been sent to the Principal and Administrative desk.');
      setContactSubject('');
      setContactMessage('');
      setTimeout(() => setContactSuccess(null), 4000);
    }
  };

  const navItems: Array<{ id: ParentTabType; label: string; icon: React.FC<{ className?: string }>; badge?: number }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'child_profile', label: 'My Child Profile', icon: User },
    { id: 'attendance', label: 'Daily Attendance', icon: CheckCircle2 },
    { id: 'homework', label: 'Homework & Tasks', icon: FileText, badge: homeworkList.length },
    { id: 'results', label: 'Examination Results', icon: Award },
    { id: 'fees', label: 'Fee Details & Receipts', icon: CreditCard },
    { id: 'remarks', label: 'Teacher Remarks', icon: MessageCircle, badge: teacherRemarks.length },
    { id: 'notices', label: 'School Notices', icon: Bell, badge: notices.length },
    { id: 'contact', label: 'Contact School Desk', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-800 font-sans selection:bg-amber-400 selection:text-blue-950">
      {/* Top Header */}
      <header className="bg-blue-950 text-white border-b border-blue-900 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          {/* Brand & Mobile Hamburger */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-blue-900 text-blue-200 hover:text-white transition cursor-pointer"
              aria-label="Toggle Navigation Drawer"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="w-10 h-10 rounded-xl bg-amber-400 text-blue-950 flex items-center justify-center font-bold shadow-md shrink-0">
              <School className="w-6 h-6" />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                  Parent Portal
                </span>
                <span className="text-xs text-blue-400">•</span>
                <span className="text-xs text-blue-200">Parent: {parent.name}</span>
              </div>
              <h1 className="text-base sm:text-lg font-bold font-serif leading-tight">
                Vidya Vikas EM School
              </h1>
            </div>
          </div>

          {/* Child Selector & Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Child Selector Dropdown */}
            {children.length > 0 && (
              <div className="relative">
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="bg-blue-900 border border-blue-700 text-white text-xs font-semibold rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
                >
                  {children.map((child) => (
                    <option key={child.studentId} value={child.studentId} className="bg-slate-900 text-white">
                      🎓 {child.name} ({child.class})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* School Website link */}
            <button
              onClick={onExitToPublic}
              className="px-3 py-1.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-blue-100 text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
              title="Return to School Website"
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Website</span>
            </button>

            {/* Logout */}
            <button
              onClick={onLogout}
              className="px-3 py-1.5 rounded-xl bg-rose-900/80 hover:bg-rose-800 text-rose-100 text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container with Sidebar + Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex gap-6">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-3 sticky top-24 space-y-1">
            <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Parent Navigation
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    isActive
                      ? 'bg-blue-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-blue-950'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {typeof item.badge === 'number' && item.badge > 0 && (
                    <span
                      className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                        isActive ? 'bg-amber-400 text-blue-950' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            <div className="pt-3 border-t border-slate-100">
              <button
                onClick={onLogout}
                className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-700 hover:bg-rose-50 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile Slide-Over Drawer */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-blue-950/60 backdrop-blur-xs"
              onClick={() => setIsMobileMenuOpen(false)}
            ></div>
            <div className="relative w-72 bg-white h-full shadow-2xl p-4 flex flex-col justify-between overflow-y-auto">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-950 text-amber-400 flex items-center justify-center font-bold">
                      <School className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-blue-950">Parent Portal</div>
                      <div className="text-[11px] text-slate-500">{parent.name}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-1 py-3">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                          isActive
                            ? 'bg-blue-900 text-white'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </div>
                        {typeof item.badge === 'number' && item.badge > 0 && (
                          <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-200 text-slate-700">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <button
                  onClick={onLogout}
                  className="w-full flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-700 hover:bg-rose-50 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 pb-20 lg:pb-0 space-y-6">
          {/* TAB 1: DASHBOARD HOME */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Active Child Overview Card */}
              <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-blue-900 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-2xl bg-amber-400 text-blue-950 font-bold flex items-center justify-center text-2xl shadow-md shrink-0">
                      {selectedChild?.name?.charAt(0) || 'S'}
                    </div>
                    <div>
                      <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold mb-1">
                        <span>Enrolled Student</span>
                        <span>•</span>
                        <span>Class {selectedChild?.class} ({selectedChild?.section})</span>
                      </div>
                      <h2 className="text-2xl font-bold font-serif">{selectedChild?.name}</h2>
                      <p className="text-xs text-blue-200 mt-0.5">
                        Roll #{selectedChild?.rollNo} • Admission #{selectedChild?.admissionNo} • Year 2026–27
                      </p>
                    </div>
                  </div>

                  {/* Today's Attendance Badge */}
                  <div className="bg-emerald-500/20 border border-emerald-400/30 rounded-2xl p-4 flex items-center space-x-3 shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold">
                      <Check className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-emerald-300 block">Today's Attendance</span>
                      <span className="text-sm font-bold text-white">Present in Class</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4 Key Metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Attendance %
                    </span>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900">{attendanceStats.percentage}%</div>
                  <div className="text-xs text-emerald-600 font-semibold mt-1">
                    {attendanceStats.present} of {attendanceStats.totalWorkingDays} days present
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Homework Status
                    </span>
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900">{homeworkList.length} Tasks</div>
                  <div className="text-xs text-blue-600 font-semibold mt-1">All weekly homework logged</div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Latest Grade
                    </span>
                    <Award className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900">A1 Grade</div>
                  <div className="text-xs text-indigo-600 font-semibold mt-1">91.2% in FA-1 Mid-Term</div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Fee Status
                    </span>
                    <CreditCard className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-bold text-emerald-600">Paid</div>
                  <div className="text-xs text-slate-500 font-semibold mt-1">No outstanding dues</div>
                </div>
              </div>

              {/* TWO COLUMN: HOMEWORK & TEACHER REMARKS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Child's Homework */}
                <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-base font-bold text-slate-900">Active Homework</h3>
                        <p className="text-xs text-slate-500">Assigned tasks for {selectedChild?.name}</p>
                      </div>
                      <button
                        onClick={() => setActiveTab('homework')}
                        className="text-xs font-bold text-blue-700 hover:underline cursor-pointer"
                      >
                        View All
                      </button>
                    </div>

                    <div className="space-y-3">
                      {homeworkList.slice(0, 3).map((hw) => (
                        <div key={hw.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-3">
                          <div>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-900">
                              {hw.subject}
                            </span>
                            <h4 className="text-xs font-bold text-slate-800 mt-1">{hw.title}</h4>
                            <p className="text-[11px] text-slate-500 line-clamp-1">{hw.description}</p>
                          </div>
                          <span className="text-[11px] font-semibold text-slate-400 shrink-0">Due: {hw.dueDate}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Teacher's Latest Remarks */}
                <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-base font-bold text-slate-900">Teacher's Observations</h3>
                        <p className="text-xs text-slate-500">Direct feedback from subject faculty</p>
                      </div>
                      <button
                        onClick={() => setActiveTab('remarks')}
                        className="text-xs font-bold text-blue-700 hover:underline cursor-pointer"
                      >
                        View All
                      </button>
                    </div>

                    <div className="space-y-3">
                      {teacherRemarks.slice(0, 2).map((rem) => (
                        <div key={rem.id} className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-100 text-xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-blue-950">{rem.teacherName} ({rem.subject})</span>
                            <span className="text-[10px] text-slate-400">{rem.date}</span>
                          </div>
                          <p className="text-slate-700 leading-relaxed italic">"{rem.remark}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* FEE BREAKDOWN & RECEIPTS SUMMARY */}
              <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Annual Tuition & Composite Fee Status</h3>
                    <p className="text-xs text-slate-500">Receipts and verified bank clearances</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 self-start sm:self-center">
                    Annual Dues Cleared (₹{feeInfo.totalFee.toLocaleString('en-IN')})
                  </span>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
                      <tr>
                        <th className="py-2.5 px-4">Receipt No</th>
                        <th className="py-2.5 px-4">Date</th>
                        <th className="py-2.5 px-4">Amount Paid</th>
                        <th className="py-2.5 px-4">Payment Mode</th>
                        <th className="py-2.5 px-4">Collected By</th>
                        <th className="py-2.5 px-4 text-center">Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {feeInfo.payments.map((p) => (
                        <tr key={p.id}>
                          <td className="py-2.5 px-4 font-bold text-blue-900">{p.receiptNo}</td>
                          <td className="py-2.5 px-4 text-slate-600">{p.date}</td>
                          <td className="py-2.5 px-4 font-bold text-emerald-700">₹{p.amount.toLocaleString('en-IN')}</td>
                          <td className="py-2.5 px-4 text-slate-700">{p.paymentMode}</td>
                          <td className="py-2.5 px-4 text-slate-500">{p.collectedBy}</td>
                          <td className="py-2.5 px-4 text-center">
                            <button
                              onClick={() => alert(`Receipt #${p.receiptNo}\nStudent: ${selectedChild.name}\nAmount: ₹${p.amount}\nStatus: Official Verified Receipt`)}
                              className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-900 font-bold hover:bg-blue-100 transition cursor-pointer"
                            >
                              Download
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MY CHILD PROFILE */}
          {activeTab === 'child_profile' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-blue-950 text-amber-400 font-bold flex items-center justify-center text-2xl shadow-md">
                    {selectedChild?.name?.charAt(0) || 'S'}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold font-serif text-slate-900">{selectedChild?.name}</h2>
                    <p className="text-xs text-slate-500">Student ID: {selectedChild?.studentId} • Admission: {selectedChild?.admissionNo}</p>
                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Class {selectedChild?.class} - Section {selectedChild?.section}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block font-semibold mb-1">Roll Number</span>
                    <span className="font-bold text-slate-800 text-sm">#{selectedChild?.rollNo}</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block font-semibold mb-1">Class Section</span>
                    <span className="font-bold text-slate-800 text-sm">{selectedChild?.class} - {selectedChild?.section}</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block font-semibold mb-1">Father / Guardian</span>
                    <span className="font-bold text-slate-800 text-sm">{parent.name}</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block font-semibold mb-1">Parent Contact</span>
                    <span className="font-bold text-slate-800 text-sm">{parent.phone}</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block font-semibold mb-1">Academic Year</span>
                    <span className="font-bold text-slate-800 text-sm">{selectedChild?.academicYear || '2026–2027'}</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block font-semibold mb-1">Home Address</span>
                    <span className="font-bold text-slate-800 text-sm">{selectedChild?.address}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DAILY ATTENDANCE */}
          {activeTab === 'attendance' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80">
                <h2 className="text-xl font-bold font-serif text-slate-900 mb-1">Daily Attendance Records</h2>
                <p className="text-xs text-slate-500 mb-6">Attendance records for {selectedChild?.name}</p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-500 block uppercase">Total Working Days</span>
                    <span className="text-2xl font-bold text-slate-900">{attendanceStats.totalWorkingDays}</span>
                  </div>
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                    <span className="text-[11px] font-semibold text-emerald-700 block uppercase">Days Present</span>
                    <span className="text-2xl font-bold text-emerald-900">{attendanceStats.present}</span>
                  </div>
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-100">
                    <span className="text-[11px] font-semibold text-rose-700 block uppercase">Days Absent</span>
                    <span className="text-2xl font-bold text-rose-900">{attendanceStats.absent}</span>
                  </div>
                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                    <span className="text-[11px] font-semibold text-blue-700 block uppercase">Percentage</span>
                    <span className="text-2xl font-bold text-blue-900">{attendanceStats.percentage}%</span>
                  </div>
                </div>

                <div className="overflow-hidden border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
                      <tr>
                        <th className="py-2.5 px-4">Date</th>
                        <th className="py-2.5 px-4">Class</th>
                        <th className="py-2.5 px-4">Status</th>
                        <th className="py-2.5 px-4">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {attendanceRecords.map((r) => (
                        <tr key={r.id}>
                          <td className="py-2.5 px-4 font-semibold text-slate-900">{r.date}</td>
                          <td className="py-2.5 px-4 text-slate-600">{r.class}</td>
                          <td className="py-2.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                r.status === 'present'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {r.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-slate-500">{r.remarks || 'Present in classroom'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: HOMEWORK & TASKS */}
          {activeTab === 'homework' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80">
                <h2 className="text-xl font-bold font-serif text-slate-900 mb-1">Homework & Daily Tasks</h2>
                <p className="text-xs text-slate-500 mb-6">Track homework assigned to your child</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {homeworkList.map((hw) => (
                    <div key={hw.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-900">
                            {hw.subject}
                          </span>
                          <span className="text-xs text-slate-400">Due: {hw.dueDate}</span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 mb-1">{hw.title}</h3>
                        <p className="text-xs text-slate-600 leading-relaxed mb-4">{hw.description}</p>
                      </div>
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span>Assigned by: {hw.createdBy}</span>
                        <span className="font-bold text-emerald-700">Class {hw.class}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: EXAMINATION RESULTS */}
          {activeTab === 'results' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                  <div>
                    <h2 className="text-xl font-bold font-serif text-slate-900">Academic Scorecard</h2>
                    <p className="text-xs text-slate-500">Official marks and evaluations for {selectedChild?.name}</p>
                  </div>
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center space-x-1.5 transition cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Scorecard</span>
                  </button>
                </div>

                {results.map((res) => (
                  <div key={res.id} className="border border-slate-200 rounded-2xl p-6 mb-6 bg-slate-50/50">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-2 mb-4">
                      <div>
                        <h3 className="text-base font-bold text-blue-950">{res.examName}</h3>
                        <p className="text-xs text-slate-500">Academic Year: {res.academicYear} • Class: {res.class}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <span className="text-[11px] text-slate-400 block font-semibold">Total Score</span>
                          <span className="font-bold text-slate-900 text-sm">{res.totalMarks} / {res.totalMaxMarks}</span>
                        </div>
                        <span className="px-3 py-1 rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-xs">
                          {res.overallGrade}
                        </span>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs bg-white rounded-xl overflow-hidden border border-slate-200">
                        <thead className="bg-slate-100 text-slate-600 font-bold">
                          <tr>
                            <th className="py-2.5 px-4">Subject</th>
                            <th className="py-2.5 px-4 text-center">Marks Obtained</th>
                            <th className="py-2.5 px-4 text-center">Maximum Marks</th>
                            <th className="py-2.5 px-4 text-center">Grade</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {res.subjects.map((sub, idx) => (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="py-2.5 px-4 font-semibold text-slate-900">{sub.subject}</td>
                              <td className="py-2.5 px-4 text-center font-bold text-slate-900">{sub.marksObtained}</td>
                              <td className="py-2.5 px-4 text-center text-slate-500">{sub.maxMarks}</td>
                              <td className="py-2.5 px-4 text-center">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-900">
                                  {sub.grade}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: FEE DETAILS & RECEIPTS */}
          {activeTab === 'fees' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80">
                <h2 className="text-xl font-bold font-serif text-slate-900 mb-1">Fee Receipts & Accounts Ledger</h2>
                <p className="text-xs text-slate-500 mb-6">Payment history and fee structure for {selectedChild?.name}</p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-xs font-semibold mb-1">Total Fee Amount</span>
                    <span className="text-2xl font-bold text-slate-900">₹{feeInfo.totalFee.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                    <span className="text-emerald-700 block text-xs font-semibold mb-1">Paid Amount</span>
                    <span className="text-2xl font-bold text-emerald-900">₹{feeInfo.paidAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-xs font-semibold mb-1">Outstanding Balance</span>
                    <span className="text-2xl font-bold text-emerald-600">₹0 (Cleared)</span>
                  </div>
                </div>

                <div className="overflow-hidden border border-slate-200 rounded-xl">
                  <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700">
                    Official Payment Receipts
                  </div>
                  <table className="w-full text-left text-xs">
                    <thead className="bg-white text-slate-500 uppercase font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-4">Receipt No</th>
                        <th className="py-2.5 px-4">Payment Date</th>
                        <th className="py-2.5 px-4">Amount</th>
                        <th className="py-2.5 px-4">Mode</th>
                        <th className="py-2.5 px-4">Remarks</th>
                        <th className="py-2.5 px-4 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {feeInfo.payments.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-4 font-bold text-blue-900">{p.receiptNo}</td>
                          <td className="py-2.5 px-4 text-slate-600">{p.date}</td>
                          <td className="py-2.5 px-4 font-bold text-emerald-700">₹{p.amount.toLocaleString('en-IN')}</td>
                          <td className="py-2.5 px-4 text-slate-700">{p.paymentMode}</td>
                          <td className="py-2.5 px-4 text-slate-500">{p.remarks}</td>
                          <td className="py-2.5 px-4 text-center">
                            <button
                              onClick={() => alert(`Receipt #${p.receiptNo}\nStudent: ${selectedChild.name}\nAmount: ₹${p.amount}\nStatus: Verified Payment`)}
                              className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-900 font-bold hover:bg-blue-100 transition cursor-pointer"
                            >
                              Download
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: TEACHER REMARKS */}
          {activeTab === 'remarks' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80">
                <h2 className="text-xl font-bold font-serif text-slate-900 mb-1">Teacher Remarks & Conduct Notes</h2>
                <p className="text-xs text-slate-500 mb-6">Subject teacher feedback for {selectedChild?.name}</p>

                <div className="space-y-4">
                  {teacherRemarks.map((rem) => (
                    <div key={rem.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-900">
                          {rem.category}
                        </span>
                        <span className="text-xs text-slate-400">{rem.date}</span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 mb-1">{rem.teacherName} ({rem.subject})</h3>
                      <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 italic">
                        "{rem.remark}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: SCHOOL NOTICES */}
          {activeTab === 'notices' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80">
                <h2 className="text-xl font-bold font-serif text-slate-900 mb-1">School Notices & Circulars</h2>
                <p className="text-xs text-slate-500 mb-6">Official announcements from school management</p>

                <div className="space-y-3">
                  {notices.map((n) => (
                    <div key={n.id} className="p-5 rounded-2xl bg-slate-50/60 border border-slate-200/80">
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-900">
                          {n.category}
                        </span>
                        <span className="text-xs text-slate-400">{n.date}</span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 mb-1">{n.title}</h3>
                      <p className="text-xs text-slate-600 leading-relaxed mb-2">{n.content}</p>
                      <div className="text-[10px] text-slate-400 italic">Issued by: {n.postedBy}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: CONTACT SCHOOL DESK */}
          {activeTab === 'contact' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80">
                <h2 className="text-xl font-bold font-serif text-slate-900 mb-1">Direct Communication with School Desk</h2>
                <p className="text-xs text-slate-500 mb-6">Message the Principal or class teacher regarding {selectedChild?.name}</p>

                {contactSuccess && (
                  <div className="p-4 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                    {contactSuccess}
                  </div>
                )}

                <form onSubmit={handleSendMessage} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Subject</label>
                    <input
                      type="text"
                      placeholder="e.g. Science Fair Project Inquiry or Leave Notice"
                      value={contactSubject}
                      onChange={(e) => setContactSubject(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Message</label>
                    <textarea
                      rows={4}
                      placeholder="Type your message for the school administrative desk..."
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSendingMessage}
                    className="px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-semibold flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSendingMessage ? 'Sending...' : 'Send Message'}</span>
                  </button>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Mandatory as per requirements) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-lg px-2 py-1.5 flex items-center justify-around">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-semibold transition cursor-pointer min-h-[44px] min-w-[44px] ${
            activeTab === 'dashboard' ? 'text-blue-900 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span>Home</span>
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-semibold transition cursor-pointer min-h-[44px] min-w-[44px] ${
            activeTab === 'attendance' ? 'text-blue-900 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <CheckCircle2 className="w-5 h-5 mb-0.5" />
          <span>Attendance</span>
        </button>

        <button
          onClick={() => setActiveTab('homework')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-semibold transition cursor-pointer min-h-[44px] min-w-[44px] ${
            activeTab === 'homework' ? 'text-blue-900 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <FileText className="w-5 h-5 mb-0.5" />
          <span>Homework</span>
        </button>

        <button
          onClick={() => setActiveTab('fees')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-semibold transition cursor-pointer min-h-[44px] min-w-[44px] ${
            activeTab === 'fees' ? 'text-blue-900 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <CreditCard className="w-5 h-5 mb-0.5" />
          <span>Fees</span>
        </button>

        <button
          onClick={() => setActiveTab('child_profile')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-semibold transition cursor-pointer min-h-[44px] min-w-[44px] ${
            activeTab === 'child_profile' ? 'text-blue-900 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <User className="w-5 h-5 mb-0.5" />
          <span>Profile</span>
        </button>

        <button
          onClick={() => setIsMoreMenuOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-semibold text-slate-500 hover:text-slate-900 transition cursor-pointer min-h-[44px] min-w-[44px]"
        >
          <MoreHorizontal className="w-5 h-5 mb-0.5" />
          <span>More</span>
        </button>
      </nav>

      {/* Mobile "More" Menu Drawer */}
      {isMoreMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
          <div className="fixed inset-0 bg-blue-950/60 backdrop-blur-xs" onClick={() => setIsMoreMenuOpen(false)}></div>
          <div className="relative bg-white rounded-t-3xl p-6 shadow-2xl z-10 space-y-4 max-h-[80vh] overflow-y-auto animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold font-serif text-slate-900">More Features</h3>
              <button
                onClick={() => setIsMoreMenuOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { id: 'results', label: 'Scorecard', icon: Award },
                { id: 'remarks', label: 'Remarks', icon: MessageCircle },
                { id: 'notices', label: 'Notices', icon: Bell },
                { id: 'contact', label: 'Contact', icon: MessageSquare },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as ParentTabType);
                      setIsMoreMenuOpen(false);
                    }}
                    className="p-3 rounded-2xl bg-slate-50 hover:bg-blue-50 border border-slate-100 flex flex-col items-center justify-center space-y-1 transition cursor-pointer"
                  >
                    <Icon className="w-5 h-5 text-blue-900" />
                    <span className="text-[11px] font-semibold text-slate-700">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
