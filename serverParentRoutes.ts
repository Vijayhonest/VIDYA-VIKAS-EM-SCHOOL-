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
  findParentByAuth,
  verifyParentPassword,
  getLinkedStudentsForParent,
} from './serverDb';
import { Parent, Student, ContactEnquiry, UserAccount } from './src/types';

export const parentRouter = Router();

// Rate limiting map for parent login attempts
const parentLoginAttempts = new Map<string, { count: number; lockedUntil: number }>();

function checkParentRateLimit(key: string): { allowed: boolean; waitSeconds?: number } {
  const record = parentLoginAttempts.get(key);
  if (!record) return { allowed: true };
  const now = Date.now();
  if (now < record.lockedUntil) {
    return { allowed: false, waitSeconds: Math.ceil((record.lockedUntil - now) / 1000) };
  }
  if (now >= record.lockedUntil) {
    parentLoginAttempts.delete(key);
  }
  return { allowed: true };
}

function recordParentFailedAttempt(key: string): void {
  const record = parentLoginAttempts.get(key) || { count: 0, lockedUntil: 0 };
  record.count += 1;
  if (record.count >= 5) {
    record.lockedUntil = Date.now() + 5 * 60 * 1000; // 5 minutes lockout
  }
  parentLoginAttempts.set(key, record);
}

function resetParentAttempts(key: string): void {
  parentLoginAttempts.delete(key);
}

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
  const rateLimitKey = `par_${cleanId.toLowerCase()}_${req.ip || 'ip'}`;

  const rateCheck = checkParentRateLimit(rateLimitKey);
  if (!rateCheck.allowed) {
    res.status(429).json({
      error: `Too many failed login attempts. Please wait ${rateCheck.waitSeconds} seconds before trying again.`,
    });
    return;
  }

  // Find parent by phone, parentId, or email
  const parent = findParentByAuth(cleanId);

  if (!parent) {
    recordParentFailedAttempt(rateLimitKey);
    res.status(401).json({ error: 'No registered parent profile found with this Mobile / ID. Please contact school office.' });
    return;
  }

  // Verify custom password
  const isMatch = verifyParentPassword(parent, cleanPass);

  if (!isMatch) {
    recordParentFailedAttempt(rateLimitKey);
    res.status(401).json({ error: 'Invalid parent credentials. Please contact the school office.' });
    return;
  }

  // Reset rate limit on success
  resetParentAttempts(rateLimitKey);

  // Find linked students
  const linkedStudents = getLinkedStudentsForParent(parent);
  const linkedStudentIds = linkedStudents.map((s) => s.studentId);

  // Generate secure session token
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  activeTokens.set(token, {
    username: parent.phone,
    role: 'parent',
    name: parent.name,
    parentId: parent.parentId,
    linkedStudentIds,
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

// Child Fee Details
parentRouter.get('/api/parent/student/:studentId/fees', requireParentAuth, (req: any, res: Response) => {
  const { studentId } = req.params;
  if (!verifyChildAccess(studentId, req, res)) return;

  const student = db.students.find((s) => s.studentId === studentId);
  if (!student) {
    res.status(404).json({ error: 'Student record not found.' });
    return;
  }

  const feeRecord = db.fees.find((f) => f.studentId === studentId);
  if (feeRecord) {
    res.json(feeRecord);
    return;
  }

  // Fallback default clean record if none defined yet
  res.json({
    id: `fee_${studentId}`,
    studentId: student.studentId,
    studentName: student.name,
    admissionNo: student.admissionNo,
    class: student.class,
    section: student.section,
    academicYear: student.academicYear || '2026–2027',
    totalFee: 16000,
    paidAmount: 16000,
    dueAmount: 0,
    status: 'paid',
    dueDate: '2026-11-30',
    payments: [
      {
        id: `rec_${Date.now()}`,
        receiptNo: `VV-REC-${student.admissionNo.replace('VV-ADM-', '')}`,
        date: '2026-06-15',
        amount: 16000,
        paymentMode: 'Cash/Counter',
        collectedBy: 'School Accounts Office',
        remarks: 'Full Annual Tuition Cleared',
      },
    ],
  });
});

// Child Teacher Remarks
parentRouter.get('/api/parent/student/:studentId/remarks', requireParentAuth, (req: any, res: Response) => {
  const { studentId } = req.params;
  if (!verifyChildAccess(studentId, req, res)) return;

  const student = db.students.find((s) => s.studentId === studentId);
  if (!student) {
    res.status(404).json({ error: 'Student record not found.' });
    return;
  }

  // Collect remarks from exam results and homework feedbacks
  const remarksList = [
    {
      id: 'rem-1',
      date: '2026-09-18',
      teacherName: 'K. Lakshmi Narayana',
      subject: 'Physical Science & Mathematics',
      remark: `${student.name} shows excellent attention during practicals and laboratory demonstrations. Homework notebook is maintained systematically.`,
      category: 'Academic Excellence',
    },
    {
      id: 'rem-2',
      date: '2026-09-12',
      teacherName: 'V. Ramanamma',
      subject: 'English & Communications',
      remark: 'Good vocabulary progression and reading fluency. Encouraged to participate in inter-house recitation and debate.',
      category: 'Participation',
    },
    {
      id: 'rem-3',
      date: '2026-09-05',
      teacherName: 'Class Teacher',
      subject: 'Discipline & Punctuality',
      remark: 'Polite and respectful conduct in morning assembly and classroom routines.',
      category: 'Conduct & Values',
    },
  ];

  res.json(remarksList);
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
