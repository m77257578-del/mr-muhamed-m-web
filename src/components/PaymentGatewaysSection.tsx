import React, { useState } from 'react';
import {
  CreditCard,
  Copy,
  Check,
  Smartphone,
  Building,
  ShieldCheck,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { ManualGateway } from '../types';

interface PaymentGatewaysSectionProps {
  gateways?: ManualGateway[];
}

export const PaymentGatewaysSection: React.FC<PaymentGatewaysSectionProps> = ({
  gateways = []
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeGateways = gateways.filter((g) => g.active !== false);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!activeGateways.length) return null;

  return (
    <section className="space-y-6 py-6" id="payment-methods">
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-2 pb-3 border-b border-blue-500/15">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-bold mb-2">
            <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
            <span>طرق الدفع والشحن المعتمدة</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white">
            طرق الدفع المتاحة بالمنصة
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            يمكنك شحن رصيد محفظتك أو شراء الكورسات وكتب الـ PDF مباشرة عبر أي من المحافظ الإلكترونية التالية:
          </p>
        </div>

        <span className="text-xs font-bold text-slate-400">
          تأكيد وشحن فوري على مدار 24 ساعة
        </span>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {activeGateways.map((gw) => {
          const isVodafone = gw.provider === 'vodafone' || gw.title.includes('فودافون');
          const isInstapay = gw.provider === 'instapay' || gw.title.includes('إنستا') || gw.title.includes('انستا');
          const isFawry = gw.provider === 'fawry' || gw.title.includes('فوري');

          const badgeBg = isVodafone
            ? 'bg-red-950/50 border-red-500/30 text-red-300'
            : isInstapay
            ? 'bg-purple-950/50 border-purple-500/30 text-purple-300'
            : isFawry
            ? 'bg-amber-950/50 border-amber-500/30 text-amber-300'
            : 'bg-blue-950/50 border-blue-500/30 text-blue-300';

          return (
            <div
              key={gw.id}
              className="card bg-[#0e1d35] border border-blue-500/25 p-5 rounded-2xl flex flex-col justify-between space-y-4 shadow-xl hover:border-cyan-400/40 transition-all group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${badgeBg}`}>
                    {isVodafone ? 'محفظة كاش' : isInstapay ? 'دفع لحظي IPA' : isFawry ? 'كود خدمة' : 'تحويل بنكي'}
                  </span>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>

                <div>
                  <h4 className="text-base font-black text-white group-hover:text-cyan-300 transition-colors">
                    {gw.title}
                  </h4>
                  {gw.accountHolder && (
                    <p className="text-xs text-slate-300 mt-0.5">
                      الاسم المسجل: <span className="font-bold text-slate-200">{gw.accountHolder}</span>
                    </p>
                  )}
                </div>

                {/* Account Number Box with One-Click Copy */}
                <div className="p-3 bg-[#081220] rounded-xl border border-blue-500/20 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-0.5">رقم المحفظة / الحساب</span>
                    <strong dir="ltr" className="font-mono text-sm sm:text-base font-black text-cyan-300">
                      {gw.accountNumber}
                    </strong>
                  </div>

                  <button
                    onClick={() => handleCopy(gw.accountNumber, gw.id)}
                    className="btn-cyan py-1.5 px-3 text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95 transition-all"
                  >
                    {copiedId === gw.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                        <span>تم النسخ</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>نسخ</span>
                      </>
                    )}
                  </button>
                </div>

                {gw.instructions && (
                  <p className="text-xs text-slate-300 leading-relaxed bg-blue-950/20 p-2.5 rounded-xl border border-blue-500/10">
                    <Info className="w-3 h-3 text-cyan-400 inline ml-1 align-middle" />
                    {gw.instructions}
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-blue-500/15 flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>حساب معتمد ورسمي للمنصة</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
