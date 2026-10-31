import React, { useState } from 'react';
import {
  FileText,
  Clock,
  User,
  ArrowRight,
  BookOpen,
  X,
  Share2,
  Calendar,
  Check,
} from 'lucide-react';
import { Article } from '../types';

interface ArticlesSectionProps {
  articles?: Article[];
}

export const ArticlesSection: React.FC<ArticlesSectionProps> = ({
  articles = []
}) => {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [copiedShare, setCopiedShare] = useState(false);

  const publishedArticles = articles.filter((a) => a.published !== false);

  if (!publishedArticles.length) return null;

  const handleShare = (art: Article) => {
    if (navigator.share) {
      navigator.share({
        title: art.title,
        text: art.summary,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${art.title}\n${window.location.href}`);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  return (
    <section className="space-y-6 py-6" id="educational-articles">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-2 pb-3 border-b border-blue-500/15">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/40 border border-blue-500/25 text-cyan-300 text-xs font-bold mb-2">
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span>مقالاتنا التعليمية والإرشادية</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white">
            مقالات الأستاذ وروائع اللغة العربية
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            مقالات متجددة تقدم لك خلاصة القواعد النحوية، أسرار البلاغة، وإرشادات حقيقية للتفوق في الثانوية العامة.
          </p>
        </div>

        <span className="text-xs font-bold text-slate-400">
          {publishedArticles.length} مقال متاح للقراءة مجاناً
        </span>
      </div>

      {/* Grid of Articles */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {publishedArticles.map((art) => (
          <article
            key={art.id}
            className="card bg-[#0e1d35] border border-blue-500/20 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-cyan-400/40 hover:shadow-2xl transition-all group"
          >
            <div className="space-y-3">
              {/* Category & Read Time */}
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300">
                  {art.category || 'لغة عربية'}
                </span>
                <span className="flex items-center gap-1 text-slate-400">
                  <Clock className="w-3 h-3" />
                  <span>{art.readTime || '4 دقائق'}</span>
                </span>
              </div>

              {/* Title & Summary */}
              <h4 className="font-black text-base sm:text-lg text-white group-hover:text-cyan-300 transition-colors leading-snug">
                {art.title}
              </h4>

              <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                {art.summary}
              </p>
            </div>

            {/* Footer with Author and Read Button */}
            <div className="pt-3 border-t border-blue-500/15 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                <User className="w-3 h-3 text-cyan-400" />
                <span>{art.author || 'أ. محمد عبد المقصود'}</span>
              </span>

              <button
                type="button"
                onClick={() => setSelectedArticle(art)}
                className="btn-cyan py-1.5 px-3 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95 transition-all"
              >
                <span>قراءة المقال</span>
                <ArrowRight className="w-3.5 h-3.5 rotate-180" />
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* ARTICLE READER MODAL */}
      {selectedArticle && (
        <div
          dir="rtl"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto"
        >
          <div className="bg-[#0e1d35] border border-cyan-500/40 rounded-3xl p-6 sm:p-10 max-w-2xl w-full space-y-6 shadow-2xl relative my-8 text-right">
            {/* Close Button */}
            <button
              onClick={() => setSelectedArticle(null)}
              className="absolute top-5 left-5 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Article Header */}
            <div className="space-y-3 pb-4 border-b border-blue-500/20">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-400/40 text-cyan-300 text-xs font-bold">
                  {selectedArticle.category || 'لغة عربية'}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>وقت القراءة: {selectedArticle.readTime || '4 دقائق'}</span>
                </span>
              </div>

              <h2 className="text-xl sm:text-3xl font-black text-white leading-tight">
                {selectedArticle.title}
              </h2>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <span className="font-bold text-slate-300">
                  بقلم: {selectedArticle.author || 'أ. محمد عبد المقصود'}
                </span>

                <button
                  onClick={() => handleShare(selectedArticle)}
                  className="flex items-center gap-1 text-cyan-300 hover:text-white cursor-pointer"
                >
                  {copiedShare ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">تم نسخ الرابط</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" />
                      <span>مشاركة المقال</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Article Content */}
            <div className="space-y-4 text-xs sm:text-sm text-slate-200 leading-loose max-h-[60vh] overflow-y-auto pl-2">
              <p className="font-semibold text-cyan-200 bg-cyan-950/30 p-3.5 rounded-xl border border-cyan-500/20">
                {selectedArticle.summary}
              </p>

              <div className="whitespace-pre-line font-medium leading-relaxed">
                {selectedArticle.content}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-blue-500/20 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400">
                منصة الأستاذ محمد عبد المقصود التعليمية
              </span>

              <button
                type="button"
                onClick={() => setSelectedArticle(null)}
                className="btn-gray py-2 px-6 text-xs font-bold rounded-xl cursor-pointer"
              >
                إغلاق النافذة
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
