import React from 'react';
import { ExternalLink, Globe } from 'lucide-react';
import { SocialLink } from '../types';
import { SocialDock } from './SocialDock';

interface FooterProps {
  socialLinks?: SocialLink[];
}

const M_WEB_URL = 'https://m-web-psi.vercel.app/';

export const Footer: React.FC<FooterProps> = ({ socialLinks = [] }) => {
  return (
    <footer className="mt-auto pt-8 pb-12 border-t border-blue-500/15 bg-gradient-to-b from-transparent via-[#08101e]/90 to-[#040810] text-center text-slate-300">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 flex flex-col items-center">
        {/* Horizontal Social Dock Bar matching screenshot */}
        <div className="mb-6 w-full flex justify-center">
          <SocialDock socialLinks={socialLinks} />
        </div>

        {/* Divider accent */}
        <div className="w-24 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent my-2" />

        {/* "من تصميم ام ويب" and Enter Platform Button */}
        <div className="mt-4 flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>من تصميم</span>
            <span className="text-cyan-300 font-extrabold tracking-wide">ام ويب (M-Web)</span>
            <span className="text-slate-400 text-[11px]">| المنظومة الرقمية والتعليمية المتكاملة</span>
          </div>

          {/* زر دخول موقع ام ويب الرسمي */}
          <a
            href={M_WEB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-500 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/45 hover:scale-[1.02] border border-cyan-300/40 transition-all duration-200"
          >
            <Globe className="w-4 h-4 text-cyan-200 group-hover:rotate-12 transition-transform duration-300" />
            <span>دخول موقع ام ويب الرسمي (M-Web)</span>
            <ExternalLink className="w-3.5 h-3.5 text-cyan-200 group-hover:translate-x-[-3px] transition-transform duration-300" />
          </a>
        </div>

        <p className="mt-5 text-[11px] text-slate-400">
          جميع الحقوق محفوظة © {new Date().getFullYear()} • تصميم وبرمجة ام ويب
        </p>
      </div>
    </footer>
  );
};
