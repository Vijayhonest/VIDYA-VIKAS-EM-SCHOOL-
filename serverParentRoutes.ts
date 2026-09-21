import { Router, Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import {
  db,
  saveDatabase,
  logServerActivity,
  extractToken,
  getSession,
  activeTokens,
  hashPassword,
} from './serverDb';
import { Parent, Student, ContactEnquiry, UserAccount } from './src/types';

export const parentRouter = Router();

// Middleware to enforce parent role
export function requireParentAuth(req: any, res: Response, next: NextFunction): void {
  const token = extractToken(req);
  const session = getSession(token);

  if (!session || (session.role !== 'parent' && session.role !== 'admin')) {
    res.status(401).json({ error: 'Unauthorized. Parent session required.' });
    return;
  }

  req.parentId = session.parentId;
  req.linkedStudentIds = session.linkedStudentIds || [];
  req.sessionUser = session;
  next();
}

// Parent Login
parentRouter.post('/api/auth/parent-login', (req: Request, res: Response) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    res.status(400).json({ error: 'Mobile number / Parent ID and password are required.' });
    return;
  }

  const cleanId = String(identifier).trim();
  const cleanPass = String(password).trim();

  // Find parent by phone or parentId
  const parent = db.parents.find(
    (p) =>
      p.phone === cleanId ||
      p.parentId.toUpperCase() === cleanId.toUpperCase() ||
      p.phone.replace(/\D/g, '') === cleanId.replace(/\D/g, '')
  );

  if (!parent) {
    res.status(401).json({ error: 'No registered parent profile found with this Mobile / ID.' });
    return;
  }

  // Check custom password if set
  const customAccount = db.userAccounts.find(
    (u) => u.parentId === parent.parentId || u.username === parent.phone || u.username === parent.parentId
  );

  let isMatch = false;
  if (customAccount) {
    isMatch = customAccount.passwordHash === hashPassword(cleanPass);
  } else {
    // Default valid password: parent123 or vidya2026
    isMatch = cleanPass === 'parent123' || cleanPass === 'vidya2026';
  }

  if (!isMatch) {
    res.status(401).json({ error: 'Invalid parent credentials.' });
    return;
  }

  // Find linked students
  const linkedStudents = db.students.filter((s) => parent.linkedStudentIds.includes(s.studentId));

  // Generate secure session token
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  activeTokens.set(token, {
    username: parent.phone,
    role: 'parent',
    name: parent.name,
    parentId: parent.parentId,
    linkedStudentIds: parent.linkedStudentIds,
    expiresAt,
  });

  logServerActivity(`Parent logged in: ${parent.name} (${parent.phone})`, 'ParentAuth', parent.parentId);
  saveDatabase();

  res.json({
    success: true,
    token,
    parent: {
      id: parent.id,
      parentId: parent.parentId,
      name: parent.name,
      phone: parent.phone,
      email: parent.email,
      occupation: parent.occupation,
      address: parent.address,
      linkedStudentIds: parent.linkedStudentIds,
    },
    students: linkedStudents,
  });
});

// Parent Me / Session Check
parentRouter.get('/api/parent/me', requireParentAuth, (req: any, res: Response) => {
  const parent = db.parents.find((p) => p.parentId === req.parentId);
  if (!parent) {
    res.status(404).json({ error: 'Parent profile not found.' });
    return;
  }
  const linkedStudents = db.students.filter((s) => parent.linkedStudentIds.includes(s.studentId));
  res.json({
    success: true,
    parent,
    students: linkedStudents,
  });
});

// Get linked children list
parentRouter.get('/api/parent/children', requireParentAuth, (req: any, res: Response) => {
  const linked = db.students.filter((s) => req.linkedStudentIds.includes(s.studentId));
  res.json(linked);
});

// Helper to prevent unauthorized access to another family's child
function verifyChildAccess(studentId: string, req: any, res: Response): boolean {
  if (req.sessionUser?.role === 'admin') return true;
  if (!req.linkedStudentIds || !req.linkedStudentIds.includes(studentId)) {
    res.status(403).json({ error: 'Access denied. You are not authorized to view this student’s data.' });
    return false;
  }
  return true;
}

// Child overview (profile, attendance summary, recent homework, exam results)
parentRouter.get('/api/parent/student/:studentId/overview', requireParentAuth, (req: any, res: Response) => {
  const { studentId } = req.params;
  if (!verifyChildAccess(studentId, req, res)) return;

  const student = db.students.find((s) => s.studentId === studentId);
  if (!student) {
    res.status(404).json({ error: 'Student record not found.' });
    return;
  }

  // Attendance
  const records = db.attendance.filter((a) => a.studentId === studentId);
  const totalDays = records.length;
  const present = records.filter((r) => r.status === 'present').length;
  const absent = records.filter((r) => r.status === 'absent').length;
  const late = records.filter((r) => r.status === 'late').length;
  const attendancePercentage =
    totalDays > 0 ? Math.round(((present + late * 0.5) / totalDays) * 100 * 10) / 10 : 0;

  // Homework
  const classHomework = db.homework
    .filter((h) => h.class.toLowerCase() === student.class.toLowerCase())
    .map((h) => {
      const mySub = h.submissions?.find((s) => s.studentId === student.studentId);
      return {
        id: h.id,
        subject: h.subject,
        title: h.title,
        description: h.description,
        dueDate: h.dueDate,
        assignedDate: h.assignedDate,
        isSubmitted: Boolean(mySub),
        submissionDate: mySub?.submittedAt,
        status: mySub?.status || 'pending',
      };
    })
    .slice(0, 5);

  // Results
  const results = db.results.filter((r) => r.studentId === studentId);

  res.json({
    student,
    attendance: {
      totalDays,
      present,
      absent,
      late,
      percentage: attendancePercentage,
      recentRecords: records.slice(-7).reverse(),
    },
    homework: classHomework,
    results,
  });
});

// Child Attendance Details
parentRouter.get('/api/parent/student/:studentId/attendance', requireParentAuth, (req: any, res: Response) => {
  const { studentId } = req.params;
  if (!verifyChildAccess(studentId, req, res)) return;

  const records = db.attendance
    .filter((a) => a.studentId === studentId)
    .sort((a, b) => (a.date > b.date ? -1 : 1));

  const totalWorkingDays = records.length;
  const present = records.filter((r) => r.status === 'present').length;
  const absent = records.filter((r) => r.status === 'absent').length;
  const late = records.filter((r) => r.status === 'late').length;
  const excused = records.filter((r) => r.status === 'excused').length;

  const percentage =
    totalWorkingDays > 0 ? Math.round(((present + late * 0.5) / totalWorkingDays) * 100 * 10) / 10 : 0;

  res.json({
    stats: { totalWorkingDays, present, absent, late, excused, percentage },
    records,
  });
});

// Child Homework Details
parentRouter.get('/api/parent/student/:studentId/homework', requireParentAuth, (req: any, res: Response) => {
  const { studentId } = req.params;
  if (!verifyChildAccess(studentId, req, res)) return;

  const student = db.students.find((s) => s.studentId === studentId);
  if (!student) {
    res.status(404).json({ error: 'Student record not found.' });
    return;
  }

  const list = db.homework
    .filter((h) => h.class.toLowerCase() === student.class.toLowerCase())
    .map((h) => {
      const mySub = h.submissions?.find((s) => s.studentId === student.studentId);
      return {
        ...h,
        submissions: undefined,
        submission: mySub || null,
      };
    })
    .sort((a, b) => (a.dueDate > b.dueDate ? 1 : -1));

  res.json(list);
});

// Child Timetable
parentRouter.get('/api/parent/student/:studentId/timetable', requireParentAuth, (req: any, res: Response) => {
  const { studentId } = req.params;
  if (!verifyChildAccess(studentId, req, res)) return;

  const student = db.students.find((s) => s.studentId === studentId);
  if (!student) {
    res.status(404).json({ error: 'Student record not found.' });
    return;
  }

  const schedule = db.timetable
    .filter((t) => t.class.toLowerCase() === student.class.toLowerCase())
    .sort((a, b) => a.period - b.period);

  res.json({
    studentName: student.name,
    class: student.class,
    section: student.section,
    schedule,
  });
});

// Child Exam Results
parentRouter.get('/api/parent/student/:studentId/results', requireParentAuth, (req: any, res: Response) => {
  const { studentId } = req.params;
  if (!verifyChildAccess(studentId, req, res)) return;

  const results = db.results.filter((r) => r.studentId === studentId);
  res.json(results);
});

// Parent Notices & Circulars
parentRouter.get('/api/parent/notices', requireParentAuth, (_req: any, res: Response) => {
  const notices = db.notices.filter((n) => n.isPublished !== false);
  res.json(notices);
});

// Send message to school
parentRouter.post('/api/parent/message-school', requireParentAuth, (req: any, res: Response) => {
  const { subject, message, studentId } = req.body;
  const parent = db.parents.find((p) => p.parentId === req.parentId);

  if (!message || !subject) {
    res.status(400).json({ error: 'Subject and message are required.' });
    return;
  }

  const student = studentId ? db.students.find((s) => s.studentId === studentId) : undefined;
  const fullSubject = student ? `[Parent of ${student.name} - ${student.class}]: ${subject}` : `[Parent]: ${subject}`;

  const contactMessage: ContactEnquiry = {
    id: `con_${Date.now()}`,
    name: parent?.name || 'Parent',
    phone: parent?.phone || '9441971531',
    email: parent?.email || '',
    subject: fullSubject,
    message: String(message).trim(),
    status: 'unread',
    createdAt: new Date().toISOString(),
    submittedAt: new Date().toISOString(),
  };

  db.contacts.unshift(contactMessage);
  logServerActivity(`New message from parent: ${parent?.name || 'Parent'}`, 'Contact', 'Parent Portal');
  saveDatabase();

  res.status(201).json({ success: true, message: 'Your message has been sent to the school administrative desk.' });
});

// Parent change password
parentRouter.post('/api/parent/change-password', requireParentAuth, (req: any, res: Response) => {
  const { newPassword } = req.body;
  if (!newPassword || String(newPassword).length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters.' });
    return;
  }

  const parent = db.parents.find((p) => p.parentId === req.parentId);
  if (!parent) {
    res.status(404).json({ error: 'Parent record not found.' });
    return;
  }

  const existingAccountIndex = db.userAccounts.findIndex(
    (u) => u.parentId === parent.parentId || u.username === parent.phone
  );

  const newHash = hashPassword(String(newPassword).trim());

  if (existingAccountIndex >= 0) {
    db.userAccounts[existingAccountIndex].passwordHash = newHash;
  } else {
    db.userAccounts.push({
      id: `acc_${Date.now()}`,
      username: parent.phone,
      passwordHash: newHash,
      role: 'parent',
      parentId: parent.parentId,
      name: parent.name,
      createdAt: new Date().toISOString(),
    });
  }

  logServerActivity(`Parent ${parent.name} updated password`, 'Security', parent.parentId);
  saveDatabase();

  res.json({ success: true, message: 'Parent password updated successfully.' });
});
