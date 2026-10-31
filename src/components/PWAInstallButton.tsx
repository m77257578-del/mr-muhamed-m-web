import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) return null;

  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 px-4 py-2 text-sm font-bold text-white shadow-lg cursor-pointer transition-all hover:scale-105"
      >
        <Download className="w-4 h-4" />
        <span>تثبيت التطبيق</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-950/20 px-4 py-2 text-sm font-bold text-cyan-300 hover:bg-cyan-950/40 cursor-pointer transition-all"
        >
          <Download className="w-4 h-4" />
          <span>تثبيت التطبيق على iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-right" dir="rtl">
            <div className="w-full max-w-sm rounded-3xl bg-[#111f36] border border-cyan-500/30 p-6 shadow-2xl">
              <h3 className="text-lg font-black text-white mb-3">تثبيت التطبيق على iPhone / iPad</h3>
              <p className="text-sm text-slate-300 mb-4 leading-relaxed">
                1. اضغط على زر <strong>المشاركة (Share)</strong> في شريط أدوات سفاري.<br />
                2. انزل للأسفل واضغط على <strong>إضافة إلى الشاشة الرئيسية (Add to Home Screen)</strong>.
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full rounded-xl bg-cyan-600 py-2.5 text-sm font-black text-white cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
