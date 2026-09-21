import { useState } from 'react';
import {
  Phone,
  MapPin,
  Mail,
  Clock,
  Send,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  Navigation,
  MessageSquare,
} from 'lucide-react';
import { SchoolInfo, ContactEnquiry } from '../types';
import { submitContactEnquiry } from '../services/storageService';
import { validateIndianPhone, validateEmail, sanitizeText } from '../utils/helpers';
import { useToast } from '../components/common/Toast';

interface ContactPageProps {
  schoolInfo: SchoolInfo;
}

export function ContactPage({ schoolInfo }: ContactPageProps) {
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedContact, setSubmittedContact] = useState<ContactEnquiry | null>(null);

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'What classes are taught at Vidya Vikas EM School?',
      a: 'We offer instruction from Pre-Primary (Nursery, LKG, UKG) through Class X (SSC), taught strictly in English medium with Telugu and Hindi language curriculum.',
    },
    {
      q: 'Where is the school located and how can we reach?',
      a: 'Our school is situated on the Main Road in Kotauratla mandal headquarters, Anakapalle District, Andhra Pradesh. We are easily accessible by local RTC buses and auto-rickshaws from Narsipatnam, Rolugunta, and Payakaraopeta.',
    },
    {
      q: 'Does the school provide transport or van facilities?',
      a: 'Yes, designated school vans operate across major village routes in Kotauratla mandal and adjoining areas for safe student pickup and drop. Inquire at the office for route stops and timings.',
    },
    {
      q: 'What are the school office working hours for admission enquiries?',
      a: 'The administrative counter is open Monday through Saturday from 8:30 AM to 5:00 PM. Parents are welcome to visit without prior appointment to inspect classrooms and meet the Principal.',
    },
    {
      q: 'How can parents track student progress and attendance?',
      a: 'We maintain regular student diaries, conduct mandatory term-wise Parent-Teacher Meetings (PTMs), and communicate exam report cards directly to parents.',
    },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errors.name = 'Please enter your name.';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Mobile number is required.';
    } else if (!validateIndianPhone(formData.phone)) {
      errors.phone = 'Please enter a valid 10-digit mobile number.';
    }

    if (formData.email.trim() && !validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!formData.subject.trim()) {
      errors.subject = 'Please enter a subject.';
    }

    if (!formData.message.trim() || formData.message.trim().length < 10) {
      errors.message = 'Please write a message with at least 10 characters.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast('Please fix the errors before submitting.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const contact = await submitContactEnquiry({
        name: sanitizeText(formData.name),
        phone: sanitizeText(formData.phone),
        email: sanitizeText(formData.email),
        subject: sanitizeText(formData.subject),
        message: sanitizeText(formData.message),
      });

      setIsSubmitting(false);
      setSubmittedContact(contact);
      showToast('Thank you! Your message has been sent to our campus office.', 'success');
      setFormData({ name: '', phone: '', email: '', subject: '', message: '' });
    } catch {
      setIsSubmitting(false);
      showToast('Failed to submit message. Please try again.', 'error');
    }
  };

  return (
    <div className="space-y-16 py-8 pb-16">
      {/* Header */}
      <section className="bg-slate-900 text-white py-12 px-4 sm:px-6 -mt-8">
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold">
            <Phone className="w-4 h-4 text-amber-400" />
            <span>Connect with School Office</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-heading tracking-tight text-white">
            Contact & Campus Location
          </h1>
          <p className="text-slate-300 max-w-2xl text-sm sm:text-base leading-relaxed">
            Have questions regarding admissions, curriculum, bus routes, or student records?
            We are here to assist you.
          </p>
        </div>
      </section>

      {/* Main Grid: Contact Cards + Form */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left: Contact Info & Office Details */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
              <h2 className="text-xl font-bold text-blue-950 font-heading">
                School Contact Information
              </h2>

              <div className="space-y-4 text-sm">
                {/* Address */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                      Campus Address
                    </span>
                    <p className="text-slate-800 font-semibold leading-relaxed mt-0.5">
                      {schoolInfo.address}
                    </p>
                    <span className="text-xs text-slate-500 block mt-1">
                      Kotauratla Mandal, Anakapalle District, Andhra Pradesh
                    </span>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                      Direct School Phone
                    </span>
                    <a
                      href={`tel:${schoolInfo.phone}`}
                      className="text-blue-950 font-black text-lg hover:text-amber-700 transition-colors block mt-0.5"
                    >
                      +91 {schoolInfo.phone}
                    </a>
                    <span className="text-xs text-slate-500">Available during working hours</span>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                      Email Address
                    </span>
                    <a
                      href={`mailto:${schoolInfo.email}`}
                      className="text-slate-800 font-semibold hover:text-blue-900 transition-colors block mt-0.5 text-xs sm:text-sm truncate"
                    >
                      {schoolInfo.email}
                    </a>
                  </div>
                </div>

                {/* Office Hours */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                      Office Working Hours
                    </span>
                    <p className="text-slate-800 font-semibold mt-0.5">
                      {schoolInfo.officeHours}
                    </p>
                  </div>
                </div>
              </div>

              {/* Direct Route / Navigation Assistance */}
              <div className="pt-4 border-t border-slate-100">
                <a
                  href="https://maps.google.com/?q=Kotauratla+Anakapalle+District+Andhra+Pradesh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-blue-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
                >
                  <Navigation className="w-4 h-4 text-blue-900" />
                  <span>Open Directions on Google Maps</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right: Working Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-900 bg-blue-50 px-2.5 py-1 rounded-md">
                  Send a Message
                </span>
                <h2 className="text-2xl font-black text-blue-950 font-heading mt-2">
                  Contact School Administration
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Fill in the form below. Messages are reviewed daily by our administrative coordinator.
                </p>
              </div>

              {submittedContact ? (
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-emerald-950">
                    Message Received Successfully!
                  </h3>
                  <p className="text-xs text-emerald-800 max-w-md mx-auto">
                    Thank you, {submittedContact.name}. Our staff will reach out to you via{' '}
                    <strong>{submittedContact.phone}</strong> regarding "{submittedContact.subject}".
                  </p>
                  <button
                    onClick={() => setSubmittedContact(null)}
                    className="mt-2 px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Name */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Your Full Name <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="e.g. S. Apparao"
                        className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-hidden focus:ring-2 transition-all ${
                          formErrors.name
                            ? 'border-rose-400 ring-rose-200 bg-rose-50/40'
                            : 'border-slate-300 focus:ring-blue-900/20 focus:border-blue-950'
                        }`}
                      />
                      {formErrors.name && (
                        <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>{formErrors.name}</span>
                        </p>
                      )}
                    </div>

                    {/* Phone */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Mobile Number <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="tel"
                        maxLength={10}
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="10-digit phone number"
                        className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-hidden focus:ring-2 transition-all ${
                          formErrors.phone
                            ? 'border-rose-400 ring-rose-200 bg-rose-50/40'
                            : 'border-slate-300 focus:ring-blue-900/20 focus:border-blue-950'
                        }`}
                      />
                      {formErrors.phone && (
                        <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>{formErrors.phone}</span>
                        </p>
                      )}
                    </div>
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

                  {/* Subject */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Subject / Enquiry Type <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="e.g. Bus route inquiry / Transfer Certificate / Fee schedule"
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-hidden focus:ring-2 transition-all ${
                        formErrors.subject
                          ? 'border-rose-400 ring-rose-200 bg-rose-50/40'
                          : 'border-slate-300 focus:ring-blue-900/20 focus:border-blue-950'
                      }`}
                    />
                    {formErrors.subject && (
                      <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{formErrors.subject}</span>
                      </p>
                    )}
                  </div>

                  {/* Message */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Your Message <span className="text-rose-600">*</span>
                    </label>
                    <textarea
                      rows={4}
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Please write your detailed query or requirement here..."
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-hidden focus:ring-2 transition-all ${
                        formErrors.message
                          ? 'border-rose-400 ring-rose-200 bg-rose-50/40'
                          : 'border-slate-300 focus:ring-blue-900/20 focus:border-blue-950'
                      }`}
                    />
                    {formErrors.message && (
                      <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{formErrors.message}</span>
                      </p>
                    )}
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 px-6 rounded-xl bg-blue-950 hover:bg-blue-900 text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Sending Message...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Message</span>
                          <Send className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Google Maps Area */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-xs">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-900">Map Location</span>
              <h2 className="text-xl font-bold text-blue-950">
                Kotauratla Campus, Anakapalle District
              </h2>
            </div>
            <a
              href="https://maps.google.com/?q=Kotauratla+Anakapalle+District+Andhra+Pradesh"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-blue-950 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-blue-900 transition-colors self-start sm:self-center"
            >
              <Navigation className="w-3.5 h-3.5 text-amber-400" />
              <span>Open in Google Maps</span>
            </a>
          </div>

          <div className="relative w-full h-80 sm:h-96 bg-slate-100">
            {/* Embedded OpenStreetMap / Google Map frame for Kotauratla */}
            <iframe
              title="Kotauratla School Location Map"
              width="100%"
              height="100%"
              className="border-0"
              src="https://www.openstreetmap.org/export/embed.html?bbox=82.6600%2C17.5500%2C82.7200%2C17.6000&amp;layer=mapnik&amp;marker=17.5756%2C82.6845"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions (FAQ) Accordion */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-900">Common Queries</span>
          <h2 className="text-2xl font-black text-blue-950 font-heading">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Helpful answers to common parent questions regarding school operations, admissions, and transport.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs transition-all"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-blue-950 hover:bg-slate-50 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-blue-950' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
