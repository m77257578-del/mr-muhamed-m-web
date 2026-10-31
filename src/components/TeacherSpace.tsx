import React, { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  TeacherData,
  GRADES,
  Grade,
} from '../types';
import { apiRequest, tokens, uploadFile } from '../services/api';
import {
  Shield,
  Users,
  UserCheck,
  CheckCircle2,
  MessageSquare,
  Settings,
  PlusCircle,
  Bell,
  Key,
  Upload,
  FileQuestion,
  GraduationCap,
  Trophy,
  Star,
  Trash2,
  Copy,
  ExternalLink,
  Search,
  Lock,
  Unlock,
  LogOut,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  CreditCard,
  Wallet,
  Check,
  X,
  Eye,
  EyeOff,
  Smartphone,
  Edit,
  ToggleLeft,
  ToggleRight,
  Layers,
  Sparkles,
  Bot,
  Video,
  Printer,
  BookOpen,
  ShoppingBag,
  FileText,
  Newspaper,
  Info,
  Plus,
  User,
  HeartHandshake,
  Image as ImageIcon
} from 'lucide-react';

interface TeacherSpaceProps {
  teacherData: TeacherData | null;
  onRefresh: () => Promise<void>;
  onLogout: () => void;
  onBackToStudent: () => void;
  onUpdatePublic?: () => Promise<void>;
}

const ALL_GRADES: (Grade | 'كل الصفوف')[] = ['كل الصفوف', ...GRADES];

export const TeacherSpace: React.FC<TeacherSpaceProps> = ({
  teacherData,
  onRefresh,
  onLogout,
  onBackToStudent,
  onUpdatePublic,
}) => {
  // Auth state
  const [code, setCode] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Search in accounts
  const [searchQuery, setSearchQuery] = useState('');

  // Settings form
  const [settingsName, setSettingsName] = useState(teacherData?.name || '');
  const [settingsPw, setSettingsPw] = useState('');
  const [settingsPayments, setSettingsPayments] = useState('');
  const [settingsMsg, setSettingsMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // New Course form
  const [cTitle, setCTitle] = useState('');
  const [cGrade, setCGrade] = useState<string>('كل الصفوف');
  const [cPrice, setCPrice] = useState<number>(100);
  const [cDays, setCDays] = useState<number>(30);
  const [cDesc, setCDesc] = useState('');
  const [cIsFree, setCIsFree] = useState(false);
  const [cImageFile, setCImageFile] = useState<File | null>(null);
  const [cImageUrl, setCImageUrl] = useState('');
  const [cImagePreview, setCImagePreview] = useState('');
  const [cLoading, setCLoading] = useState(false);
  const [cMsg, setCMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // Platform Design & Colors Customizer
  const [primaryColor, setPrimaryColor] = useState(teacherData?.primaryColor || '#0284c7');
  const [headingColor, setHeadingColor] = useState(teacherData?.headingColor || '#ffffff');
  const [textColor, setTextColor] = useState(teacherData?.textColor || '#cbd5e1');
  const [panelBg, setPanelBg] = useState(teacherData?.panelBg || '#0d1728');
  const [cardBg, setCardBg] = useState(teacherData?.cardBg || '#111f36');
  const [accentGold, setAccentGold] = useState(teacherData?.accentGold || '#f59e0b');
  const [fontFamily, setFontFamily] = useState(teacherData?.fontFamily || "'Cairo', sans-serif");
  const [bgPattern, setBgPattern] = useState(teacherData?.bgPattern || 'gradient');
  const [subtitle, setSubtitle] = useState(teacherData?.subtitle || '');
  const [designMsg, setDesignMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // Dynamic Grade Control and Registration Fields Config State
  const [allowedGradesState, setAllowedGradesState] = useState<string[]>(
    teacherData?.allowedGrades || [
      'الصف الرابع الابتدائي',
      'الصف الخامس الابتدائي',
      'الصف السادس الابتدائي',
      'الصف الأول الإعدادي',
      'الصف الثاني الإعدادي',
      'الصف الثالث الإعدادي',
      'الصف الأول الثانوي',
      'الصف الثاني الثانوي – عام',
      'الصف الثاني الثانوي – بكالوريا',
      'الصف الثالث الثانوي',
    ]
  );
  const [gradesMsg, setGradesMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const [regFieldsState, setRegFieldsState] = useState<Record<string, boolean>>(
    teacherData?.registrationFieldsConfig || {
      governorate: true,
      birthDate: true,
      center: false,
      village: false,
      parentName: true,
      parentPhone: true,
      grade: true,
    }
  );
  const [regConfigMsg, setRegConfigMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // Per-Grade Subject Tools Configuration Matrix
  const [selectedToolsGrade, setSelectedToolsGrade] = useState<string>('الصف الأول الثانوي');
  const [gradeToolsMatrix, setGradeToolsMatrix] = useState<Record<string, Record<string, boolean>>>(
    teacherData?.gradeInteractiveToolsConfig || {}
  );
  const [gradeToolsMsg, setGradeToolsMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // Platform Data Reset & Cleanup State
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetConfirmInput, setResetConfirmInput] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMsg, setResetMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // Notice form
  const [nKind, setNKind] = useState<'announcement' | 'schedule'>('announcement');
  const [nText, setNText] = useState('');
  const [nGrade, setNGrade] = useState<string>('كل الصفوف');
  const [nMsg, setNMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // Codes generator
  const [codeCourseId, setCodeCourseId] = useState('');
  const [codeCount, setCodeCount] = useState(1);
  const [codeDays, setCodeDays] = useState(30);
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);
  const [generatedMsg, setGeneratedMsg] = useState('');
  const [copyStatus, setCopyStatus] = useState(false);

  // Coupon generator
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscountType, setCouponDiscountType] = useState<'percentage' | 'fixed' | 'free_course'>('percentage');
  const [couponDiscountValue, setCouponDiscountValue] = useState(20);
  const [couponCourseId, setCouponCourseId] = useState('');
  const [couponMaxUses, setCouponMaxUses] = useState(50);
  const [couponMsg, setCouponMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  // Content publisher
  const [contentFile, setContentFile] = useState<File | null>(null);
  const [contentType, setContentType] = useState<'video' | 'image' | 'note' | 'homework'>('note');
  const [contentTitle, setContentTitle] = useState('');
  const [contentLink, setContentLink] = useState('');
  const [contentCourseId, setContentCourseId] = useState('');
  const [contentGrade, setContentGrade] = useState<string>('كل الصفوف');
  const [contentIsFree, setContentIsFree] = useState(false);
  const [contentLecture, setContentLecture] = useState('');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [contentMsg, setContentMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // Dynamic Exam Builder (up to 50 questions, types: mcq/essay/true_false, attachments, answer key)
  interface QuestionItem {
    kind: 'mcq' | 'essay' | 'true_false';
    q: string;
    options: string[];
    answer: string;
    model: string;
    attachmentUrl?: string;
    attachmentType?: 'image' | 'pdf';
    points?: number;
  }
  const [examTitle, setExamTitle] = useState('');
  const [examCourseId, setExamCourseId] = useState('');
  const [examGrade, setExamGrade] = useState<string>('كل الصفوف');
  const [examAttachmentUrl, setExamAttachmentUrl] = useState('');
  const [examAttachmentType, setExamAttachmentType] = useState<'image' | 'pdf'>('image');
  const [examAttachmentFile, setExamAttachmentFile] = useState<File | null>(null);
  const [examItems, setExamItems] = useState<QuestionItem[]>([
    {
      kind: 'mcq',
      q: '',
      options: ['', '', '', ''],
      answer: 'أ',
      model: '',
      attachmentUrl: '',
      attachmentType: 'image',
      points: 1,
    },
  ]);
  const [examIsFree, setExamIsFree] = useState(false);
  const [examMsg, setExamMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [examLoading, setExamLoading] = useState(false);

  // Store & PDF Books State
  const [bookTitle, setBookTitle] = useState('');
  const [bookGrade, setBookGrade] = useState<string>('كل الصفوف');
  const [bookPrice, setBookPrice] = useState<number>(50);
  const [bookPages, setBookPages] = useState<number>(85);
  const [bookDesc, setBookDesc] = useState('');
  const [bookIsFree, setBookIsFree] = useState(false);
  const [bookCoverUrl, setBookCoverUrl] = useState('');
  const [bookPdfUrl, setBookPdfUrl] = useState('');
  const [bookCoverFile, setBookCoverFile] = useState<File | null>(null);
  const [bookPdfFile, setBookPdfFile] = useState<File | null>(null);
  const [bookLoading, setBookLoading] = useState(false);
  const [bookMsg, setBookMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [storeOrdersFilter, setStoreOrdersFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // About Us & Key Features State (Teacher bio and 6 editable platform features)
  const [aboutTitle, setAboutTitle] = useState(teacherData?.aboutUs?.title || 'الأستاذ محمد عبد المقصود');
  const [aboutSubtitle, setAboutSubtitle] = useState(teacherData?.aboutUs?.subtitle || 'خبير ورائد تدريس المناهج التعليمية');
  const [aboutSubject, setAboutSubject] = useState(teacherData?.aboutUs?.subject || 'اللغة العربية ومواد الثانوية العامة');
  const [aboutBio, setAboutBio] = useState(teacherData?.aboutUs?.bio || 'خبرة تزيد عن 18 عاماً في تدريس وتبسيط منهج اللغة العربية لطلاب الثانوية العامة والإعدادية، مؤلف ومبتكر لسلاسل المراجعات النهائية ونماذج الامتحانات المعتمدة مع توظيف أحدث وسائل التعليم الذكي.');
  const [aboutVision, setAboutVision] = useState(teacherData?.aboutUs?.vision || 'بناء جيل متمكن لغوياً، يعشق بلاغة الضاد، ويحقق العلامة الكاملة بثقة وتفوق في امتحانات الثانوية العامة.');
  const [aboutMission, setAboutMission] = useState(teacherData?.aboutUs?.mission || 'تقديم محتوى تعليمي رقمي فائق الجودة، امتحانات تفاعلية تصحح بالذكاء الاصطناعي، ومتابعة فردية لا تنقطع لكل طالب حتى يوم الامتحان.');
  const [aboutExp, setAboutExp] = useState(teacherData?.aboutUs?.experienceYears || '18+');
  const [aboutStudents, setAboutStudents] = useState(teacherData?.aboutUs?.studentsCount || '15,000+');
  const [aboutLectures, setAboutLectures] = useState(teacherData?.aboutUs?.lecturesCount || '450+');
  const [aboutSatisfaction, setAboutSatisfaction] = useState(teacherData?.aboutUs?.satisfactionRate || '99.4%');
  const [aboutTeacherImage, setAboutTeacherImage] = useState(teacherData?.aboutUs?.teacherImage || '');
  const [aboutFeatures, setAboutFeatures] = useState(teacherData?.aboutUs?.features || [
    { title: 'شرح مبسط وتفاعلي', desc: 'تفكيك أصعب قواعد النحو والبلاغة بأسلوب شيق وسلس يتناسب مع النظام الحديث', icon: 'Sparkles' },
    { title: 'امتحانات إلكترونية وتصحيح ذكي', desc: 'بنك أسئلة حتى 50 سؤال مع تصحيح إلكتروني فوري ونموذج إجابة معتمد', icon: 'GraduationCap' },
    { title: 'مساعد ذكي روبوت 3D', desc: 'إجابة فورية على أسئلة النحو والإعراب وتصحيح الأخطاء تلقائياً على مدار الساعة', icon: 'Bot' },
    { title: 'متابعة دورية لولي الأمر', desc: 'تقارير دورية وفورية توثق درجات الامتحانات والواجبات ونسبة الحضور', icon: 'UserCheck' },
    { title: 'متجر مذكرات وكتب PDF', desc: 'تحميل مباشر للكتب والملخصات الرقمية والشراء بالدفع اليدوي أو المحفظة', icon: 'BookOpen' },
    { title: 'بث مباشر تفاعلي وتوثيق حضور', desc: 'حصص لايف عبر Google Meet مع توثيق حضور الطلاب بدقة لحظية', icon: 'Video' },
  ]);
  const [aboutMsg, setAboutMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [aboutLoading, setAboutLoading] = useState(false);

  // Articles Management State
  const [artTitle, setArtTitle] = useState('');
  const [artCategory, setArtCategory] = useState('نحو وبلاغة');
  const [artReadTime, setArtReadTime] = useState('4 دقائق');
  const [artImageUrl, setArtImageUrl] = useState('');
  const [artSummary, setArtSummary] = useState('');
  const [artContent, setArtContent] = useState('');
  const [artMsg, setArtMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [artLoading, setArtLoading] = useState(false);

  // Grading form
  const [gradingScores, setGradingScores] = useState<Record<string, number | string>>({});

  // Message replies
  const [messageReplies, setMessageReplies] = useState<Record<string, string>>({});

  // Appeal scores
  const [appealScores, setAppealScores] = useState<Record<string, string>>({});

  // Primary Admin Tab System State
  const [activeMainTab, setActiveMainTab] = useState<
    'overview' | 'financials' | 'content' | 'media-management' | 'store' | 'about' | 'articles' | 'bundles' | 'students' | 'meet' | 'settings' | 'supervisors' | 'top-students'
  >('overview');

  // Google Meet & Live Attendance State
  const [meetTitle, setMeetTitle] = useState('');
  const [meetUrl, setMeetUrl] = useState('');
  const [meetGrade, setMeetGrade] = useState<string>('كل الصفوف');
  const [meetScheduledAt, setMeetScheduledAt] = useState('');
  const [meetStatus, setMeetStatus] = useState<'scheduled' | 'active' | 'ended'>('active');
  const [meetNotes, setMeetNotes] = useState('');
  const [meetLoading, setMeetLoading] = useState(false);
  const [meetMsg, setMeetMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [selectedSessionFilter, setSelectedSessionFilter] = useState<string>('all');
  const [attendanceSearchQuery, setAttendanceSearchQuery] = useState('');
  const [manualStudentId, setManualStudentId] = useState('');
  const [manualSessionId, setManualSessionId] = useState('');
  const [onlinePayKey, setOnlinePayKey] = useState((teacherData as any)?.onlinePayKey || '');
  const [cashierKey, setCashierKey] = useState((teacherData as any)?.cashierKey || '');

  // Supervisor Login & Management State
  const [loginMode, setLoginMode] = useState<'admin' | 'supervisor'>('admin');
  const [supLoginPhone, setSupLoginPhone] = useState('');
  const [supLoginPassword, setSupLoginPassword] = useState('');

  const [supName, setSupName] = useState('');
  const [supPhone, setSupPhone] = useState('');
  const [supPassword, setSupPassword] = useState('');
  const [supPermissions, setSupPermissions] = useState({
    courses: true,
    students: true,
    exams: true,
    coupons: true,
    financials: true,
    notices: true
  });
  const [supEditId, setSupEditId] = useState<string | null>(null);
  const [supMsg, setSupMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // SYSTEM 1: Manual Gateway State
  const [gwId, setGwId] = useState('');
  const [gwTitle, setGwTitle] = useState('');
  const [gwProvider, setGwProvider] = useState('vodafone');
  const [gwAccountNumber, setGwAccountNumber] = useState('');
  const [gwAccountHolder, setGwAccountHolder] = useState('');
  const [gwInstructions, setGwInstructions] = useState('');
  const [gwActive, setGwActive] = useState(true);
  const [gwMsg, setGwMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [gwLoading, setGwLoading] = useState(false);

  // Social Media Links Form State
  const [socialPlatform, setSocialPlatform] = useState('whatsapp');
  const [socialTitle, setSocialTitle] = useState('واتساب الإدارة');
  const [socialUrl, setSocialUrl] = useState('');
  const [socialMsg, setSocialMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [socialLoading, setSocialLoading] = useState(false);

  // SYSTEM 5: Recharge Request Review & Zoom Modal
  const [previewReceiptUrl, setPreviewReceiptUrl] = useState<string | null>(null);
  const [rejectionModalTxId, setRejectionModalTxId] = useState<string | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [rechargesFilter, setRechargesFilter] = useState<'pending' | 'all' | 'approved' | 'rejected'>('pending');

  // SYSTEM 3: Adjust Student Balance State
  const [adjustModalStudent, setAdjustModalStudent] = useState<any | null>(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [adjustLoading, setAdjustLoading] = useState(false);

  // Report and Export Modal State
  const [reportStudent, setReportStudent] = useState<any | null>(null);

  // Detailed Student Modal State & Password Eye Toggles
  const [detailedStudent, setDetailedStudent] = useState<any | null>(null);
  const [showAdminCode, setShowAdminCode] = useState(false);
  const [showSupLoginPw, setShowSupLoginPw] = useState(false);
  const [showSupPw, setShowSupPw] = useState(false);
  const [showSettingsPw, setShowSettingsPw] = useState(false);

  // Top Students Management State (إدارة ونشر المتفوقين مع رفع الصور من الجهاز)
  const [tsId, setTsId] = useState<string | null>(null);
  const [tsName, setTsName] = useState('');
  const [tsGrade, setTsGrade] = useState('الصف الثالث الثانوي');
  const [tsScore, setTsScore] = useState('99.6%');
  const [tsRank, setTsRank] = useState('المركز الأول على مستوى الجمهورية');
  const [tsYear, setTsYear] = useState('2025/2026');
  const [tsSchool, setTsSchool] = useState('');
  const [tsQuote, setTsQuote] = useState('');
  const [tsBadge, setTsBadge] = useState('وسام العبقرية والتفوق 🌟');
  const [tsPhotoUrl, setTsPhotoUrl] = useState('');
  const [tsPhotoPreview, setTsPhotoPreview] = useState<string | null>(null);
  const [tsFeatured, setTsFeatured] = useState(true);
  const [tsLoading, setTsLoading] = useState(false);
  const [tsMsg, setTsMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [tsSearchQuery, setTsSearchQuery] = useState('');
  const tsPhotoInputRef = useRef<HTMLInputElement>(null);

  const handleTsPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 5 ميجابايت');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setTsPhotoPreview(base64);
      setTsPhotoUrl(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveTopStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tsName.trim() || !tsScore.trim()) {
      setTsMsg({ text: 'يرجى كتابة اسم الطالب ومجموعه أو نسبته المئوية', ok: false });
      return;
    }
    setTsLoading(true);
    setTsMsg(null);
    try {
      await apiRequest('teacher', '/api/teacher/top-students', {
        id: tsId || undefined,
        name: tsName.trim(),
        grade: tsGrade,
        score: tsScore.trim(),
        rank: tsRank.trim(),
        year: tsYear.trim(),
        school: tsSchool.trim(),
        quote: tsQuote.trim(),
        badge: tsBadge.trim(),
        photoUrl: tsPhotoUrl || tsPhotoPreview || undefined,
        featured: tsFeatured,
      });
      setTsMsg({
        text: tsId ? 'تم تحديث بيانات المتفوق بنجاح!' : 'تم نشر الطالب في لوحة شرف المتفوقين بنجاح!',
        ok: true,
      });
      setTsId(null);
      setTsName('');
      setTsScore('99.6%');
      setTsRank('المركز الأول');
      setTsSchool('');
      setTsQuote('');
      setTsPhotoUrl('');
      setTsPhotoPreview(null);
      if (tsPhotoInputRef.current) tsPhotoInputRef.current.value = '';
      await onRefresh();
      if (onUpdatePublic) await onUpdatePublic();
    } catch (err: any) {
      setTsMsg({ text: err.message || 'فشل حفظ بيانات الطالب المتفوق', ok: false });
    } finally {
      setTsLoading(false);
    }
  };

  const handleDeleteTopStudent = async (id: string, name: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف الطالب/ة (${name}) من لوحة الشرف؟`)) return;
    try {
      await apiRequest('teacher', '/api/teacher/top-students/delete', { id });
      await onRefresh();
      if (onUpdatePublic) await onUpdatePublic();
    } catch (err: any) {
      alert(err.message || 'تعذر حذف الطالب');
    }
  };

  const handleMoveTopStudentUp = async (index: number) => {
    const list = [...(teacherData?.topStudents || [])];
    if (index <= 0 || index >= list.length) return;
    const temp = list[index];
    list[index] = list[index - 1];
    list[index - 1] = temp;
    const orderedIds = list.map((s) => s.id);
    try {
      await apiRequest('teacher', '/api/teacher/top-students/reorder', { orderedIds });
      await onRefresh();
      if (onUpdatePublic) await onUpdatePublic();
    } catch (err: any) {
      alert(err.message || 'تعذر إعادة الترتيب');
    }
  };

  const handleMoveTopStudentDown = async (index: number) => {
    const list = [...(teacherData?.topStudents || [])];
    if (index < 0 || index >= list.length - 1) return;
    const temp = list[index];
    list[index] = list[index + 1];
    list[index + 1] = temp;
    const orderedIds = list.map((s) => s.id);
    try {
      await apiRequest('teacher', '/api/teacher/top-students/reorder', { orderedIds });
      await onRefresh();
      if (onUpdatePublic) await onUpdatePublic();
    } catch (err: any) {
      alert(err.message || 'تعذر إعادة الترتيب');
    }
  };

  const handleRemoveTopStudentPhoto = async (id: string, name: string) => {
    if (!window.confirm(`هل تريد حذف صورة الطالب/ة (${name})؟`)) return;
    try {
      await apiRequest('teacher', '/api/teacher/top-students/remove-photo', { id });
      await onRefresh();
      if (onUpdatePublic) await onUpdatePublic();
    } catch (err: any) {
      alert(err.message || 'تعذر حذف صورة الطالب');
    }
  };

  // File input refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const heroInputRef = useRef<HTMLInputElement>(null);

  // Handlers
  const handleSaveGateway = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gwTitle.trim() || !gwAccountNumber.trim()) {
      setGwMsg({ text: 'يرجى كتابة اسم الطريقة ورقم الحساب/المحفظة', ok: false });
      return;
    }
    setGwLoading(true);
    setGwMsg(null);
    try {
      await apiRequest('teacher', '/api/teacher/gateway', {
        id: gwId || undefined,
        title: gwTitle.trim(),
        provider: gwProvider,
        accountNumber: gwAccountNumber.trim(),
        accountHolder: gwAccountHolder.trim(),
        instructions: gwInstructions.trim(),
        active: gwActive,
      });
      setGwMsg({ text: 'تم حفظ بوابة الدفع بنجاح!', ok: true });
      setGwId('');
      setGwTitle('');
      setGwAccountNumber('');
      setGwAccountHolder('');
      setGwInstructions('');
      setGwActive(true);
      await onRefresh();
      if (onUpdatePublic) await onUpdatePublic();
    } catch (err: any) {
      setGwMsg({ text: err.message || 'تعذر حفظ بوابة الدفع', ok: false });
    } finally {
      setGwLoading(false);
    }
  };

  const handleDeleteGateway = async (id: string) => {
    if (!window.confirm('هل أنت تأكد من حذف طريقة الدفع هذه؟')) return;
    try {
      await apiRequest('teacher', `/api/teacher/gateway?id=${id}`, undefined, 'DELETE');
      await onRefresh();
      if (onUpdatePublic) await onUpdatePublic();
    } catch (err: any) {
      alert(err.message || 'تعذر الحذف');
    }
  };

  const handleToggleGateway = async (id: string) => {
    try {
      await apiRequest('teacher', '/api/teacher/gateway/toggle', { id });
      await onRefresh();
      if (onUpdatePublic) await onUpdatePublic();
    } catch (err: any) {
      alert(err.message || 'تعذر تغيير الحالة');
    }
  };

  // Social Links Handlers
  const handleSaveSocial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!socialUrl.trim()) {
      setSocialMsg({ text: 'يرجى كتابة الرابط المباشر', ok: false });
      return;
    }
    setSocialLoading(true);
    setSocialMsg(null);
    try {
      await apiRequest('teacher', '/api/teacher/social-link', {
        platform: socialPlatform,
        title: socialTitle.trim() || socialPlatform,
        url: socialUrl.trim(),
        active: true,
      });
      setSocialMsg({ text: 'تم إضافة زر التواصل بنجاح!', ok: true });
      setSocialUrl('');
      await onRefresh();
      if (onUpdatePublic) await onUpdatePublic();
    } catch (err: any) {
      setSocialMsg({ text: err.message || 'تعذر إضافة زر التواصل', ok: false });
    } finally {
      setSocialLoading(false);
    }
  };

  const handleDeleteSocial = async (id: string) => {
    if (!window.confirm('هل أنت مقتنع بحذف زر التواصل هذا؟')) return;
    try {
      await apiRequest('teacher', `/api/teacher/social-link?id=${id}`, undefined, 'DELETE');
      await onRefresh();
      if (onUpdatePublic) await onUpdatePublic();
    } catch (err: any) {
      alert(err.message || 'تعذر الحذف');
    }
  };

  const handleToggleSocial = async (id: string) => {
    try {
      await apiRequest('teacher', '/api/teacher/social-link/toggle', { id });
      await onRefresh();
      if (onUpdatePublic) await onUpdatePublic();
    } catch (err: any) {
      alert(err.message || 'تعذر تغيير الحالة');
    }
  };

  // Review Wallet Recharge Requests
  const handleReviewRecharge = async (txId: string, action: 'approve' | 'reject', reason?: string) => {
    setReviewLoading(true);
    try {
      await apiRequest('teacher', '/api/teacher/wallet-review', {
        transactionId: txId,
        action,
        rejectionReason: reason || undefined,
      });
      setRejectionModalTxId(null);
      setRejectionReasonInput('');
      await onRefresh();
    } catch (err: any) {
      alert(err.message || 'تعذر إتمام المراجعة');
    } finally {
      setReviewLoading(false);
    }
  };

  // Review Offline Package Orders
  const handleReviewPackageOrder = async (orderId: string, action: 'approve' | 'reject', reason?: string) => {
    setReviewLoading(true);
    try {
      await apiRequest('teacher', '/api/teacher/package-order-review', {
        orderId,
        action,
        rejectionReason: reason || undefined,
      });
      await onRefresh();
    } catch (err: any) {
      alert(err.message || 'تعذر إتمام المراجعة');
    } finally {
      setReviewLoading(false);
    }
  };

  // Adjust Student Balance
  const handleAdjustBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustModalStudent || !adjustAmount) return;
    const amountNum = parseFloat(adjustAmount);
    if (isNaN(amountNum) || amountNum === 0) {
      alert('يرجى كتابة مبلغ صحيح أكبر أو أصغر من الصفر');
      return;
    }
    setAdjustLoading(true);
    try {
      await apiRequest('teacher', '/api/teacher/student/adjust-balance', {
        studentId: adjustModalStudent.id,
        amount: amountNum,
        reason: adjustReason.trim() || 'تعديل يدوية من الإدارة',
      });
      alert('تم تعديل رصيد الطالب بنجاح!');
      setAdjustModalStudent(null);
      setAdjustAmount('');
      setAdjustReason('');
      await onRefresh();
    } catch (err: any) {
      alert(err.message || 'تعذر تعديل الرصيد');
    } finally {
      setAdjustLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      const payload = loginMode === 'admin' ? { code } : { phone: supLoginPhone, password: supLoginPassword };
      const res = await apiRequest('public', '/api/teacher/login', payload);
      tokens.teacher = res.token;
      await onRefresh();
    } catch (err: any) {
      setAuthError(err.message || 'بيانات الدخول غير صحيحة');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSaveSupervisor = async (e: React.FormEvent) => {
    e.preventDefault();
    setSupMsg(null);
    try {
      await apiRequest('teacher', '/api/teacher/supervisor', {
        id: supEditId || undefined,
        name: supName,
        phone: supPhone,
        password: supPassword,
        permissions: supPermissions
      });
      setSupMsg({ text: 'تم حفظ المشرف وصلاحياته بنجاح!', ok: true });
      setSupName('');
      setSupPhone('');
      setSupPassword('');
      setSupEditId(null);
      await onRefresh();
    } catch (err: any) {
      setSupMsg({ text: err.message || 'تعذر حفظ المشرف', ok: false });
    }
  };

  const handleDeleteSupervisor = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المشرف؟')) return;
    try {
      await apiRequest('teacher', `/api/teacher/supervisor?id=${id}`, undefined, 'DELETE');
      await onRefresh();
    } catch (err: any) {
      alert(err.message || 'تعذر الحذف');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsMsg(null);

    let heroUrl: string | undefined;
    const heroFile = heroInputRef.current?.files?.[0];
    if (heroFile) {
      try {
        const uRes = await uploadFile('/api/upload', heroFile);
        heroUrl = (uRes as any).url || `/uploads/${uRes.fileId}`;
      } catch (err) {
        setSettingsMsg({ text: 'فشل رفع صورة المنصة', ok: false });
        return;
      }
    }

    try {
      await apiRequest('teacher', '/api/teacher/settings', {
        name: settingsName,
        password: settingsPw || undefined,
        payments: settingsPayments,
        heroBannerUrl: heroUrl,
      });
      setSettingsMsg({ text: 'تم حفظ إعدادات وصورة المنصة بنجاح!', ok: true });
      setSettingsPw('');
      if (heroInputRef.current) heroInputRef.current.value = '';
      await onRefresh();
      if (onUpdatePublic) await onUpdatePublic();
    } catch (err: any) {
      setSettingsMsg({ text: err.message || 'حدث خطأ في حفظ الإعدادات', ok: false });
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setCMsg(null);
    setCLoading(true);
    try {
      let finalImageUrl = cImageUrl.trim();
      if (cImageFile) {
        try {
          const uRes = await uploadFile('/api/upload', cImageFile);
          finalImageUrl = (uRes as any).url || `/receipts/${uRes.fileId}`;
        } catch (err) {
          setCMsg({ text: 'فشل رفع صورة الكورس', ok: false });
          setCLoading(false);
          return;
        }
      }

      await apiRequest('teacher', '/api/teacher/course', {
        title: cTitle,
        grade: cGrade,
        price: cPrice,
        days: cDays,
        description: cDesc,
        isFree: cIsFree,
        imageUrl: finalImageUrl,
      });
      setCMsg({ text: 'تم نشر الكورس بنجاح مع الصورة المعتمدة!', ok: true });
      setCTitle('');
      setCDesc('');
      setCImageFile(null);
      setCImageUrl('');
      setCImagePreview('');
      await onRefresh();
      if (onUpdatePublic) await onUpdatePublic();
    } catch (err: any) {
      setCMsg({ text: err.message || 'تعذر نشر الكورس', ok: false });
    } finally {
      setCLoading(false);
    }
  };

  const handleSaveDesign = async (e: React.FormEvent) => {
    e.preventDefault();
    setDesignMsg(null);
    try {
      await apiRequest('teacher', '/api/teacher/design-settings', {
        name: settingsName,
        subtitle,
        primaryColor,
        headingColor,
        textColor,
        panelBg,
        cardBg,
        accentGold,
        fontFamily,
        bgPattern,
        onlinePayKey,
        cashierKey,
      });
      setDesignMsg({ text: 'تم حفظ إعدادات الخطوط ومتغيرات CSS والتصميم بنجاح في قاعدة البيانات!', ok: true });
      await onRefresh();
      if (onUpdatePublic) await onUpdatePublic();
    } catch (err: any) {
      setDesignMsg({ text: err.message || 'تعذر حفظ تصميم المنصة', ok: false });
    }
  };

  const applyColorPreset = (preset: { primary: string; heading: string; text: string; pattern: string }) => {
    setPrimaryColor(preset.primary);
    setHeadingColor(preset.heading);
    setTextColor(preset.text);
    setBgPattern(preset.pattern);
  };

  const handleSaveAllowedGrades = async (e: React.FormEvent) => {
    e.preventDefault();
    setGradesMsg(null);
    try {
      await apiRequest('teacher', '/api/teacher/allowed-grades', { allowedGrades: allowedGradesState });
      setGradesMsg({ text: 'تم تحديث وحفظ قائمة الصفوف الدراسية المتاحة بالمنصة بنجاح!', ok: true });
      await onRefresh();
      if (onUpdatePublic) await onUpdatePublic();
    } catch (err: any) {
      setGradesMsg({ text: err.message || 'تعذر حفظ الصفوف الدراسية', ok: false });
    }
  };

  const handleSaveRegFieldsConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegConfigMsg(null);
    try {
      await apiRequest('teacher', '/api/teacher/registration-config', regFieldsState);
      setRegConfigMsg({ text: 'تم تحديث إعدادات ونماذج تسجيل الطلاب بنجاح!', ok: true });
      await onRefresh();
      if (onUpdatePublic) await onUpdatePublic();
    } catch (err: any) {
      setRegConfigMsg({ text: err.message || 'تعذر حفظ نماذج التسجيل', ok: false });
    }
  };

  const handleSaveGradeToolsConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setGradeToolsMsg(null);
    try {
      await apiRequest('teacher', '/api/teacher/grade-interactive-tools-config', gradeToolsMatrix);
      setGradeToolsMsg({ text: 'تم حفظ إمكانيات وأدوات المادة لكل صف دراسي بنجاح وتحديث قاعدة البيانات!', ok: true });
      await onRefresh();
      if (onUpdatePublic) await onUpdatePublic();
    } catch (err: any) {
      setGradeToolsMsg({ text: err.message || 'تعذر حفظ إعدادات الأدوات', ok: false });
    }
  };

  const handleResetPlatformData = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resetConfirmInput.trim() !== 'مسح البيانات بالكامل') {
      alert('يرجى كتابة العبارة التأكيدية بدقة: "مسح البيانات بالكامل" لتأكيد مسح وتنظيف البيانات.');
      return;
    }
    setResetLoading(true);
    setResetMsg(null);
    try {
      const res = await apiRequest('teacher', '/api/teacher/reset-platform-data', {
        confirmText: resetConfirmInput.trim(),
      });
      setResetMsg({ text: res.message || 'تم تنظيف ومسح كافة بيانات المنصة بنجاح!', ok: true });
      setResetConfirmInput('');
      setIsResetModalOpen(false);
      await onRefresh();
      if (onUpdatePublic) await onUpdatePublic();
    } catch (err: any) {
      setResetMsg({ text: err.message || 'تعذر مسح بيانات المنصة', ok: false });
    } finally {
      setResetLoading(false);
    }
  };

  const handleArchiveCourse = async (id: string) => {
    try {
      await apiRequest('teacher', '/api/teacher/course/archive', { id });
      await onRefresh();
    } catch (err: any) {
      alert(err.message || 'تعذر أرشفة الكورس');
    }
  };

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    setNMsg(null);
    try {
      await apiRequest('teacher', '/api/teacher/notice', {
        kind: nKind,
        text: nText,
        grade: nGrade,
      });
      setNMsg({ text: 'تم نشر الإعلان بنجاح!', ok: true });
      setNText('');
      await onRefresh();
      if (onUpdatePublic) await onUpdatePublic();
    } catch (err: any) {
      setNMsg({ text: err.message || 'تعذر نشر الإعلان', ok: false });
    }
  };

  const handleDeleteNotice = async (id: string) => {
    try {
      await apiRequest('teacher', `/api/teacher/notice?id=${id}`, undefined, 'DELETE');
      await onRefresh();
      if (onUpdatePublic) await onUpdatePublic();
    } catch (err: any) {
      alert(err.message || 'تعذر حذف الإعلان');
    }
  };

  const handleGenerateCodes = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiRequest('teacher', '/api/teacher/codes', {
        courseId: codeCourseId || null,
        count: codeCount,
        days: codeDays,
      });
      setGeneratedCodes(res.codes || []);
      setGeneratedMsg(res.messageText || '');
      setCopyStatus(false);
      await onRefresh();
    } catch (err: any) {
      alert(err.message || 'تعذر توليد الأكواد');
    }
  };

  const handleCopyCodes = () => {
    if (generatedCodes.length === 0) return;
    navigator.clipboard.writeText(generatedCodes.join('\n'));
    setCopyStatus(true);
    setTimeout(() => setCopyStatus(false), 3000);
  };

  const handlePrintCodes = () => {
    if (generatedCodes.length === 0) return;
    const win = window.open('', '_blank');
    if (!win) return;
    const course = teacherData?.courses.find(c => c.id === codeCourseId);
    const title = course ? `أكواد كورس: ${course.title}` : 'أكواد تفعيل المنصة';
    
    win.document.write(`
      <html dir="rtl">
        <head>
          <title>طباعة الأكواد</title>
          <style>
            body { font-family: 'Cairo', sans-serif; padding: 20px; }
            h2 { text-align: center; color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: center; }
            th { background-color: #f4f4f4; font-weight: bold; }
            .code { font-family: monospace; font-weight: bold; font-size: 1.2em; letter-spacing: 1px; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <h2>${title}</h2>
          <p style="text-align: center; color: #666;">إجمالي الأكواد: ${generatedCodes.length} | الصلاحية: ${codeDays} يوم</p>
          <table>
            <thead>
              <tr>
                <th>م</th>
                <th>كود التفعيل</th>
                <th>توقيع الطالب</th>
              </tr>
            </thead>
            <tbody>
              ${generatedCodes.map((c, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td class="code">${c}</td>
                  <td>________________</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="no-print" style="margin-top: 30px; text-align: center;">
            <button onclick="window.print()" style="padding: 10px 20px; font-size: 16px; cursor: pointer; background: #0284c7; color: white; border: none; border-radius: 5px;">بدء الطباعة الآن</button>
          </div>
        </body>
      </html>
    `);
    win.document.close();
  };

  const handleDeleteCode = async (id: string) => {
    try {
      await apiRequest('teacher', `/api/teacher/code?id=${id}`, undefined, 'DELETE');
      await onRefresh();
    } catch (err: any) {
      alert(err.message || 'تعذر حذف الكود');
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponMsg(null);
    setCouponLoading(true);
    try {
      await apiRequest('teacher', '/api/teacher/coupon', {
        code: couponCode.trim(),
        discountType: couponDiscountType,
        discountValue: couponDiscountValue,
        courseId: couponCourseId || undefined,
        maxUses: couponMaxUses
      });
      setCouponMsg({ text: 'تم إنشاء كوبون الخصم بنجاح!', ok: true });
      setCouponCode('');
      setCouponDiscountValue(20);
      await onRefresh();
    } catch (err: any) {
      setCouponMsg({ text: err.message || 'تعذر إنشاء الكوبون', ok: false });
    } finally {
      setCouponLoading(false);
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الكوبون؟')) return;
    try {
      await apiRequest('teacher', `/api/teacher/coupon?id=${id}`, undefined, 'DELETE');
      await onRefresh();
    } catch (err: any) {
      alert(err.message || 'تعذر حذف الكوبون');
    }
  };

  const handlePublishContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setContentMsg(null);

    let fileUrl = contentLink;

    if (contentFile) {
      try {
        setUploadProgress(0);
        const res = await uploadFile('/api/upload', contentFile, (p: number) => setUploadProgress(Math.round(p * 100)));
        fileUrl = (res as any).url || `/uploads/${res.fileId}`;
      } catch (err) {
        setContentMsg({ text: 'فشل رفع الملف', ok: false });
        setUploadProgress(null);
        return;
      } finally {
        setUploadProgress(null);
      }
    }

    if (!fileUrl) {
      setContentMsg({ text: 'يرجى اختيار ملف أو وضع رابط محتوى', ok: false });
      return;
    }

    try {
      await apiRequest('teacher', '/api/teacher/content', {
        type: contentType,
        title: contentTitle,
        url: fileUrl,
        courseId: contentCourseId || null,
        grade: contentGrade,
        isFree: contentIsFree,
        lecture: contentLecture.trim(),
      });
      setContentMsg({ text: 'تم نشر المحتوى بنجاح!', ok: true });
      setContentTitle('');
      setContentLecture('');
      setContentLink('');
      setContentFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      await onRefresh();
    } catch (err: any) {
      setContentMsg({ text: err.message || 'تعذر نشر المحتوى', ok: false });
    }
  };

  const handleDeleteContent = async (id: string) => {
    try {
      await apiRequest('teacher', `/api/teacher/content?id=${id}`, undefined, 'DELETE');
      await onRefresh();
    } catch (err: any) {
      alert(err.message || 'تعذر حذف المحتوى');
    }
  };

  const handleAddQuestion = (count: number = 1) => {
    if (examItems.length >= 50) {
      alert('الحد الأقصى المسموح به هو 50 سؤالاً للامتحان الواحد');
      return;
    }
    const canAdd = Math.min(count, 50 - examItems.length);
    const newItems: QuestionItem[] = [];
    for (let i = 0; i < canAdd; i++) {
      newItems.push({
        kind: 'mcq',
        q: '',
        options: ['', '', '', ''],
        answer: 'أ',
        model: '',
        attachmentUrl: '',
        attachmentType: 'image',
        points: 1,
      });
    }
    setExamItems([...examItems, ...newItems]);
  };

  const handleUpdateQuestion = (index: number, updated: Partial<QuestionItem>) => {
    const next = [...examItems];
    next[index] = { ...next[index], ...updated };
    setExamItems(next);
  };

  const handleRemoveQuestion = (index: number) => {
    if (examItems.length <= 1) {
      alert('يجب أن يحتوي الامتحان على سؤال واحد على الأقل');
      return;
    }
    setExamItems(examItems.filter((_, i) => i !== index));
  };

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    setExamMsg(null);
    if (!examTitle.trim()) {
      setExamMsg({ text: 'يرجى كتابة عنوان الامتحان', ok: false });
      return;
    }

    for (let i = 0; i < examItems.length; i++) {
      const it = examItems[i];
      if (!it.q.trim()) {
        setExamMsg({ text: `يرجى كتابة نص السؤال رقم ${i + 1}`, ok: false });
        return;
      }
      if (it.kind === 'mcq') {
        if (it.options.some((o) => !o.trim())) {
          setExamMsg({ text: `يرجى ملء جميع الخيارات الأربعة للسؤال رقم ${i + 1}`, ok: false });
          return;
        }
      }
    }

    setExamLoading(true);
    try {
      let finalExamAttachment = examAttachmentUrl.trim();
      if (examAttachmentFile) {
        try {
          const uRes = await uploadFile('/api/upload', examAttachmentFile);
          finalExamAttachment = (uRes as any).url || `/receipts/${uRes.fileId}`;
        } catch {
          setExamMsg({ text: 'تعذر رفع الملف المرفق مع الامتحان', ok: false });
          setExamLoading(false);
          return;
        }
      }

      await apiRequest('teacher', '/api/teacher/exam', {
        title: examTitle.trim(),
        courseId: examCourseId || null,
        grade: examGrade,
        isFree: examIsFree,
        attachmentUrl: finalExamAttachment || undefined,
        attachmentType: examAttachmentType || undefined,
        questions: examItems.map((q) => ({
          kind: q.kind,
          q: q.q.trim(),
          options: q.kind === 'true_false' ? ['صح', 'خطأ'] : q.options.map((o) => o.trim()),
          answer: q.kind === 'essay' ? '' : q.answer,
          model: q.kind === 'essay' ? q.model.trim() : '',
          attachmentUrl: q.attachmentUrl?.trim() || undefined,
          attachmentType: q.attachmentType || undefined,
          points: q.points || 1,
        })),
      });

      setExamMsg({
        text: `تم إنشاء الامتحان بنجاح بنموذج الإجابة الإلكتروني المعتمد (${examItems.length} سؤال)!`,
        ok: true,
      });
      setExamTitle('');
      setExamAttachmentUrl('');
      setExamAttachmentFile(null);
      setExamItems([
        {
          kind: 'mcq',
          q: '',
          options: ['', '', '', ''],
          answer: 'أ',
          model: '',
          attachmentUrl: '',
          attachmentType: 'image',
          points: 1,
        },
      ]);
      await onRefresh();
      if (onUpdatePublic) await onUpdatePublic();
    } catch (err: any) {
      setExamMsg({ text: err.message || 'تعذر إنشاء الامتحان', ok: false });
    } finally {
      setExamLoading(false);
    }
  };

  // Handlers for Store Books & Orders
  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookMsg(null);
    if (!bookTitle.trim()) {
      setBookMsg({ text: 'يرجى إدخال عنوان الكتاب أو المذكرة', ok: false });
      return;
    }
    setBookLoading(true);
    try {
      let finalCover = bookCoverUrl.trim();
      if (bookCoverFile) {
        try {
          const uRes = await uploadFile('/api/upload', bookCoverFile);
          finalCover = (uRes as any).url || `/receipts/${uRes.fileId}`;
        } catch {
          setBookMsg({ text: 'فشل رفع صورة غلاف الكتاب', ok: false });
          setBookLoading(false);
          return;
        }
      }

      let finalPdf = bookPdfUrl.trim();
      if (bookPdfFile) {
        try {
          const uRes = await uploadFile('/api/upload', bookPdfFile);
          finalPdf = (uRes as any).url || `/receipts/${uRes.fileId}`;
        } catch {
          setBookMsg({ text: 'فشل رفع ملف الـ PDF', ok: false });
          setBookLoading(false);
          return;
        }
      }

      await apiRequest('teacher', '/api/teacher/books', {
        title: bookTitle.trim(),
        grade: bookGrade,
        price: bookIsFree ? 0 : Number(bookPrice),
        description: bookDesc.trim(),
        coverImage: finalCover || undefined,
        pdfUrl: finalPdf || undefined,
        pagesCount: Number(bookPages) || 1,
        isFree: bookIsFree,
      });

      setBookMsg({ text: 'تم نشر الكتاب بنجاح في متجر المنصة العام!', ok: true });
      setBookTitle('');
      setBookDesc('');
      setBookCoverUrl('');
      setBookPdfUrl('');
      setBookCoverFile(null);
      setBookPdfFile(null);
      await onRefresh();
      if (onUpdatePublic) await onUpdatePublic();
    } catch (err: any) {
      setBookMsg({ text: err.message || 'تعذر إضافة الكتاب', ok: false });
    } finally {
      setBookLoading(false);
    }
  };

  const handleDeleteBook = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الكتاب من المتجر؟')) return;
    try {
      await apiRequest('teacher', `/api/teacher/books?id=${id}`, undefined, 'DELETE');
      await onRefresh();
      if (onUpdatePublic) await onUpdatePublic();
    } catch (err: any) {
      alert(err.message || 'تعذر حذف الكتاب');
    }
  };

  const handleReviewStoreOrder = async (orderId: string, status: 'approved' | 'rejected') => {
    try {
      await apiRequest('teacher', '/api/teacher/store-orders/review', { orderId, status });
      await onRefresh();
      if (onUpdatePublic) await onUpdatePublic();
    } catch (err: any) {
      alert(err.message || 'تعذر معالجة الطلب');
    }
  };

  // Handlers for About Us & Platform Features
  const handleSaveAboutUs = async (e: React.FormEvent) => {
    e.preventDefault();
    setAboutMsg(null);
    setAboutLoading(true);
    try {
      await apiRequest('teacher', '/api/teacher/about-us', {
        title: aboutTitle.trim(),
        subtitle: aboutSubtitle.trim(),
        subject: aboutSubject.trim(),
        bio: aboutBio.trim(),
        vision: aboutVision.trim(),
        mission: aboutMission.trim(),
        experienceYears: String(aboutExp).trim(),
        studentsCount: String(aboutStudents).trim(),
        lecturesCount: String(aboutLectures).trim(),
        satisfactionRate: String(aboutSatisfaction).trim(),
        teacherImage: aboutTeacherImage.trim(),
        features: aboutFeatures,
      });
      setAboutMsg({ text: 'تم حفظ وتحديث بيانات "من نحن" وأهم مميزات المنصة بنجاح في الموقع العام!', ok: true });
      await onRefresh();
      if (onUpdatePublic) await onUpdatePublic();
    } catch (err: any) {
      setAboutMsg({ text: err.message || 'تعذر حفظ البيانات', ok: false });
    } finally {
      setAboutLoading(false);
    }
  };

  // Handlers for Articles
  const handleCreateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    setArtMsg(null);
    if (!artTitle.trim() || !artContent.trim()) {
      setArtMsg({ text: 'يرجى كتابة عنوان المقال والمحتوى بالكامل', ok: false });
      return;
    }
    setArtLoading(true);
    try {
      await apiRequest('teacher', '/api/teacher/articles', {
        title: artTitle.trim(),
        category: artCategory.trim(),
        readTime: artReadTime.trim(),
        imageUrl: artImageUrl.trim() || undefined,
        summary: artSummary.trim() || artContent.trim().substring(0, 150) + '...',
        content: artContent.trim(),
      });
      setArtMsg({ text: 'تم نشر المقال بنجاح في قسم "مقالاتنا" العام!', ok: true });
      setArtTitle('');
      setArtSummary('');
      setArtContent('');
      setArtImageUrl('');
      await onRefresh();
      if (onUpdatePublic) await onUpdatePublic();
    } catch (err: any) {
      setArtMsg({ text: err.message || 'تعذر نشر المقال', ok: false });
    } finally {
      setArtLoading(false);
    }
  };

  const handleDeleteArticle = async (id: string) => {
    if (!window.confirm('هل تريد حذف هذا المقال نهائياً من المنصة؟')) return;
    try {
      await apiRequest('teacher', `/api/teacher/articles?id=${id}`, undefined, 'DELETE');
      await onRefresh();
      if (onUpdatePublic) await onUpdatePublic();
    } catch (err: any) {
      alert(err.message || 'تعذر حذف المقال');
    }
  };

  const handleDeleteExam = async (id: string) => {
    try {
      await apiRequest('teacher', `/api/teacher/exam?id=${id}`, undefined, 'DELETE');
      await onRefresh();
    } catch (err: any) {
      alert(err.message || 'تعذر حذف الامتحان');
    }
  };

  const handleGradeExam = async (resultId: string, total: number) => {
    const scoreVal = gradingScores[resultId];
    if (scoreVal === undefined || scoreVal === '') return;
    const scoreNum = Number(scoreVal);
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > total) {
      alert(`الدرجة يجب أن تكون بين 0 و ${total}`);
      return;
    }
    try {
      await apiRequest('teacher', '/api/teacher/grade', {
        resultId,
        score: scoreNum,
      });
      await onRefresh();
    } catch (err: any) {
      alert(err.message || 'تعذر حفظ الدرجة');
    }
  };

  const handleReplyMessage = async (messageId: string) => {
    const replyText = messageReplies[messageId];
    if (!replyText || !replyText.trim()) return;
    try {
      await apiRequest('teacher', '/api/teacher/message/reply', {
        messageId,
        reply: replyText.trim(),
      });
      await onRefresh();
    } catch (err: any) {
      alert(err.message || 'تعذر إرسال الرد');
    }
  };

  const handleReviewAppeal = async (appealId: string) => {
    const scoreVal = appealScores[appealId];
    try {
      await apiRequest('teacher', '/api/teacher/appeal/review', {
        appealId,
        score: scoreVal !== undefined && scoreVal !== '' ? Number(scoreVal) : undefined,
      });
      await onRefresh();
    } catch (err: any) {
      alert(err.message || 'تعذر إنهاء مراجعة التظلم');
    }
  };

  const handleStudentAction = async (id: string, action: string) => {
    let password;
    if (action === 'setpass') {
      password = prompt('أدخل كلمة السر الجديدة للطالب:');
      if (!password) return;
    } else if (action === 'delete') {
      if (!window.confirm('هل أنت متأكد من حذف حساب هذا الطالب كاملاً؟')) return;
    }
    try {
      await apiRequest('teacher', '/api/teacher/student', {
        id,
        action,
        days: 30,
        password,
      });
      await onRefresh();
    } catch (err: any) {
      alert(err.message || 'حدث خطأ');
    }
  };

  const handleParentBlock = async (id: string) => {
    try {
      await apiRequest('teacher', '/api/teacher/parent', { id });
      await onRefresh();
    } catch (err: any) {
      alert(err.message || 'تعذر تغيير حالة ولي الأمر');
    }
  };

  const handleCreateLiveSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setMeetMsg(null);
    setMeetLoading(true);
    try {
      await apiRequest('teacher', '/api/teacher/live-session', {
        title: meetTitle,
        meetUrl,
        grade: meetGrade,
        scheduledAt: meetScheduledAt || new Date().toISOString(),
        status: meetStatus,
        notes: meetNotes,
      });
      setMeetMsg({ text: 'تم إنشاء ونشر البث المباشر (Google Meet) وتسجيله بنجاح!', ok: true });
      setMeetTitle('');
      setMeetUrl('');
      setMeetNotes('');
      await onRefresh();
    } catch (err: any) {
      setMeetMsg({ text: err.message || 'تعذر نشر حلقة البث المباشر', ok: false });
    } finally {
      setMeetLoading(false);
    }
  };

  const handleDeleteLiveSession = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف جلسة البث وسجلات حضورها؟')) return;
    try {
      await apiRequest('teacher', '/api/teacher/live-session/delete', { id });
      await onRefresh();
    } catch (err: any) {
      alert(err.message || 'تعذر حذف البث المباشر');
    }
  };

  const handleManualAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualSessionId || !manualStudentId) {
      alert('اختر حلقة البث المباشر والطالب لتسجيل الحضور يدوياً');
      return;
    }
    try {
      await apiRequest('teacher', '/api/teacher/live-attendance/manual', {
        sessionId: manualSessionId,
        studentId: manualStudentId,
        status: 'حاضر يدوياً',
      });
      alert('تم تسجيل حضور الطالب يدوياً بنجاح!');
      setManualStudentId('');
      await onRefresh();
    } catch (err: any) {
      alert(err.message || 'تعذر تسجيل الحضور');
    }
  };

  const LETTERS = ['أ', 'ب', 'ج', 'د'];

  // Unauthenticated teacher screen
  if (!teacherData) {
    return (
      <div className="card p-6 sm:p-8 max-w-md mx-auto text-right bg-[#0f1b2d] border border-blue-500/20 shadow-2xl">
        <div className="flex items-center gap-2 mb-4 justify-center text-amber-400">
          <Shield className="w-8 h-8" />
          <h2 className="text-xl font-black text-white">لوحة تحكم المعلم والمشرفين</h2>
        </div>
        <p className="text-xs text-slate-300 mb-6 text-center leading-relaxed">
          سجل دخولك كمدير أو مشرف لإدارة الكورسات والطلاب والاختبارات.
        </p>

        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setLoginMode('admin')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              loginMode === 'admin'
                ? 'bg-amber-600 text-white shadow-lg'
                : 'bg-[#111f36] text-slate-400 hover:text-white'
            }`}
          >
            دخول الأدمن (الرئيسي)
          </button>
          <button
            type="button"
            onClick={() => setLoginMode('supervisor')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              loginMode === 'supervisor'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-[#111f36] text-slate-400 hover:text-white'
            }`}
          >
            دخول مشرف (بالرقم والسر)
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {loginMode === 'admin' ? (
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">كود دخول الأدمن</label>
              <div className="relative">
                <input
                  type={showAdminCode ? 'text' : 'password'}
                  required
                  className="input-field text-center font-mono text-lg pl-10"
                  placeholder="••••••••"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowAdminCode(!showAdminCode)}
                  aria-label={showAdminCode ? 'إخفاء كود الأدمن' : 'إظهار كود الأدمن'}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-300 transition-colors p-1 cursor-pointer"
                >
                  {showAdminCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">رقم الهاتف</label>
                <input
                  type="text"
                  required
                  className="input-field text-center font-mono text-sm"
                  placeholder="010xxxxxxxx"
                  value={supLoginPhone}
                  onChange={(e) => setSupLoginPhone(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">كلمة السر</label>
                <div className="relative">
                  <input
                    type={showSupLoginPw ? 'text' : 'password'}
                    required
                    className="input-field text-center font-mono text-sm pl-10"
                    placeholder="••••••••"
                    value={supLoginPassword}
                    onChange={(e) => setSupLoginPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSupLoginPw(!showSupLoginPw)}
                    aria-label={showSupLoginPw ? 'إخفاء كلمة السر' : 'إظهار كلمة السر'}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-300 transition-colors p-1 cursor-pointer"
                  >
                    {showSupLoginPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={authLoading}
            className="btn-gold w-full py-3 text-sm font-extrabold flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{authLoading ? 'جاري التحقق...' : 'دخول لوحة التحكّم'}</span>
            <ArrowRight className="w-4 h-4 rotate-180" />
          </button>

          {authError && (
            <p className="text-xs font-bold text-red-400 bg-red-950/60 p-2.5 rounded-xl text-center border border-red-500/30">
              {authError}
            </p>
          )}
        </form>

        <div className="mt-6 pt-4 border-t border-blue-500/15 text-center">
          <button
            onClick={onBackToStudent}
            className="text-xs text-slate-400 hover:text-cyan-300 font-bold transition-colors cursor-pointer"
          >
            العودة لواجهة الطالب الرئيسية
          </button>
        </div>
      </div>
    );
  }

  // Filter students
  const filteredStudents = teacherData.students.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.phone.includes(q) ||
      s.code.toLowerCase().includes(q) ||
      s.parentName?.toLowerCase().includes(q) ||
      s.parentPhone?.includes(q)
    );
  });

  const filteredParents = teacherData.parents.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q);
  });

  const pendingGradingCount = teacherData.results.filter((r) => r.status !== 'graded').length;
  const pendingRechargesCount = (teacherData.walletRechargeRequests || []).filter((r) => r.status === 'pending').length;
  const pendingPackageOrdersCount = (teacherData.packageOrders || []).filter((o) => o.status === 'pending').length;

  return (
    <div className="rounded-b-[1.5rem] bg-[#0c1626] border border-t-0 border-blue-500/20 p-5 sm:p-8 space-y-6 shadow-2xl text-right">
      {/* Top Banner */}
      <section
        className="panel border border-blue-500/25 p-6 shadow-2xl relative overflow-hidden rounded-2xl"
        style={{
          background: 'linear-gradient(145deg, #0f1c34 0%, #0a1324 100%)',
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-blue-500/15">
          <div className="flex flex-wrap items-center gap-2">
            <span className="badge-pill bg-amber-950/40 text-amber-400 border-amber-500/30">
              <Shield className="w-3.5 h-3.5" />
              <span>المدير العام للمنظومة (Super Admin)</span>
            </span>
            <span className="badge-pill bg-blue-950/40 text-blue-300 border-blue-500/30">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              <span>23 أقسام مسموحة</span>
            </span>
            <span className="badge-pill bg-emerald-950/40 text-emerald-400 border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>متصل بالخادم السحابي</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onBackToStudent}
              className="btn-gray btn-sm text-xs cursor-pointer"
            >
              <span>مساحة الطالب</span>
            </button>
            <button
              onClick={onLogout}
              className="btn-red btn-sm flex items-center gap-1.5 text-xs cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>

        <div className="mt-2">
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <span>إدارة المنظومة التعليمية ونظام المحتوى الشامل</span>
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
            تحكم كامل في نشر وحجب الكورسات، الفيديوهات، الامتحانات التفاعلية، إدارة الطلاب وأولياء الأمور،
            توليد الأكواد وتتبع طلبات التعديل والاشتراكات.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          <div className="card bg-[#111f36] border border-blue-500/20 p-3">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Users className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold">الطلاب المسجلون</h3>
            </div>
            <p className="text-2xl font-black text-white">{teacherData.students.length}</p>
          </div>

          <div className="card bg-[#111f36] border border-blue-500/20 p-3">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <UserCheck className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold">أولياء الأمور</h3>
            </div>
            <p className="text-2xl font-black text-white">{teacherData.parents.length}</p>
          </div>

          <div className="card bg-[#111f36] border border-blue-500/20 p-3">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Wallet className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold">طلبات شحن المحفظة</h3>
            </div>
            <p className="text-2xl font-black text-emerald-400">{pendingRechargesCount} معلقة</p>
          </div>

          <div className="card bg-[#111f36] border border-blue-500/20 p-3">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <CreditCard className="w-4 h-4 text-purple-400" />
              <h3 className="text-xs font-bold">طلبات باقات الأوف لاين</h3>
            </div>
            <p className="text-2xl font-black text-purple-400">{pendingPackageOrdersCount} معلقة</p>
          </div>
        </div>
      </section>

      {/* Main Tabs Navigation */}
      <div className="border-b border-blue-500/20 pb-2">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {[
            { id: 'overview', label: '📊 نظرة عامة والإحصائيات', desc: 'المؤشرات والتنبيهات' },
            { id: 'financials', label: '💳 الماليات والشحن', desc: 'طرق الدفع والإيصالات' },
            { id: 'content', label: '📚 الكورسات والامتحانات (50 سؤال)', desc: 'رفع المحتوى والامتحانات والتصحيح' },
            { id: 'media-management', label: '📺 إدارة المحتوى', desc: 'عرض وحذف الفيديوهات والملحقات' },
            { id: 'store', label: '🛍️ متجر الكتب وطلبات الشراء', desc: 'إدارة الـ PDF ومبيعات الزوار' },
            { id: 'about', label: '🏛️ من نحن ومميزات المنصة', desc: 'السيرة الذاتية والمميزات الستة' },
            { id: 'articles', label: '📰 إدارة مقالات المنصة', desc: 'نشر وإدارة المقالات العامة' },
            { id: 'bundles', label: '📦 إدارة الباقات', desc: 'مجموعات الكورسات بخصم' },
            { id: 'top-students', label: '🏆 لوحة شرف المتفوقين', desc: 'إدارة ونشر المتفوقين وصورهم' },
            { id: 'students', label: '👥 إدارة الطلاب والأكواد', desc: 'الحسابات وتقارير المتابعة' },
            { id: 'meet', label: '🔴 البث المباشر (Meet)', desc: 'ربط الحصص وتتبع الحضور' },
            { id: 'settings', label: '⚙️ مصمم المنصة والمظهر', desc: 'الشعار والألوان والقنوات' },
            { id: 'supervisors', label: '🛡️ إدارة المشرفين', desc: 'الصلاحيات والوصول' },
          ].map((tab) => {
            const isActive = activeMainTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveMainTab(tab.id as any)}
                className={`py-2.5 px-3 rounded-xl text-right transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg border border-cyan-400/40 ring-2 ring-cyan-400/30'
                    : 'bg-[#111f36] text-slate-300 hover:text-white hover:bg-[#162744] border border-blue-500/15'
                }`}
              >
                <p className="font-black text-xs">{tab.label}</p>
                <p className={`text-[10px] mt-0.5 line-clamp-1 ${isActive ? 'text-cyan-200' : 'text-slate-400'}`}>
                  {tab.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: OVERVIEW & STATS */}
      {activeMainTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Notices & Announcements Form & List */}
            <section className="panel border border-blue-500/25 bg-[#0f1b2d] shadow-xl p-5 rounded-2xl">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-blue-500/15">
                <Bell className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-lg text-white">نشر إعلان أو موعد درس</h3>
              </div>
              <form onSubmit={handleCreateNotice} className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">النوع</label>
                  <select
                    className="input-field"
                    value={nKind}
                    onChange={(e) => setNKind(e.target.value as any)}
                  >
                    <option value="announcement">إعلان عام</option>
                    <option value="schedule">موعد درس</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">الصف المستهدف</label>
                  <select
                    className="input-field"
                    value={nGrade}
                    onChange={(e) => setNGrade(e.target.value)}
                  >
                    {ALL_GRADES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1">نص الإعلان</label>
                  <textarea
                    rows={2}
                    required
                    className="input-field text-xs"
                    value={nText}
                    onChange={(e) => setNText(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn-primary sm:col-span-2 py-2 font-bold text-xs cursor-pointer">
                  نشر الإعلان
                </button>
                {nMsg && (
                  <p
                    className={`sm:col-span-2 text-xs font-bold ${
                      nMsg.ok ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {nMsg.text}
                  </p>
                )}
              </form>

              <div className="mt-4 grid gap-2 sm:grid-cols-2 max-h-48 overflow-y-auto">
                {teacherData.notices.map((n) => (
                  <div key={n.id} className="card bg-[#111f36] p-2.5 flex justify-between items-center text-xs border border-blue-500/15">
                    <div>
                      <span className="font-bold text-cyan-300">
                        [{n.kind === 'schedule' ? 'موعد درس' : 'إعلان'}] - {n.grade}:
                      </span>
                      <p className="mt-1 text-slate-200">{n.text}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteNotice(n.id)}
                      className="btn-red btn-sm text-[10px] cursor-pointer"
                    >
                      حذف
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Platform Overview Info */}
            <section className="panel border border-blue-500/25 bg-[#0f1b2d] shadow-xl p-5 rounded-2xl">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-blue-500/15">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <h3 className="font-extrabold text-lg text-white">حالة المنظومة والمهام المعلقة</h3>
              </div>
              <div className="space-y-3 text-xs text-slate-300">
                <div className="p-3 bg-[#111f36] rounded-xl border border-blue-500/15 flex justify-between items-center">
                  <span>إجابات الطلاب بانتظار التصحيح</span>
                  <span className="font-extrabold text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-500/30">
                    {pendingGradingCount} إجابة
                  </span>
                </div>
                <div className="p-3 bg-[#111f36] rounded-xl border border-blue-500/15 flex justify-between items-center">
                  <span>طلبات شحن رصيد المحفظة المعلقة</span>
                  <span className="font-extrabold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                    {pendingRechargesCount} طلب
                  </span>
                </div>
                <div className="p-3 bg-[#111f36] rounded-xl border border-blue-500/15 flex justify-between items-center">
                  <span>طلبات اشتراكات باقات الأوف لاين</span>
                  <span className="font-extrabold text-purple-400 bg-purple-950/60 px-2.5 py-1 rounded-lg border border-purple-500/30">
                    {pendingPackageOrdersCount} طلب
                  </span>
                </div>
              </div>
            </section>
          </div>
        </div>
      )}

      {/* TAB 2: BUNDLES MANAGEMENT */}
      {activeMainTab === 'bundles' && (
        <div className="space-y-6">
          <section className="panel border border-cyan-500/25 bg-[#0f1b2d] shadow-xl p-5 rounded-2xl">
            <h3 className="font-extrabold text-lg text-white mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              إنشاء باقة كورسات جديدة
            </h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await apiRequest('teacher', '/api/teacher/bundles', {
                    title: (e.target as any).title.value,
                    courseIds: Array.from((e.target as any).courses.selectedOptions).map((o: any) => o.value),
                    discountedPrice: Number((e.target as any).price.value),
                  });
                  alert('تم إنشاء الباقة بنجاح!');
                  await onRefresh();
                } catch (e: any) {
                  alert(e.message || 'فشل إنشاء الباقة');
                }
              }}
              className="grid gap-3"
            >
              <input name="title" placeholder="اسم الباقة" className="input-field" required />
              <select name="courses" multiple className="input-field h-32" required>
                {teacherData.courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
              <input name="price" type="number" placeholder="السعر المخفض" className="input-field" required />
              <button type="submit" className="btn-primary py-2 cursor-pointer">إنشاء الباقة</button>
            </form>
          </section>
          <section className="panel border border-blue-500/25 bg-[#0f1b2d] shadow-xl p-5 rounded-2xl">
            <h3 className="font-extrabold text-lg text-white mb-4">الباقات الحالية</h3>
            <div className="grid gap-3">
              {(teacherData as any).bundles?.map((b: any) => (
                <div key={b.id} className="card bg-[#111f36] p-3 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-white">{b.title}</p>
                    <p className="text-slate-400">السعر: {b.discountedPrice} ج.م</p>
                  </div>
                  <button 
                    onClick={async () => {
                      if(!window.confirm('حذف الباقة؟')) return;
                      await apiRequest('teacher', `/api/teacher/bundles?id=${b.id}`, undefined, 'DELETE');
                      await onRefresh();
                    }}
                    className="btn-red btn-sm cursor-pointer"
                  >حذف</button>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
      {/* TAB 2: MEDIA MANAGEMENT */}
      {activeMainTab === 'media-management' && (
        <div className="space-y-6">
          <section className="panel border border-blue-500/25 bg-[#0f1b2d] shadow-xl p-5 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-blue-500/15">
              <Video className="w-5 h-5 text-cyan-400" />
              <h3 className="font-extrabold text-lg text-white">إدارة المحتوى (فيديوهات، ملفات، واجبات، صور)</h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {teacherData.content.map((c) => (
                <div key={c.id} className="card bg-[#111f36] border border-blue-500/20 p-4 rounded-xl flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-blue-950/60 text-cyan-400">
                      {c.type === 'video' ? <Video className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-white truncate">{c.title}</h4>
                      <p className="text-[10px] text-slate-400">{c.type} • {c.grade}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => window.open(c.url || c.link, '_blank')}
                      className="btn-cyan btn-sm flex-1 text-xs cursor-pointer"
                    >
                      فتح / سماع
                    </button>
                    <button
                      onClick={() => handleDeleteContent(c.id)}
                      className="btn-red btn-sm text-xs cursor-pointer"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
      {activeMainTab === 'financials' && (
        <div className="space-y-6">
          {/* Wallet Recharge Requests Review */}
          <section className="panel border border-blue-500/25 bg-[#0f1b2d] shadow-xl p-5 rounded-2xl">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-2 border-b border-blue-500/15">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-lg text-white">طلبات مراجعة شحن المحفظة ({pendingRechargesCount})</h3>
              </div>
              <div className="flex items-center gap-1 text-xs">
                {(['pending', 'all', 'approved', 'rejected'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setRechargesFilter(filter)}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                      rechargesFilter === filter
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#111f36] text-slate-400 hover:text-white'
                    }`}
                  >
                    {filter === 'pending'
                      ? 'المعلقة'
                      : filter === 'all'
                      ? 'الكل'
                      : filter === 'approved'
                      ? 'المقبولة'
                      : 'المرفوضة'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {(teacherData.walletRechargeRequests || []).length === 0 ? (
                <p className="text-xs text-slate-400">لا توجد طلبات شحن محفظة حالياً.</p>
              ) : (
                (teacherData.walletRechargeRequests || [])
                  .filter((req) => {
                    if (rechargesFilter === 'pending') return req.status === 'pending';
                    if (rechargesFilter === 'approved') return req.status === 'approved';
                    if (rechargesFilter === 'rejected') return req.status === 'rejected';
                    return true;
                  })
                  .map((req) => (
                    <div
                      key={req.id}
                      className="card bg-[#111f36] border border-blue-500/20 p-3 text-xs flex flex-wrap justify-between items-center gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{req.studentName}</span>
                          <span
                            className={`badge-pill text-[10px] ${
                              req.status === 'approved'
                                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
                                : req.status === 'rejected'
                                ? 'bg-red-950/60 text-red-300 border-red-500/30'
                                : 'bg-amber-950/60 text-amber-300 border-amber-500/30'
                            }`}
                          >
                            {req.status === 'approved'
                              ? 'تم القبول والتمويل'
                              : req.status === 'rejected'
                              ? 'مرفوض'
                              : 'قيد المراجعة'}
                          </span>
                        </div>
                        <p className="text-slate-400 mt-1">
                          المبلغ المطلوب: <b className="text-emerald-400">{req.amount} ج.م</b> •{' '}
                          {new Date(req.created).toLocaleDateString('ar-EG')}
                        </p>
                        {req.notes && <p className="text-slate-300 mt-0.5">ملاحظات الطالب: {req.notes}</p>}
                      </div>

                      <div className="flex items-center gap-2">
                        {req.receiptUrl && (
                          <button
                            type="button"
                            onClick={() => setPreviewReceiptUrl(req.receiptUrl!)}
                            className="btn-gray btn-sm flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>معاينة الإيصال</span>
                          </button>
                        )}

                        {req.status === 'pending' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleReviewRecharge(req.id, 'approve')}
                              disabled={reviewLoading}
                              className="btn-green btn-sm font-bold cursor-pointer"
                            >
                              تأكيد وشحن {req.amount} ج.م
                            </button>
                            <button
                              type="button"
                              onClick={() => setRejectionModalTxId(req.id)}
                              disabled={reviewLoading}
                              className="btn-red btn-sm font-bold cursor-pointer"
                            >
                              رفض الطلب
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </section>

          {/* Offline Package Orders Review */}
          <section className="panel border border-blue-500/25 bg-[#0f1b2d] shadow-xl p-5 rounded-2xl">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-blue-500/15">
              <CreditCard className="w-5 h-5 text-purple-400" />
              <h3 className="font-extrabold text-lg text-white">طلبات باقات الأوف لاين والمستحقات ({pendingPackageOrdersCount})</h3>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto">
              {(teacherData.packageOrders || []).length === 0 ? (
                <p className="text-xs text-slate-400">لا توجد طلبات باقات حالياً.</p>
              ) : (
                (teacherData.packageOrders || []).map((ord) => (
                  <div
                    key={ord.id}
                    className="card bg-[#111f36] border border-blue-500/20 p-3 text-xs flex flex-wrap justify-between items-center gap-3"
                  >
                    <div>
                      <span className="font-bold text-white">{ord.studentName}</span>
                      <span className="text-purple-300 font-bold mr-2">[{ord.packageTitle}]</span>
                      <p className="text-slate-400 mt-1">
                        طريقة السداد: <b>{ord.paymentMethod === 'wallet' ? 'محفظة' : ord.paymentMethod === 'debt' ? 'مديونية' : 'إيصال تحويل'}</b> • السعر: {ord.price} ج.م
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {ord.receiptUrl && (
                        <button
                          type="button"
                          onClick={() => setPreviewReceiptUrl(ord.receiptUrl!)}
                          className="btn-gray btn-sm text-[10px] cursor-pointer"
                        >
                          الإيصال
                        </button>
                      )}
                      {ord.status === 'pending' && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleReviewPackageOrder(ord.id, 'approve')}
                            className="btn-green btn-sm text-[10px] cursor-pointer"
                          >
                            موافقة وتفعيل
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReviewPackageOrder(ord.id, 'reject')}
                            className="btn-red btn-sm text-[10px] cursor-pointer"
                          >
                            رفض
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Payment Gateways Manager */}
          <section className="panel border border-blue-500/25 bg-[#0f1b2d] shadow-xl p-5 rounded-2xl">
            <div className="flex items-center justify-between gap-2 mb-4 pb-2 border-b border-blue-500/15">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-cyan-400" />
                <h3 className="font-extrabold text-lg text-white">طرق الدفع بوسياسات التحويل المباشر</h3>
              </div>
            </div>

            <form onSubmit={handleSaveGateway} className="space-y-3">
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">اسم الطريقة</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: محفظة فودافون كاش الرسمية"
                    className="input-field text-xs"
                    value={gwTitle}
                    onChange={(e) => setGwTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">رقم الحساب / المحفظة</label>
                  <input
                    type="text"
                    required
                    dir="ltr"
                    placeholder="01000000000"
                    className="input-field text-xs"
                    value={gwAccountNumber}
                    onChange={(e) => setGwAccountNumber(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" disabled={gwLoading} className="btn-cyan w-full py-2.5 font-bold cursor-pointer">
                {gwLoading ? 'جاري الحفظ...' : 'حفظ طريقة الدفع'}
              </button>

              {gwMsg && (
                <p className={`text-xs font-bold p-2 rounded-xl text-center ${gwMsg.ok ? 'bg-emerald-950/60 text-emerald-300' : 'bg-red-950/60 text-red-300'}`}>
                  {gwMsg.text}
                </p>
              )}
            </form>

            <div className="mt-4 space-y-2">
              <h4 className="text-xs font-bold text-slate-300">الطرق المتاحة للطالب:</h4>
              {(teacherData.paymentGateways || []).map((gw) => (
                <div key={gw.id} className="p-2.5 rounded-xl bg-[#111f36] border border-blue-500/15 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-white">{gw.title}</span> - <span dir="ltr" className="font-mono text-cyan-300">{gw.accountNumber}</span>
                  </div>
                  <button onClick={() => handleDeleteGateway(gw.id)} className="btn-red btn-sm text-[10px] cursor-pointer">حذف</button>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* TAB 3: CONTENT & EXAMS */}
      {activeMainTab === 'content' && (
        <div className="space-y-6">
          {/* Publish Course */}
          <section className="panel border border-blue-500/25 bg-[#0f1b2d] shadow-xl p-5 rounded-2xl">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-blue-500/15">
              <PlusCircle className="w-5 h-5 text-cyan-400" />
              <h3 className="font-extrabold text-lg text-white">نشر كورس جديد وإرفاق صورة الغلاف</h3>
            </div>
            <form onSubmit={handleCreateCourse} className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">اسم الكورس</label>
                <input required className="input-field" value={cTitle} onChange={(e) => setCTitle(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">الصف الدراسي</label>
                <select className="input-field" value={cGrade} onChange={(e) => setCGrade(e.target.value)}>
                  {ALL_GRADES.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">السعر بالجنيه</label>
                <input type="number" min="0" required className="input-field" value={cPrice} onChange={(e) => setCPrice(Number(e.target.value))} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">المدة بالأيام</label>
                <input type="number" min="1" required className="input-field" value={cDays} onChange={(e) => setCDays(Number(e.target.value))} />
              </div>

              {/* Course Image Upload & Preview */}
              <div className="sm:col-span-2 p-3.5 rounded-xl bg-[#091222] border border-blue-500/20 space-y-2.5">
                <label className="block text-xs font-extrabold text-cyan-300">
                  صورة غلاف الكورس (اختيار ملف من جهازك أو رابط مباشر):
                </label>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">رفع ملف صورة من جهازك:</label>
                    <input
                      type="file"
                      accept="image/*"
                      className="input-field text-xs file:bg-blue-600 file:text-white file:border-0 file:rounded-lg file:px-2.5 file:py-1 file:cursor-pointer"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          setCImageFile(f);
                          const reader = new FileReader();
                          reader.onload = () => setCImagePreview(String(reader.result));
                          reader.readAsDataURL(f);
                        }
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">أو رابط صورة جاهز (URL):</label>
                    <input
                      type="url"
                      dir="ltr"
                      placeholder="https://..."
                      className="input-field text-xs"
                      value={cImageUrl}
                      onChange={(e) => {
                        setCImageUrl(e.target.value);
                        if (!cImageFile) setCImagePreview(e.target.value);
                      }}
                    />
                  </div>
                </div>

                {/* Live Preview */}
                {cImagePreview && (
                  <div className="flex items-center gap-3 pt-2">
                    <img src={cImagePreview} alt="معاينة" className="w-20 h-14 object-cover rounded-lg border border-cyan-400/50" />
                    <span className="text-[11px] text-emerald-400 font-bold">✅ تم تجهيز الصورة لنشرها مع الكورس</span>
                  </div>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-300 mb-1">وصف الكورس (اختياري)</label>
                <textarea
                  rows={2}
                  className="input-field text-xs"
                  placeholder="وصف مختصر للمحتوى والمقرر..."
                  value={cDesc}
                  onChange={(e) => setCDesc(e.target.value)}
                />
              </div>

              <div className="sm:col-span-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="c-free"
                  checked={cIsFree}
                  onChange={(e) => setCIsFree(e.target.checked)}
                  className="w-4 h-4 cursor-pointer"
                />
                <label htmlFor="c-free" className="text-xs font-bold text-white cursor-pointer">
                  كورس مجاني متاح للجميع
                </label>
              </div>

              <button
                type="submit"
                disabled={cLoading}
                className="btn-gold sm:col-span-2 py-2.5 font-bold cursor-pointer"
              >
                {cLoading ? 'جاري رفع ونشر الكورس...' : 'نشر الكورس والصورة'}
              </button>

              {cMsg && (
                <p className={`sm:col-span-2 text-xs font-bold p-2 rounded-xl text-center ${cMsg.ok ? 'bg-emerald-950/60 text-emerald-300' : 'bg-red-950/60 text-red-300'}`}>
                  {cMsg.text}
                </p>
              )}
            </form>

            <div className="mt-5 border-t border-blue-500/15 pt-3 space-y-2">
              <h4 className="text-xs font-bold text-slate-300">الكورسات الحالية المنشورة:</h4>
              <div className="grid gap-2 sm:grid-cols-2 max-h-56 overflow-y-auto">
                {teacherData.courses.map((c) => (
                  <div key={c.id} className="card bg-[#111f36] p-2.5 text-xs flex justify-between items-center border border-blue-500/15">
                    <div className="flex items-center gap-2.5">
                      {c.imageUrl ? (
                        <img src={c.imageUrl} alt={c.title} className="w-12 h-9 object-cover rounded border border-blue-500/30" />
                      ) : (
                        <div className="w-12 h-9 rounded bg-blue-900/60 flex items-center justify-center font-bold text-white text-[11px]">
                          كورس
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-white">{c.title}</p>
                        <p className="text-slate-400">{c.grade} • {c.price} ج • {c.days} يوم</p>
                      </div>
                    </div>
                    {c.status === 'published' && (
                      <button onClick={() => handleArchiveCourse(c.id)} className="btn-red btn-sm text-[10px] cursor-pointer">إيقاف</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Upload Video / Note / Homework / Image */}
          <section className="panel border border-blue-500/25 bg-[#0f1b2d] shadow-xl p-5 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-blue-500/15">
              <Upload className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="font-extrabold text-lg text-white">نشر محتوى جديد (فيديو - صورة - مذكرة - واجب)</h3>
                <p className="text-xs text-slate-400">
                  حدد الصف الدراسي، الكورس التابع له، وعما إذا كان المحتوى مجانياً لجميع الطلاب أم خاصاً بالاشتراك.
                </p>
              </div>
            </div>

            <form onSubmit={handlePublishContent} className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">نوع المحتوى المرفوع *</label>
                <select
                  className="input-field text-xs font-bold text-cyan-300"
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value as any)}
                >
                  <option value="video">🎬 فيديو تعليمي</option>
                  <option value="note">📄 مذكرة / ملف PDF</option>
                  <option value="homework">📝 واجب دراسي</option>
                  <option value="image">🖼️ صورة / لوحة توضيحية</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">الصف الدراسي المستهدف *</label>
                <select
                  className="input-field text-xs font-bold"
                  value={contentGrade}
                  onChange={(e) => setContentGrade(e.target.value)}
                >
                  {ALL_GRADES.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">الكورس التابع له (اختياري)</label>
                <select
                  className="input-field text-xs"
                  value={contentCourseId}
                  onChange={(e) => {
                    setContentCourseId(e.target.value);
                    const selectedCourse = teacherData.courses.find(c => c.id === e.target.value);
                    if (selectedCourse) {
                      setContentGrade(selectedCourse.grade);
                    }
                  }}
                >
                  <option value="">اشتراك عام في المنصة (بدون كورس محدد)</option>
                  {teacherData.courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.grade})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">عنوان المحتوى *</label>
                <input
                  required
                  placeholder="مثال: شرح درس البلاغة - المحاضرة الأولى"
                  className="input-field text-xs"
                  value={contentTitle}
                  onChange={(e) => setContentTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">اسم المحاضرة أو الفصل (اختياري)</label>
                <input
                  placeholder="مثال: الفصل الأول - المحاضرة 1"
                  className="input-field text-xs"
                  value={contentLecture}
                  onChange={(e) => setContentLecture(e.target.value)}
                />
              </div>

              {/* Free Access Checkbox */}
              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="content-free"
                  checked={contentIsFree}
                  onChange={(e) => setContentIsFree(e.target.checked)}
                  className="w-4 h-4 cursor-pointer accent-emerald-400"
                />
                <label htmlFor="content-free" className="text-xs font-extrabold text-emerald-300 cursor-pointer">
                  ✨ محتوى مجاني متاح لجميع الطلاب بدون اشتراك
                </label>
              </div>

              {/* File Upload or Direct Link */}
              <div className="sm:col-span-2 lg:col-span-3 p-3.5 rounded-2xl bg-[#091324] border border-blue-500/20 space-y-2">
                <label className="block text-xs font-extrabold text-cyan-300">
                  مصدر المحتوى (رفع ملف من جهازك أو وضع رابط مباشر / YouTube):
                </label>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">رفع ملف (فيديو / PDF / صورة) من جهازك:</label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={
                        contentType === 'video'
                          ? 'video/*'
                          : contentType === 'image'
                          ? 'image/*'
                          : '.pdf,.doc,.docx,image/*,video/*'
                      }
                      className="input-field text-xs file:bg-blue-600 file:text-white file:border-0 file:rounded-lg file:px-2.5 file:py-1 file:cursor-pointer"
                      onChange={(e) => setContentFile(e.target.files?.[0] || null)}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      رابط فيديو YouTube عادي (أو كود التضمين الكامل &lt;iframe&gt;) أو رابط مباشر:
                    </label>
                    <textarea
                      rows={2}
                      dir="ltr"
                      placeholder="ضع رابط يوتيوب العادي (https://youtu.be/...) أو كود التضمين (<iframe ...></iframe>)"
                      className="input-field text-xs font-mono w-full"
                      value={contentLink}
                      onChange={(e) => setContentLink(e.target.value)}
                    />
                    {contentLink.trim() && (
                      <div className="mt-1 flex items-center gap-1.5 text-[11px] text-cyan-300 font-semibold bg-[#060c18] p-1.5 rounded-lg border border-cyan-500/20">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>
                          {contentLink.includes('<iframe')
                            ? 'تم التعرف على كود التضمين (Embed Code) — سيتم تشغيل الفيديو داخل مشغل المنصة المحمي للطلاب'
                            : contentLink.includes('youtu')
                            ? 'تم التعرف على فيديو YouTube — سيتم تضمينه وتشغيله داخل مشغل المنصة مباشرة دون مغادرة الموقع'
                            : 'سيتم فتح وتشغيل الرابط داخل مشغل المنصة'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {uploadProgress !== null && (
                  <div className="pt-2 space-y-1">
                    <div className="flex justify-between text-[11px] text-cyan-300 font-bold">
                      <span>جاري رفع الملف للسيرفر...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-cyan-400 transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="btn-primary sm:col-span-2 lg:col-span-3 py-3 font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <Upload className="w-4 h-4" />
                <span>نشر المحتوى وتعميمه بالمنصة</span>
              </button>

              {contentMsg && (
                <p className={`sm:col-span-2 lg:col-span-3 text-xs font-bold p-3 rounded-xl text-center border ${contentMsg.ok ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40' : 'bg-red-950/70 text-red-300 border-red-500/40'}`}>
                  {contentMsg.text}
                </p>
              )}
            </form>

            {/* Published Content Items List */}
            <div className="mt-6 pt-4 border-t border-blue-500/15 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-300">المحتويات والفيديوهات المنشورة بالمنصة:</h4>
                <span className="badge-pill bg-blue-950/60 text-cyan-300 border-blue-500/40 text-[10px] font-mono">
                  {(teacherData?.content || []).length} عنصر
                </span>
              </div>

              {(!teacherData?.content || teacherData.content.length === 0) ? (
                <p className="text-xs text-slate-400 py-3 text-center bg-[#0a1222] rounded-xl border border-blue-500/10">
                  لا توجد فيديوهات أو ملفات منشورة حتى الآن.
                </p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2 max-h-72 overflow-y-auto">
                  {teacherData.content.map((item) => (
                    <div
                      key={item.id}
                      className="card bg-[#0b162a] border border-blue-500/20 p-3 rounded-xl flex items-center justify-between gap-3 hover:border-cyan-400/40 transition-all"
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            item.type === 'video'
                              ? 'bg-red-950/70 text-red-300 border border-red-500/30'
                              : 'bg-cyan-950/70 text-cyan-300 border border-cyan-500/30'
                          }`}>
                            {item.type === 'video' ? '🎬 فيديو' : item.type === 'note' ? '📄 مذكرة' : item.type === 'homework' ? '📝 واجب' : '🖼️ صورة'}
                          </span>
                          {item.isFree && (
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/50 px-1.5 py-0.2 rounded border border-emerald-500/20">
                              مجاني
                            </span>
                          )}
                        </div>
                        <h5 className="font-extrabold text-xs text-white truncate">{item.title}</h5>
                        <p className="text-[11px] text-slate-400 truncate">
                          {item.grade} {item.lecture ? `• ${item.lecture}` : ''}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {item.link && (
                          <span className="text-[10px] text-cyan-400/80 font-mono bg-[#060c18] px-1.5 py-0.5 rounded border border-cyan-500/20 hidden sm:inline">
                            مشغل المنصة
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteContent(item.id)}
                          className="btn-red btn-sm text-[10px] cursor-pointer"
                          title="حذف هذا المحتوى"
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>


          {/* Electronic Exam Builder ... */}
          <section className="panel border border-blue-500/25 bg-[#0f1b2d] shadow-xl p-5 rounded-2xl space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-blue-500/15">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-cyan-400" />
                <div>
                  <h3 className="font-extrabold text-lg text-white">
                    نظام الامتحانات والواجبات الإلكترونية (حتى 50 سؤال)
                  </h3>
                  <p className="text-xs text-slate-400">
                    رفع ملفات PDF وصور، تحديد نوع كل سؤال (اختياري / مقالي / صح وغلط)، ونموذج إجابة للتصحيح الإلكتروني الفوري.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="badge-pill bg-cyan-950/60 text-cyan-300 border-cyan-500/40 font-mono text-xs">
                  {examItems.length} / 50 سؤال
                </span>
              </div>
            </div>

            <form onSubmit={handleCreateExam} className="space-y-6">
              {/* Exam Metadata */}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">عنوان الامتحان أو الواجب *</label>
                  <input
                    required
                    placeholder="مثال: امتحان شامل على النحو والوحدة الأولى"
                    className="input-field text-xs"
                    value={examTitle}
                    onChange={(e) => setExamTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">الصف المستهدف *</label>
                  <select className="input-field text-xs font-bold" value={examGrade} onChange={(e) => setExamGrade(e.target.value)}>
                    {ALL_GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">الكورس المرتبط (اختياري)</label>
                  <select
                    className="input-field text-xs"
                    value={examCourseId}
                    onChange={(e) => {
                      setExamCourseId(e.target.value);
                      const selectedCourse = teacherData.courses.find(c => c.id === e.target.value);
                      if (selectedCourse) {
                        setExamGrade(selectedCourse.grade);
                      }
                    }}
                  >
                    <option value="">امتحان عام لجميع المشتركين</option>
                    {teacherData.courses.map((c) => (
                      <option key={c.id} value={c.id}>{c.title} ({c.grade})</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="exam-free"
                    checked={examIsFree}
                    onChange={(e) => setExamIsFree(e.target.checked)}
                    className="w-4 h-4 cursor-pointer accent-emerald-400"
                  />
                  <label htmlFor="exam-free" className="text-xs font-extrabold text-emerald-300 cursor-pointer">
                    ✨ امتحان مجاني يتاح للجميع
                  </label>
                </div>
              </div>

              {/* Exam Overall Attachment */}
              <div className="p-3.5 rounded-xl bg-[#0a1426] border border-blue-500/20 space-y-2">
                <label className="block text-xs font-extrabold text-cyan-300">
                  ملف مرفق بالامتحان (ورقة أسئلة PDF أو صورة المسألة):
                </label>
                <div className="grid gap-2 sm:grid-cols-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">رفع ملف (PDF أو صورة) من جهازك:</label>
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      className="input-field text-xs file:bg-blue-600 file:text-white file:border-0 file:rounded-lg file:px-2.5 file:py-1 file:cursor-pointer"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          setExamAttachmentFile(f);
                          setExamAttachmentType(f.type.includes('pdf') ? 'pdf' : 'image');
                        }
                      }}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] text-slate-400 mb-1">أو رابط مباشر خارجي (Google Drive / Direct URL):</label>
                    <input
                      type="url"
                      dir="ltr"
                      placeholder="https://..."
                      className="input-field text-xs"
                      value={examAttachmentUrl}
                      onChange={(e) => setExamAttachmentUrl(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Questions List (Up to 50 questions) */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                  <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <span>قائمة أسئلة الامتحان</span>
                    <span className="text-xs font-normal text-slate-400">
                      (انقر لتغيير نوع كل سؤال ونموذج الإجابة)
                    </span>
                  </h4>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleAddQuestion(1)}
                      disabled={examItems.length >= 50}
                      className="btn-primary btn-sm text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة سؤال</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddQuestion(5)}
                      disabled={examItems.length >= 50}
                      className="btn-cyan btn-sm text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+5 أسئلة سريعة</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-4 max-h-[700px] overflow-y-auto pr-1">
                  {examItems.map((item, qIdx) => (
                    <div
                      key={qIdx}
                      className="card bg-[#0b162a] border border-blue-500/25 p-4 rounded-xl space-y-3 relative group"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-blue-500/15">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-cyan-600/30 text-cyan-300 border border-cyan-400/40 flex items-center justify-center font-black text-xs">
                            {qIdx + 1}
                          </span>
                          <span className="text-xs font-bold text-white">سؤال رقم {qIdx + 1}</span>
                        </div>

                        {/* Question Type Selector */}
                        <div className="flex items-center gap-1 bg-[#091222] p-1 rounded-lg border border-blue-500/20">
                          <button
                            type="button"
                            onClick={() => {
                              const opts = item.options.length === 4 ? item.options : ['', '', '', ''];
                              handleUpdateQuestion(qIdx, { kind: 'mcq', options: opts, answer: item.answer || 'أ' });
                            }}
                            className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                              item.kind === 'mcq'
                                ? 'bg-blue-600 text-white'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            اختياري (MCQ)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              handleUpdateQuestion(qIdx, { kind: 'true_false', options: ['صح', 'خطأ'], answer: 'صح' });
                            }}
                            className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                              item.kind === 'true_false'
                                ? 'bg-amber-600 text-white'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            صح أم خطأ
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              handleUpdateQuestion(qIdx, { kind: 'essay', options: [], answer: '' });
                            }}
                            className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                              item.kind === 'essay'
                                ? 'bg-emerald-600 text-white'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            سؤال مقالي
                          </button>
                        </div>

                        {/* Remove question */}
                        {examItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestion(qIdx)}
                            className="text-red-400 hover:text-red-300 p-1 rounded cursor-pointer"
                            title="حذف هذا السؤال"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Question Text */}
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          نص السؤال *
                        </label>
                        <textarea
                          rows={2}
                          required
                          placeholder="اكتب صيغة السؤال هنا بوضوح..."
                          className="input-field text-xs"
                          value={item.q}
                          onChange={(e) => handleUpdateQuestion(qIdx, { q: e.target.value })}
                        />
                      </div>

                      {/* Question Attachment (Direct device upload or URL) */}
                      <div className="p-2.5 rounded-lg bg-[#070e1c] border border-blue-500/15 text-xs space-y-2">
                        <span className="font-bold text-slate-300 flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                          <span>صورة أو ملف مرفق بالسؤال (اختياري):</span>
                        </span>
                        <div className="grid gap-2 sm:grid-cols-2">
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            className="input-field text-[11px] file:bg-blue-700 file:text-white file:border-0 file:rounded file:px-2 file:py-0.5"
                            onChange={async (e) => {
                              const f = e.target.files?.[0];
                              if (f) {
                                try {
                                  const res = await uploadFile('/api/upload', f);
                                  const fileUrl = (res as any).url || `/receipts/${res.fileId}`;
                                  handleUpdateQuestion(qIdx, {
                                    attachmentUrl: fileUrl,
                                    attachmentType: f.type.includes('pdf') ? 'pdf' : 'image',
                                  });
                                } catch {
                                  alert('فشل رفع الملف المرفق للسؤال');
                                }
                              }
                            }}
                          />
                          <input
                            type="url"
                            dir="ltr"
                            placeholder="أو رابط صورة / ملف مباشر..."
                            className="input-field text-[11px]"
                            value={item.attachmentUrl || ''}
                            onChange={(e) => handleUpdateQuestion(qIdx, { attachmentUrl: e.target.value })}
                          />
                        </div>
                        {item.attachmentUrl && (
                          <div className="flex items-center gap-2 pt-1 text-emerald-400 text-[11px]">
                            <Check className="w-3.5 h-3.5" />
                            <span>مرفق جاهز: {item.attachmentUrl.substring(0, 45)}...</span>
                          </div>
                        )}
                      </div>

                      {/* Kind: MCQ Options & Answer Key */}
                      {item.kind === 'mcq' && (
                        <div className="space-y-2 pt-1">
                          <label className="block text-xs font-bold text-cyan-300">
                            خيارات الإجابة الأربعة ونموذج الإجابة (Answer Key):
                          </label>
                          <div className="grid gap-2 sm:grid-cols-2">
                            {(item.options || ['', '', '', '']).map((opt, optIdx) => {
                              const letter = ['أ', 'ب', 'ج', 'د'][optIdx];
                              const isCorrect = item.answer === letter;
                              return (
                                <div
                                  key={optIdx}
                                  className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${
                                    isCorrect
                                      ? 'bg-emerald-950/40 border-emerald-500/50'
                                      : 'bg-[#091324] border-blue-500/15'
                                  }`}
                                >
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateQuestion(qIdx, { answer: letter })}
                                    className={`w-6 h-6 rounded flex items-center justify-center font-bold text-xs cursor-pointer ${
                                      isCorrect
                                        ? 'bg-emerald-500 text-black font-black'
                                        : 'bg-blue-900/60 text-slate-300 hover:bg-blue-700'
                                    }`}
                                    title="تحديد كإجابة صحيحة"
                                  >
                                    {letter}
                                  </button>
                                  <input
                                    required
                                    placeholder={`الخيار (${letter})`}
                                    className="input-field text-xs py-1 flex-1"
                                    value={opt}
                                    onChange={(e) => {
                                      const newOpts = [...(item.options || ['', '', '', ''])];
                                      newOpts[optIdx] = e.target.value;
                                      handleUpdateQuestion(qIdx, { options: newOpts });
                                    }}
                                  />
                                </div>
                              );
                            })}
                          </div>
                          <p className="text-[11px] text-slate-400">
                            * الإجابة الصحيحة المعتمدة للتصحيح الإلكتروني هي:{' '}
                            <span className="font-extrabold text-emerald-400">({item.answer || 'أ'})</span>
                          </p>
                        </div>
                      )}

                      {/* Kind: True / False */}
                      {item.kind === 'true_false' && (
                        <div className="space-y-2 pt-1">
                          <label className="block text-xs font-bold text-amber-300">
                            نموذج الإجابة الصحيحة (Answer Key):
                          </label>
                          <div className="flex items-center gap-3">
                            {['صح', 'خطأ'].map((choice) => {
                              const isSelected = item.answer === choice;
                              return (
                                <button
                                  key={choice}
                                  type="button"
                                  onClick={() => handleUpdateQuestion(qIdx, { answer: choice, options: ['صح', 'خطأ'] })}
                                  className={`flex-1 py-2 px-4 rounded-xl text-xs font-black cursor-pointer border transition-all ${
                                    isSelected
                                      ? 'bg-emerald-600 text-white border-emerald-400 shadow-md'
                                      : 'bg-[#091324] text-slate-300 border-blue-500/20 hover:border-blue-400'
                                  }`}
                                >
                                  {choice === 'صح' ? '✅ صح (صواب)' : '❌ خطأ'}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Kind: Essay & Model Answer */}
                      {item.kind === 'essay' && (
                        <div className="space-y-2 pt-1">
                          <label className="block text-xs font-bold text-emerald-300">
                            نموذج الإجابة المعتمد (Model Answer) للتصحيح الإلكتروني الذكي:
                          </label>
                          <textarea
                            rows={3}
                            placeholder="اكتب عناصر الإجابة النموذجية أو النقاط الواجب توافرها في إجابة الطالب ليتم تقييمها وتصحيحها إلكترونياً..."
                            className="input-field text-xs"
                            value={item.model || ''}
                            onChange={(e) => handleUpdateQuestion(qIdx, { model: e.target.value })}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-3 border-t border-blue-500/15">
                <button
                  type="submit"
                  disabled={examLoading}
                  className="btn-gold w-full py-3 font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                >
                  <GraduationCap className="w-5 h-5" />
                  <span>
                    {examLoading ? 'جاري رفع وحفظ الامتحان...' : `نشر الامتحان والواجب (${examItems.length} سؤال) مع نموذج الإجابة`}
                  </span>
                </button>
              </div>

              {examMsg && (
                <p
                  className={`text-xs font-bold p-3 rounded-xl text-center border ${
                    examMsg.ok
                      ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40'
                      : 'bg-red-950/70 text-red-300 border-red-500/40'
                  }`}
                >
                  {examMsg.text}
                </p>
              )}
            </form>

            {/* List of existing exams */}
            <div className="mt-6 pt-4 border-t border-blue-500/15 space-y-3">
              <h4 className="text-xs font-bold text-slate-300">الامتحانات والواجبات المنشورة:</h4>
              <div className="grid gap-2 sm:grid-cols-2 max-h-60 overflow-y-auto">
                {(teacherData.exams || []).map((ex) => (
                  <div
                    key={ex.id}
                    className="card bg-[#111f36] p-3 text-xs flex justify-between items-center border border-blue-500/15"
                  >
                    <div>
                      <p className="font-bold text-white">{ex.title}</p>
                      <p className="text-slate-400">
                        {ex.grade} • {ex.questions?.length || 0} أسئلة
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteExam(ex.id)}
                      className="btn-red btn-sm text-[10px] cursor-pointer"
                    >
                      حذف
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      )}

      {/* TAB: STORE & PDF BOOKS (متجر المنصة والكتب الرقمية) */}
      {activeMainTab === 'store' && (
        <div className="space-y-6">
          {/* Add PDF Book Form */}
          <section className="panel border border-blue-500/25 bg-[#0f1b2d] shadow-xl p-5 rounded-2xl">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-blue-500/15">
              <BookOpen className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="font-extrabold text-lg text-white">نشر كتاب أو مذكرة PDF جديدة في المتجر</h3>
                <p className="text-xs text-slate-400">
                  تظهر الكتب لجميع زوار المنصة والطلاب مع إمكانية الشراء بالدفع اليدوي أو بالمحفظة للطلاب المسجلين.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateBook} className="grid gap-3 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-300 mb-1">عنوان الكتاب أو المذكرة *</label>
                <input
                  required
                  placeholder="مثال: مذكرة النحو الشاملة للثانوية العامة 2025"
                  className="input-field text-xs"
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">الصف المستهدف</label>
                <select className="input-field text-xs" value={bookGrade} onChange={(e) => setBookGrade(e.target.value)}>
                  {ALL_GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">السعر بالجنيه</label>
                <input
                  type="number"
                  min="0"
                  disabled={bookIsFree}
                  className="input-field text-xs"
                  value={bookPrice}
                  onChange={(e) => setBookPrice(Number(e.target.value))}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">عدد الصفحات</label>
                <input
                  type="number"
                  min="1"
                  className="input-field text-xs"
                  value={bookPages}
                  onChange={(e) => setBookPages(Number(e.target.value))}
                />
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="book-free"
                  checked={bookIsFree}
                  onChange={(e) => setBookIsFree(e.target.checked)}
                  className="w-4 h-4 cursor-pointer"
                />
                <label htmlFor="book-free" className="text-xs font-bold text-emerald-300 cursor-pointer">
                  كتاب مجاني متاح للتحميل الفوري
                </label>
              </div>

              {/* Cover Image Upload / Link */}
              <div className="sm:col-span-3 p-3 rounded-xl bg-[#091324] border border-blue-500/20 space-y-2">
                <label className="block text-xs font-extrabold text-cyan-300">
                  صورة غلاف الكتاب (رفع من الجهاز أو رابط مباشر):
                </label>
                <div className="grid gap-2 sm:grid-cols-2">
                  <input
                    type="file"
                    accept="image/*"
                    className="input-field text-xs file:bg-blue-600 file:text-white file:border-0 file:rounded-lg file:px-2.5 file:py-1 file:cursor-pointer"
                    onChange={(e) => setBookCoverFile(e.target.files?.[0] || null)}
                  />
                  <input
                    type="url"
                    dir="ltr"
                    placeholder="https://... رابط صورة الغلاف"
                    className="input-field text-xs"
                    value={bookCoverUrl}
                    onChange={(e) => setBookCoverUrl(e.target.value)}
                  />
                </div>
              </div>

              {/* PDF File Upload / Link */}
              <div className="sm:col-span-3 p-3 rounded-xl bg-[#091324] border border-blue-500/20 space-y-2">
                <label className="block text-xs font-extrabold text-amber-300">
                  ملف الكتاب الرقمي PDF (رفع من الجهاز أو رابط Google Drive / مباشر):
                </label>
                <div className="grid gap-2 sm:grid-cols-2">
                  <input
                    type="file"
                    accept=".pdf"
                    className="input-field text-xs file:bg-amber-600 file:text-white file:border-0 file:rounded-lg file:px-2.5 file:py-1 file:cursor-pointer"
                    onChange={(e) => setBookPdfFile(e.target.files?.[0] || null)}
                  />
                  <input
                    type="url"
                    dir="ltr"
                    placeholder="https://... رابط ملف PDF"
                    className="input-field text-xs"
                    value={bookPdfUrl}
                    onChange={(e) => setBookPdfUrl(e.target.value)}
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-slate-300 mb-1">وصف الكتاب أو المذكرة</label>
                <textarea
                  rows={2}
                  placeholder="وصف مختصر لمحتوى الكتاب، الفصول التي يشملها، والمميزات..."
                  className="input-field text-xs"
                  value={bookDesc}
                  onChange={(e) => setBookDesc(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={bookLoading}
                className="btn-gold sm:col-span-3 py-3 font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <BookOpen className="w-4 h-4" />
                <span>{bookLoading ? 'جاري رفع وحفظ الكتاب...' : 'نشر الكتاب في المتجر العام'}</span>
              </button>

              {bookMsg && (
                <p
                  className={`sm:col-span-3 text-xs font-bold p-3 rounded-xl text-center border ${
                    bookMsg.ok
                      ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40'
                      : 'bg-red-950/70 text-red-300 border-red-500/40'
                  }`}
                >
                  {bookMsg.text}
                </p>
              )}
            </form>

            {/* List of Published Books */}
            <div className="mt-8 pt-5 border-t border-blue-500/15 space-y-4">
              <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                <span>الكتب والمذكرات المنشورة في المتجر حالياً</span>
                <span className="badge-pill bg-blue-950/60 text-cyan-300 border-blue-500/40 text-xs font-mono">
                  {(teacherData.books || []).length} كتب
                </span>
              </h4>

              {(!teacherData.books || teacherData.books.length === 0) ? (
                <p className="text-xs text-slate-400 py-4 text-center">لا توجد كتب منشورة حالياً في المتجر.</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {teacherData.books.map((b) => (
                    <div
                      key={b.id}
                      className="card bg-[#0b162a] border border-blue-500/20 p-3.5 rounded-xl flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start gap-3">
                          {b.coverImage ? (
                            <img
                              src={b.coverImage}
                              alt={b.title}
                              className="w-16 h-20 object-cover rounded-lg border border-blue-500/30 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-16 h-20 rounded-lg bg-blue-950/80 border border-blue-500/30 flex flex-col items-center justify-center text-cyan-400 flex-shrink-0">
                              <BookOpen className="w-6 h-6" />
                              <span className="text-[10px] font-bold mt-1">PDF</span>
                            </div>
                          )}
                          <div className="min-w-0">
                            <h5 className="font-bold text-white text-xs line-clamp-2">{b.title}</h5>
                            <span className="inline-block mt-1 text-[11px] text-cyan-300 font-semibold">
                              {b.grade} • {b.pagesCount || 1} صفحة
                            </span>
                            <p className="text-xs font-black text-amber-400 mt-1">
                              {b.isFree ? 'مجاني' : `${b.price} ج.م`}
                            </p>
                          </div>
                        </div>
                        {b.description && (
                          <p className="text-[11px] text-slate-400 line-clamp-2">{b.description}</p>
                        )}
                      </div>

                      <div className="mt-3 pt-2 border-t border-blue-500/15 flex items-center justify-between gap-2">
                        {b.pdfUrl && (
                          <a
                            href={b.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-cyan btn-sm text-[11px] flex items-center gap-1 cursor-pointer"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>معاينة PDF</span>
                          </a>
                        )}
                        <button
                          onClick={() => handleDeleteBook(b.id)}
                          className="btn-red btn-sm text-[11px] flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>حذف</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Review Store Orders (طلبات الشراء ومبيعات المتجر) */}
          <section className="panel border border-blue-500/25 bg-[#0f1b2d] shadow-xl p-5 rounded-2xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-blue-500/15">
              <div>
                <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-emerald-400" />
                  <span>معالجة ومراجعة طلبات شراء المتجر (Store Orders)</span>
                </h3>
                <p className="text-xs text-slate-400">
                  مراجعة طلبات الدفع اليدوي والمحفظة للزوار والطلاب، وتأكيد تفعيل روابط التحميل الفورية.
                </p>
              </div>

              <div className="flex items-center gap-2 bg-[#091222] p-1 rounded-xl border border-blue-500/20">
                {(['all', 'pending', 'approved', 'rejected'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStoreOrdersFilter(st)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                      storeOrdersFilter === st
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {st === 'all' && 'الكل'}
                    {st === 'pending' && 'معلقة'}
                    {st === 'approved' && 'مقبولة'}
                    {st === 'rejected' && 'مرفوضة'}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders Table */}
            <div className="overflow-x-auto rounded-xl border border-blue-500/20 bg-[#091222]">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#0e1d35] text-cyan-300 font-extrabold border-b border-blue-500/20">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">اسم المشتري</th>
                    <th className="p-3">رقم الهاتف</th>
                    <th className="p-3">اسم الكتاب</th>
                    <th className="p-3">المبلغ</th>
                    <th className="p-3">طريقة الدفع</th>
                    <th className="p-3">إيصال التحويل</th>
                    <th className="p-3">الحالة</th>
                    <th className="p-3 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-500/10 text-slate-200">
                  {(!teacherData.storeOrders || teacherData.storeOrders.length === 0) ? (
                    <tr>
                      <td colSpan={9} className="p-6 text-center text-slate-400">
                        لا توجد طلبات شراء مسجلة في المتجر حتى الآن.
                      </td>
                    </tr>
                  ) : (
                    teacherData.storeOrders
                      .filter((o) => storeOrdersFilter === 'all' || o.status === storeOrdersFilter)
                      .map((order, idx) => (
                        <tr key={order.id} className="hover:bg-blue-950/30 transition-colors">
                          <td className="p-3 font-mono text-slate-400">{idx + 1}</td>
                          <td className="p-3 font-black text-white">{order.buyerName}</td>
                          <td className="p-3 font-mono text-cyan-300">{order.buyerPhone}</td>
                          <td className="p-3 font-semibold text-slate-200">{order.itemTitle}</td>
                          <td className="p-3 font-bold text-amber-400 font-mono">{order.amount} ج.م</td>
                          <td className="p-3">
                            <span className="badge-pill text-[10px] bg-blue-950/80 text-blue-300 border-blue-500/30">
                              {order.paymentMethod === 'wallet' && 'رصيد المحفظة'}
                              {order.paymentMethod === 'manual' && 'دفع يدوي'}
                              {order.paymentMethod === 'free' && 'مجاني'}
                              {!['wallet', 'manual', 'free'].includes(order.paymentMethod) && order.paymentMethod}
                            </span>
                          </td>
                          <td className="p-3">
                            {order.receiptUrl ? (
                              <button
                                onClick={() => setPreviewReceiptUrl(order.receiptUrl || null)}
                                className="text-cyan-300 hover:underline font-bold text-xs flex items-center gap-1 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>معاينة</span>
                              </button>
                            ) : (
                              <span className="text-slate-500">بدون إيصال</span>
                            )}
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                order.status === 'approved'
                                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                                  : order.status === 'rejected'
                                  ? 'bg-red-950/80 text-red-300 border border-red-500/40'
                                  : 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                              }`}
                            >
                              {order.status === 'approved' && 'مقبول ومفعل'}
                              {order.status === 'rejected' && 'مرفوض'}
                              {order.status === 'pending' && 'معلق للمراجعة'}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {order.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleReviewStoreOrder(order.id, 'approved')}
                                    className="btn-emerald btn-sm text-[10px] font-bold cursor-pointer"
                                    title="الموافقة وتفعيل رابط التحميل"
                                  >
                                    موافقة
                                  </button>
                                  <button
                                    onClick={() => handleReviewStoreOrder(order.id, 'rejected')}
                                    className="btn-red btn-sm text-[10px] font-bold cursor-pointer"
                                    title="رفض الطلب"
                                  >
                                    رفض
                                  </button>
                                </>
                              )}
                              {order.buyerPhone && (
                                <a
                                  href={`https://wa.me/2${order.buyerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                                    `مرحباً ${order.buyerName}، بخصوص طلبك (${order.itemTitle}): ${
                                      order.status === 'approved'
                                        ? 'تم تأكيد طلبك بنجاح ويمكنك تحميله الآن!'
                                        : 'نتابع معك بخصوص إتمام الدفع.'
                                    }`
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn-green btn-sm text-[10px] font-bold"
                                  title="تواصل واتساب"
                                >
                                  واتساب
                                </a>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* TAB: ABOUT US & PLATFORM FEATURES (من نحن وأهم مميزات المنصة) */}
      {activeMainTab === 'about' && (
        <div className="space-y-6">
          <section className="panel border border-blue-500/25 bg-[#0f1b2d] shadow-xl p-5 sm:p-6 rounded-2xl space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-blue-500/15">
              <Info className="w-6 h-6 text-amber-400" />
              <div>
                <h3 className="font-extrabold text-lg text-white">إدارة قسم (من نحن) وأهم مميزات المنصة</h3>
                <p className="text-xs text-slate-400">
                  يظهر هذا القسم لجميع زوار المنصة والطلاب بالصفحة الرئيسية دون اشتراط تسجيل الدخول.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveAboutUs} className="space-y-6">
              {/* Teacher Info */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">اسم المعلم / المنصة *</label>
                  <input
                    required
                    className="input-field text-xs"
                    value={aboutTitle}
                    onChange={(e) => setAboutTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">اللقب والوصف المهني *</label>
                  <input
                    required
                    className="input-field text-xs"
                    value={aboutSubtitle}
                    onChange={(e) => setAboutSubtitle(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">نبذة عن الأستاذ والخبرة التعليمية (Bio)</label>
                <textarea
                  rows={3}
                  className="input-field text-xs leading-relaxed"
                  value={aboutBio}
                  onChange={(e) => setAboutBio(e.target.value)}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">رؤية المنصة (Vision)</label>
                  <textarea
                    rows={2}
                    className="input-field text-xs"
                    value={aboutVision}
                    onChange={(e) => setAboutVision(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">رسالة المنصة (Mission)</label>
                  <textarea
                    rows={2}
                    className="input-field text-xs"
                    value={aboutMission}
                    onChange={(e) => setAboutMission(e.target.value)}
                  />
                </div>
              </div>

              {/* Statistics Counters */}
              <div className="p-4 rounded-xl bg-[#091324] border border-blue-500/20 space-y-3">
                <h4 className="text-xs font-bold text-cyan-300">أرقام وإحصائيات المنصة البارزة:</h4>
                <div className="grid gap-3 sm:grid-cols-4">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">سنوات الخبرة</label>
                    <input
                      className="input-field text-xs font-mono"
                      value={aboutExp}
                      onChange={(e) => setAboutExp(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">عدد الطلاب المسجلين</label>
                    <input
                      className="input-field text-xs font-mono"
                      value={aboutStudents}
                      onChange={(e) => setAboutStudents(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">المحاضرات والشروحات</label>
                    <input
                      className="input-field text-xs font-mono"
                      value={aboutLectures}
                      onChange={(e) => setAboutLectures(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">نسبة النجاح والرضا</label>
                    <input
                      className="input-field text-xs font-mono"
                      value={aboutSatisfaction}
                      onChange={(e) => setAboutSatisfaction(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Editable 6 Key Features */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-blue-500/15">
                  <div>
                    <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>إدارة "أهم مميزات منصتنا" (المعروضة لجميع الزوار)</span>
                    </h4>
                    <p className="text-xs text-slate-400">
                      يمكنك تعديل نصوص المميزات وإضافة ميزات جديدة وحفظها لتظهر مباشرة في الموقع العام.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAboutFeatures([
                        ...aboutFeatures,
                        { title: 'ميزة جديدة', desc: 'شرح الميزة بالتفصيل...', icon: 'Sparkles' },
                      ]);
                    }}
                    className="btn-cyan btn-sm text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة ميزة</span>
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {aboutFeatures.map((feat, fIdx) => (
                    <div
                      key={fIdx}
                      className="card bg-[#091324] border border-blue-500/20 p-3.5 rounded-xl space-y-2 relative"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-cyan-300">ميزة رقم {fIdx + 1}</span>
                        {aboutFeatures.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              setAboutFeatures(aboutFeatures.filter((_, i) => i !== fIdx));
                            }}
                            className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                            title="حذف هذه الميزة"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">عنوان الميزة</label>
                        <input
                          required
                          className="input-field text-xs font-bold"
                          value={feat.title}
                          onChange={(e) => {
                            const next = [...aboutFeatures];
                            next[fIdx] = { ...next[fIdx], title: e.target.value };
                            setAboutFeatures(next);
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">وصف الميزة</label>
                        <textarea
                          rows={2}
                          required
                          className="input-field text-xs"
                          value={feat.desc}
                          onChange={(e) => {
                            const next = [...aboutFeatures];
                            next[fIdx] = { ...next[fIdx], desc: e.target.value };
                            setAboutFeatures(next);
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <button
                type="submit"
                disabled={aboutLoading}
                className="btn-gold w-full py-3 font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <Check className="w-4 h-4" />
                <span>
                  {aboutLoading ? 'جاري حفظ التعديلات...' : 'حفظ تعديلات "من نحن" وأهم مميزات المنصة في الموقع العام'}
                </span>
              </button>

              {aboutMsg && (
                <p
                  className={`text-xs font-bold p-3 rounded-xl text-center border ${
                    aboutMsg.ok
                      ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40'
                      : 'bg-red-950/70 text-red-300 border-red-500/40'
                  }`}
                >
                  {aboutMsg.text}
                </p>
              )}
            </form>
          </section>
        </div>
      )}

      {/* TAB: ARTICLES MANAGEMENT (إدارة مقالات المنصة) */}
      {activeMainTab === 'articles' && (
        <div className="space-y-6">
          {/* Add Article Form */}
          <section className="panel border border-blue-500/25 bg-[#0f1b2d] shadow-xl p-5 sm:p-6 rounded-2xl space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-blue-500/15">
              <Newspaper className="w-6 h-6 text-cyan-400" />
              <div>
                <h3 className="font-extrabold text-lg text-white">نشر وإدارة مقالات المنصة (قسم مقالاتنا)</h3>
                <p className="text-xs text-slate-400">
                  تظهر هذه المقالات لجميع زوار المنصة والطلاب لمساعدتهم في المذاكرة والتفوق في مادة اللغة العربية.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateArticle} className="grid gap-3 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-300 mb-1">عنوان المقال *</label>
                <input
                  required
                  placeholder="مثال: كيف تعرب أي كلمة في الامتحان النهائي دون تردد؟"
                  className="input-field text-xs"
                  value={artTitle}
                  onChange={(e) => setArtTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">التصنيف</label>
                <select className="input-field text-xs" value={artCategory} onChange={(e) => setArtCategory(e.target.value)}>
                  <option value="نحو وبلاغة">نحو وبلاغة</option>
                  <option value="ثانوية عامة">ثانوية عامة</option>
                  <option value="مهارات المذاكرة">مهارات المذاكرة</option>
                  <option value="إرشادات امتحانية">إرشادات امتحانية</option>
                  <option value="أدب ونصوص">أدب ونصوص</option>
                  <option value="عام">عام</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">مدة القراءة التقديرية</label>
                <input
                  placeholder="مثال: 4 دقائق"
                  className="input-field text-xs"
                  value={artReadTime}
                  onChange={(e) => setArtReadTime(e.target.value)}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-300 mb-1">رابط صورة المقال (اختياري)</label>
                <input
                  type="url"
                  dir="ltr"
                  placeholder="https://..."
                  className="input-field text-xs"
                  value={artImageUrl}
                  onChange={(e) => setArtImageUrl(e.target.value)}
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-slate-300 mb-1">ملخص المقال (يظهر في البطاقة العامة)</label>
                <textarea
                  rows={2}
                  placeholder="ملخص قصير وجذاب عن موضوع المقال..."
                  className="input-field text-xs"
                  value={artSummary}
                  onChange={(e) => setArtSummary(e.target.value)}
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-slate-300 mb-1">محتوى المقال كاملاً *</label>
                <textarea
                  rows={6}
                  required
                  placeholder="اكتب المقال والشرح والنصائح بالتفصيل هنا..."
                  className="input-field text-xs leading-relaxed font-sans"
                  value={artContent}
                  onChange={(e) => setArtContent(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={artLoading}
                className="btn-gold sm:col-span-3 py-3 font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <Newspaper className="w-4 h-4" />
                <span>{artLoading ? 'جاري نشر المقال...' : 'نشر المقال في الموقع العام'}</span>
              </button>

              {artMsg && (
                <p
                  className={`sm:col-span-3 text-xs font-bold p-3 rounded-xl text-center border ${
                    artMsg.ok
                      ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40'
                      : 'bg-red-950/70 text-red-300 border-red-500/40'
                  }`}
                >
                  {artMsg.text}
                </p>
              )}
            </form>

            {/* Published Articles List */}
            <div className="mt-8 pt-5 border-t border-blue-500/15 space-y-4">
              <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                <span>المقالات المنشورة في المنصة</span>
                <span className="badge-pill bg-blue-950/60 text-cyan-300 border-blue-500/40 text-xs font-mono">
                  {(teacherData.articles || []).length} مقال
                </span>
              </h4>

              {(!teacherData.articles || teacherData.articles.length === 0) ? (
                <p className="text-xs text-slate-400 py-4 text-center">لا توجد مقالات منشورة حالياً.</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {teacherData.articles.map((art) => (
                    <div
                      key={art.id}
                      className="card bg-[#0b162a] border border-blue-500/20 p-4 rounded-xl flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="badge-pill bg-cyan-950/60 text-cyan-300 border-cyan-500/40 text-[10px]">
                            {art.category}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">{art.readTime}</span>
                        </div>
                        <h5 className="font-bold text-white text-xs leading-snug">{art.title}</h5>
                        <p className="text-[11px] text-slate-300 line-clamp-3">{art.summary || art.content}</p>
                      </div>

                      <div className="mt-4 pt-2 border-t border-blue-500/15 flex items-center justify-between text-[11px] text-slate-400">
                        <span>{art.created ? new Date(art.created).toLocaleDateString('ar-EG') : 'منشور'}</span>
                        <button
                          onClick={() => handleDeleteArticle(art.id)}
                          className="btn-red btn-sm text-[10px] flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>حذف المقال</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {/* TAB 4: STUDENTS & REPORTS */}
      {activeMainTab === 'students' && (
        <div className="space-y-6">
          {/* Activation Codes for Specific Courses or General Subscriptions */}
          <section className="panel border border-blue-500/25 bg-[#0f1b2d] shadow-xl p-5 rounded-2xl">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-blue-500/15">
              <Key className="w-5 h-5 text-amber-400" />
              <h3 className="font-extrabold text-lg text-white">توليد أكواد شحن ودفع الكورسات</h3>
            </div>
            <p className="text-xs text-slate-300 mb-3">
              حدد الكورس المستهدف لربط الكود بكورس معين، أو اتركه كاشتراك عام لجميع الكورسات.
            </p>
            <form onSubmit={handleGenerateCodes} className="grid gap-3 sm:grid-cols-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-300 mb-1">الكورس المستهدف</label>
                <select
                  className="input-field text-xs"
                  value={codeCourseId}
                  onChange={(e) => setCodeCourseId(e.target.value)}
                >
                  <option value="">اشتراك عام في المنصة (جميع الكورسات)</option>
                  {teacherData.courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.grade}) - {c.price} ج.م
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">عدد الأكواد</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  className="input-field text-xs"
                  value={codeCount}
                  onChange={(e) => setCodeCount(Number(e.target.value))}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">المدة بالأيام</label>
                <input
                  type="number"
                  min="1"
                  className="input-field text-xs"
                  value={codeDays}
                  onChange={(e) => setCodeDays(Number(e.target.value))}
                />
              </div>

              <div className="sm:col-span-4 flex items-center justify-between gap-3 pt-2">
                <button type="submit" className="btn-gold py-2.5 px-6 font-bold text-xs cursor-pointer">
                  توليد الأكواد
                </button>
                {generatedCodes.length > 0 && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleCopyCodes}
                      className="btn-cyan py-2.5 px-4 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copyStatus ? 'تم النسخ!' : 'نسخ الأكواد'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handlePrintCodes}
                      className="btn-emerald py-2.5 px-4 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>طباعة الأكواد</span>
                    </button>
                  </div>
                )}
              </div>
            </form>

            {generatedCodes.length > 0 && (
              <div className="mt-4 p-3 bg-[#0a1322] rounded-xl border border-blue-500/20 text-xs">
                <p className="font-bold text-cyan-300 mb-2">{generatedMsg || 'الأكواد المولدة حديثاً:'}</p>
                <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto">
                  {generatedCodes.map((c, i) => (
                    <span key={i} className="font-mono bg-[#111f36] px-2.5 py-1 rounded border border-blue-500/30 text-white select-all">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Discount Coupons Generator */}
          <section className="panel border border-blue-500/25 bg-[#0f1b2d] shadow-xl p-5 rounded-2xl">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-blue-500/15">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <h3 className="font-extrabold text-lg text-white">توليد وإدارة كوبونات الخصم</h3>
            </div>
            <p className="text-xs text-slate-300 mb-3">
              أنشئ كوبونات خصم (نسبة مئوية أو مبلغ ثابت) ليستخدمها الطلاب أثناء تفعيل الاشتراكات.
            </p>

            <form onSubmit={handleCreateCoupon} className="grid gap-3 sm:grid-cols-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">كود الخصم (رمز الكوبون)</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: OFF50"
                  className="input-field text-xs uppercase font-mono"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">نوع الخصم</label>
                <select
                  className="input-field text-xs"
                  value={couponDiscountType}
                  onChange={(e) => setCouponDiscountType(e.target.value as any)}
                >
                  <option value="percentage">نسبة مئوية (%)</option>
                  <option value="fixed">مبلغ ثابت (ج.م)</option>
                  <option value="free_course">مجاني بالكامل (100%)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">قيمة الخصم</label>
                <input
                  type="number"
                  min="1"
                  required
                  className="input-field text-xs"
                  value={couponDiscountValue}
                  onChange={(e) => setCouponDiscountValue(Number(e.target.value))}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">الحد الأقصى للاستخدام</label>
                <input
                  type="number"
                  min="1"
                  className="input-field text-xs"
                  value={couponMaxUses}
                  onChange={(e) => setCouponMaxUses(Number(e.target.value))}
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-slate-300 mb-1">الكورس المخصص (اختياري)</label>
                <select
                  className="input-field text-xs"
                  value={couponCourseId}
                  onChange={(e) => setCouponCourseId(e.target.value)}
                >
                  <option value="">جميع الكورسات والاشتراكات</option>
                  {teacherData.courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.grade})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={couponLoading}
                  className="btn-cyan w-full py-2.5 font-bold text-xs cursor-pointer shadow-lg"
                >
                  {couponLoading ? 'جاري الإنشاء...' : 'إنشاء الكوبون'}
                </button>
              </div>

              {couponMsg && (
                <p
                  className={`sm:col-span-4 text-xs font-bold p-2 rounded-xl text-center ${
                    couponMsg.ok ? 'bg-emerald-950/60 text-emerald-300' : 'bg-red-950/60 text-red-300'
                  }`}
                >
                  {couponMsg.text}
                </p>
              )}
            </form>

            <div className="mt-4 pt-3 border-t border-blue-500/15">
              <h4 className="text-xs font-bold text-slate-300 mb-2">الكوبونات النشطة حالياً:</h4>
              <div className="grid gap-2 sm:grid-cols-2 max-h-48 overflow-y-auto">
                {(!teacherData.coupons || teacherData.coupons.length === 0) ? (
                  <p className="text-xs text-slate-400 sm:col-span-2">لا توجد كوبونات خصم مضافة حالياً.</p>
                ) : (
                  teacherData.coupons.map((coup) => (
                    <div key={coup.id} className="p-2.5 rounded-xl bg-[#111f36] border border-blue-500/15 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-mono font-black text-amber-300 text-sm">{coup.code}</span>
                        <p className="text-slate-300 mt-0.5">
                          الخصم: {coup.discountType === 'percentage' ? `${coup.discountValue}%` : coup.discountType === 'fixed' ? `${coup.discountValue} ج.م` : 'مجاني'} • الاستخدام: {coup.usedCount || 0} / {coup.maxUses || '∞'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteCoupon(coup.id)}
                        className="btn-red btn-sm text-[10px] cursor-pointer"
                      >
                        حذف
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          {/* Students & Parents Accounts */}
          <section className="panel border border-blue-500/25 bg-[#0f1b2d] shadow-xl p-5 rounded-2xl">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-2 border-b border-blue-500/15">
              <h3 className="font-extrabold text-lg text-white">إدارة الطلاب وأولياء الأمور</h3>
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                <input className="input-field pr-9 text-xs" placeholder="بحث بالاسم أو الكود أو رقم الهاتف..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 max-h-[500px] overflow-y-auto">
              {filteredStudents.map((s) => (
                <div key={s.id} className="card bg-[#111f36] border border-blue-500/20 p-3 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-extrabold text-sm text-white">{s.name}</h4>
                      <p className="text-slate-400 mt-0.5">{s.grade} • كود: <span dir="ltr">{s.code}</span></p>
                    </div>
                    <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${s.status === 'blocked' ? 'bg-red-950 text-red-300' : 'bg-emerald-950 text-emerald-300'}`}>
                      {s.status === 'blocked' ? 'محجوب' : 'نشط'}
                    </span>
                  </div>

                  <div className="mt-2 text-slate-300 bg-[#0a1322] p-2 rounded border border-blue-500/10 space-y-0.5">
                    <p>هاتف الطالب: <span dir="ltr">{s.phone}</span></p>
                    <p>ولي الأمر: {s.parentName || 'غير مسجل'}</p>
                    <p>الرصيد بالمحفظة: <b className="text-emerald-400">{s.walletBalance || 0} ج.م</b></p>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <button type="button" onClick={() => setDetailedStudent(s)} className="btn-primary btn-sm text-[10px] font-bold cursor-pointer flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>كافة البيانات</span>
                    </button>
                    <button type="button" onClick={() => setReportStudent(s)} className="btn-gold btn-sm text-[10px] font-bold cursor-pointer">📊 تقرير الطالب</button>
                    <button type="button" onClick={() => setAdjustModalStudent(s)} className="btn-cyan btn-sm text-[10px] font-bold cursor-pointer">💳 شحن الرصيد</button>
                    <button
                      type="button"
                      onClick={() => {
                        const targetNum = (s.parentPhone || s.phone || '').replace(/\D/g, '');
                        if (!targetNum) {
                          alert('لا يوجد رقم هاتف مسجل لهذا الطالب أو ولي أمره.');
                          return;
                        }
                        const normalized = targetNum.startsWith('0') ? '2' + targetNum : targetNum;
                        const msg = `السلام عليكم ورحمة الله، تحياتنا من منصة الأستاذ محمد عبد المقصود التعليمية.
نود إحاطتكم علماً بمتابعة الطالب: *${s.name}* (${s.grade})
كود الطالب: ${s.code}
رصيد المحفظة: ${s.walletBalance || 0} ج.م
يسعدنا دائماً تواصلكم لضمان استمرار تفوق وتميز الطالب معنا ✨`;
                        window.open(`https://wa.me/${normalized}?text=${encodeURIComponent(msg)}`, '_blank');
                      }}
                      className="px-2 py-1 rounded-lg bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-300 font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
                      title="مراسلة ولي الأمر أو الطالب مباشرة عبر واتساب"
                    >
                      <MessageSquare className="w-3 h-3 text-emerald-400" />
                      <span>واتساب ولي الأمر</span>
                    </button>
                    <button type="button" onClick={() => handleStudentAction(s.id, 'block')} className={`btn-sm text-[10px] cursor-pointer ${s.status === 'blocked' ? 'btn-green' : 'btn-red'}`}>
                      {s.status === 'blocked' ? 'فك الحجب' : 'حجب'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStudentAction(s.id, 'delete')}
                      className="btn-red btn-sm text-[10px] font-bold cursor-pointer flex items-center gap-1"
                      title="حذف الطالب نهائياً من قاعدة البيانات"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>حذف</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* TAB: TOP STUDENTS (لوحة شرف المتفوقين) */}
      {activeMainTab === 'top-students' && (
        <div className="space-y-6">
          <section className="panel border border-blue-500/25 bg-[#0f1b2d] shadow-xl p-5 sm:p-6 rounded-2xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-blue-500/15">
              <div className="flex items-center gap-3">
                <Trophy className="w-6 h-6 text-amber-400" />
                <div>
                  <h3 className="font-extrabold text-lg text-white">إدارة لوحة شرف المتفوقين (طلابنا المتفوقين)</h3>
                  <p className="text-xs text-slate-400">
                    يمكنك إضافة وتعديل وترتيب كروت الطلاب المتفوقين، رفع أو حذف صورهم، ونشر درجاتهم بالصفحة الرئيسية.
                  </p>
                </div>
              </div>
              <span className="badge-pill bg-amber-950/60 text-amber-300 border-amber-500/40 text-xs font-mono font-bold">
                {(teacherData?.topStudents || []).length} طلاب باللوحة
              </span>
            </div>

            {/* Top Student Form */}
            <form onSubmit={handleSaveTopStudent} className="space-y-4 p-4 rounded-xl bg-[#091324] border border-blue-500/20">
              <div className="flex items-center justify-between pb-2 border-b border-blue-500/15">
                <h4 className="text-xs font-extrabold text-cyan-300">
                  {tsId ? 'تعديل بيانات الطالب المتفوق' : 'إضافة طالب جديد للوحة الشرف'}
                </h4>
                {tsId && (
                  <button
                    type="button"
                    onClick={() => {
                      setTsId(null);
                      setTsName('');
                      setTsScore('99.6%');
                      setTsRank('المركز الأول');
                      setTsSchool('');
                      setTsQuote('');
                      setTsPhotoUrl('');
                      setTsPhotoPreview(null);
                    }}
                    className="text-xs text-slate-400 hover:text-white font-bold"
                  >
                    إلغاء التعديل ✕
                  </button>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">اسم الطالب رباعياً *</label>
                  <input
                    required
                    placeholder="مثال: مريم أحمد محمود"
                    className="input-field text-xs"
                    value={tsName}
                    onChange={(e) => setTsName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">المجموع أو النسبة المئوية *</label>
                  <input
                    required
                    placeholder="مثال: 99.4% أو 405/410"
                    className="input-field text-xs font-bold text-amber-300"
                    value={tsScore}
                    onChange={(e) => setTsScore(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">الصف الدراسي</label>
                  <select
                    className="input-field text-xs font-bold"
                    value={tsGrade}
                    onChange={(e) => setTsGrade(e.target.value)}
                  >
                    {ALL_GRADES.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">المركز أو اللقب الشرفي</label>
                  <input
                    placeholder="مثال: المركز الأول على مستوى الجمهورية 🥇"
                    className="input-field text-xs"
                    value={tsRank}
                    onChange={(e) => setTsRank(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">اسم المدرسة أو الإدارة</label>
                  <input
                    placeholder="مثال: مدرسة المتفوقات الثانوية"
                    className="input-field text-xs"
                    value={tsSchool}
                    onChange={(e) => setTsSchool(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">الدفعة أو العام الدراسي</label>
                  <input
                    placeholder="مثال: دفعة 2026"
                    className="input-field text-xs"
                    value={tsYear}
                    onChange={(e) => setTsYear(e.target.value)}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1">الشعار أو الوسام الممنوح</label>
                  <input
                    placeholder="مثال: وسام النبوغ والتفوق 🌟"
                    className="input-field text-xs"
                    value={tsBadge}
                    onChange={(e) => setTsBadge(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="ts-feat"
                    checked={tsFeatured}
                    onChange={(e) => setTsFeatured(e.target.checked)}
                    className="w-4 h-4 cursor-pointer accent-amber-400"
                  />
                  <label htmlFor="ts-feat" className="text-xs font-bold text-white cursor-pointer">
                    إظهار بتمييز ووسام ملكي خاص بالصفحة
                  </label>
                </div>
              </div>

              {/* Photo Upload Options */}
              <div className="p-3 rounded-xl bg-[#08111e] border border-blue-500/20 space-y-2">
                <label className="block text-xs font-extrabold text-cyan-300">
                  صورة الطالب (رفع مباشرة من جهازك أو رابط مباشر):
                </label>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">رفع صورة شخصية من جهازك:</label>
                    <input
                      ref={tsPhotoInputRef}
                      type="file"
                      accept="image/*"
                      className="input-field text-xs file:bg-blue-600 file:text-white file:border-0 file:rounded-lg file:px-2.5 file:py-1 file:cursor-pointer"
                      onChange={handleTsPhotoUpload}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">أو رابط صورة خارجي (Direct Image URL):</label>
                    <input
                      type="url"
                      dir="ltr"
                      placeholder="https://..."
                      className="input-field text-xs"
                      value={tsPhotoUrl}
                      onChange={(e) => {
                        setTsPhotoUrl(e.target.value);
                        setTsPhotoPreview(e.target.value);
                      }}
                    />
                  </div>
                </div>

                {(tsPhotoPreview || tsPhotoUrl) && (
                  <div className="flex items-center gap-3 pt-2">
                    <img
                      src={tsPhotoPreview || tsPhotoUrl}
                      alt="معاينة"
                      className="w-14 h-14 object-cover rounded-full border-2 border-amber-400/80 shadow-md"
                    />
                    <div className="space-y-1 text-right">
                      <span className="text-[11px] text-emerald-400 font-bold block">✅ تم اعتماد صورة الطالب</span>
                      <button
                        type="button"
                        onClick={() => {
                          setTsPhotoUrl('');
                          setTsPhotoPreview(null);
                          if (tsPhotoInputRef.current) tsPhotoInputRef.current.value = '';
                        }}
                        className="text-[10px] text-red-400 hover:underline cursor-pointer"
                      >
                        إزالة الصورة
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">مقولة الطالب أو نصيحة للزملاء (Testimonial Quote)</label>
                <textarea
                  rows={2}
                  placeholder="مثال: بفضل الله ثم شرح الأستاذ ومذكراته الممتازة استطعت إتقان المادة والوصول للقمة..."
                  className="input-field text-xs"
                  value={tsQuote}
                  onChange={(e) => setTsQuote(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={tsLoading}
                className="btn-gold w-full py-3 font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <Trophy className="w-4 h-4" />
                <span>{tsLoading ? 'جاري الحفظ...' : tsId ? 'تحديث بيانات الطالب المتفوق' : 'إضافة الطالب للوحة الشرف'}</span>
              </button>

              {tsMsg && (
                <p className={`text-xs font-bold p-2.5 rounded-xl text-center border ${tsMsg.ok ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40' : 'bg-red-950/70 text-red-300 border-red-500/40'}`}>
                  {tsMsg.text}
                </p>
              )}
            </form>

            {/* List and Order Management */}
            <div className="pt-4 border-t border-blue-500/15 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <span>قائمة المتفوقين والترتيب الحالي بالمنصة</span>
                  <span className="text-xs text-slate-400 font-normal">
                    (استخدم أسهم الترتيب ⬆️ ⬇️ لتغيير ترتيب الكروت بالصفحة الرئيسية)
                  </span>
                </h4>
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
                  <input
                    className="input-field pr-8 text-xs py-1.5"
                    placeholder="بحث في المتفوقين..."
                    value={tsSearchQuery}
                    onChange={(e) => setTsSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {(!teacherData?.topStudents || teacherData.topStudents.length === 0) ? (
                <p className="text-xs text-slate-400 py-6 text-center">لا يوجد طلاب مسجلون في لوحة الشرف حالياً.</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {teacherData.topStudents
                    .filter((st) => !tsSearchQuery.trim() || st.name.toLowerCase().includes(tsSearchQuery.toLowerCase()) || st.grade.toLowerCase().includes(tsSearchQuery.toLowerCase()))
                    .map((st, idx) => (
                      <div
                        key={st.id}
                        className="card bg-[#0b162a] border border-blue-500/20 p-4 rounded-2xl flex flex-col justify-between relative group hover:border-amber-500/40 transition-all"
                      >
                        {/* Position Badge & Order Controls */}
                        <div className="flex items-center justify-between pb-2.5 border-b border-blue-500/15">
                          <span className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center font-black text-xs">
                            #{idx + 1}
                          </span>

                          <div className="flex items-center gap-1 bg-[#070f1e] p-1 rounded-xl border border-blue-500/20">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveTopStudentUp(idx)}
                              className="p-1 text-slate-300 hover:text-amber-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                              title="تحريك لأعلى ⬆️"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === (teacherData.topStudents || []).length - 1}
                              onClick={() => handleMoveTopStudentDown(idx)}
                              className="p-1 text-slate-300 hover:text-amber-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                              title="تحريك لأسفل ⬇️"
                            >
                              <ArrowDown className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Student Card Content */}
                        <div className="my-3 flex items-start gap-3">
                          <div className="relative shrink-0">
                            {st.photoUrl ? (
                              <img
                                src={st.photoUrl}
                                alt={st.name}
                                className="w-16 h-16 object-cover rounded-full border-2 border-amber-400 shadow-md"
                              />
                            ) : (
                              <div className="w-16 h-16 rounded-full bg-amber-950/60 border-2 border-amber-500/40 flex items-center justify-center text-amber-300 font-black text-lg">
                                {st.name.charAt(0)}
                              </div>
                            )}

                            {st.photoUrl && (
                              <button
                                type="button"
                                onClick={() => handleRemoveTopStudentPhoto(st.id, st.name)}
                                className="absolute -bottom-1 -right-1 p-1 rounded-full bg-red-950 border border-red-500/50 text-red-300 hover:text-white hover:bg-red-800 transition-colors shadow cursor-pointer"
                                title="إزالة الصورة"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>

                          <div className="min-w-0 flex-1 space-y-1">
                            <h5 className="font-extrabold text-white text-xs truncate">{st.name}</h5>
                            <span className="inline-block text-[11px] font-black text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30">
                              {st.score}
                            </span>
                            <p className="text-[11px] text-cyan-300 font-semibold truncate">{st.grade}</p>
                            {st.rank && <p className="text-[10px] text-slate-300 truncate">{st.rank}</p>}
                          </div>
                        </div>

                        {st.quote && (
                          <p className="text-[11px] text-slate-300 italic bg-[#08111e] p-2 rounded-xl border border-blue-500/10 line-clamp-2 my-1">
                            "{st.quote}"
                          </p>
                        )}

                        {/* Card Footer Actions */}
                        <div className="mt-3 pt-2.5 border-t border-blue-500/15 flex items-center justify-between text-xs">
                          <button
                            type="button"
                            onClick={() => {
                              setTsId(st.id);
                              setTsName(st.name);
                              setTsGrade(st.grade);
                              setTsScore(st.score);
                              setTsRank(st.rank || '');
                              setTsYear(st.year || '');
                              setTsSchool(st.school || '');
                              setTsQuote(st.quote || '');
                              setTsBadge(st.badge || '');
                              setTsPhotoUrl(st.photoUrl || '');
                              setTsPhotoPreview(st.photoUrl || null);
                              setTsFeatured(st.featured !== false);
                              window.scrollTo({ top: 300, behavior: 'smooth' });
                            }}
                            className="btn-cyan btn-sm text-[10px] flex items-center gap-1 font-bold cursor-pointer"
                          >
                            <Edit className="w-3 h-3" />
                            <span>تعديل</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteTopStudent(st.id, st.name)}
                            className="btn-red btn-sm text-[10px] flex items-center gap-1 font-bold cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>حذف</span>
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {/* TAB 5: SETTINGS & DESIGN */}
      {activeMainTab === 'settings' && (
        <div className="space-y-6">
          {/* Settings Form */}
          {/* Live Customizer for Platform Design & Colors */}
          <section className="panel border border-cyan-500/30 bg-[#0f1b2d] shadow-xl p-5 rounded-2xl">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-blue-500/15">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <h3 className="font-extrabold text-lg text-white">🎨 تخصيص مظهر وتصميم المنصة والألوان الحية</h3>
            </div>

            {/* 1. Full Platform Design & Layout Templates Selector */}
            <div className="mb-6 p-4 rounded-2xl bg-[#08111e] border border-cyan-500/25 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-cyan-300">قوالب وتصميمات الهيكل البصري للواجهة (Design Templates)</h4>
                  <p className="text-xs text-slate-300">اختر القالب وشكل المنصة المناسب لمادتك، سيتم تطبيق الألوان والخطوط والخلفيات والبطاقات فوراً:</p>
                </div>
                <span className="badge-pill bg-cyan-950/60 text-cyan-300 border-cyan-400/40 text-[10px] font-bold">
                  6 قوالب فاخرة
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 pt-1">
                {[
                  {
                    id: 'cyberpunk',
                    name: 'النيون العصري الرقمي (Cyberpunk Neon)',
                    desc: 'تصميم تقني متوهج بحواف سماوية ووردية خلفية كحلية عميقة.',
                    primary: '#06b6d4',
                    heading: '#22d3ee',
                    text: '#e0f2fe',
                    panel: '#0a1220',
                    card: '#0f1d32',
                    gold: '#38bdf8',
                    font: "'Readex Pro', sans-serif",
                    pattern: 'gradient',
                  },
                  {
                    id: 'royal-gold',
                    name: 'الملكي الفاخر الأكاديمي (Royal Black & Gold)',
                    desc: 'أناقة فاخرة بخلفية سوداء وتطعيمات ذهبية ملكية.',
                    primary: '#d97706',
                    heading: '#fbbf24',
                    text: '#fef3c7',
                    panel: '#121212',
                    card: '#1c1917',
                    gold: '#f59e0b',
                    font: "'Tajawal', sans-serif",
                    pattern: 'amber',
                  },
                  {
                    id: 'ocean-glass',
                    name: 'المحيط الزجاجي الشفاف (Ocean Breeze Glass)',
                    desc: 'كروت زجاجية مضيئة مع تدرج محيطي أزرق نقي مريح للعين.',
                    primary: '#0284c7',
                    heading: '#38bdf8',
                    text: '#f8fafc',
                    panel: '#0f1b2d',
                    card: '#111f36',
                    gold: '#f59e0b',
                    font: "'Cairo', sans-serif",
                    pattern: 'radial',
                  },
                  {
                    id: 'emerald-elite',
                    name: 'الزمردي الإسلامي الراقي (Emerald Elite)',
                    desc: 'لمسات زمردية خضراء داكنة وهادئة بلمسة إسلامية راقية.',
                    primary: '#059669',
                    heading: '#34d399',
                    text: '#d1fae5',
                    panel: '#061a14',
                    card: '#0c2820',
                    gold: '#fbbf24',
                    font: "'Almarai', sans-serif",
                    pattern: 'emerald',
                  },
                  {
                    id: 'modern-saas',
                    name: 'المينيمال التقني العالمي (Modern Minimal SaaS)',
                    desc: 'تصميم بسيط بنفسجي وإنديغو بأسلوب منصات التعلم العالمية.',
                    primary: '#4f46e5',
                    heading: '#818cf8',
                    text: '#e0e7ff',
                    panel: '#0f172a',
                    card: '#1e293b',
                    gold: '#38bdf8',
                    font: "'IBM Plex Sans Arabic', sans-serif",
                    pattern: 'purple',
                  },
                  {
                    id: 'classical-amiri',
                    name: 'الأصالة والكلاسيكية (Heritage Amiri Serif)',
                    desc: 'طابع لغوي بلاغي أصيل بلمسات برونزية وخط أميري فاخر.',
                    primary: '#b45309',
                    heading: '#f59e0b',
                    text: '#fef3c7',
                    panel: '#180e06',
                    card: '#26180d',
                    gold: '#fbbf24',
                    font: "'Amiri', serif",
                    pattern: 'amber',
                  },
                ].map((tpl) => {
                  const isSelected = primaryColor === tpl.primary && fontFamily === tpl.font;
                  return (
                    <div
                      key={tpl.id}
                      onClick={() => {
                        setPrimaryColor(tpl.primary);
                        setHeadingColor(tpl.heading);
                        setTextColor(tpl.text);
                        setPanelBg(tpl.panel);
                        setCardBg(tpl.card);
                        setAccentGold(tpl.gold);
                        setFontFamily(tpl.font);
                        setBgPattern(tpl.pattern);
                      }}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-2.5 ${
                        isSelected
                          ? 'border-cyan-400 bg-cyan-950/40 shadow-lg ring-2 ring-cyan-400/30'
                          : 'border-blue-500/20 bg-[#0c1628] hover:border-blue-500/50 hover:bg-[#0e1d35]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs text-white">{tpl.name}</span>
                        <div className="flex items-center gap-1">
                          <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: tpl.primary }}></span>
                          <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: tpl.heading }}></span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-snug">{tpl.desc}</p>
                      <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px] text-slate-400">
                        <span>الخط: {tpl.font.split(',')[0]}</span>
                        <span className={isSelected ? 'text-cyan-300 font-bold' : 'text-slate-500'}>
                          {isSelected ? '✓ مفعل حالياً' : 'تطبيق القالب'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <form onSubmit={handleSaveDesign} className="space-y-3.5">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">اسم المنصة</label>
                  <input
                    className="input-field"
                    value={settingsName}
                    onChange={(e) => setSettingsName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">الوصف والشعار الفرعي</label>
                  <input
                    className="input-field"
                    placeholder="مثال: منصة تعليمية متكاملة للغة العربية"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">اللون الأساسي للأزرار والروابط (`--primary-blue`)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      className="w-10 h-10 rounded-lg border border-blue-500/30 cursor-pointer bg-transparent"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                    />
                    <input
                      type="text"
                      className="input-field text-xs font-mono"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">لون العناوين والتمييز (`--heading-theme`)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      className="w-10 h-10 rounded-lg border border-blue-500/30 cursor-pointer bg-transparent"
                      value={headingColor}
                      onChange={(e) => setHeadingColor(e.target.value)}
                    />
                    <input
                      type="text"
                      className="input-field text-xs font-mono"
                      value={headingColor}
                      onChange={(e) => setHeadingColor(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">لون النصوص العامة (`--text-main`)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      className="w-10 h-10 rounded-lg border border-blue-500/30 cursor-pointer bg-transparent"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                    />
                    <input
                      type="text"
                      className="input-field text-xs font-mono"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">خلفية اللوحات والقوائم (`--bg-panel`)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      className="w-10 h-10 rounded-lg border border-blue-500/30 cursor-pointer bg-transparent"
                      value={panelBg}
                      onChange={(e) => setPanelBg(e.target.value)}
                    />
                    <input
                      type="text"
                      className="input-field text-xs font-mono"
                      value={panelBg}
                      onChange={(e) => setPanelBg(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">خلفية البطاقات الكروت (`--bg-card`)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      className="w-10 h-10 rounded-lg border border-blue-500/30 cursor-pointer bg-transparent"
                      value={cardBg}
                      onChange={(e) => setCardBg(e.target.value)}
                    />
                    <input
                      type="text"
                      className="input-field text-xs font-mono"
                      value={cardBg}
                      onChange={(e) => setCardBg(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">اللون الذهبي للجوائز (`--accent-gold`)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      className="w-10 h-10 rounded-lg border border-blue-500/30 cursor-pointer bg-transparent"
                      value={accentGold}
                      onChange={(e) => setAccentGold(e.target.value)}
                    />
                    <input
                      type="text"
                      className="input-field text-xs font-mono"
                      value={accentGold}
                      onChange={(e) => setAccentGold(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">الخط العربي الرسمي للمنصة (Font Family)</label>
                  <select
                    className="input-field text-xs font-bold"
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                  >
                    <option value="'Cairo', sans-serif">Cairo (كايرو - الافتراضي العصري)</option>
                    <option value="'Tajawal', sans-serif">Tajawal (تجوال - واضح وجذاب)</option>
                    <option value="'Almarai', sans-serif">Almarai (المراعي - تصميم نقي)</option>
                    <option value="'Readex Pro', sans-serif">Readex Pro (ريديكس برو - عصري فاخر)</option>
                    <option value="'IBM Plex Sans Arabic', sans-serif">IBM Plex Sans Arabic (تقني احترافي)</option>
                    <option value="'Amiri', serif">Amiri (أميري - كلاسيكي أصيل)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">نمط وتدرج خلفية المنصة العامة</label>
                  <select
                    className="input-field text-xs"
                    value={bgPattern}
                    onChange={(e) => setBgPattern(e.target.value)}
                  >
                    <option value="gradient">تدرج كحلي سماوي</option>
                    <option value="radial">كحلي عميق</option>
                    <option value="emerald">تدرج زمردي</option>
                    <option value="purple">تدرج بنفسجي</option>
                    <option value="amber">تدرج عنبري ذهبي</option>
                    <option value="rose">تدرج ياقوتي</option>
                    <option value="dark">رمادي فحمي داكن</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="btn-cyan w-full py-3 font-extrabold cursor-pointer shadow-lg mt-3"
              >
                تطبيق وحفظ جميع متغيرات CSS والخطوط في قاعدة البيانات
              </button>

              {designMsg && (
                <p className={`text-xs font-bold p-2 rounded-xl text-center ${designMsg.ok ? 'bg-emerald-950/60 text-emerald-300' : 'bg-red-950/60 text-red-300'}`}>
                  {designMsg.text}
                </p>
              )}
            </form>
          </section>

          {/* 2. Allowed Grades Management Panel (تحديد الصفوف الدراسية المتاحة) */}
          <section className="panel border border-cyan-500/25 bg-[#0f1b2d] shadow-xl p-5 rounded-2xl">
            <div className="flex items-center justify-between gap-2 mb-4 pb-2 border-b border-blue-500/15">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-cyan-400" />
                <h3 className="font-extrabold text-lg text-white">🎓 تحديد الصفوف والمراحل الدراسية المفعلة بالمنصة</h3>
              </div>
              <span className="badge-pill bg-cyan-950/60 text-cyan-300 border-cyan-400/30 text-xs font-bold">
                {allowedGradesState.length} صفوف مفعّلة
              </span>
            </div>

            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              اختر الصفوف والمراحل التي تدرس لها. الصفوف المحددة هنا فقط هي التي ستظهر للطالب عند إنشاء حساب جديد وفي فلاتر الكورسات والامتحانات:
            </p>

            <form onSubmit={handleSaveAllowedGrades} className="space-y-4">
              <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  'الصف الرابع الابتدائي',
                  'الصف الخامس الابتدائي',
                  'الصف السادس الابتدائي',
                  'الصف الأول الإعدادي',
                  'الصف الثاني الإعدادي',
                  'الصف الثالث الإعدادي',
                  'الصف الأول الثانوي',
                  'الصف الثاني الثانوي – عام',
                  'الصف الثاني الثانوي – بكالوريا',
                  'الصف الثالث الثانوي',
                ].map((grade) => {
                  const isChecked = allowedGradesState.includes(grade);
                  return (
                    <label
                      key={grade}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isChecked
                          ? 'border-cyan-400 bg-cyan-950/40 text-white font-bold'
                          : 'border-blue-500/15 bg-[#0a1322] text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className="text-xs">{grade}</span>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAllowedGradesState([...allowedGradesState, grade]);
                          } else {
                            if (allowedGradesState.length <= 1) {
                              alert('يجب الإبقاء على صف دراسي واحد على الأقل مفعّلاً بالمنصة');
                              return;
                            }
                            setAllowedGradesState(allowedGradesState.filter((g) => g !== grade));
                          }
                        }}
                        className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
                      />
                    </label>
                  );
                })}
              </div>

              <button
                type="submit"
                className="btn-cyan w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <span>حفظ الصفوف المفعلة بالمنصة</span>
              </button>

              {gradesMsg && (
                <p className={`text-xs font-bold p-2 rounded-xl text-center ${gradesMsg.ok ? 'bg-emerald-950/60 text-emerald-300' : 'bg-red-950/60 text-red-300'}`}>
                  {gradesMsg.text}
                </p>
              )}
            </form>
          </section>

          {/* 3. Registration Form Fields Customization Panel (تخصيص حقول التسجيل) */}
          <section className="panel border border-blue-500/25 bg-[#0f1b2d] shadow-xl p-5 rounded-2xl">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-blue-500/15">
              <UserCheck className="w-5 h-5 text-cyan-400" />
              <h3 className="font-extrabold text-lg text-white">📋 تخصيص قوالب وحقول نموذج تسجيل الطالب</h3>
            </div>

            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              تحكم في الحقول المطلوبة من الطالب أثناء إنشاء الحساب (يمكنك إلغاء إظهار المحافظة أو إضافة تاريخ الميلاد، السنتر، القرية، اسم وهاتف ولي الأمر بحسب رغبتك):
            </p>

            <form onSubmit={handleSaveRegFieldsConfig} className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { id: 'grade', label: 'الصف الدراسي (قائمة اختيار)', desc: 'إلزام الطالب باختيار صفه الدراسي عند التسجيل' },
                  { id: 'governorate', label: 'المحافظة', desc: 'إدخال اسم محافظة الطالب' },
                  { id: 'birthDate', label: 'تاريخ الميلاد', desc: 'إظهار حقل تاريخ ميلاد الطالب' },
                  { id: 'parentName', label: 'اسم ولي الأمر', desc: 'حقل لاسم والد أو ولي أمر الطالب' },
                  { id: 'parentPhone', label: 'رقم هاتف ولي الأمر', desc: 'حقل لرقم هاتف ولي الأمر مع التحقق' },
                  { id: 'center', label: 'اسم السنتر / المجمع التعليمي', desc: 'إظهار حقل كتابة اسم السنتر المسجل به' },
                  { id: 'village', label: 'القرية / المنطقة', desc: 'إظهار حقل مكان الإقامة بالتفصيل' },
                ].map((field) => {
                  const isEnabled = regFieldsState[field.id] !== false;
                  return (
                    <div
                      key={field.id}
                      className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                        isEnabled
                          ? 'border-emerald-500/40 bg-emerald-950/20'
                          : 'border-slate-800 bg-[#0a1322] opacity-70'
                      }`}
                    >
                      <div>
                        <h5 className="font-bold text-xs text-white">{field.label}</h5>
                        <p className="text-[11px] text-slate-400">{field.desc}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setRegFieldsState({
                            ...regFieldsState,
                            [field.id]: !isEnabled,
                          });
                        }}
                        className={`text-xs px-3 py-1.5 rounded-lg font-extrabold cursor-pointer border transition-colors ${
                          isEnabled
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                        }`}
                      >
                        {isEnabled ? 'مفعل ✓' : 'معطل ✕'}
                      </button>
                    </div>
                  );
                })}
              </div>

              <button
                type="submit"
                className="btn-cyan w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <span>حفظ حقول نموذج التسجيل</span>
              </button>

              {regConfigMsg && (
                <p className={`text-xs font-bold p-2 rounded-xl text-center ${regConfigMsg.ok ? 'bg-emerald-950/60 text-emerald-300' : 'bg-red-950/60 text-red-300'}`}>
                  {regConfigMsg.text}
                </p>
              )}
            </form>
          </section>

          {/* 4. Per-Grade Subject Tools Control Panel (تفعيل/تعطيل أقسام وأدوات المادة لكل صف) */}
          <section className="panel border border-cyan-500/30 bg-[#0f1b2d] shadow-xl p-5 rounded-2xl">
            <div className="flex items-center justify-between gap-2 mb-4 pb-2 border-b border-blue-500/15">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-lg text-white">⚙️ التحكم في إتاحة وتفعيل أدوات المادة لكل صف دراسي على حدة</h3>
              </div>
              <span className="badge-pill bg-amber-950/60 text-amber-300 border-amber-500/30 text-xs font-bold">
                تخصيص مادتك الدراسية
              </span>
            </div>

            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              اختر الصف الدراسي وحدد الأقسام المتاحة لطلابه (مثل المعجم، المترجم، خريطة التاريخ 3D، حوار سقراط، محرر البرمجة، محاكي العلوم والكيمياء، والحاسبة العلمية) وحفظ الحالة في قاعدة البيانات:
            </p>

            {/* Select Grade Tabs */}
            <div className="mb-4 flex items-center gap-2 overflow-x-auto scrollbar-none pb-2 border-b border-blue-500/15">
              {allowedGradesState.map((g) => {
                const isSelected = selectedToolsGrade === g;
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setSelectedToolsGrade(g)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
                      isSelected
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white border-cyan-300 shadow-md'
                        : 'bg-[#0a1322] text-slate-300 hover:text-white border-blue-500/15'
                    }`}
                  >
                    <span>{g}</span>
                  </button>
                );
              })}
            </div>

            {/* Current Grade Tool Settings Form */}
            <form onSubmit={handleSaveGradeToolsConfig} className="space-y-4">
              <div className="bg-[#08111e] p-3.5 rounded-xl border border-blue-500/20 mb-2 flex items-center justify-between">
                <div className="text-xs">
                  <span className="text-slate-400">الصف المحدد للتخصيص: </span>
                  <strong className="text-cyan-300 font-extrabold">{selectedToolsGrade}</strong>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const updated = { ...gradeToolsMatrix };
                      updated[selectedToolsGrade] = {
                        arabicLexicon: true,
                        translator: true,
                        geoHistoryMap: true,
                        socratesPhilosophy: true,
                        codeSandbox: true,
                        scienceLab: true,
                        mathCalculator: true,
                      };
                      setGradeToolsMatrix(updated);
                    }}
                    className="text-[10px] px-2.5 py-1 rounded-lg bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900 font-bold cursor-pointer"
                  >
                    تفعيل جميع الأدوات
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = { ...gradeToolsMatrix };
                      updated[selectedToolsGrade] = {
                        arabicLexicon: false,
                        translator: false,
                        geoHistoryMap: false,
                        socratesPhilosophy: false,
                        codeSandbox: false,
                        scienceLab: false,
                        mathCalculator: false,
                      };
                      setGradeToolsMatrix(updated);
                    }}
                    className="text-[10px] px-2.5 py-1 rounded-lg bg-red-950/60 text-red-300 border border-red-500/30 hover:bg-red-900 font-bold cursor-pointer"
                  >
                    تعطيل الكل
                  </button>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { id: 'arabicLexicon', name: 'معجم الضاد والثوابت الإعرابية والبلاغة', subjectTag: 'اللغة العربية', desc: 'قاموس الجذور، الثوابت، سر الجمال البلاغي، وغريب الألفاظ' },
                  { id: 'translator', name: 'مترجم اللغات ومترجم الصور OCR', subjectTag: 'اللغات الأجنبية', desc: 'ترجمة إنجليزية وفرنسية وألمانية مع نطق صوتي وترجمة صور المذكرات' },
                  { id: 'geoHistoryMap', name: 'خريطة العالم 3D ومتحف الآثار والملوك', subjectTag: 'جغرافيا وتاريخ', desc: 'مجسمات تفاعلية 3D لملوك مصر والآثار وخريطة تضاريس العالم' },
                  { id: 'socratesPhilosophy', name: 'حوار سقراط والتفكير المنطقي', subjectTag: 'فلسفة ومنطق', desc: 'شخصية سقراط المتحدثة 3D ومحاكاة الحوار السقراطي والمغالطات المنطقية' },
                  { id: 'codeSandbox', name: 'محرر الأكواد وبيئة البرمجة والتكنولوجيا', subjectTag: 'برمجة وتكنولوجيا', desc: 'محرر تفاعلي مباشر لـ Python, JavaScript, HTML, CSS مع تشغيل الأكواد' },
                  { id: 'scienceLab', name: 'مختبر العلوم والمحاكاة الكميائية والدواء', subjectTag: 'علوم متكاملة وفيزياء وكيمياء', desc: 'محاكاة التفاعلات الكيميائية والدائرة الكهربائية والدينامو والأحياء' },
                  { id: 'mathCalculator', name: 'الحاسبة العلمية والتمثيل البياني للدوال', subjectTag: 'رياضيات', desc: 'آلة حاسبة مطورة ورسم الدوال الرياضية والعمليات الحسابية والمعادلات' },
                ].map((tool) => {
                  const currentGradeConfig = gradeToolsMatrix[selectedToolsGrade] || {};
                  const isEnabled = currentGradeConfig[tool.id] !== false;

                  return (
                    <div
                      key={tool.id}
                      className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                        isEnabled
                          ? 'border-cyan-500/40 bg-cyan-950/20'
                          : 'border-slate-800 bg-[#0a1322] opacity-65'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <h5 className="font-bold text-xs text-white">{tool.name}</h5>
                        </div>
                        <span className="inline-block text-[10px] px-2 py-0.5 rounded bg-blue-950/80 text-cyan-300 border border-blue-500/20 font-extrabold">
                          مادة: {tool.subjectTag}
                        </span>
                        <p className="text-[11px] text-slate-300 leading-snug">{tool.desc}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const gradeCfg = { ...(gradeToolsMatrix[selectedToolsGrade] || {}) };
                          gradeCfg[tool.id] = !isEnabled;
                          setGradeToolsMatrix({
                            ...gradeToolsMatrix,
                            [selectedToolsGrade]: gradeCfg,
                          });
                        }}
                        className={`text-xs px-3.5 py-2 rounded-lg font-black cursor-pointer border shrink-0 transition-colors ${
                          isEnabled
                            ? 'bg-cyan-600 hover:bg-cyan-500 text-white border-cyan-300 shadow'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border-slate-700'
                        }`}
                      >
                        {isEnabled ? 'مفعل ✓' : 'معطل ✕'}
                      </button>
                    </div>
                  );
                })}
              </div>

              <button
                type="submit"
                className="btn-gold w-full py-3 text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-lg mt-2"
              >
                <span>حفظ إعدادات وأدوات المادة لجميع الصفوف في قاعدة البيانات</span>
              </button>

              {gradeToolsMsg && (
                <p className={`text-xs font-bold p-2.5 rounded-xl text-center ${gradeToolsMsg.ok ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30' : 'bg-red-950/80 text-red-300 border border-red-500/30'}`}>
                  {gradeToolsMsg.text}
                </p>
              )}
            </form>
          </section>

          {/* Platform Settings & Hero */}
          <section id="admin-settings" className="panel border border-blue-500/25 bg-[#0f1b2d] shadow-xl p-5 rounded-2xl">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-blue-500/15">
              <Settings className="w-5 h-5 text-cyan-400" />
              <h3 className="font-extrabold text-lg text-white">إعدادات المنصة وصورة الغلاف</h3>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-3.5">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">اسم المنصة</label>
                  <input className="input-field" value={settingsName} onChange={(e) => setSettingsName(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">كود الكاشير لتفعيل الدفع (Cashier Key)</label>
                  <input className="input-field font-mono text-cyan-300" placeholder="مثال: CASHIER-1234" value={cashierKey} onChange={(e) => setCashierKey(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">رابط أو صورة المنصة الرسمية (المعروضة بالمنتصف)</label>
                <input ref={heroInputRef} type="file" accept="image/*" className="input-field text-xs cursor-pointer" />
              </div>

              <div className="flex items-center gap-3 bg-[#111f36] p-3 rounded-xl border border-blue-500/20">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await apiRequest('teacher', '/api/teacher/settings/toggle-pay');
                      await onRefresh();
                    } catch (e: any) {
                      alert(e.message);
                    }
                  }}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  {teacherData?.onlinePay ? (
                    <ToggleRight className="w-8 h-8 text-emerald-400" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-slate-500" />
                  )}
                  <div className="text-right text-xs">
                    <p className="font-bold text-white">تفعيل نظام الدفع الإلكتروني (Online Pay)</p>
                    <p className="text-slate-400">إذا تم التعطيل، ستختفي خيارات الشحن عن جميع الطلاب تماماً.</p>
                  </div>
                </button>
              </div>

              {/* Toggle AI Floating Chatbot Assistant */}
              <div className="flex items-center gap-3 bg-[#111f36] p-3 rounded-xl border border-blue-500/20">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await apiRequest('teacher', '/api/teacher/toggle-ai-assistant');
                      await onRefresh();
                      if (onUpdatePublic) await onUpdatePublic();
                    } catch (e: any) {
                      alert(e.message || 'تعذر تغيير حالة ريبوت الدردشة');
                    }
                  }}
                  className="flex items-center gap-2 cursor-pointer w-full text-right"
                >
                  {teacherData?.showAiAssistant !== false ? (
                    <ToggleRight className="w-8 h-8 text-cyan-400 shrink-0" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-slate-500 shrink-0" />
                  )}
                  <div className="text-right text-xs">
                    <p className="font-bold text-white flex items-center gap-1.5">
                      <Bot className="w-4 h-4 text-amber-400 inline" />
                      <span>تفعيل / إلغاء ريبوت الدردشة المساعد الذكي (AI Floating Assistant)</span>
                    </p>
                    <p className="text-slate-400">
                      {teacherData?.showAiAssistant !== false
                        ? 'الريبوت مفعل حالياً ويظهر لجميع الزوار والطلاب بالأسفل.'
                        : 'الريبوت معطل حالياً ومخفي عن الزوار والطلاب.'}
                    </p>
                  </div>
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">كلمة مرور الأدمن الجديدة</label>
                <input type="password" className="input-field" placeholder="اتركها فارغة إن لم ترغب في التغيير" value={settingsPw} onChange={(e) => setSettingsPw(e.target.value)} />
              </div>

              <button type="submit" className="btn-gold w-full py-2.5 font-bold cursor-pointer">حفظ الإعدادات وصورة المنصة</button>

              {/* Platform Reset & Cleanup Trigger */}
              <div className="pt-3 border-t border-red-500/20 mt-4">
                <div className="bg-red-950/30 border border-red-500/40 p-3.5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-black text-xs text-red-300 flex items-center gap-1.5">
                      <Trash2 className="w-4 h-4 text-red-400" />
                      <span>مسح وتنظيف كافة بيانات المنصة بالكامل (Data Reset)</span>
                    </h4>
                    <p className="text-[11px] text-slate-300 mt-1">
                      حذف كافة حسابات الطلاب، الكورسات، الامتحانات، النتائج، الطلبات، والرسائل والبدء من جديد مع الحفاظ على بيانات حساب الأدمن والإعدادات.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setResetConfirmInput('');
                      setResetMsg(null);
                      setIsResetModalOpen(true);
                    }}
                    className="btn-red text-xs font-black py-2 px-4 shrink-0 cursor-pointer shadow-lg hover:bg-red-700"
                  >
                    مسح وتصفير المنصة بالكامل
                  </button>
                </div>
              </div>

              {settingsMsg && (
                <p className={`text-xs font-bold p-2 rounded-xl text-center ${settingsMsg.ok ? 'bg-emerald-950/60 text-emerald-300' : 'bg-red-950/60 text-red-300'}`}>
                  {settingsMsg.text}
                </p>
              )}
            </form>
          </section>

          {/* Social Links Manager */}
          <section className="panel border border-blue-500/25 bg-[#0f1b2d] shadow-xl p-5 rounded-2xl">
            <div className="flex items-center justify-between gap-2 mb-4 pb-2 border-b border-blue-500/15">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
                <h3 className="font-extrabold text-lg text-white">أزرار وصفحات التواصل الاجتماعي</h3>
              </div>
              <span className="badge-pill bg-blue-950/40 text-blue-300 border-blue-500/30 text-[11px]">
                تظهر بأسفل الصفحة
              </span>
            </div>

            <form onSubmit={handleSaveSocial} className="space-y-2.5 p-3 rounded-xl bg-[#0a1322] border border-blue-500/20 mb-4">
              <h4 className="text-xs font-extrabold text-cyan-300">إضافة زر تواصل جديد</h4>
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">المنصة</label>
                  <select
                    className="input-field text-xs py-1.5"
                    value={socialPlatform}
                    onChange={(e) => {
                      setSocialPlatform(e.target.value);
                      if (!socialTitle) setSocialTitle(e.target.value);
                    }}
                  >
                    <option value="whatsapp">واتساب (WhatsApp)</option>
                    <option value="facebook">فيسبوك (Facebook)</option>
                    <option value="instagram">انستجرام (Instagram)</option>
                    <option value="telegram">تيليجرام (Telegram)</option>
                    <option value="youtube">يوتيوب (YouTube)</option>
                    <option value="tiktok">تيك توك (TikTok)</option>
                    <option value="x">إكس / تويتر (X / Twitter)</option>
                    <option value="linkedin">لينكد إن (LinkedIn)</option>
                    <option value="custom">موقع أو رابط آخر</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">الاسم أو العنوان</label>
                  <input
                    type="text"
                    placeholder="مثال: قناة التيليجرام"
                    className="input-field text-xs py-1.5"
                    value={socialTitle}
                    onChange={(e) => setSocialTitle(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">الرابط المباشر (URL)</label>
                <input
                  type="url"
                  required
                  dir="ltr"
                  placeholder="https://..."
                  className="input-field text-xs py-1.5"
                  value={socialUrl}
                  onChange={(e) => setSocialUrl(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={socialLoading || !socialUrl.trim()}
                className="btn-cyan w-full py-2 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{socialLoading ? 'جاري الحفظ...' : 'إضافة زر التواصل'}</span>
              </button>

              {socialMsg && (
                <p className={`text-[11px] font-bold p-1.5 rounded-lg text-center ${socialMsg.ok ? 'text-emerald-300 bg-emerald-950/50' : 'text-red-300 bg-red-950/50'}`}>
                  {socialMsg.text}
                </p>
              )}
            </form>

            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
              <h4 className="text-xs font-extrabold text-slate-300">الأزرار الحالية ({teacherData.socialLinks?.length || 0}):</h4>
              {(teacherData.socialLinks || []).length === 0 ? (
                <p className="text-xs text-slate-400">لا توجد أزرار تواصل مضافة حالياً.</p>
              ) : (
                (teacherData.socialLinks || []).map((s) => (
                  <div key={s.id} className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#0a1424] border border-blue-500/20 text-xs">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                      <div className="truncate">
                        <p className="font-bold text-white truncate">{s.title || s.platform}</p>
                        <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-[11px] text-cyan-400 hover:underline truncate block">
                          {s.url}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleSocial(s.id)}
                        className={`text-[10px] px-2 py-1 rounded-lg font-bold border transition-colors ${
                          s.active !== false ? 'bg-emerald-950/50 text-emerald-300 border-emerald-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {s.active !== false ? 'مفعل' : 'معطل'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSocial(s.id)}
                        className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      )}

      {/* RECEIPT PREVIEW MODAL */}
      {previewReceiptUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0f1b2d] border border-blue-500/30 rounded-2xl p-4 max-w-2xl w-full space-y-3 shadow-2xl text-right">
            <div className="flex items-center justify-between border-b border-blue-500/20 pb-2">
              <h3 className="font-black text-sm text-white">معاينة إيصال التحويل</h3>
              <button onClick={() => setPreviewReceiptUrl(null)} className="text-slate-400 hover:text-white font-bold text-lg">✕</button>
            </div>
            <div className="max-h-[70vh] overflow-auto flex justify-center bg-[#0a1322] p-2 rounded-xl border border-blue-500/10">
              {previewReceiptUrl.startsWith('rec-') ? (
                <img src={previewReceiptUrl} alt="إيصال التحويل" className="max-w-full h-auto rounded-lg" />
              ) : (
                <div className="p-4 bg-white rounded-xl">
                  <QRCodeSVG value={previewReceiptUrl} size={250} />
                </div>
              )}
            </div>
            <div className="text-left">
              <button onClick={() => setPreviewReceiptUrl(null)} className="btn-gray btn-sm font-bold">إغلاق</button>
            </div>
          </div>
        </div>
      )}

      {/* ADJUST BALANCE MODAL */}
      {adjustModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0f1b2d] border border-blue-500/30 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl text-right">
            <div className="flex items-center justify-between border-b border-blue-500/20 pb-2">
              <h3 className="font-black text-base text-white">تعديل رصيد محفظة: {adjustModalStudent.name}</h3>
              <button onClick={() => setAdjustModalStudent(null)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>

            <p className="text-xs text-slate-300">
              الرصيد الحالي: <b className="text-emerald-400">{adjustModalStudent.walletBalance || 0} ج.م</b>
            </p>

            <form onSubmit={handleAdjustBalance} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">المبلغ (اكتب + للزيادة أو - للخصم)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="مثال: 150 أو -50"
                  className="input-field text-xs"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">السبب / الملاحظة</label>
                <input
                  type="text"
                  placeholder="مثال: مكافأة تفوق أو شحن نقدي بالسنتر"
                  className="input-field text-xs"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={adjustLoading} className="btn-emerald flex-1 py-2 font-bold text-xs cursor-pointer">
                  {adjustLoading ? 'جاري الحفظ...' : 'تأكيد التعديل'}
                </button>
                <button type="button" onClick={() => setAdjustModalStudent(null)} className="btn-gray font-bold text-xs px-4">
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REPORT & EXPORT MODAL */}
      {reportStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#0f1b2d] border border-blue-500/30 rounded-2xl p-6 max-w-xl w-full space-y-4 shadow-2xl text-right">
            <div className="flex items-center justify-between border-b border-blue-500/20 pb-3">
              <h3 className="font-black text-lg text-white">تقرير متابعة الطالب: {reportStudent.name}</h3>
              <button
                onClick={() => setReportStudent(null)}
                className="text-slate-400 hover:text-white font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 bg-[#111f36] p-4 rounded-xl border border-blue-500/15">
              <p><b>الصف الدراسي:</b> {reportStudent.grade}</p>
              <p><b>رقم هاتف الطالب:</b> <span dir="ltr">{reportStudent.phone}</span></p>
              <p><b>اسم ولي الأمر:</b> {reportStudent.parentName || 'غير مسجل'}</p>
              <p><b>هاتف ولي الأمر:</b> <span dir="ltr">{reportStudent.parentPhone || 'غير مسجل'}</span></p>
              <p><b>رصيد المحفظة:</b> <b className="text-emerald-400">{reportStudent.walletBalance || 0} ج.م</b></p>
              <p><b>حالة الاشتراك:</b> {reportStudent.subEnd && new Date(reportStudent.subEnd) > new Date() ? 'مفعّل' : 'غير مفعّل'}</p>
            </div>

            {!reportStudent.parentPhone || !reportStudent.parentPhone.trim() ? (
              <div className="rounded-xl bg-amber-950/60 border border-amber-500/50 p-3.5 text-xs font-bold text-amber-300 leading-relaxed">
                ⚠️ لا يوجد رقم ولي أمر مسجل عبر بوابة المتابعة لهذا الطالب، استخدم الواتساب أو الـ PDF.
              </div>
            ) : null}

            <div className="pt-2 flex flex-wrap gap-2.5 justify-end">
              <button
                type="button"
                onClick={() => {
                  const phone = reportStudent.parentPhone || reportStudent.phone;
                  const text = `تقرير متابعة الطالب: ${reportStudent.name}\nالصف: ${reportStudent.grade}\nالاشتراك: ${reportStudent.subEnd && new Date(reportStudent.subEnd) > new Date() ? 'مفعّل' : 'غير مفعّل'}\nالمنصة التعليمية الشاملة`;
                  window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
                }}
                className="btn-primary btn-sm flex items-center gap-1.5 font-bold py-2.5 px-4 text-xs cursor-pointer"
              >
                <span>إرسال نص واتساب</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="btn-gold btn-sm flex items-center gap-1.5 font-bold py-2.5 px-4 text-xs cursor-pointer"
              >
                <span>توليد PDF للتقرير</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const text = `تقرير متابعة الطالب: ${reportStudent.name} (${reportStudent.grade})`;
                  window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(text)}`, '_blank');
                }}
                className="btn-cyan btn-sm flex items-center gap-1.5 font-bold py-2.5 px-4 text-xs cursor-pointer"
              >
                <span>إرسال عبر تليجرام</span>
              </button>

              <button
                type="button"
                onClick={() => setReportStudent(null)}
                className="btn-gray btn-sm font-bold py-2.5 px-4 text-xs cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAILED STUDENT INFO MODAL (عرض كافة معلومات الطالب المتبقية والمسجلة) */}
      {detailedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-[#0f1b2d] border border-cyan-500/40 rounded-3xl p-6 max-w-3xl w-full space-y-5 shadow-2xl text-right my-8">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
                    <span>بيانات الطالب الشاملة والمسجلة بالمنصة</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${detailedStudent.status === 'blocked' ? 'bg-red-950/80 text-red-300 border-red-500/40' : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'}`}>
                      {detailedStudent.status === 'blocked' ? '🔴 محجوب' : '🟢 نشط'}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    الاسم: <b className="text-white">{detailedStudent.name}</b> • كود الطالب: <span dir="ltr" className="font-mono text-cyan-300 font-bold">{detailedStudent.code}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDetailedStudent(null)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Grid */}
            <div className="grid gap-4 sm:grid-cols-2 text-xs">
              {/* Box 1: Personal Details */}
              <div className="p-4 rounded-2xl bg-[#091324] border border-blue-500/20 space-y-2">
                <h4 className="font-extrabold text-cyan-300 text-sm border-b border-blue-500/15 pb-1.5 flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  <span>البيانات الشخصية والأكاديمية</span>
                </h4>
                <p className="text-slate-300"><b>الاسم بالكامل:</b> <span className="text-white font-bold">{detailedStudent.name}</span></p>
                <p className="text-slate-300"><b>الصف الدراسي:</b> <span className="text-amber-300 font-bold">{detailedStudent.grade}</span></p>
                <p className="text-slate-300"><b>رقم هاتف الطالب:</b> <span dir="ltr" className="font-mono text-cyan-300">{detailedStudent.phone}</span></p>
                <p className="text-slate-300"><b>المحافظة:</b> {detailedStudent.governorate || 'غير مسجل'}</p>
                <p className="text-slate-300"><b>المركز / السنتر:</b> {detailedStudent.center || 'غير مسجل'}</p>
                <p className="text-slate-300"><b>القرية / المنطقة:</b> {detailedStudent.village || 'غير مسجل'}</p>
                <p className="text-slate-300"><b>تاريخ الميلاد:</b> {detailedStudent.birthDate || 'غير مسجل'}</p>
                <p className="text-slate-300"><b>تاريخ التسجيل بالمنصة:</b> {detailedStudent.created ? new Date(detailedStudent.created).toLocaleString('ar-EG') : 'غير متوفر'}</p>
              </div>

              {/* Box 2: Parent & Subscription Details */}
              <div className="p-4 rounded-2xl bg-[#091324] border border-blue-500/20 space-y-2">
                <h4 className="font-extrabold text-amber-300 text-sm border-b border-blue-500/15 pb-1.5 flex items-center gap-1.5">
                  <HeartHandshake className="w-4 h-4" />
                  <span>بيانات ولي الأمر والماليات</span>
                </h4>
                <p className="text-slate-300"><b>اسم ولي الأمر:</b> {detailedStudent.parentName || 'غير مسجل'}</p>
                <p className="text-slate-300"><b>هاتف ولي الأمر:</b> <span dir="ltr" className="font-mono text-cyan-300">{detailedStudent.parentPhone || 'غير مسجل'}</span></p>
                <p className="text-slate-300">
                  <b>كود متابعة ولي الأمر:</b>{' '}
                  <span dir="ltr" className="font-mono font-bold text-amber-300">
                    PR-{detailedStudent.code || detailedStudent.id}
                  </span>
                </p>
                <p className="text-slate-300">
                  <b>رصيد المحفظة المالية:</b>{' '}
                  <b className="text-emerald-400 font-extrabold text-sm">{detailedStudent.walletBalance || 0} ج.م</b>
                </p>
                <p className="text-slate-300">
                  <b>حالة الاشتراك العام:</b>{' '}
                  <span className={`font-bold ${detailedStudent.subEnd && new Date(detailedStudent.subEnd) > new Date() ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {detailedStudent.subEnd && new Date(detailedStudent.subEnd) > new Date()
                      ? `مفعّل حتى ${new Date(detailedStudent.subEnd).toLocaleDateString('ar-EG')}`
                      : 'غير مفعّل / منتهي'}
                  </span>
                </p>
              </div>
            </div>

            {/* QR Code and Center Scan Block */}
            <div className="p-4 rounded-2xl bg-[#08111e] border border-cyan-500/25 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-right">
                <h4 className="font-extrabold text-white text-sm flex items-center gap-1.5">
                  <span>رمز الـ QR الخاص بالحضور والتأكيد في السنتر</span>
                </h4>
                <p className="text-slate-400 text-xs">
                  يمكن قراءة هذا الرمز من خلال ماسح السنتر أو تطبيق المشرفين للتحقق من الطالب وتسجيل الحضور المباشر.
                </p>
                <p className="font-mono text-xs text-amber-300 font-bold pt-1">
                  كود المسح: {detailedStudent.code}
                </p>
              </div>

              <div className="p-3 bg-white rounded-2xl shadow-lg shrink-0">
                <QRCodeSVG value={detailedStudent.code || detailedStudent.id} size={110} />
              </div>
            </div>

            {/* Exam Results Summary for this student */}
            <div className="p-4 rounded-2xl bg-[#091324] border border-blue-500/20 space-y-2">
              <h4 className="font-extrabold text-white text-xs flex items-center justify-between border-b border-blue-500/15 pb-2">
                <span>سجل الامتحانات والاختبارات المنجزة للطالب</span>
                <span className="text-cyan-300 font-mono">
                  {teacherData?.results.filter((r) => r.studentId === detailedStudent.id).length} امتحانات
                </span>
              </h4>

              <div className="max-h-36 overflow-y-auto space-y-1.5 pt-1">
                {teacherData?.results.filter((r) => r.studentId === detailedStudent.id).length === 0 ? (
                  <p className="text-slate-400 text-xs py-2 text-center">لم يقم الطالب بأداء أي امتحانات بعد.</p>
                ) : (
                  teacherData?.results
                    .filter((r) => r.studentId === detailedStudent.id)
                    .map((r) => (
                      <div key={r.id} className="p-2 rounded-xl bg-[#0e1b30] border border-blue-500/15 flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-200 truncate">{r.examTitle}</span>
                        <span className={`font-mono font-bold px-2 py-0.5 rounded ${r.status === 'graded' ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'}`}>
                          {r.status === 'graded' ? `${r.score} / ${r.total} (${r.label || ''})` : 'قيد التصحيح'}
                        </span>
                      </div>
                    ))
                )}
              </div>
            </div>

            {/* Action Buttons inside modal */}
            <div className="pt-2 flex flex-wrap gap-2 justify-between items-center border-t border-cyan-500/20">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAdjustModalStudent(detailedStudent);
                    setDetailedStudent(null);
                  }}
                  className="btn-cyan btn-sm text-xs font-bold cursor-pointer"
                >
                  💳 شحن / تعديل الرصيد
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setReportStudent(detailedStudent);
                    setDetailedStudent(null);
                  }}
                  className="btn-gold btn-sm text-xs font-bold cursor-pointer"
                >
                  📊 تصدير تقرير الطالب
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    await handleStudentAction(detailedStudent.id, 'block');
                    setDetailedStudent(null);
                  }}
                  className={`btn-sm text-xs font-bold cursor-pointer ${detailedStudent.status === 'blocked' ? 'btn-green' : 'btn-red'}`}
                >
                  {detailedStudent.status === 'blocked' ? 'فك الحجب' : 'حجب الطالب'}
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    if (window.confirm(`هل أنت متأكد من حذف الطالب (${detailedStudent.name}) نهائياً وكافة بياناته من قاعدة البيانات؟`)) {
                      await handleStudentAction(detailedStudent.id, 'delete');
                      setDetailedStudent(null);
                    }
                  }}
                  className="btn-red btn-sm text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-lg hover:bg-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>حذف الطالب نهائياً</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDetailedStudent(null)}
                  className="btn-gray btn-sm text-xs font-bold cursor-pointer"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RESET PLATFORM DATA CONFIRMATION MODAL */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#0f1b2d] border border-red-500/50 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl text-right">
            <div className="flex items-center justify-between border-b border-red-500/30 pb-3">
              <h3 className="font-extrabold text-base text-red-400 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span>تأكيد مسح كافة بيانات المنصة بالكامل</span>
              </h3>
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-300 bg-red-950/30 p-3.5 rounded-xl border border-red-500/30 leading-relaxed">
              <p className="font-bold text-red-300">⚠️ إجراء خطير وغير قابل للتراجع!</p>
              <p>سيتم حذف كافة البيانات التالية من قاعدة البيانات نهائياً:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-300 pr-2">
                <li>جميع حسابات الطلاب والنتائج والامتحانات المجابة</li>
                <li>جميع الكورسات والمحتويات المرفوعة والمذكرات والكتب</li>
                <li>جميع الطلبات والشحنات ورسائل الدعم والإعلانات</li>
              </ul>
              <p className="text-[11px] text-emerald-400 pt-1">
                ✓ سيتم الحفاظ على حساب الأدمن والإعدادات العامة للمنصة.
              </p>
            </div>

            <form onSubmit={handleResetPlatformData} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1.5">
                  لتأكيد المسح، يرجى كتابة العبارة التالية بالضبط:
                </label>
                <div className="bg-[#08111e] p-2 rounded-lg border border-red-500/30 text-center font-black text-xs text-red-400 select-all mb-2">
                  مسح البيانات بالكامل
                </div>
                <input
                  type="text"
                  required
                  placeholder='اكتب هنا "مسح البيانات بالكامل"'
                  className="input-field text-xs text-center font-bold text-red-200 border-red-500/40 focus:border-red-400"
                  value={resetConfirmInput}
                  onChange={(e) => setResetConfirmInput(e.target.value)}
                />
              </div>

              {resetMsg && (
                <p className={`text-xs font-bold p-2.5 rounded-xl text-center ${resetMsg.ok ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30' : 'bg-red-950/80 text-red-300 border border-red-500/30'}`}>
                  {resetMsg.text}
                </p>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={resetLoading || resetConfirmInput.trim() !== 'مسح البيانات بالكامل'}
                  className="btn-red flex-1 py-2.5 font-black text-xs cursor-pointer shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resetLoading ? 'جاري المسح والتنظيف...' : 'تأكيد المسح والتصفير النهائي'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(false)}
                  className="btn-gray font-bold text-xs px-5 cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 6: SUPERVISORS MANAGEMENT */}
      {activeMainTab === 'supervisors' && (
        <div className="space-y-6">
          <section className="panel border border-blue-500/25 bg-[#0f1b2d] shadow-xl p-5 rounded-2xl">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-blue-500/15">
              <Shield className="w-5 h-5 text-amber-400" />
              <h3 className="font-extrabold text-lg text-white">إضافة وتعديل حسابات المشرفين وصلاحياتهم</h3>
            </div>
            <p className="text-xs text-slate-300 mb-4">
              يمكنك إضافة مشرفين جدد للمنصة وتحديد الصلاحيات المتاحة لكل مشرف بدقة. يستطيع المشرف تسجيل الدخول برقم هاتفه وكلمة السر المحددة له.
            </p>

            <form onSubmit={handleSaveSupervisor} className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">اسم المشرف</label>
                <input
                  type="text"
                  required
                  className="input-field text-xs"
                  placeholder="مثال: أحمد محمد"
                  value={supName}
                  onChange={(e) => setSupName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">رقم الهاتف (للدخول)</label>
                <input
                  type="text"
                  required
                  className="input-field text-xs"
                  placeholder="010xxxxxxxx"
                  value={supPhone}
                  onChange={(e) => setSupPhone(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">كلمة السر</label>
                <input
                  type="password"
                  required={!supEditId}
                  className="input-field text-xs"
                  placeholder="••••••••"
                  value={supPassword}
                  onChange={(e) => setSupPassword(e.target.value)}
                />
              </div>

              <div className="sm:col-span-3 bg-[#111f36] p-4 rounded-xl border border-blue-500/15">
                <p className="text-xs font-bold text-white mb-3">تحديد الصلاحيات:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  {[
                    { key: 'courses', label: 'إدارة الكورسات' },
                    { key: 'students', label: 'إدارة الطلاب' },
                    { key: 'exams', label: 'الامتحانات والتصحيح' },
                    { key: 'coupons', label: 'الكوبونات والأكواد' },
                    { key: 'financials', label: 'الماليات والمحفظة' },
                    { key: 'notices', label: 'الإعلانات' },
                  ].map((perm) => (
                    <label key={perm.key} className="flex items-center gap-2 cursor-pointer text-slate-200">
                      <input
                        type="checkbox"
                        checked={(supPermissions as any)[perm.key]}
                        onChange={(e) =>
                          setSupPermissions({ ...supPermissions, [perm.key]: e.target.checked })
                        }
                        className="w-4 h-4 rounded text-blue-600 focus:ring-0 bg-[#0c1626] border-blue-500/30 cursor-pointer"
                      />
                      <span>{perm.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="sm:col-span-3 flex items-center gap-3">
                <button type="submit" className="btn-primary py-2.5 px-6 font-bold text-xs cursor-pointer">
                  {supEditId ? 'حفظ التعديلات' : 'إضافة المشرف الجديد'}
                </button>
                {supEditId && (
                  <button
                    type="button"
                    onClick={() => {
                      setSupEditId(null);
                      setSupName('');
                      setSupPhone('');
                      setSupPassword('');
                    }}
                    className="btn-gray py-2.5 px-4 text-xs cursor-pointer"
                  >
                    إلغاء التعديل
                  </button>
                )}
              </div>

              {supMsg && (
                <p
                  className={`sm:col-span-3 text-xs font-bold p-2.5 rounded-xl text-center ${
                    supMsg.ok ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-500/30' : 'text-red-400 bg-red-950/40 border border-red-500/30'
                  }`}
                >
                  {supMsg.text}
                </p>
              )}
            </form>
          </section>

          {/* Supervisors List */}
          <section className="panel border border-blue-500/25 bg-[#0f1b2d] shadow-xl p-5 rounded-2xl">
            <h3 className="font-extrabold text-lg text-white mb-4">قائمة المشرفين المسجلين</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {(!teacherData.supervisors || teacherData.supervisors.length === 0) ? (
                <p className="text-xs text-slate-400 sm:col-span-2">لا توجد حسابات مشرفين مضافة حالياً.</p>
              ) : (
                (teacherData.supervisors || []).map((sv) => (
                  <div key={sv.id} className="card bg-[#111f36] border border-blue-500/20 p-4 text-xs space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-black text-white text-sm">{sv.name}</span>
                      <span className="badge-pill bg-blue-950/60 text-blue-300 border-blue-500/30">
                        {sv.phone}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {Object.entries(sv.permissions || {}).map(([k, v]) => v ? (
                        <span key={k} className="px-2 py-0.5 rounded bg-emerald-950/50 text-emerald-300 border border-emerald-500/20 text-[10px]">
                          {k}
                        </span>
                      ) : null)}
                    </div>
                    <div className="flex justify-end gap-2 pt-2 border-t border-blue-500/10">
                      <button
                        type="button"
                        onClick={() => {
                          setSupEditId(sv.id);
                          setSupName(sv.name);
                          setSupPhone(sv.phone);
                          setSupPermissions(sv.permissions || supPermissions);
                        }}
                        className="btn-primary btn-sm text-[10px] cursor-pointer"
                      >
                        تعديل
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSupervisor(sv.id)}
                        className="btn-red btn-sm text-[10px] cursor-pointer"
                      >
                        حذف
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      )}
      {/* TAB: GOOGLE MEET LIVE BROADCAST & AUTOMATED FIREBASE ATTENDANCE */}
      {activeMainTab === 'meet' && (
        <div className="space-y-6">
          {/* Header & Stats Banner */}
          <div className="panel border border-cyan-500/30 bg-gradient-to-br from-[#0c1a2e] to-[#081220] shadow-2xl p-6 rounded-2xl">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-cyan-500/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
                  <Video className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-extrabold text-xl text-white flex items-center gap-2">
                    <span>نظام البث المباشر وتسجيل الحضور الآلي (Google Meet)</span>
                    <span className="badge-pill bg-emerald-950/60 text-emerald-400 border-emerald-500/40 text-[11px]">
                      مربوط ببث Firebase الحقيقي
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    أنشئ حلقة البث المباشر، وتابع حضور طلابك لحظياً فور انضمامهم عبر رابط Google Meet.
                  </p>
                </div>
              </div>

              {/* KPI Badges */}
              <div className="flex items-center gap-2">
                <div className="bg-[#111f36] border border-blue-500/20 px-3 py-2 rounded-xl text-center">
                  <p className="text-[10px] text-slate-400 font-bold">جلسات البث</p>
                  <p className="text-lg font-black text-cyan-300">{teacherData.liveSessions?.length || 0}</p>
                </div>
                <div className="bg-[#111f36] border border-blue-500/20 px-3 py-2 rounded-xl text-center">
                  <p className="text-[10px] text-slate-400 font-bold">إجمالي عمليات الحضور</p>
                  <p className="text-lg font-black text-emerald-400">{teacherData.liveAttendance?.length || 0}</p>
                </div>
              </div>
            </div>

            {/* Create Live Session Form */}
            <form onSubmit={handleCreateLiveSession} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">عنوان البث المباشر</label>
                <input
                  required
                  type="text"
                  placeholder="مثال: مراجعة ليلة الامتحان - نحو وبلاغة"
                  className="input-field text-xs"
                  value={meetTitle}
                  onChange={(e) => setMeetTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">رابط Google Meet</label>
                <input
                  required
                  type="url"
                  dir="ltr"
                  placeholder="https://meet.google.com/abc-defg-hij"
                  className="input-field text-xs"
                  value={meetUrl}
                  onChange={(e) => setMeetUrl(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">الصف الدراسي المستهدف</label>
                <select
                  className="input-field text-xs"
                  value={meetGrade}
                  onChange={(e) => setMeetGrade(e.target.value)}
                >
                  {ALL_GRADES.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">تاريخ ووقت البث المباشر</label>
                <input
                  type="datetime-local"
                  className="input-field text-xs"
                  value={meetScheduledAt}
                  onChange={(e) => setMeetScheduledAt(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">حالة البث</label>
                <select
                  className="input-field text-xs"
                  value={meetStatus}
                  onChange={(e) => setMeetStatus(e.target.value as any)}
                >
                  <option value="active">🔴 جاري الآن (مفتوح للطلاب)</option>
                  <option value="scheduled">⏱️ مجدول (قريباً)</option>
                  <option value="ended">🛑 منتهي (مغلق)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">ملاحظات / تعليمات البث</label>
                <input
                  type="text"
                  placeholder="يرجى إحضار كشكول الملاحظات والدخول بالاسم الثلاثي..."
                  className="input-field text-xs"
                  value={meetNotes}
                  onChange={(e) => setMeetNotes(e.target.value)}
                />
              </div>

              <div className="lg:col-span-3 flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={meetLoading}
                  className="btn-cyan py-2.5 px-6 font-bold text-xs flex items-center gap-2 cursor-pointer shadow-cyan-500/20"
                >
                  <Video className="w-4 h-4" />
                  <span>{meetLoading ? 'جاري الحفظ والنشر...' : 'نشر وتفعيل البث المباشر'}</span>
                </button>

                {meetMsg && (
                  <span className={`text-xs font-bold ${meetMsg.ok ? 'text-emerald-400' : 'text-red-400'}`}>
                    {meetMsg.text}
                  </span>
                )}
              </div>
            </form>
          </div>

          {/* Active Google Meet Sessions List */}
          <section className="panel border border-blue-500/25 bg-[#0f1b2d] shadow-xl p-5 rounded-2xl">
            <h4 className="font-extrabold text-base text-white mb-3 flex items-center gap-2">
              <span>حلقات البث المباشر المنشورة حالياً</span>
              <span className="text-xs font-normal text-slate-400">({teacherData.liveSessions?.length || 0} جلسة)</span>
            </h4>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {(!teacherData.liveSessions || teacherData.liveSessions.length === 0) ? (
                <p className="text-xs text-slate-400 sm:col-span-3 text-center py-6">
                  لا توجد حلقات بث مباشر أنشئت بعد. قم بتعبئة النموذج أعلاه لنشر بث مباشر للطلاب.
                </p>
              ) : (
                teacherData.liveSessions.map((session: any) => {
                  const sessionAttendance = (teacherData.liveAttendance || []).filter((a: any) => a.sessionId === session.id);
                  const isSessionActive = session.status === 'active' || session.status === 'live';
                  const isSessionScheduled = session.status === 'scheduled' || session.status === 'upcoming';
                  return (
                    <div
                      key={session.id}
                      className="card bg-[#111f36] border border-cyan-500/20 p-4 rounded-xl space-y-2.5 relative overflow-hidden"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-black text-white text-sm truncate">{session.title}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isSessionActive
                            ? 'bg-red-950/80 text-red-300 border border-red-500/40 animate-pulse'
                            : isSessionScheduled
                            ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {isSessionActive ? '🔴 جاري الآن' : isSessionScheduled ? '⏱️ مجدول' : '🛑 انتهى'}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-300 space-y-1">
                        <p>🎯 الصف: <strong className="text-cyan-300">{session.grade}</strong></p>
                        <p className="truncate" dir="ltr">🔗 {session.meetUrl}</p>
                        <p>👥 الطلاب الحاضرون آلياً: <strong className="text-emerald-400">{sessionAttendance.length} طالب</strong></p>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-blue-500/15">
                        <button
                          type="button"
                          onClick={() => setPreviewReceiptUrl(session.id)}
                          className="btn-emerald btn-sm text-[10px] inline-flex items-center gap-1 font-bold"
                        >
                          <span>QR</span>
                        </button>
                        <a
                          href={session.meetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-cyan btn-sm text-[10px] inline-flex items-center gap-1 font-bold"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>فتح Meet</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(session.meetUrl);
                            alert('تم نسخ رابط Google Meet بنجاح!');
                          }}
                          className="btn-gray btn-sm text-[10px] inline-flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" />
                          <span>نسخ الرابط</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteLiveSession(session.id)}
                          className="btn-red btn-sm text-[10px] mr-auto"
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* Automated Firebase Student Attendance Tracker Table */}
          <section className="panel border border-emerald-500/30 bg-[#0f1b2d] shadow-xl p-5 rounded-2xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-emerald-500/20">
              <div>
                <h4 className="font-extrabold text-lg text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>كشف حضور الطلاب الآلي والموثق للبث المباشر</span>
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  يتم توثيق اسم ورقم هاتف وتاريخ ووقت انضمام كل طالب آلياً بضغطة زر عند فتح رابط البث.
                </p>
              </div>

              {/* Attendance Quick Filters & Report Copy Button */}
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  placeholder="بحث باسم الطالب أو رقم الهاتف..."
                  className="input-field text-xs py-1.5 px-3 w-48"
                  value={attendanceSearchQuery}
                  onChange={(e) => setAttendanceSearchQuery(e.target.value)}
                />

                <button
                  type="button"
                  onClick={() => {
                    const filtered = (teacherData.liveAttendance || []).filter((a: any) => {
                      const matchSearch = !attendanceSearchQuery || a.studentName?.includes(attendanceSearchQuery) || a.studentPhone?.includes(attendanceSearchQuery);
                      const matchSession = selectedSessionFilter === 'all' || a.sessionId === selectedSessionFilter;
                      return matchSearch && matchSession;
                    });
                    const reportText = `📊 *تقرير حضور البث المباشر عبر Google Meet*\nعدد الحضور: ${filtered.length} طالب\n---------------------\n` +
                      filtered.map((a: any, i: number) => `${i + 1}. ${a.studentName} (${a.grade}) - ${a.sessionTitle} - الموعد: ${new Date(a.joinedAt).toLocaleTimeString('ar-EG')}`).join('\n');
                    navigator.clipboard.writeText(reportText);
                    alert('تم نسخ تقرير الحضور كاملاً بصيغة منسقة للواتساب!');
                  }}
                  className="btn-emerald btn-sm inline-flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>نسخ تقرير الحضور</span>
                </button>
              </div>
            </div>

            {/* Manual Attendance Registration Box */}
            <form onSubmit={handleManualAttendance} className="p-3.5 rounded-xl bg-[#0a1220] border border-blue-500/20 flex flex-wrap items-center gap-3 text-xs">
              <span className="font-bold text-cyan-300 flex items-center gap-1">
                <PlusCircle className="w-4 h-4 text-cyan-400" />
                <span>تسجيل حضور طالب يدوياً (في حال حدوث مشكلة تقنية لديه):</span>
              </span>

              <select
                className="input-field text-xs py-1 w-48"
                value={manualSessionId}
                onChange={(e) => setManualSessionId(e.target.value)}
              >
                <option value="">-- اختر حلقة البث المباشر --</option>
                {(teacherData.liveSessions || []).map((s: any) => (
                  <option key={s.id} value={s.id}>{s.title} ({s.grade})</option>
                ))}
              </select>

              <select
                className="input-field text-xs py-1 w-52"
                value={manualStudentId}
                onChange={(e) => setManualStudentId(e.target.value)}
              >
                <option value="">-- اختر الطالب المسجل --</option>
                {teacherData.students.map((st: any) => (
                  <option key={st.id} value={st.id}>{st.name} - {st.phone} ({st.grade})</option>
                ))}
              </select>

              <button type="submit" className="btn-primary btn-sm font-bold text-xs py-1 cursor-pointer">
                تأكيد الحضور
              </button>
            </form>

            {/* Attendance Table */}
            <div className="overflow-x-auto rounded-xl border border-blue-500/20 bg-[#091222]">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#0e1d35] text-cyan-300 font-extrabold border-b border-blue-500/20">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">اسم الطالب</th>
                    <th className="p-3">رقم الهاتف</th>
                    <th className="p-3">الصف</th>
                    <th className="p-3">عنوان حلقة البث</th>
                    <th className="p-3">تاريخ ووقت الحضور</th>
                    <th className="p-3">حالة التوثيق</th>
                    <th className="p-3">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-500/10 text-slate-200">
                  {(!teacherData.liveAttendance || teacherData.liveAttendance.length === 0) ? (
                    <tr>
                      <td colSpan={8} className="p-6 text-center text-slate-400">
                        لا توجد عمليات حضور مسجلة بعد. عند انضمام أي طالب للبث المباشر، سيظهر اسمه ووقت حضوره آلياً هنا.
                      </td>
                    </tr>
                  ) : (
                    (teacherData.liveAttendance || [])
                      .filter((a: any) => {
                        const matchSearch = !attendanceSearchQuery ||
                          (a.studentName || '').includes(attendanceSearchQuery) ||
                          (a.studentPhone || '').includes(attendanceSearchQuery);
                        const matchSession = selectedSessionFilter === 'all' || a.sessionId === selectedSessionFilter;
                        return matchSearch && matchSession;
                      })
                      .map((log: any, idx: number) => (
                        <tr key={log.id || idx} className="hover:bg-blue-950/30 transition-colors">
                          <td className="p-3 font-bold text-slate-400">{idx + 1}</td>
                          <td className="p-3 font-black text-white">{log.studentName || 'طالب'}</td>
                          <td className="p-3 font-mono text-cyan-300">{log.studentPhone || 'غير موضح'}</td>
                          <td className="p-3">{log.grade || 'عام'}</td>
                          <td className="p-3 font-medium text-slate-300">{log.sessionTitle || 'بث مباشر'}</td>
                          <td className="p-3 font-mono text-emerald-400">
                            {log.joinedAt ? new Date(log.joinedAt).toLocaleString('ar-EG') : 'الآن'}
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              log.type === 'auto' || log.status === 'حاضر آلياً'
                                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                                : 'bg-blue-950/80 text-blue-300 border border-blue-500/40'
                            }`}>
                              {log.status || 'حاضر آلياً'}
                            </span>
                          </td>
                          <td className="p-3">
                            {log.studentPhone && (
                              <a
                                href={`https://wa.me/2${log.studentPhone.replace(/\D/g, '')}?text=${encodeURIComponent(`أهلاً بك يا ${log.studentName}، تم توثيق حضورك في البث المباشر (${log.sessionTitle}) بنجاح!`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-green btn-sm text-[10px] inline-flex items-center gap-1"
                              >
                                واتساب
                              </a>
                            )}
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* TAB: TOP STUDENTS MANAGEMENT (إدارة ونشر لوحة شرف المتفوقين مع رفع الصور من الجهاز) */}
      {activeMainTab === 'top-students' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="card bg-gradient-to-r from-[#0d1d38] via-[#091528] to-[#1a1208] border border-amber-500/30 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1.5 text-center md:text-right">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/70 border border-amber-500/40 text-amber-300 text-xs font-bold">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>لوحة الشرف • طلابنا المتفوقين</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                إدارة وتكريم الطلاب الأوائل والمتفوقين
              </h3>
              <p className="text-xs text-slate-300 max-w-xl">
                انشر أسماء وصور وبيانات المتفوقين ونسبهم المئوية ليراها جميع زوار المنصة والطلاب وأولياء الأمور كقدوة ومصدر فخر واعتزاز.
              </p>
            </div>

            <div className="text-center md:text-left bg-black/40 p-4 rounded-xl border border-amber-500/20 shrink-0">
              <span className="text-[11px] text-slate-400 block mb-0.5">إجمالي المتفوقين المنشورين</span>
              <strong className="text-2xl font-black text-amber-400">
                {(teacherData.topStudents || []).length} طالب وطالبة
              </strong>
            </div>
          </div>

          {/* Add / Edit Form */}
          <section className="panel bg-[#0f1b2d] border border-blue-500/25 p-6 rounded-2xl shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-blue-500/20">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-amber-400" />
                <h4 className="text-base font-black text-white">
                  {tsId ? 'تعديل بيانات الطالب المتفوق' : 'إضافة وتكريم طالب متفوق جديد'}
                </h4>
              </div>
              {tsId && (
                <button
                  type="button"
                  onClick={() => {
                    setTsId(null);
                    setTsName('');
                    setTsScore('99.6%');
                    setTsRank('المركز الأول');
                    setTsSchool('');
                    setTsQuote('');
                    setTsPhotoUrl('');
                    setTsPhotoPreview(null);
                  }}
                  className="btn-gray btn-sm text-xs font-bold cursor-pointer"
                >
                  إلغاء التعديل
                </button>
              )}
            </div>

            {tsMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                  tsMsg.ok
                    ? 'bg-emerald-950/70 text-emerald-200 border border-emerald-500/40'
                    : 'bg-red-950/70 text-red-200 border border-red-500/40'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{tsMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleSaveTopStudent} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Student Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    اسم الطالب/ة الرباعي <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: مريم حسام عبد الرحمن"
                    value={tsName}
                    onChange={(e) => setTsName(e.target.value)}
                    className="input-field text-xs py-2.5"
                  />
                </div>

                {/* Grade */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">الصف الدراسي</label>
                  <select
                    value={tsGrade}
                    onChange={(e) => setTsGrade(e.target.value)}
                    className="input-field text-xs py-2.5"
                  >
                    <option value="الصف الثالث الثانوي">الصف الثالث الثانوي</option>
                    <option value="الصف الثاني الثانوي – عام">الصف الثاني الثانوي – عام</option>
                    <option value="الصف الأول الثانوي">الصف الأول الثانوي</option>
                    <option value="الصف الثالث الإعدادي">الصف الثالث الإعدادي</option>
                    <option value="الصف الثاني الإعدادي">الصف الثاني الإعدادي</option>
                    <option value="الصف الأول الإعدادي">الصف الأول الإعدادي</option>
                  </select>
                </div>

                {/* Score / Percentage */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    المجموع أو النسبة المئوية <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: 99.4% أو 408.5 / 410"
                    value={tsScore}
                    onChange={(e) => setTsScore(e.target.value)}
                    className="input-field text-xs py-2.5 font-bold text-amber-300"
                  />
                </div>

                {/* Rank */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">الترتيب أو المركز</label>
                  <input
                    type="text"
                    placeholder="مثال: المركز الأول على الجمهورية / الأول بالمدرسة"
                    value={tsRank}
                    onChange={(e) => setTsRank(e.target.value)}
                    className="input-field text-xs py-2.5"
                  />
                </div>

                {/* School & Governorate */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">المدرسة / المحافظة</label>
                  <input
                    type="text"
                    placeholder="مثال: مدرسة المتفوقين الثانوية - القاهرة"
                    value={tsSchool}
                    onChange={(e) => setTsSchool(e.target.value)}
                    className="input-field text-xs py-2.5"
                  />
                </div>

                {/* Academic Year */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">العام الدراسي</label>
                  <input
                    type="text"
                    placeholder="مثال: 2025 / 2026"
                    value={tsYear}
                    onChange={(e) => setTsYear(e.target.value)}
                    className="input-field text-xs py-2.5"
                  />
                </div>

                {/* Honor Badge */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">الوسام التكريمي</label>
                  <input
                    type="text"
                    placeholder="مثال: وسام عبقرية اللغة العربية 🥇"
                    value={tsBadge}
                    onChange={(e) => setTsBadge(e.target.value)}
                    className="input-field text-xs py-2.5"
                  />
                </div>

                {/* Student Quote */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    كلمة الطالب أو نصيحة لزملائه
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: الاستمرار والمتابعة مع الأستاذ محمد عبد المقصود كانا السر وراء العلامة الكاملة"
                    value={tsQuote}
                    onChange={(e) => setTsQuote(e.target.value)}
                    className="input-field text-xs py-2.5"
                  />
                </div>

                {/* Photo Upload from Device (الميزة المطلوبة: رفع صورة الطالب من الجهاز) */}
                <div className="sm:col-span-2 lg:col-span-3 bg-[#0a1424] border border-blue-500/20 p-4 rounded-xl space-y-3">
                  <label className="block text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-cyan-400" />
                    <span>صورة الطالب/ة المتفوق (ارفعها مباشرة من هاتفك أو جهاز الكمبيوتر)</span>
                  </label>

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* Device File Input */}
                    <input
                      ref={tsPhotoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleTsPhotoUpload}
                      className="text-xs text-slate-300 file:mr-0 file:ml-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-cyan-600 file:text-white hover:file:bg-cyan-500 cursor-pointer"
                    />

                    <span className="text-xs text-slate-400">أو رابط صورة خارجي:</span>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={tsPhotoUrl}
                      onChange={(e) => {
                        setTsPhotoUrl(e.target.value);
                        setTsPhotoPreview(e.target.value);
                      }}
                      className="input-field text-xs py-1.5 flex-1"
                    />
                  </div>

                  {/* Photo Preview */}
                  {(tsPhotoPreview || tsPhotoUrl) && (
                    <div className="flex items-center gap-3 pt-2">
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-amber-400 shadow-lg bg-black">
                        <img
                          src={tsPhotoPreview || tsPhotoUrl}
                          alt="معاينة صورة الطالب"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-xs space-y-1">
                        <span className="text-emerald-400 font-bold block">✅ تم تحميل الصورة بنجاح وتجهيزها للنشر</span>
                        <button
                          type="button"
                          onClick={() => {
                            setTsPhotoPreview(null);
                            setTsPhotoUrl('');
                            if (tsPhotoInputRef.current) tsPhotoInputRef.current.value = '';
                          }}
                          className="text-red-400 hover:text-red-300 text-[11px] underline cursor-pointer"
                        >
                          إزالة الصورة
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={tsLoading}
                  className="btn-primary py-2.5 px-6 text-xs font-black flex items-center gap-2 rounded-xl cursor-pointer shadow-lg hover:shadow-cyan-500/20"
                >
                  <Trophy className="w-4 h-4 text-amber-300" />
                  <span>{tsLoading ? 'جاري الحفظ...' : tsId ? 'تحديث بيانات المتفوق' : 'نشر وتكريم الطالب في لوحة الشرف'}</span>
                </button>

                {tsId && (
                  <button
                    type="button"
                    onClick={() => {
                      setTsId(null);
                      setTsName('');
                      setTsScore('99.6%');
                      setTsRank('المركز الأول');
                      setTsSchool('');
                      setTsQuote('');
                      setTsPhotoUrl('');
                      setTsPhotoPreview(null);
                    }}
                    className="btn-gray py-2.5 px-4 text-xs font-bold rounded-xl cursor-pointer"
                  >
                    إلغاء
                  </button>
                )}
              </div>
            </form>
          </section>

          {/* Published Students List & Search */}
          <section className="panel bg-[#0f1b2d] border border-blue-500/25 p-6 rounded-2xl shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-blue-500/20">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <h4 className="text-base font-black text-white">
                  قائمة الطلاب المتفوقين في لوحة الشرف ({(teacherData.topStudents || []).length})
                </h4>
              </div>

              <div className="w-full sm:w-64">
                <input
                  type="text"
                  placeholder="بحث باسم الطالب أو المدرسة..."
                  value={tsSearchQuery}
                  onChange={(e) => setTsSearchQuery(e.target.value)}
                  className="input-field text-xs py-2 w-full"
                />
              </div>
            </div>

            {/* Students Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(teacherData.topStudents || [])
                .filter((st: any) => {
                  if (!tsSearchQuery.trim()) return true;
                  const q = tsSearchQuery.toLowerCase();
                  return (
                    st.name.toLowerCase().includes(q) ||
                    (st.school && st.school.toLowerCase().includes(q)) ||
                    (st.grade && st.grade.toLowerCase().includes(q))
                  );
                })
                .map((student: any) => (
                  <div
                    key={student.id}
                    className="card bg-[#111f36] border border-blue-500/20 hover:border-amber-400/50 p-4 rounded-2xl flex flex-col justify-between shadow-lg space-y-3 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      {/* Photo Thumbnail */}
                      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-amber-400 shadow-md shrink-0 bg-[#091222] flex items-center justify-center">
                        {student.photoUrl ? (
                          <img
                            src={student.photoUrl}
                            alt={student.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <GraduationCap className="w-7 h-7 text-amber-400" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h5 className="font-black text-sm text-white truncate">{student.name}</h5>
                        <p className="text-[11px] text-cyan-300 truncate font-semibold">{student.grade}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="badge-pill bg-amber-950/70 text-amber-300 border-amber-500/40 text-[10px] font-black">
                            {student.score}
                          </span>
                          {student.rank && (
                            <span className="text-[10px] text-slate-300 font-bold truncate">
                              {student.rank}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {student.quote && (
                      <p className="text-[11px] text-slate-300 italic line-clamp-2 bg-[#091222] p-2 rounded-lg border border-blue-500/10">
                        "{student.quote}"
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-blue-500/15 text-xs">
                      <span className="text-[10px] text-slate-400">{student.year || 'العام الحالي'}</span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setTsId(student.id);
                            setTsName(student.name);
                            setTsGrade(student.grade);
                            setTsScore(student.score);
                            setTsRank(student.rank || '');
                            setTsYear(student.year || '');
                            setTsSchool(student.school || '');
                            setTsQuote(student.quote || '');
                            setTsBadge(student.badge || '');
                            setTsPhotoUrl(student.photoUrl || '');
                            setTsPhotoPreview(student.photoUrl || null);
                            window.scrollTo({ top: 300, behavior: 'smooth' });
                          }}
                          className="btn-cyan btn-sm text-[10px] py-1 px-2.5 font-bold cursor-pointer"
                        >
                          تعديل
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteTopStudent(student.id, student.name)}
                          className="btn-red btn-sm text-[10px] py-1 px-2.5 font-bold cursor-pointer"
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {(!teacherData.topStudents || teacherData.topStudents.length === 0) && (
              <p className="text-xs text-slate-400 p-6 text-center">
                لا يوجد طلاب متفوقين منشورين حالياً. استخدم النموذج أعلاه لنشر أول طالب متفوق!
              </p>
            )}
          </section>
        </div>
      )}

    </div>
  );
};
