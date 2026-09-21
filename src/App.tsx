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

  // Check existing session and sync server on mount
  useEffect(() => {
    const initApp = async () => {
      const authStatus = authService.isAuthenticated();
      if (authStatus) {
        const isValid = await authService.verifySession();
        setIsAdminLoggedIn(isValid);
      } else {
        setIsAdminLoggedIn(false);
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

  const handleOpenLogin = () => {
    if (isAdminLoggedIn) {
      setIsAdminView(true);
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const handleLoginSuccess = async () => {
    setIsAdminLoggedIn(true);
    setIsAdminView(true);
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

  // Filter public view data (only published/active items shown to visitors)
  const publicNotices = notices.filter((n) => n.isPublished !== false);
  const publicEvents = events.filter((e) => e.isPublished !== false);
  const publicGallery = gallery.filter((g) => g.isPublished !== false);
  const publicFaculty = faculty.filter((f) => f.isActive !== false);

  // If in Admin Console mode
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800 selection:bg-amber-400 selection:text-blue-950">
      {/* Navigation Header */}
      <Navbar
        schoolInfo={schoolInfo}
        activeTab={activeTab}
        onNavigate={handleNavigate}
        isAdminLoggedIn={isAdminLoggedIn}
        onOpenAdminLogin={handleOpenLogin}
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
      />

      {/* Mobile Quick Actions Bar */}
      <MobileQuickBar
        phone={schoolInfo.phone}
        onNavigate={handleNavigate}
        activeTab={activeTab}
      />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
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
