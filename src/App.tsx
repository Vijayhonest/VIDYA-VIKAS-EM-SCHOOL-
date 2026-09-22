import { useState, useEffect } from 'react';
import {
  SchoolInfo,
  Notice,
  SchoolEvent,
  FacultyMember,
  GalleryItem,
  AdmissionEnquiry,
  ContactEnquiry,
  DownloadItem,
  Student,
  Parent,
} from './types';
import {
  getSchoolInfo,
  getNotices,
  getEvents,
  getFaculty,
  getGallery,
  getAdmissionEnquiries,
  getContactEnquiries,
  getDownloads,
  syncFromServer,
} from './services/storageService';
import { authService } from './services/authService';
import { studentService } from './services/studentService';
import { parentService } from './services/parentService';
import { ToastProvider, useToast } from './components/common/Toast';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { AcademicsPage } from './pages/AcademicsPage';
import { AdmissionsPage } from './pages/AdmissionsPage';
import { FacultyPage } from './pages/FacultyPage';
import { ActivitiesPage } from './pages/ActivitiesPage';
import { GalleryPage } from './pages/GalleryPage';
import { NoticesPage } from './pages/NoticesPage';
import { EventsPage } from './pages/EventsPage';
import { DownloadsPage } from './pages/DownloadsPage';
import { ContactPage } from './pages/ContactPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminLoginModal } from './pages/AdminLoginModal';
import { StudentDashboard } from './pages/StudentDashboard';
import { StudentLoginModal } from './pages/StudentLoginModal';
import { ParentDashboard } from './pages/ParentDashboard';
import { ParentLoginModal } from './pages/ParentLoginModal';
import { StaffDashboard } from './pages/StaffDashboard';
import { StaffLoginModal } from './pages/StaffLoginModal';
import { staffService, StaffProfile } from './services/staffService';
import { AiSchoolAssistant } from './components/chat/AiSchoolAssistant';
import { MobileQuickBar } from './components/layout/MobileQuickBar';

function SchoolAppContent() {
  const { showToast } = useToast();

  // Navigation State
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

  // Admin States
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);
  const [isAdminView, setIsAdminView] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  // Student States
  const [isStudentLoggedIn, setIsStudentLoggedIn] = useState<boolean>(false);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [isStudentView, setIsStudentView] = useState<boolean>(false);
  const [isStudentLoginOpen, setIsStudentLoginOpen] = useState<boolean>(false);

  // Parent States
  const [isParentLoggedIn, setIsParentLoggedIn] = useState<boolean>(false);
  const [currentParent, setCurrentParent] = useState<Parent | null>(null);
  const [parentChildren, setParentChildren] = useState<Student[]>([]);
  const [isParentView, setIsParentView] = useState<boolean>(false);
  const [isParentLoginOpen, setIsParentLoginOpen] = useState<boolean>(false);

  // Staff States
  const [isStaffLoggedIn, setIsStaffLoggedIn] = useState<boolean>(false);
  const [currentStaff, setCurrentStaff] = useState<StaffProfile | null>(null);
  const [isStaffView, setIsStaffView] = useState<boolean>(false);
  const [isStaffLoginOpen, setIsStaffLoginOpen] = useState<boolean>(false);

  // App Data
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo>(getSchoolInfo());
  const [notices, setNotices] = useState<Notice[]>(getNotices());
  const [events, setEvents] = useState<SchoolEvent[]>(getEvents());
  const [faculty, setFaculty] = useState<FacultyMember[]>(getFaculty());
  const [gallery, setGallery] = useState<GalleryItem[]>(getGallery());
  const [admissions, setAdmissions] = useState<AdmissionEnquiry[]>(getAdmissionEnquiries());
  const [contacts, setContacts] = useState<ContactEnquiry[]>(getContactEnquiries());
  const [downloads, setDownloads] = useState<DownloadItem[]>(getDownloads());

  // Reload data from storage & sync from server
  const reloadAllData = () => {
    setSchoolInfo(getSchoolInfo());
    setNotices(getNotices());
    setEvents(getEvents());
    setFaculty(getFaculty());
    setGallery(getGallery());
    setAdmissions(getAdmissionEnquiries());
    setContacts(getContactEnquiries());
    setDownloads(getDownloads());
  };

  // Check existing sessions and sync server on mount
  useEffect(() => {
    const initApp = async () => {
      // Check Admin Session
      const authStatus = authService.isAuthenticated();
      if (authStatus) {
        const isValid = await authService.verifySession();
        setIsAdminLoggedIn(isValid);
      } else {
        setIsAdminLoggedIn(false);
      }

      // Check Student Session
      if (studentService.isAuthenticated()) {
        const stored = studentService.getStoredStudent();
        if (stored) {
          setCurrentStudent(stored);
          setIsStudentLoggedIn(true);
        }
      }

      // Check Parent Session
      if (parentService.isAuthenticated()) {
        const storedP = parentService.getStoredParent();
        const storedC = parentService.getStoredChildren();
        if (storedP) {
          setCurrentParent(storedP);
          setParentChildren(storedC);
          setIsParentLoggedIn(true);
        }
      }

      // Check Staff Session
      if (staffService.isAuthenticated()) {
        const storedStaff = staffService.getStoredStaff();
        if (storedStaff) {
          setCurrentStaff(storedStaff);
          setIsStaffLoggedIn(true);
        }
      }

      await syncFromServer();
      reloadAllData();
    };

    initApp();
  }, []);

  const handleNavigate = (tab: string) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectNoticeFromHome = (notice: Notice) => {
    setSelectedNotice(notice);
    setActiveTab('notices');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- Admin Handlers ---
  const handleOpenLogin = () => {
    if (isAdminLoggedIn) {
      setIsAdminView(true);
      setIsStudentView(false);
      setIsParentView(false);
      setIsStaffView(false);
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const handleLoginSuccess = async () => {
    setIsAdminLoggedIn(true);
    setIsAdminView(true);
    setIsStudentView(false);
    setIsParentView(false);
    setIsStaffView(false);
    await syncFromServer();
    reloadAllData();
  };

  const handleLogout = async () => {
    await authService.logout();
    setIsAdminLoggedIn(false);
    setIsAdminView(false);
    showToast('Administrator session closed.', 'info');
    reloadAllData();
  };

  // --- Student Handlers ---
  const handleOpenStudentPortal = () => {
    if (isStudentLoggedIn && currentStudent) {
      setIsStudentView(true);
      setIsAdminView(false);
      setIsParentView(false);
      setIsStaffView(false);
    } else {
      setIsStudentLoginOpen(true);
    }
  };

  const handleStudentLoginSuccess = (student: Student) => {
    setIsStudentLoggedIn(true);
    setCurrentStudent(student);
    setIsStudentView(true);
    setIsAdminView(false);
    setIsParentView(false);
    setIsStaffView(false);
    showToast(`Welcome back, ${student.name}!`, 'success');
  };

  const handleStudentLogout = () => {
    studentService.logout();
    setIsStudentLoggedIn(false);
    setCurrentStudent(null);
    setIsStudentView(false);
    showToast('Student signed out successfully.', 'info');
  };

  // --- Parent Handlers ---
  const handleOpenParentPortal = () => {
    if (isParentLoggedIn && currentParent) {
      setIsParentView(true);
      setIsAdminView(false);
      setIsStudentView(false);
      setIsStaffView(false);
    } else {
      setIsParentLoginOpen(true);
    }
  };

  const handleParentLoginSuccess = (parent: Parent, children: Student[]) => {
    setIsParentLoggedIn(true);
    setCurrentParent(parent);
    setParentChildren(children);
    setIsParentView(true);
    setIsAdminView(false);
    setIsStudentView(false);
    setIsStaffView(false);
    showToast(`Welcome back, ${parent.name}!`, 'success');
  };

  const handleParentLogout = () => {
    parentService.logout();
    setIsParentLoggedIn(false);
    setCurrentParent(null);
    setParentChildren([]);
    setIsParentView(false);
    showToast('Parent signed out successfully.', 'info');
  };

  // --- Staff Handlers ---
  const handleOpenStaffPortal = () => {
    if (isStaffLoggedIn && currentStaff) {
      setIsStaffView(true);
      setIsAdminView(false);
      setIsStudentView(false);
      setIsParentView(false);
    } else {
      setIsStaffLoginOpen(true);
    }
  };

  const handleStaffLoginSuccess = (staff: StaffProfile) => {
    setIsStaffLoggedIn(true);
    setCurrentStaff(staff);
    setIsStaffView(true);
    setIsAdminView(false);
    setIsStudentView(false);
    setIsParentView(false);
    showToast(`Welcome back, ${staff.name}!`, 'success');
  };

  const handleStaffLogout = () => {
    staffService.logout();
    setIsStaffLoggedIn(false);
    setCurrentStaff(null);
    setIsStaffView(false);
    showToast('Staff member signed out successfully.', 'info');
  };

  // Filter public view data (only published/active items shown to visitors)
  const publicNotices = notices.filter((n) => n.isPublished !== false);
  const publicEvents = events.filter((e) => e.isPublished !== false);
  const publicGallery = gallery.filter((g) => g.isPublished !== false);
  const publicFaculty = faculty.filter((f) => f.isActive !== false);

  // 1. If in Admin Console mode
  if (isAdminView && isAdminLoggedIn) {
    return (
      <AdminDashboard
        schoolInfo={schoolInfo}
        notices={notices}
        events={events}
        faculty={faculty}
        gallery={gallery}
        admissions={admissions}
        contacts={contacts}
        downloads={downloads}
        onDataChange={reloadAllData}
        onLogout={handleLogout}
        onExitToPublic={() => setIsAdminView(false)}
      />
    );
  }

  // 2. If in Student Portal mode
  if (isStudentView && isStudentLoggedIn && currentStudent) {
    return (
      <StudentDashboard
        initialStudent={currentStudent}
        onLogout={handleStudentLogout}
        onExitToPublic={() => setIsStudentView(false)}
      />
    );
  }

  // 3. If in Parent Portal mode
  if (isParentView && isParentLoggedIn && currentParent) {
    return (
      <ParentDashboard
        initialParent={currentParent}
        initialChildren={parentChildren}
        onLogout={handleParentLogout}
        onExitToPublic={() => setIsParentView(false)}
      />
    );
  }

  // 4. If in Staff Portal mode
  if (isStaffView && isStaffLoggedIn && currentStaff) {
    return (
      <StaffDashboard
        initialStaff={currentStaff}
        onLogout={handleStaffLogout}
        onExitToPublic={() => setIsStaffView(false)}
      />
    );
  }

  // 5. Public School Website
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800 selection:bg-amber-400 selection:text-blue-950">
      {/* Navigation Header */}
      <Navbar
        schoolInfo={schoolInfo}
        activeTab={activeTab}
        onNavigate={handleNavigate}
        isAdminLoggedIn={isAdminLoggedIn}
        onOpenAdminLogin={handleOpenLogin}
        onOpenStudentPortal={handleOpenStudentPortal}
        isStudentLoggedIn={isStudentLoggedIn}
        onOpenParentPortal={handleOpenParentPortal}
        isParentLoggedIn={isParentLoggedIn}
        onOpenStaffPortal={handleOpenStaffPortal}
        isStaffLoggedIn={isStaffLoggedIn}
      />

      {/* Main Page Body */}
      <main className="flex-1 pb-16 md:pb-0">
        {activeTab === 'home' && (
          <HomePage
            schoolInfo={schoolInfo}
            notices={publicNotices}
            events={publicEvents}
            gallery={publicGallery}
            onNavigate={handleNavigate}
            onSelectNotice={handleSelectNoticeFromHome}
            onOpenStudentPortal={handleOpenStudentPortal}
            onOpenParentPortal={handleOpenParentPortal}
            onOpenStaffPortal={handleOpenStaffPortal}
            onOpenAdminLogin={handleOpenLogin}
          />
        )}

        {activeTab === 'about' && (
          <AboutPage schoolInfo={schoolInfo} onNavigate={handleNavigate} />
        )}

        {activeTab === 'academics' && (
          <AcademicsPage schoolInfo={schoolInfo} onNavigate={handleNavigate} />
        )}

        {activeTab === 'admissions' && (
          <AdmissionsPage schoolInfo={schoolInfo} onNavigate={handleNavigate} />
        )}

        {activeTab === 'faculty' && (
          <FacultyPage faculty={publicFaculty} onOpenAdminLogin={handleOpenLogin} />
        )}

        {activeTab === 'activities' && (
          <ActivitiesPage onNavigate={handleNavigate} />
        )}

        {activeTab === 'gallery' && <GalleryPage gallery={publicGallery} />}

        {activeTab === 'notices' && (
          <NoticesPage
            notices={publicNotices}
            schoolInfo={schoolInfo}
            selectedNotice={selectedNotice}
            onSelectNotice={setSelectedNotice}
          />
        )}

        {activeTab === 'events' && <EventsPage events={publicEvents} />}

        {activeTab === 'downloads' && (
          <DownloadsPage
            downloads={downloads}
            schoolInfo={schoolInfo}
            onRefreshDownloads={reloadAllData}
          />
        )}

        {activeTab === 'contact' && <ContactPage schoolInfo={schoolInfo} />}
      </main>

      {/* Footer */}
      <Footer
        schoolInfo={schoolInfo}
        onNavigate={handleNavigate}
        onOpenAdminLogin={handleOpenLogin}
        onOpenStudentPortal={handleOpenStudentPortal}
        onOpenParentPortal={handleOpenParentPortal}
        onOpenStaffPortal={handleOpenStaffPortal}
      />

      {/* Mobile Quick Actions Bar */}
      <MobileQuickBar
        phone={schoolInfo.phone}
        onNavigate={handleNavigate}
        activeTab={activeTab}
        onOpenStudentPortal={handleOpenStudentPortal}
        onOpenParentPortal={handleOpenParentPortal}
      />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Student Login Modal */}
      <StudentLoginModal
        isOpen={isStudentLoginOpen}
        onClose={() => setIsStudentLoginOpen(false)}
        onLoginSuccess={handleStudentLoginSuccess}
      />

      {/* Parent Login Modal */}
      <ParentLoginModal
        isOpen={isParentLoginOpen}
        onClose={() => setIsParentLoginOpen(false)}
        onLoginSuccess={handleParentLoginSuccess}
      />

      {/* Staff Login Modal */}
      <StaffLoginModal
        isOpen={isStaffLoginOpen}
        onClose={() => setIsStaffLoginOpen(false)}
        onSuccess={handleStaffLoginSuccess}
      />

      {/* Floating AI Assistant for Public Visitors */}
      <AiSchoolAssistant onNavigate={handleNavigate} />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <SchoolAppContent />
    </ToastProvider>
  );
}
