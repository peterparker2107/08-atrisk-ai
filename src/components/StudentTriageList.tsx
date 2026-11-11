import React, { useState, useMemo } from 'react';
import type { Student } from '../types/student';
import { calculateRiskAssessment } from '../lib/riskEngine';
import { RiskBadge } from './RiskBadge';
import {
  Search,
  SlidersHorizontal,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Sliders,
  Sparkles,
  TrendingDown,
  LayoutGrid,
  List,
  Filter,
  ShieldAlert,
  DollarSign,
  Flame,
} from 'lucide-react';

interface StudentTriageListProps {
  students: Student[];
  onSelectStudent: (student: Student) => void;
  onOpenSimulator: (student: Student) => void;
  onTriggerIntervention: (student: Student) => void;
}

export const StudentTriageList: React.FC<StudentTriageListProps> = ({
  students,
  onSelectStudent,
  onOpenSimulator,
  onTriggerIntervention,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<string>('ALL');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>('ALL');
  const [selectedSort, setSelectedSort] = useState<'risk' | 'attendance' | 'inactivity' | 'backlogs'>('risk');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Compute assessments for all students
  const studentsWithRisk = useMemo(() => {
    return students.map((student) => ({
      student,
      assessment: calculateRiskAssessment(student),
    }));
  }, [students]);

  // Filter and sort
  const filteredStudents = useMemo(() => {
    return studentsWithRisk
      .filter(({ student, assessment }) => {
        // Search query
        const query = searchQuery.toLowerCase();
        const matchesQuery =
          student.name.toLowerCase().includes(query) ||
          student.rollNo.toLowerCase().includes(query) ||
          student.branch.toLowerCase().includes(query) ||
          student.hostel.toLowerCase().includes(query);

        if (!matchesQuery) return false;

        // Risk level filter
        if (selectedRiskFilter === 'CRITICAL' && assessment.riskLevel !== 'CRITICAL') return false;
        if (selectedRiskFilter === 'MODERATE' && assessment.riskLevel !== 'MODERATE') return false;
        if (selectedRiskFilter === 'LOW' && assessment.riskLevel !== 'LOW') return false;
        if (selectedRiskFilter === 'DETENTION' && !assessment.isEstDetentionImminent) return false;
        if (selectedRiskFilter === 'FEE' && student.feeStatus !== 'OVERDUE') return false;
        if (selectedRiskFilter === 'BACKLOGS' && student.backlogsCount === 0) return false;

        // Branch filter
        if (selectedBranchFilter !== 'ALL' && student.branchCode !== selectedBranchFilter) return false;

        return true;
      })
      .sort((a, b) => {
        if (selectedSort === 'risk') {
          return b.assessment.overallScore - a.assessment.overallScore;
        } else if (selectedSort === 'attendance') {
          return a.student.attendancePct - b.student.attendancePct;
        } else if (selectedSort === 'inactivity') {
          return b.student.lmsInactivityDays - a.student.lmsInactivityDays;
        } else if (selectedSort === 'backlogs') {
          return b.student.backlogsCount - a.student.backlogsCount;
        }
        return 0;
      });
  }, [studentsWithRisk, searchQuery, selectedRiskFilter, selectedBranchFilter, selectedSort]);

  // Counts for tabs
  const criticalCount = studentsWithRisk.filter((s) => s.assessment.riskLevel === 'CRITICAL').length;
  const moderateCount = studentsWithRisk.filter((s) => s.assessment.riskLevel === 'MODERATE').length;
  const lowCount = studentsWithRisk.filter((s) => s.assessment.riskLevel === 'LOW').length;
  const detentionThreatCount = studentsWithRisk.filter((s) => s.assessment.isEstDetentionImminent).length;
  const feeOverdueCount = students.filter((s) => s.feeStatus === 'OVERDUE').length;
  const underInterventionCount = students.filter((s) => s.status === 'UNDER_INTERVENTION' || s.status === 'RECOVERING').length;

  return (
    <div className="space-y-6">
      {/* Bento Grid KPI Stat Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Tile 1: Critical Attention */}
        <button
          type="button"
          onClick={() => setSelectedRiskFilter(selectedRiskFilter === 'CRITICAL' ? 'ALL' : 'CRITICAL')}
          className={`p-4 rounded-2xl text-left transition-all duration-200 border relative overflow-hidden group ${
            selectedRiskFilter === 'CRITICAL'
              ? 'bg-rose-950/40 border-rose-500/70 shadow-lg shadow-rose-950/40 ring-1 ring-rose-500/40'
              : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800/80 hover:border-rose-500/40'
          }`}
        >
          <div className="flex items-center justify-between text-rose-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-300">Critical Tier</span>
            <Flame className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-mono font-bold text-white tracking-tight flex items-baseline gap-1.5">
            {criticalCount}
            <span className="text-[11px] font-sans font-normal text-rose-300/80">urgent</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">Immediate advisor outreach</p>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-rose-500 to-rose-400 opacity-80" />
        </button>

        {/* Tile 2: EST Detention Threats */}
        <button
          type="button"
          onClick={() => setSelectedRiskFilter(selectedRiskFilter === 'DETENTION' ? 'ALL' : 'DETENTION')}
          className={`p-4 rounded-2xl text-left transition-all duration-200 border relative overflow-hidden group ${
            selectedRiskFilter === 'DETENTION'
              ? 'bg-rose-950/40 border-rose-500/70 shadow-lg shadow-rose-950/40 ring-1 ring-rose-500/40'
              : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800/80 hover:border-rose-500/40'
          }`}
        >
          <div className="flex items-center justify-between text-amber-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-300">EST Debarment</span>
            <AlertTriangle className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-mono font-bold text-white tracking-tight flex items-baseline gap-1.5">
            {detentionThreatCount}
            <span className="text-[11px] font-sans font-normal text-amber-300/80">&lt;75% att</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">Reg §4.2 Hall ticket freeze</p>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 to-rose-500 opacity-80" />
        </button>

        {/* Tile 3: Moderate Risk Watchlist */}
        <button
          type="button"
          onClick={() => setSelectedRiskFilter(selectedRiskFilter === 'MODERATE' ? 'ALL' : 'MODERATE')}
          className={`p-4 rounded-2xl text-left transition-all duration-200 border relative overflow-hidden group ${
            selectedRiskFilter === 'MODERATE'
              ? 'bg-amber-950/30 border-amber-500/60 shadow-lg shadow-amber-950/30 ring-1 ring-amber-500/40'
              : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800/80 hover:border-amber-500/40'
          }`}
        >
          <div className="flex items-center justify-between text-amber-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-300">Watchlist</span>
            <AlertCircle className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-mono font-bold text-white tracking-tight flex items-baseline gap-1.5">
            {moderateCount}
            <span className="text-[11px] font-sans font-normal text-amber-300/80">at-risk</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">MST drops & inactivity</p>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 to-amber-600 opacity-80" />
        </button>

        {/* Tile 4: Stable Trajectory */}
        <button
          type="button"
          onClick={() => setSelectedRiskFilter(selectedRiskFilter === 'LOW' ? 'ALL' : 'LOW')}
          className={`p-4 rounded-2xl text-left transition-all duration-200 border relative overflow-hidden group ${
            selectedRiskFilter === 'LOW'
              ? 'bg-emerald-950/30 border-emerald-500/60 shadow-lg shadow-emerald-950/30 ring-1 ring-emerald-500/40'
              : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800/80 hover:border-emerald-500/40'
          }`}
        >
          <div className="flex items-center justify-between text-emerald-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-300">Stable Safe</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-mono font-bold text-white tracking-tight flex items-baseline gap-1.5">
            {lowCount}
            <span className="text-[11px] font-sans font-normal text-emerald-300/80">cleared</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">Compliant attendance</p>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-400 opacity-80" />
        </button>

        {/* Tile 5: Under Active Intervention */}
        <button
          type="button"
          onClick={() => setSelectedRiskFilter(selectedRiskFilter === 'FEE' ? 'ALL' : 'FEE')}
          className={`p-4 rounded-2xl text-left transition-all duration-200 border relative overflow-hidden group col-span-2 md:col-span-1 ${
            selectedRiskFilter === 'FEE'
              ? 'bg-purple-950/30 border-purple-500/60 shadow-lg shadow-purple-950/30 ring-1 ring-purple-500/40'
              : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800/80 hover:border-purple-500/40'
          }`}
        >
          <div className="flex items-center justify-between text-purple-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-300">Fee Arrears</span>
            <DollarSign className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-mono font-bold text-white tracking-tight flex items-baseline gap-1.5">
            {feeOverdueCount}
            <span className="text-[11px] font-sans font-normal text-purple-300/80">overdue</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">Active plans: {underInterventionCount}</p>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-indigo-500 opacity-80" />
        </button>
      </div>
      {/* Search, Filter & Controls Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, roll no, branch, hostel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-950/70 border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
              >
                Clear
              </button>
            )}
          </div>

          {/* Branch & Sort Controls */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
            {/* Branch dropdown */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Filter className="w-3.5 h-3.5" />
              <select
                value={selectedBranchFilter}
                onChange={(e) => setSelectedBranchFilter(e.target.value)}
                className="bg-slate-950/70 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">All Branches</option>
                <option value="ME">Mechanical (ME)</option>
                <option value="CIE">Civil (CIE)</option>
                <option value="CHE">Chemical (CHE)</option>
                <option value="ECE">Electronics (ECE)</option>
                <option value="COE">Computer (COE)</option>
                <option value="MEC">Mechatronics (MEC)</option>
                <option value="BT">Biotechnology (BT)</option>
                <option value="EIC">Electrical & Inst (EIC)</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value as any)}
                className="bg-slate-950/70 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="risk">Highest Risk Score</option>
                <option value="attendance">Lowest Attendance %</option>
                <option value="inactivity">LMS Inactivity (Days)</option>
                <option value="backlogs">Most Backlogs</option>
              </select>
            </div>

            {/* Grid vs Table View Switch */}
            <div className="flex items-center bg-slate-950/70 border border-slate-800 rounded-xl p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Grid Cards"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'table' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Compact Table"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/60">
          <button
            onClick={() => setSelectedRiskFilter('ALL')}
            className={`text-xs px-3 py-1 rounded-lg font-medium transition ${
              selectedRiskFilter === 'ALL'
                ? 'bg-slate-700 text-white shadow-sm'
                : 'bg-slate-800/40 text-slate-400 hover:text-slate-200'
            }`}
          >
            All Students ({students.length})
          </button>

          <button
            onClick={() => setSelectedRiskFilter('CRITICAL')}
            className={`text-xs px-3 py-1 rounded-lg font-medium transition flex items-center gap-1.5 ${
              selectedRiskFilter === 'CRITICAL'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold'
                : 'bg-rose-950/20 text-rose-400 hover:bg-rose-950/40 border border-rose-900/30'
            }`}
          >
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            Critical Tier ({criticalCount})
          </button>

          <button
            onClick={() => setSelectedRiskFilter('DETENTION')}
            className={`text-xs px-3 py-1 rounded-lg font-medium transition flex items-center gap-1.5 ${
              selectedRiskFilter === 'DETENTION'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold'
                : 'bg-slate-800/40 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            EST Detention Risk ({detentionThreatCount})
          </button>

          <button
            onClick={() => setSelectedRiskFilter('MODERATE')}
            className={`text-xs px-3 py-1 rounded-lg font-medium transition flex items-center gap-1.5 ${
              selectedRiskFilter === 'MODERATE'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                : 'bg-amber-950/20 text-amber-400 hover:bg-amber-950/40 border border-amber-900/30'
            }`}
          >
            <AlertCircle className="w-3 h-3 text-amber-400" />
            Moderate Risk ({moderateCount})
          </button>

          <button
            onClick={() => setSelectedRiskFilter('LOW')}
            className={`text-xs px-3 py-1 rounded-lg font-medium transition flex items-center gap-1.5 ${
              selectedRiskFilter === 'LOW'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                : 'bg-emerald-950/20 text-emerald-400 hover:bg-emerald-950/40 border border-emerald-900/30'
            }`}
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Stable ({lowCount})
          </button>

          <button
            onClick={() => setSelectedRiskFilter('BACKLOGS')}
            className={`text-xs px-3 py-1 rounded-lg font-medium transition ${
              selectedRiskFilter === 'BACKLOGS'
                ? 'bg-slate-700 text-white'
                : 'bg-slate-800/40 text-slate-400 hover:text-slate-200'
            }`}
          >
            Has Backlogs
          </button>

          <button
            onClick={() => setSelectedRiskFilter('FEE')}
            className={`text-xs px-3 py-1 rounded-lg font-medium transition ${
              selectedRiskFilter === 'FEE'
                ? 'bg-slate-700 text-white'
                : 'bg-slate-800/40 text-slate-400 hover:text-slate-200'
            }`}
          >
            Fee Overdue
          </button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map(({ student, assessment }) => {
            const isCritical = assessment.riskLevel === 'CRITICAL';
            const isModerate = assessment.riskLevel === 'MODERATE';
            const primaryDriver = assessment.shapFactors.find((f) => f.isRiskDriver);

            return (
              <div
                key={student.id}
                className={`relative rounded-2xl p-4 sm:p-5 transition-all duration-200 flex flex-col justify-between overflow-hidden ${
                  isCritical
                    ? 'bg-slate-900/95 border border-rose-500/40 hover:border-rose-500/70 shadow-xl shadow-rose-950/20'
                    : isModerate
                    ? 'bg-slate-900/90 border border-amber-500/35 hover:border-amber-500/60 shadow-lg shadow-amber-950/10'
                    : 'bg-slate-900/70 border border-slate-800/80 hover:border-emerald-500/40'
                }`}
              >
                {/* Top Risk Band Accent Strip */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 ${
                    isCritical
                      ? 'bg-gradient-to-r from-rose-500 via-rose-400 to-rose-600 shadow-glow-red'
                      : isModerate
                      ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600'
                      : 'bg-gradient-to-r from-emerald-500/70 via-emerald-400/70 to-emerald-600/70'
                  }`}
                />

                <div>
                  {/* Card Header: Avatar, Name, Risk Badge */}
                  <div className="flex items-start justify-between gap-3 pt-1">
                    <div className="flex items-center gap-3">
                      <img
                        src={student.avatarUrl}
                        alt={student.name}
                        className="w-11 h-11 rounded-xl object-cover border border-slate-700 shrink-0"
                      />
                      <div>
                        <h4
                          onClick={() => onSelectStudent(student)}
                          className="text-sm font-bold text-slate-100 hover:text-indigo-400 cursor-pointer transition line-clamp-1"
                        >
                          {student.name}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                          <span>{student.rollNo}</span>
                          <span>•</span>
                          <span className="text-slate-300 font-sans font-medium">{student.branchCode}</span>
                        </div>
                      </div>
                    </div>

                    <RiskBadge
                      score={assessment.overallScore}
                      level={assessment.riskLevel}
                      size="sm"
                      pulsing={isCritical}
                    />
                  </div>

                  {/* Attendance Bar with 75% Cutoff Marker */}
                  <div className="mt-4 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Classroom Attendance</span>
                      <span
                        className={`font-mono font-bold ${
                          student.attendancePct < 65
                            ? 'text-rose-400'
                            : student.attendancePct < 75
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {student.attendancePct}%
                      </span>
                    </div>

                    {/* Progress track with 75% vertical marker */}
                    <div className="relative h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      {/* 75% threshold guide line */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-rose-400 z-10"
                        style={{ left: '75%' }}
                        title="TIET 75% EST Cutoff"
                      />
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          student.attendancePct < 65
                            ? 'bg-rose-500'
                            : student.attendancePct < 75
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, student.attendancePct)}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>0%</span>
                      <span className="text-rose-400 font-semibold">75% EST Cutoff</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* Primary SHAP Attribution Snippet */}
                  <div className="mt-3.5 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 text-xs">
                    <div className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-500">
                      Primary Risk Driver (SHAP)
                    </div>
                    <div className="text-xs font-semibold text-rose-300 mt-0.5 line-clamp-1 flex items-center gap-1.5">
                      <TrendingDown className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      {primaryDriver ? primaryDriver.label : 'Normal Trajectory'}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                      {primaryDriver ? primaryDriver.explanation : 'No active alerts'}
                    </div>
                  </div>

                  {/* Badges strip (Backlogs, LMS Inactive, Fee Arrears) */}
                  <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px]">
                    {student.backlogsCount > 0 && (
                      <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 font-mono border border-rose-500/20 font-semibold">
                        {student.backlogsCount} {student.backlogsCount === 1 ? 'Backlog' : 'Backlogs'}
                      </span>
                    )}

                    {student.lmsInactivityDays >= 10 && (
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-mono border border-amber-500/20">
                        {student.lmsInactivityDays}d LMS Inactive
                      </span>
                    )}

                    {student.feeStatus === 'OVERDUE' && (
                      <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 font-mono border border-purple-500/20">
                        Fee ₹{(student.pendingFeeAmount / 1000).toFixed(0)}k Due
                      </span>
                    )}

                    {assessment.detentionRiskCount > 0 && (
                      <span className="px-2 py-0.5 rounded bg-rose-500/15 text-rose-300 font-medium border border-rose-500/30">
                        {assessment.detentionRiskCount} Sub Debarred
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onSelectStudent(student)}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium transition text-center"
                  >
                    View Dossier
                  </button>

                  <button
                    onClick={() => onOpenSimulator(student)}
                    className="py-1.5 px-2.5 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1 transition"
                    title="Interactive What-If Recovery Simulator"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    What-If
                  </button>

                  <button
                    onClick={() => onTriggerIntervention(student)}
                    className="py-1.5 px-2.5 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-bold flex items-center gap-1 transition shadow-sm"
                    title="Dispatch Intervention Action"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Action
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-mono uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5">Student / Roll</th>
                  <th className="p-3.5">Branch</th>
                  <th className="p-3.5">Risk Score</th>
                  <th className="p-3.5">Attendance</th>
                  <th className="p-3.5">EST Status</th>
                  <th className="p-3.5">Backlogs</th>
                  <th className="p-3.5">LMS Inactivity</th>
                  <th className="p-3.5">Fee Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredStudents.map(({ student, assessment }) => (
                  <tr
                    key={student.id}
                    className="hover:bg-slate-800/40 transition group cursor-pointer"
                    onClick={() => onSelectStudent(student)}
                  >
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={student.avatarUrl}
                          alt={student.name}
                          className="w-8 h-8 rounded-lg object-cover border border-slate-700 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-slate-200 group-hover:text-indigo-400 transition">
                            {student.name}
                          </div>
                          <div className="text-[11px] font-mono text-slate-400">{student.rollNo}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-medium text-slate-300">{student.branchCode}</div>
                      <div className="text-[11px] text-slate-500">Yr {student.year}</div>
                    </td>
                    <td className="p-3.5">
                      <RiskBadge score={assessment.overallScore} level={assessment.riskLevel} size="sm" />
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`font-mono font-bold ${
                          student.attendancePct < 65
                            ? 'text-rose-400'
                            : student.attendancePct < 75
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {student.attendancePct}%
                      </span>
                    </td>
                    <td className="p-3.5">
                      {assessment.detentionRiskCount > 0 ? (
                        <span className="text-rose-400 font-semibold flex items-center gap-1 font-mono">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          {assessment.detentionRiskCount} Debarred
                        </span>
                      ) : (
                        <span className="text-emerald-400 flex items-center gap-1 font-mono">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Cleared
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 font-mono">
                      {student.backlogsCount > 0 ? (
                        <span className="text-rose-400 font-bold">{student.backlogsCount}</span>
                      ) : (
                        <span className="text-slate-500">0</span>
                      )}
                    </td>
                    <td className="p-3.5 font-mono text-slate-300">{student.lmsInactivityDays} days</td>
                    <td className="p-3.5 font-mono">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] ${
                          student.feeStatus === 'OVERDUE'
                            ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                            : student.feeStatus === 'PARTIAL'
                            ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                        }`}
                      >
                        {student.feeStatus}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onOpenSimulator(student)}
                        className="p-1.5 rounded-lg bg-indigo-500/15 text-indigo-300 hover:bg-indigo-500/30 transition"
                        title="What-If Simulator"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onTriggerIntervention(student)}
                        className="p-1.5 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 transition"
                        title="Intervention"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredStudents.length === 0 && (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400 text-sm">
          No students match the current filter or search criteria.
        </div>
      )}
    </div>
  );
};
