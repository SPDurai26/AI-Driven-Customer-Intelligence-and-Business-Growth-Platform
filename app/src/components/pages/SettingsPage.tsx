'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/app-context';
import { Settings, Bell, Shield, CreditCard, Users, Zap, Check, Building2, Bot, Cpu } from 'lucide-react';

export default function SettingsPage() {
  const { pnlStatement, setPnLStatement } = useApp();

  const [bizName, setBizName] = useState(pnlStatement.businessName);
  const [industry, setIndustry] = useState(pnlStatement.industry);
  const [currency, setCurrency] = useState(pnlStatement.currency);
  const [period, setPeriod] = useState(pnlStatement.reportingPeriod);
  const [savedStatus, setSavedStatus] = useState<string | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setPnLStatement({
      ...pnlStatement,
      businessName: bizName,
      industry: industry,
      currency: currency,
      reportingPeriod: period,
    });
    setSavedStatus('SYSTEM CONFIGURATION SYNCHRONIZED');
    setTimeout(() => setSavedStatus(null), 3000);
  };

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
            background: 'linear-gradient(135deg, #9945FF 0%, #FF2E63 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 15px rgba(153, 69, 255, 0.4)', flexShrink: 0,
          }}>
            <Settings size={22} color="#000003" />
          </div>
          <div>
            <h1 style={{ fontFamily: 'Orbitron', fontSize: 18, fontWeight: 900, color: '#FFFFFF', marginBottom: 4 }}>
              SYSTEM ARCHITECTURE & CONFIGURATION
            </h1>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Configure corporate metadata, accounting currency, and AI Co-Founder diagnostic triggers.
            </p>
          </div>
        </div>
      </div>

      {savedStatus && (
        <div style={{
          background: 'rgba(0, 255, 136, 0.1)', border: '1px solid rgba(0, 255, 136, 0.35)',
          borderRadius: 4, padding: '10px 14px', fontSize: 11, fontFamily: 'Orbitron', color: 'var(--cyber-emerald)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <Check size={14} /> {savedStatus}
        </div>
      )}

      {/* Settings Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
        
        {/* Business Profile Form */}
        <div className="hud-corner-box" style={{ padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Building2 size={16} color="var(--cyber-cyan)" />
            <h3 style={{ fontFamily: 'Orbitron', fontSize: 13, fontWeight: 800, color: '#FFFFFF' }}>
              CORPORATE PROFILE LEDGER
            </h3>
          </div>

          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontFamily: 'Orbitron', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>BUSINESS LEGAL ENTITY NAME</label>
              <input
                className="input"
                value={bizName}
                onChange={e => setBizName(e.target.value)}
                required
                style={{ fontSize: 13 }}
              />
            </div>

            <div>
              <label style={{ fontSize: 11, fontFamily: 'Orbitron', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>PRIMARY INDUSTRY / SECTOR</label>
              <input
                className="input"
                value={industry}
                onChange={e => setIndustry(e.target.value)}
                required
                style={{ fontSize: 13 }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontSize: 11, fontFamily: 'Orbitron', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>ACCOUNTING CURRENCY</label>
                <select
                  className="input"
                  value={currency}
                  onChange={e => setCurrency(e.target.value)}
                  style={{ fontSize: 13 }}
                >
                  <option value="USD">USD ($)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 11, fontFamily: 'Orbitron', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>REPORTING PERIOD</label>
                <input
                  className="input"
                  value={period}
                  onChange={e => setPeriod(e.target.value)}
                  required
                  style={{ fontSize: 13 }}
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: 6, justifyContent: 'center' }}>
              SYNC PROFILE CHANGES [SAVE]
            </button>
          </form>
        </div>

        {/* AI Co-Founder Configuration */}
        <div className="hud-corner-box hud-corner-cyan" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <Cpu size={16} color="var(--cyber-cyan)" />
            <h3 style={{ fontFamily: 'Orbitron', fontSize: 13, fontWeight: 800, color: '#FFFFFF' }}>
              AI CO-FOUNDER REASONING CONTROLS
            </h3>
          </div>

          {[
            { label: 'MULTI-STATEMENT REASONING', desc: 'Cross-correlate P&L, Balance Sheet, and SaaS Cohorts in live consultation', enabled: true },
            { label: 'AUTOMATIC BREAK-EVEN ALERTS', desc: 'Trigger warnings when OpEx ratio exceeds 60% threshold', enabled: true },
            { label: 'COHORT CHURN INTERCEPTION', desc: 'Proactively suggest Day 1–45 onboarding check-in sprints', enabled: true },
            { label: 'DECISION SUPPORT COMPLIANCE', desc: 'Include statutory non-tax disclaimer on financial exports', enabled: true },
          ].map(setting => (
            <div key={setting.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <div>
                <div style={{ fontSize: 11, fontFamily: 'Orbitron', fontWeight: 800, color: '#FFFFFF', marginBottom: 1 }}>{setting.label}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{setting.desc}</div>
              </div>
              <span className="badge badge-uncommon" style={{ fontSize: 8 }}>ACTIVE</span>
            </div>
          ))}

          <div style={{ background: '#060913', borderRadius: 4, padding: 12, border: '1px solid var(--border-cyan)', marginTop: 'auto' }}>
            <div style={{ fontSize: 11, fontFamily: 'Orbitron', fontWeight: 800, color: 'var(--cyber-cyan)', marginBottom: 2 }}>
              MODEL: GEMINI-2.5-FLASH + LOCAL ENGINE
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
              Connected with deterministic accounting ratios for instantaneous financial audits.
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
