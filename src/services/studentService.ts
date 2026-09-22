import { Student, AttendanceStats, AttendanceRecord, Homework, TimetableEntry, Exam, ExamResult, Notice } from '../types';

const TOKEN_KEY = 'vvems_student_token';
const PROFILE_KEY = 'vvems_student_profile';

export const studentService = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  getStoredStudent(): Student | null {
    try {
      const data = localStorage.getItem(PROFILE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  setSession(token: string, student: Student): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(student));
  },

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(PROFILE_KEY);
  },

  isLoggedIn(): boolean {
    return Boolean(this.getToken() && this.getStoredStudent());
  },

  isAuthenticated(): boolean {
    return this.isLoggedIn();
  },

  async login(studentId: string, password: string): Promise<{ success: boolean; student?: Student; error?: string }> {
    try {
      const res = await fetch('/api/auth/student-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Login failed. Check your Student ID and password.' };
      }
      this.setSession(data.token, data.student);
      return { success: true, student: data.student };
    } catch (err: any) {
      return { success: false, error: err.message || 'Unable to connect to school server.' };
    }
  },

  async getProfile(): Promise<Student | null> {
    const token = this.getToken();
    if (!token) return null;
    try {
      const res = await fetch('/api/student/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return null;
      const data = await res.json();
      localStorage.setItem(PROFILE_KEY, JSON.stringify(data));
      return data;
    } catch {
      return this.getStoredStudent();
    }
  },

  async getAttendance(): Promise<{ stats: AttendanceStats; records: AttendanceRecord[] }> {
    const token = this.getToken();
    const fallback = {
      stats: { totalWorkingDays: 0, present: 0, absent: 0, late: 0, excused: 0, percentage: 0 },
      records: [],
    };
    if (!token) return fallback;
    try {
      const res = await fetch('/api/student/attendance', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return fallback;
      return await res.json();
    } catch {
      return fallback;
    }
  },

  async getHomework(): Promise<Homework[]> {
    const token = this.getToken();
    if (!token) return [];
    try {
      const res = await fetch('/api/student/homework', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  async submitHomework(homeworkId: string, notes: string, attachmentName?: string): Promise<boolean> {
    const token = this.getToken();
    if (!token) return false;
    try {
      const res = await fetch(`/api/student/homework/${homeworkId}/submit`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes, attachmentName }),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async getTimetable(): Promise<{ class: string; section: string; schedule: TimetableEntry[] }> {
    const token = this.getToken();
    const fallback = { class: '', section: '', schedule: [] };
    if (!token) return fallback;
    try {
      const res = await fetch('/api/student/timetable', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return fallback;
      return await res.json();
    } catch {
      return fallback;
    }
  },

  async getExams(): Promise<Exam[]> {
    const token = this.getToken();
    if (!token) return [];
    try {
      const res = await fetch('/api/student/exams', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  async getResults(): Promise<ExamResult[]> {
    const token = this.getToken();
    if (!token) return [];
    try {
      const res = await fetch('/api/student/results', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  async getNotices(): Promise<Notice[]> {
    const token = this.getToken();
    if (!token) return [];
    try {
      const res = await fetch('/api/student/notices', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  async changePassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated' };
    try {
      const res = await fetch('/api/student/change-password', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newPassword }),
      });
      const data = await res.json();
      return { success: res.ok, error: data.error };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update password' };
    }
  },
};
