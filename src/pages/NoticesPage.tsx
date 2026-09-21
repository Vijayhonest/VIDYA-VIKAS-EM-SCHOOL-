import { useState } from 'react';
import {
  Bell,
  Search,
  Calendar,
  FileText,
  Download,
  CheckCircle,
  Sparkles,
  ArrowRight,
  Printer,
} from 'lucide-react';
import { Notice, NoticeCategory, SchoolInfo } from '../types';
import { formatDate, triggerSchoolDownload } from '../utils/helpers';
import { Modal } from '../components/common/Modal';

interface NoticesPageProps {
  notices: Notice[];
  schoolInfo: SchoolInfo;
  selectedNotice: Notice | null;
  onSelectNotice: (notice: Notice | null) => void;
}

export function NoticesPage({
  notices,
  schoolInfo,
  selectedNotice,
  onSelectNotice,
}: NoticesPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Notices' },
    { id: 'admission', label: 'Admissions' },
    { id: 'exam', label: 'Examinations' },
    { id: 'general', label: 'General Circulars' },
    { id: 'holiday', label: 'Holidays' },
    { id: 'event', label: 'School Events' },
  ];

  const filteredNotices = notices.filter((notice) => {
    const matchesSearch =
      notice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notice.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notice.content.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (activeCategory === 'all') return true;
    return notice.category === activeCategory;
  });

  const handleDownloadNoticeCopy = (notice: Notice) => {
    triggerSchoolDownload(
      notice.title,
      notice.attachmentName || `Notice_${notice.id}.pdf`,
      notice.category,
      schoolInfo
    );
  };

  return (
    <div className="space-y-12 py-8 pb-16">
      {/* Header */}
      <section className="bg-slate-900 text-white py-12 px-4 sm:px-6 -mt-8">
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold">
            <Bell className="w-4 h-4 text-amber-400" />
            <span>Official Circulars & Information</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-heading tracking-tight text-white">
            School Notices & Circulars
          </h1>
          <p className="text-slate-300 max-w-2xl text-sm sm:text-base leading-relaxed">
            Stay updated with official academic schedules, examination timetables, holiday announcements,
            and administrative notifications issued by Vidya Vikas EM School.
          </p>
        </div>
      </section>

      {/* Search & Category Filter Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search circulars by keyword, exam name, holiday, or syllabus..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 focus:border-blue-950"
            />
          </div>

          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeCategory === cat.id
                    ? 'bg-blue-950 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Notices List */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        {filteredNotices.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
            <Bell className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-700">No notices match your criteria</h3>
            <p className="text-xs text-slate-500">
              Try adjusting your search query or selecting another category.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
              }}
              className="px-4 py-2 rounded-xl bg-blue-950 text-white text-xs font-semibold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotices.map((notice) => (
              <div
                key={notice.id}
                className={`bg-white rounded-2xl p-5 sm:p-6 border transition-all ${
                  notice.isPinned
                    ? 'border-amber-300 bg-amber-50/30 shadow-xs'
                    : 'border-slate-200 hover:border-blue-300 shadow-xs'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {notice.category}
                      </span>
                      {notice.isPinned && (
                        <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-amber-400 text-blue-950 flex items-center gap-1 shadow-xs">
                          <Sparkles className="w-3 h-3" />
                          <span>Pinned Circular</span>
                        </span>
                      )}
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDate(notice.date)}</span>
                      </span>
                      <span className="text-xs text-slate-400">• By {notice.postedBy}</span>
                    </div>

                    <h2 className="text-base sm:text-lg font-bold text-blue-950 font-heading">
                      {notice.title}
                    </h2>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {notice.summary}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => onSelectNotice(notice)}
                      className="px-4 py-2 rounded-xl bg-blue-950 hover:bg-blue-900 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                    >
                      <span>Read Full Notice</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    {notice.attachmentName && (
                      <button
                        onClick={() => handleDownloadNoticeCopy(notice)}
                        className="p-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-600 transition-colors"
                        title={`Download ${notice.attachmentName}`}
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Notice Detail Modal */}
      {selectedNotice && (
        <Modal
          isOpen={true}
          onClose={() => onSelectNotice(null)}
          title="Official School Notice"
          maxWidth="2xl"
        >
          <div className="space-y-6">
            {/* Circular Header */}
            <div className="border-b border-slate-200 pb-4 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-900 bg-blue-50 px-2.5 py-1 rounded-md">
                  Category: {selectedNotice.category}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Issued Date: {formatDate(selectedNotice.date)}
                </span>
              </div>
              <h2 className="text-xl font-bold text-blue-950 font-heading leading-snug">
                {selectedNotice.title}
              </h2>
              <div className="text-xs text-slate-400">
                Authorized By: <strong className="text-slate-700">{selectedNotice.postedBy}</strong>
              </div>
            </div>

            {/* Circular Body Content */}
            <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line space-y-3">
              <p>{selectedNotice.content}</p>
            </div>

            {/* Official Footer within Modal */}
            <div className="pt-4 border-t border-slate-200 bg-slate-50 -mx-6 -mb-6 p-6 rounded-b-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
                <div>
                  <span className="block font-bold text-slate-800">{schoolInfo.name}</span>
                  <span>{schoolInfo.address}</span>
                </div>
                <div className="sm:text-right">
                  <span>Enquiries Phone: </span>
                  <strong className="text-blue-950">{schoolInfo.phone}</strong>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => handleDownloadNoticeCopy(selectedNotice)}
                  className="px-4 py-2 rounded-xl bg-blue-950 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 hover:bg-blue-900 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download / Print Copy</span>
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
