// ============================================================================
// COHORT ENGINE — SaaS Cohort Retention & NRR Calculator
// Inspired by mattdelaune/SaaS_Cohort_Analysis
// ============================================================================

import { CohortAnalysisDataset } from './report-store';

export interface LayerCakeDataPoint {
  monthName: string;
  [cohortName: string]: number | string;
}

export interface CohortRecommendation {
  priority: string;
  title: string;
  rationale: string;
  steps: string[];
  expectedLift: string;
}

export interface CalculatedCohortMetrics {
  netRevenueRetentionPercent: number;
  grossRevenueRetentionPercent: number;
  ltvToCacRatio: number;
  cacPaybackMonths: number;
  averageMonth1Retention: number;
  averageMonth3Retention: number;
  averageMonth6Retention: number;
  averageMonth12Retention: number;
  layerCakeData: LayerCakeDataPoint[];
  cohortHealthStatus: string;
  recommendations: CohortRecommendation[];
  plainLanguageSummary: string;
}

export function calculateCohortMetrics(dataset: CohortAnalysisDataset): CalculatedCohortMetrics {
  const { cohorts, netRevenueRetentionPercent, grossRevenueRetentionPercent,
          averageCustomerAcquisitionCost, averageCustomerLifetimeValue, cacPaybackMonths } = dataset;

  // LTV : CAC Ratio
  const ltvToCacRatio = averageCustomerAcquisitionCost > 0
    ? Math.round((averageCustomerLifetimeValue / averageCustomerAcquisitionCost) * 10) / 10
    : 0;

  // Average Retention by Month Index across all cohorts that have that month
  const getAvgRetentionAtMonth = (monthIndex: number): number => {
    const validCohorts = cohorts.filter(c => c.retentionByMonth[monthIndex] !== undefined);
    if (validCohorts.length === 0) return 0;
    const sum = validCohorts.reduce((acc, c) => acc + c.retentionByMonth[monthIndex], 0);
    return Math.round(sum / validCohorts.length);
  };

  const averageMonth1Retention = getAvgRetentionAtMonth(1);
  const averageMonth3Retention = getAvgRetentionAtMonth(3);
  const averageMonth6Retention = getAvgRetentionAtMonth(6);
  const averageMonth12Retention = getAvgRetentionAtMonth(11);

  // Cohort Layer Cake — Build 12 months of stacked revenue
  const layerCakeData: LayerCakeDataPoint[] = Array.from({ length: 12 }, (_, monthOffset) => {
    const point: LayerCakeDataPoint = { monthName: `M${monthOffset}` };
    cohorts.forEach(cohort => {
      const retPct = cohort.retentionByMonth[monthOffset];
      if (retPct !== undefined) {
        point[cohort.cohortName] = Math.round((retPct / 100) * cohort.initialMrr);
      }
    });
    return point;
  });

  // Cohort Health Status
  let cohortHealthStatus = 'At-Risk Retention';
  if (netRevenueRetentionPercent >= 120 && averageMonth12Retention >= 70) {
    cohortHealthStatus = 'World-Class NRR';
  } else if (netRevenueRetentionPercent >= 110 && averageMonth12Retention >= 65) {
    cohortHealthStatus = 'Strong Growth Engine';
  } else if (netRevenueRetentionPercent >= 100) {
    cohortHealthStatus = 'Positive Retention';
  } else if (netRevenueRetentionPercent >= 90) {
    cohortHealthStatus = 'Moderate Churn Concern';
  }

  // AI Recommendations
  const recommendations: CohortRecommendation[] = [
    {
      priority: 'CRITICAL',
      title: 'Intercept Month 1–3 Onboarding Drop-Off',
      rationale: `Retention drops from ${averageMonth1Retention}% (M1) to ${averageMonth3Retention}% (M3) — a ${averageMonth1Retention - averageMonth3Retention}-point loss. This early churn phase is the single largest revenue leak in the cohort model.`,
      steps: [
        'Assign a dedicated Customer Success Manager (CSM) to every new account for first 90 days',
        'Deploy an automated Day 7, Day 21, and Day 45 health check survey sequence via email',
        'Identify product features used by accounts with >85% M3 retention — push those as onboarding milestones',
      ],
      expectedLift: `+${Math.round((averageMonth1Retention - averageMonth3Retention) * 0.4)}pp M3 Retention → +${netRevenueRetentionPercent + 4}% NRR`,
    },
    {
      priority: 'HIGH',
      title: 'Launch Annual Contract Incentive to Lock Cohort Revenue',
      rationale: `${grossRevenueRetentionPercent}% GRR with a ${averageMonth12Retention}% 12-month retention indicates expansion upside. Converting monthly to annual prepaid contracts reduces churn probability by an average of 35%.`,
      steps: [
        'Offer 15% pricing discount for accounts converting from monthly to annual prepaid contracts',
        'Identify top 25% highest-spending cohort accounts and target them first with white-glove annual conversion outreach',
        'Bundle exclusive features (advanced analytics, priority support) as annual plan incentives',
      ],
      expectedLift: `+${Math.round(netRevenueRetentionPercent * 1.08 - netRevenueRetentionPercent)}pp NRR → Estimated ${Math.round(netRevenueRetentionPercent * 1.08)}% NRR`,
    },
    {
      priority: 'MEDIUM',
      title: `Improve LTV:CAC from ${ltvToCacRatio}x via Expansion Revenue Programs`,
      rationale: `Your CAC Payback of ${cacPaybackMonths} months is efficient. However, the expansion revenue embedded in NRR can push LTV from $${averageCustomerLifetimeValue} significantly higher through upsells.`,
      steps: [
        'Deploy in-app contextual upgrade prompts when users hit usage thresholds (e.g. API calls, seats)',
        'Create a tiered add-on catalog — launch premium analytics, white-label exports, or API access tiers',
        'Run quarterly Business Review (QBR) calls for top 20% of accounts to identify expansion openings',
      ],
      expectedLift: `LTV → $${Math.round(averageCustomerLifetimeValue * 1.2).toLocaleString()} (+20%) | LTV:CAC → ${(ltvToCacRatio * 1.2).toFixed(1)}x`,
    },
  ];

  const plainLanguageSummary = `${dataset.businessName} shows an NRR of ${netRevenueRetentionPercent}% and GRR of ${grossRevenueRetentionPercent}% over ${dataset.analyzedPeriod}. The LTV:CAC ratio is ${ltvToCacRatio}x with a ${cacPaybackMonths}-month payback period. Average 12-month account retention is ${averageMonth12Retention}%. Cohort Health: ${cohortHealthStatus}.`;

  return {
    netRevenueRetentionPercent,
    grossRevenueRetentionPercent,
    ltvToCacRatio,
    cacPaybackMonths,
    averageMonth1Retention,
    averageMonth3Retention,
    averageMonth6Retention,
    averageMonth12Retention,
    layerCakeData,
    cohortHealthStatus,
    recommendations,
    plainLanguageSummary,
  };
}
