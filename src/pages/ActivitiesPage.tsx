import {
  Trophy,
  Heart,
  Flag,
  Sparkles,
  Award,
  CheckCircle,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { ActivityItem } from '../types';
import { initialActivities } from '../data/seedData';

interface ActivitiesPageProps {
  onNavigate: (tab: string) => void;
}

export function ActivitiesPage({ onNavigate }: ActivitiesPageProps) {
  const activities: ActivityItem[] = initialActivities;

  const schoolHouses = [
    { name: 'Ganga House', color: 'bg-blue-600', text: 'text-blue-900', border: 'border-blue-200', motto: 'Truth & Integrity' },
    { name: 'Yamuna House', color: 'bg-emerald-600', text: 'text-emerald-900', border: 'border-emerald-200', motto: 'Peace & Perseverance' },
    { name: 'Krishna House', color: 'bg-amber-600', text: 'text-amber-900', border: 'border-amber-200', motto: 'Courage & Knowledge' },
    { name: 'Godavari House', color: 'bg-rose-600', text: 'text-rose-900', border: 'border-rose-200', motto: 'Unity & Service' },
  ];

  return (
    <div className="space-y-16 py-8 pb-16">
      {/* Header */}
      <section className="bg-slate-900 text-white py-12 px-4 sm:px-6 -mt-8">
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Co-Curricular & Student Development</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-heading tracking-tight text-white">
            Student Activities & Life at Campus
          </h1>
          <p className="text-slate-300 max-w-2xl text-sm sm:text-base leading-relaxed">
            Education extends far beyond textbooks. At Vidya Vikas EM School, we nurture healthy bodies,
            vibrant creative expression, and strong civic character through daily activities and celebrations.
          </p>
        </div>
      </section>

      {/* House System Overview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="max-w-xl space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-900">Camaraderie & Leadership</span>
            <h2 className="text-xl sm:text-2xl font-black text-blue-950 font-heading">
              The Four School Houses
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Students from Class I to X are grouped into four historic houses named after sacred Indian rivers,
              instilling healthy competition, sportsmanship, and teamwork.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {schoolHouses.map((house, idx) => (
              <div
                key={idx}
                className={`p-5 rounded-2xl border ${house.border} bg-slate-50/70 space-y-2`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-4 h-4 rounded-full ${house.color}`} />
                  <h3 className={`text-base font-bold ${house.text}`}>{house.name}</h3>
                </div>
                <p className="text-xs text-slate-500 font-medium">Motto: {house.motto}</p>
                <div className="pt-2 text-[11px] text-slate-400">
                  Participates in Inter-house Quiz, Debate, Kho-kho, and Athletics.
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Activities List */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-900">Growth Beyond Academics</span>
          <h2 className="text-2xl sm:text-3xl font-black text-blue-950 font-heading">
            Our Co-Curricular Programs
          </h2>
          <p className="text-sm text-slate-600">
            Structured periods for sports, cultural awareness, yoga, and science curiosity integrated into the weekly timetable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activities.map((act) => (
            <div
              key={act.id}
              className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-blue-50 text-blue-900">
                    {act.category}
                  </span>
                  <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{act.schedule}</span>
                  </span>
                </div>

                <h3 className="text-xl font-bold text-blue-950">{act.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {act.description}
                </p>

                <div className="pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Key Development Benefits
                  </h4>
                  <ul className="space-y-1.5">
                    {act.benefits.map((b, bIdx) => (
                      <li key={bIdx} className="flex items-start gap-2 text-xs text-slate-700">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Supervised by Certified Staff</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Gallery & Events Link */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-slate-100 rounded-3xl p-8 sm:p-10 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg sm:text-xl font-bold text-blue-950 font-heading">
              View Photos of Recent Student Celebrations
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              Browse images from our Annual Sports Day, Republic Day parade, and Science Fair exhibitions.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('gallery')}
              className="px-5 py-2.5 rounded-xl bg-blue-950 hover:bg-blue-900 text-white font-bold text-xs uppercase tracking-wider transition-all"
            >
              Open Photo Gallery
            </button>
            <button
              onClick={() => onNavigate('events')}
              className="px-5 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-all"
            >
              School Events
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
