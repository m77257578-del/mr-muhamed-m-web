import React, { useState } from 'react';
import { Exam, StudentProfile } from '../types';
import { apiRequest } from '../services/api';
import {
  X,
  CheckCircle,
  AlertCircle,
  Send,
  Check,
  FileText,
  Image as ImageIcon,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { AntiCheatGuard } from './AntiCheatGuard';

interface ExamModalProps {
  exam: Exam;
  profile?: StudentProfile | null;
  onClose: () => void;
  onSuccess: (score: number | null, total: number) => void;
}

const LETTERS = ['أ', 'ب', 'ج', 'د'];

export const ExamModal: React.FC<ExamModalProps> = ({ exam, profile, onClose, onSuccess }) => {
  const [answers, setAnswers] = useState<string[]>(
    new Array(exam.questions.length).fill('')
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const getQuestionKind = (index: number) => {
    if (exam.kinds && exam.kinds[index]) return exam.kinds[index];
    return exam.type === 'اختياري' ? 'mcq' : 'essay';
  };

  const handleAnswerChange = (index: number, val: string) => {
    const next = [...answers];
    next[index] = val;
    setAnswers(next);
  };

  const [notebookImage, setNotebookImage] = useState<string | null>(null);
  const [aiReport, setAiReport] = useState<any>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setNotebookImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!notebookImage) {
      const emptyIndex = answers.findIndex((a) => !a || !a.trim());
      if (emptyIndex !== -1) {
        setError(`من فضلك أجب عن السؤال رقم ${emptyIndex + 1} أو ارفع صورة كراسة الواجب والحل.`);
        setCurrentQuestionIndex(emptyIndex);
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await apiRequest('student', '/api/student/exam/ai-grade', {
        examId: exam.id,
        answers,
        notebookImageBase64: notebookImage,
      });

      if (res.result) {
        setAiReport(res.result);
      }
      setTimeout(() => {
        onSuccess(res.result?.score ?? null, res.result?.total ?? exam.questions.length);
      }, 3500);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء تصحيح الامتحان');
      setSubmitting(false);
    }
  };

  const answeredCount = answers.filter((a) => a && a.trim()).length;
  const totalCount = exam.questions.length;
  const percentDone = Math.round((answeredCount / totalCount) * 100);

  if (aiReport) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 sm:p-6 bg-black/80 backdrop-blur-md"
        dir="rtl"
      >
        <div className="w-full max-w-2xl bg-[#0c1626] border border-cyan-400 rounded-3xl p-6 sm:p-8 text-white shadow-2xl text-center animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto mb-4 border border-cyan-400/40">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-cyan-300">
            تم التصحيح الفوري بالذكاء الاصطناعي بنجاح!
          </h2>
          <p className="text-sm text-slate-300 mt-1">امتحان: {exam.title}</p>

          <div className="my-6 p-4 rounded-2xl bg-[#13233c] border border-slate-700 inline-block">
            <span className="text-xs text-slate-400 block mb-1">الدرجة المحتسبة</span>
            <span className="text-4xl font-black text-amber-400">{aiReport.score}</span>
            <span className="text-lg text-slate-400"> / {aiReport.total}</span>
            <span className="mr-2 text-sm font-bold text-cyan-300">({aiReport.label})</span>
          </div>

          <div className="bg-[#0f1b2d] border border-slate-800 rounded-2xl p-4 text-right mb-6 text-xs sm:text-sm text-slate-200 leading-relaxed max-h-48 overflow-y-auto">
            <h4 className="font-extrabold text-cyan-400 mb-2 flex items-center gap-1.5">
              <span>📋 التقرير التوجيهي لتصحيح إجاباتك:</span>
            </h4>
            <p className="whitespace-pre-wrap">{aiReport.feedback}</p>
          </div>

          <p className="text-xs text-emerald-400 mb-4">
            📲 تم إرسال نتيجة هذا التقرير تلقائياً عبر الواتساب لولي الأمر والطالب وتصديرها لصفحة النتائج.
          </p>

          <button
            onClick={() => onSuccess(aiReport.score, aiReport.total)}
            className="btn-primary w-full py-3 text-sm font-black cursor-pointer"
          >
            إغلاق وعرض النتيجة في لوحة التحكم
          </button>
        </div>
      </div>
    );
  }

  return (
    <AntiCheatGuard
      enabled
      type="exam"
      studentName={profile?.name}
      studentCode={profile?.code}
      studentPhone={profile?.phone}
    >
      <div
        className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-3 sm:p-6"
        style={{ background: 'rgba(12, 22, 38, 0.95)' }}
        dir="rtl"
      >
        <div className="panel my-auto w-full max-w-4xl overflow-hidden shadow-2xl bg-[#0c1626] border border-blue-500/30 text-white rounded-3xl flex flex-col max-h-[90vh]">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 p-4 sm:p-5 bg-[#091222]">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950/60 border border-cyan-400/40 text-cyan-300">
                  {exam.type}
                </span>
                <span className="text-xs text-slate-400 font-bold">{exam.grade}</span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-white mt-1">
                {exam.title}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-left text-xs font-bold text-slate-300">
                <span>تم إجابة: </span>
                <strong className="text-cyan-300 font-mono">{answeredCount}</strong>
                <span> من </span>
                <strong className="text-white font-mono">{totalCount}</strong>
              </div>

              <button
                className="btn-gray btn-sm flex items-center gap-1 text-xs cursor-pointer rounded-xl"
                type="button"
                onClick={onClose}
              >
                <X className="w-4 h-4" />
                <span>إغلاق</span>
              </button>
            </div>
          </div>

          {/* Exam Attachment View (PDF or Image if uploaded by teacher) */}
          {exam.attachmentUrl && (
            <div className="px-4 py-2 bg-[#0d1c33] border-b border-blue-500/20 flex items-center justify-between text-xs">
              <span className="text-cyan-300 font-bold flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>ملف أو ورقة الامتحان المرفقة:</span>
              </span>
              <a
                href={exam.attachmentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-cyan py-1 px-3 text-[11px] font-bold rounded-lg flex items-center gap-1"
              >
                <span>معاينة ورقة الامتحان (PDF / صورة)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {/* 50-Question Palette Bar */}
          <div className="px-4 py-2.5 bg-[#08101e] border-b border-blue-500/15 overflow-x-auto scrollbar-none flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 shrink-0 ml-2">
              الأسئلة ({totalCount}):
            </span>
            {exam.questions.map((_, idx) => {
              const isAnswered = !!(answers[idx] && answers[idx].trim());
              const isCurrent = currentQuestionIndex === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setCurrentQuestionIndex(idx);
                    const el = document.getElementById(`q-box-${idx}`);
                    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                  className={`w-7 h-7 shrink-0 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center ${
                    isCurrent
                      ? 'border-2 border-cyan-400 bg-cyan-600 text-white shadow-md scale-110'
                      : isAnswered
                      ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
                      : 'bg-[#101e36] border border-blue-500/20 text-slate-400 hover:text-white'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {error && (
            <div className="mx-4 mt-3 flex items-center gap-2 rounded-xl bg-red-950/60 border border-red-500/40 p-3 text-xs sm:text-sm font-bold text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Notebook / Homework Image Upload Option */}
          <div className="mx-4 mt-3 p-3 rounded-2xl bg-[#0f1d35] border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-right">
            <div>
              <h4 className="text-xs font-bold text-cyan-300">
                📸 هل قمت بحل الامتحان في كراستك أو دفتر الواجب؟
              </h4>
              <p className="text-[11px] text-slate-300 mt-0.5">
                يمكنك رفع صورة كراسة الحل مباشرة وسيقوم الذكاء الاصطناعي بتصحيحها فوراً ومقارنتها بنموذج الإجابة.
              </p>
            </div>
            <label className="btn-secondary btn-sm flex items-center gap-2 cursor-pointer text-xs shrink-0 rounded-xl">
              <ImageIcon className="w-4 h-4 text-cyan-400" />
              <span>{notebookImage ? 'تغيير صورة الكراسة ✓' : 'رفع صورة الحل'}</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          </div>

          {notebookImage && (
            <div className="mx-4 mt-2 p-2 bg-[#0a1220] rounded-xl border border-slate-800 flex items-center justify-between">
              <span className="text-xs text-emerald-400 font-bold">✓ تم إرفاق صورة الحل بنجاح</span>
              <button
                type="button"
                onClick={() => setNotebookImage(null)}
                className="text-xs text-red-400 hover:underline cursor-pointer"
              >
                إلغاء الصورة
              </button>
            </div>
          )}

          {/* QUESTIONS LIST */}
          <form
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 scroll-smooth"
          >
            {exam.questions.map((q, i) => {
              const qText = typeof q === 'string' ? q : q.text || '';
              const qAttachment = typeof q === 'object' ? (q as any).attachmentUrl : undefined;
              const kind = getQuestionKind(i);
              const opts = exam.options?.[i] || [];

              return (
                <div
                  key={i}
                  id={`q-box-${i}`}
                  className={`card bg-[#0e1d35] border p-4 sm:p-5 rounded-2xl transition-all ${
                    currentQuestionIndex === i
                      ? 'border-cyan-400/80 shadow-lg shadow-cyan-950/40'
                      : 'border-blue-500/20'
                  }`}
                  onClick={() => setCurrentQuestionIndex(i)}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-400/40 text-cyan-300 text-xs font-bold font-mono flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>

                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#091322] border border-blue-500/20 text-slate-300">
                      {kind === 'true_false' ? 'صح وغلط' : kind === 'mcq' ? 'اختيار من متعدد' : 'سؤال مقالي'}
                    </span>
                  </div>

                  <p className="font-black text-white text-sm sm:text-base leading-relaxed pr-8">
                    {qText}
                  </p>

                  {/* Question Specific Attachment */}
                  {qAttachment && (
                    <div className="my-3 pr-8">
                      <img
                        src={qAttachment}
                        alt={`مرفق سؤال ${i + 1}`}
                        className="rounded-xl max-h-64 object-contain border border-blue-500/30"
                      />
                    </div>
                  )}

                  {/* MCQ (أ، ب، ج، د) */}
                  {kind === 'mcq' && (
                    <div className="mt-4 grid gap-2.5 sm:grid-cols-2 pr-8">
                      {LETTERS.map((letter, optIndex) => {
                        const optLabel = opts[optIndex] || '';
                        const isSelected = answers[i] === letter;
                        return (
                          <label
                            key={letter}
                            className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-all text-xs sm:text-sm ${
                              isSelected
                                ? 'border-cyan-400 bg-cyan-950/50 font-bold text-cyan-200 shadow-md'
                                : 'border-blue-500/20 bg-[#091426] hover:bg-[#0f1f38] text-slate-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`q_${i}`}
                              value={letter}
                              checked={isSelected}
                              onChange={() => handleAnswerChange(i, letter)}
                              className="text-cyan-400 focus:ring-cyan-400 w-4 h-4"
                            />
                            <span>
                              <strong className="text-cyan-300 ml-1">({letter})</strong> {optLabel}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {/* TRUE / FALSE (صح وغلط) */}
                  {kind === 'true_false' && (
                    <div className="mt-4 grid grid-cols-2 gap-3 pr-8">
                      <button
                        type="button"
                        onClick={() => handleAnswerChange(i, 'صح')}
                        className={`py-3 px-4 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          answers[i] === 'صح'
                            ? 'bg-emerald-950/80 border-emerald-400 text-emerald-200 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-400'
                            : 'bg-[#091426] border-blue-500/20 text-slate-300 hover:border-emerald-500/40 hover:text-white'
                        }`}
                      >
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>(صح) صواب</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAnswerChange(i, 'خطأ')}
                        className={`py-3 px-4 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          answers[i] === 'خطأ'
                            ? 'bg-red-950/80 border-red-400 text-red-200 shadow-lg shadow-red-950/40 ring-1 ring-red-400'
                            : 'bg-[#091426] border-blue-500/20 text-slate-300 hover:border-red-500/40 hover:text-white'
                        }`}
                      >
                        <X className="w-4 h-4 text-red-400" />
                        <span>(خطأ) خطأ</span>
                      </button>
                    </div>
                  )}

                  {/* ESSAY (مقالي) */}
                  {kind === 'essay' && (
                    <div className="mt-3 pr-8">
                      <textarea
                        rows={3}
                        className="input-field bg-[#091324] border-blue-500/25 text-white text-xs sm:text-sm p-3 rounded-xl focus:border-cyan-400"
                        placeholder="اكتب إجابتك هنا بوضوح (أو ارفع صورة كراسة الواجب بالأعلى)..."
                        value={answers[i]}
                        onChange={(e) => handleAnswerChange(i, e.target.value)}
                      />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Submit Bar */}
            <div className="pt-3 sticky bottom-0 bg-[#0c1626] pb-2 border-t border-slate-800">
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary flex w-full items-center justify-center gap-2 py-3.5 text-sm sm:text-base font-black shadow-xl rounded-xl cursor-pointer"
              >
                <Send className="w-5 h-5 rotate-180" />
                <span>
                  {submitting
                    ? 'جاري التصحيح الفوري بواسطة الذكاء الاصطناعي...'
                    : 'تسليم الامتحان والتصحيح الإلكتروني الفوري ⚡'}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </AntiCheatGuard>
  );
};
