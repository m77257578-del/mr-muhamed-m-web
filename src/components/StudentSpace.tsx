import React, { useState } from 'react';
import {
  StudentData,
  Course,
  CourseContentItem,
  Exam,
  PublicData,
} from '../types';
import { apiRequest } from '../services/api';
import { StudentWallet } from './StudentWallet';
import { QRCodeView } from './QRCodeView';
import { StudentAnalyticsDashboard } from './StudentAnalyticsDashboard';
import { AboutUsSection } from './AboutUsSection';
import { SubjectInteractiveTools } from './SubjectInteractiveTools';
import { PlatformStoreSection } from './PlatformStoreSection';
import { PaymentGatewaysSection } from './PaymentGatewaysSection';
import { ArticlesSection } from './ArticlesSection';
import { TopStudentsSection } from './TopStudentsSection';
import { SocialDock } from './SocialDock';
import { StudyPlanner } from './StudyPlanner';
import { PWAInstallButton } from './PWAInstallButton';
import {
  Calendar,
  BookOpen,
  Video,
  FileText,
  MessageCircle,
  Key,
  ArrowRight,
  Sparkles,
  Trophy,
  ShoppingBag,
  Globe,
  PhoneCall,
  User,
  Award,
  Bell,
  Wallet,
  CheckCircle2,
  AlertCircle,
  FileQuestion,
  CreditCard,
  ExternalLink,
  Edit3,
  TrendingUp,
  Target,
  BarChart3,
  Lock,
  Phone,
  MapPin,
  HeartHandshake,
  ShieldCheck,
  SendHorizontal,
  Layers,
  MessageSquare,
  Loader2,
  Bot,
  Search,
  Paperclip,
  Play,
  Download,
  CheckSquare,
} from 'lucide-react';

interface StudentSpaceProps {
  studentData: StudentData | null;
  publicData: PublicData | null;
  onRefresh: () => Promise<void>;
  onOpenMedia: (content: CourseContentItem) => void;
  onStartExam: (exam: Exam) => void;
  onSwitchToTeacher: () => void;
  onLogout: () => void;
  onOpenAuthModal?: () => void;
  requestedTab?: 'courses' | 'achievements' | 'exams' | 'live' | 'interactive-tools' | 'wallet' | 'notices' | 'messages' | 'profile' | 'video-hub' | 'study-planner';
}

const WA_ADMIN_PHONE = '201024889921';
const waLink = (msg: string) =>
  `https://wa.me/${WA_ADMIN_PHONE}?text=${encodeURIComponent(msg)}`;

const daysLeft = (d?: string) => {
  if (!d) return 0;
  return Math.max(0, Math.ceil((new Date(d).getTime() - Date.now()) / 864e5));
};

const formatDate = (d: string) => new Date(d).toLocaleDateString('ar-EG');

export const StudentSpace: React.FC<StudentSpaceProps> = ({
  studentData,
  publicData,
  onRefresh,
  onOpenMedia,
  onStartExam,
  onLogout,
  onOpenAuthModal,
  requestedTab,
}) => {
  // Navigation Tabs for Logged-In Student
  const [activeTab, setActiveTab] = useState<'courses' | 'achievements' | 'exams' | 'live' | 'interactive-tools' | 'wallet' | 'notices' | 'messages' | 'profile' | 'video-hub' | 'study-planner'>('courses');

  React.useEffect(() => {
    if (requestedTab) {
      setActiveTab(requestedTab);
    }
  }, [requestedTab]);

  // Notifications Filter State
  const [notifCategoryFilter, setNotifCategoryFilter] = useState<'all' | 'content' | 'exam' | 'live' | 'result'>('all');

  // Course Filter & Detail View
  const [courseFilter, setCourseFilter] = useState<'all' | 'mine' | 'open' | 'free'>('all');
  const [openedCourseId, setOpenedCourseId] = useState<string>('');

  // Course Code Activation Form
  const [courseCodeInputs, setCourseCodeInputs] = useState<Record<string, string>>({});
  const [codeStatuses, setCodeStatuses] = useState<Record<string, { msg: string; ok: boolean }>>({});
  const [showCodeInputForCourse, setShowCodeInputForCourse] = useState<string | null>(null);

  // General Subscription Activation Code
  const [generalCode, setGeneralCode] = useState('');
  const [generalCodeStatus, setGeneralCodeStatus] = useState<{ msg: string; ok: boolean } | null>(null);

  // Direct Wallet Course Purchase Loading & Status
  const [purchasingCourseId, setPurchasingCourseId] = useState<string | null>(null);
  const [purchaseSuccessMsg, setPurchaseSuccessMsg] = useState<string | null>(null);

  // Messaging Form State
  const [messageText, setMessageText] = useState('');
  const [messageLoading, setMessageLoading] = useState(false);
  const [messageStatus, setMessageStatus] = useState<string | null>(null);

  // Appeal on Exam Result
  const [appealReasons, setAppealReasons] = useState<Record<string, string>>({});
  const [appealLoading, setAppealLoading] = useState<string | null>(null);
  const [appealStatus, setAppealStatus] = useState<Record<string, string>>({});

  // Profile Edit State (إمكانية الطالب يغير معلوماته)
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(studentData?.profile?.name || '');
  const [editGov, setEditGov] = useState(studentData?.profile?.governorate || '');
  const [editParentName, setEditParentName] = useState(studentData?.profile?.parentName || '');
  const [editParentPhone, setEditParentPhone] = useState(studentData?.profile?.parentPhone || '');
  const [editPassword, setEditPassword] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // AI Generated Exam State
  const [isGeneratingExam, setIsGeneratingExam] = useState(false);

  // 1. Direct Course Purchase From Wallet Balance
  const handleBuyCourseFromWallet = async (course: Course) => {
    if (!studentData) return;
    const currentBal = Number(studentData.profile.walletBalance) || 0;
    const price = Number(course.price) || 0;

    if (currentBal < price) {
      alert(`رصيد محفظتك (${currentBal} ج.م) لا يكفي لشراء كورس "${course.title}" (${price} ج.م). يرجى شحن محفظتك أولاً.`);
      setActiveTab('wallet');
      return;
    }

    const confirmBuy = window.confirm(
      `هل أنت متأكد من رغبتك في شراء كورس "${course.title}"؟\nسيتم خصم ${price} جنيه من رصيدك الحالي (${currentBal} ج.م) وتفعيل الكورس فوراً.`
    );
    if (!confirmBuy) return;

    setPurchasingCourseId(course.id);
    setPurchaseSuccessMsg(null);
    try {
      const res = await apiRequest('student', '/api/student/wallet/buy-course', {
        courseId: course.id,
      });
      setPurchaseSuccessMsg(`✅ تم شراء واشتراك كورس "${course.title}" بنجاح! رصيدك المتبقي: ${res.walletBalance} ج.م.`);
      await onRefresh();
      setOpenedCourseId(course.id);
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء إتمام عملية الشراء من المحفظة');
    } finally {
      setPurchasingCourseId(null);
    }
  };

  // 2. Course Code Redeem
  const handleRedeemCourseCode = async (courseId?: string) => {
    const code = courseId ? courseCodeInputs[courseId] : generalCode;
    if (!code || !code.trim()) return;

    try {
      const res = await apiRequest('student', '/api/student/redeem', { code: code.trim() });
      const msg = res.course
        ? `تم تفعيل كورس ${res.course} بنجاح حتى ${formatDate(res.expiresAt)}.`
        : 'تم تفعيل الاشتراك العام بنجاح.';

      if (courseId) {
        setCodeStatuses({ ...codeStatuses, [courseId]: { msg, ok: true } });
        setCourseCodeInputs({ ...courseCodeInputs, [courseId]: '' });
      } else {
        setGeneralCodeStatus({ msg, ok: true });
        setGeneralCode('');
      }
      await onRefresh();
    } catch (err: any) {
      const errorMsg = err.message || 'الكود غير صحيح أو مستخدم';
      if (courseId) {
        setCodeStatuses({ ...codeStatuses, [courseId]: { msg: errorMsg, ok: false } });
      } else {
        setGeneralCodeStatus({ msg: errorMsg, ok: false });
      }
    }
  };

  // 3. Send Message to Teacher
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    setMessageLoading(true);
    setMessageStatus(null);
    try {
      await apiRequest('student', '/api/student/message', { text: messageText.trim() });
      setMessageText('');
      setMessageStatus('تم إرسال رسالتك للأستاذ بنجاح.');
      await onRefresh();
    } catch (err: any) {
      setMessageStatus(err.message || 'تعذر إرسال الرسالة');
    } finally {
      setMessageLoading(false);
    }
  };

  // 4. Send Appeal on Result
  const handleSendAppeal = async (resultId: string) => {
    const reason = appealReasons[resultId];
    if (!reason || !reason.trim()) {
      alert('يرجى كتابة سبب التظلم أولاً');
      return;
    }
    setAppealLoading(resultId);
    try {
      await apiRequest('student', '/api/student/appeal', { resultId, reason: reason.trim() });
      setAppealStatus({ ...appealStatus, [resultId]: 'تم إرسال التظلم للأستاذ للمراجعة.' });
      await onRefresh();
    } catch (err: any) {
      setAppealStatus({ ...appealStatus, [resultId]: err.message || 'تعذر إرسال التظلم' });
    } finally {
      setAppealLoading(null);
    }
  };

  // 5. Update Profile Handler (إمكانية الطالب يغير معلوماته)
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg(null);
    try {
      await apiRequest('student', '/api/student/profile', {
        name: editName.trim(),
        governorate: editGov.trim(),
        parentName: editParentName.trim(),
        parentPhone: editParentPhone.trim(),
        password: editPassword.trim() || undefined,
      });
      setProfileMsg({ text: 'تم تحديث بياناتك بنجاح!', ok: true });
      setEditPassword('');
      setIsEditingProfile(false);
      await onRefresh();
    } catch (err: any) {
      setProfileMsg({ text: err.message || 'فشل تحديث البيانات', ok: false });
    } finally {
      setProfileLoading(false);
    }
  };

  // 6. Generate Exam from Mistakes
  const handleGenerateMistakesExam = async () => {
    setIsGeneratingExam(true);
    try {
      const res = await apiRequest('student', '/api/student/generate-mistakes-exam');
      if (res.exam) {
        onStartExam(res.exam);
      }
    } catch (err: any) {
      alert(err.message || 'فشل توليد امتحان المراجعة');
    } finally {
      setIsGeneratingExam(false);
    }
  };

  // Visitor Navigation Tab State
  const [visitorTab, setVisitorTab] = useState<
    'courses' | 'top-students' | 'store' | 'tools' | 'about' | 'gateways' | 'articles' | 'contact'
  >('courses');
  const [visitorGradeFilter, setVisitorGradeFilter] = useState<string>('الكل');
  const [visitorSearchTerm, setVisitorSearchTerm] = useState<string>('');

  // ==========================================
  // CASE 1: VISITOR / NOT LOGGED IN
  // Full Tabbed Interface (نظام التبويبات الشامل وإلغاء نظام الصفحة الواحدة)
  // ==========================================
  if (!studentData) {
    const publicCourses = publicData?.courses || [];
    const filteredPublicCourses = publicCourses.filter((course) => {
      const matchGrade =
        visitorGradeFilter === 'الكل' ||
        course.grade.includes(visitorGradeFilter) ||
        course.grade === 'كل الصفوف';
      const matchSearch =
        !visitorSearchTerm.trim() ||
        course.title.toLowerCase().includes(visitorSearchTerm.toLowerCase()) ||
        (course.description && course.description.toLowerCase().includes(visitorSearchTerm.toLowerCase()));
      return matchGrade && matchSearch;
    });

    const visitorTabs = [
      { id: 'courses', label: 'الكورسات المتاحة', icon: BookOpen, badge: `${publicCourses.length}` },
      { id: 'top-students', label: 'لوحة شرف المتفوقين', icon: Trophy, badge: 'فخرنا 🌟', highlight: true },
      { id: 'store', label: 'متجر الكتب والمذكرات', icon: ShoppingBag, badge: `${(publicData?.books || []).length}` },
      { id: 'tools', label: 'المعامل والأدوات التفاعلية', icon: Sparkles },
      { id: 'about', label: 'عن المنصة والأستاذ', icon: Award },
      { id: 'gateways', label: 'طرق الدفع والشحن', icon: CreditCard },
      { id: 'articles', label: 'المقالات والمدونة', icon: FileText, badge: `${(publicData?.articles || []).length}` },
      { id: 'contact', label: 'تواصل معنا والروابط', icon: MessageCircle },
    ];

    return (
      <div className="rounded-b-[2rem] bg-[#0c1626] border border-t-0 border-blue-500/20 p-4 sm:p-8 space-y-6 shadow-2xl text-right">
        {/* Top Welcome & Quick Access Bar */}
        <section className="panel border border-blue-500/25 bg-gradient-to-r from-[#0e1f38] via-[#091528] to-[#0a1224] p-5 sm:p-7 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="space-y-2 text-center md:text-right">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-400/40 text-cyan-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>مرحباً بك في منصة ام ويب • الأستاذ محمد عبد المقصود</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-white leading-tight">
              بوابتك نحو التفوق الدراسي والدرجة النهائية
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              استكشف الكورسات، لوحة الشرف، المتجر والمعامل التفاعلية عبر التبويبات أدناه. للاشتراك وحل الواجبات، سجل دخولك الآن.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="btn-primary py-3 px-6 text-xs sm:text-sm font-extrabold flex items-center gap-2 rounded-xl shadow-lg hover:shadow-cyan-500/25 cursor-pointer"
            >
              <User className="w-4 h-4" />
              <span>تسجيل الدخول / إنشاء حساب</span>
              <ArrowRight className="w-4 h-4 rotate-180" />
            </button>
          </div>
        </section>

        {/* Tabbed Navigation Bar (نظام تبويبات حديث واستجابة كاملة) */}
        <div className="sticky top-2 z-20 bg-[#091222]/95 backdrop-blur-md p-2 rounded-2xl border border-blue-500/30 shadow-2xl">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
            {visitorTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = visitorTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setVisitorTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? tab.highlight
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 shadow-lg shadow-amber-500/25 ring-2 ring-yellow-400/50 scale-[1.02]'
                        : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20 ring-2 ring-cyan-400/40 scale-[1.02]'
                      : tab.highlight
                      ? 'bg-amber-950/40 text-amber-300 hover:bg-amber-900/50 border border-amber-500/30'
                      : 'bg-[#111f36] text-slate-300 hover:text-white hover:bg-[#162744] border border-blue-500/20'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? (tab.highlight ? 'text-slate-950' : 'text-cyan-200') : tab.highlight ? 'text-amber-400' : 'text-cyan-400'}`} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                        isActive
                          ? tab.highlight
                            ? 'bg-black/30 text-amber-100'
                            : 'bg-black/30 text-cyan-100'
                          : tab.highlight
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-blue-900/60 text-cyan-300 border border-cyan-500/30'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* TAB 1: COURSES CATALOG */}
        {visitorTab === 'courses' && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-blue-500/20">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-cyan-400" />
                  <span>الكورسات والدورات التعليمية المتاحة</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  تصفح المناهج وشروحات الثانوية والإعدادية، وسجل دخولك لبدء المشاهدة فوراً
                </p>
              </div>

              {/* Course Search */}
              <div className="w-full sm:w-64">
                <input
                  type="text"
                  placeholder="ابحث عن كورس أو درس..."
                  value={visitorSearchTerm}
                  onChange={(e) => setVisitorSearchTerm(e.target.value)}
                  className="input-field text-xs py-2 w-full"
                />
              </div>
            </div>

            {/* Grade Filter Badges */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {['الكل', 'الصف الثالث الثانوي', 'الصف الثاني الثانوي', 'الصف الأول الثانوي', 'المرحلة الإعدادية'].map((grade) => (
                <button
                  key={grade}
                  type="button"
                  onClick={() => setVisitorGradeFilter(grade)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    visitorGradeFilter === grade
                      ? 'bg-cyan-500 text-slate-950 font-black shadow-md'
                      : 'bg-[#111f36] text-slate-300 hover:text-white border border-blue-500/20'
                  }`}
                >
                  {grade}
                </button>
              ))}
            </div>

            {/* Courses Grid */}
            {filteredPublicCourses.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredPublicCourses.map((c) => (
                  <div
                    key={c.id}
                    className="card bg-[#0f1b2d] border border-blue-500/20 hover:border-cyan-400/50 rounded-2xl overflow-hidden flex flex-col justify-between shadow-xl transition-all duration-300 hover:shadow-cyan-500/10 group"
                  >
                    <div>
                      {/* Course Image or Gradient Header */}
                      <div className="h-44 bg-gradient-to-br from-blue-900 via-slate-900 to-[#0c182c] relative overflow-hidden flex items-center justify-center p-4">
                        {c.imageUrl ? (
                          <img
                            src={c.imageUrl}
                            alt={c.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="text-center space-y-2">
                            <div className="w-14 h-14 mx-auto rounded-2xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shadow-inner">
                              <BookOpen className="w-7 h-7" />
                            </div>
                            <span className="text-xs font-bold text-slate-300 line-clamp-1">{c.grade}</span>
                          </div>
                        )}
                        <span className="absolute top-3 right-3 badge-pill bg-black/60 backdrop-blur-md text-cyan-300 border-cyan-500/40 text-[11px] font-bold">
                          {c.grade}
                        </span>
                        {c.isFree && (
                          <span className="absolute top-3 left-3 badge-pill bg-emerald-950/80 text-emerald-300 border-emerald-500/50 text-[11px] font-bold">
                            مجاني 🎁
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-5 space-y-3">
                        <h4 className="text-base sm:text-lg font-black text-white group-hover:text-cyan-300 transition-colors line-clamp-2">
                          {c.title}
                        </h4>
                        {c.description && (
                          <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                            {c.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="p-5 pt-0 border-t border-blue-500/10 mt-3 space-y-3">
                      <div className="flex items-center justify-between text-xs pt-3">
                        <span className="text-slate-400">سعر الاشتراك:</span>
                        <span className="text-base font-black text-amber-400">
                          {c.isFree ? 'مجاناً بالكامل' : `${c.price} ج.م`}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={onOpenAuthModal}
                        className="btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2 rounded-xl cursor-pointer"
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>تسجيل الدخول للاشتراك</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="panel bg-[#0f1b2d] border border-blue-500/20 p-10 text-center rounded-2xl space-y-3">
                <p className="text-sm text-slate-300">لا توجد كورسات مطابقة لخيارات البحث المحددة.</p>
                <button
                  type="button"
                  onClick={() => {
                    setVisitorGradeFilter('الكل');
                    setVisitorSearchTerm('');
                  }}
                  className="btn-cyan text-xs py-2 px-4 rounded-xl font-bold cursor-pointer"
                >
                  إعادة ضبط البحث
                </button>
              </div>
            )}
          </section>
        )}

        {/* TAB 2: TOP STUDENTS (لوحة شرف المتفوقين) */}
        {visitorTab === 'top-students' && (
          <TopStudentsSection topStudents={publicData?.topStudents || []} />
        )}

        {/* TAB 3: STORE (متجر الكتب والمذكرات) */}
        {visitorTab === 'store' && (
          <PlatformStoreSection
            courses={publicCourses}
            books={publicData?.books || []}
            studentData={null}
            gateways={publicData?.gateways || []}
            onOpenAuthModal={onOpenAuthModal}
            onRefresh={onRefresh}
          />
        )}

        {/* TAB 4: INTERACTIVE TOOLS & SCIENCE LAB (الأدوات والمعامل التفاعلية) */}
        {visitorTab === 'tools' && (
          <SubjectInteractiveTools
            currentSubject={publicData?.aboutUs?.subject}
            gradeToolsConfig={publicData?.gradeInteractiveToolsConfig}
            studentVisibleTools={publicData?.studentVisibleTools || publicData?.activeTeacher?.toolsConfig}
          />
        )}

        {/* TAB 5: ABOUT US (عن المنصة والأستاذ) */}
        {visitorTab === 'about' && (
          <AboutUsSection aboutUs={publicData?.aboutUs} />
        )}

        {/* TAB 6: PAYMENT GATEWAYS (طرق الدفع والشحن) */}
        {visitorTab === 'gateways' && (
          <PaymentGatewaysSection gateways={publicData?.gateways || []} />
        )}

        {/* TAB 7: ARTICLES (المقالات التعليمية) */}
        {visitorTab === 'articles' && (
          <ArticlesSection articles={publicData?.articles || []} />
        )}

        {/* TAB 8: CONTACT US & OFFICIAL SOCIAL CHANNELS (تواصل معنا وروابطنا الرسمية بأيقونة المنصة الجديدة) */}
        {visitorTab === 'contact' && (
          <section className="space-y-8">
            {/* Platform Branding Hub Card */}
            <div className="card bg-gradient-to-br from-[#0e1d35] via-[#091528] to-[#120f26] border border-cyan-500/30 p-6 sm:p-8 rounded-3xl shadow-2xl relative overflow-hidden">
              <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-right">
                {/* Official Cropped App Logo Icon */}
                <div className="relative group shrink-0">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-[#030914] border-2 border-cyan-400/50 shadow-2xl p-1.5 flex items-center justify-center overflow-hidden ring-4 ring-cyan-500/20 group-hover:border-cyan-300 transition-all">
                    <img
                      src="/app-icon-192.png"
                      alt="أيقونة منصة ام ويب"
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  </div>
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-cyan-500 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full whitespace-nowrap shadow-md">
                    الأيقونة الرسمية
                  </span>
                </div>

                <div className="space-y-2 flex-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-400/30 text-cyan-300 text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>ام ويب • M WEB</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white">
                    منصة الأستاذ محمد عبد المقصود
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                    منظومة تعليمية متكاملة لتدريس ومراجعة اللغة العربية ومناهج الثانوية العامة والإعدادية، بنية تحتية رقمية ذكية للتفوق والدرجات النهائية.
                  </p>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2">
                    <a
                      href={waLink('السلام عليكم أستاذ محمد، أود الاستفسار عن تفاصيل الاشتراك في المنصة')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary py-2.5 px-5 text-xs font-black flex items-center gap-2 rounded-xl shadow-lg hover:shadow-cyan-500/20"
                    >
                      <MessageCircle className="w-4 h-4 text-emerald-400" />
                      <span>محادثة واتساب مباشرة ({WA_ADMIN_PHONE})</span>
                    </a>

                    <a
                      href="tel:01024889921"
                      className="btn-cyan py-2.5 px-5 text-xs font-black flex items-center gap-2 rounded-xl shadow-md"
                    >
                      <PhoneCall className="w-4 h-4" />
                      <span>اتصال هاتفي سريع</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Official Social Links Dock matching screenshot */}
            <div className="card bg-gradient-to-b from-[#0b1424] to-[#070d18] border border-cyan-500/25 p-6 sm:p-8 rounded-3xl shadow-2xl space-y-6 text-center">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 text-xs font-bold">
                  <Globe className="w-3.5 h-3.5" />
                  <span>روابطنا وقنواتنا الرسمية الموثقة</span>
                </div>
                <h4 className="text-xl sm:text-2xl font-black text-white">تابعنا عبر جميع منصات التواصل</h4>
                <p className="text-xs sm:text-sm text-slate-400">اضغط على أيقونة المنصة للانتقال المباشر للمحتوى والشروحات الرسمية</p>
              </div>

              {/* Horizontal Social Dock Bar */}
              <div className="py-2 flex justify-center">
                <SocialDock socialLinks={publicData?.socialLinks} />
              </div>
            </div>

            {/* Quick Contact Form */}
            <div className="card bg-[#0f1b2d] border border-blue-500/20 p-6 rounded-2xl space-y-4">
              <h4 className="text-sm font-black text-white flex items-center gap-2">
                <SendHorizontal className="w-4 h-4 text-cyan-400" />
                <span>إرسال استفسار مباشر للأستاذ محمد عبد المقصود</span>
              </h4>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const name = (form.elements.namedItem('vName') as HTMLInputElement).value;
                  const phone = (form.elements.namedItem('vPhone') as HTMLInputElement).value;
                  const message = (form.elements.namedItem('vMsg') as HTMLTextAreaElement).value;
                  if (!name || !message) return;
                  try {
                    await apiRequest('student', '/api/support/message', { name, phone, text: message, role: 'زائر' });
                    alert('تم إرسال رسالتك للأستاذ بنجاح وسيتواصل معك قريباً!');
                    form.reset();
                  } catch (err: any) {
                    alert(err.message || 'تعذر إرسال الرسالة');
                  }
                }}
                className="grid gap-3 sm:grid-cols-2"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">اسمك الكريم</label>
                  <input
                    name="vName"
                    type="text"
                    required
                    placeholder="مثال: أحمد محمود"
                    className="input-field text-xs py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">رقم الهاتف أو الواتساب</label>
                  <input
                    name="vPhone"
                    type="tel"
                    dir="ltr"
                    required
                    placeholder="010XXXXXXXX"
                    className="input-field text-xs py-2"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1">رسالتك أو استفسارك</label>
                  <textarea
                    name="vMsg"
                    rows={3}
                    required
                    placeholder="اكتب استفسارك بالتفصيل..."
                    className="input-field text-xs"
                  />
                </div>
                <div className="sm:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    className="btn-primary py-2.5 px-6 text-xs font-black flex items-center gap-2 rounded-xl cursor-pointer"
                  >
                    <SendHorizontal className="w-4 h-4" />
                    <span>إرسال الرسالة الآن</span>
                  </button>
                </div>
              </form>
            </div>
          </section>
        )}

        {/* Notices Alert Card at Footer */}
        {publicData?.name && (
          <section className="panel bg-[#091222] border border-blue-500/20 p-4 rounded-xl flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Bell className="w-4 h-4 text-amber-400 shrink-0" />
              <span>ملاحظة: يمكنك شحن رصيد محفظتك عبر فودافون كاش أو إنستا باي والاشتراك الفوري في أي كورس بمجرد تسجيل الدخول.</span>
            </div>
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="text-cyan-400 hover:text-cyan-300 font-bold whitespace-nowrap underline cursor-pointer"
            >
              تسجيل حساب جديد
            </button>
          </section>
        )}
      </div>
    );
  }

  // ==========================================
  // CASE 2: LOGGED-IN STUDENT DASHBOARD
  // ==========================================
  const p = studentData.profile;
  const currentWalletBalance = Number(p.walletBalance) || 0;

  // Real Progress Calculation for Achievements (بيقيس مستوى تقدمه الحقيقي)
  const totalExamsCount = studentData.exams.length;
  const gradedResults = studentData.results.filter((r) => r.status === 'graded');
  const completedExamsCount = gradedResults.length;
  const examCompletionRate = totalExamsCount > 0 ? Math.round((completedExamsCount / totalExamsCount) * 100) : 0;

  const totalPointsAchieved = gradedResults.reduce((acc, r) => acc + (r.score || 0), 0);
  const totalPointsPossible = gradedResults.reduce((acc, r) => acc + (r.total || 0), 0);
  const averagePercentage = totalPointsPossible > 0 ? Math.round((totalPointsAchieved / totalPointsPossible) * 100) : 0;

  const getStudentLevel = (pct: number) => {
    if (completedExamsCount === 0) return { title: 'طالب في بداية الطريق', badge: 'مبتدئ 🚀', color: 'text-cyan-400', border: 'border-cyan-500/30', bg: 'bg-cyan-950/40' };
    if (pct >= 90) return { title: 'طالب عبقري ومتميز', badge: 'مستوى ماسي 💎', color: 'text-cyan-300', border: 'border-cyan-400/50', bg: 'bg-cyan-950/60' };
    if (pct >= 80) return { title: 'طالب متفوق وبارع', badge: 'مستوى ذهبي 🥇', color: 'text-amber-400', border: 'border-amber-400/50', bg: 'bg-amber-950/60' };
    if (pct >= 65) return { title: 'طالب جيد جداً ومجتهد', badge: 'مستوى فضي 🥈', color: 'text-slate-200', border: 'border-slate-400/50', bg: 'bg-slate-800/60' };
    return { title: 'طالب يثابر ويتحسن', badge: 'مستوى برونزي 🥉', color: 'text-orange-400', border: 'border-orange-500/50', bg: 'bg-orange-950/60' };
  };

  const levelInfo = getStudentLevel(averagePercentage);

  // Filtered Courses
  const filteredCourses = studentData.courses.filter((c) => {
    if (courseFilter === 'mine') return c.active;
    if (courseFilter === 'open') return !c.active && !c.isFree;
    if (courseFilter === 'free') return c.isFree && !c.active;
    return true;
  });

  const selectedCourse = studentData.courses.find((c) => c.id === openedCourseId);

  return (
    <div className="rounded-b-[2rem] bg-[#0c1626] border border-t-0 border-blue-500/20 p-4 sm:p-8 space-y-6 shadow-2xl text-right">
      {/* Student Profile Header Bar */}
      <div className="panel border border-blue-500/25 flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-[#0e1e38] to-[#0a1324] p-5 rounded-2xl shadow-xl">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="badge-pill bg-cyan-950/60 text-cyan-300 border-cyan-400/30 text-xs font-bold">
              طالب مسجل
            </span>
            <span className="text-xs text-slate-400 font-bold">
              {p.grade}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white">
            {p.name}
          </h2>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
            <span>
              كود الطالب:{' '}
              <strong dir="ltr" className="font-mono text-cyan-300 font-extrabold bg-[#070e1c] px-2 py-0.5 rounded border border-blue-500/20">
                {p.code}
              </strong>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <span>رصيد المحفظة:</span>
              <strong className="text-emerald-400 font-black text-sm">
                {currentWalletBalance.toLocaleString('ar-EG')} ج.م
              </strong>
            </span>
          </div>
        </div>

        {/* Quick Top Actions */}
        <div className="flex items-center gap-2.5">
          <PWAInstallButton />
          <button
            type="button"
            onClick={() => setActiveTab('wallet')}
            className="btn-cyan btn-sm font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Wallet className="w-4 h-4" />
            <span>شحن المحفظة</span>
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="btn-red btn-sm font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <span>خروج</span>
          </button>
        </div>
      </div>

      {/* Platform Security & Anti-Leak Active Shield */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#09152a] via-[#0b1b36] to-[#09152a] border border-cyan-500/25 text-[11px] text-slate-300 shadow-md">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1.5 font-black text-cyan-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>نظام الحماية والأمان النشط:</span>
          </span>
          <span className="inline-flex items-center gap-1 text-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>الحساب مقترن بهذا الجهاز 🔒</span>
          </span>
          <span className="inline-flex items-center gap-1 text-slate-200">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span>علامة مائية ديناميكية مانعة للتسريب 🛡️</span>
          </span>
          <span className="inline-flex items-center gap-1 text-slate-200">
            <span className="w-2 h-2 rounded-full bg-purple-400"></span>
            <span>مراقبة الامتحانات وحظر الغش 🎯</span>
          </span>
        </div>
        <span className="text-[10px] text-cyan-400/80 font-mono bg-[#060c18] px-2 py-0.5 rounded border border-cyan-500/20">
          حماية أمنية مشفرة
        </span>
      </div>

      {/* Global Purchase Success Alert */}
      {purchaseSuccessMsg && (
        <div className="rounded-xl bg-emerald-950/80 border border-emerald-500/50 p-4 text-xs font-bold text-emerald-200 flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{purchaseSuccessMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setPurchaseSuccessMsg(null)}
            className="text-emerald-400 hover:text-white font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* MAIN NAVIGATION TABS FOR STUDENT (100% Real Features) */}
      <div className="bg-[#0f1b2d] p-1.5 rounded-2xl border border-blue-500/20 shadow-xl overflow-x-auto scrollbar-none">
        <div className="flex gap-1.5 min-w-max">
          {[
            { id: 'courses', label: 'الكورسات والمحتوى', icon: BookOpen, count: studentData.courses.length },
            { id: 'study-planner', label: '📅 مخطط المذاكرة والمهام', icon: Calendar },
            { id: 'video-hub', label: '🎥 الفيديوهات وملحقاتها', icon: Play },
            { id: 'achievements', label: 'إنجازاتي ومستوى التقدم', icon: TrendingUp },
            { id: 'exams', label: 'الامتحانات والنتائج', icon: FileQuestion, count: studentData.exams.length },
            { id: 'live', label: 'بث جوجل ميت المباشر', icon: Video, count: studentData.liveSessions?.length || 0 },
            { id: 'interactive-tools', label: 'أدوات المادة التفاعلية', icon: Sparkles },
            { id: 'wallet', label: 'محفظتي وسجل الشحن', icon: Wallet },
            { id: 'notices', label: 'الإعلانات والدروس', icon: Bell, count: studentData.notices.length },
            { id: 'messages', label: 'رسائلي مع الأستاذ', icon: MessageCircle, count: studentData.messages.length },
            { id: 'profile', label: 'ملفي الشخصي وتعديل البيانات', icon: User },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setOpenedCourseId('');
                }}
                className={`py-3 px-4 rounded-xl font-extrabold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg border border-cyan-400/40'
                    : 'text-slate-300 hover:text-white hover:bg-[#11213b]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-cyan-400'}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-blue-950 text-cyan-300 border border-blue-500/30'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ================================================= */}
      {/* TAB 1: COURSES & COURSE CONTENT */}
      {/* ================================================= */}
      {activeTab === 'courses' && (
        <section className="space-y-6">
          {/* Active Live Google Meet Session Banner */}
          {studentData.liveSessions && studentData.liveSessions.length > 0 && (
            <div className="panel border border-red-500/40 bg-gradient-to-r from-red-950/80 via-[#180812] to-[#0c1626] p-4 sm:p-5 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
              <div className="space-y-1 text-right">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                  <h4 className="text-base font-black text-white flex items-center gap-2">
                    <span>🔴 بث مباشر جاري الآن عبر Google Meet!</span>
                  </h4>
                </div>
                <p className="text-xs font-bold text-red-200">
                  {studentData.liveSessions[0].title} — للصف {studentData.liveSessions[0].grade}
                </p>
                <p className="text-[11px] text-slate-300">
                  عند ضغطك على زر الانضمام، يتم توثيق اسمك ورقمك آلياً في كشف حضور البث لدى معلمك.
                </p>
              </div>

              <button
                type="button"
                onClick={async () => {
                  const s = studentData.liveSessions?.[0];
                  if (!s) return;
                  try {
                    await apiRequest('student', '/api/student/live-attend', { sessionId: s.id });
                    alert(`✅ تم توثيق حضورك آلياً في كشف حضور البث المباشر (${s.title}) بنجاح!\nجاري فتح Google Meet...`);
                  } catch (e) {
                    console.warn('Attendance sync', e);
                  } finally {
                    window.open(s.meetUrl, '_blank', 'noopener,noreferrer');
                  }
                }}
                className="btn-cyan py-3 px-6 text-xs sm:text-sm font-black flex items-center gap-2 rounded-xl shrink-0 cursor-pointer shadow-lg shadow-cyan-500/20"
              >
                <Video className="w-4 h-4 animate-bounce" />
                <span>الانضمام للبث وتوثيق الحضور الآلي</span>
              </button>

              <div className="flex gap-2 w-full sm:w-auto mt-2">
                <input
                  type="text"
                  placeholder="أدخل كود QR (إذا ظهر في البث)"
                  className="input-field text-xs w-full sm:w-48"
                  onChange={async (e) => {
                    const qr = e.target.value;
                    const s = studentData.liveSessions?.[0];
                    if (s && qr === s.id) {
                      try {
                        await apiRequest('student', '/api/student/live-attend-qr', { sessionId: s.id, qrCode: qr });
                        alert('✅ تم تسجيل حضورك يدوياً عبر كود QR بنجاح!');
                        e.target.value = '';
                      } catch (err: any) {
                        alert(err.message || 'فشل تسجيل الحضور');
                      }
                    }
                  }}
                />
              </div>
            </div>
          )}

          {/* Quick Code Activation Card */}
          <div className="panel border border-amber-500/25 bg-[#0f1b2d] p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-right">
              <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-400" />
                <span>معك كود تفعيل ورقي؟</span>
              </h4>
              <p className="text-xs text-slate-300">
                أدخل كود الكورس أو كود الاشتراك لتفعيله مباشرة دون خصم من المحفظة.
              </p>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <input
                type="text"
                dir="ltr"
                placeholder="XXXX-XXXX-XXXX"
                className="input-field text-xs font-mono uppercase w-full sm:w-48"
                value={generalCode}
                onChange={(e) => setGeneralCode(e.target.value)}
              />
              <button
                type="button"
                onClick={() => handleRedeemCourseCode()}
                className="btn-gold btn-sm shrink-0 cursor-pointer"
              >
                تفعيل الكود
              </button>
            </div>
          </div>
          {generalCodeStatus && (
            <p className={`text-xs font-bold ${generalCodeStatus.ok ? 'text-emerald-400' : 'text-red-400'}`}>
              {generalCodeStatus.msg}
            </p>
          )}

          {/* If viewing a single course's content */}
          {selectedCourse ? (
            <div className="panel bg-[#0f1b2d] border border-blue-500/20 p-5 rounded-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-blue-500/15 pb-4">
                <div>
                  <button
                    type="button"
                    onClick={() => setOpenedCourseId('')}
                    className="btn-gray btn-sm inline-flex items-center gap-1.5 font-bold mb-2 cursor-pointer"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>العودة لكل الكورسات</span>
                  </button>
                  <h3 className="text-xl sm:text-2xl font-black text-cyan-300">
                    {selectedCourse.title}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    {selectedCourse.description || 'محتويات ودروس ومذكرات الكورس'}
                  </p>
                </div>

                <span className="badge-pill bg-emerald-950/60 text-emerald-300 border-emerald-500/30 text-xs font-bold">
                  {selectedCourse.active ? `مفعّل (متبقي ${daysLeft(selectedCourse.expiresAt)} يوم)` : 'كورس متاح'}
                </span>
              </div>

              {/* Contents list */}
              <div className="space-y-6">
                <h4 className="font-bold text-sm text-white border-r-4 border-cyan-400 pr-3">محتويات الكورس والدروس</h4>
                
                {(() => {
                  const courseItems = studentData.content.filter((c) => c.courseId === selectedCourse.id);
                  if (courseItems.length === 0) {
                    return (
                      <p className="text-xs text-slate-400 p-4 bg-[#111f36] rounded-xl border border-blue-500/10">
                        لم يقم المعلم برفع محتويات داخل هذا الكورس حتى الآن.
                      </p>
                    );
                  }

                  // Group by lecture
                  const groups: Record<string, CourseContentItem[]> = {};
                  courseItems.forEach(item => {
                    const groupName = item.lecture || 'دروس عامة';
                    if (!groups[groupName]) groups[groupName] = [];
                    groups[groupName].push(item);
                  });

                  return Object.entries(groups).map(([lectureName, items]) => (
                    <div key={lectureName} className="space-y-3">
                      <div className="flex items-center gap-2 px-1">
                        <Layers className="w-4 h-4 text-cyan-400" />
                        <h5 className="font-black text-sm text-slate-200">{lectureName}</h5>
                      </div>
                      
                      <div className="grid gap-3">
                        {items.map((item) => (
                          <div
                            key={item.id}
                            className="card bg-[#111f36] flex flex-wrap items-center justify-between gap-3 p-4 border border-blue-500/15 rounded-xl hover:border-cyan-400/40 group/item transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2.5 rounded-lg bg-blue-950/60 border border-blue-500/30 text-cyan-400 group-hover/item:border-cyan-400/50 transition-colors">
                                {item.type === 'video' ? (
                                  <Video className="w-5 h-5" />
                                ) : (
                                  <FileText className="w-5 h-5" />
                                )}
                              </div>
                              <div>
                                <h5 className="font-bold text-sm text-white group-hover/item:text-cyan-300 transition-colors">{item.title}</h5>
                                <span className="text-[10px] text-slate-400 font-bold">
                                  {item.type === 'video' ? 'فيديو تعليمي' : item.type === 'note' ? 'مذكرة / ملف' : 'واجب منزلي'}
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => onOpenMedia(item)}
                              className="btn-primary btn-sm flex items-center gap-1.5 cursor-pointer shadow-sm"
                            >
                              <span>مشاهدة / فتح</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          ) : (
            // Courses Grid
            <div className="space-y-5">
              {/* Filter Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-xl font-black text-white">الكورسات الدراسية</h3>
                <div className="flex gap-1.5">
                  {(
                    [
                      ['all', 'الكل'],
                      ['mine', 'كورساتي المفعّلة'],
                      ['open', 'متاحة للشراء'],
                      ['free', 'مجانية'],
                    ] as const
                  ).map(([k, label]) => (
                    <button
                      key={k}
                      type="button"
                      className={`btn-sm text-xs font-bold cursor-pointer transition-all ${
                        courseFilter === k ? 'btn-primary' : 'btn-gray'
                      }`}
                      onClick={() => setCourseFilter(k)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredCourses.length ? (
                  filteredCourses.map((c) => {
                    const price = Number(c.price) || 0;
                    const canAfford = currentWalletBalance >= price;
                    const diff = price - currentWalletBalance;

                    return (
                      <article
                        key={c.id}
                        className="card bg-[#111f36] border border-blue-500/20 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-cyan-400/50 hover:shadow-xl transition-all group"
                      >
                        <div>
                          {/* Course Cover Image */}
                          <div className="overflow-hidden bg-[#091222] aspect-[16/9] relative border-b border-blue-500/20">
                            {c.imageUrl ? (
                              <img
                                src={c.imageUrl}
                                alt={c.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                loading="lazy"
                              />
                            ) : (
                              <div className="flex w-full h-full items-center justify-center bg-gradient-to-br from-blue-700 to-cyan-700 text-3xl font-black text-white">
                                <span>{c.title.slice(0, 2)}</span>
                              </div>
                            )}

                            {/* Status Badges */}
                            <span className="absolute top-2.5 right-2.5 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] font-bold text-cyan-300 border border-cyan-400/30">
                              {c.grade}
                            </span>

                            {c.active ? (
                              <span className="absolute top-2.5 left-2.5 bg-emerald-600 text-white px-2.5 py-1 rounded-lg text-[11px] font-bold shadow">
                                ✅ مفعّل ({daysLeft(c.expiresAt)} يوم)
                              </span>
                            ) : c.isFree ? (
                              <span className="absolute top-2.5 left-2.5 bg-cyan-600 text-white px-2.5 py-1 rounded-lg text-[11px] font-bold shadow">
                                مجاني
                              </span>
                            ) : null}
                          </div>

                          {/* Info */}
                          <div className="p-4 sm:p-5 space-y-2">
                            <h4 className="font-black text-base sm:text-lg text-white group-hover:text-cyan-300 transition-colors">
                              {c.title}
                            </h4>
                            <p className="text-xs font-bold text-slate-300 flex items-center gap-2">
                              <span className="text-emerald-400 text-sm font-black">
                                {price.toLocaleString('ar-EG')} ج.م
                              </span>
                              <span>•</span>
                              <span>{c.days} يوم صلاحية</span>
                            </p>
                            {c.description && (
                              <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                                {c.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Actions & Subscription via Wallet */}
                        <div className="p-4 sm:p-5 pt-0 space-y-2.5 border-t border-blue-500/10 mt-2">
                          {c.active || c.isFree ? (
                            <button
                              type="button"
                              onClick={() => setOpenedCourseId(c.id)}
                              className="btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2 rounded-xl cursor-pointer"
                            >
                              <span>فتح محتوى الكورس</span>
                              <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                            </button>
                          ) : (
                            <div className="space-y-2">
                              {/* PRIMARY ACTION: Subscribe directly from wallet balance */}
                              {canAfford ? (
                                <button
                                  type="button"
                                  disabled={purchasingCourseId === c.id}
                                  onClick={() => handleBuyCourseFromWallet(c)}
                                  className="btn-emerald w-full py-2.5 text-xs font-black flex items-center justify-center gap-2 rounded-xl cursor-pointer shadow-md hover:shadow-emerald-500/20"
                                >
                                  <CreditCard className="w-4 h-4" />
                                  <span>
                                    {purchasingCourseId === c.id
                                      ? 'جاري تفعيل الاشتراك...'
                                      : `اشترك الآن من المحفظة (خصم ${price} ج.م)`}
                                  </span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setActiveTab('wallet')}
                                  className="btn-cyan w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2 rounded-xl cursor-pointer"
                                >
                                  <Wallet className="w-4 h-4" />
                                  <span>شحن المحفظة للاشتراك (ينقصك {diff} ج)</span>
                                </button>
                              )}

                              {/* SECONDARY ACTION: Redeem Course Code */}
                              <div className="pt-1">
                                {showCodeInputForCourse === c.id ? (
                                  <div className="space-y-1.5 bg-[#091222] p-2 rounded-xl border border-blue-500/20">
                                    <div className="flex gap-1.5">
                                      <input
                                        type="text"
                                        dir="ltr"
                                        placeholder="كود الكورس"
                                        className="input-field text-xs py-1.5 font-mono uppercase"
                                        value={courseCodeInputs[c.id] || ''}
                                        onChange={(e) =>
                                          setCourseCodeInputs({
                                            ...courseCodeInputs,
                                            [c.id]: e.target.value,
                                          })
                                        }
                                      />
                                      <button
                                        type="button"
                                        onClick={() => handleRedeemCourseCode(c.id)}
                                        className="btn-gold btn-sm py-1 px-3 text-xs shrink-0 cursor-pointer"
                                      >
                                        تفعيل
                                      </button>
                                    </div>
                                    {codeStatuses[c.id] && (
                                      <p
                                        className={`text-[11px] font-bold ${
                                          codeStatuses[c.id].ok ? 'text-emerald-400' : 'text-red-400'
                                        }`}
                                      >
                                        {codeStatuses[c.id].msg}
                                      </p>
                                    )}
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setShowCodeInputForCourse(c.id)}
                                    className="text-[11px] text-cyan-400 hover:text-cyan-300 font-bold block text-center w-full underline"
                                  >
                                    أو فعّل بكود كورس ورقي
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </article>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-400 col-span-full card bg-[#111f36] p-6 text-center">
                    لا توجد كورسات مطابقة لهذا التصنيف.
                  </p>
                )}
              </div>
            </div>
          )}
        </section>
      )}

      {/* ================================================= */}
      {/* TAB 1.5: VIDEO HUB & ATTACHMENTS */}
      {/* ================================================= */}
      {activeTab === 'video-hub' && (
        <section className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-blue-500/20">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <Video className="w-6 h-6 text-cyan-400" />
                <span>الفيديوهات التعليمية وملحقاتها</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">شاهد الشروحات، افتح المذكرات، وحل الواجبات المرتبطة بكل درس.</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              {studentData.content.filter(c => c.type === 'video').length === 0 ? (
                <div className="bg-[#0f1b2d] p-6 rounded-2xl text-center text-slate-400 border border-blue-500/20 text-xs">
                  لا توجد فيديوهات متاحة حالياً.
                </div>
              ) : (
                studentData.content.filter(c => c.type === 'video').map(video => (
                  <button
                    key={video.id}
                    onClick={() => onOpenMedia(video)}
                    className="w-full text-right p-4 rounded-xl bg-[#0f1b2d] border border-blue-500/15 hover:border-cyan-400/50 transition-all flex items-center gap-3 group"
                  >
                    <div className="p-2.5 rounded-lg bg-cyan-950/40 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-black">
                      <Play className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-cyan-300">{video.title}</h4>
                      <p className="text-[10px] text-slate-400">{video.lecture || 'درس عام'}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
            <div className="lg:col-span-2 bg-[#0f1b2d] p-6 rounded-2xl border border-blue-500/20 shadow-xl">
              <h4 className="font-black text-white mb-4 flex items-center gap-2">
                <Paperclip className="w-5 h-5 text-amber-400" />
                <span>ملحقات الفيديوهات</span>
              </h4>
              <p className="text-xs text-slate-300 mb-6">اضغط على "مشاهدة / فتح" من قائمة الفيديوهات لفتح المذكرة أو الواجب المرتبط بها هنا.</p>
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-950/20 border border-blue-500/10">
                    <CheckSquare className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs text-slate-300">اختر فيديو من القائمة الجانبية لعرض واجباته ومذكراته.</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ================================================= */}
      {/* TAB 2: ACHIEVEMENTS & REAL ACADEMIC PROGRESS */}
      {/* (يقيس مستوى تقدمه الحقيقي بدون شهادات وهمية) */}
      {/* ================================================= */}
      {activeTab === 'achievements' && (
        <section className="space-y-6">
          {/* Recharts Performance & Progress Dashboard */}
          <StudentAnalyticsDashboard
            results={studentData.results}
            exams={studentData.exams}
          />

          {/* Main Progress Meter Banner */}
          <div className="panel border border-cyan-500/30 bg-gradient-to-r from-[#0d1e38] to-[#091322] p-6 rounded-2xl shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-blue-500/20">
              <div className="space-y-1">
                <span className="badge-pill bg-cyan-950/60 text-cyan-300 border-cyan-400/40 text-xs font-bold flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>مؤشر التحصيل الدراسي الفعلي</span>
                </span>
                <h3 className="text-2xl font-black text-white">
                  مستوى تقدمك الأكاديمي العام
                </h3>
                <p className="text-xs text-slate-300">
                  يتم قياس مستواك بناءً على نتائج الاختبارات المنجزة ونسبة التحصيل الفعلية من نموذج الإجابة.
                </p>
              </div>

              {/* Level Badge */}
              <div className={`p-4 rounded-2xl border ${levelInfo.border} ${levelInfo.bg} text-center min-w-[160px] shadow-lg`}>
                <span className="text-[11px] text-slate-400 block mb-0.5">تقييمك الحالي:</span>
                <strong className={`text-base font-black ${levelInfo.color} block`}>
                  {levelInfo.badge}
                </strong>
                <span className="text-[10px] text-slate-300 font-bold mt-1 block">
                  {levelInfo.title}
                </span>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-300">متوسط الدرجات في الامتحانات:</span>
                <span className="text-cyan-300 font-mono text-sm">{averagePercentage}%</span>
              </div>
              <div className="h-4 w-full bg-[#070e1c] rounded-full overflow-hidden border border-blue-500/25 p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 rounded-full transition-all duration-1000 shadow-lg"
                  style={{ width: `${Math.min(100, Math.max(5, averagePercentage))}%` }}
                />
              </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="card bg-[#111f36] p-3.5 rounded-xl border border-blue-500/20 text-center">
                <Target className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                <span className="text-[11px] text-slate-400 block">امتحانات منجزة</span>
                <strong className="text-lg font-black text-white">
                  {completedExamsCount} / {totalExamsCount}
                </strong>
              </div>

              <div className="card bg-[#111f36] p-3.5 rounded-xl border border-blue-500/20 text-center">
                <Award className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                <span className="text-[11px] text-slate-400 block">إجمالي النقاط</span>
                <strong className="text-lg font-black text-amber-400">
                  {totalPointsAchieved} / {totalPointsPossible || '—'}
                </strong>
              </div>

              <div className="card bg-[#111f36] p-3.5 rounded-xl border border-blue-500/20 text-center">
                <TrendingUp className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                <span className="text-[11px] text-slate-400 block">نسبة إنجاز الامتحانات</span>
                <strong className="text-lg font-black text-emerald-400">
                  {examCompletionRate}%
                </strong>
              </div>

              <div className="card bg-[#111f36] p-3.5 rounded-xl border border-blue-500/20 text-center">
                <BookOpen className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                <span className="text-[11px] text-slate-400 block">كورسات مفعّلة</span>
                <strong className="text-lg font-black text-purple-300">
                  {studentData.courses.filter((c) => c.active).length}
                </strong>
              </div>
            </div>
          </div>

          {/* Exam Results Breakdown */}
          <div className="panel bg-[#0f1b2d] border border-blue-500/20 p-5 rounded-2xl space-y-4">
            <h4 className="font-black text-lg text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-cyan-400" />
              <span>سجل الامتحانات ومعدلات الإتقان لكل اختبار</span>
            </h4>

            {gradedResults.length > 0 ? (
              <div className="space-y-3">
                {gradedResults.map((r) => {
                  const pct = r.total ? Math.round(((r.score || 0) / r.total) * 100) : 0;
                  return (
                    <div
                      key={r.id}
                      className="card bg-[#111f36] border border-blue-500/15 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <h5 className="font-bold text-sm text-white">{r.examTitle}</h5>
                        <p className="text-xs text-slate-400">تاريخ الحل: {formatDate(r.created)}</p>
                      </div>

                      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                        <div className="text-right sm:text-left">
                          <strong className="text-base font-black text-emerald-400">
                            {r.score} من {r.total}
                          </strong>
                          <span className="text-[11px] text-slate-300 font-bold block">
                            نسبة الإتقان: {pct}%
                          </span>
                        </div>

                        <span
                          className={`badge-pill text-xs font-bold ${
                            pct >= 85
                              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                              : pct >= 65
                              ? 'bg-blue-950/60 text-cyan-300 border-blue-500/40'
                              : 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                          }`}
                        >
                          {r.label || (pct >= 85 ? 'ممتاز' : pct >= 65 ? 'جيد جداً' : 'يحتاج مراجعة')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 p-4 bg-[#111f36] rounded-xl text-center">
                لم تقم بأداء أي اختبارات بعد. ابدأ بحل الامتحانات في تبويب "الامتحانات والنتائج" لقياس تقدمك فوراً.
              </p>
            )}
          </div>
        </section>
      )}

      {/* ================================================= */}
      {/* TAB 3: EXAMS & RESULTS */}
      {/* ================================================= */}
      {activeTab === 'exams' && (
        <section className="space-y-6">
          <div className="panel bg-[#0f1b2d] border border-blue-500/20 p-5 rounded-2xl space-y-5">
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-blue-500/15">
              <div className="flex items-center gap-2">
                <FileQuestion className="w-5 h-5 text-cyan-400" />
                <h3 className="text-xl font-black text-white">الامتحانات والاختبارات التفاعلية</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('achievements')}
                className="btn-cyan btn-sm font-bold flex items-center gap-1.5 cursor-pointer text-xs"
              >
                <BarChart3 className="w-4 h-4" />
                <span>لوحة الإحصائيات البيانية</span>
              </button>
            </div>

            {/* AI Review Exam Generator Button */}
            <div className="bg-[#111f36] border border-cyan-500/20 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg overflow-hidden relative">
              <div className="absolute top-0 right-0 p-2 opacity-10 pointer-events-none">
                <Sparkles className="w-16 h-16 text-cyan-400" />
              </div>
              <div className="space-y-1 text-right relative z-10">
                <h4 className="text-sm font-black text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>توليد امتحان مراجعة مخصص (بالذكاء الاصطناعي)</span>
                </h4>
                <p className="text-[11px] text-slate-400">
                  سيقوم النظام بتحليل أخطائك السابقة وتوليد امتحان جديد خصيصاً لك لتقوية نقاط ضعفك.
                </p>
              </div>
              <button
                type="button"
                disabled={isGeneratingExam}
                onClick={handleGenerateMistakesExam}
                className="btn-cyan py-2.5 px-5 text-xs font-black flex items-center gap-2 rounded-xl shrink-0 cursor-pointer shadow-md disabled:opacity-50 relative z-10"
              >
                {isGeneratingExam ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري التوليد...</span>
                  </>
                ) : (
                  <>
                    <Bot className="w-4 h-4" />
                    <span>توليد امتحان من أخطائي</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {studentData.exams.length > 0 ? (
                studentData.exams.map((exam) => (
                  <div
                    key={exam.id}
                    className="card bg-[#111f36] border border-blue-500/20 p-4 rounded-xl flex flex-col justify-between hover:border-cyan-400/40"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="badge-pill bg-blue-950/60 text-cyan-300 border-blue-500/30 text-[11px]">
                          {exam.type}
                        </span>
                        <span className="text-xs text-slate-400">
                          {exam.questions.length} سؤال
                        </span>
                      </div>
                      <h4 className="font-extrabold text-base text-white">{exam.title}</h4>
                      <p className="text-xs text-slate-300 mt-1">{exam.grade}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-blue-500/10">
                      {exam.taken ? (
                        <span className="badge-pill bg-emerald-950/60 text-emerald-300 border-emerald-500/40 text-xs font-bold block text-center py-2">
                          ✅ تم إرسال الحل
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onStartExam(exam)}
                          className="btn-primary w-full py-2.5 text-xs font-bold rounded-xl cursor-pointer shadow"
                        >
                          ابدأ أداء الامتحان الآن
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 col-span-2">لا توجد امتحانات منشورة لصفك حالياً.</p>
              )}
            </div>
          </div>

          {/* Results & Grading Table */}
          <div className="panel bg-[#0f1b2d] border border-blue-500/20 p-5 rounded-2xl space-y-4">
            <h4 className="font-black text-lg text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span>نتائج الامتحانات والتصحيح</span>
            </h4>

            {studentData.results.length > 0 ? (
              <div className="space-y-3">
                {studentData.results.map((r) => (
                  <div
                    key={r.id}
                    className="card bg-[#111f36] border border-blue-500/15 p-4 rounded-xl space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h5 className="font-bold text-sm text-white">{r.examTitle}</h5>
                        <p className="text-xs text-slate-400 mt-0.5">تاريخ الحل: {formatDate(r.created)}</p>
                      </div>

                      <div className="text-left">
                        <span className="text-lg font-black text-emerald-400">
                          {r.score !== null ? `${r.score} من ${r.total}` : 'قيد المراجعة'}
                        </span>
                        {r.label && (
                          <span className="block text-[11px] font-bold text-cyan-300">
                            التقدير: {r.label}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Appeals */}
                    {r.status === 'graded' && !r.appeal && (
                      <div className="pt-2 border-t border-blue-500/10 flex gap-2">
                        <input
                          type="text"
                          placeholder="هل لديك تظلم على الدرجة؟ اكتب السبب..."
                          className="input-field text-xs py-1.5"
                          value={appealReasons[r.id] || ''}
                          onChange={(e) =>
                            setAppealReasons({ ...appealReasons, [r.id]: e.target.value })
                          }
                        />
                        <button
                          type="button"
                          disabled={appealLoading === r.id}
                          onClick={() => handleSendAppeal(r.id)}
                          className="btn-gold btn-sm shrink-0 cursor-pointer text-xs"
                        >
                          {appealLoading === r.id ? 'جاري الإرسال...' : 'إرسال تظلم'}
                        </button>
                      </div>
                    )}

                    {r.appeal && (
                      <p className="text-xs font-bold text-amber-300 bg-amber-950/40 p-2 rounded-lg border border-amber-500/30">
                        حالة التظلم: {r.appeal.status === 'reviewed' ? `تمت المراجعة (الدرجة: ${r.appeal.score || 'بدون تعديل'})` : 'قيد المراجعة لدى المعلم'}
                      </p>
                    )}

                    {appealStatus[r.id] && (
                      <p className="text-xs font-bold text-emerald-400">{appealStatus[r.id]}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">لا توجد نتائج مسجلة حتى الآن.</p>
            )}
          </div>
        </section>
      )}

      {/* ================================================= */}
      {/* TAB: INTERACTIVE TOOLS */}
      {/* ================================================= */}
      {activeTab === 'interactive-tools' && (
        <div className="space-y-6">
          <SubjectInteractiveTools
            currentSubject={publicData?.aboutUs?.subject}
            studentGrade={p.grade}
            gradeToolsConfig={publicData?.gradeInteractiveToolsConfig}
            studentVisibleTools={publicData?.studentVisibleTools || publicData?.activeTeacher?.toolsConfig}
          />
        </div>
      )}

      {/* ================================================= */}
      {/* TAB 4: WALLET & DEPOSITS */}
      {/* ================================================= */}
      {activeTab === 'wallet' && (
        <StudentWallet
          profile={p}
          transactions={studentData.walletTransactions || []}
          gateways={studentData.gateways || []}
          onRefresh={onRefresh}
        />
      )}

      {/* ================================================= */}
      {/* TAB 5: NOTICES & ANNOUNCEMENTS */}
      {/* ================================================= */}
      {activeTab === 'notices' && (
        <section className="panel bg-[#0f1b2d] border border-blue-500/20 p-5 rounded-2xl space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-blue-500/15">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="text-xl font-black text-white">مركز التنبيهات والإشعارات الفورية</h3>
                <p className="text-xs text-slate-400">آخر المستجدات، الدروس المضافة، مواعيد الامتحانات، والبث المباشر</p>
              </div>
            </div>
            <span className="badge-pill bg-blue-950/80 text-cyan-300 border-blue-500/30 text-xs font-bold">
              {studentData.notices.length} إشعار مسجل
            </span>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 bg-[#091222] p-1.5 rounded-xl border border-blue-500/15">
            <button
              type="button"
              onClick={() => setNotifCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold cursor-pointer transition-all ${
                notifCategoryFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              الكل ({studentData.notices.length})
            </button>
            <button
              type="button"
              onClick={() => setNotifCategoryFilter('content')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold cursor-pointer transition-all ${
                notifCategoryFilter === 'content'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              دروس جديدة 📚
            </button>
            <button
              type="button"
              onClick={() => setNotifCategoryFilter('exam')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold cursor-pointer transition-all ${
                notifCategoryFilter === 'exam'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              اختبارات 📝
            </button>
            <button
              type="button"
              onClick={() => setNotifCategoryFilter('live')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold cursor-pointer transition-all ${
                notifCategoryFilter === 'live'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              بث مباشر 🔴
            </button>
          </div>

          <div className="space-y-3">
            {studentData.notices.length > 0 ? (
              studentData.notices
                .filter((n) => {
                  if (notifCategoryFilter === 'content') return n.text.includes('درس') || n.text.includes('محتوى') || n.text.includes('فيديو');
                  if (notifCategoryFilter === 'exam') return n.text.includes('اختبار') || n.text.includes('امتحان');
                  if (notifCategoryFilter === 'live') return n.text.includes('بث') || n.text.includes('Meet');
                  return true;
                })
                .map((n) => {
                  const isLesson = n.text.includes('درس') || n.text.includes('محتوى') || n.text.includes('فيديو');
                  const isExam = n.text.includes('اختبار') || n.text.includes('امتحان');
                  const isLive = n.text.includes('بث') || n.text.includes('Meet');

                  return (
                    <div
                      key={n.id}
                      className="card bg-[#111f36] border border-blue-500/15 p-4 rounded-xl space-y-2 hover:border-cyan-400/40 transition-all"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`badge-pill text-[10px] font-bold ${
                            isLive
                              ? 'bg-red-950/80 text-red-300 border-red-500/40'
                              : isExam
                              ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40'
                              : isLesson
                              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                              : 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                          }`}
                        >
                          {isLive
                            ? 'بث مباشر 🔴'
                            : isExam
                            ? 'اختبار متاح 📝'
                            : isLesson
                            ? 'درس جديد 📚'
                            : 'تنبيه إداري 📢'}
                        </span>
                        <span className="text-[11px] text-slate-400">{formatDate(n.created)}</span>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-100 leading-relaxed font-semibold">
                        {n.text}
                      </p>

                      <div className="pt-2 flex justify-end">
                        {isExam ? (
                          <button
                            type="button"
                            onClick={() => setActiveTab('exams')}
                            className="btn-cyan btn-sm py-1 px-3 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer rounded-lg"
                          >
                            <span>الانتقال للامتحانات الآن</span>
                            <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                          </button>
                        ) : isLive ? (
                          <button
                            type="button"
                            onClick={() => setActiveTab('live')}
                            className="btn-primary btn-sm py-1 px-3 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer rounded-lg bg-red-600 hover:bg-red-500"
                          >
                            <span>انضمام للبث المباشر</span>
                            <Video className="w-3.5 h-3.5" />
                          </button>
                        ) : isLesson ? (
                          <button
                            type="button"
                            onClick={() => setActiveTab('courses')}
                            className="btn-primary btn-sm py-1 px-3 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer rounded-lg"
                          >
                            <span>مشاهدة الدروس والكورسات</span>
                            <BookOpen className="w-3.5 h-3.5" />
                          </button>
                        ) : null}
                      </div>
                    </div>
                  );
                })
            ) : (
              <p className="text-xs text-slate-400 p-6 text-center bg-[#111f36] rounded-xl border border-blue-500/10">
                لا توجد تنبيهات منشورة لصفك الدراسي حالياً.
              </p>
            )}
          </div>
        </section>
      )}

      {/* ================================================= */}
      {/* TAB 6: MESSAGES WITH TEACHER */}
      {/* ================================================= */}
      {activeTab === 'messages' && (
        <section className="panel bg-[#0f1b2d] border border-blue-500/20 p-5 rounded-2xl space-y-5">
          <div className="flex items-center gap-2 pb-2 border-b border-blue-500/15">
            <MessageCircle className="w-5 h-5 text-cyan-400" />
            <h3 className="text-xl font-black text-white">التواصل المباشر مع الأستاذ</h3>
          </div>

          <form onSubmit={handleSendMessage} className="space-y-3">
            <label className="block text-xs font-bold text-slate-300">
              أرسل استفسارك أو سؤالك التعليمي للأستاذ وسيرد عليك في لوحة التحكم:
            </label>
            <textarea
              rows={3}
              required
              placeholder="اكتب رسالتك بوضوح..."
              className="input-field text-xs sm:text-sm"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
            />
            <button
              type="submit"
              disabled={messageLoading}
              className="btn-primary py-2.5 px-6 text-xs font-bold flex items-center gap-2 rounded-xl cursor-pointer"
            >
              <SendHorizontal className="w-3.5 h-3.5" />
              <span>{messageLoading ? 'جاري الإرسال...' : 'إرسال الرسالة'}</span>
            </button>
            {messageStatus && (
              <p className="text-xs font-bold text-emerald-400">{messageStatus}</p>
            )}
          </form>

          {/* Previous Messages */}
          <div className="space-y-3 pt-3 border-t border-blue-500/15">
            <h4 className="text-xs font-bold text-slate-400">سجل الرسائل:</h4>
            {studentData.messages.length > 0 ? (
              studentData.messages.map((m) => (
                <div
                  key={m.id}
                  className="card bg-[#111f36] border border-blue-500/15 p-3.5 rounded-xl space-y-2 text-xs"
                >
                  <div className="flex justify-between items-center text-slate-400 text-[11px]">
                    <span className="font-bold text-white">سؤالك:</span>
                    <span>{formatDate(m.created)}</span>
                  </div>
                  <p className="text-slate-200">{m.text}</p>

                  {m.reply ? (
                    <div className="bg-[#091222] p-3 rounded-lg border border-cyan-400/30 text-cyan-200 mt-2">
                      <strong className="block text-[11px] text-cyan-400 mb-1">رد الأستاذ:</strong>
                      <p>{m.reply}</p>
                    </div>
                  ) : (
                    <span className="text-[11px] text-amber-400 block font-semibold">
                      ⌛ بانتظار رد الأستاذ...
                    </span>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400">لم تقم بإرسال أي رسائل حتى الآن.</p>
            )}
          </div>
        </section>
      )}

      {/* ================================================= */}
      {/* TAB 7: PROFILE & EDIT INFO (إمكانية الطالب يغير معلوماته) */}
      {/* ================================================= */}
      {activeTab === 'profile' && (
        <section className="panel bg-[#0f1b2d] border border-blue-500/20 p-5 rounded-2xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-blue-500/15">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-cyan-400" />
              <h3 className="text-xl font-black text-white">ملفي الشخصي وبيانات الحساب</h3>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsEditingProfile(!isEditingProfile);
                setEditName(p.name);
                setEditGov(p.governorate || '');
                setEditParentName(p.parentName || '');
                setEditParentPhone(p.parentPhone || '');
                setEditPassword('');
                setProfileMsg(null);
              }}
              className="btn-cyan btn-sm flex items-center gap-1.5 font-bold cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditingProfile ? 'إلغاء التعديل' : 'تعديل معلوماتي'}</span>
            </button>
          </div>

          {profileMsg && (
            <div
              className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                profileMsg.ok ? 'bg-emerald-950/60 text-emerald-200 border border-emerald-500/40' : 'bg-red-950/60 text-red-200 border border-red-500/40'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{profileMsg.text}</span>
            </div>
          )}

          {/* EDIT FORM (عند النقر على تعديل معلوماتي) */}
          {isEditingProfile ? (
            <form onSubmit={handleUpdateProfile} className="space-y-4 bg-[#091222] p-5 rounded-2xl border border-blue-500/25">
              <h4 className="text-sm font-extrabold text-cyan-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>تعديل البيانات الشخصية:</span>
              </h4>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-cyan-400" />
                    <span>اسم الطالب</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="input-field text-xs py-2"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    <span>المحافظة</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="input-field text-xs py-2"
                    value={editGov}
                    onChange={(e) => setEditGov(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
                    <HeartHandshake className="w-3.5 h-3.5 text-cyan-400" />
                    <span>اسم ولي الأمر</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="input-field text-xs py-2"
                    value={editParentName}
                    onChange={(e) => setEditParentName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-cyan-400" />
                    <span>رقم هاتف ولي الأمر</span>
                  </label>
                  <input
                    type="tel"
                    required
                    dir="ltr"
                    className="input-field text-xs py-2"
                    value={editParentPhone}
                    onChange={(e) => setEditParentPhone(e.target.value)}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>كلمة المرور الجديدة (اتركها فارغة إذا لم ترغب في التغيير)</span>
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="input-field text-xs py-2"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="btn-primary py-2.5 px-6 font-bold text-xs cursor-pointer"
                >
                  {profileLoading ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="btn-gray py-2.5 px-4 font-bold text-xs cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          ) : (
            // CURRENT PROFILE VIEW
            <div className="grid gap-3 sm:grid-cols-2 text-xs">
              <div className="card bg-[#111f36] p-4 rounded-xl border border-blue-500/15">
                <span className="text-slate-400 block mb-1">اسم الطالب</span>
                <strong className="text-white text-sm">{p.name}</strong>
              </div>

              <div className="card bg-[#111f36] p-4 rounded-xl border border-blue-500/15">
                <span className="text-slate-400 block mb-1">كود الطالب الفريد</span>
                <strong dir="ltr" className="font-mono text-cyan-300 text-sm">{p.code}</strong>
              </div>

              <div className="card bg-[#111f36] p-4 rounded-xl border border-blue-500/15">
                <span className="text-slate-400 block mb-1">الصف الدراسي</span>
                <strong className="text-white text-sm">{p.grade}</strong>
              </div>

              <div className="card bg-[#111f36] p-4 rounded-xl border border-blue-500/15">
                <span className="text-slate-400 block mb-1">رقم هاتف الطالب</span>
                <strong dir="ltr" className="font-mono text-white text-sm">{p.phone}</strong>
              </div>

              <div className="card bg-[#111f36] p-4 rounded-xl border border-blue-500/15">
                <span className="text-slate-400 block mb-1">المحافظة</span>
                <strong className="text-white text-sm">{p.governorate || 'غير محدد'}</strong>
              </div>

              <div className="card bg-[#111f36] p-4 rounded-xl border border-blue-500/15">
                <span className="text-slate-400 block mb-1">ولي الأمر المسجل</span>
                <strong className="text-white text-sm">
                  {p.parentName ? `${p.parentName} (${p.parentPhone})` : 'غير مسجل'}
                </strong>
              </div>

              <div className="card bg-[#111f36] p-4 rounded-xl border border-blue-500/15 sm:col-span-2">
                <span className="text-slate-400 block mb-1">رصيد المحفظة الإلكترونية</span>
                <strong className="text-emerald-400 text-lg font-black">
                  {currentWalletBalance.toLocaleString('ar-EG')} جنيه مصري
                </strong>
              </div>

              {/* Real Scannable QR Code Membership Card */}
              <div className="card bg-[#111f36] p-5 rounded-2xl border border-blue-500/25 sm:col-span-2 flex flex-col items-center justify-center space-y-3">
                <span className="text-cyan-300 font-extrabold text-xs">بطاقة العضوية والسنتر والاشتراكات (QR Code قابل للمسح)</span>
                <QRCodeView
                  value={`LERNWEB-STUDENT-ID:${p.code}-NAME:${p.name}-PHONE:${p.phone}-GRADE:${p.grade}`}
                  size={160}
                  title={p.name}
                  subtitle={`كود: ${p.code} | ${p.grade}`}
                />
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-blue-500/20 flex flex-wrap justify-between items-center gap-3">
            <button
              type="button"
              onClick={onLogout}
              className="btn-red font-bold text-xs px-6 py-2.5 rounded-xl cursor-pointer"
            >
              تسجيل الخروج من الحساب
            </button>

            <button
              type="button"
              onClick={async () => {
                if (window.confirm('تحذير خطير: هل أنت متأكد تماماً من رغبتك في حذف حسابك نهائياً؟ سيتم حذف جميع بياناتك ونتائجك ولا يمكن التراجع عن هذا الإجراء.')) {
                  try {
                    await apiRequest('student', '/api/student/account/delete', {});
                    onLogout();
                  } catch (err: any) {
                    alert(err.message || 'تعذر حذف الحساب');
                  }
                }
              }}
              className="bg-red-950/60 hover:bg-red-900 text-red-200 font-bold text-xs px-5 py-2.5 rounded-xl border border-red-500/40 cursor-pointer transition-all"
            >
              حذف الحساب نهائياً
            </button>
          </div>
        </section>
      )}

      {/* TAB: STUDY PLANNER */}
      {activeTab === 'study-planner' && (
        <StudyPlanner profile={studentData.profile} />
      )}
    </div>
  );
};
