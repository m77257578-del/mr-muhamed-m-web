import React, { useState } from 'react';
import {
  ShoppingBag,
  BookOpen,
  FileText,
  Lock,
  Download,
  Wallet,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  User,
  Phone,
  UploadCloud,
  Loader2,
  X,
  CreditCard,
  Sparkles,
} from 'lucide-react';
import { Course, StoreBook, StudentData, ManualGateway } from '../types';
import { apiRequest } from '../services/api';

interface PlatformStoreSectionProps {
  courses: Course[];
  books: StoreBook[];
  studentData: StudentData | null;
  gateways: ManualGateway[];
  onOpenAuthModal?: () => void;
  onRefresh: () => Promise<void>;
}

export const PlatformStoreSection: React.FC<PlatformStoreSectionProps> = ({
  courses,
  books,
  studentData,
  gateways,
  onOpenAuthModal,
  onRefresh
}) => {
  const [filter, setFilter] = useState<'all' | 'courses' | 'books'>('all');
  const [selectedBookForPurchase, setSelectedBookForPurchase] = useState<StoreBook | null>(null);

  // Purchase Form State for PDF Books
  const [buyerName, setBuyerName] = useState(studentData?.profile?.name || '');
  const [buyerPhone, setBuyerPhone] = useState(studentData?.profile?.phone || '');
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'manual'>('manual');
  const [selectedGatewayId, setSelectedGatewayId] = useState<string>(gateways[0]?.id || '');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [receiptFile, setReceiptFile] = useState<string | null>(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [purchaseResult, setPurchaseResult] = useState<{ ok: boolean; msg: string; downloadUrl?: string } | null>(null);
  const [copiedAcc, setCopiedAcc] = useState<string | null>(null);

  const studentBal = Number(studentData?.profile?.walletBalance) || 0;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAcc(text);
    setTimeout(() => setCopiedAcc(null), 2000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingReceipt(true);
    try {
      const res = await fetch(`/api/upload?name=${encodeURIComponent(file.name)}`, {
        method: 'PUT',
        headers: { 'Content-Type': file.type || 'image/jpeg' },
        body: file
      });
      const data = await res.json();
      if (data.fileId) {
        setReceiptFile(data.fileId);
      } else {
        alert(data.error || 'فشل رفع ملف الإيصال');
      }
    } catch {
      alert('حدث خطأ أثناء رفع ملف الإيصال');
    } finally {
      setUploadingReceipt(false);
    }
  };

  const handleOpenBookPurchase = (book: StoreBook) => {
    setSelectedBookForPurchase(book);
    setPurchaseResult(null);
    setBuyerName(studentData?.profile?.name || '');
    setBuyerPhone(studentData?.profile?.phone || '');
    setPaymentMethod(studentData && studentBal >= book.price ? 'wallet' : 'manual');
    setSelectedGatewayId(gateways[0]?.id || '');
    setReceiptFile(null);
    setReferenceNumber('');
  };

  const handleSubmitBookPurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookForPurchase) return;

    if (!buyerName.trim()) {
      alert('يرجى كتابة اسم المشتري');
      return;
    }

    if (paymentMethod === 'manual' && !buyerPhone.trim()) {
      alert('يرجى كتابة رقم الهاتف للتواصل وتأكيد الطلب');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiRequest<any>(studentData ? 'student' : 'student', '/api/store/buy-book', {
        bookId: selectedBookForPurchase.id,
        buyerName: buyerName.trim(),
        buyerPhone: buyerPhone.trim(),
        paymentMethod: studentData ? paymentMethod : 'manual',
        gatewayId: selectedGatewayId,
        receiptFile,
        referenceNumber: referenceNumber.trim()
      });

      setPurchaseResult({
        ok: true,
        msg: res.message || 'تمت العملية بنجاح!',
        downloadUrl: res.downloadUrl
      });
      await onRefresh();
    } catch (err: any) {
      setPurchaseResult({
        ok: false,
        msg: err.message || 'فشل إتمام عملية الشراء'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const activeGateways = gateways.filter((g) => g.active !== false);
  const selectedGw = activeGateways.find((g) => g.id === selectedGatewayId) || activeGateways[0];

  return (
    <section className="space-y-8 py-6" id="platform-store">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 pb-4 border-b border-blue-500/15">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-xs font-bold mb-2">
            <ShoppingBag className="w-3.5 h-3.5 text-cyan-400" />
            <span>متجر المنصة الرقمي</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white">
            الكورسات والكتب والمذكرات الإلكترونية
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            متاح لجميع زوار المنصة: تصفح وشراء الكورسات والكتب الرقمية (PDF) مع إمكانية الدفع عبر فودافون كاش، إنستا باي، أو رصيد المحفظة.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-[#091322] border border-blue-500/20 rounded-xl">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filter === 'all' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            الكل ({courses.length + books.length})
          </button>
          <button
            onClick={() => setFilter('courses')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filter === 'courses' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            الكورسات ({courses.length})
          </button>
          <button
            onClick={() => setFilter('books')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filter === 'books' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            كتب PDF ({books.length})
          </button>
        </div>
      </div>

      {/* Grid of Store Products */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* COURSES */}
        {(filter === 'all' || filter === 'courses') &&
          courses.map((c) => (
            <article
              key={`c-${c.id}`}
              className="card bg-[#0e1b30] border border-blue-500/25 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-cyan-400/50 hover:shadow-2xl transition-all group"
            >
              <div>
                {/* Image */}
                <div className="overflow-hidden bg-[#070e1c] aspect-[16/9] relative border-b border-blue-500/20">
                  {c.imageUrl ? (
                    <img
                      src={c.imageUrl}
                      alt={c.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex w-full h-full items-center justify-center bg-gradient-to-br from-blue-700 via-indigo-700 to-cyan-700 text-2xl font-black text-white">
                      <span>{c.title.slice(0, 3)}</span>
                    </div>
                  )}

                  <span className="absolute top-2.5 right-2.5 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold text-cyan-300 border border-cyan-400/30 flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    <span>كورس تعليمي</span>
                  </span>

                  <span className="absolute top-2.5 left-2.5 bg-blue-900/80 backdrop-blur-md px-2 py-0.5 rounded-lg text-[10px] font-bold text-white">
                    {c.grade}
                  </span>
                </div>

                {/* Details */}
                <div className="p-4 sm:p-5 space-y-2">
                  <h4 className="font-black text-base sm:text-lg text-white group-hover:text-cyan-300 transition-colors">
                    {c.title}
                  </h4>
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-300">
                    <span className="text-emerald-400 text-base font-black">
                      {c.isFree || c.price === 0 ? 'مجاني بالكامل' : `${Number(c.price).toLocaleString('ar-EG')} ج.م`}
                    </span>
                    <span>•</span>
                    <span className="text-slate-400">{c.days} يوم صلاحية</span>
                  </div>
                  {c.description && (
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                      {c.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="p-4 sm:p-5 pt-0">
                {studentData ? (
                  <button
                    onClick={() => {
                      if (studentBal >= c.price) {
                        if (window.confirm(`شراء كورس "${c.title}" وخصم ${c.price} ج.م من رصيد محفظتك؟`)) {
                          apiRequest('student', '/api/student/wallet/buy-course', { courseId: c.id })
                            .then(() => {
                              alert(`تم الاشتراك بنجاح في كورس ${c.title}!`);
                              onRefresh();
                            })
                            .catch((e: any) => alert(e.message));
                        }
                      } else {
                        alert(`رصيد محفظتك (${studentBal} ج.م) لا يكفي لشراء الكورس (${c.price} ج.م). يرجى شحن المحفظة أولاً.`);
                      }
                    }}
                    className="btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2 rounded-xl cursor-pointer shadow-md"
                  >
                    <Wallet className="w-4 h-4 text-cyan-200" />
                    <span>شراء الكورس من المحفظة ({c.price} ج.م)</span>
                  </button>
                ) : (
                  <button
                    onClick={onOpenAuthModal}
                    className="btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2 rounded-xl cursor-pointer shadow-md"
                  >
                    <Lock className="w-3.5 h-3.5 text-cyan-200" />
                    <span>سجّل الدخول للاشتراك بالكورس</span>
                    <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                  </button>
                )}
              </div>
            </article>
          ))}

        {/* PDF BOOKS */}
        {(filter === 'all' || filter === 'books') &&
          books.map((b) => (
            <article
              key={`b-${b.id}`}
              className="card bg-[#0e1b30] border border-emerald-500/25 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-emerald-400/50 hover:shadow-2xl transition-all group"
            >
              <div>
                {/* Book Cover Image */}
                <div className="overflow-hidden bg-[#070e1c] aspect-[16/9] relative border-b border-emerald-500/20">
                  {b.coverImage ? (
                    <img
                      src={b.coverImage}
                      alt={b.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex w-full h-full items-center justify-center bg-gradient-to-br from-emerald-800 via-teal-700 to-cyan-800 text-2xl font-black text-white">
                      <span>{b.title.slice(0, 3)}</span>
                    </div>
                  )}

                  <span className="absolute top-2.5 right-2.5 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    <span>كتاب / مذكرة PDF</span>
                  </span>

                  <span className="absolute top-2.5 left-2.5 bg-emerald-950/80 backdrop-blur-md px-2 py-0.5 rounded-lg text-[10px] font-bold text-emerald-200 border border-emerald-500/30">
                    {b.grade}
                  </span>
                </div>

                {/* Details */}
                <div className="p-4 sm:p-5 space-y-2">
                  <h4 className="font-black text-base sm:text-lg text-white group-hover:text-emerald-300 transition-colors">
                    {b.title}
                  </h4>
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-300">
                    <span className="text-emerald-400 text-base font-black">
                      {b.isFree || b.price === 0 ? 'تحميل مجاني 🎁' : `${Number(b.price).toLocaleString('ar-EG')} ج.م`}
                    </span>
                    <span>•</span>
                    <span className="text-slate-400">{b.pagesCount || 100} صفحة</span>
                    {b.downloadsCount ? (
                      <>
                        <span>•</span>
                        <span className="text-cyan-300">{b.downloadsCount} تنزيل</span>
                      </>
                    ) : null}
                  </div>
                  {b.description && (
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                      {b.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Button: Works for BOTH Visitors & Students */}
              <div className="p-4 sm:p-5 pt-0">
                <button
                  onClick={() => handleOpenBookPurchase(b)}
                  className="w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-lg shadow-emerald-900/30 cursor-pointer active:scale-95 transition-all"
                >
                  <Download className="w-4 h-4 text-emerald-100" />
                  <span>
                    {b.isFree || b.price === 0
                      ? 'تحميل الكتاب PDF مجاناً'
                      : 'شراء كتاب الـ PDF مباشرة'}
                  </span>
                </button>
              </div>
            </article>
          ))}
      </div>

      {/* BOOK PURCHASE & DOWNLOAD MODAL */}
      {selectedBookForPurchase && (
        <div
          dir="rtl"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto"
        >
          <div className="bg-[#0e1c33] border border-cyan-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl relative my-8">
            <button
              onClick={() => setSelectedBookForPurchase(null)}
              className="absolute top-5 left-5 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Title */}
            <div>
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-500/30 inline-block mb-1.5">
                {selectedBookForPurchase.isFree || selectedBookForPurchase.price === 0
                  ? 'تحميل كتاب رقمي مجاني'
                  : 'شراء كتاب PDF مباشر'}
              </span>
              <h3 className="text-xl font-black text-white">
                {selectedBookForPurchase.title}
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                الصف: {selectedBookForPurchase.grade} • السعر:{' '}
                <strong className="text-emerald-400">
                  {selectedBookForPurchase.isFree || selectedBookForPurchase.price === 0
                    ? 'مجاناً بدون رسوم'
                    : `${selectedBookForPurchase.price} جنيه مصري`}
                </strong>
              </p>
            </div>

            {/* Result Message (Success or Error) */}
            {purchaseResult && (
              <div
                className={`p-4 rounded-2xl text-xs sm:text-sm font-bold flex flex-col gap-2 ${
                  purchaseResult.ok
                    ? 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-200'
                    : 'bg-red-950/70 border border-red-500/40 text-red-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  {purchaseResult.ok ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                  )}
                  <span>{purchaseResult.msg}</span>
                </div>

                {purchaseResult.downloadUrl && (
                  <div className="pt-2 border-t border-emerald-500/30 flex justify-center">
                    <a
                      href={purchaseResult.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-gold py-2.5 px-6 text-xs font-bold flex items-center gap-2 rounded-xl shadow-lg"
                    >
                      <Download className="w-4 h-4" />
                      <span>اضغط هنا لتحميل ملف الـ PDF الآن</span>
                    </a>
                  </div>
                )}
              </div>
            )}

            {!purchaseResult?.ok && (
              <form onSubmit={handleSubmitBookPurchase} className="space-y-4">
                {/* Buyer Name & Phone */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-cyan-400" />
                      <span>اسم المشتري *</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="اكتب اسمك الثلاثي..."
                      className="input-field text-xs py-2.5"
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-cyan-400" />
                      <span>رقم الهاتف *</span>
                    </label>
                    <input
                      type="tel"
                      required
                      dir="ltr"
                      placeholder="010XXXXXXXX"
                      className="input-field text-xs py-2.5"
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                    />
                  </div>
                </div>

                {/* If Paid Book: Payment Selection */}
                {!(selectedBookForPurchase.isFree || selectedBookForPurchase.price === 0) && (
                  <div className="space-y-3 pt-2 border-t border-blue-500/20">
                    <label className="block text-xs font-bold text-slate-300">طريقة الدفع:</label>

                    {/* Method Toggle */}
                    <div className="grid grid-cols-2 gap-2">
                      {studentData && (
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('wallet')}
                          className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            paymentMethod === 'wallet'
                              ? 'bg-cyan-950/70 border-cyan-400 text-cyan-200 shadow-md'
                              : 'bg-[#081220] border-blue-500/20 text-slate-400 hover:text-white'
                          }`}
                        >
                          <Wallet className="w-4 h-4 text-cyan-400" />
                          <span>رصيد المحفظة ({studentBal} ج.م)</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('manual')}
                        className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          paymentMethod === 'manual' || !studentData
                            ? 'bg-cyan-950/70 border-cyan-400 text-cyan-200 shadow-md col-span-full sm:col-auto'
                            : 'bg-[#081220] border-blue-500/20 text-slate-400 hover:text-white'
                        }`}
                      >
                        <CreditCard className="w-4 h-4 text-emerald-400" />
                        <span>دفع يدوي (فودافون كاش / إنستا باي)</span>
                      </button>
                    </div>

                    {/* Manual Gateways View */}
                    {paymentMethod === 'manual' && (
                      <div className="space-y-3 bg-[#081220] p-4 rounded-2xl border border-blue-500/20">
                        <label className="block text-xs font-bold text-slate-300">
                          اختر محفظة التحويل:
                        </label>

                        <div className="grid gap-2">
                          {activeGateways.map((gw) => (
                            <div
                              key={gw.id}
                              onClick={() => setSelectedGatewayId(gw.id)}
                              className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                                selectedGatewayId === gw.id
                                  ? 'bg-blue-950/60 border-cyan-400 text-white shadow-inner'
                                  : 'bg-[#0b172a] border-blue-500/15 text-slate-300 hover:border-cyan-500/40'
                              }`}
                            >
                              <div>
                                <h5 className="font-bold text-xs">{gw.title}</h5>
                                <span dir="ltr" className="font-mono text-cyan-300 text-xs font-bold">
                                  {gw.accountNumber}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopy(gw.accountNumber);
                                }}
                                className="btn-cyan py-1 px-2.5 text-[10px] font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                              >
                                {copiedAcc === gw.accountNumber ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-300" />
                                    <span>تم النسخ</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>نسخ الرقم</span>
                                  </>
                                )}
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Upload Receipt */}
                        <div className="space-y-1.5 pt-2">
                          <label className="block text-xs font-bold text-slate-300">
                            صورة إيصال التحويل (اختياري / لتسريع التأكيد):
                          </label>
                          <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-cyan-500/30 hover:border-cyan-400 rounded-xl cursor-pointer bg-[#0e1d35] text-xs font-bold text-slate-300 hover:text-white transition-all">
                            <UploadCloud className="w-4 h-4 text-cyan-400" />
                            <span>{uploadingReceipt ? 'جاري رفع الإيصال...' : receiptFile ? 'تم رفع صورة الإيصال بنجاح ✓' : 'اضغط لاختيار صورة الإيصال'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting || uploadingReceipt}
                  className="btn-primary w-full py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 rounded-xl cursor-pointer shadow-lg mt-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-cyan-200" />
                      <span>جاري المعالجة...</span>
                    </>
                  ) : (
                    <>
                      <span>
                        {selectedBookForPurchase.isFree || selectedBookForPurchase.price === 0
                          ? 'تأكيد وتحميل الكتاب الآن مجاناً'
                          : 'إتمام عملية الشراء وتأكيد الطلب'}
                      </span>
                      <ArrowRight className="w-4 h-4 rotate-180" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
