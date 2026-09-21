import { useState } from 'react';
import {
  ArrowRight,
  Phone,
  BookOpen,
  Award,
  Users,
  Building2,
  Calendar,
  Bell,
  Sparkles,
  CheckCircle,
  GraduationCap,
  Microscope,
  Shield,
  Eye,
  FileDown,
} from 'lucide-react';
import { SchoolInfo, Notice, SchoolEvent, GalleryItem } from '../types';
import { ImageWithFallback } from '../components/common/ImageWithFallback';
import { formatDate } from '../utils/helpers';

interface HomePageProps {
  schoolInfo: SchoolInfo;
  notices: Notice[];
  events: SchoolEvent[];
  gallery: GalleryItem[];
  onNavigate: (tab: string) => void;
  onSelectNotice: (notice: Notice) => void;
  onOpenGalleryItem?: (item: GalleryItem) => void;
}

export function HomePage({
  schoolInfo,
  notices,
  events,
  gallery,
  onNavigate,
  onSelectNotice,
  onOpenGalleryItem,
}: HomePageProps) {
  const [activeTabNoticeCategory, setActiveTabNoticeCategory] = useState<string>('all');

  const pinnedNotices = notices.filter((n) => n.isPinned);
  const filteredNotices = notices
    .filter((n) => (activeTabNoticeCategory === 'all' ? true : n.category === activeTabNoticeCategory))
    .slice(0, 4);

  const upcomingEvents = events.filter((e) => e.isUpcoming).slice(0, 3);
  const galleryPreview = gallery.slice(0, 4);

  const facilities = [
    {
      title: 'Spacious & Airy Classrooms',
      description: 'Well-ventilated classrooms with dual-bench seating, chalkboards, and educational charts for focused learning.',
      icon: Building2,
    },
    {
      title: 'Science Experiment Lab',
      description: 'Hands-on practical models, charts, and apparatus for Physics, Chemistry, and Biology demonstration.',
      icon: Microscope,
    },
    {
      title: 'Digital & Computer Training',
      description: 'Foundational computer literacy training, safe internet awareness, and typing practice for students.',
      icon: Award,
    },
    {
      title: 'Sports & Assembly Ground',
      description: 'Open campus ground for morning assembly drills, yoga, volleyball, kho-kho, kabaddi, and athletics.',
      icon: Users,
    },
    {
      title: 'Library & Reading Corner',
      description: 'Collection of reference textbooks, children’s storybooks, science journals, and regional literature.',
      icon: BookOpen,
    },
    {
      title: 'Safe RO Drinking Water & Security',
      description: 'Purified mineral RO drinking water plant, clean sanitation, and vigilant campus supervision for student safety.',
      icon: Shield,
    },
  ];

  const whyChooseUs = [
    {
      title: 'English Medium with Strong Basics',
      desc: 'Focus on English conversational fluency, phonetics, and grammar while respecting and strengthening mother tongue Telugu.',
    },
    {
      title: 'Qualified & Caring Teaching Staff',
      desc: 'Experienced subject teachers who understand regional student needs and dedicate extra time to slow-paced learners.',
    },
    {
      title: 'Balanced Academic & Moral Growth',
      desc: 'Emphasis on discipline, daily yoga, national values, clean habits, and mutual respect alongside SSC syllabus preparation.',
    },
    {
      title: 'Affordable & Transparent Structure',
      desc: 'Quality English medium education made accessible for rural and agricultural families in Kotauratla and surrounding mandals.',
    },
  ];

  return (
    <div className="space-y-16 pb-12">
      {/* 1. HERO SECTION */}
      <section className="relative bg-slate-900 text-white overflow-hidden">
        {/* Background photo with deep overlay */}
        <div className="absolute inset-0 z-0">
          <ImageWithFallback
            src="/hero-classroom.jpg"
            alt="Vidya Vikas EM School Classroom"
            className="w-full h-full object-cover scale-105 filter brightness-40 contrast-110"
            fallbackTitle="Vidya Vikas EM School Classroom"
          />
          <div className="absolute inset-0 bg-linear-to-r from-blue-950/95 via-blue-950/85 to-slate-900/80" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24 lg:py-28">
          <div className="max-w-3xl space-y-6">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs sm:text-sm font-semibold backdrop-blur-xs">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Kotauratla, Anakapalle District • Established {schoolInfo.establishedYear}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black font-heading tracking-tight leading-tight text-white">
              Nurturing <span className="text-amber-400">Knowledge</span>, Character & Discipline.
            </h1>

            {/* Subtext */}
            <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-normal">
              {schoolInfo.name} provides recognized, quality English Medium education from Pre-Primary
              (LKG/UKG) through Class X. Dedicated to building confident, responsible, and capable citizens in rural Andhra Pradesh.
            </p>

            {/* CTAs */}
            <div className="pt-3 flex flex-wrap items-center gap-4">
              <button
                onClick={() => onNavigate('admissions')}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-blue-950 font-bold text-sm shadow-xl hover:shadow-amber-500/20 transition-all transform active:scale-95"
              >
                <span>Admissions 2026–27 Enquiry</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href={`tel:${schoolInfo.phone}`}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 backdrop-blur-xs transition-all"
              >
                <Phone className="w-4 h-4 text-amber-400" />
                <span>Call {schoolInfo.phone}</span>
              </a>

              <button
                onClick={() => onNavigate('downloads')}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl text-slate-300 hover:text-white font-medium text-sm transition-colors"
              >
                <FileDown className="w-4 h-4 text-slate-400" />
                <span>School Prospectus</span>
              </button>
            </div>

            {/* Quick trust badges */}
            <div className="pt-6 border-t border-slate-700/60 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>English Medium Curriculum</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>LKG to Class X (SSC)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Individual Student Care</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PINNED NOTICES TICKER / ALERT STRIP */}
      {pinnedNotices.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8 relative z-20">
          <div className="bg-amber-50 border-2 border-amber-300/80 rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-slate-900">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500 text-blue-950 rounded-xl font-bold shrink-0 shadow-xs">
                <Bell className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-amber-800 block">
                  Important Announcement
                </span>
                <span className="text-sm font-bold text-slate-900 line-clamp-1">
                  {pinnedNotices[0].title}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <button
                onClick={() => onSelectNotice(pinnedNotices[0])}
                className="px-4 py-1.5 rounded-lg bg-blue-950 hover:bg-blue-900 text-white text-xs font-bold transition-all shadow-xs"
              >
                Read Notice
              </button>
              <button
                onClick={() => onNavigate('notices')}
                className="px-3 py-1.5 rounded-lg border border-amber-300 text-amber-900 text-xs font-semibold hover:bg-amber-100 transition-colors"
              >
                View All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. WELCOME & PRINCIPAL MESSAGE SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Photo Card */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative rounded-2xl overflow-hidden shadow-xl border-4 border-white bg-slate-100">
              <ImageWithFallback
                src="/school-campus.jpg"
                alt="Vidya Vikas EM School Campus Building"
                className="w-full h-80 sm:h-96 object-cover"
                fallbackTitle="Vidya Vikas EM School Building, Kotauratla"
                category="Campus"
              />
              <div className="absolute bottom-0 inset-x-0 bg-linear-to-t from-slate-950/90 via-slate-950/60 to-transparent p-5 text-white">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-1">
                  Campus & Learning Environment
                </span>
                <p className="text-sm font-medium text-slate-200">
                  Peaceful school campus located in Kotauratla, facilitating holistic academic growth.
                </p>
              </div>
            </div>

            {/* Quick Fact Box */}
            <div className="bg-blue-50 border border-blue-200/80 rounded-xl p-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-blue-800 font-semibold block">Affiliation / Status</span>
                <span className="text-sm font-bold text-blue-950">AP State Board Curriculum (English Medium)</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-blue-800 font-semibold block">Classes Taught</span>
                <span className="text-sm font-bold text-blue-950">Pre-Primary to Class X</span>
              </div>
            </div>
          </div>

          {/* Text Message */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-900 bg-blue-100/80 px-3 py-1 rounded-full">
              <GraduationCap className="w-4 h-4 text-blue-900" />
              <span>Welcome to Vidya Vikas EM School</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-blue-950 font-heading tracking-tight leading-snug">
              Dedicated to Building a Strong Foundation for Every Child in Kotauratla
            </h2>

            <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
              {schoolInfo.welcomeMessage}
            </p>

            <blockquote className="border-l-4 border-amber-500 pl-4 py-1.5 my-3 bg-amber-50/50 rounded-r-xl">
              <p className="text-sm italic text-slate-700 font-medium">
                "{schoolInfo.principalMessage.slice(0, 220)}..."
              </p>
              <footer className="mt-2 text-xs font-bold text-blue-950 not-italic">
                — {schoolInfo.principalName}, <span className="text-slate-500 font-normal">Principal</span>
              </footer>
            </blockquote>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={() => onNavigate('about')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-950 hover:bg-blue-900 text-white font-bold text-sm transition-all shadow-md"
              >
                <span>Read Full School Journey</span>
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </button>

              <button
                onClick={() => onNavigate('faculty')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:text-blue-950 hover:bg-slate-100 font-semibold text-sm transition-colors"
              >
                <Users className="w-4 h-4 text-blue-900" />
                <span>Meet Our Faculty</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. ACADEMIC OVERVIEW BANNER */}
      <section className="bg-slate-100 py-12 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-blue-950 font-heading">
              Our Academic Stages
            </h2>
            <p className="text-sm text-slate-600">
              Structured progressive schooling designed to prepare students step-by-step for board examinations and lifelong understanding.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-lg mb-4">
                1
              </div>
              <h3 className="text-base font-bold text-blue-950 mb-1">Pre-Primary Wing</h3>
              <span className="text-xs font-semibold text-amber-700 block mb-3">Nursery, L.K.G & U.K.G</span>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Play-way activity learning, phonics fundamentals, motor skills development, and caring attention for beginners.
              </p>
              <ul className="text-xs text-slate-500 space-y-1.5">
                <li>• Rhymes & Storytelling</li>
                <li>• Letter & Number Identification</li>
                <li>• Child-friendly Play Area</li>
              </ul>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center font-bold text-lg mb-4">
                2
              </div>
              <h3 className="text-base font-bold text-blue-950 mb-1">Primary Wing</h3>
              <span className="text-xs font-semibold text-blue-800 block mb-3">Classes I to V</span>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Foundational literacy and numeracy (FLN), basic science curiosity, mathematical concepts, and bilingual vocabulary.
              </p>
              <ul className="text-xs text-slate-500 space-y-1.5">
                <li>• English, Telugu & Hindi</li>
                <li>• Environmental Studies (EVS)</li>
                <li>• Daily Handwriting & Tables</li>
              </ul>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-900 flex items-center justify-center font-bold text-lg mb-4">
                3
              </div>
              <h3 className="text-base font-bold text-blue-950 mb-1">Upper Primary</h3>
              <span className="text-xs font-semibold text-indigo-800 block mb-3">Classes VI to VIII</span>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Transition to conceptual discipline: General Science, Social Studies, Algebra, Geometry, and Computer basics.
              </p>
              <ul className="text-xs text-slate-500 space-y-1.5">
                <li>• Science Lab Experiments</li>
                <li>• Map Work & History Projects</li>
                <li>• Regular Assessment (FA1-FA4)</li>
              </ul>
            </div>

            {/* Card 4 */}
            <div className="bg-white rounded-2xl p-6 border-2 border-blue-900/40 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-blue-900 text-amber-400 flex items-center justify-center font-bold text-lg mb-4">
                4
              </div>
              <h3 className="text-base font-bold text-blue-950 mb-1">Secondary (SSC)</h3>
              <span className="text-xs font-semibold text-blue-900 block mb-3">Classes IX & X</span>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Rigorous preparation for Andhra Pradesh SSC Board Examinations with model test papers and intensive revision camps.
              </p>
              <ul className="text-xs text-slate-500 space-y-1.5">
                <li>• Chapter-wise Practice Sets</li>
                <li>• Doubts Clearance Sessions</li>
                <li>• Board Exam Presentation Training</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => onNavigate('academics')}
              className="inline-flex items-center gap-2 text-sm font-bold text-blue-950 hover:text-amber-700 transition-colors"
            >
              <span>Explore detailed curriculum and methodology</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 5. WHY CHOOSE VIDYA VIKAS EM SCHOOL */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-3 py-1 rounded-full inline-block">
              Why Parents Trust Us
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-blue-950 font-heading">
              Committed to Educational Excellence in Kotauratla
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              We understand the aspirations of families in Kotauratla mandal. Our goal is to ensure your
              child receives the same standard of disciplined English medium schooling as metropolitan centers, without breaking family budgets.
            </p>
            <div className="pt-2">
              <button
                onClick={() => onNavigate('admissions')}
                className="px-5 py-2.5 rounded-xl bg-blue-950 text-white text-sm font-bold shadow-md hover:bg-blue-900 transition-colors"
              >
                Admission Enquiry Form
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {whyChooseUs.map((item, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-300 transition-colors space-y-2"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-950 flex items-center justify-center font-bold text-sm">
                  ✓
                </div>
                <h3 className="text-sm font-bold text-blue-950">{item.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FACILITIES SECTION */}
      <section className="bg-slate-50 py-12 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-900">Campus Amenities</span>
            <h2 className="text-2xl sm:text-3xl font-black text-blue-950 font-heading">
              Our School Facilities
            </h2>
            <p className="text-sm text-slate-600">
              Clean, safe, and supportive physical infrastructure to facilitate all-round learning and health.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {facilities.map((fac, idx) => {
              const Icon = fac.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-3"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-900/10 text-blue-950 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-blue-900" />
                  </div>
                  <h3 className="text-base font-bold text-blue-950">{fac.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{fac.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. NOTICES & UPCOMING EVENTS SPLIT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Latest Notices */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-900 block">
                  Official Circulars
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-blue-950 font-heading">
                  Latest Notices
                </h2>
              </div>
              <button
                onClick={() => onNavigate('notices')}
                className="text-xs font-bold text-blue-900 hover:text-amber-700 flex items-center gap-1"
              >
                <span>View All ({notices.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Category filter pills */}
            <div className="flex flex-wrap gap-1.5 pb-1">
              {['all', 'admission', 'exam', 'general', 'holiday'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveTabNoticeCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors capitalize ${
                    activeTabNoticeCategory === cat
                      ? 'bg-blue-950 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Notices List */}
            <div className="space-y-3">
              {filteredNotices.map((notice) => (
                <div
                  key={notice.id}
                  onClick={() => onSelectNotice(notice)}
                  className="bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-xs cursor-pointer transition-all flex items-start justify-between gap-4 group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm bg-slate-100 text-slate-700">
                        {notice.category}
                      </span>
                      {notice.isPinned && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-sm bg-amber-100 text-amber-800">
                          Important
                        </span>
                      )}
                      <span className="text-xs text-slate-400">{formatDate(notice.date)}</span>
                    </div>
                    <h3 className="text-sm font-bold text-blue-950 group-hover:text-blue-800 transition-colors">
                      {notice.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {notice.summary}
                    </p>
                  </div>
                  <div className="shrink-0 p-2 text-slate-400 group-hover:text-blue-900 group-hover:translate-x-0.5 transition-all">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Upcoming Events */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800 block">
                  School Calendar
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-blue-950 font-heading">
                  Upcoming Events
                </h2>
              </div>
              <button
                onClick={() => onNavigate('events')}
                className="text-xs font-bold text-blue-900 hover:text-amber-700 flex items-center gap-1"
              >
                <span>Full Calendar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {upcomingEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-start gap-4"
                >
                  <div className="w-14 h-14 rounded-xl bg-blue-950 text-white flex flex-col items-center justify-center shrink-0 text-center">
                    <Calendar className="w-4 h-4 text-amber-400 mb-0.5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                      {formatDate(evt.date).split(' ')[1]}
                    </span>
                    <span className="text-sm font-black leading-none text-white">
                      {formatDate(evt.date).split(' ')[0]}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">
                      {evt.category} • {evt.time}
                    </span>
                    <h3 className="text-sm font-bold text-blue-950">{evt.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2">{evt.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 8. GALLERY PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-900 block">
              Campus Moments
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-blue-950 font-heading">
              Photo Gallery
            </h2>
          </div>
          <button
            onClick={() => onNavigate('gallery')}
            className="text-xs sm:text-sm font-bold text-blue-900 hover:text-amber-700 flex items-center gap-1"
          >
            <span>View Full Gallery</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {galleryPreview.map((item) => (
            <div
              key={item.id}
              onClick={() => (onOpenGalleryItem ? onOpenGalleryItem(item) : onNavigate('gallery'))}
              className="group relative rounded-2xl overflow-hidden shadow-xs border border-slate-200 cursor-pointer bg-slate-100 aspect-4/3"
            >
              <ImageWithFallback
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                fallbackTitle={item.title}
                category={item.category}
              />
              <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-transparent to-transparent opacity-90 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end text-white">
                <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">
                  {item.category}
                </span>
                <h3 className="text-xs font-bold line-clamp-1">{item.title}</h3>
              </div>
              <div className="absolute top-3 right-3 p-1.5 bg-black/40 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <Eye className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 9. ADMISSIONS CALL-TO-ACTION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-linear-to-r from-blue-950 via-blue-900 to-indigo-950 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-block px-3 py-1 rounded-full bg-amber-400 text-blue-950 text-xs font-black uppercase tracking-wider">
              Admissions 2026–27 Open
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black font-heading tracking-tight leading-tight">
              Give Your Child the Advantage of Quality English Medium Education
            </h2>
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
              Registrations are open for LKG, UKG, and Classes I to IX at Vidya Vikas EM School, Kotauratla.
              Submit your enquiry online or visit our school office.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={() => onNavigate('admissions')}
                className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-blue-950 font-bold text-sm shadow-lg transition-all transform active:scale-95"
              >
                Apply Online Now
              </button>
              <a
                href={`tel:${schoolInfo.phone}`}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 transition-all"
              >
                <Phone className="w-4 h-4 text-amber-400" />
                <span>Call: {schoolInfo.phone}</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
