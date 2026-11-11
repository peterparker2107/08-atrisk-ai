# AtRisk AI — "Find Students Before They Give Up"

> **** for TIET Campus Suite at Thapar Institute of Engineering and Technology (TIET), Patiala.  
> **100% Client-Side In-Browser Inference • Zero External API Keys Required**

---

## 🎯 Confirmed Problem Statement (TIET Context)
At engineering institutions like TIET Patiala, academic advisors and heads of departments face a chronic problem:
1. **Late Detention Cascading**: Under TIET Academic Regulation §4.2, students with sub-75% attendance are automatically debarred from End Semester (EST) examinations. Currently, advisors only discover this when final debarment lists drop 10–14 days before EST, by which time it is mathematically impossible to attend enough lectures to make up the deficit.
2. **Backlog Cascades & Quiet Dropout**: In non-CSE branches (Mechanical, Civil, Chemical, Mechatronics, Biotechnology), fee anxiety (~₹2.5L–3.5L per semester) compounded by placement anxiety leads to disengagement. Students quietly stop logging into LMS (Moodle/Webkiosk), accumulate 2+ backlogs, and spiral into credit suspension or semester drops.
3. **Black-Box Frustration**: When predictive flags do exist, advisors are left asking: *"Why is this student red? What concrete action will actually save them?"*

---

## 💡 What AtRisk AI Delivers

### 1. Student Academic Risk Triage Grid
- High-urgency academic triage board with multi-factor risk scoring (0–100%).
- Real-time signals:
  - Overall & subject-by-subject attendance % against the strict 75% EST cutoff marker
  - MST1 to MST2 continuous assessment test score drops
  - LMS (Webkiosk/Moodle) dormancy telemetry (days inactive)
  - Active backlog counts & credit debt
  - Outstanding semester fee arrears causing hall-ticket hold anxiety
- Immediate filtering by risk tier (Critical `oklch(0.55 0.22 25)` red, Moderate `oklch(0.75 0.18 60)` amber, Stable `oklch(0.65 0.18 155)` green), branch, and detention threat.

### 2. Explainable SHAP Attribution
- Unpacks the "black box": visually breaks down how individual student signals deviate from the baseline cohort expected rate ($E[f(x)] = 15\%$).
- Human-readable factor attribution (e.g. `Attendance < 65% (+38% risk)`, `MST2 Math score dropped 40% (+27% risk)`).
- Direct citations to official TIET Academic Regulations (e.g., Section 4.2 attendance debarment, continuous assessment weights).

### 3. Interactive "What-If Recovery Simulator"
- Live counterfactual simulator putting actionable control in the advisor's hands:
  - *"What if the student attends the next 4 tutorial classes?"* -> Risk score immediately drops from 84% to 58%, and the detention status changes from `Debarred ⚠️` to `EST Hall Ticket Cleared ✅`.
  - Adjust tutorial attendance, LMS catch-up assignments, peer tutoring hours, continuous assessment re-tests, fee hardship installments, and medical grace credit.
  - One-click **"Commit Simulation to Action Plan"** locking in a binding academic recovery contract.

### 4. Automated 1-Click Intervention Action Plan
- Advisors can instantly dispatch structured interventions:
  - **Assign Senior Peer Mentor** (Select from department toppers)
  - **Student Wellness Counseling** (Referral to TIET Wellness Centre at Hostel J / Nirman Bhavan)
  - **Grace Attendance Waiver** (Medical/Sports verified 6% credit under Reg §4.3)
  - **Urgent Parent Conference Call**
  - **Fee Deferral & Hardship Form**
- Full audit log tracking every action with timestamps and advisor notes.

### 5. Cohort Analytics & Department Diagnostics
- High-level executive diagnostics showing branch-wise vulnerability (highlighting Mechanical and Civil branches having higher quiet dropout rates).
- Primary risk driver donut breakdown.
- 24-hour urgent advisor action queue.

---

## 🛠️ Tech Stack & Architecture
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom oklch color scales (`oklch(0.55 0.22 25)` red, `oklch(0.75 0.18 60)` amber, `oklch(0.65 0.18 155)` green) + Geist Font
- **Charts & Data Viz**: Recharts (Responsive bar charts, pie charts)
- **Icons**: Lucide React
- **Animations & Effects**: Framer Motion & Canvas Confetti

---

## 🚀 Running Locally

```bash
# Navigate to project directory
cd 08-atrisk-ai

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```
