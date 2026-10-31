import React, { useEffect, useState, useRef } from 'react';
import { apiRequest } from '../services/api';

interface AntiCheatGuardProps {
  children: React.ReactNode;
  enabled?: boolean;
  type?: 'exam' | 'video';
  studentName?: string;
  studentCode?: string;
  studentPhone?: string;
  onViolation?: (reason: string) => void;
}

export function AntiCheatGuard({
  children,
  enabled = true,
  type = 'exam',
  studentName,
  studentCode,
  studentPhone,
  onViolation,
}: AntiCheatGuardProps) {
  const [isViolation, setIsViolation] = useState(false);
  const [violationMessage, setViolationMessage] = useState('');
  const [isBlackout, setIsBlackout] = useState(false);
  const violationSent = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    const triggerViolation = async (reason: string) => {
      // Turn screen completely black immediately
      setIsBlackout(true);
      setIsViolation(true);
      setViolationMessage(reason);

      if (violationSent.current) return;
      violationSent.current = true;

      if (onViolation) {
        onViolation(reason);
      }

      // Automatically report and block user on server
      try {
        await apiRequest('student', '/api/student/block', { reason });
        setTimeout(() => {
          window.location.reload();
        }, 3500);
      } catch (e) {
        console.error('Failed to report violation', e);
      }
    };

    // 1. Detect Tab switching or browser minimization
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        triggerViolation('تم اكتشاف مغادرة نافذة الامتحان / الشرح أو تصغير المتصفح. تم حظر الحساب فوراً لحماية المحتوى.');
      }
    };

    // 2. Detect window blur (switching apps, opening recording overlay)
    const handleBlur = () => {
      // Give a tiny moment to verify if focus was moved to an internal iframe or file picker
      setTimeout(() => {
        const active = document.activeElement;
        const isIframe = active && active.tagName === 'IFRAME';
        const isFileInput = active && active.tagName === 'INPUT' && (active as HTMLInputElement).type === 'file';
        if (isIframe || isFileInput) {
          return;
        }
        if (document.visibilityState === 'hidden' || !document.hasFocus()) {
          triggerViolation('تم اكتشاف الخروج من نافذة المنصة أو فتح نافذة خارجية أثناء الاختبار / الشرح.');
        }
      }, 300);
    };

    // 3. Detect keyboard shortcuts (PrintScreen, Snipping tool, DevTools, Recording hotkeys)
    const handleKeyDown = (e: KeyboardEvent) => {
      // Print Screen
      if (e.key === 'PrintScreen' || e.code === 'PrintScreen') {
        e.preventDefault();
        triggerViolation('محاولة التقاط لقطة شاشة (Print Screen).');
        return false;
      }

      // DevTools (F12)
      if (e.key === 'F12') {
        e.preventDefault();
        triggerViolation('محاولة فتح أدوات المطور (F12).');
        return false;
      }

      // Ctrl + Shift + I / C / J (DevTools)
      if (e.ctrlKey && e.shiftKey && ['I', 'i', 'C', 'c', 'J', 'j'].includes(e.key)) {
        e.preventDefault();
        triggerViolation('محاولة فحص عناصر الصفحة أو تسجيل الشاشة.');
        return false;
      }

      // Ctrl + U (View Source) or Ctrl + S (Save Page) or Ctrl + P (Print)
      if (e.ctrlKey && ['u', 'U', 's', 'S', 'p', 'P'].includes(e.key)) {
        e.preventDefault();
        triggerViolation('محاولة حفظ أو طباعة محتوى المنصة المحمي.');
        return false;
      }

      // Mac screenshot combos: Cmd + Shift + 3, Cmd + Shift + 4, Cmd + Shift + 5
      if (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key)) {
        e.preventDefault();
        triggerViolation('محاولة التقاط صورة للشاشة (Mac Screenshot).');
        return false;
      }

      // Windows + Shift + S snippet detection attempt (Meta + Shift + S)
      if (e.metaKey && e.shiftKey && ['s', 'S'].includes(e.key)) {
        e.preventDefault();
        triggerViolation('محاولة استخدام أداة القص وتصوير الشاشة.');
        return false;
      }
    };

    // 4. Detect context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // 5. Detect Fullscreen exit for exams
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && type === 'exam') {
        triggerViolation('تم الخروج من وضع ملء الشاشة أثناء الاختبار.');
      }
    };

    // 6. Detect screen capture / recording via beforeprint
    const handleBeforePrint = () => {
      triggerViolation('محاولة طباعة أو تصوير المستند.');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('beforeprint', handleBeforePrint);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    // Initial fullscreen request for exams
    if (type === 'exam' && !document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {
        // User gesture may be required, will be triggered on next click
      });
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('beforeprint', handleBeforePrint);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [enabled, type, onViolation]);

  if (isViolation || isBlackout) {
    return (
      <div className="fixed inset-0 bg-black z-[999999] flex flex-col items-center justify-center text-center p-6 select-none cursor-not-allowed">
        <div className="bg-red-950/40 p-8 rounded-3xl border-2 border-red-600 max-w-lg shadow-[0_0_50px_rgba(220,38,38,0.5)]">
          <div className="w-16 h-16 rounded-full bg-red-600/20 text-red-500 border border-red-500 flex items-center justify-center mx-auto mb-4 animate-bounce">
            <span className="text-3xl font-black">⚠️</span>
          </div>
          <h2 className="text-3xl font-black text-red-500 mb-4 tracking-wide">
            تم كشف محاولة مخالفة وحظر الحساب فوراً!
          </h2>
          <p className="text-lg text-slate-100 mb-6 leading-relaxed font-semibold">
            {violationMessage}
          </p>
          <div className="p-3 bg-black/60 rounded-xl border border-red-500/30 text-red-400 text-sm font-bold animate-pulse">
            تم تشفير الشاشة باللون الأسود بالكامل وإرسال إشعار فوري لإدارة المنصة وولي الأمر.
          </div>
        </div>
      </div>
    );
  }

  const watermarkText = studentName
    ? `${studentName} • ${studentPhone || ''} • كود: ${studentCode || ''}`
    : 'محتوى محمي بحقوق الطبع والنشر - منصة الأستاذ محمد عبد المقصود';

  return (
    <div className="relative select-none">
      {/* Dynamic Watermark grid overlay */}
      <div className="absolute inset-0 pointer-events-none z-10 opacity-[0.015] overflow-hidden flex flex-wrap content-center justify-center select-none rotate-[-30deg] scale-150">
        {Array.from({ length: 24 }).map((_, i) => (
          <div key={i} className="text-white text-base font-extrabold m-10 whitespace-nowrap">
            {watermarkText}
          </div>
        ))}
      </div>
      {children}
    </div>
  );
}
