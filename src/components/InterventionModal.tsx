import React, { useState } from 'react';
import type { Student, InterventionType, Intervention } from '../types/student';
import confetti from 'canvas-confetti';
import {
  X,
  Users,
  HeartHandshake,
  FileCheck2,
  PhoneCall,
  BookOpenCheck,
  CreditCard,
  CheckCircle2,
  Calendar,
  Send,
  Sparkles,
} from 'lucide-react';

interface InterventionModalProps {
  student: Student;
  isOpen: boolean;
  onClose: () => void;
  onAddIntervention: (studentId: string, intervention: Intervention) => void;
}

export const InterventionModal: React.FC<InterventionModalProps> = ({
  student,
  isOpen,
  onClose,
  onAddIntervention,
}) => {
  if (!isOpen) return null;

  const [selectedType, setSelectedType] = useState<InterventionType>('PEER_MENTOR');
  const [selectedMentor, setSelectedMentor] = useState<string>('Gurminder Singh (4th Yr Topper, ME - 9.12 CGPA)');
  const [targetDate, setTargetDate] = useState<string>('2026-11-20');
  const [notes, setNotes] = useState<string>(
    `Mandate 4 remedial tutorial classes in UME501 Machine Design and schedule twice-weekly hostel study sessions before EST detention freeze.`
  );
  const [advisorName, setAdvisorName] = useState<string>('Dr. S. K. Mohapatra (Academic Advisor)');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const interventionOptions: Array<{
    type: InterventionType;
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
  }> = [
    {
      type: 'PEER_MENTOR',
      title: 'Assign Senior Peer Mentor',
      description: 'Pair with high-performing 4th year senior for hostel/library study check-ins.',
      icon: <Users className="w-5 h-5 text-indigo-400" />,
      color: 'border-indigo-500/40 bg-indigo-500/10',
    },
    {
      type: 'COUNSELING',
      title: 'Student Wellness Counseling',
      description: 'Book 1-on-1 session with TIET Wellness Centre (Hostel J / Nirman Bhavan).',
      icon: <HeartHandshake className="w-5 h-5 text-rose-400" />,
      color: 'border-rose-500/40 bg-rose-500/10',
    },
    {
      type: 'GRACE_ATTENDANCE',
      title: 'Issue Grace Attendance Waiver',
      description: 'Process sports, cultural or medical certificate for 6% mandatory attendance credit.',
      icon: <FileCheck2 className="w-5 h-5 text-emerald-400" />,
      color: 'border-emerald-500/40 bg-emerald-500/10',
    },
    {
      type: 'PARENT_CONFERENCE',
      title: 'Urgent Parent Conference Call',
      description: 'Alert parents of EST detention cutoff risk and academic drop before debarment list.',
      icon: <PhoneCall className="w-5 h-5 text-amber-400" />,
      color: 'border-amber-500/40 bg-amber-500/10',
    },
    {
      type: 'ACADEMIC_REMEDIAL',
      title: 'Academic Remedial Fast-Track',
      description: 'Enroll in weekend faculty bridge tutorials & LMS assignment recovery modules.',
      icon: <BookOpenCheck className="w-5 h-5 text-cyan-400" />,
      color: 'border-cyan-500/40 bg-cyan-500/10',
    },
    {
      type: 'FEE_EXT_PLAN',
      title: 'Fee Deferral & Hardship Form',
      description: 'Submit installment request to Finance Office to clear EST Hall Ticket hold.',
      icon: <CreditCard className="w-5 h-5 text-purple-400" />,
      color: 'border-purple-500/40 bg-purple-500/10',
    },
  ];

  const peerMentors = [
    'Gurminder Singh (4th Yr Topper, ME - 9.12 CGPA)',
    'Arnav Gupta (4th Yr COE - 9.41 CGPA)',
    'Jasleen Kaur (3rd Yr CIE - 7.92 CGPA)',
    'Simran Verma (4th Yr ECE - 8.85 CGPA)',
    'Tanmay Khurana (3rd Yr CHE - 8.60 CGPA)',
  ];

  const handleTypeSelect = (type: InterventionType) => {
    setSelectedType(type);
    // Provide smart default notes
    switch (type) {
      case 'PEER_MENTOR':
        setNotes(`Assign senior department mentor to review MST test solutions and monitor weekly attendance.`);
        break;
      case 'COUNSELING':
        setNotes(`Referred for academic stress & burnout consultation at TIET Student Wellness Centre.`);
        break;
      case 'GRACE_ATTENDANCE':
        setNotes(`Verified submitted medical documents. Approved 6% attendance grace credit under TIET Reg §4.3.`);
        break;
      case 'PARENT_CONFERENCE':
        setNotes(`Called parents regarding ${student.attendancePct}% attendance and pending fee arrears. Agreed on 14-day study sprint.`);
        break;
      case 'ACADEMIC_REMEDIAL':
        setNotes(`Enrolled in compulsory weekend tutorial make-up batch. Requires 100% attendance in remaining 6 lectures.`);
        break;
      case 'FEE_EXT_PLAN':
        setNotes(`Forwarded hardship installment petition to Dean of Student Affairs for hall ticket release.`);
        break;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const activeOption = interventionOptions.find((o) => o.type === selectedType);
      const newIntervention: Intervention = {
        id: `int-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        type: selectedType,
        title: activeOption?.title || 'Academic Intervention',
        notes: notes,
        status: 'IN_PROGRESS',
        advisorName: advisorName,
        targetMetric: `Target date: ${targetDate}`,
      };

      onAddIntervention(student.id, newIntervention);
      setIsSubmitting(false);
      setSubmitted(true);

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });

      setTimeout(() => {
        onClose();
        setSubmitted(false);
      }, 1600);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-[#121620] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <h3 className="text-base font-bold text-slate-100">
                Trigger Immediate Intervention Action
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Dispatch official academic, financial or counseling action plan for{' '}
              <span className="text-slate-200 font-semibold">{student.name}</span> ({student.rollNo} • {student.branch})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Action Type Selector Grid */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              Select Intervention Category
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {interventionOptions.map((opt) => (
                <button
                  type="button"
                  key={opt.type}
                  onClick={() => handleTypeSelect(opt.type)}
                  className={`text-left p-3 rounded-xl border transition-all flex items-start gap-3 ${
                    selectedType === opt.type
                      ? `${opt.color} ring-1 ring-white/20 shadow-sm`
                      : 'border-slate-800 bg-slate-900/40 hover:bg-slate-800/60 text-slate-400'
                  }`}
                >
                  <div className="mt-0.5">{opt.icon}</div>
                  <div>
                    <div className="text-xs font-semibold text-slate-200">{opt.title}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-2 leading-tight">
                      {opt.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Peer Mentor Specific Select */}
          {selectedType === 'PEER_MENTOR' && (
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <label htmlFor="peer-mentor-select" className="text-xs font-semibold text-slate-200 flex items-center gap-2 cursor-pointer">
                <Users className="w-4 h-4 text-indigo-400" />
                Select High-Performing TIET Senior Mentor
              </label>
              <select
                id="peer-mentor-select"
                value={selectedMentor}
                onChange={(e) => setSelectedMentor(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {peerMentors.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400">
                Mentor will be pinged via Webkiosk / Outlook with the student's backlog and MST drop summary.
              </p>
            </div>
          )}

          {/* Notes and Instructions */}
          <div className="space-y-1.5">
            <label htmlFor="action-notes-textarea" className="text-xs font-semibold uppercase tracking-wider text-slate-400 cursor-pointer">
              Advisor Notes & Recovery Directives
            </label>
            <textarea
              id="action-notes-textarea"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed font-sans"
              placeholder="Specify requirements, tutorial schedule, or parent consultation findings..."
              required
            />
          </div>

          {/* Metadata Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="target-deadline-input" className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1 cursor-pointer">
                Target Review Deadline
              </label>
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  id="target-deadline-input"
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="bg-transparent text-xs text-slate-200 focus:outline-none w-full font-mono"
                />
              </div>
            </div>

            <div>
              <label htmlFor="advisor-name-input" className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1 cursor-pointer">
                Executing Advisor
              </label>
              <input
                id="advisor-name-input"
                type="text"
                value={advisorName}
                onChange={(e) => setAdvisorName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-sans"
              />
            </div>
          </div>

          {/* Quick Notification Disclaimer */}
          <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 shrink-0 text-indigo-400" />
            <span>
              Automated notifications will be dispatched to student ({student.phone}) and Academic Section.
            </span>
          </div>

          {/* Footer Submit Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || submitted}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                submitted
                  ? 'bg-emerald-600 text-white'
                  : 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30'
              }`}
            >
              {submitted ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Intervention Dispatched!
                </>
              ) : isSubmitting ? (
                <span>Dispatching Action...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Execute & Save Intervention
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
