import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { CourseContentItem, StudentProfile, Exam } from '../types';
import { tokens, apiRequest } from '../services/api';
import {
  Download,
  X,
  Maximize,
  Minimize,
  Smartphone,
  Monitor,
  FileQuestion,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

interface MediaViewerProps {
  content: CourseContentItem;
  role: 'student' | 'teacher';
  profile?: StudentProfile | null;
  onClose: () => void;
  exams?: Exam[];
  onStartExam?: (exam: Exam) => void;
}

function cleanUrlOrEmbed(value?: string): string {
  if (!value) return '';
  let str = value.trim();

  // If teacher pasted full <iframe> embed code snippet, extract src URL
  if (str.includes('<iframe') && str.includes('src=')) {
    const match = str.match(/src=["']([^"']+)["']/i);
    if (match && match[1]) {
      str = match[1].trim();
    }
  }

  if (str.startsWith('//')) {
    str = 'https:' + str;
  } else if (
    !/^https?:\/\//i.test(str) &&
    (str.includes('youtube.com') ||
      str.includes('youtu.be') ||
      str.includes('vimeo.com') ||
      str.startsWith('www.'))
  ) {
    str = 'https://' + str;
  }

  return str;
}

function safeHttpUrl(value?: string): string {
  const cleaned = cleanUrlOrEmbed(value);
  if (!cleaned) return '';
  try {
    const url = new URL(cleaned);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
}

function getEmbeddedVideoUrl(value?: string): string {
  const raw = cleanUrlOrEmbed(value);
  if (!raw) return '';

  // Universal YouTube ID extractor regex
  const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|live|shorts)\/|.*[?&]v=)|youtu\.be\/)([\w-]{11})/i;
  const match = raw.match(ytRegex);
  if (match && match[1]) {
    const id = match[1];
    const origin = typeof window !== 'undefined' ? encodeURIComponent(window.location.origin) : '';
    return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&playsinline=1&rel=0&modestbranding=1&controls=1&fs=1&disablekb=1&iv_load_policy=3&showinfo=0&enablejsapi=1${
      origin ? `&origin=${origin}` : ''
    }`;
  }

  // If raw string itself is an 11-char YouTube ID
  if (/^[\w-]{11}$/.test(raw.trim())) {
    const id = raw.trim();
    return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&playsinline=1&rel=0&modestbranding=1&controls=1&fs=1&disablekb=1&iv_load_policy=3&showinfo=0&enablejsapi=1`;
  }

  try {
    const url = new URL(raw, typeof window !== 'undefined' ? window.location.origin : 'https://localhost');
    const host = url.hostname.toLowerCase().replace(/^www\./, '');

    // Vimeo
    if (host === 'vimeo.com' || host === 'player.vimeo.com') {
      const vimeoId = url.pathname.match(/(?:video\/|videos\/|)(\d+)/)?.[1];
      if (vimeoId) {
        return `https://player.vimeo.com/video/${vimeoId}?autoplay=1&title=0&byline=0&portrait=0`;
      }
    }

    // Google Drive
    if (host === 'drive.google.com') {
      const driveId = url.pathname.match(/\/file\/d\/([^/]+)/)?.[1] || url.searchParams.get('id');
      if (driveId) {
        return `https://drive.google.com/file/d/${driveId}/preview`;
      }
    }

    if (url.pathname.includes('/embed/') || url.pathname.includes('/player/')) {
      return url.href;
    }
  } catch {
    return '';
  }
  return '';
}

export const MediaViewer: React.FC<MediaViewerProps> = ({
  content,
  role,
  profile,
  onClose,
  exams = [],
  onStartExam,
}) => {
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCssLandscapeFullscreen, setIsCssLandscapeFullscreen] = useState(false);

  // Video progress persistence (for student completion tracking)
  const [maxTimeWatched, setMaxTimeWatched] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const syncInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (role !== 'student' || !content.id) return;
    const loadProgress = async () => {
      try {
        const progress = await apiRequest('student', `/api/student/video-progress/${content.id}`);
        if (progress?.maxTime) {
          setMaxTimeWatched(progress.maxTime);
        }
      } catch (e) {
        console.error('Failed to load progress', e);
      }
    };
    loadProgress();
  }, [role, content.id]);

  const saveProgress = useCallback(
    async (time: number, isCompleted: boolean) => {
      if (role !== 'student' || !content.id || isSyncing) return;
      setIsSyncing(true);
      try {
        await apiRequest('student', '/api/student/video-progress', {
          contentId: content.id,
          maxTime: time,
          completed: isCompleted,
        });
      } catch (e) {
        console.error('Failed to sync progress', e);
      } finally {
        setIsSyncing(false);
      }
    },
    [role, content.id, isSyncing]
  );

  useEffect(() => {
    if (role !== 'student') return;
    syncInterval.current = setInterval(() => {
      if (maxTimeWatched > 0) {
        saveProgress(maxTimeWatched, false);
      }
    }, 30000);

    return () => {
      if (syncInterval.current) clearInterval(syncInterval.current);
    };
  }, [role, maxTimeWatched, saveProgress]);

  const handleTimeUpdate = () => {
    if (role !== 'student' || !videoRef.current) return;
    const current = videoRef.current.currentTime;
    if (current > maxTimeWatched) {
      setMaxTimeWatched(current);
    }
  };

  const handleEnded = () => {
    saveProgress(maxTimeWatched, true);
  };

  // Fullscreen state listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      const active = !!document.fullscreenElement;
      setIsFullscreen(active);
      if (!active) {
        setIsCssLandscapeFullscreen(false);
        if (screen.orientation && (screen.orientation as any).unlock) {
          try {
            (screen.orientation as any).unlock();
          } catch {}
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Fullscreen toggle: Standard Fullscreen
  const toggleFullscreen = async () => {
    const el = playerContainerRef.current;
    if (!el) return;

    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch {}
      setIsFullscreen(false);
      setIsCssLandscapeFullscreen(false);
    } else {
      try {
        if (el.requestFullscreen) {
          await el.requestFullscreen();
        } else if ((el as any).webkitRequestFullscreen) {
          await (el as any).webkitRequestFullscreen();
        }
        setIsFullscreen(true);
      } catch {
        // Fallback CSS fullscreen
        setIsCssLandscapeFullscreen(prev => !prev);
      }
    }
  };

  // Fullscreen Horizontal (Landscape)
  const requestLandscapeFullscreen = async () => {
    const el = playerContainerRef.current;
    if (!el) return;

    try {
      if (!document.fullscreenElement) {
        if (el.requestFullscreen) {
          await el.requestFullscreen();
        } else if ((el as any).webkitRequestFullscreen) {
          await (el as any).webkitRequestFullscreen();
        }
      }
      setIsFullscreen(true);
      // Attempt landscape orientation lock on supported devices (Android/PWA)
      if (screen.orientation && (screen.orientation as any).lock) {
        await (screen.orientation as any).lock('landscape').catch(() => {});
      }
    } catch {
      setIsCssLandscapeFullscreen(true);
    }
  };

  // Fullscreen Vertical (Portrait)
  const requestPortraitFullscreen = async () => {
    const el = playerContainerRef.current;
    if (!el) return;

    try {
      if (!document.fullscreenElement) {
        if (el.requestFullscreen) {
          await el.requestFullscreen();
        } else if ((el as any).webkitRequestFullscreen) {
          await (el as any).webkitRequestFullscreen();
        }
      }
      setIsFullscreen(true);
      if (screen.orientation && (screen.orientation as any).lock) {
        await (screen.orientation as any).lock('portrait').catch(() => {});
      }
    } catch {
      setIsCssLandscapeFullscreen(false);
    }
  };

  const external = !!content.link;
  const original = external ? safeHttpUrl(content.link) : '';
  const youtube = external ? getEmbeddedVideoUrl(original) : '';
  const directVideo = external && /\.(?:mp4|webm|ogg|m3u8)(?:$|[?#])/i.test(original);
  const directImage = external && /\.(?:png|jpe?g|gif|webp)(?:$|[?#])/i.test(original);
  const directPdf = external && /\.pdf(?:$|[?#])/i.test(original);

  const token = role === 'student' ? tokens.student : tokens.teacher;
  const fileUrl = content.fileId
    ? `/files/${encodeURIComponent(content.fileId)}?t=${encodeURIComponent(token)}`
    : '';
  const mediaUrl = external ? youtube || original : fileUrl;
  const mime = content.mime || '';

  const canDownload =
    !external &&
    !(role === 'student' && mime.startsWith('video/')) &&
    content.fileId;

  // Find if an exam is attached to this content or course
  const attachedExam = useMemo(() => {
    if (!exams || exams.length === 0) return null;
    return exams.find(
      (e) =>
        (content.courseId && e.courseId === content.courseId) ||
        e.id === (content as any).examId ||
        (e.title && content.title && (e.title.includes(content.title) || content.title.includes(e.title)))
    );
  }, [exams, content]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex flex-col bg-[#050b14] overflow-y-auto text-white select-none animate-fade-in"
      dir="rtl"
    >
      {/* Top Navigation Bar Matching Screenshot */}
      <header className="sticky top-0 z-40 w-full bg-[#070e1b]/95 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-lg">
        {/* Right side: Button "← رجوع لكورساتي" */}
        <button
          onClick={onClose}
          type="button"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#132035] hover:bg-[#1a2b47] text-slate-100 hover:text-white border border-slate-700/60 font-black text-sm shadow-md transition-all active:scale-95 cursor-pointer"
        >
          <span>← رجوع لكورساتي</span>
        </button>

        {/* Left side: "فيديو 🎬" */}
        <div className="flex items-center gap-2 text-white font-black text-base sm:text-lg">
          <span>فيديو</span>
          <span>🎬</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-4xl mx-auto px-4 py-6 sm:py-8 flex flex-col gap-5 flex-1">
        {/* Header Title on right */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-right">
            <h1 className="text-xl sm:text-2xl font-black text-white">فيديو</h1>
            {content.title && (
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5 font-bold">
                {content.title}
              </p>
            )}
          </div>

          {/* Fullscreen & Orientation Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={requestLandscapeFullscreen}
              className="px-3.5 py-2 rounded-xl bg-[#0e1a2d] hover:bg-cyan-600/30 text-cyan-300 hover:text-cyan-200 border border-cyan-500/30 text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95"
              title="ملء الشاشة أفقي (عرضي)"
            >
              <Monitor className="w-4 h-4 text-cyan-400" />
              <span>ملء الشاشة أفقي (عرضي)</span>
            </button>

            <button
              type="button"
              onClick={requestPortraitFullscreen}
              className="px-3.5 py-2 rounded-xl bg-[#0e1a2d] hover:bg-blue-600/30 text-blue-300 hover:text-blue-200 border border-blue-500/30 text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95"
              title="ملء الشاشة رأسي (طولي)"
            >
              <Smartphone className="w-4 h-4 text-blue-400" />
              <span>ملء الشاشة رأسي (طولي)</span>
            </button>

            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-2 rounded-xl bg-[#0e1a2d] hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold cursor-pointer transition-all hover:scale-105"
              title={isFullscreen ? 'تصغير الشاشة' : 'ملء الشاشة بالكامل'}
            >
              {isFullscreen ? <Minimize className="w-4 h-4 text-amber-400" /> : <Maximize className="w-4 h-4 text-slate-200" />}
            </button>

            {canDownload && (
              <a
                href={mediaUrl}
                download={content.fileName || 'file'}
                className="p-2 rounded-xl bg-[#0e1a2d] hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold cursor-pointer transition-all hover:scale-105"
                title="تنزيل الملف"
              >
                <Download className="w-4 h-4 text-emerald-400" />
              </a>
            )}
          </div>
        </div>

        {/* Video Player Card (Pure & Clean - No distorted marks) */}
        <div
          ref={playerContainerRef}
          className={`relative w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-black border border-slate-800 shadow-2xl transition-all duration-300 ${
            isCssLandscapeFullscreen
              ? 'fixed inset-0 z-[99999] rounded-none border-none flex items-center justify-center bg-black'
              : 'aspect-video'
          }`}
        >
          {/* Ultra-transparent Single Moving Drifting Watermark */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-30 select-none flex items-center justify-center">
            <div
              className="absolute whitespace-nowrap font-mono text-xs sm:text-sm font-bold text-cyan-300/[0.10] select-none pointer-events-none drop-shadow-sm"
              style={{
                animation: 'watermarkDrift 22s linear infinite',
              }}
            >
              🔒 {profile?.name || 'طالب المنصة'} • {profile?.phone || 'M-Web Protected'}
            </div>
          </div>

          {youtube ? (
            <div className="relative w-full h-full overflow-hidden bg-black flex items-center justify-center">
              {/* Cropped YouTube iframe: hides top title/share bar and bottom YouTube logo */}
              <iframe
                src={youtube}
                title={content.title || 'فيديو الدرس'}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
                className="absolute -top-11 -bottom-11 -left-1 -right-1 w-[calc(100%+8px)] h-[calc(100%+88px)] border-0 select-none bg-black"
              />
              {/* Top and Bottom Protective Shields */}
              <div className="absolute inset-x-0 top-0 h-10 bg-black z-20 pointer-events-auto" title="محمي" />
              <div className="absolute inset-x-0 bottom-0 h-8 bg-black z-20 pointer-events-none" />
            </div>
          ) : directVideo || mime.startsWith('video/') ? (
            <video
              ref={videoRef}
              src={mediaUrl}
              controls
              autoPlay
              playsInline
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleEnded}
              className="w-full h-full object-contain bg-black select-none"
            />
          ) : directImage || mime.startsWith('image/') ? (
            <img
              src={mediaUrl}
              alt={content.title || 'صورة'}
              className="w-full h-full object-contain bg-black"
            />
          ) : directPdf || mime === 'application/pdf' ? (
            <iframe
              src={mediaUrl}
              title={content.title || 'ملف PDF'}
              className="w-full h-full bg-white border-0"
            />
          ) : external ? (
            <iframe
              src={mediaUrl}
              title={content.title || 'محتوى الدرس'}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              className="w-full h-full bg-black border-0"
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center text-slate-300 h-full">
              <p className="font-bold text-sm sm:text-base">
                لا يمكن عرض هذا الملف مباشرة داخل المتصفح. استخدم زر التنزيل أعلاه.
              </p>
            </div>
          )}

          {/* Close button for CSS fullscreen fallback mode */}
          {isCssLandscapeFullscreen && (
            <button
              onClick={() => setIsCssLandscapeFullscreen(false)}
              className="absolute top-4 left-4 z-50 p-2.5 rounded-full bg-black/70 text-white hover:bg-black border border-white/20 transition-all cursor-pointer"
              title="خروج من ملء الشاشة"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Attached Exam Card (Matching Screenshot: "لا يوجد اختبار مرفق بهذا المحتوى") */}
        <section className="w-full rounded-2xl bg-[#0b1424] border border-slate-800/80 p-5 sm:p-7 text-center shadow-lg transition-all">
          {attachedExam ? (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-right space-y-1">
                <div className="flex items-center gap-2 text-cyan-300 font-black text-base">
                  <FileQuestion className="w-5 h-5 text-cyan-400" />
                  <span>اختبار مرفق: {attachedExam.title}</span>
                </div>
                <p className="text-xs text-slate-400 font-bold">
                  عدد الأسئلة: {attachedExam.questions?.length || 0} سؤال • تصحيح إلكتروني فوري ونموذج إجابة معتمد
                </p>
              </div>

              <button
                type="button"
                onClick={() => onStartExam && onStartExam(attachedExam)}
                className="btn-cyan px-6 py-2.5 rounded-xl font-black text-sm flex items-center gap-2 shadow-lg shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <span>بدء الاختبار الآن</span>
                <ArrowRight className="w-4 h-4 rotate-180" />
              </button>
            </div>
          ) : (
            <p className="text-slate-400 font-black text-sm sm:text-base tracking-wide select-none">
              لا يوجد اختبار مرفق بهذا المحتوى
            </p>
          )}
        </section>
      </main>
    </div>
  );
};
