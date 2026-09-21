import { useState } from 'react';
import { SchoolInfo } from '../../types';
import { updateSchoolInfo } from '../../services/storageService';
import { useToast } from '../common/Toast';
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  Clock,
  User,
  Save,
  CheckCircle,
  Info,
  Calendar,
  Award,
} from 'lucide-react';

interface AdminProfileTabProps {
  schoolInfo: SchoolInfo;
  onDataChange: () => void;
}

export function AdminProfileTab({ schoolInfo, onDataChange }: AdminProfileTabProps) {
  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    name: schoolInfo.name || 'Vidya Vikas EM School',
    tagline: schoolInfo.tagline || 'Knowledge • Character • Excellence',
    affiliationNotice:
      schoolInfo.affiliationNotice || 'English Medium School (Pre-Primary to Class X - SSC Curriculum)',
    location: schoolInfo.location || 'Kotauratla, Anakapalle District, Andhra Pradesh',
    mandal: schoolInfo.mandal || 'Kotauratla Mandal',
    district: schoolInfo.district || 'Anakapalle District',
    state: schoolInfo.state || 'Andhra Pradesh',
    pinCode: schoolInfo.pinCode || '531085',
    address:
      schoolInfo.address ||
      'Main Road, Kotauratla, Anakapalle District, Andhra Pradesh - 531085, India',
    phone: schoolInfo.phone || '9441971531',
    alternatePhone: schoolInfo.alternatePhone || '',
    email: schoolInfo.email || 'vidyavikasschool.kotauratla@gmail.com',
    officeHours: schoolInfo.officeHours || 'Monday to Saturday: 8:30 AM – 4:30 PM',
    establishedYear: schoolInfo.establishedYear || '2008',
    academicYear: schoolInfo.academicYear || '2026–2027',
    principalName: schoolInfo.principalName || 'Principal Office',
    principalMessage:
      schoolInfo.principalMessage ||
      'Education is the stepping stone for personal growth and community development. At Vidya Vikas EM School, our focus is on structured classroom instruction, discipline, and building core English literacy and mathematical skills. We warmly welcome parents to collaborate with us in guiding their children’s learning journey.',
    welcomeMessage:
      schoolInfo.welcomeMessage ||
      'Welcome to Vidya Vikas EM School, located in Kotauratla, Anakapalle District, Andhra Pradesh. We are committed to providing quality English medium education, character building, and supportive foundational learning for every student.',
    vision:
      schoolInfo.vision ||
      'To provide accessible, high-quality English medium school education in Kotauratla and surrounding areas, empowering children with knowledge, confidence, and civic values.',
    mission:
      schoolInfo.mission ||
      'To foster a supportive, disciplined learning atmosphere through dedicated teachers, interactive classroom teaching, sports activities, and close parent-school partnership.',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      updateSchoolInfo(form);
      onDataChange();
      showToast('School profile updated and persisted to server database.', 'success');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-heading flex items-center gap-2">
            <span>School Profile & Institutional Details</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage official institution identity, contact numbers, address, principal message, and mission.
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSaving}
          className="px-5 py-2.5 rounded-xl bg-blue-950 hover:bg-blue-900 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save Profile Changes'}</span>
        </button>
      </div>

      {/* Compliance banner */}
      <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3 text-xs text-amber-950">
        <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Official Accuracy Notice:</strong> Institutional details configured here appear across the website header, footer, admissions circulars, contact touchpoints, and the AI School Assistant. All changes are stored securely on the server.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Identity */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-blue-950 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building2 className="w-4 h-4 text-amber-600" />
            <span>Institution Identity & Session</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Official School Name *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-900/20 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Motto / Tagline</label>
              <input
                type="text"
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-900/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Current Academic Year</label>
              <input
                type="text"
                placeholder="2026–2027"
                value={form.academicYear}
                onChange={(e) => setForm({ ...form, academicYear: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-blue-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Established Year</label>
              <input
                type="text"
                placeholder="2008"
                value={form.establishedYear}
                onChange={(e) => setForm({ ...form, establishedYear: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Curriculum & Affiliation Notice</label>
              <input
                type="text"
                value={form.affiliationNotice}
                onChange={(e) => setForm({ ...form, affiliationNotice: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Working & Office Hours</label>
              <input
                type="text"
                value={form.officeHours}
                onChange={(e) => setForm({ ...form, officeHours: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Contact & Location */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-blue-950 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Phone className="w-4 h-4 text-amber-600" />
            <span>Contact Information & Location</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Primary Phone (Kotauratla) *
              </label>
              <input
                type="text"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold text-blue-950"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Alternate / Helpline Phone</label>
              <input
                type="text"
                value={form.alternatePhone}
                onChange={(e) => setForm({ ...form, alternatePhone: e.target.value })}
                placeholder="Optional second line"
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">School Official Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Location Label</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mandal</label>
              <input
                type="text"
                value={form.mandal}
                onChange={(e) => setForm({ ...form, mandal: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">District</label>
              <input
                type="text"
                value={form.district}
                onChange={(e) => setForm({ ...form, district: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Postal PIN Code</label>
              <input
                type="text"
                value={form.pinCode}
                onChange={(e) => setForm({ ...form, pinCode: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono"
              />
            </div>
          </div>

          <div className="text-xs pt-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">Full Postal Campus Address</label>
            <textarea
              rows={2}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-900/20"
            />
          </div>
        </div>

        {/* Leadership & Statements */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-blue-950 flex items-center gap-2 border-b border-slate-100 pb-3">
            <User className="w-4 h-4 text-amber-600" />
            <span>Leadership & Institutional Statements</span>
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Principal / Office Title
              </label>
              <input
                type="text"
                value={form.principalName}
                onChange={(e) => setForm({ ...form, principalName: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Welcome Headline / Message</label>
              <textarea
                rows={2}
                value={form.welcomeMessage}
                onChange={(e) => setForm({ ...form, welcomeMessage: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-900/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Principal's Address to Parents</label>
              <textarea
                rows={3}
                value={form.principalMessage}
                onChange={(e) => setForm({ ...form, principalMessage: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-900/20"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Institutional Vision</label>
                <textarea
                  rows={3}
                  value={form.vision}
                  onChange={(e) => setForm({ ...form, vision: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-900/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Institutional Mission</label>
                <textarea
                  rows={3}
                  value={form.mission}
                  onChange={(e) => setForm({ ...form, mission: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-900/20"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 rounded-xl bg-blue-950 hover:bg-blue-900 text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
