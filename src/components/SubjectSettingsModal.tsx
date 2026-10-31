import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Key,
  ShieldCheck,
  CheckCircle,
  X,
  User,
  Sparkles,
  Eye,
  EyeOff,
  Users,
  Plus,
  Trash2,
  Check,
  FlaskConical,
  Calculator,
  Compass,
  Code,
  Globe2,
  Atom,
  Lock,
  Phone,
  Layers,
  ArrowRight,
  Zap,
  GraduationCap,
  ClipboardList,
  CheckSquare,
  Square
} from 'lucide-react';
import { TeacherProfile } from '../types';

interface SubjectSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSubjectAuth?: {
    username?: string;
    subjectName?: string;
    subjectCategory?: string;
    teacherName?: string;
  };
  onSave: () => void;
}

const PRESET_SUBJECTS = [
  'اللغة العربية',
  'جغرافيا وتاريخ',
  'رياضيات',
  'برمجة وتكنولوجيا',
  'فلسفة ومنطق',
  'لغة إنجليزية',
  'لغة ألمانية',
  'لغة فرنسية',
  'علوم متكاملة',
  'فيزياء',
  'كيمياء',
  'أحياء وجيولوجيا'
];

export const ALL_LABS_AND_TOOLS = [
  {
    key: 'scienceLab',
    title: 'معمل العلوم والكيمياء والفيزياء الافتراضي',
    desc: 'تجارب تفاعلية للكيمياء، محاكي الدوائر الكهربائية، والمجهر البيولوجي 3D.',
    icon: FlaskConical,
    badge: 'كيمياء وفيزياء وأحياء',
  },
  {
    key: 'mathCalculator',
    title: 'الحاسبة البيانية والمعادلات الرياضية والهندسة',
    desc: 'رسم الدوال الجبرية، حساب التكامل والتفاضل، والجذور المثلثية.',
    icon: Calculator,
    badge: 'رياضيات وهندسة',
  },
  {
    key: 'arabicLexicon',
    title: 'معجم وبنك مصطلحات اللغة العربية والمعاني',
    desc: 'البحث الفوري في لسان العرب وجذور الكلمات وبلاغة القرآن والنحو.',
    icon: BookOpen,
    badge: 'لغة عربية',
  },
  {
    key: 'translator',
    title: 'المترجم الذكي متعدد اللغات ونطق الكلمات',
    desc: 'ترجمة ونطق صوتي مباشر للإنجليزية والألمانية والفرنسية.',
    icon: Globe2,
    badge: 'لغات أجنبية',
  },
  {
    key: 'geoHistoryMap',
    title: 'خريطة التاريخ والجغرافيا التفاعلية 3D',
    desc: 'استكشاف تضاريس العالم، الحضارات التاريخية، وأطلس ثلاثي الأبعاد.',
    icon: Compass,
    badge: 'جغرافيا وتاريخ',
  },
  {
    key: 'codeSandbox',
    title: 'بيئة ومحرر البرمجة وتجربة الأكواد المباشرة',
    desc: 'محرر تفاعلي لتشغيل لغات الويب، البايثون، والمنطق البرمجي.',
    icon: Code,
    badge: 'حاسب آلي وتكنولوجيا',
  },
  {
    key: 'socratesPhilosophy',
    title: 'حوار سقراط الفلسفي وتنمية التفكير النقدي',
    desc: 'محاور فلسفي ذكي لمناقشة قضايا المنطق والأخلاق والفلسفة.',
    icon: Atom,
    badge: 'فلسفة ومنطق',
  },
  {
    key: 'virtualLabChemistry',
    title: 'معمل الكيمياء والتفاعلات الكيميائية',
    desc: 'خلط المحاليل والمركبات واختبار التفاعلات مع لهب بنسن التفاعلي.',
    icon: FlaskConical,
    badge: 'كيمياء متقدمة',
  },
  {
    key: 'physicsCircuitsLab',
    title: 'معمل الدوائر الكهربائية والفيزياء',
    desc: 'توصيل المقاومات والمكثفات والبطاريات وقياس فرق الجهد والتيار.',
    icon: Zap,
    badge: 'فيزياء عملية',
  },
  {
    key: 'biologyMicroscopeLab',
    title: 'معمل المجهر الرقمي والأحياء 3D',
    desc: 'فحص عينات الخلايا النباتية والحيوانية والبكتيريا تحت العدسات.',
    icon: Eye,
    badge: 'أحياء وجيولوجيا',
  },
];

export const SubjectSettingsModal: React.FC<SubjectSettingsModalProps> = ({
  isOpen,
  onClose,
  initialSubjectAuth,
  onSave,
}) => {
  // Authentication gate
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Tabs: 'student-tools' | 'registration' | 'teachers' | 'auth'
  const [activeTab, setActiveTab] = useState<'student-tools' | 'registration' | 'teachers' | 'auth'>('student-tools');

  // Multi-Teacher State
  const [teachers, setTeachers] = useState<TeacherProfile[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');

  // Add Teacher Form
  const [newTeacherName, setNewTeacherName] = useState('');
  const [newSubjectName, setNewSubjectName] = useState('اللغة العربية');
  const [newSubjectCategory, setNewSubjectCategory] = useState('المرحلة الثانوية');
  const [newPhone, setNewPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newBio, setNewBio] = useState('');
  const [addingTeacher, setAddingTeacher] = useState(false);
  const [teacherMsg, setTeacherMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // Student Visible Tools State (التي تظهر للطالب في المنصة)
  const [studentTools, setStudentTools] = useState<Record<string, boolean>>({
    arabicLexicon: true,
    translator: true,
    geoHistoryMap: true,
    socratesPhilosophy: true,
    codeSandbox: true,
    scienceLab: true,
    mathCalculator: true,
    virtualLabChemistry: true,
    physicsCircuitsLab: true,
    biologyMicroscopeLab: true,
  });
  const [savingStudentTools, setSavingStudentTools] = useState(false);
  const [studentToolsMsg, setStudentToolsMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // Registration Page Config (المعامل والحقول التي تظهر في صفحة التسجيل)
  const [showToolsInRegister, setShowToolsInRegister] = useState(true);
  const [registerTools, setRegisterTools] = useState<Record<string, boolean>>({
    arabicLexicon: true,
    translator: true,
    geoHistoryMap: true,
    socratesPhilosophy: true,
    codeSandbox: true,
    scienceLab: true,
    mathCalculator: true,
  });
  const [regFields, setRegFields] = useState<Record<string, boolean>>({
    governorate: true,
    parentName: true,
    parentPhone: true,
    birthDate: false,
    center: false,
    village: false,
    grade: true,
  });
  const [savingRegistration, setSavingRegistration] = useState(false);
  const [regMsg, setRegMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // Master Auth Form
  const [masterUser, setMasterUser] = useState(initialSubjectAuth?.username || 'ام ويب');
  const [masterPass, setMasterPass] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [savingAuth, setSavingAuth] = useState(false);
  const [authMsg, setAuthMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // Load LernWeb Data
  const loadLernWebData = async () => {
    setLoadingData(true);
    try {
      const res = await fetch('/api/lernweb/data');
      if (res.ok) {
        const data = await res.json();
        if (data.teachers && Array.isArray(data.teachers)) {
          setTeachers(data.teachers);
          const active = data.teachers.find((t: any) => t.active) || data.teachers[0];
          if (active) {
            setSelectedTeacherId(active.id);
          }
        }
        if (data.studentVisibleTools) {
          setStudentTools(data.studentVisibleTools);
        }
        if (data.showInteractiveToolsInRegister !== undefined) {
          setShowToolsInRegister(data.showInteractiveToolsInRegister);
        }
        if (data.registrationTools) {
          setRegisterTools(data.registrationTools);
        }
        if (data.registrationFieldsConfig) {
          setRegFields(data.registrationFieldsConfig);
        }
        if (data.subjectAuth?.username) {
          setMasterUser(data.subjectAuth.username);
        }
      }
    } catch (e) {
      console.error('Failed to load lernweb data', e);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadLernWebData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 1. Verify Master Login
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      const res = await fetch('/api/lernweb/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: loginUser.trim(),
          password: loginPass.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'بيانات الدخول غير صحيحة');
      setIsAuthenticated(true);
      await loadLernWebData();
    } catch (err: any) {
      setLoginError(err.message || 'بيانات الدخول غير صحيحة');
    } finally {
      setLoginLoading(false);
    }
  };

  // 2. Save Student Visible Tools (التي تظهر للطالب)
  const handleSaveStudentTools = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingStudentTools(true);
    setStudentToolsMsg(null);
    try {
      const res = await fetch('/api/lernweb/settings/tools-and-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentVisibleTools: studentTools,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل حفظ إعدادات المعامل');
      setStudentToolsMsg({ text: 'تم حفظ وتفعيل المعامل والأدوات التفاعلية للطالب بنجاح!', ok: true });
      await loadLernWebData();
      onSave();
    } catch (err: any) {
      setStudentToolsMsg({ text: err.message || 'تعذر حفظ المعامل', ok: false });
    } finally {
      setSavingStudentTools(false);
    }
  };

  // 3. Save Registration Page Config & Tools (صفحة التسجيل)
  const handleSaveRegistrationConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingRegistration(true);
    setRegMsg(null);
    try {
      const res = await fetch('/api/lernweb/settings/tools-and-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          showInteractiveToolsInRegister: showToolsInRegister,
          registrationTools: registerTools,
          registrationFieldsConfig: regFields,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل حفظ إعدادات صفحة التسجيل');
      setRegMsg({ text: 'تم حفظ إعدادات المعامل وحقول استمارة التسجيل بنجاح!', ok: true });
      await loadLernWebData();
      onSave();
    } catch (err: any) {
      setRegMsg({ text: err.message || 'تعذر حفظ الإعدادات', ok: false });
    } finally {
      setSavingRegistration(false);
    }
  };

  // 4. Add New Teacher
  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingTeacher(true);
    setTeacherMsg(null);
    try {
      const res = await fetch('/api/lernweb/teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTeacherName.trim(),
          subjectName: newSubjectName.trim(),
          subjectCategory: newSubjectCategory.trim(),
          phone: newPhone.trim(),
          password: newPassword.trim(),
          bio: newBio.trim(),
          active: teachers.length === 0,
          toolsConfig: studentTools,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل إضافة المدرس');

      setTeacherMsg({ text: 'تمت إضافة المدرس وتخصيص مادته بنجاح!', ok: true });
      setNewTeacherName('');
      setNewPhone('');
      setNewPassword('');
      setNewBio('');
      await loadLernWebData();
      onSave();
    } catch (err: any) {
      setTeacherMsg({ text: err.message || 'حدث خطأ أثناء إضافة المدرس', ok: false });
    } finally {
      setAddingTeacher(false);
    }
  };

  // 5. Set Active Teacher
  const handleSetActiveTeacher = async (id: string) => {
    try {
      const res = await fetch('/api/lernweb/teacher/set-active', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('فشل تعيين المدرس');
      await loadLernWebData();
      onSave();
    } catch (e: any) {
      console.error(e);
    }
  };

  // 6. Delete Teacher
  const handleDeleteTeacher = async (id: string, name: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف المدرس "${name}"؟`)) return;
    try {
      const res = await fetch('/api/lernweb/teacher/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('فشل الحذف');
      await loadLernWebData();
      onSave();
    } catch (e: any) {
      console.error(e);
    }
  };

  // 7. Save Master Credentials
  const handleSaveMasterAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAuth(true);
    setAuthMsg(null);
    try {
      const res = await fetch('/api/teacher/subject-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: masterUser,
          password: masterPass.trim() ? masterPass : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل الحفظ');
      setAuthMsg({ text: 'تم تحديث بيانات دخول إدارة ام ويب بنجاح!', ok: true });
      setMasterPass('');
      onSave();
    } catch (err: any) {
      setAuthMsg({ text: err.message || 'حدث خطأ', ok: false });
    } finally {
      setSavingAuth(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-4xl my-6 rounded-3xl bg-gradient-to-b from-[#0f1c32] via-[#091426] to-[#060c18] border border-cyan-500/40 p-5 sm:p-7 shadow-2xl text-right max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="إغلاق النافذة"
          className="absolute left-5 top-5 p-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-cyan-500/25">
          <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/40 text-cyan-400 shadow-inner">
            <Layers className="w-7 h-7" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-400/30 text-[11px] font-bold text-cyan-300 mb-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>الإدارة المركزية الحصرية لشبكة ام ويب</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              بوابة إدارة ام ويب المركزية (M-Web Control)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              تحديد المعامل والأدوات التفاعلية للطالب، وتخصيص المعامل المعروضة وحقول استمارة صفحة التسجيل.
            </p>
          </div>
        </div>

        {/* ============================================================ */}
        {/* GATE: UNVERIFIED SCREEN */}
        {/* ============================================================ */}
        {!isAuthenticated ? (
          <div className="p-6 rounded-2xl bg-[#091528] border border-cyan-500/25 space-y-5 max-w-md mx-auto">
            <div className="text-center space-y-1.5">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-white">تسجيل الدخول لإدارة ام ويب</h3>
              <p className="text-xs text-slate-300">
                أدخل اسم المستخدم وكلمة السر المعتمدة للوصول للوحة التحكم
              </p>
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs font-bold text-center">
                {loginError}
              </div>
            )}

            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">اسم المستخدم</label>
                <input
                  type="text"
                  required
                  placeholder="اسم المستخدم"
                  value={loginUser}
                  onChange={(e) => setLoginUser(e.target.value)}
                  className="input-field text-xs font-bold w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">كلمة السر</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  className="input-field text-xs font-mono w-full"
                />
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="btn-cyan w-full py-2.5 text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{loginLoading ? 'جاري التحقق...' : 'دخول لوحة التحكم'}</span>
              </button>
            </form>
          </div>
        ) : (
          /* ============================================================ */
          /* UNLOCKED MANAGEMENT TABS */
          /* ============================================================ */
          <div className="space-y-6">
            {/* Tabs Header */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 rounded-2xl bg-[#08111e] border border-cyan-500/25 text-xs font-extrabold">
              <button
                type="button"
                onClick={() => setActiveTab('student-tools')}
                className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  activeTab === 'student-tools'
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FlaskConical className="w-4 h-4" />
                <span>معامل وأدوات الطالب</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('registration')}
                className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  activeTab === 'registration'
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ClipboardList className="w-4 h-4" />
                <span>صفحة التسجيل والمعامل</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('teachers')}
                className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  activeTab === 'teachers'
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>المدرسين والمواد ({teachers.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('auth')}
                className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  activeTab === 'auth'
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Key className="w-4 h-4" />
                <span>أمان وبوابة الدخول</span>
              </button>
            </div>

            {/* ============================================================ */}
            {/* TAB 1: STUDENT VISIBLE TOOLS (المعامل والأدوات التي تظهر للطالب) */}
            {/* ============================================================ */}
            {activeTab === 'student-tools' && (
              <div className="space-y-5">
                <div className="p-4 sm:p-5 rounded-2xl bg-[#081324] border border-cyan-500/25 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-cyan-500/20">
                    <div>
                      <h3 className="text-sm font-black text-cyan-300 flex items-center gap-2">
                        <FlaskConical className="w-4 h-4 text-amber-400" />
                        <span>تحديد المعامل والأدوات التفاعلية التي تظهر للطالب في المنصة</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        قم بتفعيل أو تعطيل المعامل التي يستطيع الطالب فتحها واستخدامها في مساحته الخاصة:
                      </p>
                    </div>

                    {/* Quick Selection Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const allOn: Record<string, boolean> = {};
                          ALL_LABS_AND_TOOLS.forEach(item => { allOn[item.key] = true; });
                          setStudentTools(allOn);
                        }}
                        className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-cyan-900/60 text-cyan-200 border border-cyan-500/40 hover:bg-cyan-800 transition-colors cursor-pointer"
                      >
                        تفعيل جميع المعامل ✓
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const allOff: Record<string, boolean> = {};
                          ALL_LABS_AND_TOOLS.forEach(item => { allOff[item.key] = false; });
                          setStudentTools(allOff);
                        }}
                        className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-colors cursor-pointer"
                      >
                        تعطيل الكل ✕
                      </button>
                    </div>
                  </div>

                  {studentToolsMsg && (
                    <div
                      className={`p-3 rounded-xl text-xs font-bold text-center ${
                        studentToolsMsg.ok
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                          : 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                      }`}
                    >
                      {studentToolsMsg.text}
                    </div>
                  )}

                  <form onSubmit={handleSaveStudentTools} className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {ALL_LABS_AND_TOOLS.map((item) => {
                        const Icon = item.icon;
                        const isEnabled = studentTools[item.key] !== false;
                        return (
                          <div
                            key={item.key}
                            onClick={() => {
                              setStudentTools({
                                ...studentTools,
                                [item.key]: !isEnabled,
                              });
                            }}
                            className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 cursor-pointer ${
                              isEnabled
                                ? 'bg-[#0a1628] border-cyan-500/50 shadow-md ring-1 ring-cyan-500/20'
                                : 'bg-[#050b14] border-slate-800 opacity-60'
                            }`}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Icon className={`w-4 h-4 ${isEnabled ? 'text-cyan-400' : 'text-slate-500'}`} />
                                <h5 className="font-extrabold text-xs text-white">{item.title}</h5>
                              </div>
                              <p className="text-[11px] text-slate-300 leading-relaxed">{item.desc}</p>
                              <span className="inline-block text-[10px] font-bold text-amber-300/90 font-mono">
                                [{item.badge}]
                              </span>
                            </div>

                            <button
                              type="button"
                              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-black cursor-pointer transition-all border ${
                                isEnabled
                                  ? 'bg-emerald-600 text-white border-emerald-400 shadow'
                                  : 'bg-slate-800 text-slate-400 border-slate-700'
                              }`}
                            >
                              {isEnabled ? 'مفعّل للطالب ✓' : 'معطّل ✕'}
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    <button
                      type="submit"
                      disabled={savingStudentTools}
                      className="btn-cyan w-full py-3 text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>{savingStudentTools ? 'جاري الحفظ...' : 'حفظ وتطبيق المعامل التفاعلية على مساحة الطالب الآن'}</span>
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* TAB 2: REGISTRATION PAGE & TOOLS (المعامل وحقول صفحة التسجيل) */}
            {/* ============================================================ */}
            {activeTab === 'registration' && (
              <div className="space-y-5">
                <form onSubmit={handleSaveRegistrationConfig} className="space-y-5">
                  {regMsg && (
                    <div
                      className={`p-3 rounded-xl text-xs font-bold text-center ${
                        regMsg.ok
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                          : 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                      }`}
                    >
                      {regMsg.text}
                    </div>
                  )}

                  {/* Section A: Showcase Interactive Tools in Registration Page */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#081324] border border-cyan-500/25 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-cyan-500/20">
                      <div>
                        <h3 className="text-sm font-black text-cyan-300 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-amber-400" />
                          <span>المعامل والأدوات التفاعلية المعروضة في صفحة تسجيل الطالب</span>
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          حدد المعامل التي تظهر كبطاقات ومميزات ترويجية في استمارة تسجيل الطالب الجديد لترغيبه في الاشتراك:
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowToolsInRegister(!showToolsInRegister)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer border transition-all ${
                            showToolsInRegister
                              ? 'bg-emerald-900/60 text-emerald-200 border-emerald-500/50'
                              : 'bg-rose-950/60 text-rose-300 border-rose-500/40'
                          }`}
                        >
                          {showToolsInRegister ? 'قسم المعامل ظاهر في التسجيل ✓' : 'مخفي من صفحة التسجيل ✕'}
                        </button>
                      </div>
                    </div>

                    {showToolsInRegister && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-300">
                            اختر المعامل المحددة التي تظهر شاراتها في صفحة التسجيل:
                          </span>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const allOn: Record<string, boolean> = {};
                                ALL_LABS_AND_TOOLS.forEach(item => { allOn[item.key] = true; });
                                setRegisterTools(allOn);
                              }}
                              className="text-[11px] text-cyan-400 hover:underline font-bold"
                            >
                              تحديد الكل
                            </button>
                            <span className="text-slate-600">|</span>
                            <button
                              type="button"
                              onClick={() => {
                                const allOff: Record<string, boolean> = {};
                                ALL_LABS_AND_TOOLS.forEach(item => { allOff[item.key] = false; });
                                setRegisterTools(allOff);
                              }}
                              className="text-[11px] text-slate-400 hover:underline font-bold"
                            >
                              إلغاء الكل
                            </button>
                          </div>
                        </div>

                        <div className="grid gap-2.5 sm:grid-cols-2">
                          {ALL_LABS_AND_TOOLS.map((item) => {
                            const Icon = item.icon;
                            const isIncluded = registerTools[item.key] !== false;
                            return (
                              <div
                                key={item.key}
                                onClick={() => {
                                  setRegisterTools({
                                    ...registerTools,
                                    [item.key]: !isIncluded,
                                  });
                                }}
                                className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                                  isIncluded
                                    ? 'bg-[#0a1628] border-cyan-500/40 text-white'
                                    : 'bg-[#050b14] border-slate-800 text-slate-400 opacity-60'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <Icon className={`w-4 h-4 ${isIncluded ? 'text-cyan-400' : 'text-slate-500'}`} />
                                  <span className="text-xs font-bold">{item.title}</span>
                                </div>
                                <span className={`text-xs font-black ${isIncluded ? 'text-emerald-400' : 'text-slate-500'}`}>
                                  {isIncluded ? 'معروض ✓' : 'مخفي ✕'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Section B: Registration Form Fields */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#081324] border border-cyan-500/25 space-y-4">
                    <div className="pb-3 border-b border-cyan-500/20">
                      <h3 className="text-sm font-black text-cyan-300 flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-emerald-400" />
                        <span>حقول استمارة صفحة التسجيل (بيانات الطالب المطلوبة)</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        حدد الحقول الإضافية التي تريد إظهارها وإلزام الطالب بتعبئتها أثناء إنشاء حسابه الجديد:
                      </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      {[
                        { key: 'governorate', label: 'المحافظة (القاهرة، الإسكندرية...)', desc: 'لتحديد النطاق الجغرافي للطالب' },
                        { key: 'parentName', label: 'اسم ولي الأمر', desc: 'لربط وتوثيق حسابات أولياء الأمور' },
                        { key: 'parentPhone', label: 'رقم هاتف ولي الأمر', desc: 'لإرسال تقارير المتابعة والدرجات' },
                        { key: 'grade', label: 'الصف الدراسي', desc: 'عرض قائمة الصفوف الدراسية المعتمدة' },
                        { key: 'birthDate', label: 'تاريخ الميلاد', desc: 'تحديد الفئة العمرية وتاريخ ميلاد الطالب' },
                        { key: 'center', label: 'المركز التعليمي / السنتر', desc: 'في حال التدريس بسناتر أو مراكز محددة' },
                        { key: 'village', label: 'القرية / الحي السكني', desc: 'تفاصيل محل السكن الإضافية' },
                      ].map((field) => {
                        const isFieldActive = regFields[field.key] !== false;
                        return (
                          <div
                            key={field.key}
                            onClick={() => {
                              setRegFields({
                                ...regFields,
                                [field.key]: !isFieldActive,
                              });
                            }}
                            className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 cursor-pointer transition-all ${
                              isFieldActive
                                ? 'bg-[#0a1628] border-cyan-500/40 text-white'
                                : 'bg-[#050b14] border-slate-800 text-slate-400 opacity-60'
                            }`}
                          >
                            <div className="space-y-0.5">
                              <h5 className="text-xs font-black text-white">{field.label}</h5>
                              <p className="text-[11px] text-slate-400">{field.desc}</p>
                            </div>
                            <span className={`text-xs font-black ${isFieldActive ? 'text-emerald-400' : 'text-slate-500'}`}>
                              {isFieldActive ? 'ظاهر ✓' : 'مخفي ✕'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={savingRegistration}
                    className="btn-cyan w-full py-3 text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{savingRegistration ? 'جاري الحفظ...' : 'حفظ إعدادات صفحة التسجيل والمعامل المعروضة'}</span>
                  </button>
                </form>
              </div>
            )}

            {/* ============================================================ */}
            {/* TAB 3: MULTI-TEACHER & SUBJECT MANAGEMENT */}
            {/* ============================================================ */}
            {activeTab === 'teachers' && (
              <div className="space-y-6">
                {/* Form to Add a New Teacher */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#081324] border border-cyan-500/25 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20">
                    <h3 className="text-sm font-black text-cyan-300 flex items-center gap-2">
                      <Plus className="w-4 h-4 text-emerald-400" />
                      <span>إضافة مدرس جديد وتخصيص مادته ومعمله وصفحته</span>
                    </h3>
                    <span className="badge-pill bg-cyan-950 text-cyan-300 border-cyan-500/30 text-[10px]">
                      منظومة المدرسين المتعددين
                    </span>
                  </div>

                  {teacherMsg && (
                    <div
                      className={`p-3 rounded-xl text-xs font-bold text-center ${
                        teacherMsg.ok
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                          : 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                      }`}
                    >
                      {teacherMsg.text}
                    </div>
                  )}

                  <form onSubmit={handleAddTeacher} className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">اسم المدرس *</label>
                        <input
                          type="text"
                          required
                          placeholder="مثال: أستاذ أحمد محمود"
                          value={newTeacherName}
                          onChange={(e) => setNewTeacherName(e.target.value)}
                          className="input-field text-xs w-full"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">المرحلة الدراسية *</label>
                        <input
                          type="text"
                          required
                          placeholder="مثال: المرحلة الثانوية"
                          value={newSubjectCategory}
                          onChange={(e) => setNewSubjectCategory(e.target.value)}
                          className="input-field text-xs w-full"
                        />
                      </div>
                    </div>

                    {/* Subject Specialization with quick presets */}
                    <div>
                      <label className="block text-xs font-bold text-cyan-300 mb-1.5 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>مادة وتخصص المدرس (يتم تعيينها حصرياً من هنا) *:</span>
                      </label>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {PRESET_SUBJECTS.map((sub) => (
                          <button
                            key={sub}
                            type="button"
                            onClick={() => setNewSubjectName(sub)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all border ${
                              newSubjectName === sub
                                ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow'
                                : 'bg-[#060c18] text-slate-300 border-cyan-500/20 hover:border-cyan-400'
                            }`}
                          >
                            {sub}
                          </button>
                        ))}
                      </div>
                      <input
                        type="text"
                        required
                        value={newSubjectName}
                        onChange={(e) => setNewSubjectName(e.target.value)}
                        placeholder="أو اكتب اسم المادة والتخصص..."
                        className="input-field text-xs w-full font-bold text-cyan-200"
                      />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">رقم الهاتف للدخول *</label>
                        <input
                          type="text"
                          required
                          dir="ltr"
                          placeholder="01xxxxxxxxx"
                          value={newPhone}
                          onChange={(e) => setNewPhone(e.target.value)}
                          className="input-field text-xs w-full font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">كلمة السر *</label>
                        <input
                          type="text"
                          required
                          placeholder="••••••••"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="input-field text-xs w-full font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">نبذة عن المدرس والخبرة</label>
                      <textarea
                        rows={2}
                        value={newBio}
                        onChange={(e) => setNewBio(e.target.value)}
                        placeholder="اكتب نبذة مختصرة عن مؤهلات وخبرة المدرس..."
                        className="input-field text-xs w-full"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={addingTeacher}
                      className="btn-cyan w-full py-2.5 text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{addingTeacher ? 'جاري الإضافة...' : 'حفظ وإضافة المدرس للمنصة'}</span>
                    </button>
                  </form>
                </div>

                {/* Teachers List */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-slate-300 flex items-center gap-2">
                    <Users className="w-4 h-4 text-cyan-400" />
                    <span>المدرسون المسجلون حالياً ({teachers.length})</span>
                  </h4>

                  <div className="grid gap-3">
                    {teachers.map((t) => (
                      <div
                        key={t.id}
                        className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          t.active
                            ? 'bg-[#0b1a30] border-cyan-400/60 shadow-lg ring-1 ring-cyan-500/30'
                            : 'bg-[#060c18] border-cyan-500/20 opacity-80'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 font-black">
                            {t.name ? t.name.charAt(0) : 'م'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="font-black text-sm text-white">{t.name}</h5>
                              {t.active && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-cyan-950 text-cyan-300 border border-cyan-400/40">
                                  المدرس النشط حالياً للمنصة
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-cyan-300/90 font-bold mt-0.5">
                              {t.subjectName} • {t.subjectCategory}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {!t.active && (
                            <button
                              type="button"
                              onClick={() => handleSetActiveTeacher(t.id)}
                              className="btn-cyan btn-sm text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Check className="w-3 h-3" />
                              <span>تعيين كمدرس المنصة النشط</span>
                            </button>
                          )}

                          {teachers.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleDeleteTeacher(t.id, t.name)}
                              className="btn-red btn-sm text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>حذف</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* TAB 4: MASTER CREDENTIALS (أمان وبوابة الدخول) */}
            {/* ============================================================ */}
            {activeTab === 'auth' && (
              <div className="p-5 rounded-2xl bg-[#081324] border border-cyan-500/25 space-y-4 max-w-lg mx-auto">
                <div className="flex items-center gap-2 pb-2 border-b border-cyan-500/20">
                  <Key className="w-5 h-5 text-amber-400" />
                  <div>
                    <h3 className="text-sm font-black text-white">تعديل بيانات دخول إدارة ام ويب المركزية</h3>
                    <p className="text-[11px] text-slate-400">
                      يمكنك تغيير اسم المستخدم وكلمة السر المستخدمة لفتح هذه اللوحة المركزية في أي وقت:
                    </p>
                  </div>
                </div>

                {authMsg && (
                  <div
                    className={`p-3 rounded-xl text-xs font-bold text-center ${
                      authMsg.ok
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                        : 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                    }`}
                  >
                    {authMsg.text}
                  </div>
                )}

                <form onSubmit={handleSaveMasterAuth} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">اسم المستخدم الجديد</label>
                    <input
                      type="text"
                      required
                      value={masterUser}
                      onChange={(e) => setMasterUser(e.target.value)}
                      placeholder="اسم المستخدم"
                      className="input-field text-xs font-bold w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">كلمة السر الجديدة</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={masterPass}
                        onChange={(e) => setMasterPass(e.target.value)}
                        placeholder="اتركها فارغة لعدم التغيير"
                        className="input-field text-xs font-mono w-full pl-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-300 p-1 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={savingAuth}
                    className="btn-cyan w-full py-2.5 text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{savingAuth ? 'جاري الحفظ...' : 'حفظ بيانات الدخول الجديدة'}</span>
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
