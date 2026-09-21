import { useState } from 'react';
import {
  Download,
  FileText,
  Search,
  CheckCircle,
  Calendar,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { DownloadItem, DownloadCategory, SchoolInfo } from '../types';
import { triggerSchoolDownload, formatDate } from '../utils/helpers';
import { incrementDownloadCount } from '../services/storageService';
import { useToast } from '../components/common/Toast';

interface DownloadsPageProps {
  downloads: DownloadItem[];
  schoolInfo: SchoolInfo;
  onRefreshDownloads: () => void;
}

export function DownloadsPage({
  downloads,
  schoolInfo,
  onRefreshDownloads,
}: DownloadsPageProps) {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<DownloadCategory>('all');

  const categories = [
    { id: 'all', label: 'All Documents' },
    { id: 'admission', label: 'Admission Forms' },
    { id: 'prospectus', label: 'Prospectus' },
    { id: 'academic', label: 'Curriculum & Books' },
    { id: 'calendar', label: 'Academic Calendar' },
    { id: 'guideline', label: 'Guidelines & Rules' },
    { id: 'circular', label: 'Circulars' },
    { id: 'other', label: 'Other Documents' },
  ];

  const filteredDownloads = downloads.filter((item) => {
    if (item.isPublished === false) return false;

    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.fileName.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (activeCategory === 'all') return true;
    return item.category === activeCategory;
  });

  const handleDownload = (item: DownloadItem) => {
    incrementDownloadCount(item.id);
    onRefreshDownloads();

    try {
      const link = document.createElement('a');
      link.href = `/api/downloads/${item.id}/file`;
      const cleanFileName = item.fileName.endsWith('.pdf')
        ? item.fileName.replace(/\.pdf$/i, '.html')
        : item.fileName;
      link.setAttribute('download', cleanFileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      triggerSchoolDownload(item.title, item.fileName, item.category, schoolInfo);
    }

    showToast(`Downloading ${item.title}...`, 'success');
  };

  return (
    <div className="space-y-12 py-8 pb-16">
      {/* Header */}
      <section className="bg-slate-900 text-white py-12 px-4 sm:px-6 -mt-8">
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold">
            <Download className="w-4 h-4 text-amber-400" />
            <span>Student & Parent Resources</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-heading tracking-tight text-white">
            Downloads & Prospectus Center
          </h1>
          <p className="text-slate-300 max-w-2xl text-sm sm:text-base leading-relaxed">
            Access official school publications, admission registration forms, book lists, uniform codes,
            and academic year holiday calendars.
          </p>
        </div>
      </section>

      {/* Filter and Search */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search downloads by document name, prospectus, syllabus, or rules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 focus:border-blue-950"
            />
          </div>

          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as DownloadCategory)}
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

      {/* Documents List */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        {filteredDownloads.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-700">No resources found</h3>
            <p className="text-xs text-slate-500">
              Try adjusting your search query or choosing another category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredDownloads.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-900">
                      {doc.category}
                    </span>
                    <span className="text-xs text-slate-400">{doc.fileType} • {doc.fileSize}</span>
                  </div>

                  <h3 className="text-base font-bold text-blue-950 leading-snug">
                    {doc.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {doc.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Updated: {formatDate(doc.lastUpdated)} ({doc.downloadCount} downloads)
                  </span>

                  <button
                    onClick={() => handleDownload(doc)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-950 hover:bg-blue-900 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Offline Collection Notice */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500 text-blue-950 rounded-xl font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-blue-950">Printed Copies Available at Campus</h4>
              <p className="text-xs text-slate-600">
                Printed physical application forms and prospectus brochures can also be collected from the school office at Kotauratla.
              </p>
            </div>
          </div>
          <a
            href={`tel:${schoolInfo.phone}`}
            className="px-4 py-2 rounded-xl bg-blue-950 text-white text-xs font-bold uppercase tracking-wider hover:bg-blue-900 transition-colors shrink-0"
          >
            Call {schoolInfo.phone}
          </a>
        </div>
      </section>
    </div>
  );
}
