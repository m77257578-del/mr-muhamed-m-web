import React, { useState, useEffect } from 'react';
import { Sparkles, GraduationCap, ChevronLeft } from 'lucide-react';

interface SplashLoader3DProps {
  platformName?: string;
  platformSubtitle?: string;
  onFinish?: () => void;
}

export const SplashLoader3D: React.FC<SplashLoader3DProps> = ({
  platformName = 'منصة الأستاذ محمد عبد المقصود',
  platformSubtitle = 'منصتك التعليمية المتكاملة 🎓✨',
  onFinish
}) => {
  const [typedTitle, setTypedTitle] = useState('');
  const [typedSubtitle, setTypedSubtitle] = useState('');
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [showSubtitle, setShowSubtitle] = useState(false);

  const fullTitle = platformName || 'منصة الأستاذ محمد عبد المقصود';
  const fullSubtitle = platformSubtitle || 'منصتك التعليمية المتكاملة 🎓✨';

  // Progress counter
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 35);
    return () => clearInterval(interval);
  }, []);

  // Typewriter effect for Title
  useEffect(() => {
    let index = 0;
    const titleInterval = setInterval(() => {
      if (index <= fullTitle.length) {
        setTypedTitle(fullTitle.slice(0, index));
        index++;
      } else {
        clearInterval(titleInterval);
        setShowSubtitle(true);
      }
    }, 55);

    return () => clearInterval(titleInterval);
  }, [fullTitle]);

  // Typewriter effect for Subtitle
  useEffect(() => {
    if (!showSubtitle) return;
    let index = 0;
    const subInterval = setInterval(() => {
      if (index <= fullSubtitle.length) {
        setTypedSubtitle(fullSubtitle.slice(0, index));
        index++;
      } else {
        clearInterval(subInterval);
        // After finishing typing subtitle, wait 600ms and fade out
        setTimeout(() => {
          handleDismiss();
        }, 700);
      }
    }, 30);

    return () => clearInterval(subInterval);
  }, [showSubtitle, fullSubtitle]);

  const handleDismiss = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      if (onFinish) onFinish();
    }, 600);
  };

  return (
    <div
      dir="rtl"
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#070d18] text-white overflow-hidden transition-all duration-700 select-none ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Background Animated Gradient Waves and Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/25 via-[#070d18]/80 to-[#030712] pointer-events-none" />
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(2, 132, 199, 0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(2, 132, 199, 0.15) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Radial ambient glow orbs */}
      <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl animate-pulse delay-700" />

      {/* Main 3D Container */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-xl w-full">
        
        {/* 3D Isometric Holographic Structure */}
        <div className="relative w-36 h-36 mb-8 flex items-center justify-center [perspective:1000px]">
          {/* Glowing Aura Rings */}
          <div className="absolute inset-0 rounded-full border-2 border-cyan-400/40 border-dashed animate-[spin_8s_linear_infinite]" />
          <div className="absolute -inset-3 rounded-full border border-blue-500/30 animate-[spin_12s_linear_infinite_reverse]" />
          <div className="absolute -inset-6 rounded-full border border-amber-400/20 border-dotted animate-[spin_16s_linear_infinite]" />

          {/* 3D Animated Isometric Cube Structure */}
          <div className="relative w-20 h-20 [transform-style:preserve-3d] animate-[spin_6s_linear_infinite] flex items-center justify-center">
            {/* Front */}
            <div className="absolute w-20 h-20 bg-gradient-to-tr from-cyan-500/40 to-blue-600/60 border border-cyan-400/60 rounded-xl backdrop-blur-sm [transform:translateZ(40px)] shadow-[0_0_20px_rgba(6,182,212,0.5)] flex items-center justify-center">
              <GraduationCap className="w-9 h-9 text-cyan-200 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
            </div>
            {/* Back */}
            <div className="absolute w-20 h-20 bg-gradient-to-tr from-blue-700/50 to-indigo-600/60 border border-blue-400/50 rounded-xl [transform:rotateY(180deg)_translateZ(40px)] flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-amber-300" />
            </div>
            {/* Right */}
            <div className="absolute w-20 h-20 bg-gradient-to-tr from-cyan-600/50 to-emerald-600/50 border border-cyan-300/40 rounded-xl [transform:rotateY(90deg)_translateZ(40px)] flex items-center justify-center">
              <span className="text-xl font-black text-cyan-100 font-serif">ض</span>
            </div>
            {/* Left */}
            <div className="absolute w-20 h-20 bg-gradient-to-tr from-indigo-700/50 to-cyan-500/50 border border-cyan-400/40 rounded-xl [transform:rotateY(-90deg)_translateZ(40px)] flex items-center justify-center">
              <span className="text-xl font-black text-amber-200 font-serif">أ</span>
            </div>
            {/* Top */}
            <div className="absolute w-20 h-20 bg-gradient-to-tr from-blue-400/40 to-cyan-300/40 border border-cyan-300/50 rounded-xl [transform:rotateX(90deg)_translateZ(40px)]" />
            {/* Bottom */}
            <div className="absolute w-20 h-20 bg-gradient-to-tr from-black/80 to-blue-950/80 border border-blue-500/40 rounded-xl [transform:rotateX(-90deg)_translateZ(40px)]" />
          </div>

          {/* Core Energy Flare */}
          <div className="absolute w-6 h-6 rounded-full bg-cyan-300 blur-sm shadow-[0_0_30px_#22d3ee] animate-ping" />
        </div>

        {/* Brand Name with Dynamic Typewriter Effect */}
        <div className="min-h-[5rem] flex flex-col items-center justify-center space-y-2 mb-6">
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-cyan-300 drop-shadow-md">
            {typedTitle}
            <span className="inline-block w-1.5 h-6 sm:h-8 mr-1 bg-cyan-400 animate-pulse align-middle rounded-full" />
          </h1>

          <p className="text-xs sm:text-sm font-semibold text-slate-300 min-h-[1.5rem] tracking-wide">
            {typedSubtitle}
          </p>
        </div>

        {/* High-Tech Progress Bar */}
        <div className="w-64 sm:w-80 space-y-2">
          <div className="flex justify-between text-[11px] font-mono text-cyan-300/80 px-1">
            <span>جاري التحميل الرقمي...</span>
            <span>{progress}%</span>
          </div>

          <div className="relative w-full h-2 bg-slate-900/90 rounded-full overflow-hidden border border-cyan-500/30 shadow-[inset_0_1px_4px_rgba(0,0,0,0.8)]">
            <div
              className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-emerald-400 rounded-full transition-all duration-150 relative shadow-[0_0_12px_rgba(34,211,238,0.8)]"
              style={{ width: `${progress}%` }}
            >
              {/* Glowing scanner tip */}
              <div className="absolute top-0 right-0 bottom-0 w-3 bg-white blur-[2px] rounded-full animate-pulse" />
            </div>
          </div>
        </div>

        {/* Skip button */}
        <button
          onClick={handleDismiss}
          className="mt-8 inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-300 py-1.5 px-3 rounded-full hover:bg-slate-800/60 border border-transparent hover:border-slate-700 transition-all cursor-pointer group"
        >
          <span>تخطي ودخول المنصة</span>
          <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
        </button>

      </div>
    </div>
  );
};
