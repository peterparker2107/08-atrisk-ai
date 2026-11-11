import { useState, useEffect } from 'react';
import type { Student, Intervention, SimulationParams } from './types/student';
import { INITIAL_STUDENTS } from './data/studentsData';
import { calculateRiskAssessment } from './lib/riskEngine';
import { Header } from './components/Header';
import { StudentTriageList } from './components/StudentTriageList';
import { CohortAnalyticsView } from './components/CohortAnalyticsView';
import { SimulatorSandboxView } from './components/SimulatorSandboxView';
import { StudentDossierModal } from './components/StudentDossierModal';
import { InterventionModal } from './components/InterventionModal';
import { CheckCircle2 } from 'lucide-react';

export function App() {
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [activeView, setActiveView] = useState<'triage' | 'analytics' | 'simulator'>('triage');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [interventionStudent, setInterventionStudent] = useState<Student | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Light Mode default, Dark Mode toggle
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('atrisk_theme') === 'dark';
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('atrisk_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('atrisk_theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleAddIntervention = (studentId: string, intervention: Intervention) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          return {
            ...s,
            status: 'UNDER_INTERVENTION',
            interventionHistory: [intervention, ...s.interventionHistory],
          };
        }
        return s;
      })
    );

    // If current selected student is open in dossier, update it
    if (selectedStudent && selectedStudent.id === studentId) {
      setSelectedStudent((prev) =>
        prev
          ? {
              ...prev,
              status: 'UNDER_INTERVENTION',
              interventionHistory: [intervention, ...prev.interventionHistory],
            }
          : null
      );
    }

    showToast(`✅ Intervention dispatched for student! Action logged in Webkiosk.`);
  };

  const handleCommitSimulationPlan = (
    studentId: string,
    params: SimulationParams,
    newScore: number
  ) => {
    const recoveryIntervention: Intervention = {
      id: `plan-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type: 'ACADEMIC_REMEDIAL',
      title: 'Counterfactual Recovery Contract Committed',
      notes: `Target: Attend ${params.additionalTutorials} tutorial classes, finish ${params.lmsModulesCompleted} LMS catch-ups, and complete ${params.peerTutoringHours} peer mentoring hours. Projected risk score: ${newScore}%.`,
      status: 'SCHEDULED',
      advisorName: 'Department Academic Advisor',
      targetMetric: `Target Score: ${newScore}%`,
    };

    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          return {
            ...s,
            status: 'RECOVERING',
            interventionHistory: [recoveryIntervention, ...s.interventionHistory],
          };
        }
        return s;
      })
    );

    if (selectedStudent && selectedStudent.id === studentId) {
      setSelectedStudent((prev) =>
        prev
          ? {
              ...prev,
              status: 'RECOVERING',
              interventionHistory: [recoveryIntervention, ...prev.interventionHistory],
            }
          : null
      );
    }

    showToast(`🎯 Recovery plan committed! Target risk score locked at ${newScore}%.`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0d14] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Navbar */}
      <Header
        activeView={activeView}
        setActiveView={setActiveView}
        students={students}
        isDark={isDark}
        onToggleTheme={toggleTheme}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-6">
        {activeView === 'triage' && (
          <StudentTriageList
            students={students}
            onSelectStudent={(s) => setSelectedStudent(s)}
            onOpenSimulator={(s) => {
              setSelectedStudent(s);
            }}
            onTriggerIntervention={(s) => setInterventionStudent(s)}
          />
        )}

        {activeView === 'analytics' && (
          <CohortAnalyticsView
            students={students}
            onSelectStudent={(s) => setSelectedStudent(s)}
          />
        )}

        {activeView === 'simulator' && (
          <SimulatorSandboxView
            students={students}
            onSelectStudent={(s) => setSelectedStudent(s)}
            onCommitPlan={handleCommitSimulationPlan}
          />
        )}
      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-white dark:bg-indigo-950 border border-indigo-300 dark:border-indigo-500/50 text-indigo-900 dark:text-indigo-100 shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <div className="text-xs font-semibold">{toastMessage}</div>
        </div>
      )}

      {/* Full Student Dossier Modal */}
      {selectedStudent && (
        <StudentDossierModal
          student={selectedStudent}
          assessment={calculateRiskAssessment(selectedStudent)}
          isOpen={!!selectedStudent}
          onClose={() => setSelectedStudent(null)}
          onTriggerIntervention={(s) => {
            setInterventionStudent(s);
          }}
          onCommitSimulationPlan={handleCommitSimulationPlan}
        />
      )}

      {/* 1-Click Trigger Intervention Modal */}
      {interventionStudent && (
        <InterventionModal
          student={interventionStudent}
          isOpen={!!interventionStudent}
          onClose={() => setInterventionStudent(null)}
          onAddIntervention={handleAddIntervention}
        />
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090b10] py-6 text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>AtRisk AI • Thapar Institute of Engineering &amp; Technology (TIET Patiala)</span>
          </div>
          <div>TIET Campus Platform • Zero External API Keys • 100% Client-Side Real-Time Inference</div>
        </div>
      </footer>
    </div>
  );
}

export default App;
