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
  | 'admissions'
  | 'contacts'
  | 'notices'
  | 'events'
  | 'faculty'
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

  const pendingAdmissionsCount = admissions.filter(
    (a) => a.status === 'new' || a.status === 'pending'
  ).length;
  const unreadContactsCount = contacts.filter((c) => c.status === 'unread').length;

  const tabs: { id: AdminTab; label: string; icon: any; count?: number }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    {
      id: 'admissions',
      label: 'Admissions',
      icon: FileCheck,
      count: pendingAdmissionsCount > 0 ? pendingAdmissionsCount : undefined,
    },
    {
      id: 'contacts',
      label: 'Messages',
      icon: Mail,
      count: unreadContactsCount > 0 ? unreadContactsCount : undefined,
    },
    { id: 'notices', label: `Notices (${notices.length})`, icon: Bell },
    { id: 'events', label: `Events (${events.length})`, icon: Calendar },
    { id: 'faculty', label: `Faculty (${faculty.length})`, icon: Users },
    { id: 'gallery', label: `Gallery (${gallery.length})`, icon: ImageIcon },
    { id: 'downloads', label: `Downloads (${downloads.length})`, icon: Download },
    { id: 'profile', label: 'School Profile', icon: Building2 },
    { id: 'settings', label: 'Settings & Security', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Admin Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-blue-950 flex items-center justify-center font-black shadow-md">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm font-heading leading-none">
                  Admin Management Console
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Live Session
                </span>
              </div>
              <span className="text-xs text-slate-400 block mt-0.5">
                {schoolInfo.name} • Kotauratla
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onExitToPublic}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">View Public Website</span>
            </button>
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600/20 text-rose-300 hover:bg-rose-600 hover:text-white border border-rose-500/30 text-xs font-semibold transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Strip */}
        <div className="bg-slate-950 border-t border-slate-800 px-4 sm:px-6 overflow-x-auto scrollbar-none">
          <div className="max-w-7xl mx-auto flex items-center gap-1 py-1.5 min-w-max">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-400 text-blue-950">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Tab Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
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

        {activeTab === 'admissions' && (
          <AdminAdmissionsTab admissions={admissions} onDataChange={onDataChange} />
        )}

        {activeTab === 'contacts' && (
          <AdminContactsTab contacts={contacts} onDataChange={onDataChange} />
        )}

        {activeTab === 'notices' && (
          <AdminNoticesTab notices={notices} onDataChange={onDataChange} />
        )}

        {activeTab === 'events' && (
          <AdminEventsTab events={events} onDataChange={onDataChange} />
        )}

        {activeTab === 'faculty' && (
          <AdminFacultyTab faculty={faculty} onDataChange={onDataChange} />
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
  );
}
