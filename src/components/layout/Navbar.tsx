import { useState } from 'react';
import {
  Phone,
  MapPin,
  Lock,
  Menu,
  X,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ChevronRight,
  FileText,
  Users,
  UserCheck,
} from 'lucide-react';
import { SchoolInfo } from '../../types';

interface NavbarProps {
  currentTab?: string;
  activeTab?: string;
  onNavigate: (tab: string) => void;
  schoolInfo: SchoolInfo;
  onOpenAdminLogin: () => void;
  isAdminLoggedIn: boolean;
  onOpenStudentPortal: () => void;
  isStudentLoggedIn: boolean;
  onOpenParentPortal: () => void;
  isParentLoggedIn: boolean;
  onOpenStaffPortal?: () => void;
  isStaffLoggedIn?: boolean;
}

export function Navbar({
  currentTab,
  activeTab,
  onNavigate,
  schoolInfo,
  onOpenAdminLogin,
  isAdminLoggedIn,
  onOpenStudentPortal,
  isStudentLoggedIn,
  onOpenParentPortal,
  isParentLoggedIn,
  onOpenStaffPortal,
  isStaffLoggedIn,
}: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const selectedTab = currentTab || activeTab || 'home';

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'academics', label: 'Academics' },
    { id: 'admissions', label: 'Admissions' },
    { id: 'faculty', label: 'Faculty' },
    { id: 'activities', label: 'Activities' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'notices', label: 'Notices' },
    { id: 'events', label: 'Events' },
    { id: 'downloads', label: 'Downloads' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleLinkClick = (tabId: string) => {
    onNavigate(tabId);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStudentPortalClick = () => {
    setIsMobileMenuOpen(false);
    onOpenStudentPortal();
  };

  return (
    <header className="sticky top-0 z-40 w-full shadow-sm bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      {/* Top Bar: Phone Number, Student Login, Parent Login, Staff Portal */}
      <div className="bg-blue-950 text-slate-100 text-xs py-2 px-3 sm:px-6 border-b border-blue-900/60">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Phone */}
          <a
            href={`tel:${schoolInfo.phone}`}
            className="inline-flex items-center gap-1.5 text-slate-200 hover:text-amber-300 font-semibold transition-colors shrink-0 text-xs py-0.5"
            title="Call School Office"
          >
            <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="tracking-wide">{schoolInfo.phone}</span>
          </a>

          {/* Quick Portals: Student Login | Parent Login | Staff Portal | Admin */}
          <div className="flex items-center gap-1 sm:gap-2.5 text-[11px] sm:text-xs">
            {/* Student Login */}
            <button
              onClick={onOpenStudentPortal}
              className={`inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded text-xs font-semibold transition-all cursor-pointer ${
                isStudentLoggedIn
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-blue-900/60'
              }`}
              title="Student Academic Portal"
            >
              <GraduationCap className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{isStudentLoggedIn ? 'Student' : 'Student'}</span>
            </button>

            <span className="text-slate-700">|</span>

            {/* Parent Login */}
            <button
              onClick={onOpenParentPortal}
              className={`inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded text-xs font-semibold transition-all cursor-pointer ${
                isParentLoggedIn
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-blue-900/60'
              }`}
              title="Parent Progress Portal"
            >
              <Users className="w-3.5 h-3.5 text-indigo-300 shrink-0" />
              <span>{isParentLoggedIn ? 'Parent' : 'Parent'}</span>
            </button>

            <span className="text-slate-700">|</span>

            {/* Staff Portal */}
            <button
              onClick={onOpenStaffPortal || onOpenAdminLogin}
              className={`inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded text-xs font-semibold transition-all cursor-pointer ${
                isStaffLoggedIn
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-blue-900/60'
              }`}
              title="Teacher & Staff Portal"
            >
              <UserCheck className="w-3.5 h-3.5 text-blue-300 shrink-0" />
              <span>{isStaffLoggedIn ? 'Staff Portal' : 'Staff'}</span>
            </button>

            <span className="text-slate-700 hidden sm:inline">|</span>

            {/* Admin Portal */}
            <button
              onClick={onOpenAdminLogin}
              className={`hidden sm:inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded text-xs font-semibold transition-all cursor-pointer ${
                isAdminLoggedIn
                  ? 'bg-amber-500 text-blue-950 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-blue-900/60'
              }`}
              title="School Administrator Console"
            >
              <Lock className="w-3 h-3 text-amber-400 shrink-0" />
              <span>{isAdminLoggedIn ? 'Admin (Active)' : 'Admin'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20">
          {/* School Brand & Crest */}
          <button
            onClick={() => handleLinkClick('home')}
            className="flex items-center gap-3 text-left group focus:outline-hidden cursor-pointer"
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-linear-to-br from-blue-900 via-blue-950 to-indigo-950 text-amber-400 flex items-center justify-center shadow-md border border-blue-800/60 group-hover:scale-105 transition-transform duration-200 shrink-0">
              <GraduationCap className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div className="leading-tight">
              <span className="block text-lg sm:text-xl font-black text-blue-950 tracking-tight font-heading group-hover:text-blue-900 transition-colors">
                {schoolInfo.name}
              </span>
              <span className="block text-[11px] sm:text-xs font-medium text-slate-500 tracking-wide">
                English Medium • Kotauratla, AP
              </span>
            </div>
          </button>

          {/* Desktop Nav Links */}
          <nav className="hidden xl:flex items-center space-x-1" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const isActive = selectedTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleLinkClick(link.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-150 relative cursor-pointer ${
                    isActive
                      ? 'text-blue-950 bg-blue-50/80 font-bold'
                      : 'text-slate-600 hover:text-blue-900 hover:bg-slate-100/70'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0.5 left-3 right-3 h-0.5 bg-amber-500 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Action CTA & Mobile Trigger */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => handleLinkClick('admissions')}
              className="hidden md:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-950 hover:bg-blue-900 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all transform active:scale-95 cursor-pointer"
            >
              <span>Apply Online</span>
              <ArrowRight className="w-4 h-4 text-amber-300" />
            </button>

            {/* Mobile Hamburger menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="xl:hidden p-2.5 min-h-[44px] min-w-[44px] rounded-xl text-slate-700 hover:text-blue-950 hover:bg-slate-100 active:bg-slate-200 focus:outline-hidden flex items-center justify-center cursor-pointer transition-colors"
              aria-label={isMobileMenuOpen ? 'Close Menu' : 'Open Menu'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6 text-blue-950" /> : <Menu className="w-6 h-6 text-blue-950" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Drawer: Spacious, Clean, Easy to Use with exact 12 requested items */}
      {isMobileMenuOpen && (
        <div className="xl:hidden border-t border-slate-200 bg-white shadow-2xl px-4 pt-3 pb-8 animate-in slide-in-from-top-2 duration-200 max-h-[85vh] overflow-y-auto">
          {/* Primary Nav List (Home through Contact, plus Student Academic Portal) */}
          <div className="flex flex-col space-y-1 mb-4">
            {navLinks.map((link) => {
              const isActive = selectedTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleLinkClick(link.id)}
                  className={`flex items-center justify-between px-4 py-3 min-h-[46px] rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-blue-950 text-white shadow-xs font-bold'
                      : 'text-slate-800 hover:bg-slate-100 active:bg-slate-200'
                  }`}
                >
                  <span>{link.label}</span>
                  <ChevronRight className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-slate-400'}`} />
                </button>
              );
            })}

            {/* 12th Item: Student Academic Portal */}
            <button
              onClick={handleStudentPortalClick}
              className="flex items-center justify-between px-4 py-3 min-h-[46px] rounded-xl text-sm font-bold bg-emerald-50 text-emerald-950 border border-emerald-200 hover:bg-emerald-100 active:bg-emerald-200 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-md bg-emerald-600 text-white flex items-center justify-center">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <span>Student Academic Portal</span>
              </div>
              <ChevronRight className="w-4 h-4 text-emerald-700" />
            </button>
          </div>

          {/* Quick Support & Institutional Access */}
          <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenParentPortal();
              }}
              className="w-full flex items-center justify-between px-4 py-3 min-h-[46px] rounded-xl bg-indigo-50 text-indigo-950 font-bold text-sm border border-indigo-200 hover:bg-indigo-100 transition cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-md bg-indigo-600 text-white flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <span>Parent Progress Portal</span>
              </div>
              <ChevronRight className="w-4 h-4 text-indigo-700" />
            </button>

            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                if (onOpenStaffPortal) onOpenStaffPortal();
                else onOpenAdminLogin();
              }}
              className="w-full flex items-center justify-between px-4 py-3 min-h-[46px] rounded-xl bg-blue-50 text-blue-950 font-bold text-sm border border-blue-200 hover:bg-blue-100 transition cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center">
                  <UserCheck className="w-3.5 h-3.5" />
                </div>
                <span>Staff Academic Portal</span>
              </div>
              <ChevronRight className="w-4 h-4 text-blue-700" />
            </button>

            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenAdminLogin();
              }}
              className="w-full flex items-center justify-between px-4 py-3 min-h-[46px] rounded-xl bg-amber-50 text-amber-950 font-bold text-sm border border-amber-200 hover:bg-amber-100 transition cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-md bg-amber-500 text-blue-950 flex items-center justify-center">
                  <Lock className="w-3.5 h-3.5 text-blue-950" />
                </div>
                <span>Administrator Console</span>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-800" />
            </button>

            <a
              href={`tel:${schoolInfo.phone}`}
              className="w-full flex items-center justify-center gap-2 py-3 min-h-[46px] rounded-xl bg-slate-100 text-blue-950 font-bold text-sm border border-slate-200 hover:bg-slate-200 active:scale-98 transition"
            >
              <Phone className="w-4 h-4 text-amber-600" />
              <span>Call School Office: {schoolInfo.phone}</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
