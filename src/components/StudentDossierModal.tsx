import React, { useState } from 'react';
import type { Student, StudentRiskAssessment, SimulationParams } from '../types/student';
import { RiskBadge } from './RiskBadge';
import { RiskShapDetail } from './RiskShapDetail';
import { RecoverySimulator } from './RecoverySimulator';
import {
  X,
  AlertTriangle,
  Calendar,
  Sparkles,
  Phone,
  Mail,
  Home,
  CheckCircle2,
  Sliders,
  History,
  FileSpreadsheet,
  AlertCircle,
  TrendingDown,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface StudentDossierModalProps {
  student: Student;
  assessment: StudentRiskAssessment;
  isOpen: boolean;
  onClose: () => void;
  onTriggerIntervention: (student: Student) => void;
  onCommitSimulationPlan?: (studentId: string, params: SimulationParams, newScore: number) => void;
}

export const StudentDossierModal: React.FC<StudentDossierModalProps> = ({
  student,
  assessment,
  isOpen,
  onClose,
  onTriggerIntervention,
  onCommitSimulationPlan,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'shap' | 'simulator' | 'attendance' | 'mst' | 'interventions'>('shap');

  // Chart data for MST comparison
  const mstChartData = student.mstScores.map((s) => ({
    name: s.courseCode,
    fullName: s.courseName,
    MST1: s.mst1,
    MST2: s.mst2,
    drop: s.dropPct,
  }));

  const handleCommitPlan = (params: SimulationParams, newScore: number) => {
    if (onCommitSimulationPlan) {
      onCommitSimulationPlan(student.id, params, newScore);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-5xl bg-[#10141f] border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Top Header with Bio */}
        <div className="p-5 border-b border-slate-800/80 bg-gradient-to-r from-slate-900/90 via-slate-900 to-slate-950 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <img
              src={student.avatarUrl}
              alt={student.name}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-700 shadow-md shrink-0"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">{student.name}</h2>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {student.rollNo}
                </span>
                <RiskBadge
                  score={assessment.overallScore}
                  level={assessment.riskLevel}
                  size="md"
                  pulsing={assessment.riskLevel === 'CRITICAL'}
                />
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 mt-1.5 font-sans">
                <span className="text-slate-200 font-medium">{student.branch}</span>
                <span>•</span>
                <span>Year {student.year}, Sem {student.semester}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Home className="w-3 h-3 text-slate-400" />
                  {student.hostel}
                </span>
                <span>•</span>
                <span className="font-mono text-slate-300">CGPA: {student.cgpa.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end md:self-center">
            <button
              onClick={() => onTriggerIntervention(student)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-rose-600/30 transition"
            >
              <Sparkles className="w-4 h-4" />
              Take Intervention Action
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Signal Badges Strip */}
        <div className="px-5 py-2.5 bg-slate-900/50 border-b border-slate-800/80 flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">EST Detention Threat:</span>
            {assessment.detentionRiskCount > 0 ? (
              <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 font-mono font-bold border border-rose-500/30 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {assessment.detentionRiskCount} Subjects Debarred
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-mono font-medium border border-emerald-500/30">
                Eligible All Subjects
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Attendance:</span>
            <span
              className={`font-mono font-bold ${
                student.attendancePct < 65 ? 'text-rose-400' : student.attendancePct < 75 ? 'text-amber-400' : 'text-emerald-400'
              }`}
            >
              {student.attendancePct}%
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">LMS Inactivity:</span>
            <span className="font-mono text-slate-300">{student.lmsInactivityDays} days dormant</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Active Backlogs:</span>
            <span className="font-mono text-rose-300 font-bold">{student.backlogsCount}</span>
          </div>

          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-slate-400">Fee Status:</span>
            <span
              className={`font-mono text-xs px-2 py-0.5 rounded ${
                student.feeStatus === 'OVERDUE'
                  ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                  : student.feeStatus === 'PARTIAL'
                  ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                  : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              {student.feeStatus} {student.pendingFeeAmount > 0 && `(₹${(student.pendingFeeAmount / 1000).toFixed(0)}k)`}
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 border-b border-slate-800 bg-[#0d1019] flex gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('shap')}
            className={`py-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'shap'
                ? 'border-rose-500 text-rose-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-rose-400" />
            Explainable SHAP Attribution
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`py-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'simulator'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4 text-indigo-400" />
            What-If Recovery Simulator
          </button>

          <button
            onClick={() => setActiveTab('attendance')}
            className={`py-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'attendance'
                ? 'border-amber-500 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-amber-400" />
            Subject Attendance & Detention Grid
          </button>

          <button
            onClick={() => setActiveTab('mst')}
            className={`py-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'mst'
                ? 'border-cyan-500 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingDown className="w-4 h-4 text-cyan-400" />
            MST Test Drop Breakdown
          </button>

          <button
            onClick={() => setActiveTab('interventions')}
            className={`py-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'interventions'
                ? 'border-purple-500 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-4 h-4 text-purple-400" />
            Action Log & Interventions ({student.interventionHistory.length})
          </button>
        </div>

        {/* Tab Body Content */}
        <div className="p-5 overflow-y-auto flex-1 bg-[#0c0f18] space-y-4">
          {activeTab === 'shap' && (
            <RiskShapDetail student={student} assessment={assessment} />
          )}

          {activeTab === 'simulator' && (
            <RecoverySimulator student={student} onCommitPlan={handleCommitPlan} />
          )}

          {activeTab === 'attendance' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
                <div>
                  <div className="font-bold text-sm">TIET EST Examination Eligibility Rule §4.2</div>
                  <div className="mt-0.5 text-slate-300">
                    Students must maintain ≥ 75% attendance in each individual course to obtain an Admit Card / Hall Ticket. Debarred courses result in mandatory summer-semester re-registration fees (~₹45,000 per course).
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800 font-mono uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="p-3">Course Code</th>
                      <th className="p-3">Course Title</th>
                      <th className="p-3">Classes Attended</th>
                      <th className="p-3">Classes Missed</th>
                      <th className="p-3">Attendance %</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Lectures Needed to 75%</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    {student.subjectAttendances.map((sub) => {
                      const attended = sub.totalClasses - sub.classesMissed;
                      // Classes needed to reach 75%
                      // (attended + x) / (total + x) >= 0.75 => x >= (0.75 * total - attended) / 0.25
                      const needed = Math.max(0, Math.ceil((0.75 * sub.totalClasses - attended) / 0.25));

                      return (
                        <tr
                          key={sub.courseCode}
                          className={`hover:bg-slate-900/50 transition ${
                            sub.isDetentionRisk ? 'bg-rose-950/10' : ''
                          }`}
                        >
                          <td className="p-3 font-mono font-semibold text-slate-300">{sub.courseCode}</td>
                          <td className="p-3 font-medium text-slate-200">{sub.courseName}</td>
                          <td className="p-3 font-mono text-slate-300">
                            {attended} / {sub.totalClasses}
                          </td>
                          <td className="p-3 font-mono text-rose-400 font-semibold">{sub.classesMissed}</td>
                          <td className="p-3">
                            <span
                              className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                                sub.attendancePct < 65
                                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                                  : sub.attendancePct < 75
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              }`}
                            >
                              {sub.attendancePct}%
                            </span>
                          </td>
                          <td className="p-3">
                            {sub.isDetentionRisk ? (
                              <span className="text-rose-400 font-semibold flex items-center gap-1 text-[11px]">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                EST Debarred
                              </span>
                            ) : (
                              <span className="text-emerald-400 font-medium flex items-center gap-1 text-[11px]">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Cleared
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-right font-mono font-semibold">
                            {needed > 0 ? (
                              <span className="text-amber-400">+{needed} lectures</span>
                            ) : (
                              <span className="text-slate-500">0 (Safe)</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'mst' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                      <TrendingDown className="w-4 h-4 text-cyan-400" />
                      Mid Semester Test (MST-1 vs MST-2) Performance Drop
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Sharp decline in continuous assessment indicates conceptual decoupling before End Semester (EST) exams.
                    </p>
                  </div>
                  <span className="text-xs font-mono px-2 py-1 rounded bg-slate-800 text-slate-300">
                    Weightage: 30% Course Total
                  </span>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mstChartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                      <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                      <YAxis stroke="#64748b" domain={[0, 30]} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          border: '1px solid #334155',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Bar dataKey="MST1" fill="#6366f1" name="MST-1 (Out of 30)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="MST2" fill="#ef4444" name="MST-2 (Out of 30)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Table of drops */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {student.mstScores.map((score) => (
                  <div
                    key={score.courseCode}
                    className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-mono text-xs font-semibold text-slate-200">{score.courseCode}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[150px]">{score.courseName}</div>
                      <div className="text-xs font-mono text-slate-300 mt-1">
                        MST1: {score.mst1} → MST2: {score.mst2}
                      </div>
                    </div>
                    <div
                      className={`font-mono text-xs font-bold px-2 py-1 rounded border ${
                        score.dropPct > 30
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      -{score.dropPct}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'interventions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <History className="w-4 h-4 text-purple-400" />
                    Intervention Audit Log & Action History
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Official trail of faculty mentor assignments, counseling referrals, and attendance grace waivers.
                  </p>
                </div>
                <button
                  onClick={() => onTriggerIntervention(student)}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  + Log Action
                </button>
              </div>

              {student.interventionHistory.length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-slate-900/40 border border-slate-800 text-slate-400 text-xs">
                  No interventions logged yet for {student.name}. Use the "Take Intervention Action" button above to initiate early retention steps.
                </div>
              ) : (
                <div className="space-y-3">
                  {student.interventionHistory.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col md:flex-row md:items-start justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-slate-200">{item.title}</span>
                          <span
                            className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded font-bold ${
                              item.status === 'COMPLETED'
                                ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                                : 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">{item.notes}</p>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1 font-mono">
                          <span>Logged by: {item.advisorName}</span>
                          {item.targetMetric && (
                            <>
                              <span>•</span>
                              <span className="text-indigo-300">{item.targetMetric}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xs font-mono text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {item.date}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-500" />
              {student.phone}
            </span>
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-500" />
              {student.email}
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition font-medium"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
