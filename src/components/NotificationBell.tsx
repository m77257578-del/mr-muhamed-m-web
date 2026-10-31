import React, { useState, useEffect, useRef } from 'react';
import { Bell, BookOpen, FileQuestion, Video, Trophy, Sparkles, Check, X, ExternalLink } from 'lucide-react';
import { Notice } from '../types';

interface NotificationBellProps {
  notices?: Notice[];
  onOpenNoticesTab?: () => void;
  onOpenItem?: (targetType?: string, targetId?: string) => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  notices = [],
  onOpenNoticesTab,
  onOpenItem,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('read_notif_ids');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const saveReadIds = (newSet: Set<string>) => {
    setReadIds(newSet);
    try {
      localStorage.setItem('read_notif_ids', JSON.stringify(Array.from(newSet)));
    } catch {}
  };

  const markAllRead = () => {
    const allIds = new Set(notices.map((n) => n.id));
    saveReadIds(allIds);
  };

  const markSingleRead = (id: string) => {
    const next = new Set(readIds);
    next.add(id);
    saveReadIds(next);
  };

  const unreadCount = notices.filter((n) => !readIds.has(n.id)).length;

  const getNotifIcon = (type?: string, kind?: string) => {
    if (type === 'new_content' || type === 'video') return <BookOpen className="w-4 h-4 text-cyan-400" />;
    if (type === 'new_exam' || type === 'upcoming_exam') return <FileQuestion className="w-4 h-4 text-amber-400" />;
    if (type === 'live_session') return <Video className="w-4 h-4 text-red-400 animate-pulse" />;
    if (type === 'result_ready') return <Trophy className="w-4 h-4 text-emerald-400" />;
    return <Sparkles className="w-4 h-4 text-purple-400" />;
  };

  const getNotifTag = (type?: string, kind?: string) => {
    if (type === 'new_content') return { text: 'درس جديد 📚', bg: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40' };
    if (type === 'new_exam') return { text: 'اختبار متاح 📝', bg: 'bg-amber-950/80 text-amber-300 border-amber-500/40' };
    if (type === 'upcoming_exam') return { text: 'اقتراب اختبار ⏳', bg: 'bg-rose-950/80 text-rose-300 border-rose-500/40' };
    if (type === 'live_session') return { text: 'بث مباشر 🔴', bg: 'bg-red-950/80 text-red-300 border-red-500/40' };
    if (type === 'result_ready') return { text: 'نتيجة اختبار 📊', bg: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40' };
    return { text: kind === 'schedule' ? 'موعد درس' : 'تنبيه مهم', bg: 'bg-blue-950/80 text-blue-300 border-blue-500/40' };
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) + ' - ' + d.toLocaleDateString('ar-EG');
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="relative inline-block text-right" ref={dropdownRef}>
      {/* Bell Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-blue-500/30 text-slate-300 transition-colors shadow-sm relative flex items-center justify-center cursor-pointer"
        title="التنبيهات والإشعارات"
        aria-label="عرض التنبيهات والإشعارات"
      >
        <Bell className={`w-4 h-4 ${unreadCount > 0 ? 'text-amber-400 animate-bounce' : 'text-slate-300'}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-red-600 to-amber-500 text-white font-black text-[10px] rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center border-2 border-[#0f1c32] shadow-lg animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Interactive Dropdown Window */}
      {isOpen && (
        <div className="absolute left-0 sm:left-auto right-0 sm:right-auto sm:left-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#0a1424] border border-cyan-500/30 shadow-2xl z-50 overflow-hidden text-right">
          {/* Header Bar */}
          <div className="p-3.5 bg-gradient-to-r from-[#0f1d35] to-[#0d1728] border-b border-cyan-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              <h4 className="font-extrabold text-xs text-white">مركز التنبيهات والإشعارات</h4>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                  {unreadCount} غير مقروء
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="p-1 rounded-lg hover:bg-slate-800 text-[10px] font-bold text-cyan-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                  title="تحديد الكل كتمت قراءته"
                >
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span>قراءة الكل</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Notifications List Body */}
          <div className="max-h-80 overflow-y-auto divide-y divide-blue-500/10 p-1">
            {notices.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <Bell className="w-8 h-8 text-slate-600 mx-auto opacity-50" />
                <p className="text-xs font-bold">لا توجد تنبيهات جديدة حالياً</p>
                <p className="text-[10px] text-slate-500">ستظهر إشعارات الدروس والاختبارات القادمة هنا فوراً.</p>
              </div>
            ) : (
              notices.map((n) => {
                const isRead = readIds.has(n.id);
                const tag = getNotifTag((n as any).type, n.kind);
                return (
                  <div
                    key={n.id}
                    onClick={() => {
                      markSingleRead(n.id);
                      if (onOpenItem && (n as any).targetId) {
                        onOpenItem((n as any).type, (n as any).targetId);
                      } else if (onOpenNoticesTab) {
                        onOpenNoticesTab();
                      }
                      setIsOpen(false);
                    }}
                    className={`p-3 rounded-xl transition-all cursor-pointer flex items-start gap-3 ${
                      isRead
                        ? 'bg-transparent hover:bg-slate-800/40 text-slate-300'
                        : 'bg-cyan-950/30 hover:bg-cyan-900/40 text-white font-bold border-r-4 border-r-amber-400'
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-slate-900 border border-blue-500/20 shrink-0 mt-0.5">
                      {getNotifIcon((n as any).type, n.kind)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${tag.bg}`}>
                          {tag.text}
                        </span>
                        <span className="text-[9px] text-slate-400 dir-ltr font-mono">
                          {formatDate(n.created)}
                        </span>
                      </div>

                      <p className="text-xs leading-relaxed line-clamp-2 text-slate-200">
                        {n.text}
                      </p>

                      <div className="mt-1.5 flex items-center justify-between text-[10px] text-cyan-400 font-bold">
                        <span>عرض التفاصيل</span>
                        <ExternalLink className="w-3 h-3 opacity-70" />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Action */}
          {onOpenNoticesTab && (
            <div className="p-2.5 bg-[#070e1a] border-t border-cyan-500/20 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenNoticesTab();
                }}
                className="text-xs font-black text-cyan-300 hover:text-white transition-colors cursor-pointer w-full py-1"
              >
                عرض سجل التنبيهات الكامل في مساحة الطالب ➔
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
