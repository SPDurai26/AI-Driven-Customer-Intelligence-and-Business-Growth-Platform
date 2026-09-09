'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useApp } from '@/lib/app-context';
import { PnLStatement, DEFAULT_PNL_STATEMENT, INR_SAMPLE_PNL_STATEMENT } from '@/lib/report-store';
import { parsePnLFromText, ParsedLineItem } from '@/lib/pnl-parser';
import { X, Upload, FileText, Check, Sparkles, AlertTriangle } from 'lucide-react';

export default function ReportSubmissionModal() {
  const { data: session } = useSession();
  const userEmail = session?.user?.email;
  const isBharat = userEmail === 'bharat@demo.com' || (!userEmail && typeof window !== 'undefined' && window.location.search.includes('bharat'));

  const { isReportModalOpen, setIsReportModalOpen, pnlStatement, syncAllFinancials, setCurrentPage } = useApp();

  const [activeTab, setActiveTab] = useState<'upload' | 'manual' | 'presets'>('upload');
  const [rawText, setRawText] = useState('');
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [extractedItems, setExtractedItems] = useState<ParsedLineItem[]>([]);

  const [form, setForm] = useState<PnLStatement>({ ...pnlStatement });

  if (!isReportModalOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv') && !file.name.toLowerCase().endsWith('.txt')) {
      setUploadStatus('ERROR: Please upload a .csv or .txt file. Excel/PDF parsing coming soon.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const result = parsePnLFromText(text, file.name);
        setForm(result.statement);
        setExtractedItems(result.extractedLineItems);
        const realCount = result.extractedLineItems.filter(i => !i.isEstimated).length;
        setUploadStatus(`EXTRACTED ${realCount} RECONCILED LINE ITEMS FROM "${file.name}" (${result.confidence}% CONFIDENCE)`);
        setActiveTab('manual');
      } catch (err) {
        console.error(err);
        setUploadStatus('COULD NOT PARSE FILE. ENTER VALUES IN VERIFICATION FORM.');
      }
    };
    reader.readAsText(file);
  };

  const handlePasteParse = () => {
    if (!rawText.trim()) return;
    const result = parsePnLFromText(rawText, 'Pasted_Statement.txt');
    setForm(result.statement);
    setExtractedItems(result.extractedLineItems);
    const realCount = result.extractedLineItems.filter(i => !i.isEstimated).length;
    setUploadStatus(`EXTRACTED ${realCount} RECONCILED FINANCIAL ENTRIES`);
    setActiveTab('manual');
  };

  const handleApplyPreset = (preset: PnLStatement) => {
    syncAllFinancials(preset);
    setForm({ ...preset });
    setExtractedItems([]);
    setUploadStatus(`LOADED & SYNCHRONIZED ALL LEDGERS: ${preset.businessName}`);
    setTimeout(() => {
      setIsReportModalOpen(false);
      setUploadStatus(null);
    }, 400);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Recalculate fixed costs in case user edited expenses manually
    const finalForm = {
      ...form,
      fixedCosts: form.expenses.rentAndUtilities + form.expenses.employeeExpenses + form.expenses.depreciation
    };

    // Synchronizes P&L, Balance Sheet, Market Sales, and Customer Cohort Retention
    syncAllFinancials(finalForm);
    setIsReportModalOpen(false);
    setCurrentPage('dashboard');
  };

  const currSymbol = form.currency === 'INR' ? '₹' : form.currency === 'EUR' ? '€' : form.currency === 'GBP' ? '£' : '$';

  const isFieldEstimated = (key: string) => {
    if (extractedItems.length === 0) return false;
    const item = extractedItems.find(i => i.key.toLowerCase().includes(key.toLowerCase()));
    return item ? item.isEstimated : false;
  };

  const estimatedCount = extractedItems.filter(i => i.isEstimated).length;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 110,
      background: 'rgba(0, 0, 3, 0.92)', backdropFilter: 'blur(16px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }}>
      <div className="hud-corner-box" style={{
        width: '100%', maxWidth: 780, maxHeight: '92vh',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 0 40px rgba(255, 46, 99, 0.3)',
      }}>
        
        {/* Header */}
        <div style={{
          padding: '16px 22px', borderBottom: '1px solid var(--border-hud)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'rgba(255, 46, 99, 0.08)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 4,
              background: 'linear-gradient(135deg, #FF2E63 0%, #00F0FF 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 15px rgba(255,46,99,0.4)',
            }}>
              <FileText size={18} color="#000003" />
            </div>
            <div>
              <h2 style={{ fontFamily: 'Orbitron', fontSize: 15, fontWeight: 900, color: '#FFFFFF' }}>
                FINANCIAL STATEMENT SYNC // ALL 4 DIMENSIONS
              </h2>
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Reconciles P&L, Balance Sheet Liquidity, Regional Sales, and Cohort Retention
              </p>
            </div>
          </div>
          <button className="btn-ghost" onClick={() => setIsReportModalOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* Cyber Tab Navigation */}
        <div style={{ display: 'flex', gap: 6, padding: '10px 22px', background: '#040711', borderBottom: '1px solid var(--border-subtle)' }}>
          {[
            { key: 'upload', label: 'UPLOAD / PASTE STATEMENT' },
            { key: 'manual', label: 'VERIFY EXTRACTED LEDGER' },
            { key: 'presets', label: 'SAMPLE CORPORATIONS' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              style={{
                padding: '6px 14px', borderRadius: 3, border: 'none', cursor: 'pointer',
                fontSize: 10, fontFamily: 'Orbitron', fontWeight: 800,
                background: activeTab === tab.key ? 'rgba(255, 46, 99, 0.2)' : 'transparent',
                color: activeTab === tab.key ? '#FFFFFF' : 'var(--text-muted)',
                borderBottom: activeTab === tab.key ? '2px solid var(--cyber-red)' : 'none',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Body Content */}
        <div style={{ padding: '18px 22px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
          
          {uploadStatus && (
            <div style={{
              background: 'rgba(0, 255, 136, 0.1)', border: '1px solid rgba(0, 255, 136, 0.35)',
              borderRadius: 4, padding: '8px 12px', fontSize: 11, fontFamily: 'Orbitron', color: 'var(--cyber-emerald)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <Check size={13} /> {uploadStatus}
            </div>
          )}

          {/* TAB 1: UPLOAD OR PASTE */}
          {activeTab === 'upload' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              
              <div style={{
                border: '2px dashed var(--border-hud)', borderRadius: 6,
                padding: '28px 20px', textAlign: 'center',
                background: 'rgba(6, 9, 19, 0.6)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              }}>
                <div style={{ width: 42, height: 42, borderRadius: 4, background: 'rgba(255, 46, 99, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Upload size={20} color="var(--cyber-red)" />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontFamily: 'Orbitron', fontWeight: 800, color: '#FFFFFF' }}>
                    UPLOAD FINANCIAL STATEMENT [CSV / TXT]
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    Structured CSV parsing extracts Revenue, COGS, Payroll, Rent, Marketing, Depreciation, and Taxes
                  </div>
                </div>
                <label className="btn-primary" style={{ cursor: 'pointer', marginTop: 4, fontSize: 11 }}>
                  SELECT CSV / TXT FILE
                  <input type="file" accept=".csv,.txt" onChange={handleFileUpload} style={{ display: 'none' }} />
                </label>
                <div style={{ fontSize: 10, color: '#F59E0B', marginTop: 4 }}>
                  ℹ️ Note: For Excel (.xlsx) or PDF reports, export as CSV before uploading for 100% accurate column parsing.
                </div>
              </div>

              <div>
                <label style={{ fontSize: 10, fontFamily: 'Orbitron', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                  OR PASTE RAW LEDGER TEXT FROM ACCOUNTING SOFTWARE:
                </label>
                <textarea
                  className="input"
                  rows={4}
                  value={rawText}
                  onChange={e => setRawText(e.target.value)}
                  placeholder={`Revenue: 125,000\nCost of Goods: 48,000\nSalaries: 22,000\nRent: 8,000\nMarketing: 9,500\nTaxes: 4,200`}
                  style={{ fontSize: 11, fontFamily: 'JetBrains Mono' }}
                />
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handlePasteParse}
                  disabled={!rawText.trim()}
                  style={{ marginTop: 6, fontSize: 11 }}
                >
                  <Sparkles size={12} /> EXTRACT LINE ITEMS [PARSE]
                </button>
              </div>

            </div>
          )}

          {/* TAB 2: MANUAL VERIFICATION */}
          {activeTab === 'manual' && (
            <form id="pnl-confirm-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              
              {extractedItems.length > 0 && estimatedCount > 0 && (
                <div style={{
                  background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.35)',
                  borderRadius: 4, padding: '8px 12px', fontSize: 11, color: '#F59E0B',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <AlertTriangle size={13} style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: '#F59E0B' }}>
                    <strong>{estimatedCount} field(s)</strong> were not detected in the file and filled with defaults (highlighted in amber). Please review and adjust if needed.
                  </span>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 10, fontFamily: 'Orbitron', color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>BUSINESS NAME</label>
                  <input
                    className="input"
                    value={form.businessName}
                    onChange={e => setForm({ ...form, businessName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: 10, fontFamily: 'Orbitron', color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>INDUSTRY</label>
                  <input
                    className="input"
                    value={form.industry}
                    onChange={e => setForm({ ...form, industry: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: 10, fontFamily: 'Orbitron', color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>PERIOD</label>
                  <input
                    className="input"
                    value={form.reportingPeriod}
                    onChange={e => setForm({ ...form, reportingPeriod: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: 10, fontFamily: 'Orbitron', color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>CURRENCY</label>
                  <select
                    className="input"
                    value={form.currency}
                    onChange={e => setForm({ ...form, currency: e.target.value })}
                  >
                    <option value="USD">USD ($)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>

              <div style={{ background: '#060913', borderRadius: 4, padding: 12, border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: 10, fontFamily: 'Orbitron', fontWeight: 800, color: 'var(--cyber-cyan)', display: 'block', marginBottom: 8 }}>
                  1. REVENUE & COST OF GOODS SOLD
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ fontSize: 10, color: isFieldEstimated('revenue') ? '#F59E0B' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 3 }}>
                      {isFieldEstimated('revenue') && <AlertTriangle size={10} />}
                      TOTAL REVENUE ({currSymbol}) {isFieldEstimated('revenue') && '(estimated)'}
                    </label>
                    <input
                      type="number"
                      className="input"
                      value={form.revenue}
                      onChange={e => setForm({ ...form, revenue: Number(e.target.value) })}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 10, color: isFieldEstimated('cogs') ? '#F59E0B' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 3 }}>
                      {isFieldEstimated('cogs') && <AlertTriangle size={10} />}
                      COGS ({currSymbol}) {isFieldEstimated('cogs') && '(estimated)'}
                    </label>
                    <input
                      type="number"
                      className="input"
                      value={form.costOfGoodsSold}
                      onChange={e => setForm({ ...form, costOfGoodsSold: Number(e.target.value) })}
                      required
                    />
                  </div>
                </div>
              </div>

              <div style={{ background: '#060913', borderRadius: 4, padding: 12, border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: 10, fontFamily: 'Orbitron', fontWeight: 800, color: 'var(--cyber-emerald)', display: 'block', marginBottom: 8 }}>
                  2. OPERATING EXPENSES BREAKDOWN
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ fontSize: 10, color: isFieldEstimated('employee') ? '#F59E0B' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 3 }}>
                      {isFieldEstimated('employee') && <AlertTriangle size={10} />}
                      PAYROLL ({currSymbol}) {isFieldEstimated('employee') && '(est.)'}
                    </label>
                    <input
                      type="number"
                      className="input"
                      value={form.expenses.employeeExpenses}
                      onChange={e => setForm({ ...form, expenses: { ...form.expenses, employeeExpenses: Number(e.target.value) } })}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 10, color: isFieldEstimated('rent') ? '#F59E0B' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 3 }}>
                      {isFieldEstimated('rent') && <AlertTriangle size={10} />}
                      RENT ({currSymbol}) {isFieldEstimated('rent') && '(est.)'}
                    </label>
                    <input
                      type="number"
                      className="input"
                      value={form.expenses.rentAndUtilities}
                      onChange={e => setForm({ ...form, expenses: { ...form.expenses, rentAndUtilities: Number(e.target.value) } })}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 10, color: isFieldEstimated('marketing') ? '#F59E0B' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 3 }}>
                      {isFieldEstimated('marketing') && <AlertTriangle size={10} />}
                      MARKETING ({currSymbol}) {isFieldEstimated('marketing') && '(est.)'}
                    </label>
                    <input
                      type="number"
                      className="input"
                      value={form.expenses.marketingExpenses}
                      onChange={e => setForm({ ...form, expenses: { ...form.expenses, marketingExpenses: Number(e.target.value) } })}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 10, color: isFieldEstimated('depreciation') ? '#F59E0B' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 3 }}>
                      {isFieldEstimated('depreciation') && <AlertTriangle size={10} />}
                      DEPRECIATION ({currSymbol}) {isFieldEstimated('depreciation') && '(est.)'}
                    </label>
                    <input
                      type="number"
                      className="input"
                      value={form.expenses.depreciation}
                      onChange={e => setForm({ ...form, expenses: { ...form.expenses, depreciation: Number(e.target.value) } })}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 10, color: isFieldEstimated('interest') ? '#F59E0B' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 3 }}>
                      {isFieldEstimated('interest') && <AlertTriangle size={10} />}
                      INTEREST ({currSymbol}) {isFieldEstimated('interest') && '(est.)'}
                    </label>
                    <input
                      type="number"
                      className="input"
                      value={form.expenses.interestExpenses}
                      onChange={e => setForm({ ...form, expenses: { ...form.expenses, interestExpenses: Number(e.target.value) } })}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 10, color: isFieldEstimated('taxes') ? '#F59E0B' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 3 }}>
                      {isFieldEstimated('taxes') && <AlertTriangle size={10} />}
                      TAXES ({currSymbol}) {isFieldEstimated('taxes') && '(est.)'}
                    </label>
                    <input
                      type="number"
                      className="input"
                      value={form.expenses.taxes}
                      onChange={e => setForm({ ...form, expenses: { ...form.expenses, taxes: Number(e.target.value) } })}
                    />
                  </div>
                </div>
              </div>

            </form>
          )}

          {/* TAB 3: PRESETS */}
          {activeTab === 'presets' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12, maxWidth: 540, margin: '0 auto' }}>
              {!isBharat ? (
                <div className="hud-corner-box" style={{ padding: 16, cursor: 'pointer' }} onClick={() => handleApplyPreset(DEFAULT_PNL_STATEMENT)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontFamily: 'Orbitron', fontWeight: 800, fontSize: 12, color: '#FFFFFF' }}>Apex Retail & Distribution</span>
                    <span className="badge badge-rare">USD ($)</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    $124.5K Revenue · $48.2K COGS · Employee costs outpacing sales (+22%)
                  </div>
                  <button className="btn-secondary" style={{ marginTop: 10, width: '100%', fontSize: 10, justifyContent: 'center' }}>
                    LOAD APEX STATEMENT (YOUR ACCOUNT PRESET)
                  </button>
                </div>
              ) : (
                <div className="hud-corner-box" style={{ padding: 16, cursor: 'pointer' }} onClick={() => handleApplyPreset(INR_SAMPLE_PNL_STATEMENT)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontFamily: 'Orbitron', fontWeight: 800, fontSize: 12, color: '#FFFFFF' }}>Bharat Precision Works</span>
                    <span className="badge badge-uncommon">INR (₹)</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    ₹1.00 Cr Revenue · ₹58 Lakh COGS · ₹16.5 Lakh Payroll expenses
                  </div>
                  <button className="btn-secondary" style={{ marginTop: 10, width: '100%', fontSize: 10, justifyContent: 'center' }}>
                    LOAD BHARAT STATEMENT (YOUR ACCOUNT PRESET)
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '14px 22px', borderTop: '1px solid var(--border-hud)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: '#020308',
        }}>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
            ● SYNCS P&L, BALANCE SHEET, REGIONAL SALES & COHORTS
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="btn-secondary" onClick={() => setIsReportModalOpen(false)}>
              CANCEL [ESC]
            </button>
            <button type="submit" form="pnl-confirm-form" className="btn-primary" onClick={activeTab !== 'manual' ? () => setActiveTab('manual') : undefined}>
              <Sparkles size={12} /> SYNC & RUN AI AUDIT
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
