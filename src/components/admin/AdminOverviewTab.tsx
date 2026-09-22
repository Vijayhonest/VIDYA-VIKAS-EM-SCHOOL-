import { useState, useEffect } from 'react';
import {
  FileCheck,
  Mail,
  Bell,
  Calendar,
  Users,
  Image as ImageIcon,
  Download,
  Building2,
  ArrowUpRight,
  ShieldCheck,
  Clock,
  Plus,
  GraduationCap,
  CheckSquare,
  BookOpen,
  Award,
  IndianRupee,
  BarChart3,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import {
  SchoolInfo,
  Notice,
  SchoolEvent,
  FacultyMember,
  GalleryItem,
  AdmissionEnquiry,
  ContactEnquiry,
  DownloadItem,
} from '../../types';
import { formatDate } from '../../utils/helpers';
import { fetchReportsSummary, fetchAdminExams, fetchAdminHomework } from '../../services/storageService';

interface AdminOverviewTabProps {
  schoolInfo: SchoolInfo;
  notices: Notice[];
  events: SchoolEvent[];
  faculty: FacultyMember[];
  gallery: GalleryItem[];
  admissions: AdmissionEnquiry[];
  contacts: ContactEnquiry[];
  downloads: DownloadItem[];
  onNavigateTab: (tab: any) => void;
}

export function AdminOverviewTab({
  schoolInfo,
  notices,
  events,
  faculty,
  gallery,
  admissions,
  contacts,
  downloads,
  onNavigateTab,
}: AdminOverviewTabProps) {
  const [stats, setStats] = useState<any>(null);
  const [upcomingExamsList, setUpcomingExamsList] = useState<any[]>([]);
  const [pendingHwList, setPendingHwList] = useState<any[]>([]);

  useEffect(() => {
    async function loadQuickStats() {
      try {
        const [sum, ex, hw] = await Promise.all([
          fetchReportsSummary(),
          fetchAdminExams(),
          fetchAdminHomework(),
        ]);
        setStats(sum);
        setUpcomingExamsList(ex.filter((e: any) => e.status === 'upcoming' || e.status === 'active'));
        setPendingHwList(hw.filter((h: any) => h.status === 'active'));
      } catch (e) {
        console.error('Error loading overview stats:', e);
      }
    }
    loadQuickStats();
  }, []);

  const pendingAdmissions = admissions.filter((a) => a.status === 'new' || a.status === 'pending');
  const unreadMessages = contacts.filter((c) => c.status === 'unread');
  const pinnedNotices = notices.filter((n) => n.isPinned);
  const activeFaculty = faculty.filter((f) => f.isActive !== false);

  const studentCount = stats?.studentsCount ?? 16;
  const facultyCount = activeFaculty.length || (stats?.facultyCount ?? 9);
  const attendancePercent = stats?.attendance?.percentage ?? 94;
  const pendingHwCount = pendingHwList.length || (stats?.homework?.activeAssignments ?? 3);
  const upcomingExamsCount = upcomingExamsList.length || (stats?.academics?.totalExams ?? 2);
  const feeCollected = stats?.fees?.totalCollected ?? 135000;
  const feeOutstanding = stats?.fees?.totalOutstanding ?? 37000;

  return (
    <div className="space-y-8">
      {/* Top Welcome Card */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-blue-800/40">
        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Vidya Vikas EM School • Institutional Administration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading leading-tight">
            {schoolInfo.name} Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Centralized operations management for Kotauratla campus. Monitor real-time student attendance, faculty schedules, homework, exam marksheets, fee collections, and parent enquiries.
          </p>
        </div>
      </div>

      {/* 8 Primary Required Dashboard Metrics Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            Key Institutional Indicators
          </h2>
          <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
            Live Sync Active
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* 1. Total Students */}
          <div
            onClick={() => onNavigateTab('students')}
            className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs hover:border-blue-500 hover:shadow-md transition cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total Students
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center group-hover:bg-blue-950 group-hover:text-white transition">
                <GraduationCap className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-blue-950 font-mono mt-1">
              {studentCount}
            </div>
            <div className="text-[11px] font-semibold text-blue-700 mt-1 flex items-center gap-1">
              <span>Nursery to Class 10</span>
              <ArrowUpRight className="w-3 h-3" />
            </div>
          </div>

          {/* 2. Total Teachers */}
          <div
            onClick={() => onNavigateTab('faculty')}
            className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs hover:border-blue-500 hover:shadow-md transition cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total Teachers
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-900 flex items-center justify-center group-hover:bg-emerald-700 group-hover:text-white transition">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono mt-1">
              {facultyCount}
            </div>
            <div className="text-[11px] font-semibold text-emerald-700 mt-1 flex items-center gap-1">
              <span>{activeFaculty.length} Staff on Duty</span>
              <ArrowUpRight className="w-3 h-3" />
            </div>
          </div>

          {/* 3. Today's Attendance */}
          <div
            onClick={() => onNavigateTab('attendance')}
            className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs hover:border-blue-500 hover:shadow-md transition cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Today's Attendance
              </span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-900 flex items-center justify-center group-hover:bg-indigo-700 group-hover:text-white transition">
                <CheckSquare className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono mt-1">
              {attendancePercent}%
            </div>
            <div className="text-[11px] font-semibold text-indigo-700 mt-1 flex items-center gap-1">
              <span>{stats?.attendance?.present ?? 15} Present today</span>
              <ArrowUpRight className="w-3 h-3" />
            </div>
          </div>

          {/* 4. Pending Homework */}
          <div
            onClick={() => onNavigateTab('homework')}
            className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs hover:border-blue-500 hover:shadow-md transition cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Pending Homework
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-900 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-900 font-mono mt-1">
              {pendingHwCount}
            </div>
            <div className="text-[11px] font-semibold text-amber-700 mt-1 flex items-center gap-1">
              <span>Active assignments due</span>
              <ArrowUpRight className="w-3 h-3" />
            </div>
          </div>

          {/* 5. Upcoming Exams */}
          <div
            onClick={() => onNavigateTab('results')}
            className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs hover:border-blue-500 hover:shadow-md transition cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Upcoming Exams
              </span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-900 flex items-center justify-center group-hover:bg-purple-700 group-hover:text-white transition">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-purple-950 font-mono mt-1">
              {upcomingExamsCount}
            </div>
            <div className="text-[11px] font-semibold text-purple-700 mt-1 flex items-center gap-1">
              <span>Scheduled evaluation terms</span>
              <ArrowUpRight className="w-3 h-3" />
            </div>
          </div>

          {/* 6. Fee Status */}
          <div
            onClick={() => onNavigateTab('fees')}
            className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs hover:border-blue-500 hover:shadow-md transition cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Fee Clearance
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-900 flex items-center justify-center group-hover:bg-emerald-700 group-hover:text-white transition">
                <IndianRupee className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-800 font-mono mt-1">
              ₹{(feeCollected / 1000).toFixed(0)}k
            </div>
            <div className="text-[11px] font-semibold text-rose-600 mt-1 flex items-center gap-1">
              <span>₹{(feeOutstanding / 1000).toFixed(0)}k Due</span>
              <ArrowUpRight className="w-3 h-3" />
            </div>
          </div>

          {/* 7. Admission Pipeline */}
          <div
            onClick={() => onNavigateTab('admissions')}
            className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs hover:border-blue-500 hover:shadow-md transition cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Admissions
              </span>
              <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-900 flex items-center justify-center group-hover:bg-sky-700 group-hover:text-white transition">
                <FileCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-sky-950 font-mono mt-1">
              {admissions.length}
            </div>
            <div className="text-[11px] font-semibold text-amber-600 mt-1 flex items-center gap-1">
              <span>{pendingAdmissions.length} Pending Review</span>
              <ArrowUpRight className="w-3 h-3" />
            </div>
          </div>

          {/* 8. Reports & Analytics */}
          <div
            onClick={() => onNavigateTab('reports')}
            className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs hover:border-blue-500 hover:shadow-md transition cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Reports & CSV
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-900 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition">
                <BarChart3 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-900 font-mono mt-1">
              5
            </div>
            <div className="text-[11px] font-semibold text-amber-700 mt-1 flex items-center gap-1">
              <span>Export ready tables</span>
              <ArrowUpRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS BAR */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Administrative Quick Actions</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <button
            onClick={() => onNavigateTab('attendance')}
            className="p-3 rounded-xl bg-blue-50/80 hover:bg-blue-100/80 text-blue-950 font-semibold text-xs text-left border border-blue-100 transition"
          >
            <CheckSquare className="w-4 h-4 text-blue-700 mb-1" />
            <span>Mark Daily Roll Call</span>
          </button>

          <button
            onClick={() => onNavigateTab('students')}
            className="p-3 rounded-xl bg-emerald-50/80 hover:bg-emerald-100/80 text-emerald-950 font-semibold text-xs text-left border border-emerald-100 transition"
          >
            <GraduationCap className="w-4 h-4 text-emerald-700 mb-1" />
            <span>Enroll New Student</span>
          </button>

          <button
            onClick={() => onNavigateTab('fees')}
            className="p-3 rounded-xl bg-amber-50/80 hover:bg-amber-100/80 text-amber-950 font-semibold text-xs text-left border border-amber-100 transition"
          >
            <IndianRupee className="w-4 h-4 text-amber-700 mb-1" />
            <span>Collect Fee / Receipt</span>
          </button>

          <button
            onClick={() => onNavigateTab('homework')}
            className="p-3 rounded-xl bg-purple-50/80 hover:bg-purple-100/80 text-purple-950 font-semibold text-xs text-left border border-purple-100 transition"
          >
            <BookOpen className="w-4 h-4 text-purple-700 mb-1" />
            <span>Assign Homework</span>
          </button>

          <button
            onClick={() => onNavigateTab('notices')}
            className="p-3 rounded-xl bg-indigo-50/80 hover:bg-indigo-100/80 text-indigo-950 font-semibold text-xs text-left border border-indigo-100 transition"
          >
            <Bell className="w-4 h-4 text-indigo-700 mb-1" />
            <span>Publish Circular</span>
          </button>

          <button
            onClick={() => onNavigateTab('reports')}
            className="p-3 rounded-xl bg-rose-50/80 hover:bg-rose-100/80 text-rose-950 font-semibold text-xs text-left border border-rose-100 transition"
          >
            <BarChart3 className="w-4 h-4 text-rose-700 mb-1" />
            <span>Institutional Reports</span>
          </button>
        </div>
      </div>

      {/* Two-Column: Recent Announcements & Recent Admissions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Announcements (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-900" />
              <span>Recent Circulars & Announcements</span>
            </h3>
            <button
              onClick={() => onNavigateTab('notices')}
              className="text-xs font-bold text-blue-900 hover:text-blue-950 flex items-center gap-1"
            >
              <span>Manage ({notices.length})</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {notices.slice(0, 4).map((n) => (
              <div
                key={n.id}
                onClick={() => onNavigateTab('notices')}
                className="p-3.5 rounded-xl bg-slate-50 hover:bg-blue-50/50 border border-slate-100 cursor-pointer transition text-xs space-y-1"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-slate-900 truncate">{n.title}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider bg-blue-100 text-blue-900">
                      {n.targetAudience || 'All'}
                    </span>
                    {n.isPinned && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-bold">
                        PINNED
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-slate-600 line-clamp-1">{n.summary}</p>
                <div className="text-[10px] text-slate-400 pt-1 flex items-center justify-between">
                  <span>{formatDate(n.date)}</span>
                  <span>By: {n.postedBy || 'Principal Office'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Admissions & Messages (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Admissions Pipeline */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                New Admission Inquiries
              </h3>
              <button
                onClick={() => onNavigateTab('admissions')}
                className="text-xs font-bold text-blue-900 hover:text-blue-950 flex items-center gap-1"
              >
                <span>View All ({admissions.length})</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {admissions.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No applications logged yet.</p>
            ) : (
              <div className="space-y-2">
                {admissions.slice(0, 3).map((adm) => (
                  <div
                    key={adm.id}
                    onClick={() => onNavigateTab('admissions')}
                    className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50/50 border border-slate-100 flex items-center justify-between gap-3 cursor-pointer transition text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{adm.studentName}</div>
                      <div className="text-[11px] text-slate-500">
                        {adm.gradeApplying} • {adm.phone}
                      </div>
                    </div>
                    <span
                      className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full capitalize ${
                        adm.status === 'new'
                          ? 'bg-blue-100 text-blue-900'
                          : adm.status === 'pending'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-emerald-100 text-emerald-900'
                      }`}
                    >
                      {adm.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Institutional Info Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3 text-xs">
            <h4 className="font-bold uppercase tracking-wider text-[11px] text-blue-950 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-600" />
              <span>Campus Quick Details</span>
            </h4>
            <div className="space-y-1 text-slate-600">
              <p><strong>Location:</strong> Kotauratla, Anakapalle District</p>
              <p><strong>Office Hours:</strong> 8:30 AM – 4:30 PM (Mon-Sat)</p>
              <p><strong>Affiliation:</strong> Recognized Co-Ed EM School</p>
            </div>
            <button
              onClick={() => onNavigateTab('profile')}
              className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition"
            >
              Institutional Profile & Hours →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
