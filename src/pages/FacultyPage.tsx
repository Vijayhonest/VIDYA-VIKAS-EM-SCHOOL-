import { useState } from 'react';
import {
  Users,
  GraduationCap,
  Briefcase,
  Award,
  Search,
  BookOpen,
  Sparkles,
  Lock,
} from 'lucide-react';
import { FacultyMember } from '../types';

interface FacultyPageProps {
  faculty: FacultyMember[];
  onOpenAdminLogin: () => void;
}

export function FacultyPage({ faculty, onOpenAdminLogin }: FacultyPageProps) {
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const departments = [
    { id: 'all', label: 'All Departments' },
    { id: 'leadership', label: 'School Leadership' },
    { id: 'science', label: 'Science & Math' },
    { id: 'languages', label: 'Languages' },
    { id: 'primary', label: 'Primary & Pre-Primary' },
    { id: 'sports', label: 'Physical Education & IT' },
  ];

  const filteredFaculty = faculty.filter((member) => {
    // Search filter
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.qualification.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Dept filter
    if (selectedDept === 'all') return true;
    if (selectedDept === 'leadership') return member.isLeadership;
    if (selectedDept === 'science')
      return (
        member.department.toLowerCase().includes('science') ||
        member.department.toLowerCase().includes('mathematics')
      );
    if (selectedDept === 'languages')
      return (
        member.department.toLowerCase().includes('languages') ||
        member.designation.toLowerCase().includes('telugu') ||
        member.designation.toLowerCase().includes('english')
      );
    if (selectedDept === 'primary')
      return (
        member.department.toLowerCase().includes('primary') ||
        member.department.toLowerCase().includes('kindergarten')
      );
    if (selectedDept === 'sports')
      return (
        member.department.toLowerCase().includes('physical') ||
        member.department.toLowerCase().includes('technology') ||
        member.department.toLowerCase().includes('computer')
      );
    return true;
  });

  return (
    <div className="space-y-16 py-8 pb-16">
      {/* Header */}
      <section className="bg-slate-900 text-white py-12 px-4 sm:px-6 -mt-8">
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold">
            <Users className="w-4 h-4 text-amber-400" />
            <span>Dedicated Mentors in Kotauratla</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-heading tracking-tight text-white">
            Our Faculty & Staff Directory
          </h1>
          <p className="text-slate-300 max-w-2xl text-sm sm:text-base leading-relaxed">
            Our qualified, compassionate teachers are committed to building conceptual clarity, discipline,
            and personal confidence in every student from early childhood to Class X.
          </p>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search teacher by name, subject, or qualification..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900"
              />
            </div>

            {/* Admin Note */}
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Are you a faculty administrator?</span>
              <button
                onClick={onOpenAdminLogin}
                className="font-bold text-blue-950 hover:text-amber-600 flex items-center gap-1"
              >
                <Lock className="w-3 h-3" />
                <span>Manage Staff via Portal</span>
              </button>
            </div>
          </div>

          {/* Department Filter Tabs */}
          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
            {departments.map((dept) => (
              <button
                key={dept.id}
                onClick={() => setSelectedDept(dept.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedDept === dept.id
                    ? 'bg-blue-950 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {dept.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Faculty Cards Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        {filteredFaculty.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-700">No faculty members found</h3>
            <p className="text-xs text-slate-500">
              Try changing your search term or selecting "All Departments".
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedDept('all');
              }}
              className="px-4 py-2 rounded-xl bg-blue-950 text-white text-xs font-semibold"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFaculty.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between"
              >
                <div className="p-6 space-y-4">
                  {/* Top Bar: Department & Badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md">
                      {member.department}
                    </span>
                    {member.isLeadership && (
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-600" />
                        <span>Leadership</span>
                      </span>
                    )}
                  </div>

                  {/* Avatar & Name */}
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-blue-900 to-indigo-950 text-amber-300 flex items-center justify-center font-bold text-xl font-heading shrink-0 shadow-sm border border-blue-800">
                      {member.name
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-blue-950 leading-snug">
                        {member.name}
                      </h3>
                      <p className="text-xs font-semibold text-amber-700 mt-0.5">
                        {member.designation}
                      </p>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
                        <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                        <span>{member.qualification}</span>
                      </div>
                    </div>
                  </div>

                  {/* Profile Description */}
                  <p className="text-xs text-slate-600 leading-relaxed pt-1">
                    {member.shortProfile}
                  </p>
                </div>

                {/* Card Footer: Experience */}
                <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-blue-900" />
                    <span className="font-semibold text-slate-700">{member.experience} Experience</span>
                  </div>
                  <span className="text-[11px] text-slate-400">Kotauratla Campus</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Join Our Team Notice */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-base sm:text-lg font-bold text-blue-950">
              Are You a Passionate Educator in Anakapalle District?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              We periodically invite qualified B.Ed. and D.El.Ed. certified educators to join our school faculty.
            </p>
          </div>
          <a
            href="tel:9441971531"
            className="px-5 py-2.5 rounded-xl bg-blue-950 hover:bg-blue-900 text-white font-bold text-xs uppercase tracking-wider transition-all shrink-0"
          >
            Contact Principal’s Office
          </a>
        </div>
      </section>
    </div>
  );
}
