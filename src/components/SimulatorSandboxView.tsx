import React, { useState } from 'react';
import type { Student, SimulationParams } from '../types/student';
import { calculateRiskAssessment } from '../lib/riskEngine';
import { RecoverySimulator } from './RecoverySimulator';
import { RiskBadge } from './RiskBadge';
import { Sliders } from 'lucide-react';

interface SimulatorSandboxViewProps {
  students: Student[];
  onCommitPlan: (studentId: string, params: SimulationParams, newScore: number) => void;
  onSelectStudent: (student: Student) => void;
}

export const SimulatorSandboxView: React.FC<SimulatorSandboxViewProps> = ({
  students,
  onCommitPlan,
  onSelectStudent,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');

  const currentStudent = students.find((s) => s.id === selectedStudentId) || students[0];
  const assessment = calculateRiskAssessment(currentStudent);

  return (
    <div className="space-y-6">
      {/* Sandbox Selector Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-slate-100">
              Interactive Advisor Counterfactual Studio
            </h3>
            <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
              Actionable Retention Modeling
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Test recovery scenarios with live feedback on EST examination eligibility, attendance recovery, and risk score reduction.
          </p>
        </div>

        {/* Student Selector */}
        <div className="flex items-center gap-3">
          <label htmlFor="student-picker-select" className="text-xs text-slate-400 font-medium shrink-0 cursor-pointer">
            Select Student:
          </label>
          <select
            id="student-picker-select"
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="bg-slate-950 border border-indigo-500/40 text-slate-100 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 min-w-[260px]"
          >
            {students.map((s) => {
              const a = calculateRiskAssessment(s);
              return (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.rollNo} • {s.branchCode}) — {a.overallScore}% Risk
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Selected Student Profile Summary */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img
            src={currentStudent.avatarUrl}
            alt={currentStudent.name}
            className="w-12 h-12 rounded-xl object-cover border border-slate-700"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white">{currentStudent.name}</span>
              <span className="font-mono text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                {currentStudent.rollNo}
              </span>
              <RiskBadge score={assessment.overallScore} level={assessment.riskLevel} size="sm" />
            </div>
            <div className="text-xs text-slate-400 mt-0.5 font-sans">
              {currentStudent.branch} • Semester {currentStudent.semester} • {currentStudent.hostel}
            </div>
          </div>
        </div>

        <button
          onClick={() => onSelectStudent(currentStudent)}
          className="text-xs px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
        >
          Open Full Dossier →
        </button>
      </div>

      {/* Embedded Simulator */}
      <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80">
        <RecoverySimulator
          student={currentStudent}
          onCommitPlan={(params, newScore) => onCommitPlan(currentStudent.id, params, newScore)}
        />
      </div>
    </div>
  );
};
