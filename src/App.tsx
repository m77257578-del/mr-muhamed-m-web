import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { FloatingChat } from './components/FloatingChat';
import { FloatingAiAssistant } from './components/FloatingAiAssistant';
import { StudentSpace } from './components/StudentSpace';
import { ParentSpace } from './components/ParentSpace';
import { TeacherSpace } from './components/TeacherSpace';
import { MediaViewer } from './components/MediaViewer';
import { ExamModal } from './components/ExamModal';
import { AuthModal } from './components/AuthModal';
import { SubjectSettingsModal } from './components/SubjectSettingsModal';
import { SplashLoader3D } from './components/SplashLoader3D';
import { OfflineIndicator } from './components/OfflineIndicator';
import {
  PublicData,
  StudentData,
  ParentData,
  TeacherData,
  CourseContentItem,
  Exam,
} from './types';
import { apiRequest, tokens } from './services/api';
import { saveToIndexedDB, loadFromIndexedDB, removeFromIndexedDB } from './services/dbStorage';

export function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      return (localStorage.getItem('platform-theme') as 'light' | 'dark') || 'dark';
    } catch {
      return 'dark';
    }
  });

  const [activeTab, setActiveTab] = useState<'student' | 'parent' | 'teacher'>('student');
  const [requestedStudentTab, setRequestedStudentTab] = useState<'courses' | 'achievements' | 'exams' | 'live' | 'interactive-tools' | 'wallet' | 'notices' | 'messages' | 'profile' | 'video-hub' | undefined>(undefined);
  const [publicData, setPublicData] = useState<PublicData | null>(null);
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [parentData, setParentData] = useState<ParentData | null>(null);
  const [teacherData, setTeacherData] = useState<TeacherData | null>(null);

  // Modals
  const [activeMedia, setActiveMedia] = useState<CourseContentItem | null>(null);
  const [activeExam, setActiveExam] = useState<Exam | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSubjectSettingsOpen, setIsSubjectSettingsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // PWA install prompt
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      await installPrompt.userChoice;
      setInstallPrompt(null);
    } else {
      setToastMessage(
        /iphone|ipad|ipod/i.test(navigator.userAgent)
          ? 'لتثبيت المنصة: اضغط زر مشاركة بالمتصفح ثم "إضافة إلى الشاشة الرئيسية".'
          : 'لتثبيت المنصة: افتح قائمة المتصفح ثم اختر "تثبيت التطبيق" أو "إضافة إلى الشاشة الرئيسية".'
      );
    }
  };

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.body.dataset.theme = next;
    try {
      localStorage.setItem('platform-theme', next);
    } catch {}
  };

  useEffect(() => {
    document.body.dataset.theme = theme;
  }, [theme]);

  // Apply Dynamic Colors, Fonts & CSS Variables
  useEffect(() => {
    if (publicData) {
      const root = document.documentElement;
      if (publicData.primaryColor) {
        root.style.setProperty('--primary-blue', publicData.primaryColor);
        root.style.setProperty('--primary-theme', publicData.primaryColor);
      }
      if (publicData.headingColor) {
        root.style.setProperty('--heading-theme', publicData.headingColor);
      }
      if (publicData.textColor) {
        root.style.setProperty('--text-main', publicData.textColor);
      }
      if (publicData.panelBg) {
        root.style.setProperty('--bg-panel', publicData.panelBg);
      }
      if (publicData.cardBg) {
        root.style.setProperty('--bg-card', publicData.cardBg);
      }
      if (publicData.accentGold) {
        root.style.setProperty('--accent-gold', publicData.accentGold);
      }
      if (publicData.fontFamily) {
        document.body.style.fontFamily = publicData.fontFamily;
      }
      if (publicData.bgPattern) {
        document.body.dataset.pattern = publicData.bgPattern;
      }
    }
  }, [publicData]);

  // Load public data
  const loadPublic = async () => {
    try {
      const cached = await loadFromIndexedDB<PublicData>('public_data');
      if (cached) {
        setPublicData(cached);
        if (cached.name) document.title = cached.name;
      }
    } catch {}

    try {
      const data = await apiRequest<PublicData>('public', '/api/public');
      setPublicData(data);
      if (data.name) {
        document.title = data.name;
      }
      saveToIndexedDB('public_data', data);
    } catch (e) {
      console.error('Failed to load public data', e);
    }
  };

  // Load Student
  const loadStudent = async () => {
    if (!tokens.student) {
      setStudentData(null);
      removeFromIndexedDB('student_data');
      return;
    }

    try {
      const cached = await loadFromIndexedDB<StudentData>('student_data');
      if (cached) setStudentData(cached);
    } catch {}

    try {
      const data = await apiRequest<StudentData>('student', '/api/student/me');
      setStudentData(data);
      saveToIndexedDB('student_data', data);
    } catch (e: any) {
      if (e.status === 401 || e.status === 403) {
        tokens.student = '';
        setStudentData(null);
        removeFromIndexedDB('student_data');
      }
    }
  };

  // Load Parent
  const loadParent = async () => {
    if (!tokens.parent) {
      setParentData(null);
      removeFromIndexedDB('parent_data');
      return;
    }

    try {
      const cached = await loadFromIndexedDB<ParentData>('parent_data');
      if (cached) setParentData(cached);
    } catch {}

    try {
      const data = await apiRequest<ParentData>('parent', '/api/parent/me');
      setParentData(data);
      saveToIndexedDB('parent_data', data);
    } catch (e: any) {
      if (e.status === 401 || e.status === 403) {
        tokens.parent = '';
        setParentData(null);
        removeFromIndexedDB('parent_data');
      }
    }
  };

  // Load Teacher
  const loadTeacher = async () => {
    if (!tokens.teacher) {
      setTeacherData(null);
      removeFromIndexedDB('teacher_data');
      return;
    }

    try {
      const cached = await loadFromIndexedDB<TeacherData>('teacher_data');
      if (cached) setTeacherData(cached);
    } catch {}

    try {
      const data = await apiRequest<TeacherData>('teacher', '/api/teacher/all');
      setTeacherData(data);
      saveToIndexedDB('teacher_data', data);
    } catch (e: any) {
      if (e.status === 401 || e.status === 403) {
        tokens.teacher = '';
        setTeacherData(null);
        removeFromIndexedDB('teacher_data');
      }
    }
  };

  useEffect(() => {
    const initApp = async () => {
      // 1. Load cached states immediately from IndexedDB for zero-lag rendering
      const [pCache, stCache, prCache, tcCache] = await Promise.all([
        loadFromIndexedDB<PublicData>('public_data'),
        loadFromIndexedDB<StudentData>('student_data'),
        loadFromIndexedDB<ParentData>('parent_data'),
        loadFromIndexedDB<TeacherData>('teacher_data'),
      ]);

      if (pCache) {
        setPublicData(pCache);
        if (pCache.name) document.title = pCache.name;
      }
      if (stCache && tokens.student) {
        setStudentData(stCache);
        setActiveTab('student');
      }
      if (prCache && tokens.parent) {
        setParentData(prCache);
        setActiveTab('parent');
      }
      if (tcCache && tokens.teacher) {
        setTeacherData(tcCache);
        setActiveTab('teacher');
      }

      // 2. Fetch fresh updates from API
      loadPublic();
      if (tokens.teacher) {
        loadTeacher();
        setActiveTab('teacher');
      } else if (tokens.student) {
        loadStudent();
        setActiveTab('student');
      } else if (tokens.parent) {
        loadParent();
        setActiveTab('parent');
      }
    };

    initApp();

    // Live sync: Listen for server events to refresh state automatically
    let es: EventSource | null = null;
    try {
      es = new EventSource('/api/updates/stream');
      es.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload && payload.type === 'data_updated') {
            loadPublic();
            if (tokens.student) loadStudent();
            if (tokens.parent) loadParent();
            if (tokens.teacher) loadTeacher();
          }
        } catch {
          // ignore parsing error
        }
      };
    } catch {
      // SSE fallback
    }

    return () => {
      if (es) es.close();
    };
  }, []);

  const currentUserRole = tokens.teacher
    ? 'teacher'
    : tokens.student
    ? 'student'
    : tokens.parent
    ? 'parent'
    : null;

  const currentUserName =
    currentUserRole === 'teacher'
      ? 'الأدمن'
      : currentUserRole === 'student'
      ? studentData?.profile?.name || 'طالب'
      : currentUserRole === 'parent'
      ? parentData?.name || 'ولي أمر'
      : '';

  const handleLoginClick = () => {
    setIsAuthModalOpen(true);
  };

  const handleLoginSuccess = async (role: 'student' | 'parent' | 'teacher') => {
    setIsAuthModalOpen(false);
    if (role === 'student') {
      await loadStudent();
      setActiveTab('student');
    } else if (role === 'parent') {
      await loadParent();
      setActiveTab('parent');
    } else if (role === 'teacher') {
      await loadTeacher();
      setActiveTab('teacher');
    }
  };

  const handleGlobalLogout = () => {
    tokens.student = '';
    tokens.parent = '';
    tokens.teacher = '';
    setStudentData(null);
    setParentData(null);
    setTeacherData(null);
    setActiveTab('student');
  };

  const handleNavigateToAdminSettings = () => {
    setActiveTab('teacher');
    setTimeout(() => {
      const el = document.getElementById('admin-settings');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 80);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {showSplash && (
        <SplashLoader3D
          platformName={publicData?.name || 'منصة الأستاذ محمد عبد المقصود'}
          platformSubtitle={publicData?.aboutUs?.subtitle || publicData?.aboutUs?.subject || 'منصتك التعليمية المتكاملة 🎓✨'}
          onFinish={() => setShowSplash(false)}
        />
      )}
      <div>
        {/* Header */}
        <Header
          publicData={publicData}
          notices={studentData?.notices || []}
          onOpenNoticesTab={() => {
            setActiveTab('student');
            setRequestedStudentTab('notices');
          }}
          theme={theme}
          toggleTheme={toggleTheme}
          onInstall={handleInstallClick}
          onLoginClick={handleLoginClick}
          userRole={currentUserRole}
          userName={currentUserName}
          onLogout={handleGlobalLogout}
          onNavigateToAdminSettings={handleNavigateToAdminSettings}
        />

        {/* Main Navigation Tabs */}
        <nav className="mx-auto mt-6 grid max-w-6xl grid-cols-2 gap-2 px-4 sm:px-8">
          <button
            type="button"
            className={`rounded-t-2xl py-3.5 font-extrabold text-base transition-all border-t border-x cursor-pointer ${
              activeTab === 'student'
                ? 'bg-[#0f1b2d] text-cyan-300 border-cyan-400/50 border-b-4 border-b-cyan-400 shadow-xl'
                : 'bg-[#0a1220]/80 text-slate-400 hover:text-slate-200 border-slate-800'
            }`}
            onClick={() => setActiveTab('student')}
          >
            مساحة الطالب
          </button>
          <button
            type="button"
            className={`rounded-t-2xl py-3.5 font-extrabold text-base transition-all border-t border-x cursor-pointer ${
              activeTab === 'parent'
                ? 'bg-[#0f1b2d] text-cyan-300 border-cyan-400/50 border-b-4 border-b-cyan-400 shadow-xl'
                : 'bg-[#0a1220]/80 text-slate-400 hover:text-slate-200 border-slate-800'
            }`}
            onClick={() => setActiveTab('parent')}
          >
            مساحة ولي الأمر
          </button>
        </nav>

        {/* Main View Area */}
        <main className="mx-auto max-w-6xl px-4 pb-12 sm:px-8">
          {activeTab === 'student' && (
            <StudentSpace
              studentData={studentData}
              publicData={publicData}
              requestedTab={requestedStudentTab}
              onRefresh={loadStudent}
              onOpenMedia={(c) => setActiveMedia(c)}
              onStartExam={(e) => setActiveExam(e)}
              onOpenAuthModal={handleLoginClick}
              onSwitchToTeacher={async () => {
                await loadTeacher();
                setActiveTab('teacher');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onLogout={() => {
                tokens.student = '';
                setStudentData(null);
              }}
            />
          )}

          {activeTab === 'parent' && (
            <ParentSpace
              parentData={parentData}
              onRefresh={loadParent}
              onLogout={() => {
                tokens.parent = '';
                setParentData(null);
              }}
            />
          )}

          {activeTab === 'teacher' && (
            <TeacherSpace
              teacherData={teacherData}
              onRefresh={loadTeacher}
              onUpdatePublic={loadPublic}
              onLogout={() => {
                tokens.teacher = '';
                setTeacherData(null);
                setActiveTab('student');
              }}
              onBackToStudent={() => setActiveTab('student')}
            />
          )}
        </main>
      </div>

      {/* Floating Smart AI Assistant (System 8 & 9) with strict Anti-Cheat guard during exams */}
      {publicData?.showAiAssistant !== false && (
        <FloatingAiAssistant
          role={activeTab}
          isExamActive={!!activeExam}
          studentName={studentData?.profile?.name}
        />
      )}

      {/* Floating Messenger between Student/Parent and Teacher (System 7) */}
      <FloatingChat
        studentProfile={studentData?.profile}
        parentData={parentData}
      />

      {/* Social Media Links & Learn Web Enter Button Footer */}
      <Footer socialLinks={publicData?.socialLinks} />

      {/* Dedicated Auth Modal (The ONLY way to log in as requested) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        publicData={publicData}
        onOpenSubjectSettings={() => setIsSubjectSettingsOpen(true)}
      />

      <SubjectSettingsModal
        isOpen={isSubjectSettingsOpen}
        onClose={() => setIsSubjectSettingsOpen(false)}
        onSave={() => loadPublic()}
      />

      {/* Media Viewer Modal */}
      {activeMedia && (
        <MediaViewer
          content={activeMedia}
          role={activeTab === 'teacher' ? 'teacher' : 'student'}
          profile={studentData?.profile}
          onClose={() => setActiveMedia(null)}
        />
      )}

      {/* Exam Modal */}
      {activeExam && (
        <ExamModal
          exam={activeExam}
          profile={studentData?.profile}
          onClose={() => setActiveExam(null)}
          onSuccess={(score, total) => {
            setActiveExam(null);
            loadStudent();
            setToastMessage(
              score !== null
                ? `تم تصحيح الامتحان بنجاح: ${score} من ${total}`
                : 'تم إرسال إجاباتك بنجاح للأستاذ للتصحيح.'
            );
          }}
        />
      )}

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[99999] max-w-md w-full px-4 animate-bounce">
          <div className="bg-[#111f36]/95 border border-cyan-400 text-white rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-3 backdrop-blur-md">
            <span className="text-sm font-bold leading-relaxed">{toastMessage}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800/60"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Offline Mode Connectivity Indicator */}
      <OfflineIndicator />
    </div>
  );
}

export default App;
