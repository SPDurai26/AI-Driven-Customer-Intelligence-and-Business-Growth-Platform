// Local rule-based reply engine — used ONLY when GROQ_API_KEY is missing
// or the API call fails.

import { PnLStatement, BalanceSheet, MarketSalesRecord } from './report-store';
import { CalculatedFinancialRatios } from './financial-engine';
import { CalculatedBalanceSheetRatios } from './balance-sheet-engine';
import { CalculatedCohortMetrics } from './cohort-engine';

export function buildLocalReply(
  message: string,
  pnl: PnLStatement,
  pnlMetrics: CalculatedFinancialRatios,
  bsMetrics: CalculatedBalanceSheetRatios | null,
  cohortM: CalculatedCohortMetrics | null,
  marketSales: MarketSalesRecord[] | undefined,
  currSymbol: string
): string {
  const lower = message.toLowerCase();

  if (lower.includes('launch') || lower.includes('product') || lower.includes('new idea') || lower.includes('expand')) {
    return `### Strategic Co-Founder Launch Plan for ${pnl.businessName}

Here is a focused, forward-looking roadmap to validate and scale this initiative:

#### Phase 1: Pre-Launch Validation & Pricing Architecture (Weeks 1–3)
- **Target Gross Margin:** Aim for at least 55–65% gross margin on this new line to protect cash reserves.
- **Pilot Customer Commitments:** Secure 5–10 LOIs (Letters of Intent) or pre-orders before committing capital.
- **Working Capital Allocation:** Cap initial inventory or production tooling to no more than 15% of current liquidity.

#### Phase 2: Go-To-Market Execution & Customer Acquisition (Weeks 4–8)
- **Channel Strategy:** Leverage existing high-margin sales channels first to keep CAC minimal.
- **Incentivized Bundling:** Offer introductory pricing tied to annual or recurring contracts to maximize upfront cash.

#### Phase 3: Cohort Retention & Expansion (Months 3–6)
- Target a 90-day retention floor above 75% and aim for CAC payback within 6 months.

**Next Decision for Us:** What is the estimated retail or contract price point you're aiming for, and will this target existing customers or a new audience?`;
  }

  if (
    lower.includes('balance sheet') ||
    lower.includes('liquidity') ||
    lower.includes('working capital') ||
    lower.includes('current ratio') ||
    lower.includes('quick ratio') ||
    lower.includes('debt')
  ) {
    if (bsMetrics) {
      return `### Balance Sheet & Solvency Strategic Advisory for ${pnl.businessName}

- **Current Liquidity Stance:** Net Working Capital stands at **${currSymbol}${bsMetrics.workingCapital.toLocaleString()}** with a Current Ratio of **${bsMetrics.currentRatio.toFixed(2)}x** (Optimal: 1.5–2.0x).
- **Short-Term Coverage:** Quick Ratio is **${bsMetrics.quickRatio.toFixed(2)}x** against short-term obligations.

#### Forward-Looking Capital Management:
1. **Extend Payables Velocity:** Negotiate 45–60 day payment terms on vendor accounts payable to preserve liquid cash.
2. **Accelerate Receivables:** Institute a 2% discount on invoices paid within 10 days to compress the cash conversion cycle.
3. **Debt Optimization:** Keep debt-to-equity below 1.5x as new growth initiatives scale.

What capital expenditure or funding milestones are on the horizon for next quarter?`;
    }
    return `A balance sheet ledger is not linked for this session yet. Upload or synchronize your balance sheet to unlock deep solvency forecasting.`;
  }

  if (
    lower.includes('cohort') ||
    lower.includes('retention') ||
    lower.includes('nrr') ||
    lower.includes('clv') ||
    lower.includes('cac') ||
    lower.includes('churn')
  ) {
    if (cohortM) {
      return `### Customer Retention & Cohort Expansion Strategy

- **Current Net Revenue Retention (NRR):** **${cohortM.netRevenueRetentionPercent}%** (Target: >105%)
- **Unit Economics:** LTV:CAC ratio is **${cohortM.ltvToCacRatio}x** with a **${cohortM.cacPaybackMonths}-month** payback.

#### Actionable Retention Playbook:
1. **Month-1 Onboarding Sprint:** Address the initial drop-off by instituting proactive customer success checkpoints at Day 7, 14, and 30.
2. **Expansion / Upsell Triggers:** Identify top 20% accounts ready for higher volume tiers at Month 3 to drive NRR past 110%.
3. **Automated Churn Interception:** Flag accounts with declining usage 15 days before renewal.

Which customer segment is currently driving the majority of your churn?`;
    }
    return `Cohort analysis dataset is not loaded for this session yet. Add customer cohorts to run predictive retention modeling.`;
  }

  if (lower.includes('plan') || lower.includes('what to do next') || lower.includes('priority') || lower.includes('action')) {
    const actions = pnlMetrics.recommendedActions.slice(0, 3);
    const [a1, a2, a3] = actions;
    return `### Strategic Execution Roadmap for ${pnl.businessName}

#### Priority 1: Immediate Execution (Days 1–14)
- **${a1 ? a1.title : 'Gross Margin Optimization'}**
  - Implement vendor price renegotiations and optimize direct operational costs.
  ${a1 ? a1.steps.map(s => `- ${s}`).join('\n  ') : ''}

#### Priority 2: Medium-Term Growth & Scale (Days 15–45)
- **${a2 ? a2.title : 'Customer Acquisition & Retention Sprints'}**
  - Deploy targeted marketing spend only where CAC payback is under 6 months.

#### Priority 3: Strategic Long-Term Moat (Days 45–90)
- **${a3 ? a3.title : 'Working Capital & Liquidity Buffer'}**
  - Build a 3-month operating reserve to fund product expansion without external debt.

Which of these 3 milestones should we prioritize first?`;
  }

  return `### Strategic Advisory // ${pnl.businessName}

As your AI Co-Founder, I focus on forward-looking growth, scenario modeling, and financial health.

#### Key Focus Areas for Us:
1. **New Product & GTM Strategy:** Validate TAM, target margins, and launch milestones.
2. **Margin & Pricing Expansion:** Model price tiering to increase bottom-line net contribution.
3. **Working Capital Strategy:** Protect cash runway while funding expansion sprints.
4. **Cohort & Customer Growth:** Improve retention and drive Net Revenue Retention (NRR).

What growth plan, product launch, or strategic initiative shall we tackle next?`;
}
