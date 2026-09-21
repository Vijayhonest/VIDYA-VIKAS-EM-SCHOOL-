import { Router, Request, Response, NextFunction } from 'express';
import {
  db,
  saveDatabase,
  logServerActivity,
  extractToken,
  getSession,
  hashPassword,
} from './serverDb';
import {
  Student,
  Parent,
  AttendanceRecord,
  Homework,
  TimetableEntry,
  Exam,
  ExamResult,
} from './src/types';

export const adminPortalRouter = Router();

// Middleware to enforce admin role
export function requireAdmin(req: any, res: Response, next: NextFunction): void {
  const token = extractToken(req);
  const session = getSession(token);

  if (!session || (session.role !== 'admin' && session.role !== 'staff')) {
    res.status(401).json({ error: 'Unauthorized. Administrative credentials required.' });
    return;
  }

  req.sessionUser = session;
  next();
}

// =================== STUDENTS CRUD ===================
adminPortalRouter.get('/api/admin/students', requireAdmin, (req: Request, res: Response) => {
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
        s.admissionNo.toLowerCase().includes(q) ||
        s.parentName.toLowerCase().includes(q)
    );
  }

  res.json(students);
});

adminPortalRouter.post('/api/admin/students', requireAdmin, (req: Request, res: Response) => {
  const studentData: Partial<Student> = req.body;

  if (!studentData.name || !studentData.class) {
    res.status(400).json({ error: 'Student name and class are required.' });
    return;
  }

  const nextCount = db.students.length + 1;
  const numStr = String(nextCount).padStart(3, '0');
  const studentId = studentData.studentId || `VV-2026-${numStr}`;
  const admissionNo = studentData.admissionNo || `VV-ADM-${1900 + nextCount}`;

  const newStudent: Student = {
    id: `stu_${Date.now()}`,
    studentId,
    admissionNo,
    name: String(studentData.name).trim(),
    class: String(studentData.class).trim(),
    section: studentData.section ? String(studentData.section).trim() : 'A',
    rollNo: studentData.rollNo ? String(studentData.rollNo).trim() : String(nextCount),
    academicYear: studentData.academicYear || db.schoolInfo.academicYear || '2026–2027',
    parentId: studentData.parentId || `par_${Date.now()}`,
    parentName: studentData.parentName ? String(studentData.parentName).trim() : 'Parent / Guardian',
    parentPhone: studentData.parentPhone ? String(studentData.parentPhone).trim() : '9441971531',
    parentEmail: studentData.parentEmail ? String(studentData.parentEmail).trim() : '',
    dob: studentData.dob || '',
    gender: (studentData.gender as any) || 'Male',
    bloodGroup: studentData.bloodGroup || '',
    address: studentData.address ? String(studentData.address).trim() : db.schoolInfo.location,
    status: studentData.status || 'active',
    createdAt: new Date().toISOString(),
  };

  db.students.push(newStudent);
  logServerActivity(`Enrolled student: ${newStudent.name} (${newStudent.studentId})`, 'Student');
  saveDatabase();

  res.status(201).json({ success: true, student: newStudent });
});

adminPortalRouter.put('/api/admin/students/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = db.students.findIndex((s) => s.id === id || s.studentId === id);

  if (idx === -1) {
    res.status(404).json({ error: 'Student record not found.' });
    return;
  }

  db.students[idx] = {
    ...db.students[idx],
    ...req.body,
    id: db.students[idx].id,
    studentId: db.students[idx].studentId, // preserve institutional ID
  };

  logServerActivity(`Updated student record: ${db.students[idx].name}`, 'Student');
  saveDatabase();

  res.json({ success: true, student: db.students[idx] });
});

adminPortalRouter.delete('/api/admin/students/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const target = db.students.find((s) => s.id === id || s.studentId === id);

  if (!target) {
    res.status(404).json({ error: 'Student not found.' });
    return;
  }

  db.students = db.students.filter((s) => s.id !== id && s.studentId !== id);
  logServerActivity(`Deleted student record: ${target.name} (${target.studentId})`, 'Student');
  saveDatabase();

  res.json({ success: true, message: 'Student deleted successfully.' });
});

// =================== PARENTS CRUD ===================
adminPortalRouter.get('/api/admin/parents', requireAdmin, (_req: Request, res: Response) => {
  res.json(db.parents);
});

adminPortalRouter.post('/api/admin/parents', requireAdmin, (req: Request, res: Response) => {
  const parentData: Partial<Parent> = req.body;

  if (!parentData.name || !parentData.phone) {
    res.status(400).json({ error: 'Parent name and phone number are required.' });
    return;
  }

  const parentId = parentData.parentId || `PAR-${String(parentData.phone).trim()}`;
  const newParent: Parent = {
    id: `par_${Date.now()}`,
    parentId,
    name: String(parentData.name).trim(),
    phone: String(parentData.phone).trim(),
    email: parentData.email ? String(parentData.email).trim() : '',
    occupation: parentData.occupation ? String(parentData.occupation).trim() : '',
    address: parentData.address ? String(parentData.address).trim() : db.schoolInfo.location,
    linkedStudentIds: Array.isArray(parentData.linkedStudentIds) ? parentData.linkedStudentIds : [],
    createdAt: new Date().toISOString(),
  };

  db.parents.push(newParent);
  logServerActivity(`Registered parent profile: ${newParent.name} (${newParent.parentId})`, 'Parent');
  saveDatabase();

  res.status(201).json({ success: true, parent: newParent });
});

adminPortalRouter.put('/api/admin/parents/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = db.parents.findIndex((p) => p.id === id || p.parentId === id);

  if (idx === -1) {
    res.status(404).json({ error: 'Parent record not found.' });
    return;
  }

  db.parents[idx] = {
    ...db.parents[idx],
    ...req.body,
    id: db.parents[idx].id,
    parentId: db.parents[idx].parentId,
  };

  logServerActivity(`Updated parent profile: ${db.parents[idx].name}`, 'Parent');
  saveDatabase();

  res.json({ success: true, parent: db.parents[idx] });
});

adminPortalRouter.delete('/api/admin/parents/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const target = db.parents.find((p) => p.id === id || p.parentId === id);

  if (!target) {
    res.status(404).json({ error: 'Parent not found.' });
    return;
  }

  db.parents = db.parents.filter((p) => p.id !== id && p.parentId !== id);
  logServerActivity(`Deleted parent profile: ${target.name}`, 'Parent');
  saveDatabase();

  res.json({ success: true, message: 'Parent profile removed successfully.' });
});

// =================== ATTENDANCE MANAGEMENT ===================
adminPortalRouter.get('/api/admin/attendance', requireAdmin, (req: Request, res: Response) => {
  const { date, class: classFilter, studentId } = req.query;
  let records = [...db.attendance];

  if (date && typeof date === 'string') {
    records = records.filter((r) => r.date === date);
  }

  if (classFilter && typeof classFilter === 'string' && classFilter !== 'all') {
    records = records.filter((r) => r.class.toLowerCase() === classFilter.toLowerCase());
  }

  if (studentId && typeof studentId === 'string') {
    records = records.filter((r) => r.studentId === studentId);
  }

  res.json(records);
});

adminPortalRouter.post('/api/admin/attendance', requireAdmin, (req: Request, res: Response) => {
  const { studentId, date, status, remarks } = req.body;

  if (!studentId || !date || !status) {
    res.status(400).json({ error: 'Student ID, date, and status are required.' });
    return;
  }

  const student = db.students.find((s) => s.studentId === studentId);
  if (!student) {
    res.status(404).json({ error: 'Student record not found.' });
    return;
  }

  // Check if attendance already exists for this date
  const existingIndex = db.attendance.findIndex((a) => a.studentId === studentId && a.date === date);

  if (existingIndex >= 0) {
    db.attendance[existingIndex].status = status;
    if (remarks !== undefined) db.attendance[existingIndex].remarks = remarks;
    saveDatabase();
    res.json({ success: true, attendance: db.attendance[existingIndex] });
    return;
  }

  const newRecord: AttendanceRecord = {
    id: `att_${Date.now()}`,
    studentId,
    studentName: student.name,
    class: student.class,
    section: student.section,
    date,
    status,
    remarks: remarks || '',
  };

  db.attendance.push(newRecord);
  logServerActivity(`Marked attendance for ${student.name} on ${date}: ${status}`, 'Attendance');
  saveDatabase();

  res.status(201).json({ success: true, attendance: newRecord });
});

adminPortalRouter.post('/api/admin/attendance/batch', requireAdmin, (req: Request, res: Response) => {
  const { date, records } = req.body;

  if (!date || !Array.isArray(records)) {
    res.status(400).json({ error: 'Date and records array are required.' });
    return;
  }

  for (const item of records) {
    const student = db.students.find((s) => s.studentId === item.studentId);
    if (!student) continue;

    const existingIdx = db.attendance.findIndex((a) => a.studentId === item.studentId && a.date === date);
    if (existingIdx >= 0) {
      db.attendance[existingIdx].status = item.status || 'present';
      if (item.remarks) db.attendance[existingIdx].remarks = item.remarks;
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

  logServerActivity(`Batch attendance marked for date: ${date} (${records.length} students)`, 'Attendance');
  saveDatabase();

  res.json({ success: true, count: records.length });
});

// =================== HOMEWORK MANAGEMENT ===================
adminPortalRouter.get('/api/admin/homework', requireAdmin, (_req: Request, res: Response) => {
  res.json(db.homework);
});

adminPortalRouter.post('/api/admin/homework', requireAdmin, (req: Request, res: Response) => {
  const hwData: Partial<Homework> = req.body;

  if (!hwData.class || !hwData.subject || !hwData.title || !hwData.dueDate) {
    res.status(400).json({ error: 'Class, subject, title, and due date are required.' });
    return;
  }

  const newHw: Homework = {
    id: `hw_${Date.now()}`,
    class: String(hwData.class).trim(),
    section: hwData.section || 'all',
    subject: String(hwData.subject).trim(),
    title: String(hwData.title).trim(),
    description: String(hwData.description || '').trim(),
    assignedDate: hwData.assignedDate || new Date().toISOString().split('T')[0],
    dueDate: String(hwData.dueDate).trim(),
    attachmentName: hwData.attachmentName,
    createdBy: hwData.createdBy || 'Staff Office',
    status: hwData.status || 'active',
    submissions: [],
  };

  db.homework.unshift(newHw);
  logServerActivity(`Assigned homework for ${newHw.class} (${newHw.subject}): "${newHw.title}"`, 'Homework');
  saveDatabase();

  res.status(201).json({ success: true, homework: newHw });
});

adminPortalRouter.put('/api/admin/homework/:id', requireAdmin, (req: Request, res: Response) => {
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

  logServerActivity(`Updated homework: "${db.homework[idx].title}"`, 'Homework');
  saveDatabase();

  res.json({ success: true, homework: db.homework[idx] });
});

adminPortalRouter.delete('/api/admin/homework/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const target = db.homework.find((h) => h.id === id);

  if (!target) {
    res.status(404).json({ error: 'Homework not found.' });
    return;
  }

  db.homework = db.homework.filter((h) => h.id !== id);
  logServerActivity(`Deleted homework: "${target.title}"`, 'Homework');
  saveDatabase();

  res.json({ success: true, message: 'Homework removed.' });
});

// =================== TIMETABLE MANAGEMENT ===================
adminPortalRouter.get('/api/admin/timetable', requireAdmin, (req: Request, res: Response) => {
  const { class: classFilter, section } = req.query;
  let timetable = [...db.timetable];

  if (classFilter && typeof classFilter === 'string' && classFilter !== 'all') {
    timetable = timetable.filter((t) => t.class.toLowerCase() === classFilter.toLowerCase());
  }

  if (section && typeof section === 'string' && section !== 'all') {
    timetable = timetable.filter((t) => t.section.toLowerCase() === section.toLowerCase());
  }

  res.json(timetable);
});

adminPortalRouter.post('/api/admin/timetable', requireAdmin, (req: Request, res: Response) => {
  const slotData: Partial<TimetableEntry> = req.body;

  if (!slotData.class || !slotData.dayOfWeek || !slotData.subject || !slotData.time) {
    res.status(400).json({ error: 'Class, day, subject, and time are required.' });
    return;
  }

  const newEntry: TimetableEntry = {
    id: `tt_${Date.now()}`,
    class: String(slotData.class).trim(),
    section: slotData.section || 'A',
    dayOfWeek: slotData.dayOfWeek as any,
    period: Number(slotData.period) || 1,
    time: String(slotData.time).trim(),
    subject: String(slotData.subject).trim(),
    teacherName: String(slotData.teacherName || 'Subject Teacher').trim(),
  };

  db.timetable.push(newEntry);
  logServerActivity(`Added timetable entry: ${newEntry.class}-${newEntry.section} ${newEntry.dayOfWeek} P${newEntry.period} (${newEntry.subject})`, 'Timetable');
  saveDatabase();

  res.status(201).json({ success: true, timetable: newEntry });
});

adminPortalRouter.delete('/api/admin/timetable/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  db.timetable = db.timetable.filter((t) => t.id !== id);
  logServerActivity(`Deleted timetable slot ${id}`, 'Timetable');
  saveDatabase();
  res.json({ success: true });
});

// =================== EXAMS MANAGEMENT ===================
adminPortalRouter.get('/api/admin/exams', requireAdmin, (_req: Request, res: Response) => {
  res.json(db.exams);
});

adminPortalRouter.post('/api/admin/exams', requireAdmin, (req: Request, res: Response) => {
  const examData: Partial<Exam> = req.body;

  if (!examData.name || !examData.startDate) {
    res.status(400).json({ error: 'Exam name and start date are required.' });
    return;
  }

  const newExam: Exam = {
    id: `exam_${Date.now()}`,
    name: String(examData.name).trim(),
    academicYear: examData.academicYear || db.schoolInfo.academicYear || '2026–2027',
    classes: Array.isArray(examData.classes) ? examData.classes : ['Class 10', 'Class 9', 'Class 8'],
    startDate: String(examData.startDate).trim(),
    endDate: String(examData.endDate || examData.startDate).trim(),
    status: examData.status || 'upcoming',
  };

  db.exams.push(newExam);
  logServerActivity(`Created exam schedule: "${newExam.name}"`, 'Exam');
  saveDatabase();

  res.status(201).json({ success: true, exam: newExam });
});

adminPortalRouter.put('/api/admin/exams/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = db.exams.findIndex((e) => e.id === id);

  if (idx === -1) {
    res.status(404).json({ error: 'Exam not found.' });
    return;
  }

  db.exams[idx] = { ...db.exams[idx], ...req.body, id: db.exams[idx].id };
  logServerActivity(`Updated exam: "${db.exams[idx].name}"`, 'Exam');
  saveDatabase();

  res.json({ success: true, exam: db.exams[idx] });
});

adminPortalRouter.delete('/api/admin/exams/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  db.exams = db.exams.filter((e) => e.id !== id);
  logServerActivity(`Deleted exam ${id}`, 'Exam');
  saveDatabase();
  res.json({ success: true });
});

// =================== RESULTS MANAGEMENT ===================
adminPortalRouter.get('/api/admin/results', requireAdmin, (req: Request, res: Response) => {
  const { examId, studentId, class: classFilter } = req.query;
  let results = [...db.results];

  if (examId && typeof examId === 'string') {
    results = results.filter((r) => r.examId === examId);
  }

  if (studentId && typeof studentId === 'string') {
    results = results.filter((r) => r.studentId === studentId);
  }

  if (classFilter && typeof classFilter === 'string' && classFilter !== 'all') {
    results = results.filter((r) => r.class.toLowerCase() === classFilter.toLowerCase());
  }

  res.json(results);
});

adminPortalRouter.post('/api/admin/results', requireAdmin, (req: Request, res: Response) => {
  const resData: Partial<ExamResult> = req.body;

  if (!resData.studentId || !resData.examId || !Array.isArray(resData.subjects)) {
    res.status(400).json({ error: 'Student ID, Exam ID, and subjects marks array are required.' });
    return;
  }

  const student = db.students.find((s) => s.studentId === resData.studentId);
  const exam = db.exams.find((e) => e.id === resData.examId);

  const totalMarks = resData.subjects.reduce((sum, s) => sum + (Number(s.marksObtained) || 0), 0);
  const totalMaxMarks = resData.subjects.reduce((sum, s) => sum + (Number(s.maxMarks) || 0), 0);
  const percentage = totalMaxMarks > 0 ? Math.round((totalMarks / totalMaxMarks) * 100 * 10) / 10 : 0;

  let overallGrade = 'A1';
  if (percentage < 35) overallGrade = 'F';
  else if (percentage < 50) overallGrade = 'C';
  else if (percentage < 60) overallGrade = 'B2';
  else if (percentage < 70) overallGrade = 'B1';
  else if (percentage < 80) overallGrade = 'A2';
  else overallGrade = 'A1';

  const newResult: ExamResult = {
    id: `res_${Date.now()}`,
    examId: resData.examId,
    examName: exam?.name || resData.examName || 'Assessment',
    studentId: resData.studentId,
    studentName: student?.name || resData.studentName || 'Student',
    class: student?.class || resData.class || 'Class 10',
    section: student?.section || resData.section || 'A',
    rollNo: student?.rollNo || resData.rollNo || '01',
    subjects: resData.subjects,
    totalMarks,
    totalMaxMarks,
    percentage,
    overallGrade,
    status: percentage >= 35 ? 'pass' : 'fail',
    remarks: resData.remarks || '',
    publishedDate: new Date().toISOString().split('T')[0],
  };

  // Replace if result already exists for student + exam
  const existingIdx = db.results.findIndex(
    (r) => r.studentId === newResult.studentId && r.examId === newResult.examId
  );

  if (existingIdx >= 0) {
    db.results[existingIdx] = { ...newResult, id: db.results[existingIdx].id };
  } else {
    db.results.push(newResult);
  }

  logServerActivity(`Saved exam result for ${newResult.studentName} (${newResult.examName}): ${newResult.percentage}%`, 'Result');
  saveDatabase();

  res.status(201).json({ success: true, result: newResult });
});

adminPortalRouter.delete('/api/admin/results/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  db.results = db.results.filter((r) => r.id !== id);
  logServerActivity(`Deleted exam result ${id}`, 'Result');
  saveDatabase();
  res.json({ success: true });
});
