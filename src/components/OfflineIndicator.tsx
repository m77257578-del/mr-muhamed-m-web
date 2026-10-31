import React, { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-2xl bg-amber-500/95 backdrop-blur-md px-4 py-2.5 text-xs font-black text-slate-950 shadow-2xl border border-amber-300 animate-bounce">
      <WifiOff className="w-4 h-4 text-slate-950 shrink-0" />
      <span>وضع الأوفلاين — يتم عرض المحتوى التعليمي المخزن مؤقتاً 📚</span>
    </div>
  );
};
