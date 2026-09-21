import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import {
  initialSchoolInfo,
  initialNotices,
  initialEvents,
  initialFaculty,
  initialGallery,
  initialDownloads,
  initialAdmissions,
  initialContacts,
} from './src/data/seedData';
import {
  initialStudents,
  initialParents,
  initialAttendanceRecords,
  initialHomework,
  initialTimetable,
  initialExams,
  initialResults,
} from './src/data/portalSeedData';
import {
  SchoolInfo,
  Notice,
  SchoolEvent,
  FacultyMember,
  GalleryItem,
  DownloadItem,
  AdmissionEnquiry,
  ContactEnquiry,
  ActivityLog,
  Student,
  Parent,
  AttendanceRecord,
  Homework,
  TimetableEntry,
  Exam,
  ExamResult,
  UserAccount,
  UserRole,
} from './src/types';

dotenv.config();

const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
export const DB_FILE = path.join(DATA_DIR, 'database.json');

export interface DatabaseSchema {
  schoolInfo: SchoolInfo;
  notices: Notice[];
  events: SchoolEvent[];
  faculty: FacultyMember[];
  gallery: GalleryItem[];
  downloads: DownloadItem[];
  admissions: AdmissionEnquiry[];
  contacts: ContactEnquiry[];
  activityLogs: ActivityLog[];
  adminPasswordHash?: string;
  students: Student[];
  parents: Parent[];
  attendance: AttendanceRecord[];
  homework: Homework[];
  timetable: TimetableEntry[];
  exams: Exam[];
  results: ExamResult[];
  userAccounts: UserAccount[];
}

export interface SessionUser {
  username: string;
  role: UserRole;
  name: string;
  studentId?: string;
  parentId?: string;
  linkedStudentIds?: string[];
  expiresAt: number;
}

export const activeTokens = new Map<string, SessionUser>();

export function hashPassword(pass: string): string {
  return crypto.createHash('sha256').update(pass).digest('hex');
}

export const ENV_ADMIN_USER = process.env.ADMIN_USERNAME || 'admin';
export const ENV_ADMIN_PASS = process.env.ADMIN_PASSWORD || 'vidya2026';

export function loadDatabase(): DatabaseSchema {
  let loaded: any = null;
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      loaded = JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading database.json, initializing baseline data:', err);
  }

  const freshDb: DatabaseSchema = {
    schoolInfo: loaded?.schoolInfo || initialSchoolInfo,
    notices: loaded?.notices || initialNotices,
    events: loaded?.events || initialEvents,
    faculty: loaded?.faculty || initialFaculty,
    gallery: loaded?.gallery || initialGallery,
    downloads: loaded?.downloads || initialDownloads,
    admissions: loaded?.admissions || initialAdmissions,
    contacts: loaded?.contacts || initialContacts,
    activityLogs: loaded?.activityLogs || [
      {
        id: 'log-001',
        action: 'System initialized with verified school data and academic records',
        entityType: 'System',
        timestamp: new Date().toISOString(),
        performedBy: 'System',
      },
    ],
    adminPasswordHash: loaded?.adminPasswordHash,
    students: loaded?.students && loaded.students.length > 0 ? loaded.students : initialStudents,
    parents: loaded?.parents && loaded.parents.length > 0 ? loaded.parents : initialParents,
    attendance: loaded?.attendance && loaded.attendance.length > 0 ? loaded.attendance : initialAttendanceRecords,
    homework: loaded?.homework && loaded.homework.length > 0 ? loaded.homework : initialHomework,
    timetable: loaded?.timetable && loaded.timetable.length > 0 ? loaded.timetable : initialTimetable,
    exams: loaded?.exams && loaded.exams.length > 0 ? loaded.exams : initialExams,
    results: loaded?.results && loaded.results.length > 0 ? loaded.results : initialResults,
    userAccounts: loaded?.userAccounts || [],
  };

  saveDatabase(freshDb);
  return freshDb;
}

export let db: DatabaseSchema = loadDatabase();

export function setDb(newDb: DatabaseSchema): void {
  db = newDb;
  saveDatabase(db);
}

export function saveDatabase(dataToSave?: DatabaseSchema): void {
  try {
    const data = dataToSave || db;
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving database.json:', err);
  }
}

export function logServerActivity(action: string, entityType: string, performedBy = 'Administrator'): void {
  const newLog: ActivityLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    action,
    entityType,
    timestamp: new Date().toISOString(),
    performedBy,
  };
  db.activityLogs = [newLog, ...db.activityLogs].slice(0, 150);
}

export function extractToken(req: any): string | null {
  const authHeader = req.headers?.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7).trim();
}

export function getSession(token: string | null): SessionUser | null {
  if (!token) return null;
  const session = activeTokens.get(token);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    activeTokens.delete(token);
    return null;
  }
  return session;
}

export function isValidSession(token: string | null): boolean {
  return getSession(token) !== null;
}
