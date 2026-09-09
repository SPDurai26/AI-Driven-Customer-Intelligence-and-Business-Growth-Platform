// ============================================================================
// FINANCIAL ENGINE — P&L Ratio Calculator
// Inspired by sujeet424/Profit-Loss-Report & strategy.txt formulas
// ============================================================================

import { PnLStatement } from './report-store';

export interface ActionItem {
  id: string;
  priority: string;
  category: string;
  title: string;
  estimatedSavingsOrGain: string;
  steps: string[];
}

export interface PerformanceScore {
  overallScore: number;
  overallStatus: string;
  marginScore: number;
  expenseScore: number;
  growthScore: number;
  breakEvenScore: number;
}

export interface CalculatedFinancialRatios {
  // Core P&L
  grossProfit: number;
  grossMarginPercent: number;
  totalOperatingExpenses: number;
  operatingProfit: number;
  operatingMarginPercent: number;
  netProfit: number;
  netMarginPercent: number;
  expenseRatioPercent: number;

  // Growth
  revenueGrowthPercent: number;
  netProfitGrowthPercent: number;

  // Break-Even Analysis
  breakEvenSales: number;
  breakEvenSafetyMarginPercent: number;

  // Performance
  performanceScore: PerformanceScore;

  // Recommended Actions
  recommendedActions: ActionItem[];

  // AI narrative
  plainLanguageExplanation: string;
}

export function calculatePnLMetrics(stmt: PnLStatement): CalculatedFinancialRatios {
  const { revenue, costOfGoodsSold, expenses, previousPeriodRevenue, previousPeriodNetProfit, fixedCosts } = stmt;

  // ── Core P&L Calculations ──────────────────────────────────────────────────
  const grossProfit = revenue - costOfGoodsSold;
  const grossMarginPercent = revenue > 0 ? (grossProfit / revenue) * 100 : 0;

  const totalOperatingExpenses =
    expenses.employeeExpenses +
    expenses.rentAndUtilities +
    expenses.marketingExpenses +
    expenses.depreciation +
    expenses.interestExpenses +
    expenses.taxes +
    expenses.otherExpenses;

  const operatingProfit = grossProfit - totalOperatingExpenses;
  const operatingMarginPercent = revenue > 0 ? (operatingProfit / revenue) * 100 : 0;

  // Net Profit = Operating Profit (taxes already included in expenses above)
  const netProfit = operatingProfit;
  const netMarginPercent = revenue > 0 ? (netProfit / revenue) * 100 : 0;
  const expenseRatioPercent = revenue > 0 ? ((totalOperatingExpenses + costOfGoodsSold) / revenue) * 100 : 0;

  // ── Growth Rates ───────────────────────────────────────────────────────────
  const revenueGrowthPercent = previousPeriodRevenue != null && previousPeriodRevenue > 0
    ? ((revenue - previousPeriodRevenue) / previousPeriodRevenue) * 100
    : 0;
  const netProfitGrowthPercent = previousPeriodNetProfit != null && previousPeriodNetProfit !== 0
    ? ((netProfit - previousPeriodNetProfit) / Math.abs(previousPeriodNetProfit)) * 100
    : 0;

  // ── Break-Even Analysis ────────────────────────────────────────────────────
  const variableCostRatio = revenue > 0 ? costOfGoodsSold / revenue : 0;
  const contributionMarginRatio = 1 - variableCostRatio;
  const breakEvenSales = contributionMarginRatio > 0 ? fixedCosts / contributionMarginRatio : 0;
  const breakEvenSafetyMarginPercent = breakEvenSales > 0 && revenue > 0
    ? ((revenue - breakEvenSales) / revenue) * 100
    : 0;

  // ── Performance Score (0–100) ──────────────────────────────────────────────
  const marginScore = Math.min(100, Math.max(0, grossMarginPercent * 1.8));
  const expenseScore = Math.min(100, Math.max(0, 100 - (totalOperatingExpenses / revenue) * 100 * 1.2));
  const growthScore = Math.min(100, Math.max(0, 50 + revenueGrowthPercent * 2));
  const breakEvenScore = Math.min(100, Math.max(0, breakEvenSafetyMarginPercent * 2.5));
  const overallScore = Math.round((marginScore * 0.30 + expenseScore * 0.25 + growthScore * 0.25 + breakEvenScore * 0.20));

  let overallStatus = 'Critical';
  if (overallScore >= 85) overallStatus = 'Excellent';
  else if (overallScore >= 70) overallStatus = 'Good';
  else if (overallScore >= 55) overallStatus = 'Fair';
  else if (overallScore >= 40) overallStatus = 'Needs Improvement';

  const performanceScore: PerformanceScore = {
    overallScore, overallStatus, marginScore, expenseScore, growthScore, breakEvenScore
  };

  // ── Recommended Actions ────────────────────────────────────────────────────
  const currSymbol = stmt.currency === 'INR' ? '₹' : '$';

  const recommendedActions: ActionItem[] = [
    {
      id: 'action-cogs',
      priority: 'Immediate (Days 1–7)',
      category: 'COGS Optimization',
      title: `Reduce Cost of Goods Sold from ${grossMarginPercent.toFixed(1)}% to >${Math.min(grossMarginPercent + 5, 75).toFixed(0)}% Gross Margin`,
      estimatedSavingsOrGain: `+${currSymbol}${Math.round(revenue * 0.04).toLocaleString()} Gross Profit`,
      steps: [
        `Renegotiate with top 3 suppliers for a minimum 8–12% volume discount (current COGS: ${currSymbol}${costOfGoodsSold.toLocaleString()})`,
        `Audit SKU-level margin reports — discontinue bottom 20% low-margin product lines`,
        `Switch procurement to quarterly purchase orders to unlock bulk pricing`,
      ]
    },
    {
      id: 'action-opex',
      priority: 'Immediate (Days 1–7)',
      category: 'OpEx Control',
      title: `Reduce Operating Expense Ratio from ${(totalOperatingExpenses / revenue * 100).toFixed(1)}% towards 35% target`,
      estimatedSavingsOrGain: `+${currSymbol}${Math.round(totalOperatingExpenses * 0.08).toLocaleString()} Cash Flow`,
      steps: [
        `Freeze all discretionary spending for 30 days and identify 2 recurring SaaS subscriptions to cancel`,
        `Convert 3 fixed payroll seats to variable contractor agreements to reduce fixed cost pressure`,
        `Automate marketing email sequences to reduce manual labor cost`,
      ]
    },
    {
      id: 'action-revenue',
      priority: '30-Day Growth Sprint',
      category: 'Revenue Expansion',
      title: `Accelerate Revenue Growth from ${revenueGrowthPercent.toFixed(1)}% to +25% run rate`,
      estimatedSavingsOrGain: `+${currSymbol}${Math.round(revenue * 0.12).toLocaleString()} Incremental Revenue`,
      steps: [
        `Launch a 30-day enterprise upsell campaign targeting top 10 high-LTV accounts`,
        `Introduce annual prepaid contract option with a 15% bundle discount to lock in ARR`,
        `Activate referral incentive program: 5% commission for every new paying account introduced`,
      ]
    },
    {
      id: 'action-cash',
      priority: '90-Day Roadmap',
      category: 'Working Capital & Cash Runway',
      title: `Accelerate accounts receivable collection to fund ${currSymbol}${Math.round(breakEvenSales).toLocaleString()} break-even threshold`,
      estimatedSavingsOrGain: `+${currSymbol}${Math.round(revenue * 0.06).toLocaleString()} Cash Cycle Improvement`,
      steps: [
        `Implement 2/10 Net 30 early payment discount — 2% off for invoices paid within 10 days`,
        `Send automated AR aging reminders at Day 15, Day 25, and Day 35`,
        `Negotiate extended accounts payable terms (Net 60) with key suppliers to lengthen cash conversion cycle`,
      ]
    },
  ];

  // ── Plain Language Explanation ─────────────────────────────────────────────
  const plainLanguageExplanation = `${stmt.businessName} generated ${currSymbol}${revenue.toLocaleString('en-US')} in revenue for ${stmt.reportingPeriod}, yielding a gross margin of ${grossMarginPercent.toFixed(1)}% and a net margin of ${netMarginPercent.toFixed(1)}%. Revenue ${revenueGrowthPercent >= 0 ? 'grew' : 'declined'} by ${Math.abs(revenueGrowthPercent).toFixed(1)}% versus the prior period. The overall business performance score is ${overallScore}/100 (${overallStatus}).`;

  return {
    grossProfit, grossMarginPercent,
    totalOperatingExpenses, operatingProfit, operatingMarginPercent,
    netProfit, netMarginPercent, expenseRatioPercent,
    revenueGrowthPercent, netProfitGrowthPercent,
    breakEvenSales, breakEvenSafetyMarginPercent,
    performanceScore,
    recommendedActions,
    plainLanguageExplanation,
  };
}
