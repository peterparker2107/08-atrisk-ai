import React, { useState } from 'react';
import type { Student, SimulationParams } from '../types/student';
import { simulateRecovery } from '../lib/riskEngine';
import {
  Sliders,
  Sparkles,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  GraduationCap,
  CalendarCheck,
  Award,
  DollarSign,
  FileBadge,
} from 'lucide-react';

interface RecoverySimulatorProps {
  student: Student;
  onCommitPlan?: (simParams: SimulationParams, newScore: number) => void;
}

export const RecoverySimulator: React.FC<RecoverySimulatorProps> = ({
  student,
  onCommitPlan,
}) => {
  const defaultParams: SimulationParams = {
    additionalTutorials: 4,
    lmsModulesCompleted: 3,
    peerTutoringHours: 8,
    remedialExamTargetScore: 21,
    feeInstallmentApproved: student.feeStatus !== 'PAID',
    medicalGraceApproved: false,
  };

  const [params, setParams] = useState<SimulationParams>(defaultParams);
  const [committed, setCommitted] = useState<boolean>(false);

  const simulation = simulateRecovery(student, params);

  const handleReset = () => {
    setParams({
      additionalTutorials: 0,
      lmsModulesCompleted: 0,
      peerTutoringHours: 0,
      remedialExamTargetScore: 15,
      feeInstallmentApproved: false,
      medicalGraceApproved: false,
    });
    setCommitted(false);
  };

  const handleApplyPreset = (preset: 'moderate' | 'aggressive') => {
    if (preset === 'moderate') {
      setParams({
        additionalTutorials: 4,
        lmsModulesCompleted: 2,
        peerTutoringHours: 6,
        remedialExamTargetScore: 19,
        feeInstallmentApproved: student.feeStatus !== 'PAID',
        medicalGraceApproved: false,
      });
    } else {
      setParams({
        additionalTutorials: 8,
        lmsModulesCompleted: 5,
        peerTutoringHours: 14,
        remedialExamTargetScore: 25,
        feeInstallmentApproved: true,
        medicalGraceApproved: true,
      });
    }
    setCommitted(false);
  };

  const handleCommit = () => {
    setCommitted(true);
    if (onCommitPlan) {
      onCommitPlan(params, simulation.newScore);
    }
  };

  return (
    <div className="space-y-6">
      {/* Simulator Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/20">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-semibold text-slate-100">
              Interactive "What-If" Recovery Simulator
            </h3>
            <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono font-medium">
              Live Counterfactual Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Simulate the exact behavioral shifts needed to pull {student.name.split(' ')[0]} out of the detention zone before EST list freeze.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => handleApplyPreset('moderate')}
            className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            Realistic Goal
          </button>
          <button
            onClick={() => handleApplyPreset('aggressive')}
            className="text-xs px-2.5 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-200 border border-indigo-500/30 transition flex items-center gap-1 font-medium"
          >
            <Sparkles className="w-3.5 h-3.5" /> High Intensive
          </button>
          <button
            onClick={handleReset}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition"
            title="Reset to 0"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Comparison Scoreboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Original Status */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Current Status</span>
            <span className="font-mono">{student.rollNo}</span>
          </div>
          <div className="my-3">
            <div className="text-3xl font-mono font-extrabold text-rose-400">
              {simulation.originalScore}%
            </div>
            <div className="text-xs text-rose-300 font-medium mt-0.5 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              {simulation.originalRiskLevel} Academic Risk
            </div>
          </div>
          <div className="pt-2 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>Attendance:</span>
            <span className="font-mono text-slate-200 font-semibold">{student.attendancePct}%</span>
          </div>
        </div>

        {/* Middle Transformation Badge */}
        <div className="p-4 rounded-xl bg-gradient-to-b from-indigo-950/30 to-slate-900 border border-indigo-500/30 flex flex-col items-center justify-center text-center">
          <div className="text-[11px] font-medium text-indigo-300 uppercase tracking-wider">
            Simulated Risk Delta
          </div>
          <div className="my-2 flex items-center gap-2 text-2xl font-mono font-black text-emerald-400">
            <span>-{simulation.scoreDelta}%</span>
            <ArrowRight className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="text-xs text-slate-300 font-medium px-2 py-1 rounded bg-slate-800/80 border border-slate-700/60">
            Feasibility:{' '}
            <span className={simulation.recoveryFeasibility === 'HIGH' ? 'text-emerald-400' : 'text-amber-400'}>
              {simulation.recoveryFeasibility}
            </span>
          </div>
        </div>

        {/* Projected Future Status */}
        <div
          className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
            simulation.newRiskLevel === 'LOW'
              ? 'bg-emerald-950/20 border-emerald-500/40 shadow-glow-emerald'
              : simulation.newRiskLevel === 'MODERATE'
              ? 'bg-amber-950/20 border-amber-500/40 shadow-glow-amber'
              : 'bg-rose-950/20 border-rose-500/40 shadow-glow-red'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Projected Outcome</span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
              Counterfactual
            </span>
          </div>
          <div className="my-3">
            <div
              className={`text-3xl font-mono font-extrabold ${
                simulation.newRiskLevel === 'LOW'
                  ? 'text-emerald-400'
                  : simulation.newRiskLevel === 'MODERATE'
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {simulation.newScore}%
            </div>
            <div className="text-xs font-medium mt-0.5 flex items-center gap-1.5 text-slate-300">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              {simulation.newRiskLevel} Risk Tier
            </div>
          </div>
          <div className="pt-2 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>Simulated Attendance:</span>
            <span
              className={`font-mono font-bold ${
                simulation.simulatedAttendancePct >= 75 ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {simulation.simulatedAttendancePct}% {simulation.simulatedAttendancePct >= 75 ? '✅ (Cleared)' : '⚠️'}
            </span>
          </div>
        </div>
      </div>

      {/* EST Detention Gate Status Alert */}
      <div
        className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
          simulation.detentionAverted
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-200'
        }`}
      >
        <div className="flex items-center gap-2.5">
          {simulation.detentionAverted ? (
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 font-bold">
              ✓
            </div>
          ) : (
            <div className="w-7 h-7 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400 shrink-0 font-bold">
              !
            </div>
          )}
          <div>
            <div className="font-semibold text-sm">
              {simulation.detentionAverted
                ? 'EST Exam Debarment Averted'
                : 'Detention Risk Still Active (< 75% Cutoff)'}
            </div>
            <div className="text-slate-300 mt-0.5">{simulation.projectedOutcome}</div>
          </div>
        </div>
      </div>

      {/* Interactive Sliders Section */}
      <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-6">
        <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <CalendarCheck className="w-4 h-4 text-indigo-400" />
          <span>Advisor Action Levers & Recovery Levers</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Lever 1: Additional Tutorial Sessions */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="additional-tutorials-slider" className="font-medium text-slate-200 flex items-center gap-1.5 cursor-pointer">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                Attend Next N Tutorial / Make-up Classes
              </label>
              <span className="font-mono text-indigo-300 font-bold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                +{params.additionalTutorials} Classes
              </span>
            </div>
            <input
              id="additional-tutorials-slider"
              type="range"
              min="0"
              max="12"
              step="1"
              value={params.additionalTutorials}
              onChange={(e) => setParams({ ...params, additionalTutorials: parseInt(e.target.value) })}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0 (No change)</span>
              <span>6 classes (+10.5% att)</span>
              <span>12 classes (+21% att)</span>
            </div>
          </div>

          {/* Lever 2: LMS Remedial Modules Submitted */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="lms-modules-slider" className="font-medium text-slate-200 flex items-center gap-1.5 cursor-pointer">
                <FileBadge className="w-3.5 h-3.5 text-indigo-400" />
                Complete LMS Catch-up Modules / Quizzes
              </label>
              <span className="font-mono text-indigo-300 font-bold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                {params.lmsModulesCompleted} Modules
              </span>
            </div>
            <input
              id="lms-modules-slider"
              type="range"
              min="0"
              max="6"
              step="1"
              value={params.lmsModulesCompleted}
              onChange={(e) => setParams({ ...params, lmsModulesCompleted: parseInt(e.target.value) })}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0 modules</span>
              <span>3 modules</span>
              <span>6 modules (Max)</span>
            </div>
          </div>

          {/* Lever 3: Senior Peer Tutoring Hours */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="peer-tutoring-slider" className="font-medium text-slate-200 flex items-center gap-1.5 cursor-pointer">
                <Award className="w-3.5 h-3.5 text-indigo-400" />
                Hostel / Library Peer Tutoring Hours
              </label>
              <span className="font-mono text-indigo-300 font-bold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                {params.peerTutoringHours} Hours
              </span>
            </div>
            <input
              id="peer-tutoring-slider"
              type="range"
              min="0"
              max="20"
              step="2"
              value={params.peerTutoringHours}
              onChange={(e) => setParams({ ...params, peerTutoringHours: parseInt(e.target.value) })}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0 hrs</span>
              <span>10 hrs</span>
              <span>20 hrs</span>
            </div>
          </div>

          {/* Lever 4: Target Score in Remedial Quiz / Retest */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="remedial-exam-slider" className="font-medium text-slate-200 flex items-center gap-1.5 cursor-pointer">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Target Score in Make-up Continuous Assessment
              </label>
              <span className="font-mono text-indigo-300 font-bold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                {params.remedialExamTargetScore} / 30 marks
              </span>
            </div>
            <input
              id="remedial-exam-slider"
              type="range"
              min="10"
              max="30"
              step="1"
              value={params.remedialExamTargetScore}
              onChange={(e) => setParams({ ...params, remedialExamTargetScore: parseInt(e.target.value) })}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>10 marks</span>
              <span>20 marks</span>
              <span>30 marks</span>
            </div>
          </div>
        </div>

        {/* Toggle Switches */}
        <div className="pt-4 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/40 border border-slate-700/50 cursor-pointer hover:bg-slate-800/60 transition">
            <input
              type="checkbox"
              checked={params.feeInstallmentApproved}
              onChange={(e) => setParams({ ...params, feeInstallmentApproved: e.target.checked })}
              className="mt-0.5 w-4 h-4 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-900"
            />
            <div>
              <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                Approve Fee Installment / Hardship Waiver
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Eliminates financial hold on EST hall ticket & relieves dropout anxiety (-12% risk).
              </div>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/40 border border-slate-700/50 cursor-pointer hover:bg-slate-800/60 transition">
            <input
              type="checkbox"
              checked={params.medicalGraceApproved}
              onChange={(e) => setParams({ ...params, medicalGraceApproved: e.target.checked })}
              className="mt-0.5 w-4 h-4 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-900"
            />
            <div>
              <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <FileBadge className="w-3.5 h-3.5 text-emerald-400" />
                Approve Medical / Sports Grace Attendance
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Applies standard TIET 6% grace credit for documented health/events (-10% risk).
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="text-xs text-slate-400">
          This counterfactual scenario can be exported and converted into a binding academic recovery contract.
        </div>

        <button
          onClick={handleCommit}
          className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all ${
            committed
              ? 'bg-emerald-600 text-white shadow-glow-emerald'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
          }`}
        >
          {committed ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Recovery Contract Locked!
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Commit Simulation to Student Action Plan
            </>
          )}
        </button>
      </div>
    </div>
  );
};
