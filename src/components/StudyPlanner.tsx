import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, Circle, Clock, Plus, Trash2, Edit3, Sparkles, BookOpen, AlertCircle, CheckSquare, BarChart3, Target, Flame, ArrowRight, X } from 'lucide-react';
import { StudentProfile } from '../types';

export interface StudyTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface StudySession {
  id: string;
  subject: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  durationMinutes: number;
  priority: 'high' | 'medium' | 'low';
  tasks: StudyTask[];
  completed: boolean;
  notes?: string;
  created: string;
}

interface StudyPlannerProps {
  profile?: StudentProfile | null;
  onClose?: () => void;
}

const DEFAULT_SESSIONS: StudySession[] = [
  {
    id: 'plan-1',
    subject: 'النحو والصرف',
    title: 'مراجعة المفاعيل الخمسة وحل بنك الأسئلة',
    date: new Date().toISOString().split('T')[0],
    time: '17:00',
    durationMinutes: 60,
    priority: 'high',
    completed: false,
    notes: 'التركيز على المفعول لأجله والمفعول معه وإعراب الكلمات الفرعية',
    created: new Date().toISOString(),
    tasks: [
      { id: 't1-1', title: 'قراءة مقتضيات القواعد والخرائط الذهنية', completed: true },
      { id: 't1-2', title: 'حل 20 سؤالاً اختيارياً على منصة ام ويب', completed: false },
      { id: 't1-3', title: 'مراجعة الإجابات ونموذج التصحيح الذكي', completed: false },
    ]
  },
  {
    id: 'plan-2',
    subject: 'البلاغة والأدب',
    title: 'مراجعة الصور البيانية والمحسنات اللفظية',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    time: '19:30',
    durationMinutes: 45,
    priority: 'medium',
    completed: false,
    notes: 'التدريب على الفرق بين الاستعارة المكنية والتصريحية',
    created: new Date().toISOString(),
    tasks: [
      { id: 't2-1', title: 'تلخيص أسرار البلاغة والتفرقة بين التشبيه والكناية', completed: false },
      { id: 't2-2', title: 'إجابة اختبار البلاغة التفاعلي', completed: false },
    ]
  },
  {
    id: 'plan-3',
    subject: 'النصوص والمطالعة',
    title: 'تحليل نص متحرر وتطبيق القواعد النحوية',
    date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
    time: '16:00',
    durationMinutes: 50,
    priority: 'low',
    completed: false,
    notes: 'استخراج الكلمات المفتاحية وفهم المغزى الضمني',
    created: new Date().toISOString(),
    tasks: [
      { id: 't3-1', title: 'قراءة المقال الأسبوعي للأستاذ محمد', completed: false },
      { id: 't3-2', title: 'حل تطبيقات القراءة النقدية', completed: false },
    ]
  }
];

export const StudyPlanner: React.FC<StudyPlannerProps> = ({ profile, onClose }) => {
  const studentKey = `student_study_planner_${profile?.code || profile?.id || 'guest'}`;
  
  const [sessions, setSessions] = useState<StudySession[]>(() => {
    try {
      const saved = localStorage.getItem(studentKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse study planner state:', e);
    }
    return DEFAULT_SESSIONS;
  });

  const [activeFilter, setActiveFilter] = useState<'all' | 'today' | 'upcoming' | 'completed'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSession, setEditingSession] = useState<StudySession | null>(null);

  // Form State
  const [formSubject, setFormSubject] = useState('النحو والصرف');
  const [formTitle, setFormTitle] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formTime, setFormTime] = useState('18:00');
  const [formDuration, setFormDuration] = useState(45);
  const [formPriority, setFormPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [formNotes, setFormNotes] = useState('');
  const [formTasksText, setFormTasksText] = useState('قراءة الشرح والخرائط الذهنية\nحل بنك الأسئلة التفاعلي\nمراجعة الأخطاء');

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(studentKey, JSON.stringify(sessions));
    } catch (e) {
      console.error('Failed to save study planner to localStorage', e);
    }
  }, [sessions, studentKey]);

  // Handle task toggle
  const toggleTask = (sessionId: string, taskId: string) => {
    setSessions(prev => prev.map(s => {
      if (s.id !== sessionId) return s;
      const updatedTasks = s.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
      const allDone = updatedTasks.length > 0 && updatedTasks.every(t => t.completed);
      return {
        ...s,
        tasks: updatedTasks,
        completed: allDone
      };
    }));
  };

  // Toggle whole session completed
  const toggleSessionCompleted = (sessionId: string) => {
    setSessions(prev => prev.map(s => {
      if (s.id !== sessionId) return s;
      const targetState = !s.completed;
      return {
        ...s,
        completed: targetState,
        tasks: s.tasks.map(t => ({ ...t, completed: targetState }))
      };
    }));
  };

  // Delete session
  const deleteSession = (id: string) => {
    if (confirm('هل أنت تأكد من حذف جلسة المراجعة هذه؟')) {
      setSessions(prev => prev.filter(s => s.id !== id));
    }
  };

  // Handle Submit Form
  const handleSaveSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const rawTasks = formTasksText
      .split('\n')
      .map(t => t.trim())
      .filter(Boolean)
      .map((t, idx) => ({
        id: `task-${Date.now()}-${idx}`,
        title: t,
        completed: false
      }));

    if (editingSession) {
      setSessions(prev => prev.map(s => s.id === editingSession.id ? {
        ...s,
        subject: formSubject,
        title: formTitle.trim(),
        date: formDate,
        time: formTime,
        durationMinutes: Number(formDuration) || 45,
        priority: formPriority,
        notes: formNotes.trim(),
        tasks: rawTasks.length > 0 ? rawTasks : s.tasks
      } : s));
    } else {
      const newS: StudySession = {
        id: `session-${Date.now()}`,
        subject: formSubject,
        title: formTitle.trim(),
        date: formDate,
        time: formTime,
        durationMinutes: Number(formDuration) || 45,
        priority: formPriority,
        notes: formNotes.trim(),
        tasks: rawTasks.length > 0 ? rawTasks : [{ id: `t-${Date.now()}`, title: 'مراجعة الدرس والحل', completed: false }],
        completed: false,
        created: new Date().toISOString()
      };
      setSessions(prev => [newS, ...prev]);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormTitle('');
    setFormNotes('');
    setFormTasksText('قراءة الشرح والخرائط الذهنية\nحل بنك الأسئلة التفاعلي\nمراجعة الأخطاء');
    setEditingSession(null);
    setShowAddModal(false);
  };

  const startEdit = (s: StudySession) => {
    setEditingSession(s);
    setFormSubject(s.subject);
    setFormTitle(s.title);
    setFormDate(s.date);
    setFormTime(s.time);
    setFormDuration(s.durationMinutes);
    setFormPriority(s.priority);
    setFormNotes(s.notes || '');
    setFormTasksText(s.tasks.map(t => t.title).join('\n'));
    setShowAddModal(true);
  };

  // AI Auto Generator Plan for Student
  const generateAiSchedule = () => {
    const today = new Date();
    const formatDate = (daysAhead: number) => {
      const d = new Date(today);
      d.setDate(d.getDate() + daysAhead);
      return d.toISOString().split('T')[0];
    };

    const aiPlan: StudySession[] = [
      {
        id: `ai-${Date.now()}-1`,
        subject: 'النحو والصرف',
        title: 'خطة مراجعة الثوابت النحوية والمفاعيل',
        date: formatDate(0),
        time: '18:00',
        durationMinutes: 60,
        priority: 'high',
        completed: false,
        notes: 'التركيز على حل بنك الأسئلة ومقارنة الإجابات بنموذج معلم المنصة',
        created: new Date().toISOString(),
        tasks: [
          { id: `ait-1-1`, title: 'مراجعة خريطة الإعراب والمفاعيل', completed: false },
          { id: `ait-1-2`, title: 'حل 25 سؤال اختياري من بنك الأسئلة', completed: false },
          { id: `ait-1-3`, title: 'قراءة ملاحظات التصحيح التلقائي', completed: false }
        ]
      },
      {
        id: `ai-${Date.now()}-2`,
        subject: 'البلاغة والأدب',
        title: 'تطبيقات البلاغة والنصوص المتحررة',
        date: formatDate(1),
        time: '19:00',
        durationMinutes: 45,
        priority: 'high',
        completed: false,
        notes: 'استخراج المحسنات البدئعية والصور الخيالية',
        created: new Date().toISOString(),
        tasks: [
          { id: `ait-2-1`, title: 'قراءة كتيب الخلاصة في البلاغة', completed: false },
          { id: `ait-2-2`, title: 'تطبيق تحليل نص متحرر كامل', completed: false }
        ]
      },
      {
        id: `ai-${Date.now()}-3`,
        subject: 'الاختبار الشامل',
        title: 'محاكاة امتحان الكتروني بوقت محدد',
        date: formatDate(2),
        time: '20:00',
        durationMinutes: 90,
        priority: 'high',
        completed: false,
        notes: 'تقييم المستوى والحصول على التقرير الذهبي',
        created: new Date().toISOString(),
        tasks: [
          { id: `ait-3-1`, title: 'دخول وتأدية الامتحان الشامل', completed: false },
          { id: `ait-3-2`, title: 'مراجعة التقرير التحليلي التلقائي', completed: false }
        ]
      }
    ];

    setSessions(prev => [...aiPlan, ...prev]);
  };

  // Stats
  const totalSessions = sessions.length;
  const completedSessions = sessions.filter(s => s.completed).length;
  const totalTasks = sessions.reduce((acc, s) => acc + s.tasks.length, 0);
  const completedTasks = sessions.reduce((acc, s) => acc + s.tasks.filter(t => t.completed).length, 0);
  const overallProgressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const totalPlannedMinutes = sessions.reduce((acc, s) => acc + (s.completed ? s.durationMinutes : 0), 0);

  // Filtering
  const todayStr = new Date().toISOString().split('T')[0];
  const filteredSessions = sessions.filter(s => {
    if (activeFilter === 'today') return s.date === todayStr;
    if (activeFilter === 'upcoming') return s.date >= todayStr && !s.completed;
    if (activeFilter === 'completed') return s.completed;
    return true;
  });

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 dir-rtl text-right select-none animate-fadeIn">
      {/* Top Header Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span>مخطط المذاكرة والمراجعة الذكي</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
              جدول المذاكرة وقائمة الإنجاز اليومية 📚
            </h2>
            <p className="text-slate-300 text-sm max-w-xl leading-relaxed">
              قم بتنظيم جلسات مراجعة المواد الدراسية، متابعة المهام خطوة بخطوة، والحصول على إحصائيات حية لمعدل إنجازك الأسبوعي.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={generateAiSchedule}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4 fill-slate-950" />
              <span>خطة الذكاء الاصطناعي المقترحة</span>
            </button>

            <button
              type="button"
              onClick={() => { resetForm(); setShowAddModal(true); }}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-black text-xs sm:text-sm shadow-lg shadow-cyan-500/20 flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة جلسة مراجعة</span>
            </button>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 cursor-pointer"
                title="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-white/10">
          <div className="bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="text-slate-400 text-xs font-semibold">جلسات المراجعة</div>
              <div className="text-xl font-black text-white">{completedSessions} / {totalSessions}</div>
            </div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="text-slate-400 text-xs font-semibold">المهام المنجزة</div>
              <div className="text-xl font-black text-emerald-400">{completedTasks} / {totalTasks}</div>
            </div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="text-slate-400 text-xs font-semibold">نسبة الإنجاز العامة</div>
              <div className="text-xl font-black text-amber-300">{overallProgressPercent}%</div>
            </div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-slate-400 text-xs font-semibold">دقائق المذاكرة</div>
              <div className="text-xl font-black text-purple-300">{totalPlannedMinutes} دقيقة</div>
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-4 bg-slate-800/80 rounded-full h-2.5 overflow-hidden p-0.5 border border-white/10">
          <div
            className="bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-700 shadow-[0_0_12px_rgba(56,189,248,0.5)]"
            style={{ width: `${overallProgressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-3 overflow-x-auto pb-2 scrollbar-none">
        <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-white/10 shrink-0">
          {[
            { id: 'all', label: 'كافة الجلسات 📚' },
            { id: 'today', label: 'مراجعة اليوم 📅' },
            { id: 'upcoming', label: 'القادمة ⏳' },
            { id: 'completed', label: 'المكتملة ✅' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFilter(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeFilter === tab.id
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-400 font-semibold shrink-0">
          عرض {filteredSessions.length} جلسة مراجعة
        </div>
      </div>

      {/* Sessions List Grid */}
      {filteredSessions.length === 0 ? (
        <div className="panel p-12 text-center bg-[#0d1728] rounded-3xl border border-dashed border-white/15 space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto border border-white/10">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">لا توجد جلسات مراجعة مجدولة في هذا الفلتر</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            اضغط على زر "إضافة جلسة مراجعة" أو "خطة الذكاء الاصطناعي المقترحة" لبدء جدولة أوقات مذاكرتك بانتظام.
          </p>
          <button
            type="button"
            onClick={generateAiSchedule}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs inline-flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>توليد جدول مراجعة تلقائي</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredSessions.map((session) => {
            const sessionCompletedTasks = session.tasks.filter(t => t.completed).length;
            const sessionTotalTasks = session.tasks.length;
            const sessionProgressPercent = sessionTotalTasks > 0 ? Math.round((sessionCompletedTasks / sessionTotalTasks) * 100) : 0;

            const priorityBadge = {
              high: { label: 'أولوية قصوى 🔥', bg: 'bg-red-500/20 text-red-400 border-red-500/30' },
              medium: { label: 'أولوية متوسطة ⚡', bg: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
              low: { label: 'أولوية عادية 📘', bg: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
            }[session.priority];

            return (
              <div
                key={session.id}
                className={`group relative rounded-3xl p-6 transition-all duration-300 border ${
                  session.completed
                    ? 'bg-emerald-950/20 border-emerald-500/30 shadow-lg shadow-emerald-950/20'
                    : 'bg-[#111f36] border-slate-700/60 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-950/20'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-lg bg-blue-500/20 border border-blue-400/30 text-blue-300 text-[11px] font-bold">
                        {session.subject}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-lg border text-[11px] font-bold ${priorityBadge.bg}`}>
                        {priorityBadge.label}
                      </span>
                      {session.completed && (
                        <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>مكتملة 🎉</span>
                        </span>
                      )}
                    </div>
                    <h3 className={`text-base font-black tracking-wide ${session.completed ? 'text-slate-300 line-through' : 'text-white'}`}>
                      {session.title}
                    </h3>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => toggleSessionCompleted(session.id)}
                      className={`p-2 rounded-xl transition-all cursor-pointer ${
                        session.completed ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                      }`}
                      title={session.completed ? 'إلغاء الإكتمال' : 'تحديد كمكتملة'}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => startEdit(session)}
                      className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:bg-blue-600 hover:text-white transition-all cursor-pointer"
                      title="تعديل"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteSession(session.id)}
                      className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:bg-red-600 hover:text-white transition-all cursor-pointer"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Session Details */}
                <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 mb-4 pb-3 border-b border-white/5">
                  <div className="flex items-center gap-1.5 text-indigo-300">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{session.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-amber-300">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{session.time} ({session.durationMinutes} دقيقة)</span>
                  </div>
                </div>

                {/* Notes if present */}
                {session.notes && (
                  <p className="text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-white/5 mb-4 leading-relaxed">
                    💡 {session.notes}
                  </p>
                )}

                {/* Interactive Task Checklist */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-1">
                    <span>قائمة المهام القابلة للتنفيذ ({sessionCompletedTasks}/{sessionTotalTasks})</span>
                    <span className="text-cyan-400">{sessionProgressPercent}%</span>
                  </div>

                  <div className="space-y-1.5">
                    {session.tasks.map((task) => (
                      <button
                        key={task.id}
                        type="button"
                        onClick={() => toggleTask(session.id, task.id)}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-xs font-semibold text-right transition-all cursor-pointer border ${
                          task.completed
                            ? 'bg-emerald-950/40 text-slate-300 border-emerald-500/30'
                            : 'bg-slate-900/80 text-slate-200 hover:bg-slate-800 border-white/5'
                        }`}
                      >
                        {task.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-500 shrink-0" />
                        )}
                        <span className={`flex-1 ${task.completed ? 'line-through text-slate-400' : ''}`}>
                          {task.title}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Individual Progress Bar */}
                <div className="mt-4 bg-slate-900 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${sessionProgressPercent}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#111f36] border border-blue-500/30 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-black text-white">
                  {editingSession ? 'تعديل جلسة المراجعة' : 'جدولة جلسة مراجعة جديدة'}
                </h3>
              </div>
              <button
                type="button"
                onClick={resetForm}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSession} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">المادة / الفرع الدراسية</label>
                <input
                  type="text"
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                  placeholder="مثال: النحو والصرف، البلاغة، النصوص..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">عنوان جلسة المراجعة</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="مثال: مراجعة كان وأخواتها وحل 30 سؤالاً..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">تاريخ المراجعة</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">وقت البدء</label>
                  <input
                    type="time"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">المدة المتوقعة (بالدقائق)</label>
                  <input
                    type="number"
                    min="10"
                    max="300"
                    value={formDuration}
                    onChange={(e) => setFormDuration(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">الأولوية</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    <option value="high">أولوية قصوى 🔥</option>
                    <option value="medium">أولوية متوسطة ⚡</option>
                    <option value="low">أولوية عادية 📘</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  قائمة المهام القابلة للتنفيذ (سطر لكل مهمة)
                </label>
                <textarea
                  rows={3}
                  value={formTasksText}
                  onChange={(e) => setFormTasksText(e.target.value)}
                  placeholder="مهمة 1&#10;مهمة 2&#10;مهمة 3..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs font-semibold text-white focus:outline-none focus:border-cyan-500"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">ملاحظات توجيهية (اختياري)</label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="ملاحظات حول طريقة الحل أو الأجزاء المهمة..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white text-xs font-bold shadow-md shadow-cyan-500/20 cursor-pointer"
                >
                  {editingSession ? 'حفظ التعديلات' : 'إضافة الجلسة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
