import {
  GraduationCap,
  Target,
  Compass,
  Award,
  CheckCircle,
  Building,
  Users,
  Shield,
  Heart,
  ArrowRight,
} from 'lucide-react';
import { SchoolInfo } from '../types';
import { ImageWithFallback } from '../components/common/ImageWithFallback';

interface AboutPageProps {
  schoolInfo: SchoolInfo;
  onNavigate: (tab: string) => void;
}

export function AboutPage({ schoolInfo, onNavigate }: AboutPageProps) {
  const milestones = [
    {
      year: '2008',
      title: 'Founding of Vidya Vikas EM School',
      desc: 'Established in Kotauratla with foundational Pre-Primary and Primary sections to provide English medium schooling in the mandal.',
    },
    {
      year: '2012',
      title: 'Expansion to High School (Classes VI to X)',
      desc: 'Upgraded infrastructure, added science lab equipment, and achieved AP SSC board recognition for senior school students.',
    },
    {
      year: '2018',
      title: 'Digital Literacy & Modern Science Wing',
      desc: 'Introduced computer education, hands-on science clubs, and improved sports ground facilities for rural athletes.',
    },
    {
      year: 'Present',
      title: 'A Trusted Educational Landmark',
      desc: 'Serving hundreds of families across Kotauratla and adjoining villages of Anakapalle District with steadfast discipline and care.',
    },
  ];

  return (
    <div className="space-y-16 py-8 pb-16">
      {/* Top Page Header */}
      <section className="bg-slate-900 text-white py-12 px-4 sm:px-6 -mt-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold">
            <GraduationCap className="w-4 h-4 text-amber-400" />
            <span>Kotauratla, Anakapalle District</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-heading tracking-tight text-white">
            About {schoolInfo.name}
          </h1>
          <p className="text-slate-300 max-w-2xl text-sm sm:text-base leading-relaxed">
            Discover our educational philosophy, our roots in Kotauratla, and our continuous commitment to
            nurturing enlightened and ethical young minds.
          </p>
        </div>
      </section>

      {/* School Overview & Campus Photo */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-5">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-900 bg-blue-100 px-3 py-1 rounded-full">
              Our Identity
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-blue-950 font-heading">
              Dedicated to Accessible, High-Quality English Medium Schooling
            </h2>
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
              {schoolInfo.name} is situated in the peaceful mandal headquarters of Kotauratla in
              Anakapalle District, Andhra Pradesh. We provide comprehensive schooling from Pre-Primary
              (Nursery, LKG, UKG) through Class X.
            </p>
            <p className="text-slate-600 leading-relaxed text-sm">
              Recognizing that modern society demands fluency in global language skills alongside deep rootedness
              in moral character, our curriculum emphasizes conversational English, strong mathematical foundations,
              scientific questioning, and ethical cultural grounding.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                <span className="text-2xl font-black text-blue-950 block">LKG – X</span>
                <span className="text-xs text-blue-800 font-semibold">Classes Offered</span>
              </div>
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                <span className="text-2xl font-black text-amber-900 block">{schoolInfo.establishedYear}</span>
                <span className="text-xs text-amber-800 font-semibold">Year Established</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-2xl overflow-hidden shadow-xl border-4 border-white bg-slate-100">
              <ImageWithFallback
                src="/school-campus.jpg"
                alt="Vidya Vikas EM School Kotauratla Campus"
                className="w-full h-80 sm:h-96 object-cover"
                fallbackTitle="School Campus & Courtyard, Kotauratla"
                category="Campus"
              />
              <div className="p-4 bg-slate-900 text-white text-xs">
                <p className="font-semibold text-amber-300">Vidya Vikas EM School Campus Ground</p>
                <p className="text-slate-400">Kotauratla Mandal, Anakapalle District, Andhra Pradesh</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission Cards */}
      <section className="bg-slate-100 py-12 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Vision */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-900 text-amber-400 flex items-center justify-center">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-blue-950 font-heading">Our Vision</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{schoolInfo.vision}</p>
            </div>

            {/* Mission */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500 text-blue-950 flex items-center justify-center">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-blue-950 font-heading">Our Mission</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{schoolInfo.mission}</p>
            </div>
          </div>

          {/* Core Values */}
          <div className="mt-8 bg-white rounded-2xl p-6 border border-slate-200">
            <h4 className="text-sm font-bold uppercase tracking-wider text-blue-950 mb-4 text-center">
              Our Core Institutional Values
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {schoolInfo.values.map((val, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Principal's Message Dedicated Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-4 text-center lg:text-left space-y-3">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-linear-to-br from-blue-900 to-indigo-950 text-amber-300 flex items-center justify-center mx-auto lg:mx-0 shadow-lg border-2 border-amber-400">
                <GraduationCap className="w-12 h-12" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-blue-950">{schoolInfo.principalName}</h3>
                <p className="text-xs font-medium text-amber-700">Principal & Academic Head</p>
                <p className="text-xs text-slate-500">Vidya Vikas EM School, Kotauratla</p>
              </div>
            </div>

            <div className="lg:col-span-8 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-900 bg-blue-50 px-3 py-1 rounded-full inline-block">
                Principal’s Desk
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-blue-950 font-heading">
                "Every Child Deserves an Opportunity to Shine"
              </h2>
              <div className="text-sm text-slate-600 space-y-3 leading-relaxed">
                <p>{schoolInfo.principalMessage}</p>
                <p>
                  We encourage parents to be active partners in their child's educational journey.
                  Our doors are always open for academic discussions, guidance, and community collaboration.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* School Journey / Timeline */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-900">Our Growth</span>
          <h2 className="text-2xl sm:text-3xl font-black text-blue-950 font-heading">
            The School Journey in Kotauratla
          </h2>
          <p className="text-sm text-slate-600">
            A continuous path of educational service to the families and children of Anakapalle District.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {milestones.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs relative flex flex-col justify-between"
            >
              <div>
                <span className="text-2xl font-black text-amber-600 font-heading block mb-2">
                  {item.year}
                </span>
                <h3 className="text-sm font-bold text-blue-950 mb-2">{item.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                <span>Phase {idx + 1}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-blue-950 rounded-2xl p-8 text-center text-white space-y-4">
          <h3 className="text-xl sm:text-2xl font-bold font-heading">
            Visit Our Campus in Kotauratla
          </h3>
          <p className="text-sm text-slate-300 max-w-xl mx-auto">
            Experience our classrooms, interact with our teaching staff, and explore admission details for your child.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => onNavigate('contact')}
              className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-blue-950 font-bold text-sm transition-all"
            >
              Get Directions & Contact Info
            </button>
            <button
              onClick={() => onNavigate('admissions')}
              className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 transition-all"
            >
              Admissions Process
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
