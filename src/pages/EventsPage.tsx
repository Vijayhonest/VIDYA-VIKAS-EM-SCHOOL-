import { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  CheckCircle,
  Share2,
  Copy,
  ChevronRight,
} from 'lucide-react';
import { SchoolEvent } from '../types';
import { formatDate } from '../utils/helpers';
import { useToast } from '../components/common/Toast';

interface EventsPageProps {
  events: SchoolEvent[];
}

export function EventsPage({ events }: EventsPageProps) {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  const upcomingEvents = events.filter((e) => e.isUpcoming);
  const pastEvents = events.filter((e) => !e.isUpcoming);

  const displayedEvents = activeTab === 'upcoming' ? upcomingEvents : pastEvents;

  const handleCopyEvent = (evt: SchoolEvent) => {
    const text = `${evt.title}\nDate: ${formatDate(evt.date)}\nTime: ${evt.time}\nVenue: ${evt.venue}\nVidya Vikas EM School, Kotauratla`;
    navigator.clipboard.writeText(text);
    showToast('Event details copied to clipboard!', 'info');
  };

  return (
    <div className="space-y-12 py-8 pb-16">
      {/* Header */}
      <section className="bg-slate-900 text-white py-12 px-4 sm:px-6 -mt-8">
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>Campus Activities & Calendar</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-heading tracking-tight text-white">
            School Events & Celebrations
          </h1>
          <p className="text-slate-300 max-w-2xl text-sm sm:text-base leading-relaxed">
            Discover upcoming academic camps, annual sports meets, national day ceremonies, and student
            talent exhibitions at Vidya Vikas EM School, Kotauratla.
          </p>
        </div>
      </section>

      {/* Tabs Switcher */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'upcoming'
                ? 'bg-blue-950 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Upcoming Events ({upcomingEvents.length})
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'past'
                ? 'bg-blue-950 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Past Celebrations ({pastEvents.length})
          </button>
        </div>
      </section>

      {/* Events List */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        {displayedEvents.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-700">No events found in this category</h3>
            <p className="text-xs text-slate-500">
              Check back soon as new academic dates are finalized by the administration.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {displayedEvents.map((evt) => (
              <div
                key={evt.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs hover:border-blue-300 hover:shadow-md transition-all flex flex-col md:flex-row items-start gap-6"
              >
                {/* Date Stamp */}
                <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-blue-900 to-indigo-950 text-white flex flex-col items-center justify-center shrink-0 shadow-md text-center border border-blue-800">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                    {formatDate(evt.date).split(' ')[1]}
                  </span>
                  <span className="text-2xl font-black leading-none text-white my-0.5">
                    {formatDate(evt.date).split(' ')[0]}
                  </span>
                  <span className="text-[10px] text-slate-300">
                    {formatDate(evt.date).split(' ')[2]}
                  </span>
                </div>

                {/* Main Content */}
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-900">
                      {evt.category}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{evt.time}</span>
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{evt.venue}</span>
                    </span>
                  </div>

                  <h2 className="text-lg sm:text-xl font-bold text-blue-950 font-heading">
                    {evt.title}
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {evt.description}
                  </p>

                  {/* Highlights */}
                  {evt.highlights && evt.highlights.length > 0 && (
                    <div className="pt-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Event Schedule Highlights
                      </h4>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {evt.highlights.map((h, hIdx) => (
                          <li key={hIdx} className="flex items-start gap-2 text-xs text-slate-700">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="shrink-0 self-end md:self-center">
                  <button
                    onClick={() => handleCopyEvent(evt)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Info</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
