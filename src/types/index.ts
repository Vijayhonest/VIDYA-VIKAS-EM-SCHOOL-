export type NoticeCategory = 'general' | 'exam' | 'holiday' | 'admission' | 'event' | 'academic' | 'sports';

export interface Notice {
  id: string;
  title: string;
  category: NoticeCategory;
  date: string;
  isPinned: boolean;
  isPublished?: boolean;
  targetAudience?: 'all' | 'students' | 'parents' | 'staff';
  summary: string;
  content: string;
  attachmentName?: string;
  attachmentSize?: string;
  postedBy: string;
  createdAt: string;
  isDemo?: boolean;
}

export type EventCategory = 'academic' | 'sports' | 'cultural' | 'national' | 'exhibition';

export interface SchoolEvent {
  id: string;
  title: string;
  category: EventCategory;
  date: string;
  time: string;
  venue: string;
  description: string;
  isUpcoming: boolean;
  isPublished?: boolean;
  highlights: string[];
  isDemo?: boolean;
}

export type GalleryCategory = 'all' | 'campus' | 'classroom' | 'sports' | 'cultural' | 'science';

export interface GalleryItem {
  id: string;
  title: string;
  category: Exclude<GalleryCategory, 'all'>;
  imageUrl: string;
  caption: string;
  date: string;
  isPublished?: boolean;
  isDemo?: boolean;
}

export interface FacultyMember {
  id: string;
  name: string;
  designation: string;
  subject: string;
  department: string;
  qualification: string;
  experience: string;
  shortProfile: string;
  photoUrl?: string;
  displayOrder?: number;
  assignedClasses?: string;
  phone?: string;
  email?: string;
  isActive?: boolean;
  isLeadership?: boolean;
  isDemo?: boolean;
}

export type AdmissionStatus = 'new' | 'pending' | 'contacted' | 'closed' | 'reviewed' | 'admitted' | 'rejected';

export interface AdmissionEnquiry {
  id: string;
  applicationNo: string;
  studentName: string;
  parentName: string;
  email: string;
  phone: string;
  gradeApplying: string;
  previousSchool?: string;
  dob?: string;
  gender?: string;
  address?: string;
  message?: string;
  status: AdmissionStatus;
  createdAt: string;
  submittedAt?: string;
  notes?: string;
  isDemo?: boolean;
}

export type ContactStatus = 'unread' | 'read' | 'replied' | 'resolved';

export interface ContactEnquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: ContactStatus;
  createdAt: string;
  submittedAt?: string;
  replyNotes?: string;
  reply?: string;
  repliedAt?: string;
  isDemo?: boolean;
}

export type DownloadCategory = 'all' | 'admission' | 'academic' | 'calendar' | 'guideline' | 'prospectus' | 'circular' | 'other';

export interface DownloadItem {
  id: string;
  title: string;
  category: Exclude<DownloadCategory, 'all'>;
  fileName: string;
  fileSize: string;
  fileType: string;
  description: string;
  lastUpdated: string;
  downloadCount: number;
  isPublished?: boolean;
  isDemo?: boolean;
}

export interface ActivityItem {
  id: string;
  title: string;
  category: string;
  description: string;
  schedule: string;
  benefits: string[];
  imagePlaceholderColor?: string;
}

export interface SchoolInfo {
  name: string;
  tagline: string;
  affiliationNotice: string;
  location: string;
  mandal: string;
  district: string;
  state: string;
  pinCode: string;
  phone: string;
  alternatePhone?: string;
  email: string;
  address: string;
  officeHours: string;
  principalName: string;
  establishedYear: string;
  academicYear?: string;
  welcomeMessage: string;
  principalMessage: string;
  vision: string;
  mission: string;
  values: string[];
}

export interface ActivityLog {
  id: string;
  action: string;
  entityType: string;
  timestamp: string;
  performedBy: string;
}

// =================== ROLE-BASED ACCESS & USER ACCOUNTS ===================
export type UserRole = 'admin' | 'staff' | 'teacher' | 'student' | 'parent';

export interface UserAccount {
  id: string;
  username: string; // Student ID (e.g. VV-2026-001) or Parent Mobile (e.g. 9441971531) or admin
  passwordHash: string;
  role: UserRole;
  studentId?: string;
  parentId?: string;
  teacherId?: string;
  name: string;
  createdAt: string;
}

// =================== STUDENTS ===================
export interface Student {
  id: string;
  admissionNo: string;
  studentId: string; // unique institutional ID, e.g., VV-2026-001
  name: string;
  class: string; // e.g. "Class 10", "Class 9", "Class 5"
  section: string; // "A", "B"
  rollNo: string;
  academicYear: string;
  parentId: string; // links to Parent
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup?: string;
  address: string;
  photoUrl?: string;
  status: 'active' | 'inactive' | 'transferred';
  password?: string;
  createdAt: string;
  isDemo?: boolean;
}

// =================== PARENTS ===================
export interface Parent {
  id: string;
  parentId: string; // identifier or mobile number
  name: string;
  phone: string;
  email?: string;
  occupation?: string;
  address: string;
  linkedStudentIds: string[]; // references Student.studentId
  createdAt: string;
  isDemo?: boolean;
}

// =================== TEACHERS / STAFF ===================
export interface Teacher {
  id: string;
  teacherId: string;
  name: string;
  designation: string;
  department: string;
  subject: string;
  qualification: string;
  experience: string;
  phone: string;
  email: string;
  classesAssigned: string[];
  isActive: boolean;
}

// =================== ATTENDANCE ===================
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface AttendanceStats {
  totalWorkingDays: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  percentage: number;
  presentDays?: number;
  absentDays?: number;
  attendancePercentage?: number;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName?: string;
  class: string;
  section: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  remarks?: string;
}

// =================== HOMEWORK & ASSIGNMENTS ===================
export interface HomeworkSubmission {
  id: string;
  homeworkId: string;
  studentId: string;
  studentName: string;
  class: string;
  submittedAt: string;
  notes?: string;
  attachmentName?: string;
  status: 'submitted' | 'reviewed' | 'graded';
  grade?: string;
  feedback?: string;
}

export interface Homework {
  id: string;
  class: string;
  section?: string; // 'all' or specific
  subject: string;
  title: string;
  description: string;
  assignedDate: string;
  dueDate: string;
  attachmentName?: string;
  attachmentUrl?: string;
  createdBy: string;
  status: 'active' | 'closed' | 'archived';
  submissions?: HomeworkSubmission[];
  submission?: HomeworkSubmission;
  mySubmission?: HomeworkSubmission;
}

// =================== TIMETABLE ===================
export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

export interface TimetableEntry {
  id: string;
  class: string;
  section: string;
  dayOfWeek: DayOfWeek;
  period: number;
  time: string; // e.g., "09:00 AM – 09:45 AM"
  subject: string;
  teacherName: string;
  room?: string;
}

// =================== EXAMS & RESULTS ===================
export type ExamStatus = 'upcoming' | 'ongoing' | 'completed' | 'published';

export interface ExamSubjectSchedule {
  name: string;
  date: string;
  time?: string;
  maxMarks?: number;
  [key: string]: any;
}

export interface Exam {
  id: string;
  name: string; // e.g., "Formative Assessment 1", "Quarterly Exams", "Summative Assessment 1"
  academicYear: string;
  classes: string[];
  startDate: string;
  endDate: string;
  status: ExamStatus;
  type?: string;
  description?: string;
  subjects?: ExamSubjectSchedule[];
}

export interface SubjectMark {
  subject: string;
  marksObtained: number;
  maxMarks: number;
  grade: string;
}

export interface ExamResult {
  id: string;
  examId: string;
  examName: string;
  studentId: string;
  studentName: string;
  class: string;
  section: string;
  rollNo: string;
  admissionNo?: string;
  academicYear?: string;
  subjects: SubjectMark[];
  totalMarks: number;
  totalMaxMarks: number;
  percentage: number;
  overallGrade: string;
  status: 'pass' | 'fail' | 'withheld';
  remarks?: string;
  publishedDate: string;
}

// =================== FEES ===================
export interface FeePayment {
  id: string;
  receiptNo: string;
  date: string;
  amount: number;
  paymentMode: 'Cash' | 'UPI' | 'Bank Transfer' | 'Cheque';
  referenceNo?: string;
  collectedBy: string;
  remarks?: string;
}

export interface FeeRecord {
  id: string;
  studentId: string;
  studentName: string;
  admissionNo: string;
  class: string;
  section: string;
  academicYear: string;
  totalFee: number;
  discount: number;
  netFee: number;
  paidAmount: number;
  dueAmount: number;
  status: 'paid' | 'partial' | 'pending' | 'overdue';
  dueDate: string;
  payments: FeePayment[];
  lastPaymentDate?: string;
}

// =================== STAFF ATTENDANCE ===================
export interface StaffAttendanceRecord {
  id: string;
  facultyId: string;
  facultyName: string;
  designation: string;
  date: string; // YYYY-MM-DD
  status: 'present' | 'absent' | 'half-day' | 'leave';
  remarks?: string;
}

