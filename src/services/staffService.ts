import {
  Homework,
  AttendanceRecord,
  Exam,
  ExamResult,
  ContactEnquiry,
  Notice,
  TimetableEntry,
  Student,
} from '../types';

export interface StaffProfile {
  id: string;
  name: string;
  designation: string;
  subject: string;
  department: string;
  classesAssigned: string[];
  phone?: string;
  email?: string;
  qualification?: string;
  experience?: string;
}

export interface StaffStats {
  assignedClassesCount: number;
  assignedClasses: string[];
  totalStudents: number;
  todayClasses: number;
  pendingTasks: number;
}

export interface ClassInfo {
  id: string;
  name: string;
  section: string;
  studentCount: number;
  subject: string;
  room: string;
}

export interface StudyMaterial {
  id: string;
  title: string;
  class: string;
  subject: string;
  category: string;
  fileName: string;
  fileSize: string;
  uploadedBy: string;
  uploadDate: string;
  downloadUrl: string;
  description: string;
}

const TOKEN_KEY = 'vvems_staff_token';
const PROFILE_KEY = 'vvems_staff_profile';

class StaffService {
  private token: string | null = null;
  private staff: StaffProfile | null = null;

  constructor() {
    this.token = localStorage.getItem(TOKEN_KEY);
    const stored = localStorage.getItem(PROFILE_KEY);
    if (stored) {
      try {
        this.staff = JSON.parse(stored);
      } catch {
        this.staff = null;
      }
    }
  }

  public setToken(token: string) {
    this.token = token;
    localStorage.setItem(TOKEN_KEY, token);
  }

  public clearToken() {
    this.token = null;
    this.staff = null;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(PROFILE_KEY);
  }

  public getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem(TOKEN_KEY);
    }
    return this.token;
  }

  public isAuthenticated(): boolean {
    return !!this.getToken();
  }

  public getStoredStaff(): StaffProfile | null {
    if (this.staff) return this.staff;
    const stored = localStorage.getItem(PROFILE_KEY);
    if (stored) {
      try {
        this.staff = JSON.parse(stored);
        return this.staff;
      } catch {
        return null;
      }
    }
    return null;
  }

  public logout(): void {
    this.clearToken();
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    const t = this.getToken();
    if (t) {
      headers['Authorization'] = `Bearer ${t}`;
    }
    return headers;
  }

  public async login(username: string, password: string): Promise<{ success: boolean; staff?: StaffProfile; error?: string }> {
    try {
      const res = await fetch('/api/auth/staff-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        this.setToken(data.token);
        if (data.staff) {
          this.staff = data.staff;
          localStorage.setItem(PROFILE_KEY, JSON.stringify(data.staff));
        }
        return { success: true, staff: data.staff };
      }
      return { success: false, error: data.error || 'Authentication failed' };
    } catch {
      return { success: false, error: 'Network error communicating with server' };
    }
  }

  public async getProfile(): Promise<StaffProfile | null> {
    try {
      const res = await fetch('/api/staff/profile', { headers: this.getHeaders() });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  public async getStats(): Promise<StaffStats> {
    try {
      const res = await fetch('/api/staff/stats', { headers: this.getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch stats');
      return await res.json();
    } catch {
      return {
        assignedClassesCount: 3,
        assignedClasses: ['Class 10', 'Class 9', 'Class 8'],
        totalStudents: 38,
        todayClasses: 4,
        pendingTasks: 2,
      };
    }
  }

  public async getClasses(): Promise<ClassInfo[]> {
    try {
      const res = await fetch('/api/staff/classes', { headers: this.getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch classes');
      return await res.json();
    } catch {
      return [
        { id: 'cls-10', name: 'Class 10', section: 'A', studentCount: 32, subject: 'Physical Science', room: 'Room 204' },
        { id: 'cls-9', name: 'Class 9', section: 'A', studentCount: 28, subject: 'Physical Science', room: 'Room 202' },
        { id: 'cls-8', name: 'Class 8', section: 'A', studentCount: 30, subject: 'Science', room: 'Room 105' },
      ];
    }
  }

  public async getTimetable(day?: string): Promise<TimetableEntry[]> {
    try {
      const url = day ? `/api/staff/timetable?day=${encodeURIComponent(day)}` : '/api/staff/timetable';
      const res = await fetch(url, { headers: this.getHeaders() });
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  }

  public async getAttendance(className?: string, date?: string): Promise<AttendanceRecord[]> {
    try {
      const params = new URLSearchParams();
      if (className) params.set('class', className);
      if (date) params.set('date', date);
      const res = await fetch(`/api/staff/attendance?${params.toString()}`, { headers: this.getHeaders() });
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  }

  public async saveAttendance(date: string, records: { studentId: string; status: 'present' | 'absent' | 'late'; remarks?: string }[]): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const res = await fetch('/api/staff/attendance', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ date, records }),
      });
      const data = await res.json();
      if (res.ok) {
        return { success: true, message: data.message };
      }
      return { success: false, error: data.error || 'Failed to save attendance' };
    } catch {
      return { success: false, error: 'Network error saving attendance' };
    }
  }

  public async getHomework(className?: string): Promise<Homework[]> {
    try {
      const url = className ? `/api/staff/homework?class=${encodeURIComponent(className)}` : '/api/staff/homework';
      const res = await fetch(url, { headers: this.getHeaders() });
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  }

  public async createHomework(hwData: Partial<Homework>): Promise<{ success: boolean; homework?: Homework; error?: string }> {
    try {
      const res = await fetch('/api/staff/homework', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(hwData),
      });
      const data = await res.json();
      if (res.ok) return { success: true, homework: data.homework };
      return { success: false, error: data.error || 'Failed to assign homework' };
    } catch {
      return { success: false, error: 'Network error assigning homework' };
    }
  }

  public async updateHomework(id: string, hwData: Partial<Homework>): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch(`/api/staff/homework/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(hwData),
      });
      const data = await res.json();
      if (res.ok) return { success: true };
      return { success: false, error: data.error || 'Failed to update homework' };
    } catch {
      return { success: false, error: 'Network error updating homework' };
    }
  }

  public async deleteHomework(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/staff/homework/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  public async getExams(): Promise<Exam[]> {
    try {
      const res = await fetch('/api/staff/exams', { headers: this.getHeaders() });
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  }

  public async getResults(examId?: string, className?: string): Promise<ExamResult[]> {
    try {
      const params = new URLSearchParams();
      if (examId) params.set('examId', examId);
      if (className) params.set('class', className);
      const res = await fetch(`/api/staff/results?${params.toString()}`, { headers: this.getHeaders() });
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  }

  public async saveMarks(data: {
    examId: string;
    examName?: string;
    marksList: Array<{
      studentId: string;
      internalMarks?: number;
      examMarks?: number;
      subject?: string;
      marksObtained?: number;
      maxMarks?: number;
      grade?: string;
      remarks?: string;
    }>;
  }): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const res = await fetch('/api/staff/marks', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (res.ok) return { success: true, message: resData.message };
      return { success: false, error: resData.error || 'Failed to save marks' };
    } catch {
      return { success: false, error: 'Network error saving marks' };
    }
  }

  public async getStudents(classFilter?: string, search?: string): Promise<Student[]> {
    try {
      const params = new URLSearchParams();
      if (classFilter) params.set('class', classFilter);
      if (search) params.set('search', search);
      const res = await fetch(`/api/staff/students?${params.toString()}`, { headers: this.getHeaders() });
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  }

  public async getStudyMaterials(classFilter?: string, category?: string): Promise<StudyMaterial[]> {
    try {
      const params = new URLSearchParams();
      if (classFilter) params.set('class', classFilter);
      if (category) params.set('category', category);
      const res = await fetch(`/api/staff/study-materials?${params.toString()}`, { headers: this.getHeaders() });
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  }

  public async uploadStudyMaterial(materialData: {
    title: string;
    class: string;
    subject: string;
    category: string;
    fileName?: string;
    description?: string;
  }): Promise<{ success: boolean; material?: StudyMaterial; error?: string }> {
    try {
      const res = await fetch('/api/staff/study-materials', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(materialData),
      });
      const data = await res.json();
      if (res.ok) return { success: true, material: data.material };
      return { success: false, error: data.error || 'Failed to upload study material' };
    } catch {
      return { success: false, error: 'Network error uploading material' };
    }
  }

  public async deleteStudyMaterial(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/staff/study-materials/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  public async getNotices(): Promise<Notice[]> {
    try {
      const res = await fetch('/api/staff/notices', { headers: this.getHeaders() });
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  }

  public async createNotice(noticeData: Partial<Notice>): Promise<{ success: boolean; notice?: Notice; error?: string }> {
    try {
      const res = await fetch('/api/staff/notices', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(noticeData),
      });
      const data = await res.json();
      if (res.ok) return { success: true, notice: data.notice };
      return { success: false, error: data.error || 'Failed to publish notice' };
    } catch {
      return { success: false, error: 'Network error publishing notice' };
    }
  }

  public async getMessages(): Promise<ContactEnquiry[]> {
    try {
      const res = await fetch('/api/staff/messages', { headers: this.getHeaders() });
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  }

  public async replyMessage(messageId: string, replyText: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch('/api/staff/messages/reply', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ messageId, replyText }),
      });
      const data = await res.json();
      if (res.ok) return { success: true };
      return { success: false, error: data.error || 'Failed to send reply' };
    } catch {
      return { success: false, error: 'Network error sending reply' };
    }
  }
}

export const staffService = new StaffService();
