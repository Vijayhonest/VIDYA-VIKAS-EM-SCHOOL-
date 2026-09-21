import { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  Clock,
  Layers,
  HelpCircle,
  FileText,
} from 'lucide-react';
import { SchoolInfo } from '../types';

interface AcademicsPageProps {
  schoolInfo: SchoolInfo;
  onNavigate: (tab: string) => void;
}

export function AcademicsPage({ schoolInfo, onNavigate }: AcademicsPageProps) {
  const [selectedWing, setSelectedWing] = useState<'all' | 'pre-primary' | 'primary' | 'middle' | 'secondary'>('all');

  const curriculumSections = [
    {
      id: 'pre-primary',
      title: 'Pre-Primary Wing (Early Childhood)',
      grades: 'Nursery, L.K.G & U.K.G',
      focus: 'Foundational Socialization, Motor Skills & Phonics',
      subjects: ['English Rhymes & Phonics', 'Number Readiness & Counting', 'Telugu Aksharamulu (Oral)', 'Creative Coloring & Craft', 'Good Habits & Moral Stories'],
      approach:
        'Learning through joyous play-way methods, sensory exploration, flashcards, and storytelling. Children develop speaking confidence, pencil grip, and classroom sociability in a safe, caring setting.',
    },
    {
      id: 'primary',
      title: 'Primary Wing (Foundational Literacy & Numeracy)',
      grades: 'Classes I to V',
      focus: 'Language Mastery, Arithmetic & Environmental Awareness',
      subjects: ['English (Reader, Grammar & Handwriting)', 'Mathematics (Mental Math & Word Problems)', 'Environmental Studies (EVS)', 'Telugu (First Language)', 'Hindi (Introductory)', 'Moral Science & Drawing'],
      approach:
        'Continuous evaluation, daily reading drill, tables practice, and bilingual explanations to ensure rural first-generation learners grasp complex concepts without hesitation.',
    },
    {
      id: 'middle',
      title: 'Upper Primary Wing (Conceptual Expansion)',
      grades: 'Classes VI to VIII',
      focus: 'Scientific Questioning & Broadened Subject Depth',
      subjects: ['English Language & Composition', 'Mathematics (Arithmetic, Algebra, Geometry)', 'General Science (Physical & Biological)', 'Social Studies (History, Civics, Geography)', 'Telugu (First Language)', 'Hindi (Second Language)', 'Computer Basics'],
      approach:
        'Introduction of laboratory observations, science charts, social science map drawing, and project works aligned with the AP State Board curriculum.',
    },
    {
      id: 'secondary',
      title: 'Secondary High School (SSC Board Focus)',
      grades: 'Classes IX & X',
      focus: 'Board Exam Preparation, Analytical Problem Solving & Career Vision',
      subjects: ['First Language: Telugu', 'Second Language: Hindi', 'Third Language: English', 'Mathematics (Paper I & II Concepts)', 'Physical Sciences (Physics & Chemistry)', 'Biological Sciences (Botany & Zoology)', 'Social Studies (Contemporary India & AP)'],
      approach:
        'Targeted revision cycles, Formative Assessments (FA1 to FA4), Summative Assessments (SA1 & SA2), previous 10-year SSC question paper discussions, and personalized student mentoring.',
    },
  ];

  const methodologyPillars = [
    {
      title: 'Bilingual Conceptual Bridging',
      desc: 'While English is the medium of instruction and exams, teachers ensure concepts are clearly understood using regional context so no student feels left behind.',
    },
    {
      title: 'Continuous Formative Assessment',
      desc: 'Regular class tests, oral quizzes, project works, and notebook evaluations track continuous progress rather than relying solely on year-end exams.',
    },
    {
      title: 'Daily Handwriting & Reading Habits',
      desc: 'Dedicated 15 minutes every morning for English cursive handwriting and Telugu script practice, reinforcing legibility and discipline.',
    },
    {
      title: 'Remedial Zero Periods for Slow Learners',
      desc: 'Extra morning and afternoon zero-periods for students who need additional assistance in mathematics and science problem solving.',
    },
  ];

  const dailySchedule = [
    { time: '08:45 AM – 09:15 AM', activity: 'Morning Assembly, Prayer, Daily News, Yoga & Pledge' },
    { time: '09:15 AM – 10:35 AM', activity: 'Period 1 & 2: Mathematics & Core Language' },
    { time: '10:35 AM – 10:45 AM', activity: 'Morning Refreshment & Water Break' },
    { time: '10:45 AM – 12:45 PM', activity: 'Period 3 & 4: General Science & Social Studies' },
    { time: '12:45 PM – 01:30 PM', activity: 'Lunch Break & Supervised Play' },
    { time: '01:30 PM – 03:30 PM', activity: 'Period 5 & 6: Hindi/Telugu, Computers, Project Work' },
    { time: '03:30 PM – 04:15 PM', activity: 'Physical Education / Sports / Library / Cultural Club' },
    { time: '04:15 PM – 04:45 PM', activity: 'High School Study Hour & Diary Writing' },
  ];

  const filteredCurriculum =
    selectedWing === 'all'
      ? curriculumSections
      : curriculumSections.filter((sec) => sec.id === selectedWing);

  return (
    <div className="space-y-16 py-8 pb-16">
      {/* Top Banner */}
      <section className="bg-slate-900 text-white py-12 px-4 sm:px-6 -mt-8">
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>Academic Excellence in Kotauratla</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-heading tracking-tight text-white">
            Academic Approach & Curriculum
          </h1>
          <p className="text-slate-300 max-w-2xl text-sm sm:text-base leading-relaxed">
            A comprehensive, values-driven English medium curriculum designed in accordance with Andhra Pradesh
            educational norms, preparing students for board examination success and lifelong capability.
          </p>
        </div>
      </section>

      {/* Teaching Methodology Overview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-900">How We Teach</span>
          <h2 className="text-2xl sm:text-3xl font-black text-blue-950 font-heading">
            Our Teaching Methodology
          </h2>
          <p className="text-sm text-slate-600">
            Balancing structured syllabus coverage with practical, supportive classroom engagement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {methodologyPillars.map((m, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:border-blue-300 transition-all space-y-3"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-950 flex items-center justify-center font-bold text-sm">
                0{idx + 1}
              </div>
              <h3 className="text-base font-bold text-blue-950">{m.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Curriculum Breakdown */}
      <section className="bg-slate-100 py-12 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-900">Stage by Stage</span>
              <h2 className="text-2xl sm:text-3xl font-black text-blue-950 font-heading">
                Curriculum Structure (LKG to Class X)
              </h2>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-1.5 bg-white p-1.5 rounded-xl border border-slate-200">
              {[
                { id: 'all', label: 'All Wings' },
                { id: 'pre-primary', label: 'Pre-Primary' },
                { id: 'primary', label: 'Primary (I-V)' },
                { id: 'middle', label: 'Middle (VI-VIII)' },
                { id: 'secondary', label: 'SSC (IX-X)' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedWing(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedWing === tab.id
                      ? 'bg-blue-950 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCurriculum.map((sec) => (
              <div
                key={sec.id}
                className="bg-white rounded-2xl p-7 border border-slate-200 shadow-xs flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-amber-100 text-amber-900">
                      {sec.grades}
                    </span>
                    <span className="text-xs font-bold text-slate-400">AP State Syllabus</span>
                  </div>

                  <h3 className="text-xl font-bold text-blue-950">{sec.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{sec.approach}</p>

                  <div className="pt-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Key Subjects Covered
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {sec.subjects.map((sub, sIdx) => (
                        <span
                          key={sIdx}
                          className="text-xs bg-slate-50 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-md"
                        >
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Core Focus: {sec.focus}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Daily Routine / School Schedule */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-900 bg-blue-100 px-3 py-1 rounded-full inline-block">
              Discipline & Punctuality
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-blue-950 font-heading">
              Daily School Routine
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              A balanced daily timetable ensures students maintain high physical energy, mental focus, and
              adequate time for core subjects, languages, physical activity, and home assignments.
            </p>
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
              <span className="font-bold block">Punctuality Reminder:</span>
              <p>Students must report to the campus by 8:40 AM for the daily morning assembly drill.</p>
            </div>
          </div>

          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="divide-y divide-slate-100">
              {dailySchedule.map((slot, sIdx) => (
                <div key={sIdx} className="p-4 flex items-center gap-4 hover:bg-slate-50/70 transition-colors">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-950 bg-slate-100 px-3 py-1.5 rounded-lg shrink-0">
                    <Clock className="w-3.5 h-3.5 text-blue-900" />
                    <span>{slot.time}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 font-medium leading-tight">
                    {slot.activity}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Download Syllabus / Contact CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-linear-to-r from-blue-950 to-indigo-950 rounded-2xl p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg sm:text-xl font-bold font-heading">
              Have Questions About Our Academic Standards?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              Download our complete academic prospectus or contact the principal's office directly.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('downloads')}
              className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-blue-950 font-bold text-xs uppercase tracking-wider transition-all"
            >
              Get Prospectus
            </button>
            <button
              onClick={() => onNavigate('admissions')}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all"
            >
              Enquire Admissions
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
