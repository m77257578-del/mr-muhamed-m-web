import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  Target,
  Award,
  BarChart3,
  PieChart as PieIcon,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowUpRight,
  Clock,
  BookOpen,
} from 'lucide-react';
import { ExamResult, Exam } from '../types';

interface StudentAnalyticsDashboardProps {
  results: ExamResult[];
  exams: Exam[];
}

const COLORS = {
  excellent: '#10b981', // emerald
  veryGood: '#06b6d4',  // cyan
  good: '#3b82f6',      // blue
  pass: '#f59e0b',      // amber
  needsWork: '#ef4444', // red
};

export const StudentAnalyticsDashboard: React.FC<StudentAnalyticsDashboardProps> = ({
  results,
  exams,
}) => {
  const [chartView, setChartView] = useState<'timeline' | 'comparison' | 'distribution'>('timeline');

  // Filter only graded exams
  const gradedResults = useMemo(() => {
    return results
      .filter((r) => r.status === 'graded' && r.score !== null)
      .sort((a, b) => new Date(a.created).getTime() - new Date(b.created).getTime());
  }, [results]);

  // Overall calculations
  const totalExams = exams.length;
  const completedExams = gradedResults.length;
  const completionPercentage = totalExams > 0 ? Math.round((completedExams / totalExams) * 100) : 0;

  const totalPointsEarned = gradedResults.reduce((acc, r) => acc + (r.score || 0), 0);
  const totalPointsPossible = gradedResults.reduce((acc, r) => acc + (r.total || 0), 0);
  const averagePercentage = totalPointsPossible > 0
    ? Math.round((totalPointsEarned / totalPointsPossible) * 100)
    : 0;

  const highestScoreObj = useMemo(() => {
    if (gradedResults.length === 0) return null;
    return gradedResults.reduce((max, r) => {
      const pct = r.total ? ((r.score || 0) / r.total) * 100 : 0;
      const maxPct = max.total ? ((max.score || 0) / max.total) * 100 : 0;
      return pct > maxPct ? r : max;
    }, gradedResults[0]);
  }, [gradedResults]);

  const highestPercentage = highestScoreObj && highestScoreObj.total
    ? Math.round(((highestScoreObj.score || 0) / highestScoreObj.total) * 100)
    : 0;

  // Timeline chart data
  const timelineData = useMemo(() => {
    return gradedResults.map((r, index) => {
      const pct = r.total ? Math.round(((r.score || 0) / r.total) * 100) : 0;
      const shortDate = new Date(r.created).toLocaleDateString('ar-EG', {
        month: 'short',
        day: 'numeric',
      });
      return {
        id: r.id,
        name: r.examTitle.length > 18 ? `${r.examTitle.slice(0, 18)}...` : r.examTitle,
        fullTitle: r.examTitle,
        score: r.score,
        total: r.total,
        percentage: pct,
        date: shortDate,
        examNumber: index + 1,
        label: r.label || (pct >= 85 ? 'ممتاز' : pct >= 75 ? 'جيد جداً' : pct >= 65 ? 'جيد' : pct >= 50 ? 'مقبول' : 'يحتاج متابعة'),
      };
    });
  }, [gradedResults]);

  // Performance category breakdown for Pie Chart
  const distributionData = useMemo(() => {
    const counts = {
      excellent: 0,
      veryGood: 0,
      good: 0,
      pass: 0,
      needsWork: 0,
    };

    gradedResults.forEach((r) => {
      const pct = r.total ? ((r.score || 0) / r.total) * 100 : 0;
      if (pct >= 85) counts.excellent++;
      else if (pct >= 75) counts.veryGood++;
      else if (pct >= 65) counts.good++;
      else if (pct >= 50) counts.pass++;
      else counts.needsWork++;
    });

    return [
      { name: 'ممتاز (85%+)', value: counts.excellent, color: COLORS.excellent },
      { name: 'جيد جداً (75-84%)', value: counts.veryGood, color: COLORS.veryGood },
      { name: 'جيد (65-74%)', value: counts.good, color: COLORS.good },
      { name: 'مقبول (50-64%)', value: counts.pass, color: COLORS.pass },
      { name: 'يحتاج متابعة (<50%)', value: counts.needsWork, color: COLORS.needsWork },
    ].filter((item) => item.value > 0);
  }, [gradedResults]);

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#0c1626] border border-cyan-400/40 p-3.5 rounded-xl shadow-2xl text-right text-xs space-y-1.5 z-50">
          <p className="font-extrabold text-white text-sm border-b border-slate-700 pb-1">
            {data.fullTitle || data.name}
          </p>
          <div className="flex items-center justify-between gap-4 text-cyan-300">
            <span>النسبة المئوية:</span>
            <strong className="font-mono text-base font-black">{data.percentage}%</strong>
          </div>
          <div className="flex items-center justify-between gap-4 text-slate-300">
            <span>الدرجة الفعلية:</span>
            <span>
              <strong>{data.score}</strong> من <strong>{data.total}</strong>
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 text-amber-300">
            <span>التقدير:</span>
            <span className="font-bold">{data.label}</span>
          </div>
          {data.date && (
            <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
              التاريخ: {data.date}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  if (gradedResults.length === 0) {
    return (
      <div className="panel border border-cyan-500/20 bg-gradient-to-b from-[#0f1b2d] to-[#0a1220] p-8 rounded-2xl text-center space-y-4 shadow-xl">
        <div className="w-16 h-16 rounded-full bg-cyan-950/60 border border-cyan-400/30 text-cyan-400 flex items-center justify-center mx-auto">
          <BarChart3 className="w-8 h-8 animate-pulse" />
        </div>
        <div className="space-y-1">
          <h4 className="text-xl font-black text-white">لوحة إحصائيات الأداء الأكاديمي</h4>
          <p className="text-sm text-slate-300 max-w-md mx-auto">
            لم تسجل نتائج امتحانات مكتملة بعد. قم بحل الاختبارات المتاحة لك لتظهر هنا رسوم بيانية تفاعلية تقيس تطور مستواك الأكاديمي أولاً بأول!
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-4 text-xs font-bold text-slate-400 pt-2">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            تتبع مسار الدرجات زمنيًا
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            تحليل نسب التقدم ومتوسط الإتقان
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            مخططات بيانية تفاعلية دقيقة
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Header & Summary KPIs */}
      <div className="panel border border-cyan-500/25 bg-gradient-to-r from-[#0d1e38] via-[#0b172a] to-[#070e1c] p-6 rounded-2xl shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-blue-500/20">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="badge-pill bg-cyan-950/80 text-cyan-300 border-cyan-400/40 text-xs font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>إحصائيات Recharts التفاعلية</span>
              </span>
              <span className="text-xs text-slate-400 font-bold">
                تحديث لحظي
              </span>
            </div>
            <h3 className="text-2xl font-black text-white flex items-center gap-2">
              <span>لوحة تحليل أداء الطالب في الامتحانات</span>
            </h3>
            <p className="text-xs text-slate-300">
              قراءة بيانية دقيقة لمعدلات تحصيلك وتطور إجاباتك عبر كافة الاختبارات المنجزة.
            </p>
          </div>

          {/* View Toggles */}
          <div className="flex items-center gap-1.5 bg-[#070e1c] p-1 rounded-xl border border-blue-500/20">
            <button
              type="button"
              onClick={() => setChartView('timeline')}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                chartView === 'timeline'
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>مسار التطور</span>
            </button>
            <button
              type="button"
              onClick={() => setChartView('comparison')}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                chartView === 'comparison'
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>مقارنة الدرجات</span>
            </button>
            <button
              type="button"
              onClick={() => setChartView('distribution')}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                chartView === 'distribution'
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <PieIcon className="w-3.5 h-3.5" />
              <span>توزيع التقديرات</span>
            </button>
          </div>
        </div>

        {/* Top 4 KPI Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Average Score */}
          <div className="card bg-[#111f36]/80 p-4 rounded-xl border border-cyan-500/30 relative overflow-hidden group hover:border-cyan-400 transition-all shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 font-bold">متوسط الدرجات</span>
              <div className="p-2 rounded-lg bg-cyan-950/60 text-cyan-400 border border-cyan-500/20">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-cyan-300 font-mono">{averagePercentage}%</span>
              <span className="text-xs text-slate-400">معدل تراكمي</span>
            </div>
            {/* Progress Bar inside Card */}
            <div className="mt-3 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, averagePercentage)}%` }}
              />
            </div>
          </div>

          {/* Exam Completion Progress */}
          <div className="card bg-[#111f36]/80 p-4 rounded-xl border border-emerald-500/30 relative overflow-hidden group hover:border-emerald-400 transition-all shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 font-bold">نسبة التقدم الكلية</span>
              <div className="p-2 rounded-lg bg-emerald-950/60 text-emerald-400 border border-emerald-500/20">
                <Target className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-400 font-mono">{completionPercentage}%</span>
              <span className="text-xs text-slate-400">
                ({completedExams} من {totalExams})
              </span>
            </div>
            <div className="mt-3 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, completionPercentage)}%` }}
              />
            </div>
          </div>

          {/* Highest Score */}
          <div className="card bg-[#111f36]/80 p-4 rounded-xl border border-amber-500/30 relative overflow-hidden group hover:border-amber-400 transition-all shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 font-bold">أعلى نتيجة محققة</span>
              <div className="p-2 rounded-lg bg-amber-950/60 text-amber-400 border border-amber-500/20">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-amber-400 font-mono">{highestPercentage}%</span>
              <span className="text-[11px] text-slate-300 truncate max-w-[110px]" title={highestScoreObj?.examTitle}>
                {highestScoreObj ? highestScoreObj.examTitle : '—'}
              </span>
            </div>
            <div className="mt-3 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, highestPercentage)}%` }}
              />
            </div>
          </div>

          {/* Total Points Earned */}
          <div className="card bg-[#111f36]/80 p-4 rounded-xl border border-purple-500/30 relative overflow-hidden group hover:border-purple-400 transition-all shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 font-bold">إجمالي النقاط المكتسبة</span>
              <div className="p-2 rounded-lg bg-purple-950/60 text-purple-400 border border-purple-500/20">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-purple-300 font-mono">{totalPointsEarned}</span>
              <span className="text-xs text-slate-400">من {totalPointsPossible} نقطة</span>
            </div>
            <div className="mt-3 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full transition-all duration-700"
                style={{ width: `${totalPointsPossible > 0 ? (totalPointsEarned / totalPointsPossible) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* 2. Primary Recharts Visualizations */}
        <div className="bg-[#091322] p-4 sm:p-5 rounded-2xl border border-blue-500/20">
          {/* Chart Header */}
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
              <h4 className="font-extrabold text-sm sm:text-base text-white">
                {chartView === 'timeline' && 'مسار التطور الزمني للدرجات (Area Chart)'}
                {chartView === 'comparison' && 'مقارنة الدرجات المحققة بكل امتحان (Bar Chart)'}
                {chartView === 'distribution' && 'توزيع التقديرات ومستويات الإتقان (Pie Chart)'}
              </h4>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {gradedResults.length} {gradedResults.length === 1 ? 'اختبار' : 'اختبارات'}
            </span>
          </div>

          {/* Chart Canvas */}
          <div className="h-[280px] sm:h-[340px] w-full pt-2" dir="ltr">
            {chartView === 'timeline' && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={timelineData}
                  margin={{ top: 15, right: 20, left: -10, bottom: 25 }}
                >
                  <defs>
                    <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    domain={[0, 100]}
                    tickCount={6}
                    unit="%"
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  {/* Reference Line for Passing Grade (50%) and Excellence (85%) */}
                  <ReferenceLine
                    y={85}
                    stroke="#10b981"
                    strokeDasharray="4 4"
                    label={{ value: 'امتياز (85%)', fill: '#10b981', fontSize: 10, position: 'insideTopRight' }}
                  />
                  <ReferenceLine
                    y={50}
                    stroke="#f59e0b"
                    strokeDasharray="4 4"
                    label={{ value: 'النجاح (50%)', fill: '#f59e0b', fontSize: 10, position: 'insideBottomRight' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="percentage"
                    stroke="#06b6d4"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#scoreGradient)"
                    dot={{ fill: '#38bdf8', stroke: '#0c1626', strokeWidth: 2, r: 5 }}
                    activeDot={{ fill: '#ffffff', stroke: '#06b6d4', strokeWidth: 3, r: 7 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}

            {chartView === 'comparison' && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={timelineData}
                  margin={{ top: 15, right: 20, left: -10, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    domain={[0, 100]}
                    tickCount={6}
                    unit="%"
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="percentage"
                    radius={[8, 8, 0, 0]}
                    fill="#3b82f6"
                  >
                    {timelineData.map((entry, index) => {
                      const color =
                        entry.percentage >= 85
                          ? COLORS.excellent
                          : entry.percentage >= 75
                          ? COLORS.veryGood
                          : entry.percentage >= 65
                          ? COLORS.good
                          : entry.percentage >= 50
                          ? COLORS.pass
                          : COLORS.needsWork;
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}

            {chartView === 'distribution' && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    formatter={(value: any, name: any) => [`${value} اختبار`, name]}
                    contentStyle={{
                      backgroundColor: '#0c1626',
                      borderColor: '#06b6d4',
                      borderRadius: '0.75rem',
                      color: '#fff',
                      direction: 'rtl',
                      fontSize: '12px',
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => <span className="text-slate-200 text-xs font-bold mr-1">{value}</span>}
                  />
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="45%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) => `${((percent || 0) * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#070e1c" strokeWidth={2} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* 3. Personalized Performance Advice Note */}
        <div className="p-4 rounded-xl bg-[#0c1626] border border-cyan-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-right">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-950/70 text-cyan-400 border border-cyan-500/30 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-bold text-xs sm:text-sm text-white">
                {averagePercentage >= 85
                  ? '🌟 مستوى استثنائي ممتاز! استمر على هذا النهج لضمان الدرجات النهائية.'
                  : averagePercentage >= 70
                  ? '💪 أداء رائع وثابت! يمكنك مراجعة الأسئلة الخاطئة في كل امتحان لتحقيق نسبة 95%+.'
                  : '📖 خطة تحسين مقترحة: ننصح بإعادة مشاهدة شروحات الدروس التي حصدت فيها درجات أقل من 70%.'}
              </h5>
              <p className="text-[11px] text-slate-400 mt-0.5">
                تُحدَّث هذه الإحصائيات مباشرة فور اعتماد وتصحيح أي امتحان جديد.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 bg-[#111f36] px-3 py-1.5 rounded-lg border border-cyan-500/20 shrink-0">
            <span>معدل النجاح العام:</span>
            <span className="font-mono font-black text-emerald-400 text-sm">{averagePercentage}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
