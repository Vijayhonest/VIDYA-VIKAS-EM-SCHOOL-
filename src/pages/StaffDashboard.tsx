import React, { useState, useEffect } from 'react';
import {
  School,
  LayoutDashboard,
  Users,
  Calendar,
  CheckCircle2,
  FileText,
  ClipboardList,
  Award,
  BookOpen,
  Bell,
  MessageSquare,
  User,
  LogOut,
  Home,
  Plus,
  Search,
  Filter,
  Download,
  Trash2,
  Edit,
  Clock,
  Check,
  X,
  AlertCircle,
  Menu,
  MoreHorizontal,
  ChevronRight,
  Phone,
  Send,
  Upload,
} from 'lucide-react';
import {
  staffService,
  StaffProfile,
  StaffStats,
  ClassInfo,
  StudyMaterial,
} from '../services/staffService';
import {
  Homework,
  AttendanceRecord,
  Exam,
  ExamResult,
  ContactEnquiry,
  Notice,
  TimetableEntry,
  Student,
} from '../types';

interface StaffDashboardProps {
  initialStaff: StaffProfile;
  onLogout: () => void;
  onExitToPublic: () => void;
}

type TabType =
  | 'dashboard'
  | 'classes'
  | 'timetable'
  | 'attendance'
  | 'homework'
  | 'assignments'
  | 'marks'
  | 'students'
  | 'materials'
  | 'notices'
  | 'messages'
  | 'profile';

export const StaffDashboard: React.FC<StaffDashboardProps> = ({
  initialStaff,
  onLogout,
  onExitToPublic,
}) => {
  const [staff, setStaff] = useState<StaffProfile>(initialStaff);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);
  const [showNotificationList, setShowNotificationList] = useState(false);

  // Core Data States
  const [stats, setStats] = useState<StaffStats>({
    assignedClassesCount: 3,
    assignedClasses: ['Class 10', 'Class 9', 'Class 8'],
    totalStudents: 38,
    todayClasses: 4,
    pendingTasks: 3,
  });
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [homeworkList, setHomeworkList] = useState<Homework[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [messages, setMessages] = useState<ContactEnquiry[]>([]);

  // Attendance tab states
  const [attendanceClass, setAttendanceClass] = useState('Class 10');
  const [attendanceDate, setAttendanceDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [attendanceStatusMap, setAttendanceStatusMap] = useState<Record<string, { status: 'present' | 'absent' | 'late'; remarks?: string }>>({});
  const [isSavingAttendance, setIsSavingAttendance] = useState(false);
  const [attendanceFeedback, setAttendanceFeedback] = useState<string | null>(null);

  // Homework tab states
  const [isCreateHwOpen, setIsCreateHwOpen] = useState(false);
  const [hwClass, setHwClass] = useState('Class 10');
  const [hwSubject, setHwSubject] = useState('Physical Science');
  const [hwTitle, setHwTitle] = useState('');
  const [hwDesc, setHwDesc] = useState('');
  const [hwDueDate, setHwDueDate] = useState('');
  const [hwAttachment, setHwAttachment] = useState('');
  const [hwFeedback, setHwFeedback] = useState<string | null>(null);

  // Marks Entry tab states
  const [marksClass, setMarksClass] = useState('Class 10');
  const [marksExamId, setMarksExamId] = useState('exam-002');
  const [marksSubject, setMarksSubject] = useState('Physical Science');
  const [marksInputMap, setMarksInputMap] = useState<Record<string, { internal: number; exam: number }>>({});
  const [isSavingMarks, setIsSavingMarks] = useState(false);
  const [marksFeedback, setMarksFeedback] = useState<string | null>(null);

  // Study Material tab states
  const [isUploadMatOpen, setIsUploadMatOpen] = useState(false);
  const [matClass, setMatClass] = useState('Class 10');
  const [matSubject, setMatSubject] = useState('Physical Science');
  const [matCategory, setMatCategory] = useState('Notes');
  const [matTitle, setMatTitle] = useState('');
  const [matDesc, setMatDesc] = useState('');
  const [matFeedback, setMatFeedback] = useState<string | null>(null);

  // Notice tab states
  const [isCreateNoticeOpen, setIsCreateNoticeOpen] = useState(false);
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeCategory, setNoticeCategory] = useState<'academic' | 'exam' | 'holiday' | 'sports' | 'general'>('academic');
  const [noticeContent, setNoticeContent] = useState('');

  // Message reply states
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudentForModal, setSelectedStudentForModal] = useState<Student | null>(null);

  // Load Data on Mount
  useEffect(() => {
    async function loadData() {
      try {
        const [
          statsData,
          classesData,
          ttData,
          stuData,
          hwData,
          examData,
          matData,
          noticesData,
          msgData,
        ] = await Promise.all([
          staffService.getStats(),
          staffService.getClasses(),
          staffService.getTimetable(),
          staffService.getStudents(),
          staffService.getHomework(),
          staffService.getExams(),
          staffService.getStudyMaterials(),
          staffService.getNotices(),
          staffService.getMessages(),
        ]);

        setStats(statsData);
        setClasses(classesData);
        setTimetable(ttData);
        setStudents(stuData);
        setHomeworkList(hwData);
        setExams(examData);
        setMaterials(matData);
        setNotices(noticesData);
        setMessages(msgData);
      } catch (err) {
        console.error('Error loading staff dashboard data:', err);
      }
    }
    loadData();
  }, []);

  // Update attendance sheet when class/date changes
  useEffect(() => {
    async function fetchAttendance() {
      const records = await staffService.getAttendance(attendanceClass, attendanceDate);
      const classStudents = students.filter((s) => s.class.toLowerCase() === attendanceClass.toLowerCase());
      const map: Record<string, { status: 'present' | 'absent' | 'late'; remarks?: string }> = {};

      classStudents.forEach((stu) => {
        const rec = records.find((r) => r.studentId === stu.studentId);
        map[stu.studentId] = {
          status: rec ? (rec.status as any) : 'present',
          remarks: rec?.remarks || '',
        };
      });
      setAttendanceStatusMap(map);
    }
    fetchAttendance();
  }, [attendanceClass, attendanceDate, students]);

  // Update marks sheet when class/exam changes
  useEffect(() => {
    async function fetchMarks() {
      const results = await staffService.getResults(marksExamId, marksClass);
      const classStudents = students.filter((s) => s.class.toLowerCase() === marksClass.toLowerCase());
      const map: Record<string, { internal: number; exam: number }> = {};

      classStudents.forEach((stu) => {
        const res = results.find((r) => r.studentId === stu.studentId);
        const sub = res?.subjects.find((s) => s.subject.toLowerCase() === marksSubject.toLowerCase());
        map[stu.studentId] = {
          internal: sub ? Math.round(sub.marksObtained * 0.2) : 18,
          exam: sub ? Math.round(sub.marksObtained * 0.8) : 42,
        };
      });
      setMarksInputMap(map);
    }
    fetchMarks();
  }, [marksClass, marksExamId, marksSubject, students]);

  // Greetings logic
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  // Quick Action Handlers
  const handleSaveAttendance = async () => {
    setIsSavingAttendance(true);
    setAttendanceFeedback(null);

    const records = Object.entries(attendanceStatusMap).map(([studentId, data]) => ({
      studentId,
      status: data.status,
      remarks: data.remarks,
    }));

    const res = await staffService.saveAttendance(attendanceDate, records);
    setIsSavingAttendance(false);

    if (res.success) {
      setAttendanceFeedback('✅ Attendance submitted and persisted successfully!');
      setTimeout(() => setAttendanceFeedback(null), 3000);
    } else {
      setAttendanceFeedback('❌ Failed to save attendance. Please try again.');
    }
  };

  const handleMarkAllPresent = () => {
    const nextMap: Record<string, { status: 'present' | 'absent' | 'late'; remarks?: string }> = {};
    const classStudents = students.filter((s) => s.class.toLowerCase() === attendanceClass.toLowerCase());
    classStudents.forEach((stu) => {
      nextMap[stu.studentId] = { status: 'present', remarks: 'Present on time' };
    });
    setAttendanceStatusMap(nextMap);
  };

  const handleCreateHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hwTitle || !hwDueDate) return;

    const res = await staffService.createHomework({
      class: hwClass,
      subject: hwSubject,
      title: hwTitle,
      description: hwDesc,
      dueDate: hwDueDate,
      attachmentName: hwAttachment || undefined,
    });

    if (res.success && res.homework) {
      setHomeworkList([res.homework, ...homeworkList]);
      setIsCreateHwOpen(false);
      setHwTitle('');
      setHwDesc('');
      setHwDueDate('');
      setHwAttachment('');
      setHwFeedback('Homework assigned successfully!');
      setTimeout(() => setHwFeedback(null), 3000);
    }
  };

  const handleDeleteHomework = async (id: string) => {
    if (!confirm('Are you sure you want to delete this homework?')) return;
    const ok = await staffService.deleteHomework(id);
    if (ok) {
      setHomeworkList(homeworkList.filter((h) => h.id !== id));
    }
  };

  const handleSaveMarks = async () => {
    setIsSavingMarks(true);
    setMarksFeedback(null);

    const marksList = Object.entries(marksInputMap).map(([studentId, marks]) => {
      const total = (marks.internal || 0) + (marks.exam || 0);
      const grade = total >= 45 ? 'A1' : total >= 40 ? 'A2' : total >= 35 ? 'B1' : total >= 30 ? 'B2' : 'C';
      return {
        studentId,
        subject: marksSubject,
        marksObtained: total,
        maxMarks: 50,
        grade,
        internalMarks: marks.internal,
        examMarks: marks.exam,
      };
    });

    const res = await staffService.saveMarks({
      examId: marksExamId,
      examName: exams.find((e) => e.id === marksExamId)?.name || 'Formative Assessment',
      marksList,
    });
    setIsSavingMarks(false);

    if (res.success) {
      setMarksFeedback('✅ Academic marks saved and updated in central database!');
      setTimeout(() => setMarksFeedback(null), 3500);
    } else {
      setMarksFeedback('❌ Failed to save marks. Please retry.');
    }
  };

  const handleUploadMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matTitle) return;

    const res = await staffService.uploadStudyMaterial({
      title: matTitle,
      class: matClass,
      subject: matSubject,
      category: matCategory,
      description: matDesc,
    });

    if (res.success && res.material) {
      setMaterials([res.material, ...materials]);
      setIsUploadMatOpen(false);
      setMatTitle('');
      setMatDesc('');
      setMatFeedback('Material uploaded successfully for student access!');
      setTimeout(() => setMatFeedback(null), 3000);
    }
  };

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle || !noticeContent) return;

    const res = await staffService.createNotice({
      title: noticeTitle,
      category: noticeCategory,
      content: noticeContent,
      summary: noticeContent.substring(0, 90),
    });

    if (res.success && res.notice) {
      setNotices([res.notice, ...notices]);
      setIsCreateNoticeOpen(false);
      setNoticeTitle('');
      setNoticeContent('');
    }
  };

  const handleSendReply = async (messageId: string) => {
    const text = replyTextMap[messageId];
    if (!text) return;
    const res = await staffService.replyMessage(messageId, text);
    if (res.success) {
      setMessages(
        messages.map((m) =>
          m.id === messageId ? { ...m, status: 'replied', reply: text, repliedAt: new Date().toISOString() } : m
        )
      );
      setReplyTextMap({ ...replyTextMap, [messageId]: '' });
    }
  };

  // Nav items list
  const navItems: Array<{ id: TabType; label: string; icon: React.FC<{ className?: string }>; badge?: number }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'classes', label: 'My Classes', icon: Users, badge: classes.length },
    { id: 'timetable', label: 'Timetable', icon: Calendar },
    { id: 'attendance', label: 'Attendance', icon: CheckCircle2 },
    { id: 'homework', label: 'Homework', icon: FileText, badge: homeworkList.length },
    { id: 'assignments', label: 'Assignments', icon: ClipboardList },
    { id: 'marks', label: 'Marks Entry', icon: Award },
    { id: 'students', label: 'Students', icon: Users, badge: students.length },
    { id: 'materials', label: 'Study Materials', icon: BookOpen, badge: materials.length },
    { id: 'notices', label: 'Notices', icon: Bell, badge: notices.length },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: messages.filter((m) => m.status === 'unread').length },
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
                  Staff Portal
                </span>
                <span className="text-xs text-blue-400">•</span>
                <span className="text-xs text-blue-200">Academic Year 2026–2027</span>
              </div>
              <h1 className="text-base sm:text-lg font-bold font-serif leading-tight">
                Vidya Vikas EM School
              </h1>
            </div>
          </div>

          {/* User & Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Notification Trigger */}
            <div className="relative">
              <button
                onClick={() => setShowNotificationList(!showNotificationList)}
                className="p-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-blue-200 hover:text-white transition relative cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {notificationCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-blue-950 animate-pulse"></span>
                )}
              </button>

              {showNotificationList && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-50 text-slate-800 text-xs animate-fadeIn">
                  <div className="font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
                    <span>Staff Notifications</span>
                    <button
                      onClick={() => setNotificationCount(0)}
                      className="text-[11px] text-blue-600 hover:underline cursor-pointer"
                    >
                      Mark read
                    </button>
                  </div>
                  <div className="divide-y divide-slate-100 py-1 max-h-56 overflow-y-auto">
                    <div className="py-2">
                      <p className="font-semibold text-slate-800">Formative Assessment 2 Marks Due</p>
                      <p className="text-[11px] text-slate-500">Please submit Class 10 & 9 marks before Friday.</p>
                    </div>
                    <div className="py-2">
                      <p className="font-semibold text-slate-800">Parent Inquiry Received</p>
                      <p className="text-[11px] text-slate-500">K. Venkata Ramana inquired regarding science practicals.</p>
                    </div>
                    <div className="py-2">
                      <p className="font-semibold text-slate-800">School Assembly Routine</p>
                      <p className="text-[11px] text-slate-500">Special science day exhibition prep during period 8.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Staff Badge */}
            <div className="hidden md:flex items-center space-x-2.5 bg-blue-900/80 px-3 py-1.5 rounded-xl border border-blue-800/80">
              <div className="w-7 h-7 rounded-lg bg-amber-400 text-blue-950 font-bold flex items-center justify-center text-xs">
                {staff.name.charAt(0)}
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-white leading-tight">{staff.name}</div>
                <div className="text-[10px] text-blue-200">{staff.subject}</div>
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
              Teacher Navigation
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
                      <div className="text-xs font-bold text-blue-950">Staff Portal</div>
                      <div className="text-[11px] text-slate-500">{staff.name}</div>
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
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Welcome Card */}
              <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-blue-900 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
                <div className="relative z-10 max-w-2xl">
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-300/30 text-amber-300 text-xs font-semibold mb-3">
                    <span>Academic Year 2026–2027</span>
                    <span>•</span>
                    <span>Kotauratla, AP</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold font-serif mb-2">
                    {greeting}, {staff.name} 👋
                  </h2>
                  <p className="text-sm text-blue-200 leading-relaxed mb-6">
                    Welcome to your Vidya Vikas EM School faculty console. Manage classroom attendance, assign weekly homework, record assessment marks, and communicate seamlessly with school administration.
                  </p>

                  <div className="flex flex-wrap gap-2.5 text-xs">
                    <button
                      onClick={() => setActiveTab('attendance')}
                      className="px-4 py-2 rounded-xl bg-amber-400 text-blue-950 font-bold hover:bg-amber-300 transition shadow-sm cursor-pointer"
                    >
                      Mark Today's Attendance
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('homework');
                        setIsCreateHwOpen(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-blue-800/80 text-white font-semibold hover:bg-blue-700 transition cursor-pointer"
                    >
                      Assign New Homework
                    </button>
                    <button
                      onClick={() => setActiveTab('marks')}
                      className="px-4 py-2 rounded-xl bg-blue-800/80 text-white font-semibold hover:bg-blue-700 transition cursor-pointer"
                    >
                      Enter Assessment Marks
                    </button>
                  </div>
                </div>
              </div>

              {/* Four Key Statistics Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Assigned Classes
                    </span>
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900">{stats.assignedClassesCount}</div>
                  <div className="text-xs text-slate-500 mt-1">{stats.assignedClasses.join(', ')}</div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Total Students
                    </span>
                    <Award className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900">{stats.totalStudents}</div>
                  <div className="text-xs text-slate-500 mt-1">Across assigned sections</div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Today's Periods
                    </span>
                    <Calendar className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900">{stats.todayClasses} Classes</div>
                  <div className="text-xs text-emerald-600 font-semibold mt-1">Class 10, 9 & 8</div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Pending Tasks
                    </span>
                    <ClipboardList className="w-5 h-5 text-amber-500" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900">{stats.pendingTasks}</div>
                  <div className="text-xs text-amber-600 font-semibold mt-1">FA-2 Marks & Attendance</div>
                </div>
              </div>

              {/* Today's Schedule & Quick Action Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Today's Timetable */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-xs border border-slate-200/80 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Today's Class Schedule</h3>
                      <p className="text-xs text-slate-500">Your scheduled periods for Monday</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('timetable')}
                      className="text-xs font-bold text-blue-700 hover:underline flex items-center space-x-1 cursor-pointer"
                    >
                      <span>Full Week</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {[
                      { period: 1, time: '09:00 AM – 09:45 AM', class: 'Class 10 - A', subject: 'Physical Science', room: 'Room 204' },
                      { period: 3, time: '10:45 AM – 11:30 AM', class: 'Class 9 - A', subject: 'Physical Science', room: 'Room 202' },
                      { period: 6, time: '01:45 PM – 02:30 PM', class: 'Class 10 - A', subject: 'Science Laboratory', room: 'Science Lab' },
                      { period: 8, time: '03:25 PM – 04:10 PM', class: 'Class 8 - A', subject: 'General Science & Study', room: 'Room 105' },
                    ].map((slot, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition gap-2"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="w-8 h-8 rounded-lg bg-blue-900 text-white font-bold flex items-center justify-center text-xs">
                            P{slot.period}
                          </span>
                          <div>
                            <div className="text-xs font-bold text-slate-900">{slot.subject}</div>
                            <div className="text-[11px] text-slate-500">{slot.class} • {slot.room}</div>
                          </div>
                        </div>
                        <div className="text-xs font-medium text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200 sm:self-center self-start">
                          {slot.time}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Shortcuts & Notices */}
                <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-6 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 mb-1">Administrative Bulletins</h3>
                    <p className="text-xs text-slate-500 mb-4">Official school circulars for staff</p>

                    <div className="space-y-3">
                      {notices.slice(0, 3).map((n) => (
                        <div key={n.id} className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-xs">
                          <div className="font-bold text-blue-950 mb-0.5">{n.title}</div>
                          <div className="text-[11px] text-slate-600 line-clamp-2">{n.summary}</div>
                          <div className="text-[10px] text-slate-400 mt-1">{n.date}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <button
                      onClick={() => setActiveTab('notices')}
                      className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                    >
                      View All Notices ({notices.length})
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MY CLASSES */}
          {activeTab === 'classes' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold font-serif text-slate-900">My Assigned Classes</h2>
                  <p className="text-xs text-slate-500">Sections assigned to your academic schedule</p>
                </div>
                <button
                  onClick={() => setActiveTab('attendance')}
                  className="px-4 py-2 rounded-xl bg-blue-900 text-white font-semibold text-xs hover:bg-blue-800 transition cursor-pointer"
                >
                  Go to Attendance Register
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {classes.map((cls) => (
                  <div key={cls.id} className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 hover:shadow-md transition">
                    <div className="flex items-center justify-between mb-4">
                      <span className="w-12 h-12 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center font-bold text-base">
                        {cls.name.replace('Class ', '')}
                      </span>
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Section {cls.section}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 mb-1">{cls.name}</h3>
                    <p className="text-xs text-slate-500 mb-4">{cls.subject} • {cls.room}</p>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Enrolled</span>
                        <span className="font-bold text-slate-800">{cls.studentCount} Students</span>
                      </div>
                      <button
                        onClick={() => {
                          setAttendanceClass(cls.name);
                          setActiveTab('attendance');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-900 font-bold hover:bg-blue-100 transition cursor-pointer"
                      >
                        Attendance →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: TIMETABLE */}
          {activeTab === 'timetable' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80">
                <h2 className="text-xl font-bold font-serif text-slate-900">Weekly Faculty Timetable</h2>
                <p className="text-xs text-slate-500">Vidya Vikas EM School • Monday to Saturday Period Allocations</p>
              </div>

              <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
                <div className="p-4 border-b border-slate-200 font-bold text-sm text-slate-800">
                  Full Week Class Schedule
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">Day</th>
                        <th className="py-3 px-4">Period</th>
                        <th className="py-3 px-4">Class</th>
                        <th className="py-3 px-4">Subject</th>
                        <th className="py-3 px-4">Timing</th>
                        <th className="py-3 px-4">Faculty</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {timetable.slice(0, 16).map((slot) => (
                        <tr key={slot.id} className="hover:bg-slate-50/80">
                          <td className="py-3 px-4 font-bold text-slate-900">{slot.dayOfWeek}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-900 font-bold">
                              Period {slot.period}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-800">{slot.class} - {slot.section}</td>
                          <td className="py-3 px-4 text-blue-950 font-bold">{slot.subject}</td>
                          <td className="py-3 px-4 text-slate-600">{slot.time}</td>
                          <td className="py-3 px-4 text-slate-500">{slot.teacherName}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ATTENDANCE MANAGEMENT */}
          {activeTab === 'attendance' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-bold font-serif text-slate-900">Classroom Attendance Register</h2>
                    <p className="text-xs text-slate-500">Record daily attendance for assigned sections</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={handleMarkAllPresent}
                      className="px-3 py-2 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 font-bold text-xs transition cursor-pointer"
                    >
                      Mark All Present
                    </button>
                    <button
                      onClick={handleSaveAttendance}
                      disabled={isSavingAttendance}
                      className="px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition cursor-pointer disabled:opacity-50"
                    >
                      {isSavingAttendance ? 'Saving...' : 'Save Attendance'}
                    </button>
                  </div>
                </div>

                {attendanceFeedback && (
                  <div className="p-3 mb-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-semibold animate-fadeIn">
                    {attendanceFeedback}
                  </div>
                )}

                {/* Filter Controls: Class & Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 mb-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                      Select Class Section
                    </label>
                    <select
                      value={attendanceClass}
                      onChange={(e) => setAttendanceClass(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    >
                      <option value="Class 10">Class 10 - Section A</option>
                      <option value="Class 9">Class 9 - Section A</option>
                      <option value="Class 8">Class 8 - Section A</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                      Attendance Date
                    </label>
                    <input
                      type="date"
                      value={attendanceDate}
                      onChange={(e) => setAttendanceDate(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Students Attendance List */}
                <div className="overflow-hidden border border-slate-200 rounded-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-3 px-4">Roll No</th>
                          <th className="py-3 px-4">Student ID</th>
                          <th className="py-3 px-4">Student Name</th>
                          <th className="py-3 px-4 text-center">Status</th>
                          <th className="py-3 px-4">Remarks</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {students
                          .filter((s) => s.class.toLowerCase() === attendanceClass.toLowerCase())
                          .map((stu) => {
                            const current = attendanceStatusMap[stu.studentId] || { status: 'present', remarks: '' };
                            return (
                              <tr key={stu.studentId} className="hover:bg-slate-50">
                                <td className="py-3 px-4 font-bold text-slate-900">{stu.rollNo}</td>
                                <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{stu.studentId}</td>
                                <td className="py-3 px-4 font-semibold text-slate-900">{stu.name}</td>
                                <td className="py-3 px-4 text-center">
                                  <div className="inline-flex rounded-lg p-1 bg-slate-100 border border-slate-200 space-x-1">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setAttendanceStatusMap({
                                          ...attendanceStatusMap,
                                          [stu.studentId]: { ...current, status: 'present' },
                                        })
                                      }
                                      className={`px-2.5 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                                        current.status === 'present'
                                          ? 'bg-emerald-600 text-white shadow-xs'
                                          : 'text-slate-600 hover:text-slate-900'
                                      }`}
                                    >
                                      Present
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setAttendanceStatusMap({
                                          ...attendanceStatusMap,
                                          [stu.studentId]: { ...current, status: 'absent' },
                                        })
                                      }
                                      className={`px-2.5 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                                        current.status === 'absent'
                                          ? 'bg-rose-600 text-white shadow-xs'
                                          : 'text-slate-600 hover:text-slate-900'
                                      }`}
                                    >
                                      Absent
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setAttendanceStatusMap({
                                          ...attendanceStatusMap,
                                          [stu.studentId]: { ...current, status: 'late' },
                                        })
                                      }
                                      className={`px-2.5 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                                        current.status === 'late'
                                          ? 'bg-amber-500 text-white shadow-xs'
                                          : 'text-slate-600 hover:text-slate-900'
                                      }`}
                                    >
                                      Late
                                    </button>
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <input
                                    type="text"
                                    placeholder="Optional note..."
                                    value={current.remarks || ''}
                                    onChange={(e) =>
                                      setAttendanceStatusMap({
                                        ...attendanceStatusMap,
                                        [stu.studentId]: { ...current, remarks: e.target.value },
                                      })
                                    }
                                    className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
                                  />
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: HOMEWORK MANAGEMENT */}
          {activeTab === 'homework' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold font-serif text-slate-900">Homework & Assignments</h2>
                  <p className="text-xs text-slate-500">Create, review, and organize homework tasks</p>
                </div>
                <button
                  onClick={() => setIsCreateHwOpen(true)}
                  className="px-4 py-2 rounded-xl bg-blue-900 text-white font-semibold text-xs hover:bg-blue-800 transition flex items-center space-x-1.5 shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Assign Homework</span>
                </button>
              </div>

              {hwFeedback && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                  {hwFeedback}
                </div>
              )}

              {/* Homework Cards List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {homeworkList.map((hw) => (
                  <div key={hw.id} className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 hover:shadow-md transition flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-900 border border-blue-100">
                          {hw.class} • {hw.subject}
                        </span>
                        <div className="flex items-center space-x-1 text-slate-400">
                          <button
                            onClick={() => handleDeleteHomework(hw.id)}
                            className="p-1 rounded hover:text-rose-600 transition cursor-pointer"
                            title="Delete homework"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 mb-1">{hw.title}</h3>
                      <p className="text-xs text-slate-600 line-clamp-3 mb-3">{hw.description}</p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-1 text-slate-500">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        <span>Due: {hw.dueDate}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        {hw.submissions?.length || 0} Submissions
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Create Homework Modal */}
              {isCreateHwOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-blue-950/60 backdrop-blur-xs">
                  <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                      <h3 className="text-base font-bold text-slate-900">Assign New Homework</h3>
                      <button
                        onClick={() => setIsCreateHwOpen(false)}
                        className="text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleCreateHomework} className="space-y-3.5 text-xs">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Target Class</label>
                          <select
                            value={hwClass}
                            onChange={(e) => setHwClass(e.target.value)}
                            className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                          >
                            <option value="Class 10">Class 10 - Section A</option>
                            <option value="Class 9">Class 9 - Section A</option>
                            <option value="Class 8">Class 8 - Section A</option>
                          </select>
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Subject</label>
                          <input
                            type="text"
                            value={hwSubject}
                            onChange={(e) => setHwSubject(e.target.value)}
                            className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Homework Title</label>
                        <input
                          type="text"
                          value={hwTitle}
                          onChange={(e) => setHwTitle(e.target.value)}
                          placeholder="e.g. Chemical Reactions & Balancing Equations"
                          className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                          required
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Instructions / Description</label>
                        <textarea
                          rows={3}
                          value={hwDesc}
                          onChange={(e) => setHwDesc(e.target.value)}
                          placeholder="Specify exercises, page numbers, or questions..."
                          className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Due Date</label>
                          <input
                            type="date"
                            value={hwDueDate}
                            onChange={(e) => setHwDueDate(e.target.value)}
                            className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                            required
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Attachment File Name</label>
                          <input
                            type="text"
                            value={hwAttachment}
                            onChange={(e) => setHwAttachment(e.target.value)}
                            placeholder="e.g. Worksheet_Ch2.pdf"
                            className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                          />
                        </div>
                      </div>

                      <div className="pt-3 flex items-center justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => setIsCreateHwOpen(false)}
                          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-semibold shadow-sm cursor-pointer"
                        >
                          Assign Homework
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: MARKS ENTRY */}
          {activeTab === 'marks' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-bold font-serif text-slate-900">Academic Marks Entry</h2>
                    <p className="text-xs text-slate-500">Record assessment scores and compute academic grades</p>
                  </div>

                  <button
                    onClick={handleSaveMarks}
                    disabled={isSavingMarks}
                    className="px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition cursor-pointer disabled:opacity-50"
                  >
                    {isSavingMarks ? 'Saving...' : 'Save & Publish Marks'}
                  </button>
                </div>

                {marksFeedback && (
                  <div className="p-3 mb-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-semibold animate-fadeIn">
                    {marksFeedback}
                  </div>
                )}

                {/* Filter Controls: Exam, Class, Subject */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 mb-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                      Assessment Exam
                    </label>
                    <select
                      value={marksExamId}
                      onChange={(e) => setMarksExamId(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    >
                      {exams.map((ex) => (
                        <option key={ex.id} value={ex.id}>{ex.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                      Class Section
                    </label>
                    <select
                      value={marksClass}
                      onChange={(e) => setMarksClass(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    >
                      <option value="Class 10">Class 10 - Section A</option>
                      <option value="Class 9">Class 9 - Section A</option>
                      <option value="Class 8">Class 8 - Section A</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                      Subject
                    </label>
                    <select
                      value={marksSubject}
                      onChange={(e) => setMarksSubject(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    >
                      <option value="Physical Science">Physical Science</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="English">English</option>
                      <option value="Social Studies">Social Studies</option>
                    </select>
                  </div>
                </div>

                {/* Marks Entry Table */}
                <div className="overflow-hidden border border-slate-200 rounded-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-3 px-4">Roll</th>
                          <th className="py-3 px-4">Student Name</th>
                          <th className="py-3 px-4">Internal Marks (Max 10)</th>
                          <th className="py-3 px-4">Exam Marks (Max 40)</th>
                          <th className="py-3 px-4">Total (Max 50)</th>
                          <th className="py-3 px-4 text-center">Grade</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {students
                          .filter((s) => s.class.toLowerCase() === marksClass.toLowerCase())
                          .map((stu) => {
                            const val = marksInputMap[stu.studentId] || { internal: 8, exam: 36 };
                            const total = Number(val.internal || 0) + Number(val.exam || 0);
                            const grade = total >= 45 ? 'A1' : total >= 40 ? 'A2' : total >= 35 ? 'B1' : total >= 30 ? 'B2' : 'C';

                            return (
                              <tr key={stu.studentId} className="hover:bg-slate-50">
                                <td className="py-3 px-4 font-bold text-slate-900">{stu.rollNo}</td>
                                <td className="py-3 px-4 font-semibold text-slate-900">{stu.name}</td>
                                <td className="py-3 px-4">
                                  <input
                                    type="number"
                                    min={0}
                                    max={10}
                                    value={val.internal}
                                    onChange={(e) =>
                                      setMarksInputMap({
                                        ...marksInputMap,
                                        [stu.studentId]: { ...val, internal: Number(e.target.value) },
                                      })
                                    }
                                    className="w-20 px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs text-center font-bold"
                                  />
                                </td>
                                <td className="py-3 px-4">
                                  <input
                                    type="number"
                                    min={0}
                                    max={40}
                                    value={val.exam}
                                    onChange={(e) =>
                                      setMarksInputMap({
                                        ...marksInputMap,
                                        [stu.studentId]: { ...val, exam: Number(e.target.value) },
                                      })
                                    }
                                    className="w-20 px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs text-center font-bold"
                                  />
                                </td>
                                <td className="py-3 px-4 font-bold text-slate-900">{total} / 50</td>
                                <td className="py-3 px-4 text-center">
                                  <span
                                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                      grade.startsWith('A')
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-blue-100 text-blue-800'
                                    }`}
                                  >
                                    {grade}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: STUDENT MANAGEMENT */}
          {activeTab === 'students' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-bold font-serif text-slate-900">Student Roster</h2>
                    <p className="text-xs text-slate-500">Student enrollment, roll numbers, and parent contacts</p>
                  </div>

                  <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search student or roll..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div className="overflow-hidden border border-slate-200 rounded-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-3 px-4">Roll</th>
                          <th className="py-3 px-4">Student ID</th>
                          <th className="py-3 px-4">Student Name</th>
                          <th className="py-3 px-4">Class</th>
                          <th className="py-3 px-4">Parent Details</th>
                          <th className="py-3 px-4">Attendance</th>
                          <th className="py-3 px-4 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {students
                          .filter(
                            (s) =>
                              !studentSearch ||
                              s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
                              s.studentId.toLowerCase().includes(studentSearch.toLowerCase()) ||
                              s.rollNo.includes(studentSearch)
                          )
                          .map((stu) => (
                            <tr key={stu.studentId} className="hover:bg-slate-50">
                              <td className="py-3 px-4 font-bold text-slate-900">{stu.rollNo}</td>
                              <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{stu.studentId}</td>
                              <td className="py-3 px-4 font-bold text-slate-900">{stu.name}</td>
                              <td className="py-3 px-4 text-slate-700">{stu.class} - {stu.section}</td>
                              <td className="py-3 px-4 text-slate-600">
                                <div>{stu.parentName}</div>
                                <div className="text-[10px] text-slate-400">{stu.parentPhone}</div>
                              </td>
                              <td className="py-3 px-4">
                                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  86% (Good)
                                </span>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <button
                                  onClick={() => setSelectedStudentForModal(stu)}
                                  className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-900 font-bold hover:bg-blue-100 transition cursor-pointer"
                                >
                                  View
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: STUDY MATERIALS */}
          {activeTab === 'materials' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold font-serif text-slate-900">Digital Study Materials</h2>
                  <p className="text-xs text-slate-500">Share PDFs, lesson notes, and model question papers with students</p>
                </div>
                <button
                  onClick={() => setIsUploadMatOpen(true)}
                  className="px-4 py-2 rounded-xl bg-blue-900 text-white font-semibold text-xs hover:bg-blue-800 transition flex items-center space-x-1.5 shadow-sm cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Material</span>
                </button>
              </div>

              {matFeedback && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                  {matFeedback}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {materials.map((mat) => (
                  <div key={mat.id} className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 hover:shadow-md transition flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                          {mat.category}
                        </span>
                        <span className="text-[10px] text-slate-400">{mat.class}</span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 mb-1">{mat.title}</h3>
                      <p className="text-xs text-slate-600 line-clamp-2 mb-3">{mat.description}</p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span>{mat.fileSize}</span>
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          alert(`Downloading: ${mat.fileName}`);
                        }}
                        className="flex items-center space-x-1 text-blue-700 font-bold hover:underline"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              {/* Upload Material Modal */}
              {isUploadMatOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-blue-950/60 backdrop-blur-xs">
                  <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                      <h3 className="text-base font-bold text-slate-900">Upload Study Material</h3>
                      <button
                        onClick={() => setIsUploadMatOpen(false)}
                        className="text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleUploadMaterial} className="space-y-3.5 text-xs">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Material Title</label>
                        <input
                          type="text"
                          value={matTitle}
                          onChange={(e) => setMatTitle(e.target.value)}
                          placeholder="e.g. Chapter 3 Refraction Revision Notes"
                          className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Class</label>
                          <select
                            value={matClass}
                            onChange={(e) => setMatClass(e.target.value)}
                            className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                          >
                            <option value="Class 10">Class 10</option>
                            <option value="Class 9">Class 9</option>
                            <option value="Class 8">Class 8</option>
                          </select>
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Category</label>
                          <select
                            value={matCategory}
                            onChange={(e) => setMatCategory(e.target.value)}
                            className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                          >
                            <option value="Notes">Notes</option>
                            <option value="PDFs">PDFs</option>
                            <option value="Assignments">Assignments</option>
                            <option value="Question Papers">Question Papers</option>
                            <option value="Video Lessons">Video Lessons</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Subject</label>
                        <input
                          type="text"
                          value={matSubject}
                          onChange={(e) => setMatSubject(e.target.value)}
                          className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                          required
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Description</label>
                        <textarea
                          rows={3}
                          value={matDesc}
                          onChange={(e) => setMatDesc(e.target.value)}
                          placeholder="Brief summary of key formulas, diagrams, or exercises..."
                          className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                        />
                      </div>

                      <div className="pt-3 flex items-center justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => setIsUploadMatOpen(false)}
                          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-semibold shadow-sm cursor-pointer"
                        >
                          Upload Material
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 9: NOTICES */}
          {activeTab === 'notices' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold font-serif text-slate-900">School Notices & Circulars</h2>
                  <p className="text-xs text-slate-500">Publish and view official school communications</p>
                </div>
                <button
                  onClick={() => setIsCreateNoticeOpen(true)}
                  className="px-4 py-2 rounded-xl bg-blue-900 text-white font-semibold text-xs hover:bg-blue-800 transition flex items-center space-x-1.5 shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Notice</span>
                </button>
              </div>

              <div className="space-y-3">
                {notices.map((n) => (
                  <div key={n.id} className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-900">
                        {n.category}
                      </span>
                      <span className="text-xs text-slate-400">{n.date}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mb-1">{n.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed mb-2">{n.content}</p>
                    <div className="text-[11px] text-slate-400 italic">Posted by: {n.postedBy}</div>
                  </div>
                ))}
              </div>

              {/* Create Notice Modal */}
              {isCreateNoticeOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-blue-950/60 backdrop-blur-xs">
                  <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                      <h3 className="text-base font-bold text-slate-900">Publish Notice</h3>
                      <button
                        onClick={() => setIsCreateNoticeOpen(false)}
                        className="text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleCreateNotice} className="space-y-3.5 text-xs">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Notice Title</label>
                        <input
                          type="text"
                          value={noticeTitle}
                          onChange={(e) => setNoticeTitle(e.target.value)}
                          placeholder="e.g. Science Fair Project Submission Date"
                          className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                          required
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Category</label>
                        <select
                          value={noticeCategory}
                          onChange={(e) => setNoticeCategory(e.target.value as any)}
                          className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                        >
                          <option value="academic">Academic</option>
                          <option value="exam">Exam</option>
                          <option value="holiday">Holiday</option>
                          <option value="sports">Sports</option>
                          <option value="general">General</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Notice Content</label>
                        <textarea
                          rows={4}
                          value={noticeContent}
                          onChange={(e) => setNoticeContent(e.target.value)}
                          placeholder="Detailed announcement details..."
                          className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                          required
                        />
                      </div>

                      <div className="pt-3 flex items-center justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => setIsCreateNoticeOpen(false)}
                          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-semibold shadow-sm cursor-pointer"
                        >
                          Publish Notice
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 10: MESSAGES / INQUIRIES */}
          {activeTab === 'messages' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80">
                <h2 className="text-xl font-bold font-serif text-slate-900">Communication & Inquiries</h2>
                <p className="text-xs text-slate-500">Inquiries and messages from parents and school administrative desk</p>
              </div>

              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center text-slate-400">
                    <MessageSquare className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-semibold">No pending inquiries</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="font-bold text-slate-900 text-xs">
                          {msg.name} ({msg.phone})
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            msg.status === 'replied'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {msg.status === 'replied' ? 'Replied' : 'Pending Reply'}
                        </span>
                      </div>

                      <div className="font-semibold text-slate-800 text-xs mb-1">{msg.subject}</div>
                      <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 mb-3">
                        {msg.message}
                      </p>

                      {msg.reply && (
                        <div className="text-xs bg-blue-50/70 p-3 rounded-xl border border-blue-100 text-blue-950 mb-3">
                          <span className="font-bold block text-[11px] text-blue-800">Staff Response:</span>
                          {msg.reply}
                        </div>
                      )}

                      {msg.status !== 'replied' && (
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            placeholder="Type reply to parent..."
                            value={replyTextMap[msg.id] || ''}
                            onChange={(e) => setReplyTextMap({ ...replyTextMap, [msg.id]: e.target.value })}
                            className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-600"
                          />
                          <button
                            onClick={() => handleSendReply(msg.id)}
                            className="px-3.5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-semibold flex items-center space-x-1 cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Reply</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 11: PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-blue-950 text-amber-400 font-bold flex items-center justify-center text-2xl shadow-md">
                    {staff.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold font-serif text-slate-900">{staff.name}</h2>
                    <p className="text-xs text-slate-500">{staff.designation} • {staff.department}</p>
                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Active Faculty Member
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block font-semibold mb-1">Primary Subject</span>
                    <span className="font-bold text-slate-800 text-sm">{staff.subject}</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block font-semibold mb-1">Assigned Classes</span>
                    <span className="font-bold text-slate-800 text-sm">Class 10, Class 9, Class 8</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block font-semibold mb-1">Academic Qualifications</span>
                    <span className="font-bold text-slate-800 text-sm">{staff.qualification || 'M.Sc., B.Ed.'}</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block font-semibold mb-1">Teaching Experience</span>
                    <span className="font-bold text-slate-800 text-sm">{staff.experience || '9 Years in Secondary Education'}</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block font-semibold mb-1">Institutional Contact</span>
                    <span className="font-bold text-slate-800 text-sm">{staff.phone || '9441971531'}</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block font-semibold mb-1">Staff Email</span>
                    <span className="font-bold text-slate-800 text-sm">{staff.email || 'lakshminarayana@vvems.edu.in'}</span>
                  </div>
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
          onClick={() => setActiveTab('marks')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-semibold transition cursor-pointer min-h-[44px] min-w-[44px] ${
            activeTab === 'marks' ? 'text-blue-900 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Award className="w-5 h-5 mb-0.5" />
          <span>Marks</span>
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
                { id: 'classes', label: 'My Classes', icon: Users },
                { id: 'timetable', label: 'Timetable', icon: Calendar },
                { id: 'assignments', label: 'Assignments', icon: ClipboardList },
                { id: 'students', label: 'Students', icon: Users },
                { id: 'materials', label: 'Study Notes', icon: BookOpen },
                { id: 'notices', label: 'Notices', icon: Bell },
                { id: 'messages', label: 'Messages', icon: MessageSquare },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as TabType);
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

      {/* Student View Modal */}
      {selectedStudentForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-blue-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">{selectedStudentForModal.name}</h3>
                <p className="text-xs text-slate-500">Student ID: {selectedStudentForModal.studentId}</p>
              </div>
              <button
                onClick={() => setSelectedStudentForModal(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Admission No:</span>
                <span className="font-semibold text-slate-800">{selectedStudentForModal.admissionNo}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Class & Section:</span>
                <span className="font-semibold text-slate-800">{selectedStudentForModal.class} - {selectedStudentForModal.section}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Roll Number:</span>
                <span className="font-semibold text-slate-800">{selectedStudentForModal.rollNo}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Parent / Guardian:</span>
                <span className="font-semibold text-slate-800">{selectedStudentForModal.parentName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Parent Phone:</span>
                <a href={`tel:${selectedStudentForModal.parentPhone}`} className="font-bold text-blue-700 hover:underline">
                  {selectedStudentForModal.parentPhone}
                </a>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Residential Address:</span>
                <span className="font-semibold text-slate-800 text-right">{selectedStudentForModal.address}</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedStudentForModal(null)}
                className="px-4 py-2 rounded-xl bg-blue-900 text-white font-semibold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
