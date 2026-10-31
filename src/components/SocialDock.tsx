import React, { useState } from 'react';
import { SocialLink } from '../types';

interface SocialDockProps {
  socialLinks?: SocialLink[];
  className?: string;
  showTitle?: boolean;
}

interface PlatformConfig {
  key: string;
  nameAr: string;
  nameEn: string;
  defaultUrl: string;
  bgColor: string;
  hoverBorder: string;
  glowColor: string;
  renderIcon: () => React.ReactNode;
}

export const SocialDock: React.FC<SocialDockProps> = ({
  socialLinks = [],
  className = '',
  showTitle = false,
}) => {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  // Map of 8 platforms matching the exact screenshot order and visuals
  const platforms: PlatformConfig[] = [
    {
      key: 'linkedin',
      nameAr: 'لينكد إن',
      nameEn: 'LinkedIn',
      defaultUrl: 'https://www.linkedin.com',
      bgColor: 'hover:bg-[#0077b5]/15',
      hoverBorder: 'hover:border-[#0a66c2]',
      glowColor: 'group-hover:shadow-[0_0_20px_rgba(10,102,194,0.4)]',
      renderIcon: () => (
        <svg viewBox="0 0 24 24" className="w-6 h-6 sm:w-7 sm:h-7" fill="none">
          <rect width="24" height="24" rx="5.5" fill="#0A66C2" />
          <path
            fill="#FFFFFF"
            d="M7.12 10.38H4.67V19.5h2.45v-9.12zM5.89 6.5a1.42 1.42 0 1 0 0 2.84 1.42 1.42 0 0 0 0-2.84zM19.33 14.15c0-2.58-1.38-3.77-3.21-3.77-1.48 0-2.14.81-2.51 1.38v-1.18H11.2c.03.68 0 9.12 0 9.12h2.41v-5.09c0-.27.02-.54.1-.73.22-.54.71-1.1 1.54-1.1 1.09 0 1.53.83 1.53 2.05v4.87h2.55v-5.55z"
          />
        </svg>
      ),
    },
    {
      key: 'x',
      nameAr: 'منصة إكس',
      nameEn: 'X (Twitter)',
      defaultUrl: 'https://x.com',
      bgColor: 'hover:bg-white/10',
      hoverBorder: 'hover:border-slate-300',
      glowColor: 'group-hover:shadow-[0_0_20px_rgba(255,255,255,0.25)]',
      renderIcon: () => (
        <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-6 sm:h-6" fill="white">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      key: 'tiktok',
      nameAr: 'تيك توك',
      nameEn: 'TikTok',
      defaultUrl: 'https://www.tiktok.com',
      bgColor: 'hover:bg-[#00f2fe]/10',
      hoverBorder: 'hover:border-[#00f2fe]/60',
      glowColor: 'group-hover:shadow-[0_0_20px_rgba(0,242,254,0.35)]',
      renderIcon: () => (
        <svg viewBox="0 0 24 24" className="w-6 h-6 sm:w-7 sm:h-7" fill="none">
          <g filter="url(#glow-tiktok)">
            <path
              fill="#00F2FE"
              d="M19.32 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .57.04.84.12V9.38a6.34 6.34 0 0 0-.84-.06A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.49 6.34 6.34 0 0 0 1.86-4.49V8.52a8.27 8.27 0 0 0 4.91 1.61V6.69z"
            />
            <path
              fill="#FE2C55"
              opacity="0.9"
              d="M17.5 7.2a4.83 4.83 0 0 1-1.95-.9V2.5h-1.8v13.17a3.89 3.89 0 1 1-3.89-3.89c.35 0 .69.05 1.01.14V8.5a7.34 7.34 0 1 0 6.63 7.28V8.62c1.33.8 2.88 1.25 4.5 1.25V7.2z"
            />
          </g>
        </svg>
      ),
    },
    {
      key: 'youtube',
      nameAr: 'يوتيوب',
      nameEn: 'YouTube',
      defaultUrl: 'https://www.youtube.com',
      bgColor: 'hover:bg-[#ff0000]/15',
      hoverBorder: 'hover:border-[#ff0000]',
      glowColor: 'group-hover:shadow-[0_0_20px_rgba(255,0,0,0.4)]',
      renderIcon: () => (
        <svg viewBox="0 0 24 24" className="w-7 h-7 sm:w-8 sm:h-8" fill="none">
          <rect x="1.5" y="4.5" width="21" height="15" rx="5" fill="#FF0000" />
          <polygon points="10,8.5 15.5,12 10,15.5" fill="#FFFFFF" />
        </svg>
      ),
    },
    {
      key: 'telegram',
      nameAr: 'تليجرام',
      nameEn: 'Telegram',
      defaultUrl: 'https://t.me',
      bgColor: 'hover:bg-[#229ed9]/15',
      hoverBorder: 'hover:border-[#229ed9]',
      glowColor: 'group-hover:shadow-[0_0_20px_rgba(34,158,217,0.4)]',
      renderIcon: () => (
        <svg viewBox="0 0 24 24" className="w-6 h-6 sm:w-7 sm:h-7" fill="none">
          <circle cx="12" cy="12" r="11" fill="#24A1DE" />
          <path
            fill="#FFFFFF"
            d="M17.5 7.3L5.8 11.9c-.8.3-.8.8-.1 1l3 1 1 3c.1.4.3.4.5.2l1.6-1.5 3.3 2.4c.6.3 1 .2 1.2-.5l2.2-10.4c.2-.8-.3-1.2-.9-.3zM9.8 13.9l6.5-4.1c.3-.2.6-.1.4.1l-5.3 4.8-.2 2.3-.4-3.1z"
          />
        </svg>
      ),
    },
    {
      key: 'instagram',
      nameAr: 'إنستغرام',
      nameEn: 'Instagram',
      defaultUrl: 'https://www.instagram.com',
      bgColor: 'hover:bg-[#e4405f]/15',
      hoverBorder: 'hover:border-[#e4405f]',
      glowColor: 'group-hover:shadow-[0_0_20px_rgba(228,64,95,0.4)]',
      renderIcon: () => (
        <svg viewBox="0 0 24 24" className="w-6 h-6 sm:w-7 sm:h-7" fill="none">
          <defs>
            <linearGradient id="ig-lens-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f09433" />
              <stop offset="30%" stopColor="#e6683c" />
              <stop offset="60%" stopColor="#dc2743" />
              <stop offset="85%" stopColor="#cc2366" />
              <stop offset="100%" stopColor="#bc1888" />
            </linearGradient>
          </defs>
          <rect
            x="2.5"
            y="2.5"
            width="19"
            height="19"
            rx="5.5"
            stroke="url(#ig-lens-gradient)"
            strokeWidth="2.2"
          />
          <circle cx="12" cy="12" r="4.3" stroke="url(#ig-lens-gradient)" strokeWidth="2.2" />
          <circle cx="17.2" cy="6.8" r="1.3" fill="url(#ig-lens-gradient)" />
        </svg>
      ),
    },
    {
      key: 'facebook',
      nameAr: 'فيسبوك',
      nameEn: 'Facebook',
      defaultUrl: 'https://www.facebook.com',
      bgColor: 'hover:bg-[#1877f2]/15',
      hoverBorder: 'hover:border-[#1877f2]',
      glowColor: 'group-hover:shadow-[0_0_20px_rgba(24,119,242,0.4)]',
      renderIcon: () => (
        <svg viewBox="0 0 24 24" className="w-6 h-6 sm:w-7 sm:h-7" fill="none">
          <circle cx="12" cy="12" r="11" fill="#1877F2" />
          <path
            fill="#FFFFFF"
            d="M15.1 12.9h-2.1v7.6h-3.1v-7.6H8.2v-2.7h1.7V8.5c0-2.4 1.4-3.8 3.6-3.8 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.7-1.6 1.5v1.4h2.7l-.4 2.7z"
          />
        </svg>
      ),
    },
    {
      key: 'whatsapp',
      nameAr: 'واتساب',
      nameEn: 'WhatsApp',
      defaultUrl: 'https://wa.me/201024889921',
      bgColor: 'hover:bg-[#25d366]/15',
      hoverBorder: 'hover:border-[#25d366]',
      glowColor: 'group-hover:shadow-[0_0_20px_rgba(37,211,102,0.4)]',
      renderIcon: () => (
        <svg viewBox="0 0 24 24" className="w-6 h-6 sm:w-7 sm:h-7" fill="none">
          <circle cx="12" cy="12" r="11" fill="#25D366" />
          <path
            fill="#FFFFFF"
            d="M12.04 4.5C7.9 4.5 4.5 7.9 4.5 12.04c0 1.4.38 2.72 1.05 3.86L4.5 19.5l3.72-1.01c1.1.6 2.37.95 3.82.95 4.14 0 7.54-3.4 7.54-7.54 0-4.14-3.4-7.54-7.54-7.54zm4.4 10.3c-.19.53-1.08 1.02-1.5 1.07-.4.05-.9.08-2.65-.64-2.1-.87-3.44-3.03-3.55-3.17-.1-.14-.85-1.13-.85-2.16s.54-1.53.73-1.74c.2-.21.43-.26.58-.26.15 0 .3 0 .42.01.14.01.32-.05.5.38.19.45.64 1.56.7 1.67.06.12.1.25.02.4-.08.14-.12.23-.24.37-.12.14-.25.31-.36.42-.12.12-.24.25-.1.5.14.24.62 1.02 1.33 1.65.91.81 1.68 1.06 1.92 1.18.24.12.38.1.52-.06.14-.17.6-.7.76-.94.16-.24.32-.2.53-.12.21.08 1.34.63 1.57.75.23.11.38.17.44.27.06.1.06.58-.13 1.11z"
          />
        </svg>
      ),
    },
  ];

  // Helper to find configured URL for a platform key
  const getUrlForPlatform = (key: string, fallback: string) => {
    const item = socialLinks.find(
      (s) => s.platform?.toLowerCase() === key || s.platform?.toLowerCase().includes(key)
    );
    if (item && item.url && item.url.trim()) {
      return item.url.trim();
    }
    return fallback;
  };

  return (
    <div className={`w-full flex flex-col items-center justify-center ${className}`}>
      {showTitle && (
        <div className="mb-3 text-center">
          <span className="text-xs font-black tracking-wide text-cyan-300 uppercase">
            روابطنا وقنواتنا الرسمية
          </span>
        </div>
      )}

      {/* Horizontal Social Dock Bar */}
      <div
        dir="ltr"
        className="flex items-center justify-center gap-2 sm:gap-3.5 px-3 py-2.5 rounded-2xl sm:rounded-3xl bg-[#091120]/85 border border-slate-700/60 shadow-2xl backdrop-blur-xl relative max-w-full overflow-x-auto scrollbar-none"
      >
        {platforms.map((p) => {
          const url = getUrlForPlatform(p.key, p.defaultUrl);
          const isHovered = hoveredKey === p.key;

          return (
            <a
              key={p.key}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${p.nameAr} - ${p.nameEn}`}
              onMouseEnter={() => setHoveredKey(p.key)}
              onMouseLeave={() => setHoveredKey(null)}
              className={`group relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#0c1626] border border-slate-700/70 hover:border-cyan-400/80 transition-all duration-300 transform hover:scale-115 hover:-translate-y-1.5 active:scale-95 shadow-md ${p.glowColor} ${p.bgColor}`}
            >
              {/* Authentic Brand SVG */}
              <div className="transition-transform duration-300 group-hover:scale-110">
                {p.renderIcon()}
              </div>

              {/* Tooltip on hover */}
              {isHovered && (
                <div
                  dir="rtl"
                  className="absolute -top-10 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-slate-900/95 border border-cyan-500/40 text-cyan-200 text-[11px] font-bold whitespace-nowrap shadow-xl pointer-events-none z-30 animate-fadeIn"
                >
                  <span>{p.nameAr}</span>
                  <span className="opacity-60 text-[9px] mr-1">({p.nameEn})</span>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                </div>
              )}
            </a>
          );
        })}
      </div>
    </div>
  );
};
