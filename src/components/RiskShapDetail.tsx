import React, { useState } from 'react';
import type { Student, StudentRiskAssessment, ShapFactor } from '../types/student';
import { TrendingDown, TrendingUp, ShieldAlert, BookOpen, Layers } from 'lucide-react';

interface RiskShapDetailProps {
  student: Student;
  assessment: StudentRiskAssessment;
}

export const RiskShapDetail: React.FC<RiskShapDetailProps> = ({ student, assessment }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredFactors = assessment.shapFactors.filter((f) => {
    if (selectedCategory === 'all') return true;
    return f.category === selectedCategory;
  });

  const categories = [
    { id: 'all', label: 'All SHAP Signals' },
    { id: 'attendance', label: 'Attendance Deficit' },
    { id: 'academic', label: 'MST Exam Drops' },
    { id: 'backlog', label: 'Backlogs & Credits' },
    { id: 'engagement', label: 'LMS Inactivity' },
    { id: 'financial', label: 'Fee Arrears' },
  ];

  return (
    <div className="space-y-4">
      {/* Overview Banner */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <h4 className="text-base font-semibold text-slate-100">
              Explainable SHAP Attribution Model
            </h4>
            <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-mono">
              Model Confidence: 94.2%
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Mathematical breakdown of how specific behavioral and academic signals drove {student.name.split(' ')[0]}'s risk score from baseline (15%) to{' '}
            <strong className="text-rose-400 font-mono">{assessment.overallScore}%</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-2 rounded-lg border border-slate-700/60 shrink-0">
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Primary Culprit</div>
            <div className="text-xs font-semibold text-rose-300 max-w-[200px] truncate">
              {assessment.shapFactors.find((f) => f.isRiskDriver)?.label || 'None'}
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 font-bold flex items-center justify-center font-mono text-sm border border-rose-500/30">
            !
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center gap-1.5">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`text-xs px-2.5 py-1 rounded-lg transition-all ${
              selectedCategory === cat.id
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-semibold shadow-sm'
                : 'bg-slate-800/50 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* SHAP Factor Bars */}
      <div className="space-y-3">
        {filteredFactors.map((factor: ShapFactor) => {
          const isRisk = factor.isRiskDriver;
          const absImpact = Math.abs(factor.impactPercent);
          const maxImpact = 40; // scale benchmark
          const barWidthPercent = Math.min(100, (absImpact / maxImpact) * 100);

          return (
            <div
              key={factor.factorKey}
              className={`p-3.5 rounded-xl border transition-all ${
                isRisk
                  ? 'bg-slate-900/60 hover:bg-slate-900 border-rose-900/30 hover:border-rose-500/40'
                  : 'bg-slate-900/60 hover:bg-slate-900 border-emerald-900/30 hover:border-emerald-500/40'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                      isRisk
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {isRisk ? (
                      <TrendingUp className="w-3.5 h-3.5" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-200">{factor.label}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded uppercase font-mono font-medium tracking-wide bg-slate-800 text-slate-400 border border-slate-700">
                        {factor.category}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Current Value:{' '}
                      <strong className={isRisk ? 'text-rose-300 font-mono' : 'text-emerald-300 font-mono'}>
                        {factor.currentValue}
                      </strong>{' '}
                      <span className="text-slate-500">vs</span> Target:{' '}
                      <span className="text-slate-300 font-mono">{factor.benchmarkValue}</span>
                    </div>
                  </div>
                </div>

                {/* Impact Metric Pill */}
                <div
                  className={`text-right shrink-0 px-2.5 py-1 rounded-md font-mono text-xs font-bold border ${
                    isRisk
                      ? 'bg-rose-950/40 text-rose-400 border-rose-800/40'
                      : 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
                  }`}
                >
                  {isRisk ? `+${factor.impactPercent}% Risk` : `${factor.impactPercent}% Protective`}
                </div>
              </div>

              {/* Bar visualization */}
              <div className="mt-2.5 space-y-1">
                <div className="h-2 w-full bg-slate-800/80 rounded-full overflow-hidden flex">
                  {isRisk ? (
                    <div
                      className="h-full bg-gradient-to-r from-rose-600 to-rose-400 rounded-full transition-all duration-700"
                      style={{ width: `${barWidthPercent}%` }}
                    />
                  ) : (
                    <div
                      className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-700"
                      style={{ width: `${barWidthPercent}%` }}
                    />
                  )}
                </div>
              </div>

              {/* Human-readable explanation and policy rule */}
              <div className="mt-2.5 pt-2 border-t border-slate-800/70 flex flex-col md:flex-row md:items-center justify-between text-xs text-slate-400 gap-1.5">
                <p className="flex-1 text-slate-300">{factor.explanation}</p>
                {factor.tietPolicyRef && (
                  <div className="flex items-center gap-1 text-[11px] text-amber-300/90 font-medium bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 shrink-0">
                    <BookOpen className="w-3 h-3 text-amber-400" />
                    <span>{factor.tietPolicyRef}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Baseline Cohort Context Footer */}
      <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/60 text-xs text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-400" />
          <span>
            Baseline Model Constant $E[f(x)]$: <strong>15.0%</strong> (Average expected dropout across all TIET engineering cohorts)
          </span>
        </div>
        <span className="font-mono text-slate-400">Sum of SHAP = {assessment.overallScore}%</span>
      </div>
    </div>
  );
};
