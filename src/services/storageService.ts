import {
  SchoolInfo,
  Notice,
  SchoolEvent,
  GalleryItem,
  FacultyMember,
  AdmissionEnquiry,
  ContactEnquiry,
  DownloadItem,
  ActivityLog,
  AdmissionStatus,
  ContactStatus,
} from '../types';
import {
  initialSchoolInfo,
  initialNotices,
  initialEvents,
  initialGallery,
  initialFaculty,
  initialDownloads,
  initialAdmissions,
  initialContacts,
} from '../data/seedData';
import { authService } from './authService';

const KEYS = {
  SCHOOL_INFO: 'vv_school_info_v2',
  NOTICES: 'vv_notices_v2',
  EVENTS: 'vv_events_v2',
  GALLERY: 'vv_gallery_v2',
  FACULTY: 'vv_faculty_v2',
  ADMISSIONS: 'vv_admissions_v2',
  CONTACTS: 'vv_contacts_v2',
  DOWNLOADS: 'vv_downloads_v2',
  ACTIVITY_LOGS: 'vv_activity_logs_v2',
};

function safeGet<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(item) as T;
  } catch (err) {
    console.warn(`Error reading ${key} from localStorage:`, err);
    return fallback;
  }
}

function safeSet<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Error saving ${key} to localStorage:`, err);
  }
}

function getAuthHeaders(): HeadersInit {
  const token = authService.getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// Sync all data from backend server
export async function syncFromServer(): Promise<void> {
  try {
    const headers = getAuthHeaders();
    const [infoRes, noticesRes, eventsRes, facultyRes, galleryRes, downloadsRes] = await Promise.all([
      fetch('/api/school-info'),
      fetch('/api/notices', { headers }),
      fetch('/api/events', { headers }),
      fetch('/api/faculty', { headers }),
      fetch('/api/gallery', { headers }),
      fetch('/api/downloads'),
    ]);

    if (infoRes.ok) safeSet(KEYS.SCHOOL_INFO, await infoRes.json());
    if (noticesRes.ok) safeSet(KEYS.NOTICES, await noticesRes.json());
    if (eventsRes.ok) safeSet(KEYS.EVENTS, await eventsRes.json());
    if (facultyRes.ok) safeSet(KEYS.FACULTY, await facultyRes.json());
    if (galleryRes.ok) safeSet(KEYS.GALLERY, await galleryRes.json());
    if (downloadsRes.ok) safeSet(KEYS.DOWNLOADS, await downloadsRes.json());

    if (authService.isAuthenticated()) {
      const [admRes, conRes, logsRes] = await Promise.all([
        fetch('/api/admissions', { headers }),
        fetch('/api/contacts', { headers }),
        fetch('/api/admin/logs', { headers }),
      ]);
      if (admRes.ok) safeSet(KEYS.ADMISSIONS, await admRes.json());
      if (conRes.ok) safeSet(KEYS.CONTACTS, await conRes.json());
      if (logsRes.ok) safeSet(KEYS.ACTIVITY_LOGS, await logsRes.json());
    }
  } catch (err) {
    console.warn('Background server sync notice:', err);
  }
}

// Log admin activities
export function logActivity(action: string, entityType: string, performedBy = 'Administrator'): void {
  const logs = safeGet<ActivityLog[]>(KEYS.ACTIVITY_LOGS, []);
  const newLog: ActivityLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    action,
    entityType,
    timestamp: new Date().toISOString(),
    performedBy,
  };
  safeSet(KEYS.ACTIVITY_LOGS, [newLog, ...logs.slice(0, 49)]);
}

export function getActivityLogs(): ActivityLog[] {
  return safeGet<ActivityLog[]>(KEYS.ACTIVITY_LOGS, []);
}

// --- School Info ---
export function getSchoolInfo(): SchoolInfo {
  return safeGet<SchoolInfo>(KEYS.SCHOOL_INFO, initialSchoolInfo);
}

export function updateSchoolInfo(info: Partial<SchoolInfo>): SchoolInfo {
  const current = getSchoolInfo();
  const updated = { ...current, ...info };
  safeSet(KEYS.SCHOOL_INFO, updated);
  logActivity('Updated School Profile & Settings', 'SchoolInfo');

  fetch('/api/school-info', {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updated),
  }).catch((err) => console.warn('Failed to persist school info to server:', err));

  return updated;
}

// --- Notices ---
export function getNotices(includeDrafts = true): Notice[] {
  const notices = safeGet<Notice[]>(KEYS.NOTICES, initialNotices);
  if (includeDrafts) return notices;
  return notices.filter((n) => n.isPublished !== false);
}

export function getNoticeById(id: string): Notice | undefined {
  return getNotices().find((n) => n.id === id);
}

export function createNotice(noticeData: Omit<Notice, 'id' | 'createdAt'>): Notice {
  const notices = getNotices();
  const newNotice: Notice = {
    ...noticeData,
    id: `not-${Date.now()}`,
    createdAt: new Date().toISOString(),
    isPublished: noticeData.isPublished !== undefined ? noticeData.isPublished : true,
    isPinned: Boolean(noticeData.isPinned),
  };
  const updated = [newNotice, ...notices];
  safeSet(KEYS.NOTICES, updated);
  logActivity(`Created notice: "${newNotice.title}"`, 'Notice');

  fetch('/api/notices', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(newNotice),
  }).catch((err) => console.warn('Failed to sync notice create:', err));

  return newNotice;
}

export function updateNotice(id: string, updates: Partial<Notice>): Notice | null {
  const notices = getNotices();
  const index = notices.findIndex((n) => n.id === id);
  if (index === -1) return null;
  const updatedNotice = { ...notices[index], ...updates };
  notices[index] = updatedNotice;
  safeSet(KEYS.NOTICES, notices);
  logActivity(`Updated notice: "${updatedNotice.title}"`, 'Notice');

  fetch(`/api/notices/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updatedNotice),
  }).catch((err) => console.warn('Failed to sync notice update:', err));

  return updatedNotice;
}

export function deleteNotice(id: string): boolean {
  const notices = getNotices();
  const target = notices.find((n) => n.id === id);
  const filtered = notices.filter((n) => n.id !== id);
  if (filtered.length === notices.length) return false;
  safeSet(KEYS.NOTICES, filtered);
  logActivity(`Deleted notice: "${target?.title || id}"`, 'Notice');

  fetch(`/api/notices/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  }).catch((err) => console.warn('Failed to sync notice delete:', err));

  return true;
}

export function togglePinNotice(id: string): Notice | null {
  const notices = getNotices();
  const target = notices.find((n) => n.id === id);
  if (!target) return null;
  const updated = updateNotice(id, { isPinned: !target.isPinned });

  fetch(`/api/notices/${id}/pin`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  }).catch((err) => console.warn('Failed to sync notice pin:', err));

  return updated;
}

export function toggleNoticePublish(id: string): Notice | null {
  const notices = getNotices();
  const target = notices.find((n) => n.id === id);
  if (!target) return null;
  const newStatus = target.isPublished === false ? true : false;
  const updated = updateNotice(id, { isPublished: newStatus });

  fetch(`/api/notices/${id}/publish`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  }).catch((err) => console.warn('Failed to sync notice publish toggle:', err));

  return updated;
}

export const toggleNoticePin = togglePinNotice;

// --- Events ---
export function getEvents(includeDrafts = true): SchoolEvent[] {
  const events = safeGet<SchoolEvent[]>(KEYS.EVENTS, initialEvents);
  if (includeDrafts) return events;
  return events.filter((e) => e.isPublished !== false);
}

export function createEvent(eventData: Omit<SchoolEvent, 'id'>): SchoolEvent {
  const events = getEvents();
  const newEvent: SchoolEvent = {
    ...eventData,
    id: `evt-${Date.now()}`,
    isPublished: eventData.isPublished !== undefined ? eventData.isPublished : true,
    highlights: eventData.highlights || [],
  };
  safeSet(KEYS.EVENTS, [newEvent, ...events]);
  logActivity(`Created event: "${newEvent.title}"`, 'Event');

  fetch('/api/events', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(newEvent),
  }).catch((err) => console.warn('Failed to sync event create:', err));

  return newEvent;
}

export function updateEvent(id: string, updates: Partial<SchoolEvent>): SchoolEvent | null {
  const events = getEvents();
  const index = events.findIndex((e) => e.id === id);
  if (index === -1) return null;
  const updated = { ...events[index], ...updates };
  events[index] = updated;
  safeSet(KEYS.EVENTS, events);
  logActivity(`Updated event: "${updated.title}"`, 'Event');

  fetch(`/api/events/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updated),
  }).catch((err) => console.warn('Failed to sync event update:', err));

  return updated;
}

export function deleteEvent(id: string): boolean {
  const events = getEvents();
  const target = events.find((e) => e.id === id);
  const filtered = events.filter((e) => e.id !== id);
  if (filtered.length === events.length) return false;
  safeSet(KEYS.EVENTS, filtered);
  logActivity(`Deleted event: "${target?.title || id}"`, 'Event');

  fetch(`/api/events/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  }).catch((err) => console.warn('Failed to sync event delete:', err));

  return true;
}

export function toggleEventPublish(id: string): SchoolEvent | null {
  const events = getEvents();
  const target = events.find((e) => e.id === id);
  if (!target) return null;
  const newStatus = target.isPublished === false ? true : false;
  const updated = updateEvent(id, { isPublished: newStatus });

  fetch(`/api/events/${id}/publish`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  }).catch((err) => console.warn('Failed to sync event publish toggle:', err));

  return updated;
}

// --- Faculty ---
export function getFaculty(activeOnly = false): FacultyMember[] {
  const faculty = safeGet<FacultyMember[]>(KEYS.FACULTY, initialFaculty);
  if (!activeOnly) return faculty;
  return faculty.filter((f) => f.isActive !== false);
}

export function createFaculty(facultyData: Omit<FacultyMember, 'id'>): FacultyMember {
  const faculty = getFaculty();
  const newMember: FacultyMember = {
    ...facultyData,
    id: `fac-${Date.now()}`,
    displayOrder: facultyData.displayOrder || faculty.length + 1,
    isActive: facultyData.isActive !== undefined ? facultyData.isActive : true,
  };
  safeSet(KEYS.FACULTY, [...faculty, newMember]);
  logActivity(`Added staff member: "${newMember.name}"`, 'Faculty');

  fetch('/api/faculty', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(newMember),
  }).catch((err) => console.warn('Failed to sync faculty create:', err));

  return newMember;
}

export function updateFaculty(id: string, updates: Partial<FacultyMember>): FacultyMember | null {
  const faculty = getFaculty();
  const index = faculty.findIndex((f) => f.id === id);
  if (index === -1) return null;
  const updated = { ...faculty[index], ...updates };
  faculty[index] = updated;
  safeSet(KEYS.FACULTY, faculty);
  logActivity(`Updated staff member: "${updated.name}"`, 'Faculty');

  fetch(`/api/faculty/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updated),
  }).catch((err) => console.warn('Failed to sync faculty update:', err));

  return updated;
}

export function deleteFaculty(id: string): boolean {
  const faculty = getFaculty();
  const target = faculty.find((f) => f.id === id);
  const filtered = faculty.filter((f) => f.id !== id);
  if (filtered.length === faculty.length) return false;
  safeSet(KEYS.FACULTY, filtered);
  logActivity(`Deleted faculty member: "${target?.name || id}"`, 'Faculty');

  fetch(`/api/faculty/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  }).catch((err) => console.warn('Failed to sync faculty delete:', err));

  return true;
}

export function toggleFacultyActive(id: string): FacultyMember | null {
  const faculty = getFaculty();
  const target = faculty.find((f) => f.id === id);
  if (!target) return null;
  const newStatus = target.isActive === false ? true : false;
  const updated = updateFaculty(id, { isActive: newStatus });

  fetch(`/api/faculty/${id}/toggle-active`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  }).catch((err) => console.warn('Failed to sync faculty toggle active:', err));

  return updated;
}

// --- Gallery ---
export function getGallery(includeDrafts = true): GalleryItem[] {
  const items = safeGet<GalleryItem[]>(KEYS.GALLERY, initialGallery);
  if (includeDrafts) return items;
  return items.filter((g) => g.isPublished !== false);
}

export function createGalleryItem(itemData: Omit<GalleryItem, 'id'>): GalleryItem {
  const items = getGallery();
  const newItem: GalleryItem = {
    ...itemData,
    id: `gal-${Date.now()}`,
    isPublished: itemData.isPublished !== undefined ? itemData.isPublished : true,
  };
  safeSet(KEYS.GALLERY, [newItem, ...items]);
  logActivity(`Added gallery photo: "${newItem.title}"`, 'Gallery');

  fetch('/api/gallery', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(newItem),
  }).catch((err) => console.warn('Failed to sync gallery create:', err));

  return newItem;
}

export function updateGalleryItem(id: string, updates: Partial<GalleryItem>): GalleryItem | null {
  const items = getGallery();
  const index = items.findIndex((g) => g.id === id);
  if (index === -1) return null;
  const updated = { ...items[index], ...updates };
  items[index] = updated;
  safeSet(KEYS.GALLERY, items);
  logActivity(`Updated gallery item: "${updated.title}"`, 'Gallery');

  fetch(`/api/gallery/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updated),
  }).catch((err) => console.warn('Failed to sync gallery update:', err));

  return updated;
}

export function deleteGalleryItem(id: string): boolean {
  const items = getGallery();
  const target = items.find((g) => g.id === id);
  const filtered = items.filter((g) => g.id !== id);
  if (filtered.length === items.length) return false;
  safeSet(KEYS.GALLERY, filtered);
  logActivity(`Deleted gallery item: "${target?.title || id}"`, 'Gallery');

  fetch(`/api/gallery/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  }).catch((err) => console.warn('Failed to sync gallery delete:', err));

  return true;
}

export function toggleGalleryPublish(id: string): GalleryItem | null {
  const items = getGallery();
  const target = items.find((g) => g.id === id);
  if (!target) return null;
  const newStatus = target.isPublished === false ? true : false;
  const updated = updateGalleryItem(id, { isPublished: newStatus });

  fetch(`/api/gallery/${id}/publish`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  }).catch((err) => console.warn('Failed to sync gallery publish toggle:', err));

  return updated;
}

// --- Admission Enquiries ---
export function getAdmissionEnquiries(): AdmissionEnquiry[] {
  return safeGet<AdmissionEnquiry[]>(KEYS.ADMISSIONS, initialAdmissions);
}

export async function submitAdmissionEnquiry(
  data: Omit<AdmissionEnquiry, 'id' | 'applicationNo' | 'status' | 'createdAt'>
): Promise<AdmissionEnquiry> {
  const current = getAdmissionEnquiries();
  const serial = current.length + 1001;
  const applicationNo = `VV-2026-ADM-${serial}`;
  const newEnquiry: AdmissionEnquiry = {
    ...data,
    id: `adm-${Date.now()}`,
    applicationNo,
    status: 'new',
    createdAt: new Date().toISOString(),
    submittedAt: new Date().toISOString(),
  };

  safeSet(KEYS.ADMISSIONS, [newEnquiry, ...current]);

  try {
    const res = await fetch('/api/admissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const serverData = await res.json();
      if (serverData.data) {
        return serverData.data;
      }
    }
  } catch (err) {
    console.warn('Submitted locally, server offline:', err);
  }

  return newEnquiry;
}

export function updateAdmissionStatus(
  id: string,
  status: AdmissionStatus,
  notes?: string
): AdmissionEnquiry | null {
  const items = getAdmissionEnquiries();
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return null;
  const updated: AdmissionEnquiry = {
    ...items[index],
    status,
    notes: notes !== undefined ? notes : items[index].notes,
  };
  items[index] = updated;
  safeSet(KEYS.ADMISSIONS, items);
  logActivity(`Updated admission enquiry ${updated.applicationNo} to "${status}"`, 'Admission');

  fetch(`/api/admissions/${id}/status`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status, notes }),
  }).catch((err) => console.warn('Failed to sync admission status:', err));

  return updated;
}

export function deleteAdmissionEnquiry(id: string): boolean {
  const items = getAdmissionEnquiries();
  const filtered = items.filter((item) => item.id !== id);
  if (filtered.length === items.length) return false;
  safeSet(KEYS.ADMISSIONS, filtered);
  logActivity(`Deleted admission enquiry record ${id}`, 'Admission');

  fetch(`/api/admissions/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  }).catch((err) => console.warn('Failed to sync admission delete:', err));

  return true;
}

// --- Contact Enquiries ---
export function getContactEnquiries(): ContactEnquiry[] {
  return safeGet<ContactEnquiry[]>(KEYS.CONTACTS, initialContacts);
}

export async function submitContactEnquiry(data: Omit<ContactEnquiry, 'id' | 'status' | 'createdAt'>): Promise<ContactEnquiry> {
  const current = getContactEnquiries();
  const newContact: ContactEnquiry = {
    ...data,
    id: `con-${Date.now()}`,
    status: 'unread',
    createdAt: new Date().toISOString(),
    submittedAt: new Date().toISOString(),
  };

  safeSet(KEYS.CONTACTS, [newContact, ...current]);

  try {
    const res = await fetch('/api/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const serverData = await res.json();
      if (serverData.data) {
        return serverData.data;
      }
    }
  } catch (err) {
    console.warn('Contact submitted locally, server offline:', err);
  }

  return newContact;
}

export function updateContactStatus(id: string, status: ContactStatus, replyNotes?: string): ContactEnquiry | null {
  const items = getContactEnquiries();
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return null;
  const updated: ContactEnquiry = {
    ...items[index],
    status,
    replyNotes: replyNotes !== undefined ? replyNotes : items[index].replyNotes,
  };
  items[index] = updated;
  safeSet(KEYS.CONTACTS, items);
  logActivity(`Updated contact enquiry status: ${id} to "${status}"`, 'Contact');

  fetch(`/api/contacts/${id}/status`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status, replyNotes }),
  }).catch((err) => console.warn('Failed to sync contact status:', err));

  return updated;
}

export function deleteContactEnquiry(id: string): boolean {
  const items = getContactEnquiries();
  const filtered = items.filter((item) => item.id !== id);
  if (filtered.length === items.length) return false;
  safeSet(KEYS.CONTACTS, filtered);
  logActivity(`Deleted contact message ${id}`, 'Contact');

  fetch(`/api/contacts/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  }).catch((err) => console.warn('Failed to sync contact delete:', err));

  return true;
}

// --- Downloads ---
export function getDownloads(): DownloadItem[] {
  return safeGet<DownloadItem[]>(KEYS.DOWNLOADS, initialDownloads);
}

export function createDownload(data: Omit<DownloadItem, 'id' | 'downloadCount' | 'lastUpdated'>): DownloadItem {
  const items = getDownloads();
  const newItem: DownloadItem = {
    ...data,
    id: `dl-${Date.now()}`,
    lastUpdated: new Date().toISOString().split('T')[0],
    downloadCount: 0,
  };
  safeSet(KEYS.DOWNLOADS, [newItem, ...items]);
  logActivity(`Added downloadable resource: "${newItem.title}"`, 'Download');

  fetch('/api/downloads', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(newItem),
  }).catch((err) => console.warn('Failed to sync download create:', err));

  return newItem;
}

export function deleteDownload(id: string): boolean {
  const items = getDownloads();
  const target = items.find((d) => d.id === id);
  const filtered = items.filter((d) => d.id !== id);
  if (filtered.length === items.length) return false;
  safeSet(KEYS.DOWNLOADS, filtered);
  logActivity(`Deleted download item: "${target?.title || id}"`, 'Download');

  fetch(`/api/downloads/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  }).catch((err) => console.warn('Failed to sync download delete:', err));

  return true;
}

export function incrementDownloadCount(id: string): number {
  const items = getDownloads();
  const index = items.findIndex((d) => d.id === id);
  if (index === -1) return 0;
  items[index].downloadCount = (items[index].downloadCount || 0) + 1;
  safeSet(KEYS.DOWNLOADS, items);

  fetch(`/api/downloads/${id}/track`, { method: 'POST' }).catch(() => {});
  return items[index].downloadCount;
}

// Save helpers
export function saveNotice(notice: Notice): Notice {
  const existing = getNotices().find((n) => n.id === notice.id);
  if (existing) {
    return updateNotice(notice.id, notice) || notice;
  } else {
    return createNotice(notice);
  }
}

export function saveEvent(event: SchoolEvent): SchoolEvent {
  const existing = getEvents().find((e) => e.id === event.id);
  if (existing) {
    return updateEvent(event.id, event) || event;
  } else {
    return createEvent(event);
  }
}

export function saveFaculty(member: FacultyMember): FacultyMember {
  const existing = getFaculty().find((f) => f.id === member.id);
  if (existing) {
    return updateFaculty(member.id, member) || member;
  } else {
    return createFaculty(member);
  }
}

export function saveGalleryItem(item: GalleryItem): GalleryItem {
  const existing = getGallery().find((g) => g.id === item.id);
  if (existing) {
    return updateGalleryItem(item.id, item) || item;
  }
  return createGalleryItem(item);
}

export function updateDownload(id: string, updates: Partial<DownloadItem>): DownloadItem | null {
  const items = getDownloads();
  const index = items.findIndex((d) => d.id === id);
  if (index === -1) return null;
  const updated: DownloadItem = {
    ...items[index],
    ...updates,
    lastUpdated: new Date().toISOString().split('T')[0],
  };
  items[index] = updated;
  safeSet(KEYS.DOWNLOADS, items);
  logActivity(`Updated download resource: "${updated.title}"`, 'Download');

  fetch(`/api/downloads/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updated),
  }).catch((err) => console.warn('Failed to sync download update:', err));

  return updated;
}

export function toggleDownloadPublish(id: string): DownloadItem | null {
  const items = getDownloads();
  const target = items.find((d) => d.id === id);
  if (!target) return null;
  const newStatus = target.isPublished === false ? true : false;
  const updated = updateDownload(id, { isPublished: newStatus });

  fetch(`/api/downloads/${id}/publish`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  }).catch((err) => console.warn('Failed to sync download publish toggle:', err));

  return updated;
}

export function saveDownloadItem(item: DownloadItem): DownloadItem {
  const existing = getDownloads().find((d) => d.id === item.id);
  if (existing) {
    return updateDownload(item.id, item) || item;
  }
  return createDownload(item);
}

export const deleteDownloadItem = deleteDownload;

// Clear demo data
export function clearDemoData(): void {
  safeSet(KEYS.NOTICES, getNotices().filter((n) => !n.isDemo));
  safeSet(KEYS.EVENTS, getEvents().filter((e) => !e.isDemo));
  safeSet(KEYS.GALLERY, getGallery().filter((g) => !g.isDemo));
  safeSet(KEYS.FACULTY, getFaculty().filter((f) => !f.isDemo));
  safeSet(KEYS.DOWNLOADS, getDownloads().filter((d) => !d.isDemo));
  safeSet(KEYS.ADMISSIONS, getAdmissionEnquiries().filter((a) => !a.isDemo));
  safeSet(KEYS.CONTACTS, getContactEnquiries().filter((c) => !c.isDemo));

  fetch('/api/admin/clear-demo', {
    method: 'POST',
    headers: getAuthHeaders(),
  }).catch((err) => console.warn('Failed to clear demo records on server:', err));

  logActivity('Cleared all sample demo records from system', 'System');
}

// Reset data
export function resetToDefaults(): void {
  safeSet(KEYS.SCHOOL_INFO, initialSchoolInfo);
  safeSet(KEYS.NOTICES, initialNotices);
  safeSet(KEYS.EVENTS, initialEvents);
  safeSet(KEYS.GALLERY, initialGallery);
  safeSet(KEYS.FACULTY, initialFaculty);
  safeSet(KEYS.ADMISSIONS, initialAdmissions);
  safeSet(KEYS.CONTACTS, initialContacts);
  safeSet(KEYS.DOWNLOADS, initialDownloads);
  safeSet(KEYS.ACTIVITY_LOGS, []);

  fetch('/api/admin/reset-demo', {
    method: 'POST',
    headers: getAuthHeaders(),
  }).catch((err) => console.warn('Failed to reset data on server:', err));

  logActivity('Reset all school data to seed defaults', 'System');
}

export const resetToSeedData = resetToDefaults;
