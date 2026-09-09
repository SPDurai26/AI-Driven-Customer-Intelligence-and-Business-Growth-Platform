'use client';

import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import {
  PnLStatement, DEFAULT_PNL_STATEMENT, INR_SAMPLE_PNL_STATEMENT,
  BalanceSheet, DEFAULT_BALANCE_SHEET, INR_SAMPLE_BALANCE_SHEET,
  MarketSalesRecord, DEFAULT_MARKET_SALES_REPORT, INR_SAMPLE_MARKET_SALES_REPORT,
  CohortAnalysisDataset, DEFAULT_COHORT_DATASET, INR_SAMPLE_COHORT_DATASET,
  deriveBalanceSheetFromPnL, deriveMarketSalesFromPnL, deriveCohortDatasetFromPnL,
} from './report-store';
import { CalculatedFinancialRatios, calculatePnLMetrics } from './financial-engine';
import { CalculatedBalanceSheetRatios, calculateBalanceSheetRatios } from './balance-sheet-engine';
import { CalculatedCohortMetrics, calculateCohortMetrics } from './cohort-engine';

export type Page =
  | 'dashboard'
  | 'pnl-analyzer'
  | 'balance-sheet'
  | 'market-sales'
  | 'cohort-analysis'
  | 'ai-cofounder'
  | 'growth'
  | 'reports'
  | 'settings'
  | 'achievements';

export interface Notification {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  detail: string;
}

interface AppContextType {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  notificationOpen: boolean;
  setNotificationOpen: (open: boolean) => void;
  notifications: Notification[];
  aiChatOpen: boolean;
  setAiChatOpen: (open: boolean) => void;

  // 1. P&L Statement & Accounting Engine
  pnlStatement: PnLStatement;
  setPnLStatement: (stmt: PnLStatement) => void;
  metrics: CalculatedFinancialRatios;

  // 2. Balance Sheet & Liquidity / Solvency Engine
  balanceSheet: BalanceSheet;
  setBalanceSheet: (bs: BalanceSheet) => void;
  balanceSheetMetrics: CalculatedBalanceSheetRatios;

  // 3. Market Sales & Regional Variance
  marketSalesReport: MarketSalesRecord[];
  setMarketSalesReport: (records: MarketSalesRecord[]) => void;

  // 4. SaaS Cohort & Customer Retention Engine
  cohortDataset: CohortAnalysisDataset;
  setCohortDataset: (dataset: CohortAnalysisDataset) => void;
  cohortMetrics: CalculatedCohortMetrics;

  // Multi-statement synchronization
  syncAllFinancials: (stmt: PnLStatement) => void;

  // Report Upload / Edit Modal
  isReportModalOpen: boolean;
  setIsReportModalOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// ─── localStorage helpers ──────────────────────────────────────────────────────

function lsKey(userId: string, key: string) {
  return `bizai:${userId}:${key}`;
}

function sanitizePnl(pnl: PnLStatement): PnLStatement {
  if (!pnl) return pnl;
  // If currency is INR and previousPeriodRevenue was stuck on the old USD default 105400, sanitize it
  if (pnl.currency === 'INR' && pnl.previousPeriodRevenue === 105400) {
    return {
      ...pnl,
      previousPeriodRevenue: pnl.revenue >= 5000000 ? 8900000 : null,
      previousPeriodNetProfit: pnl.revenue >= 5000000 ? 920000 : null,
    };
  }
  return pnl;
}

function lsGet<T>(userId: string, key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(lsKey(userId, key));
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as T;
    if (key === 'pnl') return sanitizePnl(parsed as unknown as PnLStatement) as unknown as T;
    return parsed;
  } catch {
    return fallback;
  }
}

function lsSet<T>(userId: string, key: string, value: T) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(lsKey(userId, key), JSON.stringify(value));
  } catch {
    // quota exceeded — ignore
  }
}

/**
 * Checks if a stored cohort dataset looks like the old hardcoded placeholder.
 * The old code always set NRR to exactly 111.8 and used 'Jan 2024' labels.
 */
function isStaleCohorCache(cohort: CohortAnalysisDataset | null): boolean {
  if (!cohort) return false;
  return cohort.netRevenueRetentionPercent === 111.8
    || (cohort.cohorts.length > 0 && cohort.cohorts[0].cohortName === 'Jan 2024');
}

// ─── Default dataset per account ─────────────────────────────────────────────

function defaultPnlForEmail(email?: string | null): PnLStatement {
  if (email === 'bharat@demo.com') return INR_SAMPLE_PNL_STATEMENT;
  return DEFAULT_PNL_STATEMENT;
}

function defaultBsForEmail(email?: string | null): BalanceSheet {
  if (email === 'bharat@demo.com') return INR_SAMPLE_BALANCE_SHEET;
  return DEFAULT_BALANCE_SHEET;
}

function defaultMarketForEmail(email?: string | null): MarketSalesRecord[] {
  if (email === 'bharat@demo.com') return INR_SAMPLE_MARKET_SALES_REPORT;
  return DEFAULT_MARKET_SALES_REPORT;
}

function defaultCohortForEmail(email?: string | null): CohortAnalysisDataset {
  if (email === 'bharat@demo.com') return INR_SAMPLE_COHORT_DATASET;
  return DEFAULT_COHORT_DATASET;
}

// ─── Notification derivation ─────────────────────────────────────────────────

function deriveNotifications(
  metrics: CalculatedFinancialRatios,
  bsMetrics: CalculatedBalanceSheetRatios,
  cohortMetrics: CalculatedCohortMetrics,
): Notification[] {
  const alerts: Notification[] = [];

  if (metrics.netMarginPercent < 5) {
    alerts.push({
      id: 'notif-margin-critical',
      severity: 'critical',
      title: 'Net Margin Critical',
      detail: `Net margin is ${metrics.netMarginPercent.toFixed(1)}% — below the 5% survival threshold. Immediate cost reduction required.`,
    });
  } else if (metrics.netMarginPercent < 10) {
    alerts.push({
      id: 'notif-margin-low',
      severity: 'warning',
      title: 'Net Margin Below 10%',
      detail: `Current net margin ${metrics.netMarginPercent.toFixed(1)}% is below the healthy 10% target. Review operating expenses.`,
    });
  }

  if (bsMetrics.quickRatio < 1.0) {
    alerts.push({
      id: 'notif-liquidity',
      severity: 'critical',
      title: 'Liquidity Risk — Quick Ratio < 1',
      detail: `Quick ratio is ${bsMetrics.quickRatio.toFixed(2)}x. The business cannot cover short-term liabilities with liquid assets.`,
    });
  }

  if (cohortMetrics.netRevenueRetentionPercent < 90) {
    alerts.push({
      id: 'notif-nrr',
      severity: 'warning',
      title: 'NRR Below 90%',
      detail: `Net Revenue Retention of ${cohortMetrics.netRevenueRetentionPercent}% indicates customer base is contracting. Address churn urgently.`,
    });
  }

  if (metrics.revenueGrowthPercent < -5) {
    alerts.push({
      id: 'notif-revenue-decline',
      severity: 'critical',
      title: 'Revenue Declining',
      detail: `Revenue fell ${Math.abs(metrics.revenueGrowthPercent).toFixed(1)}% vs prior period. Activate growth sprint.`,
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      id: 'notif-all-clear',
      severity: 'info',
      title: 'All Systems Nominal',
      detail: `No financial alerts. Score: ${metrics.performanceScore.overallScore}/100 (${metrics.performanceScore.overallStatus}).`,
    });
  }

  return alerts;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const userId = session?.user?.email ?? 'guest';
  const userEmail = session?.user?.email;

  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Core datasets — initialized from localStorage on hydration
  const [pnlStatement, _setPnLStatement] = useState<PnLStatement>(() =>
    lsGet(userId, 'pnl', defaultPnlForEmail(userEmail))
  );
  const [balanceSheet, _setBalanceSheet] = useState<BalanceSheet>(() =>
    lsGet(userId, 'bs', defaultBsForEmail(userEmail))
  );
  const [marketSalesReport, _setMarketSalesReport] = useState<MarketSalesRecord[]>(() =>
    lsGet(userId, 'market', defaultMarketForEmail(userEmail))
  );
  const [cohortDataset, _setCohortDataset] = useState<CohortAnalysisDataset>(() =>
    lsGet(userId, 'cohort', defaultCohortForEmail(userEmail))
  );

  // Re-hydrate when userId changes (login/logout) + migrate stale cache
  useEffect(() => {
    const storedPnl = lsGet(userId, 'pnl', defaultPnlForEmail(userEmail));
    const storedCohort = lsGet<CohortAnalysisDataset | null>(userId, 'cohort', null);

    // If the stored PnL is a custom upload (not a preset) and the cohort cache is stale,
    // re-derive all 4 datasets from the stored PnL to apply the new dynamic derivation.
    const isCustomPnl = storedPnl.id !== DEFAULT_PNL_STATEMENT.id && storedPnl.id !== INR_SAMPLE_PNL_STATEMENT.id;
    if (isCustomPnl && isStaleCohorCache(storedCohort)) {
      const freshBs = deriveBalanceSheetFromPnL(storedPnl);
      const freshMarket = deriveMarketSalesFromPnL(storedPnl);
      const freshCohort = deriveCohortDatasetFromPnL(storedPnl);
      lsSet(userId, 'bs', freshBs);
      lsSet(userId, 'market', freshMarket);
      lsSet(userId, 'cohort', freshCohort);
      _setPnLStatement(storedPnl);
      _setBalanceSheet(freshBs);
      _setMarketSalesReport(freshMarket);
      _setCohortDataset(freshCohort);
    } else {
      _setPnLStatement(storedPnl);
      _setBalanceSheet(lsGet(userId, 'bs', defaultBsForEmail(userEmail)));
      _setMarketSalesReport(lsGet(userId, 'market', defaultMarketForEmail(userEmail)));
      _setCohortDataset(storedCohort ?? defaultCohortForEmail(userEmail));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Persisting setters
  const setPnLStatement = useCallback((stmt: PnLStatement) => {
    lsSet(userId, 'pnl', stmt);
    _setPnLStatement(stmt);
  }, [userId]);

  const setBalanceSheet = useCallback((bs: BalanceSheet) => {
    lsSet(userId, 'bs', bs);
    _setBalanceSheet(bs);
  }, [userId]);

  const setMarketSalesReport = useCallback((records: MarketSalesRecord[]) => {
    lsSet(userId, 'market', records);
    _setMarketSalesReport(records);
  }, [userId]);

  const setCohortDataset = useCallback((dataset: CohortAnalysisDataset) => {
    lsSet(userId, 'cohort', dataset);
    _setCohortDataset(dataset);
  }, [userId]);

  // Multi-statement synchronization
  const syncAllFinancials = useCallback((stmt: PnLStatement) => {
    const derivedBs = deriveBalanceSheetFromPnL(stmt);
    const derivedMarket = deriveMarketSalesFromPnL(stmt);
    const derivedCohort = deriveCohortDatasetFromPnL(stmt);

    lsSet(userId, 'pnl', stmt);
    lsSet(userId, 'bs', derivedBs);
    lsSet(userId, 'market', derivedMarket);
    lsSet(userId, 'cohort', derivedCohort);

    _setPnLStatement(stmt);
    _setBalanceSheet(derivedBs);
    _setMarketSalesReport(derivedMarket);
    _setCohortDataset(derivedCohort);
  }, [userId]);

  // Reactive Calculation Engines
  const metrics = useMemo(() => calculatePnLMetrics(pnlStatement), [pnlStatement]);
  const balanceSheetMetrics = useMemo(() => calculateBalanceSheetRatios(balanceSheet), [balanceSheet]);
  const cohortMetrics = useMemo(() => calculateCohortMetrics(cohortDataset), [cohortDataset]);

  // Derived notifications
  const notifications = useMemo(
    () => deriveNotifications(metrics, balanceSheetMetrics, cohortMetrics),
    [metrics, balanceSheetMetrics, cohortMetrics]
  );

  return (
    <AppContext.Provider value={{
      currentPage, setCurrentPage,
      sidebarOpen, setSidebarOpen,
      notificationOpen, setNotificationOpen,
      notifications,
      aiChatOpen, setAiChatOpen,

      pnlStatement, setPnLStatement,
      metrics,

      balanceSheet, setBalanceSheet,
      balanceSheetMetrics,

      marketSalesReport, setMarketSalesReport,

      cohortDataset, setCohortDataset,
      cohortMetrics,

      syncAllFinancials,

      isReportModalOpen, setIsReportModalOpen,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
