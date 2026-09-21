import { useState } from 'react';
import {
  GraduationCap,
  CheckCircle,
  FileText,
  AlertCircle,
  Phone,
  ArrowRight,
  Clock,
  Printer,
  Copy,
  Sparkles,
} from 'lucide-react';
import { SchoolInfo, AdmissionEnquiry } from '../types';
import { submitAdmissionEnquiry } from '../services/storageService';
import { validateIndianPhone, validateEmail, sanitizeText } from '../utils/helpers';
import { useToast } from '../components/common/Toast';

interface AdmissionsPageProps {
  schoolInfo: SchoolInfo;
  onNavigate: (tab: string) => void;
}

export function AdmissionsPage({ schoolInfo, onNavigate }: AdmissionsPageProps) {
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    studentName: '',
    parentName: '',
    phone: '',
    email: '',
    gradeApplying: 'L.K.G',
    dob: '',
    gender: 'Male',
    previousSchool: '',
    address: '',
    message: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedEnquiry, setSubmittedEnquiry] = useState<AdmissionEnquiry | null>(null);

  const admissionSteps = [
    {
      step: '01',
      title: 'Online Enquiry / Campus Visit',
      desc: 'Fill out the online application below or visit our administrative office at Kotauratla to collect the school prospectus.',
    },
    {
      step: '02',
      title: 'Interaction & Assessment',
      desc: 'An informal, friendly interaction with the child and parents to understand readiness and academic foundation.',
    },
    {
      step: '03',
      title: 'Document Submission',
      desc: 'Submit copies of Birth Certificate, Transfer Certificate (T.C), Aadhaar card, and passport-size photographs.',
    },
    {
      step: '04',
      title: 'Seat Confirmation',
      desc: 'Complete fee formalities and receive uniform specifications, textbook list, and school identity card.',
    },
  ];

  const requiredDocuments = [
    'Original Birth Certificate (for Pre-Primary & Class I)',
    'Transfer Certificate (T.C.) counter-signed by the previous school (Class II upwards)',
    'Photocopy of Student & Parent Aadhaar Cards',
    'Previous Class Progress Report / Marks Card (original & copy)',
    '4 Passport-size photographs of the student',
    'Caste / Community Certificate (if applicable for state records)',
    'Recent Medical / Blood Group verification certificate',
  ];

  const eligibilityTable = [
    { grade: 'Nursery', ageLimit: '2 Years 6 Months + as of 1st June' },
    { grade: 'L.K.G', ageLimit: '3 Years 6 Months + as of 1st June' },
    { grade: 'U.K.G', ageLimit: '4 Years 6 Months + as of 1st June' },
    { grade: 'Class I', ageLimit: '5 Years 6 Months + as of 1st June' },
    { grade: 'Class II to X', ageLimit: 'Based on successful completion of previous grade & valid T.C.' },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.studentName.trim() || formData.studentName.trim().length < 2) {
      errors.studentName = 'Please enter student full name.';
    }

    if (!formData.parentName.trim() || formData.parentName.trim().length < 2) {
      errors.parentName = 'Please enter parent/guardian full name.';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Mobile number is required.';
    } else if (!validateIndianPhone(formData.phone)) {
      errors.phone = 'Enter a valid 10-digit Indian mobile number.';
    }

    if (formData.email.trim() && !validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!formData.dob) {
      errors.dob = 'Date of birth is required.';
    }

    if (!formData.address.trim() || formData.address.trim().length < 4) {
      errors.address = 'Please mention your village/town or street address.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast('Please fix the errors in the form before submitting.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const enquiry = await submitAdmissionEnquiry({
        studentName: sanitizeText(formData.studentName),
        parentName: sanitizeText(formData.parentName),
        phone: sanitizeText(formData.phone),
        email: sanitizeText(formData.email),
        gradeApplying: formData.gradeApplying,
        previousSchool: sanitizeText(formData.previousSchool) || 'N/A',
        dob: formData.dob,
        gender: formData.gender,
        address: sanitizeText(formData.address),
        message: sanitizeText(formData.message),
      });

      setIsSubmitting(false);
      setSubmittedEnquiry(enquiry);
      showToast(`Admission application registered successfully! Ref: ${enquiry.applicationNo}`, 'success');
    } catch (err) {
      setIsSubmitting(false);
      showToast('Failed to submit application. Please try again or call the school office.', 'error');
    }
  };

  const handleCopyRef = () => {
    if (submittedEnquiry) {
      navigator.clipboard.writeText(submittedEnquiry.applicationNo);
      showToast('Application Reference Number copied to clipboard!', 'info');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const resetForm = () => {
    setSubmittedEnquiry(null);
    setFormData({
      studentName: '',
      parentName: '',
      phone: '',
      email: '',
      gradeApplying: 'L.K.G',
      dob: '',
      gender: 'Male',
      previousSchool: '',
      address: '',
      message: '',
    });
  };

  return (
    <div className="space-y-16 py-8 pb-16">
      {/* Header */}
      <section className="bg-slate-900 text-white py-12 px-4 sm:px-6 -mt-8">
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold">
            <GraduationCap className="w-4 h-4 text-amber-400" />
            <span>Academic Session 2026–2027</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-heading tracking-tight text-white">
            School Admissions & Registration
          </h1>
          <p className="text-slate-300 max-w-2xl text-sm sm:text-base leading-relaxed">
            Welcome to the admissions portal of {schoolInfo.name}, Kotauratla. Admissions are open for
            Pre-Primary (Nursery, LKG, UKG) and Classes I to IX.
          </p>
        </div>
      </section>

      {/* Admission Process Steps */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-900">Step-by-Step</span>
          <h2 className="text-2xl sm:text-3xl font-black text-blue-950 font-heading">
            Simple 4-Step Admission Process
          </h2>
          <p className="text-sm text-slate-600">
            We ensure a transparent, parent-friendly admission procedure for all applicants.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {admissionSteps.map((step, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs relative flex flex-col justify-between"
            >
              <div>
                <span className="text-3xl font-black text-amber-600 font-heading block mb-2">
                  {step.step}
                </span>
                <h3 className="text-base font-bold text-blue-950 mb-2">{step.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{step.desc}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1 text-[11px] font-semibold text-blue-900">
                <span>Phase {idx + 1}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Eligibility & Documents Grid */}
      <section className="bg-slate-100 py-12 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Eligibility Table */}
            <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800">Criteria</span>
                <h3 className="text-lg font-bold text-blue-950">Age & Eligibility Norms</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase">
                      <th className="py-2.5">Class / Level</th>
                      <th className="py-2.5">Eligibility Guideline</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {eligibilityTable.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2.5 font-bold text-blue-950">{row.grade}</td>
                        <td className="py-2.5 text-slate-600">{row.ageLimit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="text-[11px] text-slate-400 italic">
                * Age calculations are made as per the guidelines of Andhra Pradesh School Education Department.
              </p>
            </div>

            {/* Documents Checklist */}
            <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-900">Checklist</span>
                <h3 className="text-lg font-bold text-blue-950">Required Verification Documents</h3>
              </div>

              <ul className="space-y-2.5">
                {requiredDocuments.map((doc, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Need offline forms?</span>
                <button
                  onClick={() => onNavigate('downloads')}
                  className="font-bold text-blue-900 hover:text-amber-700 flex items-center gap-1"
                >
                  <span>Download Form PDF</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Admission Enquiry Form */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          <div className="bg-blue-950 p-6 sm:p-8 text-white">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400 text-blue-950 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Official Online Registration</span>
            </div>
            <h2 className="text-2xl font-black font-heading">Admission Enquiry Form (2026–27)</h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Please enter accurate student and contact details. Our admissions team will review your
              submission and contact you for campus interaction.
            </p>
          </div>

          <div className="p-6 sm:p-8">
            {submittedEnquiry ? (
              /* Success State */
              <div className="space-y-6 py-4 animate-in fade-in duration-300">
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-emerald-950 font-heading">
                    Application Submitted Successfully!
                  </h3>
                  <p className="text-xs sm:text-sm text-emerald-800 max-w-lg mx-auto">
                    Thank you for applying to {schoolInfo.name}. Your application has been logged into our school
                    database with the reference number below.
                  </p>
                </div>

                {/* Reference Card */}
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                        Application Reference Number
                      </span>
                      <span className="text-2xl font-black text-blue-950 font-mono tracking-tight">
                        {submittedEnquiry.applicationNo}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCopyRef}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-xs font-bold text-slate-700 shadow-xs"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Ref</span>
                      </button>
                      <button
                        onClick={handlePrint}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-950 hover:bg-blue-900 text-xs font-bold text-white shadow-xs"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Receipt</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 font-medium block">Student Name</span>
                      <span className="font-bold text-slate-800 text-sm">{submittedEnquiry.studentName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium block">Grade Applied</span>
                      <span className="font-bold text-slate-800 text-sm">{submittedEnquiry.gradeApplying}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium block">Parent / Guardian</span>
                      <span className="font-bold text-slate-800 text-sm">{submittedEnquiry.parentName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium block">Contact Phone</span>
                      <span className="font-bold text-slate-800 text-sm">{submittedEnquiry.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-950 space-y-1">
                  <span className="font-bold block">Next Steps:</span>
                  <p>
                    Please bring along copies of student Birth Certificate, Aadhaar card, and passport photos to the
                    school office at Kotauratla between 9:00 AM and 4:30 PM on any working day to finalize enrollment.
                  </p>
                </div>

                <div className="flex justify-center pt-2">
                  <button
                    onClick={resetForm}
                    className="px-6 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-xs font-bold text-slate-700"
                  >
                    Submit Another Application
                  </button>
                </div>
              </div>
            ) : (
              /* Active Form */
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Student Name */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Student Full Name <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="studentName"
                      value={formData.studentName}
                      onChange={handleInputChange}
                      placeholder="e.g. B. Sai Tarun"
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-hidden focus:ring-2 transition-all ${
                        formErrors.studentName
                          ? 'border-rose-400 ring-rose-200 bg-rose-50/40'
                          : 'border-slate-300 focus:ring-blue-900/20 focus:border-blue-950'
                      }`}
                    />
                    {formErrors.studentName && (
                      <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{formErrors.studentName}</span>
                      </p>
                    )}
                  </div>

                  {/* Grade Applying */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Grade Applying For <span className="text-rose-600">*</span>
                    </label>
                    <select
                      name="gradeApplying"
                      value={formData.gradeApplying}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 focus:border-blue-950 bg-white"
                    >
                      <option value="Nursery">Nursery</option>
                      <option value="L.K.G">L.K.G (Lower Kindergarten)</option>
                      <option value="U.K.G">U.K.G (Upper Kindergarten)</option>
                      <option value="Class I">Class I</option>
                      <option value="Class II">Class II</option>
                      <option value="Class III">Class III</option>
                      <option value="Class IV">Class IV</option>
                      <option value="Class V">Class V</option>
                      <option value="Class VI">Class VI</option>
                      <option value="Class VII">Class VII</option>
                      <option value="Class VIII">Class VIII</option>
                      <option value="Class IX">Class IX</option>
                      <option value="Class X">Class X (SSC)</option>
                    </select>
                  </div>

                  {/* Parent Name */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Parent / Guardian Name <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="parentName"
                      value={formData.parentName}
                      onChange={handleInputChange}
                      placeholder="e.g. B. Govinda Rao"
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-hidden focus:ring-2 transition-all ${
                        formErrors.parentName
                          ? 'border-rose-400 ring-rose-200 bg-rose-50/40'
                          : 'border-slate-300 focus:ring-blue-900/20 focus:border-blue-950'
                      }`}
                    />
                    {formErrors.parentName && (
                      <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{formErrors.parentName}</span>
                      </p>
                    )}
                  </div>

                  {/* Contact Phone */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Mobile Number <span className="text-rose-600">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-semibold">+91</span>
                      <input
                        type="tel"
                        name="phone"
                        maxLength={10}
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="9441971531"
                        className={`w-full pl-12 pr-4 py-2.5 rounded-xl border text-sm focus:outline-hidden focus:ring-2 transition-all ${
                          formErrors.phone
                            ? 'border-rose-400 ring-rose-200 bg-rose-50/40'
                            : 'border-slate-300 focus:ring-blue-900/20 focus:border-blue-950'
                        }`}
                      />
                    </div>
                    {formErrors.phone && (
                      <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{formErrors.phone}</span>
                      </p>
                    )}
                  </div>

                  {/* Date of Birth */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Student Date of Birth <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-hidden focus:ring-2 transition-all ${
                        formErrors.dob
                          ? 'border-rose-400 ring-rose-200 bg-rose-50/40'
                          : 'border-slate-300 focus:ring-blue-900/20 focus:border-blue-950'
                      }`}
                    />
                    {formErrors.dob && (
                      <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{formErrors.dob}</span>
                      </p>
                    )}
                  </div>

                  {/* Gender */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 focus:border-blue-950 bg-white"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Email Address <span className="text-slate-400 lowercase font-normal">(optional)</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="parent@example.com"
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-hidden focus:ring-2 transition-all ${
                        formErrors.email
                          ? 'border-rose-400 ring-rose-200 bg-rose-50/40'
                          : 'border-slate-300 focus:ring-blue-900/20 focus:border-blue-950'
                      }`}
                    />
                    {formErrors.email && (
                      <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{formErrors.email}</span>
                      </p>
                    )}
                  </div>

                  {/* Previous School */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Previous School <span className="text-slate-400 lowercase font-normal">(if any)</span>
                    </label>
                    <input
                      type="text"
                      name="previousSchool"
                      value={formData.previousSchool}
                      onChange={handleInputChange}
                      placeholder="School name / First time admission"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 focus:border-blue-950"
                    />
                  </div>
                </div>

                {/* Residential Address */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Village / Town & Residential Address <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="e.g. Main Bazaar, Kotauratla / Village name, Mandal"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-hidden focus:ring-2 transition-all ${
                      formErrors.address
                        ? 'border-rose-400 ring-rose-200 bg-rose-50/40'
                        : 'border-slate-300 focus:ring-blue-900/20 focus:border-blue-950'
                    }`}
                  />
                  {formErrors.address && (
                    <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{formErrors.address}</span>
                    </p>
                  )}
                </div>

                {/* Message / Query */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Additional Remarks / Queries <span className="text-slate-400 lowercase font-normal">(optional)</span>
                  </label>
                  <textarea
                    rows={3}
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Inquire about school van transport, fee schedule, or book collection..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 focus:border-blue-950"
                  />
                </div>

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-6 rounded-xl bg-blue-950 hover:bg-blue-900 text-white font-bold text-sm uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Registering Application...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Admission Enquiry</span>
                        <ArrowRight className="w-4 h-4 text-amber-400" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Immediate Helpline Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500 text-blue-950 flex items-center justify-center font-bold shrink-0 shadow-xs">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-blue-950">Prefer to Speak Directly?</h4>
              <p className="text-xs text-slate-600">
                Call our Kotauratla campus admissions desk directly on working days (8:30 AM to 5:00 PM).
              </p>
            </div>
          </div>
          <a
            href={`tel:${schoolInfo.phone}`}
            className="px-5 py-2.5 rounded-xl bg-blue-950 text-white font-bold text-xs uppercase tracking-wider hover:bg-blue-900 transition-colors shrink-0"
          >
            Call {schoolInfo.phone}
          </a>
        </div>
      </section>
    </div>
  );
}
