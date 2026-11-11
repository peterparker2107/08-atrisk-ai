import React from 'react';
import {
  ShieldAlert,
  Download,
  Users,
  BarChart3,
  Sliders,
  Sun,
  Moon,
} from 'lucide-react';
import type { Student } from '../types/student';

interface HeaderProps {
  activeView: 'triage' | 'analytics' | 'simulator';
  setActiveView: (view: 'triage' | 'analytics' | 'simulator') => void;
  students: Student[];
  isDark: boolean;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  setActiveView,
  students,
  isDark,
  onToggleTheme,
}) => {
  const handleExportCSV = () => {
    const headers = [
      'Roll No',
      'Name',
      'Branch',
      'Year',
      'Attendance %',
      'Backlogs',
      'LMS Inactivity (Days)',
      'Fee Status',
      'Pending Fee (INR)',
      'Hostel',
      'Status',
    ];

    const rows = students.map((s) => [
      s.rollNo,
      `"${s.name}"`,
      `"${s.branch}"`,
      s.year,
      s.attendancePct,
      s.backlogsCount,
      s.lmsInactivityDays,
      s.feeStatus,
      s.pendingFeeAmount,
      `"${s.hostel}"`,
      s.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TIET_AtRisk_Cohort_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-[#0a0d14]/90 backdrop-blur-md sticky top-0 z-40 transition-colors duration-200">
      {/* Emergency Alert Ticker */}
      <div className="bg-gradient-to-r from-rose-100 via-slate-50 to-rose-100 dark:from-rose-950/80 dark:via-slate-900 dark:to-rose-950/80 border-b border-rose-300 dark:border-rose-500/20 px-4 py-1.5 text-xs text-rose-800 dark:text-rose-300 flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0" />
          <span className="font-bold text-[11px] uppercase tracking-wider text-rose-700 dark:text-rose-400 bg-rose-200/60 dark:bg-rose-500/20 px-1.5 py-0.5 rounded border border-rose-300 dark:border-rose-500/30">
            EST Early Warning Alert
          </span>
          <span className="truncate text-slate-700 dark:text-slate-300">
            14 days until End Semester (EST) Exam debarment list freeze — Advisors must review students below 75% attendance threshold.
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-2 shrink-0 font-mono text-[11px] text-slate-500 dark:text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Webkiosk LMS Sync Active</span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-rose-900/30 border border-white/10 shrink-0">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                AtRisk <span className="text-rose-500 dark:text-rose-400 font-mono">AI</span>
              </h1>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 font-bold">
                TIET Retention Triage
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              "Find Students Before They Give Up" • Academic &amp; Behavioral Early Warning
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-1 gap-1 self-start md:self-center">
          <button
            onClick={() => setActiveView('triage')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeView === 'triage'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Triage Grid
          </button>

          <button
            onClick={() => setActiveView('analytics')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeView === 'analytics'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Cohort Analytics
          </button>

          <button
            onClick={() => setActiveView('simulator')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeView === 'simulator'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Recovery Simulator
          </button>
        </div>

        {/* Quick Actions & Theme Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
            title="Export student triage report as CSV"
          >
            <Download className="w-3.5 h-3.5" />
            Export Triage CSV
          </button>

          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-amber-400 border border-slate-300 dark:border-slate-700 transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle Theme"
          >
            {isDark ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-slate-700" />
                <span className="hidden sm:inline">Dark</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
