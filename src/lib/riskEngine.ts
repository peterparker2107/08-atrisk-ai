import type {
  Student,
  StudentRiskAssessment,
  ShapFactor,
  RiskLevel,
  SimulationParams,
  SimulationResult,
} from '../types/student';

export function calculateRiskAssessment(student: Student): StudentRiskAssessment {
  const shapFactors: ShapFactor[] = [];
  let score = 15; // baseline cohort risk score

  // 1. Attendance Analysis (Crucial TIET policy: 75% cutoff for EST)
  const attendance = student.attendancePct;
  const subjectsBelowThreshold = student.subjectAttendances.filter((s) => s.attendancePct < 75);
  const detentionRiskCount = subjectsBelowThreshold.length;

  if (attendance < 60) {
    const impact = 38;
    score += impact;
    shapFactors.push({
      factorKey: 'att_severe',
      label: 'Severe Attendance Deficit',
      category: 'attendance',
      impactPercent: impact,
      currentValue: `${attendance}%`,
      benchmarkValue: '≥ 75% EST Cutoff',
      isRiskDriver: true,
      explanation: `Attendance is critically below 60%. Automatically debarred in ${detentionRiskCount} subjects.`,
      tietPolicyRef: 'TIET Reg §4.2: Mandatory EST Debarment for < 75%',
    });
  } else if (attendance < 75) {
    const impact = 24;
    score += impact;
    shapFactors.push({
      factorKey: 'att_warning',
      label: 'Sub-75% Attendance Risk',
      category: 'attendance',
      impactPercent: impact,
      currentValue: `${attendance}%`,
      benchmarkValue: '≥ 75% EST Cutoff',
      isRiskDriver: true,
      explanation: `Student has fallen below the 75% EST exam threshold in ${detentionRiskCount} subjects.`,
      tietPolicyRef: 'TIET Reg §4.2: Detention list warnings active',
    });
  } else if (attendance >= 85) {
    const impact = -14;
    score += impact;
    shapFactors.push({
      factorKey: 'att_healthy',
      label: 'Consistent Class Attendance',
      category: 'attendance',
      impactPercent: impact,
      currentValue: `${attendance}%`,
      benchmarkValue: '≥ 75% EST Cutoff',
      isRiskDriver: false,
      explanation: 'Healthy attendance above 85% provides significant buffer against academic failure.',
    });
  }

  // 2. MST Performance Drops (MST1 vs MST2)
  let totalDrop = 0;
  let droppingSubjects = 0;
  let worstDropSubject = '';
  let maxDrop = 0;

  student.mstScores.forEach((s) => {
    if (s.dropPct > 0) {
      totalDrop += s.dropPct;
      droppingSubjects++;
      if (s.dropPct > maxDrop) {
        maxDrop = s.dropPct;
        worstDropSubject = s.courseName;
      }
    }
  });

  const avgDrop = student.mstScores.length > 0 ? Math.round(totalDrop / student.mstScores.length) : 0;

  if (avgDrop >= 30) {
    const impact = 28;
    score += impact;
    shapFactors.push({
      factorKey: 'mst_steep_drop',
      label: 'Steep MST Test Score Collapse',
      category: 'academic',
      impactPercent: impact,
      currentValue: `-${avgDrop}% avg drop`,
      benchmarkValue: '± 5% normal variance',
      isRiskDriver: true,
      explanation: `Steep drop between MST1 and MST2 (worst in ${worstDropSubject} by -${maxDrop}%). Signals severe comprehension breakdown.`,
      tietPolicyRef: 'Continuous Assessment Warning (MST weightage: 30%)',
    });
  } else if (avgDrop >= 15) {
    const impact = 16;
    score += impact;
    shapFactors.push({
      factorKey: 'mst_moderate_drop',
      label: 'MST Score Drop Between Cycles',
      category: 'academic',
      impactPercent: impact,
      currentValue: `-${avgDrop}% drop`,
      benchmarkValue: '± 5% normal variance',
      isRiskDriver: true,
      explanation: `MST2 scores declined by ${avgDrop}% compared to MST1, indicating slipping retention.`,
    });
  } else if (avgDrop <= -10) {
    const impact = -12;
    score += impact;
    shapFactors.push({
      factorKey: 'mst_improvement',
      label: 'Academic Trajectory Recovery',
      category: 'academic',
      impactPercent: impact,
      currentValue: `+${Math.abs(avgDrop)}% MST2 gain`,
      benchmarkValue: 'Positive trajectory',
      isRiskDriver: false,
      explanation: 'MST2 performance improved markedly over MST1, showing student study adjustments.',
    });
  }

  // 3. Backlog History
  if (student.backlogsCount >= 3) {
    const impact = 32;
    score += impact;
    shapFactors.push({
      factorKey: 'backlog_critical',
      label: 'Accumulated Backlogs (≥3)',
      category: 'backlog',
      impactPercent: impact,
      currentValue: `${student.backlogsCount} Backlogs`,
      benchmarkValue: '0 Backlogs',
      isRiskDriver: true,
      explanation: `Carrying ${student.backlogsCount} active backlogs creates prerequisite debt and risks academic suspension/year drop.`,
      tietPolicyRef: 'TIET Year Progression Rule (max 4 active backlogs allowed)',
    });
  } else if (student.backlogsCount >= 1) {
    const impact = 18;
    score += impact;
    shapFactors.push({
      factorKey: 'backlog_warning',
      label: 'Active Course Backlog',
      category: 'backlog',
      impactPercent: impact,
      currentValue: `${student.backlogsCount} Backlog`,
      benchmarkValue: '0 Backlogs',
      isRiskDriver: true,
      explanation: 'Previous course backlog diverts focus from current semester workload.',
    });
  } else {
    const impact = -8;
    score += impact;
    shapFactors.push({
      factorKey: 'clean_record',
      label: 'Clear Academic Slate (0 Backlogs)',
      category: 'backlog',
      impactPercent: impact,
      currentValue: '0 Backlogs',
      benchmarkValue: '0 Backlogs',
      isRiskDriver: false,
      explanation: 'No lingering course backlogs. Has fully cleared preceding semesters.',
    });
  }

  // 4. LMS & Webkiosk Digital Inactivity
  if (student.lmsInactivityDays >= 18) {
    const impact = 22;
    score += impact;
    shapFactors.push({
      factorKey: 'lms_dormant',
      label: 'Prolonged LMS Digital Inactivity',
      category: 'engagement',
      impactPercent: impact,
      currentValue: `${student.lmsInactivityDays} days inactive`,
      benchmarkValue: '≤ 3 days',
      isRiskDriver: true,
      explanation: `Zero logins to Moodle/Webkiosk for ${student.lmsInactivityDays} days. Precursor to quiet academic withdrawal.`,
      tietPolicyRef: 'LMS Telemetry Alert (Course Materials Unviewed)',
    });
  } else if (student.lmsInactivityDays >= 10) {
    const impact = 12;
    score += impact;
    shapFactors.push({
      factorKey: 'lms_low',
      label: 'Low LMS Portal Engagement',
      category: 'engagement',
      impactPercent: impact,
      currentValue: `${student.lmsInactivityDays} days inactive`,
      benchmarkValue: '≤ 3 days',
      isRiskDriver: true,
      explanation: `LMS engagement has tapered off in the last fortnight. Assignment submissions likely pending.`,
    });
  } else if (student.lmsInactivityDays <= 2) {
    const impact = -10;
    score += impact;
    shapFactors.push({
      factorKey: 'lms_active',
      label: 'Active LMS Portal Engagement',
      category: 'engagement',
      impactPercent: impact,
      currentValue: `Active (${student.lmsInactivityDays}d ago)`,
      benchmarkValue: '≤ 3 days',
      isRiskDriver: false,
      explanation: 'Regular daily interactions with lecture notes and LMS assignments.',
    });
  }

  // 5. Fee Arrears & Branch Anxiety (TIET specific ROI pressure)
  if (student.feeStatus === 'OVERDUE' && student.pendingFeeAmount > 100000) {
    const impact = 19;
    score += impact;
    const feeInLakhs = (student.pendingFeeAmount / 100000).toFixed(1);
    shapFactors.push({
      factorKey: 'fee_overdue',
      label: 'Fee Arrears & Semester Hold Risk',
      category: 'financial',
      impactPercent: impact,
      currentValue: `₹${feeInLakhs}L overdue`,
      benchmarkValue: 'Cleared',
      isRiskDriver: true,
      explanation: `Outstanding fee balance of ₹${feeInLakhs} Lakhs. High correlation with fee ROI stress and quiet dropout.`,
      tietPolicyRef: 'Finance Clearance Gate for EST Hall Ticket',
    });
  } else if (student.feeStatus === 'PARTIAL') {
    const impact = 8;
    score += impact;
    shapFactors.push({
      factorKey: 'fee_partial',
      label: 'Partial Fee Clearance',
      category: 'financial',
      impactPercent: impact,
      currentValue: `₹${(student.pendingFeeAmount / 1000).toFixed(0)}k balance`,
      benchmarkValue: 'Cleared',
      isRiskDriver: true,
      explanation: 'Partial semester dues pending approval for installment plan.',
    });
  }

  // 6. CGPA Context
  if (student.cgpa < 5.5) {
    const impact = 14;
    score += impact;
    shapFactors.push({
      factorKey: 'cgpa_critical',
      label: 'Sub-5.5 Cumulative CGPA',
      category: 'academic',
      impactPercent: impact,
      currentValue: `${student.cgpa.toFixed(2)} CGPA`,
      benchmarkValue: '≥ 6.00 Minimum Standard',
      isRiskDriver: true,
      explanation: 'CGPA is nearing the academic probation line of 5.00.',
    });
  } else if (student.cgpa >= 7.8) {
    const impact = -10;
    score += impact;
    shapFactors.push({
      factorKey: 'cgpa_strong',
      label: 'Strong Foundational CGPA',
      category: 'academic',
      impactPercent: impact,
      currentValue: `${student.cgpa.toFixed(2)} CGPA`,
      benchmarkValue: '≥ 6.00',
      isRiskDriver: false,
      explanation: 'High historical academic aptitude proves baseline capability to recover if motivated.',
    });
  }

  // Clamp score between 5 and 98
  const clampedScore = Math.min(98, Math.max(5, Math.round(score)));

  let riskLevel: RiskLevel = 'LOW';
  if (clampedScore >= 72) {
    riskLevel = 'CRITICAL';
  } else if (clampedScore >= 45) {
    riskLevel = 'MODERATE';
  } else {
    riskLevel = 'LOW';
  }

  const isEstDetentionImminent = detentionRiskCount > 0 && attendance < 75;

  // Generate top risk driver summary
  const topRisk = [...shapFactors]
    .filter((f) => f.isRiskDriver)
    .sort((a, b) => b.impactPercent - a.impactPercent)[0];

  const topRiskDriverSummary = topRisk
    ? `${topRisk.label} (+${topRisk.impactPercent}% risk contribution)`
    : 'No critical risk drivers identified';

  // Suggested action
  let suggestedAction = 'Maintain bi-weekly mentor check-in.';
  if (riskLevel === 'CRITICAL') {
    if (attendance < 65) {
      suggestedAction =
        'Immediate parent conference + Grace attendance review + 6 Mandatory tutorial make-up sessions before EST list freeze.';
    } else if (student.backlogsCount >= 2) {
      suggestedAction =
        'Assign Senior Peer Mentor + Academic Remedial Plan + Reduce co-curricular load.';
    } else {
      suggestedAction =
        'Schedule urgent Student Wellness Counseling + Faculty advisor 1-on-1.';
    }
  } else if (riskLevel === 'MODERATE') {
    suggestedAction =
      'Issue warning notice, assign study group in hostel, and review MST2 test solutions.';
  }

  return {
    studentId: student.id,
    overallScore: clampedScore,
    riskLevel,
    detentionRiskCount,
    isEstDetentionImminent,
    shapFactors: shapFactors.sort((a, b) => Math.abs(b.impactPercent) - Math.abs(a.impactPercent)),
    topRiskDriverSummary,
    suggestedAction,
  };
}

/**
 * Interactive What-If Recovery Simulator
 * Calculates how specific interventions mathematically reduce risk score and avert detention
 */
export function simulateRecovery(
  student: Student,
  params: SimulationParams
): SimulationResult {
  const baseAssessment = calculateRiskAssessment(student);
  let newScore = baseAssessment.overallScore;

  // 1. Additional Tutorials attended
  // Each tutorial attended adds ~1.8% to overall attendance and builds confidence
  const addedAttendance = params.additionalTutorials * 1.75;
  const simulatedAttendance = Math.min(95, Math.round(student.attendancePct + addedAttendance));

  if (params.additionalTutorials > 0) {
    const attImprovementRatio = params.additionalTutorials / 10;
    const riskReduction = Math.min(26, Math.round(attImprovementRatio * 22));
    newScore -= riskReduction;
  }

  // 2. LMS Remedial Modules completed (0 to 6)
  if (params.lmsModulesCompleted > 0) {
    const lmsReduction = params.lmsModulesCompleted * 3.5;
    newScore -= lmsReduction;
  }

  // 3. Peer Tutoring Hours (0 to 20 hrs)
  if (params.peerTutoringHours > 0) {
    const tutorReduction = Math.min(18, Math.round(params.peerTutoringHours * 1.1));
    newScore -= tutorReduction;
  }

  // 4. Remedial Exam Target Score (e.g. scoring 22/30 in make-up quiz)
  if (params.remedialExamTargetScore >= 18) {
    const academicGain = Math.round(((params.remedialExamTargetScore - 15) / 15) * 12);
    newScore -= Math.max(4, academicGain);
  }

  // 5. Fee Installment Approved
  if (params.feeInstallmentApproved && student.pendingFeeAmount > 0) {
    newScore -= 12; // relieves anxiety and removes financial hold gate
  }

  // 6. Medical/Sports Grace Attendance Approved
  let effectiveSimulatedAttendance = simulatedAttendance;
  if (params.medicalGraceApproved) {
    effectiveSimulatedAttendance = Math.min(95, effectiveSimulatedAttendance + 6);
    newScore -= 10;
  }

  // Clamping
  const finalNewScore = Math.max(12, Math.min(baseAssessment.overallScore, Math.round(newScore)));
  const scoreDelta = baseAssessment.overallScore - finalNewScore;

  let newRiskLevel: RiskLevel = 'LOW';
  if (finalNewScore >= 72) {
    newRiskLevel = 'CRITICAL';
  } else if (finalNewScore >= 45) {
    newRiskLevel = 'MODERATE';
  } else {
    newRiskLevel = 'LOW';
  }

  const detentionAverted = effectiveSimulatedAttendance >= 75;
  const estEligibilityRestored = effectiveSimulatedAttendance >= 75 && (!student.pendingFeeAmount || params.feeInstallmentApproved);

  let recoveryFeasibility: 'HIGH' | 'MEDIUM' | 'CHALLENGING' = 'HIGH';
  if (student.attendancePct < 50 && params.additionalTutorials < 8) {
    recoveryFeasibility = 'CHALLENGING';
  } else if (baseAssessment.overallScore > 85 && finalNewScore > 55) {
    recoveryFeasibility = 'MEDIUM';
  }

  let projectedOutcome = `Risk score drops by ${scoreDelta}% (from ${baseAssessment.overallScore}% to ${finalNewScore}%).`;
  if (detentionAverted && !baseAssessment.isEstDetentionImminent) {
    projectedOutcome += ' Preserves EST exam eligibility with comfortable safety margin.';
  } else if (detentionAverted && baseAssessment.isEstDetentionImminent) {
    projectedOutcome += ' ✅ Successfully averts EST detention! Restores Hall Ticket clearance.';
  } else {
    projectedOutcome += ' ⚠️ Still requires 2 more tutorial sessions to clear 75% cutoff.';
  }

  return {
    originalScore: baseAssessment.overallScore,
    newScore: finalNewScore,
    originalRiskLevel: baseAssessment.riskLevel,
    newRiskLevel,
    scoreDelta,
    originalAttendancePct: student.attendancePct,
    simulatedAttendancePct: effectiveSimulatedAttendance,
    detentionAverted,
    estEligibilityRestored,
    recoveryFeasibility,
    projectedOutcome,
  };
}
