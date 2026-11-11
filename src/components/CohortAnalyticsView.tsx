import React from 'react';
import type { Student } from '../types/student';
import { calculateRiskAssessment } from '../lib/riskEngine';
import {
  ShieldAlert,
  Users,
  AlertTriangle,
  TrendingDown,
  DollarSign,
  Award,
  ArrowUpRight,
  Flame,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface CohortAnalyticsViewProps {
  students: Student[];
  onSelectStudent: (student: Student) => void;
}

export const CohortAnalyticsView: React.FC<CohortAnalyticsViewProps> = ({
  students,
  onSelectStudent,
}) => {
  // Aggregate stats
  const assessments = students.map((s) => ({
    student: s,
    assessment: calculateRiskAssessment(s),
  }));

  const totalMonitored = students.length;
  const criticalCount = assessments.filter((a) => a.assessment.riskLevel === 'CRITICAL').length;
  const moderateCount = assessments.filter((a) => a.assessment.riskLevel === 'MODERATE').length;
  const detentionRiskCount = assessments.filter((a) => a.assessment.isEstDetentionImminent).length;
  const feeOverdueCount = students.filter((s) => s.feeStatus === 'OVERDUE').length;
  const totalArrearsLakhs = (
    students.reduce((acc, s) => acc + s.pendingFeeAmount, 0) / 100000
  ).toFixed(1);

  // Branch-wise Risk Breakdown
  const branchMap: Record<string, { total: number; critical: number; moderate: number; avgRisk: number }> = {};
  assessments.forEach(({ student, assessment }) => {
    const code = student.branchCode;
    if (!branchMap[code]) {
      branchMap[code] = { total: 0, critical: 0, moderate: 0, avgRisk: 0 };
    }
    branchMap[code].total++;
    if (assessment.riskLevel === 'CRITICAL') branchMap[code].critical++;
    if (assessment.riskLevel === 'MODERATE') branchMap[code].moderate++;
    branchMap[code].avgRisk += assessment.overallScore;
  });

  const branchData = Object.entries(branchMap).map(([branch, val]) => ({
    branch,
    critical: val.critical,
    moderate: val.moderate,
    avgRisk: Math.round(val.avgRisk / val.total),
  }));

  // Factor Distribution Pie Data
  const driverCounts = {
    'Attendance < 75%': 0,
    'MST Score Drops': 0,
    'Active Backlogs': 0,
    'LMS Inactivity': 0,
    'Fee Arrears Stress': 0,
  };

  assessments.forEach(({ student }) => {
    if (student.attendancePct < 75) driverCounts['Attendance < 75%']++;
    const avgDrop = student.mstScores.reduce((acc, c) => acc + c.dropPct, 0) / (student.mstScores.length || 1);
    if (avgDrop > 25) driverCounts['MST Score Drops']++;
    if (student.backlogsCount > 0) driverCounts['Active Backlogs']++;
    if (student.lmsInactivityDays >= 12) driverCounts['LMS Inactivity']++;
    if (student.feeStatus === 'OVERDUE') driverCounts['Fee Arrears Stress']++;
  });

  const pieData = Object.entries(driverCounts).map(([name, value]) => ({
    name,
    value,
  }));

  const PIE_COLORS = ['#ef4444', '#f97316', '#eab308', '#6366f1', '#a855f7'];

  // Top 3 urgent students
  const urgentQueue = [...assessments]
    .filter((a) => a.assessment.riskLevel === 'CRITICAL')
    .sort((a, b) => b.assessment.overallScore - a.assessment.overallScore)
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {/* Metric 1 */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-[11px] font-medium text-slate-400">Total Monitored</div>
          <div className="text-2xl font-mono font-bold text-slate-100 mt-1 flex items-baseline gap-1.5">
            {totalMonitored}
            <span className="text-[10px] text-slate-500 font-sans font-normal">cohort</span>
          </div>
          <div className="text-[10px] text-indigo-400 mt-1 flex items-center gap-1 font-mono">
            <Users className="w-3 h-3" /> TIET Patiala
          </div>
        </div>

        {/* Metric 2: Critical Red */}
        <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/40">
          <div className="text-[11px] font-medium text-rose-300">Critical At-Risk</div>
          <div className="text-2xl font-mono font-bold text-rose-400 mt-1 flex items-baseline gap-1.5">
            {criticalCount}
            <span className="text-[10px] text-rose-400/70 font-sans font-normal">+{moderateCount} moderate</span>
          </div>
          <div className="text-[10px] text-rose-400 mt-1 flex items-center gap-1 font-mono font-medium">
            <Flame className="w-3 h-3" /> Immediate Triage
          </div>
        </div>

        {/* Metric 3: Detention Threat */}
        <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/40">
          <div className="text-[11px] font-medium text-amber-300">EST Detention Threat</div>
          <div className="text-2xl font-mono font-bold text-amber-400 mt-1 flex items-baseline gap-1.5">
            {detentionRiskCount}
            <span className="text-[10px] text-amber-400/70 font-sans font-normal">&lt;75% att</span>
          </div>
          <div className="text-[10px] text-amber-400 mt-1 flex items-center gap-1 font-mono">
            <AlertTriangle className="w-3 h-3" /> Reg §4.2 Debar
          </div>
        </div>

        {/* Metric 4: Fee Arrears */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-[11px] font-medium text-slate-400">Fee Hold Stress</div>
          <div className="text-2xl font-mono font-bold text-purple-400 mt-1 flex items-baseline gap-1.5">
            ₹{totalArrearsLakhs}L
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 font-mono">
            <DollarSign className="w-3 h-3" /> {feeOverdueCount} Overdue
          </div>
        </div>

        {/* Metric 5: Active Interventions */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-[11px] font-medium text-slate-400">Interventions Logged</div>
          <div className="text-2xl font-mono font-bold text-cyan-400 mt-1">
            {students.reduce((acc, s) => acc + s.interventionHistory.length, 0)}
          </div>
          <div className="text-[10px] text-cyan-400 mt-1 flex items-center gap-1 font-mono">
            <Award className="w-3 h-3" /> Active Mentor Plans
          </div>
        </div>

        {/* Metric 6: Retention Recovery Rate */}
        <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
          <div className="text-[11px] font-medium text-emerald-300">Averted Detentions</div>
          <div className="text-2xl font-mono font-bold text-emerald-400 mt-1">
            81.4%
          </div>
          <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1 font-mono font-medium">
            <ArrowUpRight className="w-3 h-3" /> +14% vs Last Year
          </div>
        </div>
      </div>

      {/* Charts & Urgent Action Queue Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Branch Risk Breakdown Chart */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  Branch-Wise Academic Risk & Quiet Dropout Vulnerability
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Confirmed TIET Trend: Non-CSE branches (Mechanical, Civil, Chemical) suffer higher backlog cascade and fee ROI anxiety.
                </p>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                Department Level
              </span>
            </div>

            <div className="h-64 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={branchData} margin={{ top: 10, right: 20, left: -10, bottom: 10 }}>
                  <XAxis dataKey="branch" stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="critical" name="Critical Risk Count" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="moderate" name="Moderate Risk Count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="avgRisk" name="Avg Risk Score %" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
            <span>Highest Concentration: <strong>Mechanical (ME)</strong> & <strong>Civil (CIE)</strong></span>
            <span className="text-indigo-400 font-mono text-[11px]">Sync: Thapar ERP Webkiosk</span>
          </div>
        </div>

        {/* Primary SHAP Drivers Donut */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-amber-400" />
              Primary Risk Drivers Distribution
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Breakdown of root causes triggering automated triage alerts across the current semester.
            </p>

            <div className="h-56 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-1.5 mt-1">
              {pieData.map((item, idx) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                    />
                    <span className="text-slate-300">{item.name}</span>
                  </div>
                  <span className="font-mono text-slate-400 font-bold">{item.value} alerts</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Urgent 24-Hour Advisor Action Queue */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-950/20 via-slate-900 to-slate-900 border border-rose-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Urgent 24-Hour Advisor Action Queue
            </h4>
            <span className="text-xs px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono">
              Immediate Contact Required
            </span>
          </div>
          <span className="text-xs text-slate-400">Advisors must log outreach before Friday 5:00 PM EST Freeze</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {urgentQueue.map(({ student, assessment }) => (
            <div
              key={student.id}
              onClick={() => onSelectStudent(student)}
              className="p-3.5 rounded-xl bg-slate-900/90 border border-rose-500/20 hover:border-rose-500/50 cursor-pointer transition flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <img
                  src={student.avatarUrl}
                  alt={student.name}
                  className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0"
                />
                <div>
                  <div className="font-bold text-xs text-slate-200 group-hover:text-rose-400 transition line-clamp-1">
                    {student.name}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {student.branchCode} • Att: <span className="text-rose-400 font-bold">{student.attendancePct}%</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-mono text-sm font-black text-rose-400">{assessment.overallScore}%</div>
                <div className="text-[10px] text-rose-300 font-semibold uppercase font-mono">Review</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
