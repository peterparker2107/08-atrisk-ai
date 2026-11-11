export type RiskLevel = 'CRITICAL' | 'MODERATE' | 'LOW';

export type FeeStatus = 'PAID' | 'PARTIAL' | 'OVERDUE' | 'SCHOLARSHIP_HOLD';

export type InterventionType =
  | 'PEER_MENTOR'
  | 'COUNSELING'
  | 'GRACE_ATTENDANCE'
  | 'PARENT_CONFERENCE'
  | 'ACADEMIC_REMEDIAL'
  | 'FEE_EXT_PLAN';

export interface Intervention {
  id: string;
  date: string;
  type: InterventionType;
  title: string;
  notes: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED';
  advisorName: string;
  targetMetric?: string;
}

export interface SubjectAttendance {
  courseCode: string;
  courseName: string;
  attendancePct: number;
  classesMissed: number;
  totalClasses: number;
  isDetentionRisk: boolean;
}

export interface MSTSubjectScore {
  courseCode: string;
  courseName: string;
  mst1: number; // out of 30
  mst2: number; // out of 30
  dropPct: number;
}

export interface Student {
  id: string;
  rollNo: string;
  name: string;
  avatarUrl: string;
  branch: string; // e.g. Mechanical Engg (ME), Civil Engg (CIE), etc.
  branchCode: 'ME' | 'CIE' | 'CHE' | 'EIC' | 'ECE' | 'COE' | 'MEC' | 'BT';
  year: number; // 1, 2, 3, 4
  semester: number; // 1 to 8
  cgpa: number;
  attendancePct: number; // overall
  subjectAttendances: SubjectAttendance[];
  mstScores: MSTSubjectScore[];
  lmsInactivityDays: number;
  backlogsCount: number;
  pendingFeeAmount: number; // in INR
  feeStatus: FeeStatus;
  hostel: string;
  phone: string;
  email: string;
  mentorAssigned?: string;
  mentorContact?: string;
  status: 'ACTIVE' | 'UNDER_INTERVENTION' | 'RECOVERING' | 'RESOLVED';
  interventionHistory: Intervention[];
  tags: string[];
  lastActiveDate: string;
}

export interface ShapFactor {
  factorKey: string;
  label: string;
  category: 'attendance' | 'academic' | 'engagement' | 'financial' | 'backlog';
  impactPercent: number; // e.g. +38% or -12%
  currentValue: string;
  benchmarkValue: string;
  isRiskDriver: boolean; // true = increases risk (red), false = protective factor (green)
  explanation: string;
  tietPolicyRef?: string;
}

export interface StudentRiskAssessment {
  studentId: string;
  overallScore: number; // 0 to 100
  riskLevel: RiskLevel;
  detentionRiskCount: number; // count of subjects < 75%
  isEstDetentionImminent: boolean;
  shapFactors: ShapFactor[];
  topRiskDriverSummary: string;
  suggestedAction: string;
}

export interface SimulationParams {
  additionalTutorials: number; // 0 to 12
  lmsModulesCompleted: number; // 0 to 6
  peerTutoringHours: number; // 0 to 20
  remedialExamTargetScore: number; // 0 to 30
  feeInstallmentApproved: boolean;
  medicalGraceApproved: boolean;
}

export interface SimulationResult {
  originalScore: number;
  newScore: number;
  originalRiskLevel: RiskLevel;
  newRiskLevel: RiskLevel;
  scoreDelta: number;
  originalAttendancePct: number;
  simulatedAttendancePct: number;
  detentionAverted: boolean;
  estEligibilityRestored: boolean;
  recoveryFeasibility: 'HIGH' | 'MEDIUM' | 'CHALLENGING';
  projectedOutcome: string;
}
