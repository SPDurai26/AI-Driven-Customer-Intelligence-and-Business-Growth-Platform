// ============================================================================
// BALANCE SHEET ENGINE — Liquidity & Solvency Ratio Calculator
// Inspired by preyalameta02/balance-sheet-analysis
// ============================================================================

import { BalanceSheet } from './report-store';

export interface BalanceSheetRecommendation {
  priority: string;
  title: string;
  rationale: string;
  steps: string[];
  expectedLift: string;
}

export interface CalculatedBalanceSheetRatios {
  // Asset totals
  totalCurrentAssets: number;
  totalNonCurrentAssets: number;
  totalAssets: number;

  // Liability totals
  totalCurrentLiabilities: number;
  totalNonCurrentLiabilities: number;
  totalLiabilities: number;

  // Equity
  totalEquity: number;

  // Equation validation
  equationBalanced: boolean;
  equationDifference: number;

  // Liquidity Ratios
  workingCapital: number;
  workingCapitalGrowthPercent: number;
  currentRatio: number;
  quickRatio: number;
  cashRatio: number;

  // Solvency / Leverage
  debtToEquityRatio: number;
  debtToAssetsRatio: number;

  // Health Score
  solvencyScore: number;
  solvencyStatus: string;

  // Recommendations
  recommendations: BalanceSheetRecommendation[];
  plainLanguageSummary: string;
}

export function calculateBalanceSheetRatios(bs: BalanceSheet): CalculatedBalanceSheetRatios {
  const { assets, liabilities, equity, previousPeriod } = bs;

  // ── Asset Totals ──────────────────────────────────────────────────────────
  const totalCurrentAssets =
    assets.cashAndEquivalents +
    assets.accountsReceivable +
    assets.inventory +
    assets.prepaidExpenses;

  const totalNonCurrentAssets =
    assets.propertyPlantEquipment +
    assets.intangibleAssets +
    assets.otherAssets;

  const totalAssets = totalCurrentAssets + totalNonCurrentAssets;

  // ── Liability Totals ──────────────────────────────────────────────────────
  const totalCurrentLiabilities =
    liabilities.accountsPayable +
    liabilities.shortTermDebt +
    liabilities.accruedLiabilities;

  const totalNonCurrentLiabilities =
    liabilities.longTermDebt +
    liabilities.otherLiabilities;

  const totalLiabilities = totalCurrentLiabilities + totalNonCurrentLiabilities;

  // ── Equity ────────────────────────────────────────────────────────────────
  const totalEquity = equity.paidInCapital + equity.retainedEarnings;

  // ── Accounting Equation Check: Assets = Liabilities + Equity ─────────────
  const calculatedRHS = totalLiabilities + totalEquity;
  const equationDifference = Math.abs(totalAssets - calculatedRHS);
  const equationBalanced = equationDifference < 1;

  // ── Liquidity Ratios ──────────────────────────────────────────────────────
  const workingCapital = totalCurrentAssets - totalCurrentLiabilities;
  const prevWorkingCapital = previousPeriod?.workingCapital ?? workingCapital;
  const workingCapitalGrowthPercent = prevWorkingCapital !== 0
    ? ((workingCapital - prevWorkingCapital) / Math.abs(prevWorkingCapital)) * 100
    : 0;

  const currentRatio = totalCurrentLiabilities > 0 ? totalCurrentAssets / totalCurrentLiabilities : 0;
  const liquidAssets = assets.cashAndEquivalents + assets.accountsReceivable; // Quick assets
  const quickRatio = totalCurrentLiabilities > 0 ? liquidAssets / totalCurrentLiabilities : 0;
  const cashRatio = totalCurrentLiabilities > 0 ? assets.cashAndEquivalents / totalCurrentLiabilities : 0;

  // ── Solvency / Leverage ───────────────────────────────────────────────────
  const totalDebt = liabilities.shortTermDebt + liabilities.longTermDebt;
  const debtToEquityRatio = totalEquity > 0 ? totalDebt / totalEquity : 0;
  const debtToAssetsRatio = totalAssets > 0 ? totalDebt / totalAssets : 0;

  // ── Solvency Score (0–100) ────────────────────────────────────────────────
  let solvencyScore = 50;
  if (currentRatio >= 2.0) solvencyScore += 20;
  else if (currentRatio >= 1.5) solvencyScore += 12;
  else if (currentRatio >= 1.0) solvencyScore += 4;
  else solvencyScore -= 15;

  if (quickRatio >= 1.0) solvencyScore += 15;
  else if (quickRatio >= 0.7) solvencyScore += 6;
  else solvencyScore -= 10;

  if (debtToEquityRatio <= 0.5) solvencyScore += 15;
  else if (debtToEquityRatio <= 1.0) solvencyScore += 6;
  else if (debtToEquityRatio <= 2.0) solvencyScore -= 5;
  else solvencyScore -= 15;

  solvencyScore = Math.max(0, Math.min(100, solvencyScore));

  let solvencyStatus = 'Financially Distressed';
  if (solvencyScore >= 85) solvencyStatus = 'Very Strong Solvency';
  else if (solvencyScore >= 70) solvencyStatus = 'Healthy Liquidity';
  else if (solvencyScore >= 55) solvencyStatus = 'Adequate — Monitor Closely';
  else if (solvencyScore >= 40) solvencyStatus = 'Liquidity Concern';

  const currSymbol = bs.currency === 'INR' ? '₹' : '$';

  // ── Recommendations ───────────────────────────────────────────────────────
  const recommendations: BalanceSheetRecommendation[] = [
    {
      priority: 'CRITICAL',
      title: 'Accelerate Accounts Receivable Collections',
      rationale: `You currently hold ${currSymbol}${assets.accountsReceivable.toLocaleString()} in outstanding receivables. Collecting faster directly increases your working capital (currently ${currSymbol}${workingCapital.toLocaleString()}) and cash ratio (${cashRatio.toFixed(2)}x).`,
      steps: [
        'Introduce 2/10 Net 30 early payment discount — 2% off for payments within 10 days',
        'Automate AR aging dunning emails at Day 15, 25, and 35',
        'Escalate accounts >45 days overdue to a collections agency',
      ],
      expectedLift: `+${currSymbol}${Math.round(assets.accountsReceivable * 0.25).toLocaleString()} Cash in 30 days`,
    },
    {
      priority: 'HIGH',
      title: 'Optimize Inventory Turnover Rate',
      rationale: `Inventory of ${currSymbol}${assets.inventory.toLocaleString()} represents ${((assets.inventory / totalCurrentAssets) * 100).toFixed(0)}% of current assets. Slow-turning stock unnecessarily ties up working capital.`,
      steps: [
        'Classify all SKUs into A/B/C tiers by velocity — liquidate C-tier at a 20% markdown',
        'Implement Just-In-Time (JIT) replenishment for the top 20% of fast-moving SKUs',
        'Negotiate vendor-managed inventory (VMI) agreements with suppliers for top 3 product lines',
      ],
      expectedLift: `+${currSymbol}${Math.round(assets.inventory * 0.18).toLocaleString()} Working Capital Release`,
    },
    {
      priority: 'MEDIUM',
      title: 'Restructure Long-Term Debt to Extend Runway',
      rationale: `Long-term debt of ${currSymbol}${liabilities.longTermDebt.toLocaleString()} results in a Debt-to-Equity ratio of ${debtToEquityRatio.toFixed(2)}x. Refinancing can reduce short-term pressure on cash flow.`,
      steps: [
        'Refinance any loans >7% APR into lower-rate facilities (target <5.5%)',
        'Convert short-term debt (${currSymbol}${liabilities.shortTermDebt.toLocaleString()}) to long-term if cash runway <6 months',
        'Explore SBA 7(a) or regional MSME government credit lines for bridge financing',
      ],
      expectedLift: `${currSymbol}${Math.round((liabilities.shortTermDebt + liabilities.longTermDebt) * 0.08).toLocaleString()} Annual Interest Savings`,
    },
  ];

  const plainLanguageSummary = `${bs.businessName} holds ${currSymbol}${totalAssets.toLocaleString()} in total assets against ${currSymbol}${totalLiabilities.toLocaleString()} in liabilities, yielding ${currSymbol}${totalEquity.toLocaleString()} equity. Working Capital is ${currSymbol}${workingCapital.toLocaleString()} with a Current Ratio of ${currentRatio.toFixed(2)}x and Quick Ratio of ${quickRatio.toFixed(2)}x. Overall Solvency Score: ${solvencyScore}/100 (${solvencyStatus}).`;

  return {
    totalCurrentAssets, totalNonCurrentAssets, totalAssets,
    totalCurrentLiabilities, totalNonCurrentLiabilities, totalLiabilities,
    totalEquity,
    equationBalanced, equationDifference,
    workingCapital, workingCapitalGrowthPercent,
    currentRatio, quickRatio, cashRatio,
    debtToEquityRatio, debtToAssetsRatio,
    solvencyScore, solvencyStatus,
    recommendations,
    plainLanguageSummary,
  };
}
