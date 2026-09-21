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
import { Student, HomeworkSubmission, UserAccount } from './src/types';

export const studentRouter = Router();

// Middleware to enforce student role
export function requireStudentAuth(req: any, res: Response, next: NextFunction): void {
  const token = extractToken(req);
  const session = getSession(token);

  if (!session || (session.role !== 'student' && session.role !== 'admin')) {
    res.status(401).json({ error: 'Unauthorized. Student session required.' });
    return;
  }

  req.studentId = session.studentId;
  req.sessionUser = session;
  next();
}

// Student Login
studentRouter.post('/api/auth/student-login', (req: Request, res: Response) => {
  const { studentId, password } = req.body;

  if (!studentId || !password) {
    res.status(400).json({ error: 'Student ID / Admission Number and password are required.' });
    return;
  }

  const cleanId = String(studentId).trim().toUpperCase();
  const cleanPass = String(password).trim();

  // Find student by studentId or admissionNo
  const student = db.students.find(
    (s) =>
      s.studentId.toUpperCase() === cleanId ||
      s.admissionNo.toUpperCase() === cleanId ||
      s.studentId.toUpperCase().replace(/-/g, '') === cleanId.replace(/-/g, '')
  );

  if (!student) {
    res.status(401).json({ error: 'Invalid Student ID / Admission Number.' });
    return;
  }

  // Check custom account password if set
  const customAccount = db.userAccounts.find(
    (u) => u.studentId === student.studentId || u.username.toUpperCase() === student.studentId.toUpperCase()
  );

  let isMatch = false;
  if (customAccount) {
    isMatch = customAccount.passwordHash === hashPassword(cleanPass);
  } else {
    // Default valid password: student123, or admission number (case-insensitive)
    isMatch =
      cleanPass === 'student123' ||
      cleanPass.toLowerCase() === student.admissionNo.toLowerCase() ||
      cleanPass === 'vidya2026';
  }

  if (!isMatch) {
    res.status(401).json({ error: 'Invalid password for this student account.' });
    return;
  }

  // Generate secure session token
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  activeTokens.set(token, {
    username: student.studentId,
    role: 'student',
    name: student.name,
    studentId: student.studentId,
    expiresAt,
  });

  logServerActivity(`Student logged in: ${student.name} (${student.studentId})`, 'StudentAuth', student.studentId);
  saveDatabase();

  res.json({
    success: true,
    token,
    student: {
      id: student.id,
      studentId: student.studentId,
      admissionNo: student.admissionNo,
      name: student.name,
      class: student.class,
      section: student.section,
      rollNo: student.rollNo,
      academicYear: student.academicYear,
      parentName: student.parentName,
      parentPhone: student.parentPhone,
      parentEmail: student.parentEmail,
      dob: student.dob,
      gender: student.gender,
      bloodGroup: student.bloodGroup,
      address: student.address,
      photoUrl: student.photoUrl,
    },
  });
});

// Student Session Verification
studentRouter.get('/api/student/me', requireStudentAuth, (req: any, res: Response) => {
  const student = db.students.find((s) => s.studentId === req.studentId);
  if (!student) {
    res.status(404).json({ error: 'Student profile not found.' });
    return;
  }
  res.json({ success: true, student });
});

// Student Profile (view only, non-editable sensitive info)
studentRouter.get('/api/student/profile', requireStudentAuth, (req: any, res: Response) => {
  const student = db.students.find((s) => s.studentId === req.studentId);
  if (!student) {
    res.status(404).json({ error: 'Student record not found.' });
    return;
  }
  res.json(student);
});

// Student Attendance (own attendance only)
studentRouter.get('/api/student/attendance', requireStudentAuth, (req: any, res: Response) => {
  const studentId = req.studentId;
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
    stats: {
      totalWorkingDays,
      present,
      absent,
      late,
      excused,
      percentage,
    },
    records,
  });
});

// Student Homework (filtered by student's class and section)
studentRouter.get('/api/student/homework', requireStudentAuth, (req: any, res: Response) => {
  const student = db.students.find((s) => s.studentId === req.studentId);
  if (!student) {
    res.status(404).json({ error: 'Student profile not found.' });
    return;
  }

  const list = db.homework
    .filter(
      (h) =>
        h.class.toLowerCase() === student.class.toLowerCase() &&
        (!h.section || h.section === 'all' || h.section === student.section)
    )
    .map((h) => {
      // Find own submission
      const mySub = h.submissions?.find((s) => s.studentId === student.studentId);
      return {
        ...h,
        // Do not expose other students' submissions!
        submissions: undefined,
        mySubmission: mySub || null,
      };
    })
    .sort((a, b) => (a.dueDate > b.dueDate ? 1 : -1));

  res.json(list);
});

// Student submits homework assignment
studentRouter.post('/api/student/homework/:id/submit', requireStudentAuth, (req: any, res: Response) => {
  const student = db.students.find((s) => s.studentId === req.studentId);
  if (!student) {
    res.status(404).json({ error: 'Student profile not found.' });
    return;
  }

  const { id } = req.params;
  const { notes, attachmentName } = req.body;

  const hw = db.homework.find((h) => h.id === id);
  if (!hw) {
    res.status(404).json({ error: 'Homework assignment not found.' });
    return;
  }

  hw.submissions = hw.submissions || [];
  const existingIndex = hw.submissions.findIndex((s) => s.studentId === student.studentId);

  const submission: HomeworkSubmission = {
    id: `sub_${Date.now()}`,
    homeworkId: hw.id,
    studentId: student.studentId,
    studentName: student.name,
    class: student.class,
    submittedAt: new Date().toISOString(),
    notes: notes ? String(notes).trim() : '',
    attachmentName: attachmentName ? String(attachmentName).trim() : undefined,
    status: 'submitted',
  };

  if (existingIndex >= 0) {
    hw.submissions[existingIndex] = {
      ...hw.submissions[existingIndex],
      ...submission,
      id: hw.submissions[existingIndex].id,
    };
  } else {
    hw.submissions.push(submission);
  }

  logServerActivity(`Student ${student.name} submitted homework: "${hw.title}"`, 'Homework', student.studentId);
  saveDatabase();

  res.json({ success: true, submission });
});

// Student Timetable (filtered by student's class and section)
studentRouter.get('/api/student/timetable', requireStudentAuth, (req: any, res: Response) => {
  const student = db.students.find((s) => s.studentId === req.studentId);
  if (!student) {
    res.status(404).json({ error: 'Student profile not found.' });
    return;
  }

  const schedule = db.timetable
    .filter(
      (t) =>
        t.class.toLowerCase() === student.class.toLowerCase() &&
        (!t.section || t.section === student.section)
    )
    .sort((a, b) => a.period - b.period);

  res.json({
    class: student.class,
    section: student.section,
    schedule,
  });
});

// Student Exams (filtered by student's class)
studentRouter.get('/api/student/exams', requireStudentAuth, (req: any, res: Response) => {
  const student = db.students.find((s) => s.studentId === req.studentId);
  if (!student) {
    res.status(404).json({ error: 'Student profile not found.' });
    return;
  }

  const exams = db.exams.filter((e) => e.classes.includes(student.class));
  res.json(exams);
});

// Student Results (own results only)
studentRouter.get('/api/student/results', requireStudentAuth, (req: any, res: Response) => {
  const results = db.results.filter((r) => r.studentId === req.studentId);
  res.json(results);
});

// Student Notices (school-wide, student, or specific class)
studentRouter.get('/api/student/notices', requireStudentAuth, (req: any, res: Response) => {
  const student = db.students.find((s) => s.studentId === req.studentId);
  const notices = db.notices.filter((n) => {
    if (n.isPublished === false) return false;
    // Public notices or notices for all students
    return true;
  });
  res.json(notices);
});

// Student Change Password
studentRouter.post('/api/student/change-password', requireStudentAuth, (req: any, res: Response) => {
  const { newPassword } = req.body;
  if (!newPassword || String(newPassword).length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters.' });
    return;
  }

  const student = db.students.find((s) => s.studentId === req.studentId);
  if (!student) {
    res.status(404).json({ error: 'Student record not found.' });
    return;
  }

  const existingAccountIndex = db.userAccounts.findIndex(
    (u) => u.studentId === student.studentId || u.username === student.studentId
  );

  const newHash = hashPassword(String(newPassword).trim());

  if (existingAccountIndex >= 0) {
    db.userAccounts[existingAccountIndex].passwordHash = newHash;
  } else {
    db.userAccounts.push({
      id: `acc_${Date.now()}`,
      username: student.studentId,
      passwordHash: newHash,
      role: 'student',
      studentId: student.studentId,
      name: student.name,
      createdAt: new Date().toISOString(),
    });
  }

  logServerActivity(`Student ${student.name} updated password`, 'Security', student.studentId);
  saveDatabase();

  res.json({ success: true, message: 'Student password updated successfully.' });
});
