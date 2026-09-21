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
  const pendingAdmissions = admissions.filter((a) => a.status === 'new' || a.status === 'pending');
  const unreadMessages = contacts.filter((c) => c.status === 'unread');
  const pinnedNotices = notices.filter((n) => n.isPinned);
  const activeFaculty = faculty.filter((f) => f.isActive !== false);

  return (
    <div className="space-y-8">
      {/* Top Welcome Card */}
      <div className="bg-gradient-to-r from-blue-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-blue-900/40">
        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Administrator Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading leading-tight">
            {schoolInfo.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Welcome to the school administrative console for {schoolInfo.location}. Review admissions, publish circulars, manage faculty profiles, and update institutional details with real-time server persistence.
          </p>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Admissions */}
        <div
          onClick={() => onNavigateTab('admissions')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-md transition-all cursor-pointer space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Admissions
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-950 flex items-center justify-center group-hover:bg-blue-950 group-hover:text-white transition-colors">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-950 font-mono">
            {admissions.length}
          </div>
          <div className="text-[11px] font-semibold text-amber-700 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block animate-pulse" />
            <span>{pendingAdmissions.length} Pending review</span>
          </div>
        </div>

        {/* Messages */}
        <div
          onClick={() => onNavigateTab('contacts')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-md transition-all cursor-pointer space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Messages
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-900 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Mail className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            {contacts.length}
          </div>
          <div className="text-[11px] font-semibold text-rose-700 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block animate-pulse" />
            <span>{unreadMessages.length} Unread inquiries</span>
          </div>
        </div>

        {/* Notices */}
        <div
          onClick={() => onNavigateTab('notices')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-md transition-all cursor-pointer space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Notices
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-900 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Bell className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            {notices.length}
          </div>
          <div className="text-[11px] font-semibold text-indigo-700">
            <span>{pinnedNotices.length} Pinned priority</span>
          </div>
        </div>

        {/* Faculty */}
        <div
          onClick={() => onNavigateTab('faculty')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-md transition-all cursor-pointer space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Faculty & Staff
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-900 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            {faculty.length}
          </div>
          <div className="text-[11px] font-semibold text-emerald-700">
            <span>{activeFaculty.length} Active profiles</span>
          </div>
        </div>
      </div>

      {/* Secondary Modules Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => onNavigateTab('events')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-blue-300"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-900 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Events & Celebrations</h4>
              <p className="text-[11px] text-slate-400">{events.length} Scheduled activities</p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-400" />
        </div>

        <div
          onClick={() => onNavigateTab('gallery')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-blue-300"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-900 flex items-center justify-center">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Campus Photo Gallery</h4>
              <p className="text-[11px] text-slate-400">{gallery.length} Curated photos</p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-400" />
        </div>

        <div
          onClick={() => onNavigateTab('downloads')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-blue-300"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-900 flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Downloads Repository</h4>
              <p className="text-[11px] text-slate-400">{downloads.length} Public documents</p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-400" />
        </div>
      </div>

      {/* Two-Column Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Admissions */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Recent Admission Enquiries
            </h3>
            <button
              onClick={() => onNavigateTab('admissions')}
              className="text-xs font-bold text-blue-900 hover:text-blue-950 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {admissions.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No applications logged yet.</p>
          ) : (
            <div className="space-y-2">
              {admissions.slice(0, 4).map((adm) => (
                <div
                  key={adm.id}
                  onClick={() => onNavigateTab('admissions')}
                  className="p-3.5 rounded-xl bg-slate-50 hover:bg-blue-50/50 border border-slate-100 flex items-center justify-between gap-3 cursor-pointer transition-colors text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{adm.studentName}</span>
                      <span className="text-[11px] font-semibold text-amber-800">{adm.gradeApplying}</span>
                    </div>
                    <span className="text-[11px] text-slate-500 block">Parent: {adm.parentName} • {adm.phone}</span>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border capitalize ${
                        adm.status === 'new'
                          ? 'bg-blue-100 text-blue-900 border-blue-200'
                          : adm.status === 'pending'
                          ? 'bg-amber-100 text-amber-900 border-amber-200'
                          : 'bg-emerald-100 text-emerald-900 border-emerald-200'
                      }`}
                    >
                      {adm.status}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      {formatDate(adm.submittedAt || adm.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Messages & Urgent Circulars */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Latest Parent Messages
              </h3>
              <button
                onClick={() => onNavigateTab('contacts')}
                className="text-xs font-bold text-blue-900 hover:text-blue-950 flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {contacts.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No contact inquiries yet.</p>
            ) : (
              <div className="space-y-2.5">
                {contacts.slice(0, 3).map((con) => (
                  <div
                    key={con.id}
                    onClick={() => onNavigateTab('contacts')}
                    className="p-3 rounded-xl bg-slate-50 hover:bg-amber-50/50 border border-slate-100 cursor-pointer transition-colors text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{con.name}</span>
                      <span
                        className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                          con.status === 'unread'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {con.status}
                      </span>
                    </div>
                    <p className="text-slate-600 line-clamp-1">{con.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Institutional Info Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3 text-xs">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-blue-950 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-600" />
              <span>Campus Quick Details</span>
            </h4>
            <div className="space-y-1.5 text-slate-600">
              <p><strong>Location:</strong> Kotauratla, Anakapalle District</p>
              <p><strong>Primary Phone:</strong> 9441971531</p>
              <p><strong>Office Hours:</strong> 8:30 AM – 4:30 PM (Mon-Sat)</p>
              <p><strong>Principal:</strong> Sri K. V. Ramanamurthy</p>
            </div>
            <button
              onClick={() => onNavigateTab('profile')}
              className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
            >
              Edit Institutional Profile →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
