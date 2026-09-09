'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/app-context';
import {
  FileBarChart, Download, Calendar, Printer, FileText,
  Landmark, Globe, Users, Bot, Check, Sparkles
} from 'lucide-react';

export default function ReportsPage() {
  const { pnlStatement, metrics, balanceSheet, balanceSheetMetrics, marketSalesReport, cohortDataset, cohortMetrics } = useApp();
  const currSymbol = pnlStatement.currency === 'INR' ? '₹' : '$';

  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const triggerCsvDownload = (filename: string, csvContent: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloadSuccess(`DOWNLOAD COMPLETE // ${filename}`);
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const downloadPnLCsv = () => {
    const headers = 'Line Item,Amount,Currency,Formula Note\n';
    const rows = [
      `Gross Revenue,${pnlStatement.revenue},${pnlStatement.currency},Reported Revenue`,
      `Cost of Goods Sold,${pnlStatement.costOfGoodsSold},${pnlStatement.currency},Direct Costs`,
      `Gross Profit,${metrics.grossProfit},${pnlStatement.currency},${metrics.grossMarginPercent.toFixed(1)}% Gross Margin`,
      `Employee Expenses,${pnlStatement.expenses.employeeExpenses},${pnlStatement.currency},Payroll`,
      `Rent and Utilities,${pnlStatement.expenses.rentAndUtilities},${pnlStatement.currency},Fixed OpEx`,
      `Marketing Expenses,${pnlStatement.expenses.marketingExpenses},${pnlStatement.currency},Variable OpEx`,
      `Depreciation,${pnlStatement.expenses.depreciation},${pnlStatement.currency},Non-cash`,
      `Interest Expenses,${pnlStatement.expenses.interestExpenses},${pnlStatement.currency},Finance Charges`,
      `Taxes,${pnlStatement.expenses.taxes},${pnlStatement.currency},Statutory`,
      `Other Expenses,${pnlStatement.expenses.otherExpenses},${pnlStatement.currency},Sundry`,
      `Total Operating Expenses,${metrics.totalOperatingExpenses},${pnlStatement.currency},${metrics.expenseRatioPercent.toFixed(1)}% Ratio`,
      `Operating Profit,${metrics.operatingProfit},${pnlStatement.currency},EBIT`,
      `Net Profit,${metrics.netProfit},${pnlStatement.currency},${metrics.netMarginPercent.toFixed(1)}% Net Margin`,
    ].join('\n');
    triggerCsvDownload(`${pnlStatement.businessName}_PnL_${pnlStatement.reportingPeriod}.csv`, headers + rows);
  };

  const downloadBalanceSheetCsv = () => {
    const headers = 'Category,Item,Amount,Currency\n';
    const rows = [
      `Current Assets,Cash and Equivalents,${balanceSheet.assets.cashAndEquivalents},${balanceSheet.currency}`,
      `Current Assets,Accounts Receivable,${balanceSheet.assets.accountsReceivable},${balanceSheet.currency}`,
      `Current Assets,Inventory,${balanceSheet.assets.inventory},${balanceSheet.currency}`,
      `Current Assets,Prepaid Expenses,${balanceSheet.assets.prepaidExpenses},${balanceSheet.currency}`,
      `Non-Current Assets,Property Plant Equipment,${balanceSheet.assets.propertyPlantEquipment},${balanceSheet.currency}`,
      `Non-Current Assets,Intangible Assets,${balanceSheet.assets.intangibleAssets},${balanceSheet.currency}`,
      `Non-Current Assets,Other Assets,${balanceSheet.assets.otherAssets},${balanceSheet.currency}`,
      `Current Liabilities,Accounts Payable,${balanceSheet.liabilities.accountsPayable},${balanceSheet.currency}`,
      `Current Liabilities,Short Term Debt,${balanceSheet.liabilities.shortTermDebt},${balanceSheet.currency}`,
      `Current Liabilities,Accrued Liabilities,${balanceSheet.liabilities.accruedLiabilities},${balanceSheet.currency}`,
      `Non-Current Liabilities,Long Term Debt,${balanceSheet.liabilities.longTermDebt},${balanceSheet.currency}`,
      `Non-Current Liabilities,Other Liabilities,${balanceSheet.liabilities.otherLiabilities},${balanceSheet.currency}`,
      `Equity,Paid-In Capital,${balanceSheet.equity.paidInCapital},${balanceSheet.currency}`,
      `Equity,Retained Earnings,${balanceSheet.equity.retainedEarnings},${balanceSheet.currency}`,
      `Summary,Total Assets,${balanceSheetMetrics.totalAssets},${balanceSheet.currency}`,
      `Summary,Total Liabilities,${balanceSheetMetrics.totalLiabilities},${balanceSheet.currency}`,
      `Summary,Total Equity,${balanceSheetMetrics.totalEquity},${balanceSheet.currency}`,
      `Ratios,Working Capital,${balanceSheetMetrics.workingCapital},${balanceSheet.currency}`,
      `Ratios,Current Ratio,${balanceSheetMetrics.currentRatio.toFixed(2)},Ratio`,
      `Ratios,Quick Ratio,${balanceSheetMetrics.quickRatio.toFixed(2)},Ratio`,
    ].join('\n');
    triggerCsvDownload(`${balanceSheet.businessName}_BalanceSheet.csv`, headers + rows);
  };

  const downloadMarketSalesCsv = () => {
    const headers = 'Market Name,Gross Sales,Discounts,Net Sales,COGS,Gross Margin %,Target Sales,Variance Amount,Variance %\n';
    const rows = marketSalesReport.map(m =>
      `"${m.marketName}",${m.grossSales},${m.discountsAndAllowances},${m.netSales},${m.costOfGoodsSold},${m.grossMarginPercent},${m.targetSales},${m.varianceVsTargetAmount},${m.varianceVsTargetPercent}`
    ).join('\n');
    triggerCsvDownload(`${pnlStatement.businessName}_MarketSales_Variance.csv`, headers + rows);
  };

  const downloadCohortCsv = () => {
    const headers = 'Cohort Name,Acquired Customers,Initial MRR,M0,M1,M2,M3,M4,M5,M6,M7,M8,M9,M10,M11\n';
    const rows = cohortDataset.cohorts.map(c =>
      `"${c.cohortName}",${c.acquiredCustomers},${c.initialMrr},${c.retentionByMonth.join(',')}`
    ).join('\n');
    triggerCsvDownload(`${cohortDataset.businessName}_Cohort_Retention.csv`, headers + rows);
  };

  const handlePrint = () => {
    window.print();
  };

  const reportPackages = [
    {
      id: 'rep-pnl',
      title: 'P&L STATEMENT AUDIT LEDGER',
      desc: `Line-by-line revenue, COGS, OpEx, and Net Margin breakdown for ${pnlStatement.reportingPeriod}.`,
      icon: FileText,
      badge: `${metrics.performanceScore.overallScore}/100 SCORE`,
      badgeType: 'badge-uncommon',
      onCsv: downloadPnLCsv,
    },
    {
      id: 'rep-bs',
      title: 'BALANCE SHEET & SOLVENCY REPORT',
      desc: `Assets vs Liabilities, Current Ratio (${balanceSheetMetrics.currentRatio.toFixed(2)}x), and Net Working Capital audit.`,
      icon: Landmark,
      badge: `${balanceSheetMetrics.solvencyScore}/100 SOLVENCY`,
      badgeType: 'badge-rare',
      onCsv: downloadBalanceSheetCsv,
    },
    {
      id: 'rep-market',
      title: 'REGIONAL SALES VARIANCE DATA',
      desc: `Multi-channel gross sales, allowances, net sales, and quota variance matrix.`,
      icon: Globe,
      badge: `${marketSalesReport.length} CHANNELS`,
      badgeType: 'badge-epic',
      onCsv: downloadMarketSalesCsv,
    },
    {
      id: 'rep-cohort',
      title: 'SAAS COHORT RETENTION MATRIX',
      desc: `12-month vintage retention matrix (${cohortMetrics.netRevenueRetentionPercent}% NRR, ${cohortMetrics.ltvToCacRatio}x LTV:CAC).`,
      icon: Users,
      badge: cohortMetrics.cohortHealthStatus.toUpperCase(),
      badgeType: 'badge-legendary',
      onCsv: downloadCohortCsv,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      
      {/* Header Banner */}
      <div className="hud-corner-box" style={{
        padding: '20px 24px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 4,
            background: 'linear-gradient(135deg, #00FF88 0%, #00F0FF 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 15px rgba(0, 255, 136, 0.4)', flexShrink: 0,
          }}>
            <FileBarChart size={22} color="#000003" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <h1 style={{ fontFamily: 'Orbitron', fontSize: 18, fontWeight: 900, color: '#FFFFFF' }}>
                DATA PACKAGES & FINANCIAL EXPORTS
              </h1>
              <span className="badge badge-uncommon" style={{ fontSize: 9 }}>READY TO SYNC</span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Export validated financial models, balance sheets, and cohort matrices for <strong>{pnlStatement.businessName}</strong>.
            </p>
          </div>
        </div>

        <button className="btn-primary" onClick={handlePrint}>
          <Printer size={13} /> PRINT / SAVE PDF [EXPORT]
        </button>
      </div>

      {downloadSuccess && (
        <div style={{
          background: 'rgba(0, 255, 136, 0.1)', border: '1px solid rgba(0, 255, 136, 0.35)',
          borderRadius: 4, padding: '10px 14px', fontSize: 11, fontFamily: 'Orbitron', color: 'var(--cyber-emerald)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <Check size={14} /> {downloadSuccess}
        </div>
      )}

      {/* Report Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>
        {reportPackages.map(rep => {
          const Icon = rep.icon;
          return (
            <div key={rep.id} className="hud-corner-box" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ width: 34, height: 34, borderRadius: 4, background: 'rgba(255,46,99,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={16} color="var(--cyber-cyan)" />
                </div>
                <span className={`badge ${rep.badgeType}`} style={{ fontSize: 8 }}>{rep.badge}</span>
              </div>

              <div>
                <h3 style={{ fontFamily: 'Orbitron', fontSize: 13, fontWeight: 800, color: '#FFFFFF', marginBottom: 4 }}>
                  {rep.title}
                </h3>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  {rep.desc}
                </p>
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 'auto', paddingTop: 6 }}>
                <button
                  className="btn-primary"
                  style={{ flex: 1, fontSize: 10, padding: '7px 10px', justifyContent: 'center' }}
                  onClick={rep.onCsv}
                >
                  <Download size={12} /> EXPORT CSV
                </button>
                <button
                  className="btn-secondary"
                  style={{ fontSize: 10, padding: '7px 10px' }}
                  onClick={handlePrint}
                >
                  <Printer size={12} /> PRINT
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
