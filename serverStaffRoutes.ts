import { Router, Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import {
  db,
  saveDatabase,
  logServerActivity,
  extractToken,
  getSession,
  activeTokens,
  findStaffByAuth,
  verifyStaffPassword,
  StaffUser,
} from './serverDb';
import {
  Homework,
  AttendanceRecord,
  ExamResult,
  ContactEnquiry,
  Notice,
} from './src/types';

export const staffRouter = Router();

// Middleware to enforce staff or admin role
export function requireStaffAuth(req: any, res: Response, next: NextFunction): void {
  const token = extractToken(req);
  const session = getSession(token);

  if (!session || (session.role !== 'staff' && session.role !== 'admin')) {
    res.status(401).json({ error: 'Unauthorized. Staff credentials required.' });
    return;
  }

  req.sessionUser = session;
  next();
}

// =================== AUTH ===================
staffRouter.post('/api/auth/staff-login', (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: 'Staff ID / Username and password are required.' });
    return;
  }

  const cleanUser = String(username).trim();
  const cleanPass = String(password).trim();

  const staff = findStaffByAuth(cleanUser);
  if (!staff) {
    res.status(401).json({ error: 'No registered faculty or staff found with this ID.' });
    return;
  }

  const isMatch = verifyStaffPassword(cleanUser, cleanPass);
  if (!isMatch) {
    res.status(401).json({ error: 'Invalid staff password. Please contact the administrative desk.' });
    return;
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  activeTokens.set(token, {
    username: cleanUser,
    role: 'staff',
    name: staff.name,
    expiresAt,
  });

  logServerActivity(`Faculty logged in: ${staff.name} (${staff.designation})`, 'Auth', 'Staff Portal');
  saveDatabase();

  res.json({
    success: true,
    token,
    staff,
  });
});

// =================== PROFILE & STATS ===================
staffRouter.get('/api/staff/profile', requireStaffAuth, (req: any, res: Response) => {
  const staff = findStaffByAuth(req.sessionUser?.username || 'staff');
  res.json(staff || {
    id: 'fac-003',
    name: 'K. Lakshmi Narayana',
    designation: 'Senior Physical Science Teacher',
    subject: 'Physical Science',
    department: 'Science Wing',
    classesAssigned: ['Class 10', 'Class 9', 'Class 8'],
    phone: '9441971531',
    email: 'lakshminarayana@vvems.edu.in',
  });
});

staffRouter.get('/api/staff/stats', requireStaffAuth, (_req: any, res: Response) => {
  const assignedClasses = ['Class 10', 'Class 9', 'Class 8'];
  const totalStudents = db.students.length > 0 ? db.students.length : 38;
  const todayClasses = 4;
  const pendingTasks = db.homework.filter((h) => h.submissions?.some((s) => s.status === 'submitted')).length + 1;

  res.json({
    assignedClassesCount: assignedClasses.length,
    assignedClasses,
    totalStudents,
    todayClasses,
    pendingTasks,
  });
});

// =================== CLASSES ===================
staffRouter.get('/api/staff/classes', requireStaffAuth, (_req: any, res: Response) => {
  const classes = [
    {
      id: 'cls-10',
      name: 'Class 10',
      section: 'A',
      studentCount: db.students.filter((s) => s.class === 'Class 10').length || 32,
      subject: 'Physical Science & Mathematics',
      room: 'Room 204 (Senior Wing)',
    },
    {
      id: 'cls-9',
      name: 'Class 9',
      section: 'A',
      studentCount: db.students.filter((s) => s.class === 'Class 9').length || 28,
      subject: 'Physical Science',
      room: 'Room 202',
    },
    {
      id: 'cls-8',
      name: 'Class 8',
      section: 'A',
      studentCount: db.students.filter((s) => s.class === 'Class 8').length || 30,
      subject: 'General Science',
      room: 'Room 105',
    },
  ];

  res.json(classes);
});

// =================== TIMETABLE ===================
staffRouter.get('/api/staff/timetable', requireStaffAuth, (req: any, res: Response) => {
  const { day } = req.query;
  let schedule = db.timetable;

  if (day && typeof day === 'string' && day.toLowerCase() !== 'all') {
    schedule = schedule.filter((t) => t.dayOfWeek.toLowerCase() === day.toLowerCase());
  }

  res.json(schedule);
});

// =================== ATTENDANCE MANAGEMENT ===================
staffRouter.get('/api/staff/attendance', requireStaffAuth, (req: any, res: Response) => {
  const { class: className, date } = req.query;
  let records = db.attendance;

  if (className && typeof className === 'string') {
    records = records.filter((r) => r.class.toLowerCase() === className.toLowerCase());
  }

  if (date && typeof date === 'string') {
    records = records.filter((r) => r.date === date);
  }

  res.json(records);
});

staffRouter.post('/api/staff/attendance', requireStaffAuth, (req: any, res: Response) => {
  const { date, records } = req.body;

  if (!date || !Array.isArray(records)) {
    res.status(400).json({ error: 'Date and records array are required.' });
    return;
  }

  for (const item of records) {
    const student = db.students.find((s) => s.studentId === item.studentId);
    if (!student) continue;

    const existingIdx = db.attendance.findIndex(
      (a) => a.studentId === item.studentId && a.date === date
    );

    if (existingIdx >= 0) {
      db.attendance[existingIdx].status = item.status || 'present';
      if (item.remarks !== undefined) db.attendance[existingIdx].remarks = item.remarks;
    } else {
      db.attendance.push({
        id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        studentId: student.studentId,
        studentName: student.name,
        class: student.class,
        section: student.section,
        date,
        status: item.status || 'present',
        remarks: item.remarks || '',
      });
    }
  }

  logServerActivity(`Attendance marked by faculty for ${date} (${records.length} students)`, 'Attendance', 'Staff Portal');
  saveDatabase();

  res.json({ success: true, count: records.length, message: 'Attendance recorded successfully.' });
});

// =================== HOMEWORK MANAGEMENT ===================
staffRouter.get('/api/staff/homework', requireStaffAuth, (req: any, res: Response) => {
  const { class: className } = req.query;
  let list = db.homework;

  if (className && typeof className === 'string') {
    list = list.filter((h) => h.class.toLowerCase() === className.toLowerCase());
  }

  res.json(list);
});

staffRouter.post('/api/staff/homework', requireStaffAuth, (req: any, res: Response) => {
  const hwData: Partial<Homework> = req.body;

  if (!hwData.class || !hwData.subject || !hwData.title || !hwData.dueDate) {
    res.status(400).json({ error: 'Class, subject, title, and due date are required.' });
    return;
  }

  const staffName = req.sessionUser?.name || 'Faculty Office';

  const newHw: Homework = {
    id: `hw_${Date.now()}`,
    class: String(hwData.class).trim(),
    section: hwData.section || 'A',
    subject: String(hwData.subject).trim(),
    title: String(hwData.title).trim(),
    description: String(hwData.description || '').trim(),
    assignedDate: hwData.assignedDate || new Date().toISOString().split('T')[0],
    dueDate: String(hwData.dueDate).trim(),
    attachmentName: hwData.attachmentName || undefined,
    createdBy: staffName,
    status: 'active',
    submissions: [],
  };

  db.homework.unshift(newHw);
  logServerActivity(`Faculty assigned homework: ${newHw.title} (${newHw.class} - ${newHw.subject})`, 'Homework', staffName);
  saveDatabase();

  res.status(201).json({ success: true, homework: newHw });
});

staffRouter.put('/api/staff/homework/:id', requireStaffAuth, (req: any, res: Response) => {
  const { id } = req.params;
  const idx = db.homework.findIndex((h) => h.id === id);

  if (idx === -1) {
    res.status(404).json({ error: 'Homework not found.' });
    return;
  }

  db.homework[idx] = {
    ...db.homework[idx],
    ...req.body,
    id: db.homework[idx].id,
  };

  logServerActivity(`Faculty updated homework: ${db.homework[idx].title}`, 'Homework', 'Staff Portal');
  saveDatabase();

  res.json({ success: true, homework: db.homework[idx] });
});

staffRouter.delete('/api/staff/homework/:id', requireStaffAuth, (req: any, res: Response) => {
  const { id } = req.params;
  const idx = db.homework.findIndex((h) => h.id === id);

  if (idx === -1) {
    res.status(404).json({ error: 'Homework not found.' });
    return;
  }

  const deleted = db.homework.splice(idx, 1)[0];
  logServerActivity(`Faculty removed homework: ${deleted.title}`, 'Homework', 'Staff Portal');
  saveDatabase();

  res.json({ success: true, message: 'Homework removed successfully.' });
});

// =================== MARKS ENTRY ===================
staffRouter.get('/api/staff/exams', requireStaffAuth, (_req: any, res: Response) => {
  res.json(db.exams);
});

staffRouter.get('/api/staff/results', requireStaffAuth, (req: any, res: Response) => {
  const { examId, class: className } = req.query;
  let results = db.results;

  if (examId && typeof examId === 'string') {
    results = results.filter((r) => r.examId === examId);
  }

  if (className && typeof className === 'string') {
    results = results.filter((r) => r.class.toLowerCase() === className.toLowerCase());
  }

  res.json(results);
});

staffRouter.post('/api/staff/marks', requireStaffAuth, (req: any, res: Response) => {
  const { examId, examName, marksList } = req.body;

  if (!examId || !Array.isArray(marksList)) {
    res.status(400).json({ error: 'Exam ID and marksList array are required.' });
    return;
  }

  for (const item of marksList) {
    const student = db.students.find((s) => s.studentId === item.studentId);
    if (!student) continue;

    const existingResultIdx = db.results.findIndex(
      (r) => r.examId === examId && r.studentId === item.studentId
    );

    const subjects = item.subjects || [
      { subject: item.subject || 'Physical Science', marksObtained: Number(item.marksObtained) || 0, maxMarks: Number(item.maxMarks) || 50, grade: item.grade || 'A1' },
    ];

    const totalMarks = subjects.reduce((sum: number, s: any) => sum + (Number(s.marksObtained) || 0), 0);
    const totalMax = subjects.reduce((sum: number, s: any) => sum + (Number(s.maxMarks) || 50), 0);
    const percentage = totalMax > 0 ? Number(((totalMarks / totalMax) * 100).toFixed(1)) : 0;
    const overallGrade = percentage >= 90 ? 'A1' : percentage >= 80 ? 'A2' : percentage >= 70 ? 'B1' : percentage >= 60 ? 'B2' : 'C';

    if (existingResultIdx >= 0) {
      db.results[existingResultIdx].subjects = subjects;
      db.results[existingResultIdx].totalMarks = totalMarks;
      db.results[existingResultIdx].totalMaxMarks = totalMax;
      db.results[existingResultIdx].percentage = percentage;
      db.results[existingResultIdx].overallGrade = overallGrade;
      if (item.remarks) db.results[existingResultIdx].remarks = item.remarks;
    } else {
      const newResult: ExamResult = {
        id: `res_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        examId,
        examName: examName || 'Assessment',
        studentId: student.studentId,
        studentName: student.name,
        class: student.class,
        section: student.section,
        rollNo: student.rollNo,
        admissionNo: student.admissionNo,
        academicYear: student.academicYear || '2026–2027',
        subjects,
        totalMarks,
        totalMaxMarks: totalMax,
        percentage,
        overallGrade,
        status: percentage >= 35 ? 'pass' : 'fail',
        remarks: item.remarks || 'Performance recorded by faculty.',
        publishedDate: new Date().toISOString().split('T')[0],
      };
      db.results.push(newResult);
    }
  }

  logServerActivity(`Faculty saved marks for exam: ${examId} (${marksList.length} students)`, 'Exams', 'Staff Portal');
  saveDatabase();

  res.json({ success: true, count: marksList.length, message: 'Marks updated and saved successfully.' });
});

// =================== STUDENTS LIST ===================
staffRouter.get('/api/staff/students', requireStaffAuth, (req: any, res: Response) => {
  const { class: classFilter, search } = req.query;
  let students = [...db.students];

  if (classFilter && typeof classFilter === 'string' && classFilter !== 'all') {
    students = students.filter((s) => s.class.toLowerCase() === classFilter.toLowerCase());
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    students = students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.studentId.toLowerCase().includes(q) ||
        s.rollNo.includes(q)
    );
  }

  res.json(students);
});

// =================== STUDY MATERIALS ===================
let inMemoryMaterials = [
  {
    id: 'mat-001',
    title: 'Class 10 Physical Science - Refraction at Curved Surfaces Notes',
    class: 'Class 10',
    subject: 'Physical Science',
    category: 'Notes',
    fileName: 'Class10_Physics_Refraction_Complete_Notes.pdf',
    fileSize: '1.8 MB',
    uploadedBy: 'K. Lakshmi Narayana',
    uploadDate: '2026-09-15',
    downloadUrl: '#',
    description: 'Detailed ray diagrams, mirror formulas, sign conventions, and solved numerical problems.',
  },
  {
    id: 'mat-002',
    title: 'Class 10 Mathematics - Quadratic Equations Assignment Worksheet',
    class: 'Class 10',
    subject: 'Mathematics',
    category: 'Assignments',
    fileName: 'Quadratic_Equations_Practice_Sheet.pdf',
    fileSize: '950 KB',
    uploadedBy: 'P. Srinivasa Rao',
    uploadDate: '2026-09-18',
    downloadUrl: '#',
    description: 'Standard quadratic factoring, quadratic formula application, and word problems.',
  },
  {
    id: 'mat-003',
    title: 'Class 10 Previous Year Summative Assessment Model Question Paper',
    class: 'Class 10',
    subject: 'All Subjects',
    category: 'Question Papers',
    fileName: 'SA1_Model_Question_Paper_Blueprint.pdf',
    fileSize: '2.4 MB',
    uploadedBy: 'Principal Office',
    uploadDate: '2026-09-10',
    downloadUrl: '#',
    description: 'State board pattern question paper blueprint with internal choice distribution.',
  },
  {
    id: 'mat-004',
    title: 'Cell Structure and Plant Tissues Interactive Microscopic Diagrams',
    class: 'Class 9',
    subject: 'Biological Science',
    category: 'Video Lessons',
    fileName: 'Cell_Division_Mitosis_Concept_Video.mp4',
    fileSize: '14.2 MB',
    uploadedBy: 'M. Anuradha',
    uploadDate: '2026-09-12',
    downloadUrl: '#',
    description: 'Animated step-by-step microscopic illustration of mitosis stages and plant parenchyma tissues.',
  },
  {
    id: 'mat-005',
    title: 'English Formal Writing & Grammar Rules Quick Reference Booklet',
    class: 'Class 10',
    subject: 'English',
    category: 'PDFs',
    fileName: 'English_Grammar_Direct_Indirect_Speech.pdf',
    fileSize: '1.2 MB',
    uploadedBy: 'V. Ramanamma',
    uploadDate: '2026-09-14',
    downloadUrl: '#',
    description: 'Rules for active-passive transformations, reporting verbs, and formal letter formats.',
  },
];

staffRouter.get('/api/staff/study-materials', requireStaffAuth, (req: any, res: Response) => {
  const { class: classFilter, category } = req.query;
  let materials = inMemoryMaterials;

  if (classFilter && typeof classFilter === 'string' && classFilter !== 'all') {
    materials = materials.filter((m) => m.class.toLowerCase() === classFilter.toLowerCase());
  }

  if (category && typeof category === 'string' && category !== 'all') {
    materials = materials.filter((m) => m.category.toLowerCase() === category.toLowerCase());
  }

  res.json(materials);
});

// Also expose public/student endpoint for study materials
staffRouter.get('/api/student/study-materials', (_req: Request, res: Response) => {
  res.json(inMemoryMaterials);
});

staffRouter.post('/api/staff/study-materials', requireStaffAuth, (req: any, res: Response) => {
  const { title, class: className, subject, category, fileName, description } = req.body;

  if (!title || !className || !subject) {
    res.status(400).json({ error: 'Title, Class, and Subject are required.' });
    return;
  }

  const newMaterial = {
    id: `mat_${Date.now()}`,
    title: String(title).trim(),
    class: String(className).trim(),
    subject: String(subject).trim(),
    category: category || 'Notes',
    fileName: fileName || `${title.replace(/\s+/g, '_')}.pdf`,
    fileSize: '1.5 MB',
    uploadedBy: req.sessionUser?.name || 'Faculty Member',
    uploadDate: new Date().toISOString().split('T')[0],
    downloadUrl: '#',
    description: description || 'Study material uploaded for classroom reference.',
  };

  inMemoryMaterials.unshift(newMaterial);
  logServerActivity(`Faculty uploaded study material: ${newMaterial.title}`, 'Downloads', 'Staff Portal');

  res.status(201).json({ success: true, material: newMaterial });
});

staffRouter.delete('/api/staff/study-materials/:id', requireStaffAuth, (req: any, res: Response) => {
  const { id } = req.params;
  inMemoryMaterials = inMemoryMaterials.filter((m) => m.id !== id);
  res.json({ success: true, message: 'Material removed.' });
});

// =================== NOTICES ===================
staffRouter.get('/api/staff/notices', requireStaffAuth, (_req: any, res: Response) => {
  res.json(db.notices);
});

staffRouter.post('/api/staff/notices', requireStaffAuth, (req: any, res: Response) => {
  const noticeData: Partial<Notice> = req.body;

  if (!noticeData.title || !noticeData.content) {
    res.status(400).json({ error: 'Title and content are required.' });
    return;
  }

  const staffName = req.sessionUser?.name || 'Staff Member';

  const newNotice: Notice = {
    id: `not_${Date.now()}`,
    title: String(noticeData.title).trim(),
    category: (noticeData.category as any) || 'academic',
    date: noticeData.date || new Date().toISOString().split('T')[0],
    summary: noticeData.summary || noticeData.content.substring(0, 100),
    content: String(noticeData.content).trim(),
    attachmentName: noticeData.attachmentName,
    postedBy: staffName,
    isPinned: false,
    isPublished: true,
    createdAt: new Date().toISOString(),
  };

  db.notices.unshift(newNotice);
  logServerActivity(`Staff published notice: ${newNotice.title}`, 'Notice', staffName);
  saveDatabase();

  res.status(201).json({ success: true, notice: newNotice });
});

// =================== MESSAGES / INQUIRIES ===================
staffRouter.get('/api/staff/messages', requireStaffAuth, (_req: any, res: Response) => {
  res.json(db.contacts);
});

staffRouter.post('/api/staff/messages/reply', requireStaffAuth, (req: any, res: Response) => {
  const { messageId, replyText } = req.body;

  if (!messageId || !replyText) {
    res.status(400).json({ error: 'Message ID and reply text are required.' });
    return;
  }

  const idx = db.contacts.findIndex((c) => c.id === messageId);
  if (idx >= 0) {
    db.contacts[idx].status = 'replied';
    db.contacts[idx].reply = replyText;
    db.contacts[idx].repliedAt = new Date().toISOString();
    logServerActivity(`Staff replied to inquiry ${messageId}`, 'Contact', 'Staff Portal');
    saveDatabase();
  }

  res.json({ success: true, message: 'Reply sent successfully.' });
});
