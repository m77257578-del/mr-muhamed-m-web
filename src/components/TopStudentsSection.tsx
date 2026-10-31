import React, { useState } from 'react';
import {
  Award,
  Trophy,
  Star,
  GraduationCap,
  Sparkles,
  Search,
  Filter,
  Heart,
  Quote,
  Medal,
  Crown,
  ChevronLeft,
  ChevronRight,
  School,
  Calendar,
  Share2,
  CheckCircle2,
  UserCheck
} from 'lucide-react';
import { TopStudent } from '../types';

interface TopStudentsSectionProps {
  topStudents?: TopStudent[];
  isAdmin?: boolean;
  onOpenAddModal?: () => void;
}

export const TopStudentsSection: React.FC<TopStudentsSectionProps> = ({
  topStudents = [],
  isAdmin = false,
  onOpenAddModal,
}) => {
  const [selectedGrade, setSelectedGrade] = useState<string>('الكل');
  const [searchTerm, setSearchTerm] = useState('');
  const [congratulated, setCongratulated] = useState<Record<string, number>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const grades = [
    'الكل',
    'الصف الثالث الثانوي',
    'الصف الثاني الثانوي – عام',
    'الصف الأول الثانوي',
    'المرحلة الإعدادية'
  ];

  const filteredStudents = topStudents.filter((student) => {
    const matchesGrade =
      selectedGrade === 'الكل' ||
      student.grade.includes(selectedGrade) ||
      (selectedGrade === 'المرحلة الإعدادية' && student.grade.includes('الإعدادي'));

    const matchesSearch =
      !searchTerm.trim() ||
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.school && student.school.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (student.rank && student.rank.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (student.badge && student.badge.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesGrade && matchesSearch;
  });

  const handleCongratulate = (id: string) => {
    setCongratulated((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  const handleShare = async (student: TopStudent) => {
    const text = `🎉 فخر منصة الأستاذ محمد عبد المقصود: نبارك للطالب/ة المتفوق/ة ${student.name} لحصوله على ${student.score} (${student.rank || student.grade})! 🎓✨`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `لوحة شرف الأستاذ: ${student.name}`,
          text,
          url: window.location.href,
        });
        return;
      } catch {}
    }
    navigator.clipboard?.writeText(text);
    setCopiedId(student.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <section className="space-y-8 text-right" dir="rtl">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0e1f3b] via-[#091528] to-[#120b24] border border-amber-500/30 p-6 sm:p-10 shadow-2xl">
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center md:text-right">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 text-xs font-black shadow-inner">
              <Trophy className="w-4 h-4 text-amber-400 animate-bounce" />
              <span>لوحة الشرف الذهبية • فخر الأستاذ والمنصة</span>
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight flex flex-wrap items-center justify-center md:justify-start gap-3">
              <span>طلابنا المتفوقون وصنّاع القمة</span>
              <Crown className="w-7 h-7 text-amber-400" />
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              نهنئ ونعتز بأبنائنا وبناتنا الذين حصدوا أعلى المراتب والدرجات النهائية في امتحانات الثانوية العامة والمراحل الدراسية. تفوقكم ثمرة الجد والمثابرة!
            </p>
          </div>

          {/* Quick Stats or Action */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-5 py-3 rounded-2xl bg-[#081220]/90 border border-amber-500/30 text-center shadow-lg">
              <span className="block text-2xl font-black text-amber-400 font-mono">
                {topStudents.length}+
              </span>
              <span className="text-[11px] font-bold text-slate-300">طالب في لوحة الشرف</span>
            </div>

            {isAdmin && onOpenAddModal && (
              <button
                type="button"
                onClick={onOpenAddModal}
                className="btn-gold py-3 px-5 text-xs font-black rounded-xl shadow-lg flex items-center gap-2 cursor-pointer"
              >
                <Award className="w-4 h-4" />
                <span>إضافة طالب متفوق جديد</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="relative z-10 mt-8 pt-6 border-t border-amber-500/20 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Grade Pills */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
            <Filter className="w-4 h-4 text-amber-400 shrink-0" />
            {grades.map((grade) => (
              <button
                key={grade}
                type="button"
                onClick={() => setSelectedGrade(grade)}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                  selectedGrade === grade
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-lg font-black'
                    : 'bg-[#0b162a] text-slate-300 hover:text-white border border-amber-500/20 hover:border-amber-500/40'
                }`}
              >
                {grade}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative md:w-72 shrink-0">
            <Search className="w-4 h-4 absolute top-3.5 right-3.5 text-amber-400" />
            <input
              type="text"
              placeholder="ابحث بالاسم، المدرسة، أو المركز..."
              className="input-field pr-10 text-xs font-bold py-2.5 bg-[#070e1c] border-amber-500/30 focus:border-amber-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Students Cards Grid */}
      {filteredStudents.length === 0 ? (
        <div className="panel bg-[#0b162a] border border-amber-500/20 p-12 text-center rounded-3xl space-y-3">
          <Trophy className="w-12 h-12 text-slate-600 mx-auto" />
          <h4 className="text-base font-bold text-white">لا توجد نتائج مطابقة لبحثك</h4>
          <p className="text-xs text-slate-400">جرب اختيار مرحلة دراسية أخرى أو مسح كلمة البحث.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filteredStudents.map((student, idx) => {
            const congratsCount = (congratulated[student.id] || 0);

            return (
              <div
                key={student.id || idx}
                className={`relative group rounded-3xl bg-gradient-to-b from-[#0f1d35] to-[#0a1220] border transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xl hover:-translate-y-1.5 ${
                  student.featured
                    ? 'border-amber-400/50 shadow-amber-500/10 ring-1 ring-amber-400/30'
                    : 'border-blue-500/20 hover:border-amber-400/40 hover:shadow-cyan-500/10'
                }`}
              >
                {/* Top Corner Ribbon or Badge */}
                <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
                  {student.featured && (
                    <span className="px-2.5 py-1 rounded-full bg-amber-500 text-black text-[10px] font-black shadow-md flex items-center gap-1">
                      <Star className="w-3 h-3 fill-black text-black" />
                      <span>متصدر</span>
                    </span>
                  )}
                  {student.badge && (
                    <span className="px-2.5 py-1 rounded-full bg-blue-950/90 border border-amber-400/30 text-amber-300 text-[10px] font-bold">
                      {student.badge}
                    </span>
                  )}
                </div>

                <div className="p-6 space-y-4">
                  {/* Student Image with Golden Halo */}
                  <div className="flex flex-col items-center text-center pt-2">
                    <div className="relative mb-3">
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-gradient-to-tr from-amber-500 via-yellow-300 to-cyan-400 shadow-xl group-hover:scale-105 transition-transform duration-300">
                        {student.photoUrl ? (
                          <img
                            src={student.photoUrl}
                            alt={student.name}
                            className="w-full h-full object-cover rounded-full bg-slate-900"
                            onError={(e) => {
                              // Fallback on broken image
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full rounded-full bg-gradient-to-br from-[#10223d] to-[#0a1424] flex items-center justify-center text-amber-300 font-black text-2xl">
                            {student.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      
                      {/* Rank Icon overlay */}
                      <div className="absolute -bottom-1 -left-1 w-8 h-8 rounded-full bg-amber-500 border-2 border-[#0f1d35] flex items-center justify-center text-black font-black text-xs shadow-md">
                        🥇
                      </div>
                    </div>

                    {/* Student Name */}
                    <h3 className="text-lg font-black text-white group-hover:text-amber-300 transition-colors">
                      {student.name}
                    </h3>

                    {/* Score Tag */}
                    <div className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-amber-950/80 to-yellow-950/80 border border-amber-500/40 text-amber-300 font-black text-sm shadow-inner">
                      <Trophy className="w-3.5 h-3.5 text-amber-400" />
                      <span>{student.score}</span>
                    </div>

                    {/* Rank / Award */}
                    {student.rank && (
                      <p className="text-xs font-bold text-cyan-300 mt-2">
                        {student.rank}
                      </p>
                    )}
                  </div>

                  {/* Metadata: Grade, Year, School */}
                  <div className="p-3 rounded-2xl bg-[#070e1c] border border-blue-500/15 space-y-1.5 text-xs text-slate-300">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                        <span>الصف:</span>
                      </span>
                      <strong className="text-white font-bold">{student.grade}</strong>
                    </div>

                    {student.year && (
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                          <span>الدفعة:</span>
                        </span>
                        <strong className="text-slate-200">{student.year}</strong>
                      </div>
                    )}

                    {student.school && (
                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-blue-500/10">
                        <span className="text-slate-400 flex items-center gap-1">
                          <School className="w-3.5 h-3.5 text-emerald-400" />
                          <span>المدرسة:</span>
                        </span>
                        <span className="text-slate-200 truncate max-w-[140px]">{student.school}</span>
                      </div>
                    )}
                  </div>

                  {/* Student Quote / Appreciation */}
                  {student.quote && (
                    <div className="relative p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 text-xs text-amber-100/90 leading-relaxed italic">
                      <Quote className="w-4 h-4 text-amber-400/50 absolute top-2 right-2 rotate-180" />
                      <p className="pr-4 pl-1 text-[11px]">
                        "{student.quote}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer Actions: Congratulate & Share */}
                <div className="p-4 pt-2 border-t border-blue-500/15 bg-[#08101e]/80 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleCongratulate(student.id)}
                    className="flex-1 py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Heart className={`w-3.5 h-3.5 ${congratsCount > 0 ? 'fill-red-500 text-red-500' : 'text-amber-400'}`} />
                    <span>مبارك ({congratsCount})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleShare(student)}
                    aria-label="مشاركة إنجاز الطالب"
                    className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer"
                    title="مشاركة إنجاز الطالب"
                  >
                    {copiedId === student.id ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Share2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
