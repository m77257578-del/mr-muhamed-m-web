import React from 'react';
import {
  Sparkles,
  Award,
  Users,
  Video,
  ShieldCheck,
  FileQuestion,
  BarChart3,
  Key,
  ShoppingBag,
  Bot,
  ExternalLink,
  Target,
  Compass,
} from 'lucide-react';
import { AboutUsData } from '../types';

interface AboutUsSectionProps {
  aboutUs?: AboutUsData;
}

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  ShieldCheck,
  FileQuestion,
  BarChart3,
  Key,
  ShoppingBag,
  Bot,
  Sparkles,
  Award,
  ExternalLink,
};

export const AboutUsSection: React.FC<AboutUsSectionProps> = ({ aboutUs }) => {
  if (!aboutUs) return null;

  const features = aboutUs.features || [];

  return (
    <section className="space-y-12 py-8" id="about-us">
      {/* Teacher Profile & Bio Card */}
      <div className="panel bg-gradient-to-br from-[#0e1d35] via-[#091528] to-[#0d1b32] border border-blue-500/25 p-6 sm:p-10 rounded-3xl shadow-2xl relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 justify-between">
          
          {/* Avatar / Badge */}
          <div className="flex flex-col items-center text-center shrink-0">
            <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-3xl overflow-hidden border-2 border-cyan-400/60 shadow-[0_0_30px_rgba(6,182,212,0.3)] bg-[#070e1a]">
              {aboutUs.teacherImage ? (
                <img
                  src={aboutUs.teacherImage}
                  alt={aboutUs.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-tr from-blue-900 to-cyan-800 text-white">
                  <span className="text-4xl sm:text-5xl font-black">أ.م</span>
                  <span className="text-[11px] font-bold text-cyan-200 mt-1">{aboutUs.subject || 'معلم المادة'}</span>
                </div>
              )}
            </div>

            <span className="mt-3 px-3 py-1 bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 text-xs font-bold rounded-full">
              خبير المناهج الثانوية ✨
            </span>
          </div>

          {/* Text Info */}
          <div className="flex-1 space-y-4 text-center lg:text-right">
            <div className="space-y-1">
              <span className="text-xs font-bold text-amber-400 tracking-wider">
                من نحن • نبذة تعريفية
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-white">
                {aboutUs.title}
              </h2>
              <p className="text-sm font-semibold text-cyan-300">
                {aboutUs.subtitle}
              </p>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              {aboutUs.bio}
            </p>

            {/* Vision and Mission Grid */}
            <div className="grid gap-3 sm:grid-cols-2 pt-2">
              {aboutUs.vision && (
                <div className="p-3.5 rounded-2xl bg-[#081220]/80 border border-blue-500/20 text-right space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-cyan-300">
                    <Compass className="w-3.5 h-3.5 text-cyan-400" />
                    <span>رؤيتنا التعليمية:</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {aboutUs.vision}
                  </p>
                </div>
              )}

              {aboutUs.mission && (
                <div className="p-3.5 rounded-2xl bg-[#081220]/80 border border-blue-500/20 text-right space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-300">
                    <Target className="w-3.5 h-3.5 text-amber-400" />
                    <span>رسالتنا للطلاب:</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {aboutUs.mission}
                  </p>
                </div>
              )}
            </div>

            {/* Counter Stats */}
            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-blue-500/15">
              <div className="p-3 bg-[#081324] rounded-xl border border-blue-500/15 text-center">
                <span className="text-xl sm:text-2xl font-black text-cyan-400 block font-mono">
                  +{aboutUs.experienceYears || 15}
                </span>
                <span className="text-[11px] font-bold text-slate-400">عاماً من الخبرة</span>
              </div>

              <div className="p-3 bg-[#081324] rounded-xl border border-blue-500/15 text-center">
                <span className="text-xl sm:text-2xl font-black text-emerald-400 block font-mono">
                  +{(aboutUs.studentsCount || 20000).toLocaleString('ar-EG')}
                </span>
                <span className="text-[11px] font-bold text-slate-400">طالب متفوق</span>
              </div>

              <div className="p-3 bg-[#081324] rounded-xl border border-blue-500/15 text-center">
                <span className="text-xl sm:text-2xl font-black text-amber-400 block font-mono">
                  +{(aboutUs.lecturesCount || 1000).toLocaleString('ar-EG')}
                </span>
                <span className="text-[11px] font-bold text-slate-400">حصة ومحاضرة</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* "أهم مميزات المنصة" Section (Editable from Admin Panel) */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/40 border border-blue-500/20 text-cyan-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>لماذا تختار منصتنا؟</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white">أهم مميزات المنصة</h3>
          <p className="text-xs sm:text-sm text-slate-400">
            بيئة تعليمية متكاملة مدعومة بالذكاء الاصطناعي والحماية المتقدمة
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => {
            const IconComponent = iconMap[f.icon] || Sparkles;
            return (
              <div
                key={f.id || i}
                className={`panel ${f.bg || 'bg-[#0e1d35]'} ${f.border || 'border-blue-500/20'} p-6 rounded-2xl flex flex-col items-center text-center gap-3.5 hover:scale-[1.02] transition-all shadow-xl hover:border-cyan-400/50`}
              >
                <div
                  className={`p-3.5 rounded-2xl bg-black/40 border ${f.border || 'border-blue-500/20'} ${f.color || 'text-cyan-400'} shadow-inner`}
                >
                  <IconComponent className="w-7 h-7" />
                </div>
                <h4 className="text-base sm:text-lg font-black text-white">{f.title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
