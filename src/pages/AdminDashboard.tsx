import { useState } from 'react';
import {
  LayoutDashboard,
  Bell,
  Calendar,
  Users,
  Image as ImageIcon,
  FileCheck,
  Mail,
  Download,
  Building2,
  Settings,
  LogOut,
  Eye,
  Shield,
  GraduationCap,
  CheckSquare,
  BookOpen,
  Clock,
  Award,
  IndianRupee,
  BarChart3,
  Menu,
  X,
  Search,
  ChevronDown,
  User,
  Sparkles,
  ExternalLink,
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
} from '../types';
import { AdminOverviewTab } from '../components/admin/AdminOverviewTab';
import { AdminAdmissionsTab } from '../components/admin/AdminAdmissionsTab';
import { AdminContactsTab } from '../components/admin/AdminContactsTab';
import { AdminNoticesTab } from '../components/admin/AdminNoticesTab';
import { AdminEventsTab } from '../components/admin/AdminEventsTab';
import { AdminFacultyTab } from '../components/admin/AdminFacultyTab';
import { AdminGalleryTab } from '../components/admin/AdminGalleryTab';
import { AdminDownloadsTab } from '../components/admin/AdminDownloadsTab';
import { AdminProfileTab } from '../components/admin/AdminProfileTab';
import { AdminSettingsTab } from '../components/admin/AdminSettingsTab';
import { AdminStudentsTab } from '../components/admin/AdminStudentsTab';
import { AdminAttendanceTab } from '../components/admin/AdminAttendanceTab';
import { AdminHomeworkTab } from '../components/admin/AdminHomeworkTab';
import { AdminTimetableTab } from '../components/admin/AdminTimetableTab';
import { AdminResultsTab } from '../components/admin/AdminResultsTab';
import { AdminFeesTab } from '../components/admin/AdminFeesTab';
import { AdminReportsTab } from '../components/admin/AdminReportsTab';

interface AdminDashboardProps {
  schoolInfo: SchoolInfo;
  notices: Notice[];
  events: SchoolEvent[];
  faculty: FacultyMember[];
  gallery: GalleryItem[];
  admissions: AdmissionEnquiry[];
  contacts: ContactEnquiry[];
  downloads: DownloadItem[];
  onDataChange: () => void;
  onLogout: () => void;
  onExitToPublic: () => void;
}

export type AdminTab =
  | 'overview'
  | 'students'
  | 'faculty'
  | 'attendance'
  | 'homework'
  | 'results'
  | 'timetable'
  | 'fees'
  | 'admissions'
  | 'notices'
  | 'reports'
  | 'contacts'
  | 'events'
  | 'gallery'
  | 'downloads'
  | 'profile'
  | 'settings';

export function AdminDashboard({
  schoolInfo,
  notices,
  events,
  faculty,
  gallery,
  admissions,
  contacts,
  downloads,
  onDataChange,
  onLogout,
  onExitToPublic,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const pendingAdmissionsCount = admissions.filter(
    (a) => a.status === 'new' || a.status === 'pending'
  ).length;
  const unreadContactsCount = contacts.filter((c) => c.status === 'unread').length;

  const navSections: {
    title: string;
    items: { id: AdminTab; label: string; icon: any; count?: number; badgeColor?: string }[];
  }[] = [
    {
      title: 'Academics & Operations',
      items: [
        { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'students', label: 'Students', icon: GraduationCap },
        { id: 'faculty', label: 'Teachers & Staff', icon: Users },
        { id: 'attendance', label: 'Daily Attendance', icon: CheckSquare },
        { id: 'homework', label: 'Homework', icon: BookOpen },
        { id: 'results', label: 'Exams & Results', icon: Award },
        { id: 'timetable', label: 'Timetable', icon: Clock },
      ],
    },
    {
      title: 'Institutional Administration',
      items: [
        { id: 'fees', label: 'Fee Management', icon: IndianRupee },
        {
          id: 'admissions',
          label: 'Admissions',
          icon: FileCheck,
          count: pendingAdmissionsCount > 0 ? pendingAdmissionsCount : undefined,
          badgeColor: 'bg-amber-400 text-blue-950',
        },
        { id: 'notices', label: 'Announcements', icon: Bell },
        { id: 'reports', label: 'Reports & Exports', icon: BarChart3 },
        {
          id: 'contacts',
          label: 'Messages',
          icon: Mail,
          count: unreadContactsCount > 0 ? unreadContactsCount : undefined,
          badgeColor: 'bg-rose-500 text-white',
        },
      ],
    },
    {
      title: 'Campus & Configuration',
      items: [
        { id: 'events', label: 'Events', icon: Calendar },
        { id: 'gallery', label: 'Photo Gallery', icon: ImageIcon },
        { id: 'downloads', label: 'Downloads', icon: Download },
        { id: 'profile', label: 'School Profile', icon: Building2 },
        { id: 'settings', label: 'Settings & Security', icon: Settings },
      ],
    },
  ];

  const handleSelectTab = (tab: AdminTab) => {
    setActiveTab(tab);
    setIsMobileSidebarOpen(false);
  };

  // Find active tab label
  let activeTabLabel = 'Dashboard';
  for (const s of navSections) {
    const item = s.items.find((i) => i.id === activeTab);
    if (item) {
      activeTabLabel = item.label;
      break;
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      {/* TOP HEADER */}
      <header className="bg-blue-950 text-white sticky top-0 z-30 shadow-md border-b border-blue-900">
        <div className="px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Left: Mobile hamburger & School Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              className="lg:hidden p-2 rounded-xl bg-blue-900/60 hover:bg-blue-900 text-slate-200 transition"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div
              onClick={() => setActiveTab('overview')}
              className="flex items-center gap-3 cursor-pointer select-none"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-400 text-blue-950 flex items-center justify-center font-black shadow-md shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm font-heading leading-tight tracking-tight">
                    Vidya Vikas EM School
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Admin
                  </span>
                </div>
                <span className="text-[11px] text-blue-200 block">Kotauratla • Andhra Pradesh</span>
              </div>
            </div>
          </div>

          {/* Center: Global Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-blue-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search students, admission files, circulars..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (searchQuery.toLowerCase().includes('fee')) setActiveTab('fees');
                    else if (searchQuery.toLowerCase().includes('report')) setActiveTab('reports');
                    else if (searchQuery.toLowerCase().includes('attend')) setActiveTab('attendance');
                    else setActiveTab('students');
                  }
                }}
                className="w-full pl-10 pr-4 py-1.5 text-xs bg-blue-900/50 border border-blue-800/80 rounded-xl text-white placeholder-blue-300 focus:outline-hidden focus:ring-2 focus:ring-amber-400 focus:bg-blue-900/80 transition"
              />
            </div>
          </div>

          {/* Right Controls: Notifications, View Website, Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* View Public Site */}
            <button
              onClick={onExitToPublic}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-900/70 hover:bg-blue-900 text-xs font-semibold text-blue-100 border border-blue-800 transition"
              title="Open Public School Website"
            >
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Public Site</span>
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen);
                  setIsProfileMenuOpen(false);
                }}
                className="relative p-2 rounded-xl bg-blue-900/50 hover:bg-blue-900 text-blue-200 hover:text-white transition"
                title="Notifications & Alerts"
              >
                <Bell className="w-4 h-4" />
                {(pendingAdmissionsCount > 0 || unreadContactsCount > 0) && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-amber-400 border-2 border-blue-950" />
                )}
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 text-slate-800 z-50 animate-in fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-bold text-xs text-blue-950">Notifications & Alerts</span>
                    <button
                      onClick={() => setIsNotificationsOpen(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="py-2 space-y-2 text-xs">
                    {pendingAdmissionsCount > 0 && (
                      <div
                        onClick={() => {
                          setActiveTab('admissions');
                          setIsNotificationsOpen(false);
                        }}
                        className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 cursor-pointer transition flex items-center justify-between"
                      >
                        <span>{pendingAdmissionsCount} Pending admissions review</span>
                        <FileCheck className="w-4 h-4 text-amber-600" />
                      </div>
                    )}
                    {unreadContactsCount > 0 && (
                      <div
                        onClick={() => {
                          setActiveTab('contacts');
                          setIsNotificationsOpen(false);
                        }}
                        className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-950 cursor-pointer transition flex items-center justify-between"
                      >
                        <span>{unreadContactsCount} Unread parent messages</span>
                        <Mail className="w-4 h-4 text-rose-600" />
                      </div>
                    )}
                    <div
                      onClick={() => {
                        setActiveTab('attendance');
                        setIsNotificationsOpen(false);
                      }}
                      className="p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-950 cursor-pointer transition flex items-center justify-between"
                    >
                      <span>Daily attendance roll call ready</span>
                      <CheckSquare className="w-4 h-4 text-blue-700" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsProfileMenuOpen(!isProfileMenuOpen);
                  setIsNotificationsOpen(false);
                }}
                className="flex items-center gap-2 p-1.5 rounded-xl bg-blue-900/50 hover:bg-blue-900 text-white transition"
              >
                <div className="w-7 h-7 rounded-lg bg-amber-400 text-blue-950 font-bold text-xs flex items-center justify-center">
                  A
                </div>
                <div className="hidden xl:block text-left text-[11px] leading-tight pr-1">
                  <div className="font-bold">Principal Office</div>
                  <div className="text-blue-300 text-[10px]">Head Admin</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-blue-300" />
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 text-slate-800 z-50 animate-in fade-in">
                  <div className="p-3 border-b border-slate-100">
                    <div className="font-bold text-xs text-blue-950">Sri K. V. Ramanamurthy</div>
                    <div className="text-[10px] text-slate-500">Chief Institutional Admin</div>
                    <div className="text-[10px] text-emerald-600 font-medium mt-0.5 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Live Verified Session
                    </div>
                  </div>
                  <div className="py-1 text-xs">
                    <button
                      onClick={() => {
                        setActiveTab('profile');
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 text-slate-700 flex items-center gap-2"
                    >
                      <Building2 className="w-4 h-4 text-slate-400" />
                      <span>School Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('settings');
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 text-slate-700 flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      <span>Settings & Security</span>
                    </button>
                    <button
                      onClick={onLogout}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-50 text-rose-700 font-semibold flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4 text-rose-600" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* BODY LAYOUT: SIDEBAR + MAIN */}
      <div className="flex-1 flex overflow-hidden">
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden lg:flex flex-col w-64 bg-slate-900 border-r border-slate-800 shrink-0 select-none">
          <div className="flex-1 overflow-y-auto py-5 px-3 space-y-6 scrollbar-thin scrollbar-thumb-slate-700">
            {navSections.map((section, idx) => (
              <div key={idx} className="space-y-1">
                <div className="px-3 text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">
                  {section.title}
                </div>
                {section.items.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleSelectTab(tab.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-xs font-bold'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span className="truncate">{tab.label}</span>
                      </div>
                      {tab.count !== undefined && tab.count > 0 && (
                        <span
                          className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                            tab.badgeColor || 'bg-blue-800 text-white'
                          }`}
                        >
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Sidebar Footer */}
          <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Campus Online</span>
            </div>
            <span className="font-mono text-[10px] text-slate-500">v2.4 Pro</span>
          </div>
        </aside>

        {/* MOBILE SIDEBAR DRAWER */}
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <div
              onClick={() => setIsMobileSidebarOpen(false)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
            />

            {/* Drawer */}
            <div className="relative w-72 max-w-[80vw] bg-slate-900 border-r border-slate-800 text-white flex flex-col h-full shadow-2xl z-10 animate-in slide-in-from-left">
              <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-400 text-blue-950 font-black flex items-center justify-center">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs block">Vidya Vikas Admin</span>
                    <span className="text-[10px] text-slate-400">Kotauratla Campus</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
                {navSections.map((section, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="px-3 text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">
                      {section.title}
                    </div>
                    {section.items.map((tab) => {
                      const Icon = tab.icon;
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => handleSelectTab(tab.id)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                            isActive
                              ? 'bg-blue-600 text-white shadow-xs font-bold'
                              : 'text-slate-300 hover:text-white hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <Icon className="w-4 h-4 shrink-0 text-slate-400" />
                            <span className="truncate">{tab.label}</span>
                          </div>
                          {tab.count !== undefined && tab.count > 0 && (
                            <span
                              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                                tab.badgeColor || 'bg-blue-800 text-white'
                              }`}
                            >
                              {tab.count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>

              <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={onLogout}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-rose-600/20 text-rose-300 border border-rose-500/30 text-xs font-bold hover:bg-rose-600 hover:text-white transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-20 lg:pb-8">
          {/* Breadcrumb strip */}
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span
                onClick={() => setActiveTab('overview')}
                className="hover:text-blue-900 cursor-pointer font-medium"
              >
                Admin
              </span>
              <span>/</span>
              <span className="text-slate-900 font-bold">{activeTabLabel}</span>
            </div>
          </div>

          {/* Active Tab View Rendering */}
          {activeTab === 'overview' && (
            <AdminOverviewTab
              schoolInfo={schoolInfo}
              notices={notices}
              events={events}
              faculty={faculty}
              gallery={gallery}
              admissions={admissions}
              contacts={contacts}
              downloads={downloads}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'students' && (
            <AdminStudentsTab onDataChange={onDataChange} />
          )}

          {activeTab === 'faculty' && (
            <AdminFacultyTab faculty={faculty} onDataChange={onDataChange} />
          )}

          {activeTab === 'attendance' && (
            <AdminAttendanceTab onDataChange={onDataChange} />
          )}

          {activeTab === 'homework' && (
            <AdminHomeworkTab onDataChange={onDataChange} />
          )}

          {activeTab === 'timetable' && (
            <AdminTimetableTab onDataChange={onDataChange} />
          )}

          {activeTab === 'results' && (
            <AdminResultsTab onDataChange={onDataChange} />
          )}

          {activeTab === 'fees' && (
            <AdminFeesTab onDataChange={onDataChange} />
          )}

          {activeTab === 'admissions' && (
            <AdminAdmissionsTab admissions={admissions} onDataChange={onDataChange} />
          )}

          {activeTab === 'notices' && (
            <AdminNoticesTab notices={notices} onDataChange={onDataChange} />
          )}

          {activeTab === 'reports' && (
            <AdminReportsTab />
          )}

          {activeTab === 'contacts' && (
            <AdminContactsTab contacts={contacts} onDataChange={onDataChange} />
          )}

          {activeTab === 'events' && (
            <AdminEventsTab events={events} onDataChange={onDataChange} />
          )}

          {activeTab === 'gallery' && (
            <AdminGalleryTab gallery={gallery} onDataChange={onDataChange} />
          )}

          {activeTab === 'downloads' && (
            <AdminDownloadsTab downloads={downloads} onDataChange={onDataChange} />
          )}

          {activeTab === 'profile' && (
            <AdminProfileTab schoolInfo={schoolInfo} onDataChange={onDataChange} />
          )}

          {activeTab === 'settings' && (
            <AdminSettingsTab onDataChange={onDataChange} />
          )}
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-2 py-1.5 shadow-lg flex items-center justify-around">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl text-[10px] font-semibold transition ${
            activeTab === 'overview' ? 'text-blue-900 font-bold' : 'text-slate-500'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 mb-0.5" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl text-[10px] font-semibold transition ${
            activeTab === 'students' ? 'text-blue-900 font-bold' : 'text-slate-500'
          }`}
        >
          <GraduationCap className="w-4 h-4 mb-0.5" />
          <span>Students</span>
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl text-[10px] font-semibold transition ${
            activeTab === 'attendance' ? 'text-blue-900 font-bold' : 'text-slate-500'
          }`}
        >
          <CheckSquare className="w-4 h-4 mb-0.5" />
          <span>Roll Call</span>
        </button>

        <button
          onClick={() => setActiveTab('fees')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl text-[10px] font-semibold transition ${
            activeTab === 'fees' ? 'text-blue-900 font-bold' : 'text-slate-500'
          }`}
        >
          <IndianRupee className="w-4 h-4 mb-0.5" />
          <span>Fees</span>
        </button>

        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="flex flex-col items-center py-1 px-2 rounded-xl text-[10px] font-semibold text-slate-500 hover:text-blue-900"
        >
          <Menu className="w-4 h-4 mb-0.5" />
          <span>All Tabs</span>
        </button>
      </div>
    </div>
  );
}
