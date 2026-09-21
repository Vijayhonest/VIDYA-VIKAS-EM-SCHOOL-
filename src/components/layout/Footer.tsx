import {
  GraduationCap,
  Phone,
  MapPin,
  Mail,
  Clock,
  ChevronRight,
  ShieldCheck,
  Heart,
  ArrowUp,
  Lock,
} from 'lucide-react';
import { SchoolInfo } from '../../types';

interface FooterProps {
  schoolInfo: SchoolInfo;
  onNavigate: (tab: string) => void;
  onOpenAdminLogin: () => void;
}

export function Footer({ schoolInfo, onNavigate, onOpenAdminLogin }: FooterProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navItems = [
    { id: 'about', label: 'About School' },
    { id: 'academics', label: 'Academic Curriculum' },
    { id: 'admissions', label: 'Admissions & Eligibility' },
    { id: 'faculty', label: 'Faculty Directory' },
    { id: 'activities', label: 'Student Activities' },
    { id: 'gallery', label: 'Photo Gallery' },
    { id: 'notices', label: 'Circulars & Notices' },
    { id: 'events', label: 'School Calendar & Events' },
    { id: 'downloads', label: 'Downloads & Prospectus' },
    { id: 'contact', label: 'Contact & Location' },
  ];

  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800/80">
          {/* Column 1: School Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-blue-700 to-indigo-900 text-amber-400 flex items-center justify-center border border-blue-600/40 shadow-md">
                <GraduationCap className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-heading tracking-tight">
                  {schoolInfo.name}
                </h3>
                <p className="text-xs text-slate-400">English Medium • Kotauratla</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Providing holistic, disciplined, and concept-oriented English medium schooling for
              children from LKG to Class X (SSC) in Kotauratla Mandal and surrounding regions of
              Anakapalle District.
            </p>
            <div className="pt-1 flex items-center gap-2 text-xs text-amber-400/90 font-medium">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{schoolInfo.affiliationNotice}</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4 border-l-2 border-amber-500 pl-2 font-heading">
              Quick Links
            </h4>
            <ul className="grid grid-cols-2 gap-2 text-sm">
              {navItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      onNavigate(item.id);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors py-1 group text-left"
                  >
                    <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-amber-400 transition-colors shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact Details */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4 border-l-2 border-amber-500 pl-2 font-heading">
              Campus Office
            </h4>
            <div className="space-y-3.5 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-1" />
                <span className="text-slate-300 leading-relaxed">
                  {schoolInfo.address}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <a
                  href={`tel:${schoolInfo.phone}`}
                  className="text-white hover:text-amber-300 font-bold transition-colors"
                >
                  +91 {schoolInfo.phone}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <a
                  href={`mailto:${schoolInfo.email}`}
                  className="text-slate-300 hover:text-white transition-colors truncate text-xs"
                >
                  {schoolInfo.email}
                </a>
              </div>
              <div className="flex items-start gap-3 pt-1">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-1" />
                <span className="text-xs text-slate-400 leading-normal">
                  {schoolInfo.officeHours}
                </span>
              </div>
            </div>
          </div>

          {/* Column 4: Admissions Notice & Call to Action */}
          <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="inline-block px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30 mb-3">
                Admissions 2026–27
              </div>
              <h5 className="text-white font-bold text-base mb-2">Enroll Your Child Today</h5>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Limited seats available for Pre-Primary to Class IX. Early applications are prioritized for seat allocation.
              </p>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => {
                  onNavigate('admissions');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-blue-950 font-bold text-xs uppercase tracking-wider text-center transition-all shadow-md active:scale-95"
              >
                Apply for Admission
              </button>
              <button
                onClick={() => {
                  onNavigate('downloads');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs text-center transition-all"
              >
                Download Prospectus
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            © {new Date().getFullYear()} {schoolInfo.name}, Kotauratla. All rights reserved.
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={onOpenAdminLogin}
              className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Admin & Staff Portal</span>
            </button>
            <span>•</span>
            <button
              onClick={() => onNavigate('contact')}
              className="hover:text-white transition-colors"
            >
              Help & Support
            </button>
            <span>•</span>
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
              aria-label="Scroll back to top"
            >
              <span>Back to top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
