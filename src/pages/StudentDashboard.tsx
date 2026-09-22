import React, { useState, useEffect } from 'react';
import {
  Student,
  AttendanceStats,
  AttendanceRecord,
  Homework,
  TimetableEntry,
  Exam,
  ExamResult,
  Notice,
  SchoolEvent,
} from '../types';
import { studentService } from '../services/studentService';
import {
  School,
  LayoutDashboard,
  Calendar,
  FileText,
  ClipboardList,
  CheckCircle2,
  Award,
  BookOpen,
  Bell,
  CalendarDays,
  MessageSquare,
  User,
  LogOut,
  Home,
  Check,
  Clock,
  Printer,
  ChevronRight,
  Download,
  AlertCircle,
  Menu,
  X,
  MoreHorizontal,
  Send,
  Eye,
  Key,
  Flame,
  IndianRupee,
  CalendarRange,
} from 'lucide-react';

interface StudentDashboardProps {
  initialStudent: Student;
  onLogout: () => void;
  onExitToPublic: () => void;
}

type StudentTabType =
  | 'dashboard'
  | 'timetable'
  | 'homework'
  | 'assignments'
  | 'attendance'
  | 'examinations'
  | 'results'
  | 'materials'
  | 'notices'
  | 'events'
  | 'fees'
  | 'calendar'
  | 'downloads'
  | 'messages'
  | 'profile';

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  initialStudent,
  onLogout,
  onExitToPublic,
}) => {
  const [student, setStudent] = useState<Student>(initialStudent);
  const [activeTab, setActiveTab] = useState<StudentTabType>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState('Monday');

  // Core Data States
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
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);

  // Homework submission
  const [submittingHw, setSubmittingHw] = useState<Homework | null>(null);
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Message to school desk
  const [studentMessage, setStudentMessage] = useState('');
  const [messageSubject, setMessageSubject] = useState('Academic Doubts / Query');
  const [messageSentSuccess, setMessageSentSuccess] = useState(false);

  // Change password modal
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Fetch all student data
  const loadData = async () => {
    try {
      const [attData, hwData, ttData, exData, resData, notData] = await Promise.all([
        studentService.getAttendance(),
        studentService.getHomework(),
        studentService.getTimetable(),
        studentService.getExams(),
        studentService.getResults(),
        studentService.getNotices(),
      ]);

      if (attData) {
        setAttendanceStats(attData.stats);
        setAttendanceRecords(attData.records);
      }
      if (hwData) setHomeworkList(hwData);
      if (ttData && ttData.schedule) setTimetable(ttData.schedule);
      if (exData) setExams(exData);
      if (resData) setResults(resData);
      if (notData) setNotices(notData);

      // Fetch study materials from student endpoint
      try {
        const matRes = await fetch('/api/student/study-materials');
        if (matRes.ok) {
          const matData = await matRes.json();
          setMaterials(matData);
        }
      } catch (e) {
        // fallback
      }

      // School events
      setEvents([
        {
          id: 'ev-1',
          title: 'AP State Science Day & Robotics Exhibition',
          date: '2026-10-15',
          time: '09:30 AM - 04:00 PM',
          venue: 'Main Science Hall',
          description: 'Inter-school project presentations, working science models, and guest lecture.',
          category: 'academic',
          isUpcoming: true,
          highlights: ['Science fair', 'Working models', 'Exhibition'],
        },
        {
          id: 'ev-2',
          title: 'Semi-Annual Sports Meet 2026',
          date: '2026-11-12',
          time: '08:00 AM - 01:00 PM',
          venue: 'School Ground',
          description: 'Track and field events, relay races, badminton, and prize distribution.',
          category: 'sports',
          isUpcoming: true,
          highlights: ['Athletics', 'Volleyball', 'Prizes'],
        },
        {
          id: 'ev-3',
          title: 'Parent-Teacher Conference (PTM)',
          date: '2026-10-24',
          time: '10:00 AM - 01:00 PM',
          venue: 'Auditorium & Classrooms',
          description: 'Comprehensive discussion on SA-1 term progress and student performance.',
          category: 'cultural',
          isUpcoming: true,
          highlights: ['Progress card', 'Teacher meeting', 'Doubt clearing'],
        },
      ]);
    } catch (err) {
      console.error('Error loading student portal data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  // Compute statistics
  const pendingHwCount = homeworkList.filter(
    (h) => !h.submissions?.some((s) => s.studentId === student.studentId)
  ).length;

  const latestResult = results[0];
  const overallPercentage = latestResult ? latestResult.percentage : 88.5;

  // Timetable for selected day
  const filteredTimetable = timetable
    .filter((t) => t.dayOfWeek.toLowerCase() === selectedDay.toLowerCase())
    .sort((a, b) => a.period - b.period);

  // Homework submit handler
  const handleSubmitHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingHw) return;

    setIsSubmitting(true);
    const res = await studentService.submitHomework(submittingHw.id, submissionNotes);
    setIsSubmitting(false);

    if (res) {
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setSubmittingHw(null);
        setSubmissionNotes('');
        loadData();
      }, 1500);
    }
  };

  // Student inquiry message handler
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentMessage.trim()) return;

    try {
      await fetch('/api/parent/contact-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${student.name} (Student - ${student.class})`,
          phone: student.parentPhone || '9441971531',
          subject: messageSubject,
          message: studentMessage,
        }),
      });
      setMessageSentSuccess(true);
      setStudentMessage('');
      setTimeout(() => setMessageSentSuccess(false), 3500);
    } catch (e) {
      // ignore
    }
  };

  // Password change handler
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setIsUpdatingPassword(true);
    const res = await studentService.changePassword(newPassword);
    setIsUpdatingPassword(false);

    if (res.success) {
      setPasswordSuccess('Password successfully updated!');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setIsPasswordModalOpen(false);
        setPasswordSuccess(null);
      }, 2000);
    } else {
      setPasswordError(res.error || 'Failed to update password.');
    }
  };

  // Sidebar Navigation Items
  const navItems: Array<{ id: StudentTabType; label: string; icon: React.FC<{ className?: string }>; badge?: number }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'timetable', label: 'My Timetable', icon: Calendar },
    { id: 'homework', label: 'Homework', icon: FileText, badge: pendingHwCount },
    { id: 'assignments', label: 'Assignments', icon: ClipboardList },
    { id: 'attendance', label: 'Attendance', icon: CheckCircle2 },
    { id: 'examinations', label: 'Examinations', icon: Award },
    { id: 'results', label: 'Marks & Results', icon: Award },
    { id: 'fees', label: 'Fee Status', icon: IndianRupee },
    { id: 'calendar', label: 'Academic Calendar', icon: CalendarRange },
    { id: 'downloads', label: 'Downloads & Syllabus', icon: Download },
    { id: 'materials', label: 'Study Materials', icon: BookOpen, badge: materials.length },
    { id: 'notices', label: 'Notices', icon: Bell, badge: notices.length },
    { id: 'events', label: 'Events', icon: CalendarDays },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'profile', label: 'My Profile', icon: User },
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
                  Student Portal
                </span>
                <span className="text-xs text-blue-400">•</span>
                <span className="text-xs text-blue-200">Roll #{student.rollNo}</span>
              </div>
              <h1 className="text-base sm:text-lg font-bold font-serif leading-tight">
                Vidya Vikas EM School
              </h1>
            </div>
          </div>

          {/* User & Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Student Profile Pill */}
            <div className="hidden md:flex items-center space-x-2.5 bg-blue-900/80 px-3 py-1.5 rounded-xl border border-blue-800/80">
              <div className="w-7 h-7 rounded-lg bg-amber-400 text-blue-950 font-bold flex items-center justify-center text-xs">
                {student.name.charAt(0)}
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-white leading-tight">{student.name}</div>
                <div className="text-[10px] text-blue-200">{student.class} - {student.section}</div>
              </div>
            </div>

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
              Student Menu
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
                      <div className="text-xs font-bold text-blue-950">Student Portal</div>
                      <div className="text-[11px] text-slate-500">{student.name}</div>
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
              {/* Welcome Card */}
              <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-blue-900 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
                <div className="relative z-10 max-w-2xl">
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-300/30 text-amber-300 text-xs font-semibold mb-3">
                    <span>{student.class} - Section {student.section}</span>
                    <span>•</span>
                    <span>Admission #{student.admissionNo}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold font-serif mb-2">
                    {greeting}, {student.name} 👋
                  </h2>
                  <p className="text-sm text-blue-200 leading-relaxed mb-6">
                    Welcome to your Vidya Vikas student dashboard. Check today's schedule, pending homework assignments, latest exam grades, and upcoming school activities.
                  </p>

                  <div className="flex flex-wrap gap-2.5 text-xs">
                    <button
                      onClick={() => setActiveTab('timetable')}
                      className="px-4 py-2 rounded-xl bg-amber-400 text-blue-950 font-bold hover:bg-amber-300 transition shadow-sm cursor-pointer"
                    >
                      View Today's Timetable
                    </button>
                    <button
                      onClick={() => setActiveTab('homework')}
                      className="px-4 py-2 rounded-xl bg-blue-800/80 text-white font-semibold hover:bg-blue-700 transition cursor-pointer"
                    >
                      Check Pending Homework ({pendingHwCount})
                    </button>
                    <button
                      onClick={() => setActiveTab('results')}
                      className="px-4 py-2 rounded-xl bg-blue-800/80 text-white font-semibold hover:bg-blue-700 transition cursor-pointer"
                    >
                      Exam Report Card
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Statistics (4 key metrics) */}
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
                      Pending Homework
                    </span>
                    <FileText className="w-5 h-5 text-amber-500" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900">{pendingHwCount}</div>
                  <div className="text-xs text-amber-600 font-semibold mt-1">
                    {pendingHwCount === 0 ? 'All caught up!' : 'Tasks due this week'}
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Upcoming Exams
                    </span>
                    <Award className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900">{exams.length}</div>
                  <div className="text-xs text-blue-600 font-semibold mt-1">SA-1 Mid-Term Assessments</div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Overall %
                    </span>
                    <Flame className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900">{overallPercentage}%</div>
                  <div className="text-xs text-indigo-600 font-semibold mt-1">Grade: A1 (Distinction)</div>
                </div>
              </div>

              {/* TODAY'S TIMETABLE WIDGET */}
              <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Today's Class Schedule</h3>
                    <p className="text-xs text-slate-500">Monday Period Allocations for {student.class}</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('timetable')}
                    className="text-xs font-bold text-blue-700 hover:underline flex items-center space-x-1 cursor-pointer"
                  >
                    <span>Full Schedule</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { period: 1, time: '09:00 - 09:45 AM', subject: 'Telugu', teacher: 'K. Sanyasamma', room: 'Room 204' },
                    { period: 2, time: '09:45 - 10:30 AM', subject: 'Mathematics', teacher: 'P. Srinivasa Rao', room: 'Room 204' },
                    { period: 3, time: '10:45 - 11:30 AM', subject: 'Physical Science', teacher: 'K. Lakshmi Narayana', room: 'Room 204' },
                    { period: 4, time: '11:30 - 12:15 PM', subject: 'English', teacher: 'V. Ramanamma', room: 'Room 204' },
                  ].map((p, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                          <span className="font-bold text-blue-900">Period {p.period}</span>
                          <span className="text-[10px]">{p.room}</span>
                        </div>
                        <div className="font-bold text-slate-900 text-sm">{p.subject}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{p.teacher}</div>
                      </div>
                      <div className="text-[11px] font-medium text-slate-400 mt-3 pt-2 border-t border-slate-200/60">
                        {p.time}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* TWO COLUMN: PENDING HOMEWORK & RECENT MARKS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pending Homework */}
                <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-base font-bold text-slate-900">Pending Homework</h3>
                        <p className="text-xs text-slate-500">Tasks assigned by subject teachers</p>
                      </div>
                      <button
                        onClick={() => setActiveTab('homework')}
                        className="text-xs font-bold text-blue-700 hover:underline cursor-pointer"
                      >
                        View All
                      </button>
                    </div>

                    <div className="space-y-3">
                      {homeworkList.slice(0, 3).map((hw) => {
                        const isSubmitted = hw.submissions?.some((s) => s.studentId === student.studentId);
                        return (
                          <div
                            key={hw.id}
                            className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-3"
                          >
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-900">
                                  {hw.subject}
                                </span>
                                <span className="text-[11px] text-slate-400">Due: {hw.dueDate}</span>
                              </div>
                              <h4 className="text-xs font-bold text-slate-800 mt-1">{hw.title}</h4>
                            </div>

                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                                isSubmitted
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {isSubmitted ? 'Submitted' : 'Pending'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Recent Exam Scores */}
                <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-base font-bold text-slate-900">Recent Marks & Results</h3>
                        <p className="text-xs text-slate-500">FA-1 Summative Assessment Scorecard</p>
                      </div>
                      <button
                        onClick={() => setActiveTab('results')}
                        className="text-xs font-bold text-blue-700 hover:underline cursor-pointer"
                      >
                        Full Report
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {[
                        { subject: 'Telugu', marks: 46, max: 50, grade: 'A1' },
                        { subject: 'English', marks: 44, max: 50, grade: 'A1' },
                        { subject: 'Mathematics', marks: 48, max: 50, grade: 'A1' },
                        { subject: 'Physical Science', marks: 45, max: 50, grade: 'A1' },
                        { subject: 'Social Studies', marks: 43, max: 50, grade: 'A2' },
                      ].map((sub, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                        >
                          <span className="font-semibold text-slate-800">{sub.subject}</span>
                          <div className="flex items-center space-x-3">
                            <span className="font-bold text-slate-900">{sub.marks} / {sub.max}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              {sub.grade}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* IMPORTANT NOTICES WIDGET */}
              <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-slate-900">Important School Circulars</h3>
                  <button
                    onClick={() => setActiveTab('notices')}
                    className="text-xs font-bold text-blue-700 hover:underline cursor-pointer"
                  >
                    View All ({notices.length})
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {notices.slice(0, 3).map((notice) => (
                    <div key={notice.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-900">
                            {notice.category}
                          </span>
                          <span className="text-[10px] text-slate-400">{notice.date}</span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 mb-1">{notice.title}</h4>
                        <p className="text-xs text-slate-600 line-clamp-2">{notice.summary || notice.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* QUICK ROW: FEE SUMMARY & ACADEMIC CALENDAR */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Quick Fee Card */}
                <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm">
                          ₹
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">Fee Payment Status</h3>
                          <p className="text-[11px] text-slate-500">Academic Year 2026–2027</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Terms 1 & 2 Paid
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 mb-3 text-center">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">Annual Fee</span>
                        <span className="text-xs font-bold text-slate-800">₹28,500</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-emerald-700 block font-medium">Cleared</span>
                        <span className="text-xs font-bold text-emerald-800">₹19,000</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-amber-700 block font-medium">Term 3 Due</span>
                        <span className="text-xs font-bold text-amber-800">₹9,500</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Term 3 installment is scheduled for January 15, 2027. Receipts available for download.
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">School counter open Mon-Sat</span>
                    <button
                      onClick={() => setActiveTab('fees')}
                      className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Fee Statement</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Quick Academic Calendar Card */}
                <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center">
                          <CalendarRange className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">Academic Calendar</h3>
                          <p className="text-[11px] text-slate-500">AP State Board • 220 Working Days</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900">
                        Term 2 Active
                      </span>
                    </div>

                    <div className="space-y-2 mb-3 text-xs">
                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="font-semibold text-slate-800">Sankranti Vacation</span>
                        <span className="text-amber-800 font-bold text-[11px]">10 Jan – 18 Jan 2027</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="font-semibold text-slate-800">SSC Board Examinations</span>
                        <span className="text-emerald-800 font-bold text-[11px]">18 March – 04 April 2027</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => setActiveTab('downloads')}
                      className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Syllabus</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('calendar')}
                      className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Full Calendar</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MY TIMETABLE */}
          {activeTab === 'timetable' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80">
                <h2 className="text-xl font-bold font-serif text-slate-900 mb-1">Weekly Academic Timetable</h2>
                <p className="text-xs text-slate-500 mb-6">{student.class} - Section {student.section} • Monday through Saturday</p>

                {/* Day Selector Buttons */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                        selectedDay === day
                          ? 'bg-blue-900 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>

                {/* Periods Table */}
                <div className="overflow-hidden border border-slate-200 rounded-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-3 px-4">Period</th>
                          <th className="py-3 px-4">Subject</th>
                          <th className="py-3 px-4">Teacher</th>
                          <th className="py-3 px-4">Time</th>
                          <th className="py-3 px-4">Room</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredTimetable.length > 0 ? (
                          filteredTimetable.map((slot) => (
                            <tr key={slot.id} className="hover:bg-slate-50">
                              <td className="py-3 px-4 font-bold text-blue-900">Period {slot.period}</td>
                              <td className="py-3 px-4 font-bold text-slate-900">{slot.subject}</td>
                              <td className="py-3 px-4 text-slate-600">{slot.teacherName}</td>
                              <td className="py-3 px-4 text-slate-500">{slot.time}</td>
                              <td className="py-3 px-4 text-slate-500">{slot.room}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-slate-400">
                              No periods scheduled for {selectedDay}.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: HOMEWORK */}
          {activeTab === 'homework' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80">
                <h2 className="text-xl font-bold font-serif text-slate-900 mb-1">Homework Tracker</h2>
                <p className="text-xs text-slate-500 mb-6">Subject-wise daily and weekly homework assignments</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {homeworkList.map((hw) => {
                    const isSubmitted = hw.submissions?.some((s) => s.studentId === student.studentId);
                    return (
                      <div
                        key={hw.id}
                        className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 hover:shadow-md transition flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-900 border border-blue-100">
                              {hw.subject}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isSubmitted
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {isSubmitted ? 'Submitted' : 'Pending'}
                            </span>
                          </div>

                          <h3 className="text-sm font-bold text-slate-900 mb-1">{hw.title}</h3>
                          <p className="text-xs text-slate-600 line-clamp-3 mb-4">{hw.description}</p>
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span className="text-slate-500">Due: {hw.dueDate}</span>
                          {!isSubmitted ? (
                            <button
                              onClick={() => setSubmittingHw(hw)}
                              className="px-3 py-1.5 rounded-lg bg-blue-900 text-white font-bold text-xs hover:bg-blue-800 transition cursor-pointer"
                            >
                              Submit Task
                            </button>
                          ) : (
                            <span className="text-emerald-700 font-bold flex items-center space-x-1">
                              <Check className="w-3.5 h-3.5" />
                              <span>Completed</span>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Submit Modal */}
              {submittingHw && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-blue-950/60 backdrop-blur-xs">
                  <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
                    <h3 className="text-base font-bold text-slate-900 mb-1">Submit Homework</h3>
                    <p className="text-xs text-slate-500 mb-4">{submittingHw.title} ({submittingHw.subject})</p>

                    {submitSuccess ? (
                      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-center text-xs font-semibold">
                        ✅ Homework submitted successfully to subject teacher!
                      </div>
                    ) : (
                      <form onSubmit={handleSubmitHomework} className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Your Notes / Submission Summary
                          </label>
                          <textarea
                            rows={4}
                            value={submissionNotes}
                            onChange={(e) => setSubmissionNotes(e.target.value)}
                            placeholder="e.g. Completed questions 1 through 8 in classwork notebook..."
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-600"
                            required
                          />
                        </div>

                        <div className="flex items-center justify-end space-x-2">
                          <button
                            type="button"
                            onClick={() => setSubmittingHw(null)}
                            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
                          >
                            {isSubmitting ? 'Submitting...' : 'Confirm Submission'}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ASSIGNMENTS */}
          {activeTab === 'assignments' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80">
                <h2 className="text-xl font-bold font-serif text-slate-900 mb-1">Term Assignments & Projects</h2>
                <p className="text-xs text-slate-500 mb-6">Subject internal assessment projects with grading criteria</p>

                <div className="space-y-4">
                  {[
                    {
                      title: 'Physical Science Working Model Project',
                      subject: 'Physical Science',
                      assignedDate: '2026-09-05',
                      dueDate: '2026-10-10',
                      marks: '10 Marks (FA-2 Internal)',
                      description: 'Prepare a working model on renewable energy, electromagnetic induction, or optical reflection with an explanatory chart.',
                    },
                    {
                      title: 'Social Studies Heritage Survey & Map Work',
                      subject: 'Social Studies',
                      assignedDate: '2026-09-12',
                      dueDate: '2026-10-18',
                      marks: '10 Marks',
                      description: 'Document historic sites in Visakhapatnam / Anakapalli districts with photographs and architectural summary.',
                    },
                    {
                      title: 'English Book Review & Creative Writing Essay',
                      subject: 'English',
                      assignedDate: '2026-09-18',
                      dueDate: '2026-10-22',
                      marks: '10 Marks',
                      description: 'Write an analytical summary of any prescribed supplementary reader story focusing on character arc and moral values.',
                    },
                  ].map((asg, idx) => (
                    <div key={idx} className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-900">
                            {asg.subject}
                          </span>
                          <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                            {asg.marks}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 mb-1">{asg.title}</h3>
                        <p className="text-xs text-slate-600 leading-relaxed mb-4">{asg.description}</p>
                      </div>
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span>Assigned: {asg.assignedDate}</span>
                        <span className="font-bold text-rose-700">Due: {asg.dueDate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ATTENDANCE */}
          {activeTab === 'attendance' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80">
                <h2 className="text-xl font-bold font-serif text-slate-900 mb-1">Attendance Record</h2>
                <p className="text-xs text-slate-500 mb-6">Cumulative academic year attendance statistics</p>

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
                  <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700">
                    Recent Daily Attendance Logs
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-white text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-4">Date</th>
                          <th className="py-2.5 px-4">Class</th>
                          <th className="py-2.5 px-4">Status</th>
                          <th className="py-2.5 px-4">Remarks</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {attendanceRecords.slice(0, 10).map((r) => (
                          <tr key={r.id} className="hover:bg-slate-50">
                            <td className="py-2.5 px-4 font-semibold text-slate-900">{r.date}</td>
                            <td className="py-2.5 px-4 text-slate-600">{r.class} - {r.section}</td>
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
                            <td className="py-2.5 px-4 text-slate-500">{r.remarks || 'Regular classroom presence'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: EXAMINATIONS */}
          {activeTab === 'examinations' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80">
                <h2 className="text-xl font-bold font-serif text-slate-900 mb-1">Examinations & Schedules</h2>
                <p className="text-xs text-slate-500 mb-6">Upcoming summative and formative board examinations</p>

                <div className="space-y-4">
                  {exams.map((exam) => (
                    <div key={exam.id} className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-900">
                          {(exam.type || 'Annual Exam').toUpperCase()}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">
                          {exam.startDate} to {exam.endDate}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mb-1">{exam.name}</h3>
                      {exam.description && <p className="text-xs text-slate-600 mb-4">{exam.description}</p>}

                      {exam.subjects && exam.subjects.length > 0 && (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border border-slate-100 rounded-lg">
                            <thead className="bg-slate-50 text-slate-600 font-semibold">
                              <tr>
                                <th className="p-2">Date</th>
                                <th className="p-2">Subject</th>
                                <th className="p-2">Time</th>
                                <th className="p-2">Max Marks</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {exam.subjects.map((s: any, idx: number) => (
                                <tr key={idx}>
                                  <td className="p-2 font-medium">{s.date}</td>
                                  <td className="p-2 font-bold text-slate-800">{s.name || s.subject}</td>
                                  <td className="p-2 text-slate-500">{s.time || '09:30 AM - 12:30 PM'}</td>
                                  <td className="p-2 text-slate-700">{s.maxMarks || 100}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: MARKS & RESULTS */}
          {activeTab === 'results' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                  <div>
                    <h2 className="text-xl font-bold font-serif text-slate-900">Academic Scorecard</h2>
                    <p className="text-xs text-slate-500">Formative and Summative Assessment Results</p>
                  </div>
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center space-x-1.5 transition cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Report Card</span>
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

                    {res.remarks && (
                      <div className="mt-4 p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-700">
                        <strong>Teacher's Remark:</strong> {res.remarks}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: STUDY MATERIALS */}
          {activeTab === 'materials' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80">
                <h2 className="text-xl font-bold font-serif text-slate-900 mb-1">Study Materials & Notes</h2>
                <p className="text-xs text-slate-500 mb-6">Subject notes, revision worksheets, and previous model question papers</p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {materials.map((mat) => (
                    <div key={mat.id} className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                            {mat.category}
                          </span>
                          <span className="text-[10px] text-slate-400">{mat.fileSize}</span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 mb-1">{mat.title}</h3>
                        <p className="text-xs text-slate-600 line-clamp-2 mb-3">{mat.description}</p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-[11px] text-slate-400">{mat.subject}</span>
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            alert(`Downloading file: ${mat.fileName}`);
                          }}
                          className="flex items-center space-x-1 font-bold text-blue-700 hover:underline"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: NOTICES */}
          {activeTab === 'notices' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80">
                <h2 className="text-xl font-bold font-serif text-slate-900 mb-1">School Notices & Circulars</h2>
                <p className="text-xs text-slate-500 mb-6">Official announcements for students and parents</p>

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

          {/* TAB 10: EVENTS */}
          {activeTab === 'events' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80">
                <h2 className="text-xl font-bold font-serif text-slate-900 mb-1">School Events Calendar</h2>
                <p className="text-xs text-slate-500 mb-6">Co-curricular activities, celebrations, and sports events</p>

                <div className="space-y-4">
                  {events.map((ev) => (
                    <div key={ev.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 uppercase">
                          {ev.category}
                        </span>
                        <h3 className="text-base font-bold text-slate-900 mt-1">{ev.title}</h3>
                        <p className="text-xs text-slate-600 mt-0.5">{ev.description}</p>
                      </div>
                      <div className="px-4 py-2 rounded-xl bg-blue-50 border border-blue-100 text-blue-950 font-bold text-xs text-center shrink-0">
                        {ev.date}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 11: MESSAGES / INQUIRIES */}
          {activeTab === 'messages' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80">
                <h2 className="text-xl font-bold font-serif text-slate-900 mb-1">Student Communication Desk</h2>
                <p className="text-xs text-slate-500 mb-6">Send messages to teachers or school administration</p>

                {messageSentSuccess && (
                  <div className="p-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                    ✅ Your inquiry has been transmitted to the administrative desk!
                  </div>
                )}

                <form onSubmit={handleSendMessage} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Subject</label>
                    <select
                      value={messageSubject}
                      onChange={(e) => setMessageSubject(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    >
                      <option value="Academic Doubts / Query">Academic Doubts / Query</option>
                      <option value="Homework Clarification">Homework Clarification</option>
                      <option value="Leave Application / Absence">Leave Application / Absence</option>
                      <option value="Library / Study Material Request">Library / Study Material Request</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Your Message</label>
                    <textarea
                      rows={4}
                      value={studentMessage}
                      onChange={(e) => setStudentMessage(e.target.value)}
                      placeholder="Write your note or question here..."
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-600"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-semibold flex items-center space-x-1.5 cursor-pointer shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Message</span>
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 12: MY PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4 mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-2xl bg-blue-950 text-amber-400 font-bold flex items-center justify-center text-2xl shadow-md">
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold font-serif text-slate-900">{student.name}</h2>
                      <p className="text-xs text-slate-500">Student ID: {student.studentId} • Admission: {student.admissionNo}</p>
                      <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Regular Student • Class {student.class} ({student.section})
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsPasswordModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-blue-50 text-blue-900 hover:bg-blue-100 font-bold text-xs flex items-center space-x-1.5 transition cursor-pointer self-start sm:self-center"
                  >
                    <Key className="w-4 h-4" />
                    <span>Change Password</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block font-semibold mb-1">Roll Number</span>
                    <span className="font-bold text-slate-800 text-sm">#{student.rollNo}</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block font-semibold mb-1">Class & Section</span>
                    <span className="font-bold text-slate-800 text-sm">{student.class} - {student.section}</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block font-semibold mb-1">Father / Guardian</span>
                    <span className="font-bold text-slate-800 text-sm">{student.parentName}</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block font-semibold mb-1">Parent Phone</span>
                    <span className="font-bold text-slate-800 text-sm">{student.parentPhone}</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block font-semibold mb-1">Academic Year</span>
                    <span className="font-bold text-slate-800 text-sm">{student.academicYear || '2026–2027'}</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block font-semibold mb-1">Residential Address</span>
                    <span className="font-bold text-slate-800 text-sm">{student.address}</span>
                  </div>
                </div>
              </div>

              {/* Password Change Modal */}
              {isPasswordModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-blue-950/60 backdrop-blur-xs">
                  <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
                    <h3 className="text-base font-bold text-slate-900 mb-1">Change Account Password</h3>
                    <p className="text-xs text-slate-500 mb-4">Set a private new password for student portal access</p>

                    {passwordError && (
                      <div className="p-3 mb-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                        {passwordError}
                      </div>
                    )}
                    {passwordSuccess && (
                      <div className="p-3 mb-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl">
                        {passwordSuccess}
                      </div>
                    )}

                    <form onSubmit={handleChangePassword} className="space-y-3.5 text-xs">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">New Password</label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Min 6 characters"
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                          required
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Confirm New Password</label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Repeat password"
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                          required
                        />
                      </div>

                      <div className="pt-3 flex items-center justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => setIsPasswordModalOpen(false)}
                          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isUpdatingPassword}
                          className="px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-semibold cursor-pointer disabled:opacity-50"
                        >
                          {isUpdatingPassword ? 'Updating...' : 'Save Password'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: FEE STATUS */}
          {activeTab === 'fees' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-bold font-serif text-slate-900">Student Fee Account & Receipts</h2>
                    <p className="text-xs text-slate-500">
                      Academic Year 2026–2027 • Admission #{student.admissionNo} • {student.name} ({student.class}-{student.section})
                    </p>
                  </div>
                  <div className="px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold inline-flex items-center gap-1.5 self-start sm:self-auto">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Account Active</span>
                  </div>
                </div>

                {/* Summary Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-xs text-slate-500 font-semibold block mb-1">Total Academic Fee</span>
                    <span className="text-2xl font-bold text-slate-900">₹28,500</span>
                    <span className="text-[11px] text-slate-400 block mt-1">Includes tuition, computer lab & sports</span>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                    <span className="text-xs text-emerald-800 font-semibold block mb-1">Total Fee Paid</span>
                    <span className="text-2xl font-bold text-emerald-900">₹19,000</span>
                    <span className="text-[11px] text-emerald-700 block mt-1">Terms 1 & 2 Cleared</span>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                    <span className="text-xs text-amber-800 font-semibold block mb-1">Balance Due</span>
                    <span className="text-2xl font-bold text-amber-900">₹9,500</span>
                    <span className="text-[11px] text-amber-700 block mt-1">Term 3 Due: 15 Jan 2027</span>
                  </div>
                </div>

                {/* Installments Table */}
                <h3 className="text-sm font-bold text-slate-900 mb-3">Installment Breakdown</h3>
                <div className="overflow-x-auto rounded-xl border border-slate-200 mb-6">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">Term / Description</th>
                        <th className="py-3 px-4">Amount</th>
                        <th className="py-3 px-4">Due Date</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Receipt #</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr className="hover:bg-slate-50/50">
                        <td className="py-3.5 px-4 font-semibold text-slate-900">Term 1 (Admissions & First Term)</td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">₹9,500</td>
                        <td className="py-3.5 px-4 text-slate-500">10 Jul 2026</td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            Paid (12-Jul-2026)
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-600">VV/26/084</td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => window.print()}
                            className="inline-flex items-center gap-1 text-blue-700 hover:text-blue-900 font-bold"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Receipt</span>
                          </button>
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="py-3.5 px-4 font-semibold text-slate-900">Term 2 (Mid-Term Fee)</td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">₹9,500</td>
                        <td className="py-3.5 px-4 text-slate-500">10 Oct 2026</td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            Paid (08-Oct-2026)
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-600">VV/26/412</td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => window.print()}
                            className="inline-flex items-center gap-1 text-blue-700 hover:text-blue-900 font-bold"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Receipt</span>
                          </button>
                        </td>
                      </tr>
                      <tr className="hover:bg-amber-50/30">
                        <td className="py-3.5 px-4 font-semibold text-slate-900">Term 3 (Final Board Prep Term)</td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">₹9,500</td>
                        <td className="py-3.5 px-4 text-amber-700 font-semibold">15 Jan 2027</td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                            Upcoming Due
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400">—</td>
                        <td className="py-3.5 px-4 text-right">
                          <span className="text-slate-400">Pay at Counter</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Counter & Bank Notice */}
                <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/80 text-xs text-blue-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold mb-1">Fee Payment Information & Counter Hours</h4>
                    <p className="text-slate-600 leading-relaxed">
                      School Accounts Counter operates Monday to Saturday: 9:00 AM – 4:30 PM. Accepted modes: Cash, Demand Draft, or UPI transfer at counter.
                    </p>
                  </div>
                  <a
                    href="tel:9441971531"
                    className="px-4 py-2 rounded-xl bg-blue-950 text-white font-bold text-xs shrink-0 hover:bg-blue-900 transition"
                  >
                    Office Helpline: 9441971531
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* TAB: ACADEMIC CALENDAR */}
          {activeTab === 'calendar' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-bold font-serif text-slate-900">AP State Board Academic Calendar 2026–27</h2>
                    <p className="text-xs text-slate-500">Vidya Vikas EM School, Kotauratla • Prescribed Working Days: 220 Days</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-900 border border-blue-200 text-xs font-bold self-start sm:self-auto">
                    Official Calendar
                  </span>
                </div>

                {/* Important Term Milestones */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider block mb-1">Term 1 Commencement</span>
                    <span className="text-sm font-bold text-slate-900 block">12 June 2026</span>
                    <span className="text-xs text-slate-500 mt-1 block">School reopening after summer vacation</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider block mb-1">SA-1 Mid-Term Exams</span>
                    <span className="text-sm font-bold text-slate-900 block">20 Sep – 28 Sep 2026</span>
                    <span className="text-xs text-slate-500 mt-1 block">Summative Assessment 1</span>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                    <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block mb-1">Sankranti Vacation</span>
                    <span className="text-sm font-bold text-slate-900 block">10 Jan – 18 Jan 2027</span>
                    <span className="text-xs text-amber-800 mt-1 block">Harvest festival recess</span>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                    <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider block mb-1">SSC Public Board Exams</span>
                    <span className="text-sm font-bold text-slate-900 block">18 March – 04 April 2027</span>
                    <span className="text-xs text-emerald-800 mt-1 block">Class X Final Examinations</span>
                  </div>
                </div>

                {/* Monthly Calendar Schedule */}
                <h3 className="text-sm font-bold text-slate-900 mb-3">Academic Working Schedule & Holiday Schedule</h3>
                <div className="space-y-3">
                  {[
                    { month: 'June 2026', days: 16, events: 'School Reopening (June 12), Orientation Assembly, Bridge Courses' },
                    { month: 'July 2026', days: 25, events: 'FA-1 Assessment (July 24-26), Tree Plantation Vanamahotsavam' },
                    { month: 'August 2026', days: 22, events: 'Independence Day Celebrations (Aug 15), FA-2 Assessment, Raksha Bandhan' },
                    { month: 'September 2026', days: 22, events: 'Teachers Day (Sep 5), Vinayaka Chavithi, SA-1 Mid-Term Examinations' },
                    { month: 'October 2026', days: 18, events: 'Gandhi Jayanthi (Oct 2), Dasara Holidays (Oct 9-18), Parent-Teacher Meet' },
                    { month: 'November 2026', days: 24, events: 'Children’s Day Sports Meet (Nov 14), FA-3 Assessment, Science Exhibition' },
                    { month: 'December 2026', days: 25, events: 'National Mathematics Day (Dec 22), Annual Cultural Day, Christmas Holiday' },
                    { month: 'January 2027', days: 19, events: 'Sankranti Holidays (Jan 10-18), Republic Day Parade (Jan 26), FA-4 Assessment' },
                    { month: 'February 2027', days: 23, events: 'Pre-Final Examinations for Class X, Maha Shivaratri, Practical Science Exams' },
                    { month: 'March 2027', days: 24, events: 'SSC Public Board Exams commence, SA-2 Annual Exams for Classes I to IX' },
                    { month: 'April 2027', days: 6, events: 'Results Announcement, Distribution of Progress Cards, Summer Vacation starts' },
                  ].map((m, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-blue-950 w-28 shrink-0">{m.month}</span>
                        <span className="text-slate-600">{m.events}</span>
                      </div>
                      <span className="px-2.5 py-1 rounded-md bg-blue-100 text-blue-900 font-bold shrink-0 self-start sm:self-auto">
                        {m.days} Working Days
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: DOWNLOADS & SYLLABUS */}
          {activeTab === 'downloads' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-bold font-serif text-slate-900">Academic Downloads & Syllabus Blueprint</h2>
                    <p className="text-xs text-slate-500">Official curriculum reference documents, model papers & school circulars</p>
                  </div>
                  <span className="text-xs font-semibold text-slate-500">Official SCERT & School Resources</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      title: 'Class X SSC Model Question Papers 2026–27',
                      desc: 'Complete AP State Board specimen papers for Telugu, Hindi, English, Mathematics, Physical Science, Biological Science, and Social Studies.',
                      size: '4.8 MB',
                      date: 'Updated Sep 2026',
                      category: 'Examination',
                    },
                    {
                      title: 'Academic Year 2026–27 Subject Syllabus & Weightage',
                      desc: 'Chapter-wise syllabus reduction, internal assessment distribution, and question paper blueprint guidelines.',
                      size: '2.4 MB',
                      date: 'June 2026',
                      category: 'Syllabus',
                    },
                    {
                      title: 'School Rules, Dress Code & Conduct Handbook',
                      desc: 'Guidelines on punctuality, neat uniform standards, morning assembly discipline, library rules, and code of conduct.',
                      size: '1.2 MB',
                      date: 'Annual Edition',
                      category: 'Handbook',
                    },
                    {
                      title: 'Science Laboratory Manual & Practical Record Guide',
                      desc: 'Step-by-step experiment instructions, ray diagram guidelines, and chemistry laboratory safety norms for high school students.',
                      size: '3.6 MB',
                      date: 'July 2026',
                      category: 'Laboratory',
                    },
                    {
                      title: 'Mathematics Formula Handbook & Quick Reference',
                      desc: 'Formulae sheet covering Algebra, Trigonometry, Coordinate Geometry, Mensuration, and Statistics for quick revision.',
                      size: '1.8 MB',
                      date: 'Aug 2026',
                      category: 'Study Aid',
                    },
                    {
                      title: 'English Grammar & Conversational Fluency Workbook',
                      desc: 'Tenses practice, active-passive voice, letter writing templates, and vocabulary exercises for English medium students.',
                      size: '2.9 MB',
                      date: 'July 2026',
                      category: 'Worksheet',
                    },
                  ].map((doc, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between hover:bg-slate-100/60 transition">
                      <div>
                        <div className="flex items-center justify-between text-[11px] mb-2">
                          <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 font-bold uppercase tracking-wider">
                            {doc.category}
                          </span>
                          <span className="text-slate-400">{doc.date}</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mb-1">{doc.title}</h4>
                        <p className="text-xs text-slate-600 leading-relaxed mb-4">{doc.desc}</p>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-200 text-xs">
                        <span className="text-slate-500 font-medium">PDF • {doc.size}</span>
                        <a
                          href={`#download-${idx}`}
                          onClick={(e) => {
                            e.preventDefault();
                            alert(`Downloading: ${doc.title} (Official School Document)`);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-bold transition shadow-xs"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
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
          onClick={() => setActiveTab('timetable')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-semibold transition cursor-pointer min-h-[44px] min-w-[44px] ${
            activeTab === 'timetable' ? 'text-blue-900 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-5 h-5 mb-0.5" />
          <span>Timetable</span>
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
          onClick={() => setActiveTab('attendance')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-semibold transition cursor-pointer min-h-[44px] min-w-[44px] ${
            activeTab === 'attendance' ? 'text-blue-900 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <CheckCircle2 className="w-5 h-5 mb-0.5" />
          <span>Attendance</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-semibold transition cursor-pointer min-h-[44px] min-w-[44px] ${
            activeTab === 'profile' ? 'text-blue-900 font-bold' : 'text-slate-500 hover:text-slate-900'
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
                { id: 'assignments', label: 'Assignments', icon: ClipboardList },
                { id: 'examinations', label: 'Exams', icon: Award },
                { id: 'results', label: 'Scorecard', icon: Award },
                { id: 'fees', label: 'Fee Status', icon: IndianRupee },
                { id: 'calendar', label: 'Calendar', icon: CalendarRange },
                { id: 'downloads', label: 'Downloads', icon: Download },
                { id: 'materials', label: 'Study Notes', icon: BookOpen },
                { id: 'notices', label: 'Notices', icon: Bell },
                { id: 'events', label: 'Events', icon: CalendarDays },
                { id: 'messages', label: 'Messages', icon: MessageSquare },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as StudentTabType);
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
