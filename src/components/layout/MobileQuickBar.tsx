import { Phone, GraduationCap, FileDown, MapPin } from 'lucide-react';

interface MobileQuickBarProps {
  phone: string;
  onNavigate: (tab: string) => void;
  activeTab: string;
}

export function MobileQuickBar({ phone, onNavigate, activeTab }: MobileQuickBarProps) {
  return (
    <nav
      aria-label="Mobile quick actions"
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-1.5 px-3 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] flex items-center justify-between gap-1"
    >
      <a
        href={`tel:${phone}`}
        className="flex-1 flex flex-col items-center justify-center py-1.5 min-h-[44px] rounded-xl text-slate-700 hover:text-emerald-700 active:bg-emerald-50 transition-colors"
        title="Call School Office"
      >
        <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-0.5">
          <Phone className="w-3.5 h-3.5" />
        </div>
        <span className="text-[10px] font-bold tracking-tight">Call Office</span>
      </a>

      <button
        onClick={() => {
          onNavigate('admissions');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className={`flex-1 flex flex-col items-center justify-center py-1.5 min-h-[44px] rounded-xl transition-colors ${
          activeTab === 'admissions'
            ? 'bg-blue-50 text-blue-950 font-bold'
            : 'text-slate-700 hover:text-blue-950 active:bg-slate-100'
        }`}
        title="Admission Application"
      >
        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-950 flex items-center justify-center mb-0.5">
          <GraduationCap className="w-3.5 h-3.5" />
        </div>
        <span className="text-[10px] font-bold tracking-tight">Admissions</span>
      </button>

      <button
        onClick={() => {
          onNavigate('downloads');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className={`flex-1 flex flex-col items-center justify-center py-1.5 min-h-[44px] rounded-xl transition-colors ${
          activeTab === 'downloads'
            ? 'bg-amber-50 text-amber-950 font-bold'
            : 'text-slate-700 hover:text-amber-900 active:bg-slate-100'
        }`}
        title="Downloads & Prospectus"
      >
        <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center mb-0.5">
          <FileDown className="w-3.5 h-3.5" />
        </div>
        <span className="text-[10px] font-bold tracking-tight">Prospectus</span>
      </button>

      <button
        onClick={() => {
          onNavigate('contact');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className={`flex-1 flex flex-col items-center justify-center py-1.5 min-h-[44px] rounded-xl transition-colors ${
          activeTab === 'contact'
            ? 'bg-blue-50 text-blue-950 font-bold'
            : 'text-slate-700 hover:text-blue-950 active:bg-slate-100'
        }`}
        title="Campus Location & Hours"
      >
        <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center mb-0.5">
          <MapPin className="w-3.5 h-3.5" />
        </div>
        <span className="text-[10px] font-bold tracking-tight">Campus Map</span>
      </button>
    </nav>
  );
}
