import { Parent, Student, AttendanceStats, AttendanceRecord, Homework, TimetableEntry, ExamResult, Notice } from '../types';

const TOKEN_KEY = 'vvems_parent_token';
const PROFILE_KEY = 'vvems_parent_profile';
const CHILDREN_KEY = 'vvems_parent_children';

export interface ChildOverviewData {
  student: Student;
  attendance: {
    totalDays: number;
    present: number;
    absent: number;
    late: number;
    percentage: number;
    recentRecords: AttendanceRecord[];
  };
  homework: {
    id: string;
    subject: string;
    title: string;
    description: string;
    dueDate: string;
    assignedDate: string;
    isSubmitted: boolean;
    submissionDate?: string;
    status: string;
  }[];
  results: ExamResult[];
}

export const parentService = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  getStoredParent(): Parent | null {
    try {
      const data = localStorage.getItem(PROFILE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  getStoredChildren(): Student[] {
    try {
      const data = localStorage.getItem(CHILDREN_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  setSession(token: string, parent: Parent, children: Student[]): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(parent));
    localStorage.setItem(CHILDREN_KEY, JSON.stringify(children));
  },

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(PROFILE_KEY);
    localStorage.removeItem(CHILDREN_KEY);
  },

  isLoggedIn(): boolean {
    return Boolean(this.getToken() && this.getStoredParent());
  },

  isAuthenticated(): boolean {
    return this.isLoggedIn();
  },

  async login(
    identifier: string,
    password: string
  ): Promise<{ success: boolean; parent?: Parent; students?: Student[]; error?: string }> {
    try {
      const res = await fetch('/api/auth/parent-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Login failed. Check your mobile number and password.' };
      }
      this.setSession(data.token, data.parent, data.students || []);
      return { success: true, parent: data.parent, students: data.students };
    } catch (err: any) {
      return { success: false, error: err.message || 'Unable to connect to school server.' };
    }
  },

  async getChildren(): Promise<Student[]> {
    const token = this.getToken();
    if (!token) return this.getStoredChildren();
    try {
      const res = await fetch('/api/parent/children', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return this.getStoredChildren();
      const children = await res.json();
      localStorage.setItem(CHILDREN_KEY, JSON.stringify(children));
      return children;
    } catch {
      return this.getStoredChildren();
    }
  },

  async getChildOverview(studentId: string): Promise<ChildOverviewData | null> {
    const token = this.getToken();
    if (!token) return null;
    try {
      const res = await fetch(`/api/parent/student/${studentId}/overview`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async getChildAttendance(studentId: string): Promise<{ stats: AttendanceStats; records: AttendanceRecord[] }> {
    const token = this.getToken();
    const fallback = {
      stats: { totalWorkingDays: 0, present: 0, absent: 0, late: 0, excused: 0, percentage: 0 },
      records: [],
    };
    if (!token) return fallback;
    try {
      const res = await fetch(`/api/parent/student/${studentId}/attendance`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return fallback;
      return await res.json();
    } catch {
      return fallback;
    }
  },

  async getChildHomework(studentId: string): Promise<Homework[]> {
    const token = this.getToken();
    if (!token) return [];
    try {
      const res = await fetch(`/api/parent/student/${studentId}/homework`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  async getChildTimetable(studentId: string): Promise<{ studentName: string; class: string; section: string; schedule: TimetableEntry[] }> {
    const token = this.getToken();
    const fallback = { studentName: '', class: '', section: '', schedule: [] };
    if (!token) return fallback;
    try {
      const res = await fetch(`/api/parent/student/${studentId}/timetable`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return fallback;
      return await res.json();
    } catch {
      return fallback;
    }
  },

  async getChildResults(studentId: string): Promise<ExamResult[]> {
    const token = this.getToken();
    if (!token) return [];
    try {
      const res = await fetch(`/api/parent/student/${studentId}/results`, {
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
      const res = await fetch('/api/parent/notices', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  async sendMessage(subject: string, message: string, studentId?: string): Promise<{ success: boolean; error?: string }> {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated' };
    try {
      const res = await fetch('/api/parent/message-school', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subject, message, studentId }),
      });
      const data = await res.json();
      return { success: res.ok, error: data.error };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to send message' };
    }
  },

  async sendEnquiry(subject: string, message: string, studentId?: string): Promise<{ success: boolean; error?: string }> {
    return this.sendMessage(subject, message, studentId);
  },

  async changePassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Not authenticated' };
    try {
      const res = await fetch('/api/parent/change-password', {
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
