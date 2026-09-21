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
} from 'lucide-react';
import { SchoolInfo } from '../../types';

interface NavbarProps {
  currentTab?: string;
  activeTab?: string;
  onNavigate: (tab: string) => void;
  schoolInfo: SchoolInfo;
  onOpenAdminLogin: () => void;
  isAdminLoggedIn: boolean;
}

export function Navbar({
  currentTab,
  activeTab,
  onNavigate,
  schoolInfo,
  onOpenAdminLogin,
  isAdminLoggedIn,
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

  return (
    <header className="sticky top-0 z-40 w-full shadow-sm bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      {/* Top Notification Bar */}
      <div className="bg-blue-950 text-slate-100 text-xs py-2 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Left: Contact Info */}
          <div className="flex items-center flex-wrap gap-4 sm:gap-6 font-medium">
            <a
              href={`tel:${schoolInfo.phone}`}
              className="flex items-center gap-1.5 hover:text-amber-300 transition-colors text-slate-200"
              title="Call School Office"
            >
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span>{schoolInfo.phone}</span>
            </a>
            <div className="flex items-center gap-1.5 text-slate-300 hidden md:flex">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>{schoolInfo.location}, {schoolInfo.district}</span>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[11px] font-semibold border border-amber-400/30">
              <Sparkles className="w-3 h-3" />
              <span>Admissions Open 2026–27</span>
            </span>
          </div>

          {/* Right: Quick Links & Admin */}
          <div className="flex items-center gap-3 ml-auto">
            <button
              onClick={() => handleLinkClick('downloads')}
              className="hidden sm:flex items-center gap-1 text-slate-300 hover:text-white transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Prospectus</span>
            </button>
            <div className="h-3 w-px bg-slate-700 hidden sm:block" />
            <button
              onClick={onOpenAdminLogin}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                isAdminLoggedIn
                  ? 'bg-amber-500 text-blue-950 hover:bg-amber-400'
                  : 'text-slate-300 hover:text-white hover:bg-blue-900/60'
              }`}
              title={isAdminLoggedIn ? 'Open Admin Dashboard' : 'Staff/Admin Login'}
            >
              <Lock className="w-3 h-3 text-amber-400" />
              <span>{isAdminLoggedIn ? 'Admin Panel' : 'Staff Portal'}</span>
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
            className="flex items-center gap-3 text-left group focus:outline-hidden"
          >
            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-blue-900 to-indigo-950 text-amber-400 flex items-center justify-center shadow-md border border-blue-800/60 group-hover:scale-105 transition-transform duration-200 shrink-0">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <span className="block text-xl font-black text-blue-950 tracking-tight font-heading leading-tight group-hover:text-blue-900 transition-colors">
                {schoolInfo.name}
              </span>
              <span className="block text-xs font-medium text-slate-500 tracking-wide">
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
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-150 relative ${
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
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleLinkClick('admissions')}
              className="hidden md:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all transform active:scale-95"
            >
              <span>Apply Online</span>
              <ArrowRight className="w-4 h-4 text-amber-300" />
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="xl:hidden p-2 rounded-lg text-slate-700 hover:text-blue-950 hover:bg-slate-100 focus:outline-hidden"
              aria-label={isMobileMenuOpen ? 'Close Menu' : 'Open Menu'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {isMobileMenuOpen && (
        <div className="xl:hidden border-t border-slate-200 bg-white shadow-xl px-4 pt-3 pb-6 animate-in slide-in-from-top-2 duration-200 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
            {navLinks.map((link) => {
              const isActive = selectedTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleLinkClick(link.id)}
                  className={`flex items-center justify-between px-4 py-3 min-h-[44px] rounded-xl text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-blue-900 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100 active:bg-slate-200'
                  }`}
                >
                  <span>{link.label}</span>
                  <ChevronRight className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-slate-400'}`} />
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
            <button
              onClick={() => handleLinkClick('admissions')}
              className="w-full flex items-center justify-center gap-2 py-3 min-h-[44px] rounded-xl bg-blue-900 text-white font-bold text-sm shadow-md"
            >
              <span>Admission Enquiry 2026–27</span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </button>
            <a
              href={`tel:${schoolInfo.phone}`}
              className="w-full flex items-center justify-center gap-2 py-3 min-h-[44px] rounded-xl bg-slate-100 text-blue-950 font-bold text-sm border border-slate-200"
            >
              <Phone className="w-4 h-4 text-amber-600" />
              <span>Call School: {schoolInfo.phone}</span>
            </a>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenAdminLogin();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 min-h-[44px] rounded-xl bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200 hover:bg-slate-100"
            >
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span>{isAdminLoggedIn ? 'Open Admin Panel' : 'Staff & Administrative Portal'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
