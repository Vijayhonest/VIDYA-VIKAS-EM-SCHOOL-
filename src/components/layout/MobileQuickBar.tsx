import { Phone, GraduationCap, FileDown, Users, CheckCircle2 } from 'lucide-react';

interface MobileQuickBarProps {
  phone: string;
  onNavigate: (tab: string) => void;
  activeTab: string;
  onOpenStudentPortal?: () => void;
  onOpenParentPortal?: () => void;
}

export function MobileQuickBar({
  phone,
  onNavigate,
  activeTab,
  onOpenStudentPortal,
  onOpenParentPortal,
}: MobileQuickBarProps) {
  return (
    <nav
      aria-label="Mobile quick actions"
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-1.5 px-2 shadow-[0_-4px_20px_rgba(15,23,42,0.08)] flex items-center justify-around gap-1 pb-[calc(0.375rem+env(safe-area-inset-bottom,0px))]"
    >
      {/* 1. Call */}
      <a
        href={`tel:${phone}`}
        className="flex-1 flex flex-col items-center justify-center py-1 min-h-[48px] rounded-xl text-slate-700 hover:text-emerald-700 active:scale-95 active:bg-emerald-50 transition-all duration-150 select-none group"
        title="Call School Office"
      >
        <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100 flex items-center justify-center mb-0.5 transition-colors">
          <Phone className="w-3.5 h-3.5" />
        </div>
        <span className="text-[11px] font-bold tracking-tight text-slate-800 group-hover:text-emerald-800">
          Call
        </span>
      </a>

      {/* 2. Student */}
      {onOpenStudentPortal && (
        <button
          onClick={onOpenStudentPortal}
          className="flex-1 flex flex-col items-center justify-center py-1 min-h-[48px] rounded-xl text-slate-700 hover:text-emerald-800 active:scale-95 active:bg-emerald-50 transition-all duration-150 cursor-pointer select-none group"
          title="Student Academic Portal"
        >
          <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-800 group-hover:bg-emerald-100 flex items-center justify-center mb-0.5 transition-colors">
            <GraduationCap className="w-3.5 h-3.5" />
          </div>
          <span className="text-[11px] font-bold tracking-tight text-slate-800 group-hover:text-emerald-900">
            Student
          </span>
        </button>
      )}

      {/* 3. Parent */}
      {onOpenParentPortal && (
        <button
          onClick={onOpenParentPortal}
          className="flex-1 flex flex-col items-center justify-center py-1 min-h-[48px] rounded-xl text-slate-700 hover:text-indigo-800 active:scale-95 active:bg-indigo-50 transition-all duration-150 cursor-pointer select-none group"
          title="Parent Progress Portal"
        >
          <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-800 group-hover:bg-indigo-100 flex items-center justify-center mb-0.5 transition-colors">
            <Users className="w-3.5 h-3.5" />
          </div>
          <span className="text-[11px] font-bold tracking-tight text-slate-800 group-hover:text-indigo-900">
            Parent
          </span>
        </button>
      )}

      {/* 4. Admissions */}
      <button
        onClick={() => {
          onNavigate('admissions');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className={`flex-1 flex flex-col items-center justify-center py-1 min-h-[48px] rounded-xl active:scale-95 transition-all duration-150 cursor-pointer select-none ${
          activeTab === 'admissions'
            ? 'bg-blue-50/90 text-blue-950 font-bold shadow-xs'
            : 'text-slate-700 hover:text-blue-950 hover:bg-slate-50'
        }`}
        title="Admission Application"
      >
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center mb-0.5 transition-colors ${
            activeTab === 'admissions'
              ? 'bg-blue-950 text-amber-400'
              : 'bg-blue-50 text-blue-900 group-hover:bg-blue-100'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
        </div>
        <span
          className={`text-[11px] tracking-tight ${
            activeTab === 'admissions' ? 'font-black text-blue-950' : 'font-bold text-slate-800'
          }`}
        >
          Admissions
        </span>
      </button>

      {/* 5. Prospectus */}
      <button
        onClick={() => {
          onNavigate('downloads');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className={`flex-1 flex flex-col items-center justify-center py-1 min-h-[48px] rounded-xl active:scale-95 transition-all duration-150 cursor-pointer select-none ${
          activeTab === 'downloads'
            ? 'bg-amber-50/90 text-amber-950 font-bold shadow-xs'
            : 'text-slate-700 hover:text-amber-900 hover:bg-slate-50'
        }`}
        title="Downloads & Prospectus"
      >
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center mb-0.5 transition-colors ${
            activeTab === 'downloads'
              ? 'bg-amber-500 text-blue-950'
              : 'bg-amber-50 text-amber-900 group-hover:bg-amber-100'
          }`}
        >
          <FileDown className="w-3.5 h-3.5" />
        </div>
        <span
          className={`text-[11px] tracking-tight ${
            activeTab === 'downloads' ? 'font-black text-amber-950' : 'font-bold text-slate-800'
          }`}
        >
          Prospectus
        </span>
      </button>
    </nav>
  );
}
