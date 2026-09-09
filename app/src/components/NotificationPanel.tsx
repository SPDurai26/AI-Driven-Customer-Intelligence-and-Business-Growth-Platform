'use client';

import React from 'react';
import { useApp } from '@/lib/app-context';
import { X, AlertTriangle, Info, ShieldAlert } from 'lucide-react';

export default function NotificationPanel() {
  const { notificationOpen, setNotificationOpen, notifications } = useApp();

  if (!notificationOpen) return null;

  const criticalCount = notifications.filter(n => n.severity === 'critical').length;
  const warningCount = notifications.filter(n => n.severity === 'warning').length;

  return (
    <div
      style={{
        position: 'fixed', top: 64, right: 16, zIndex: 150,
        width: 340,
        background: 'var(--bg-card)',
        border: '1px solid var(--border-hud)',
        borderRadius: 8,
        boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 20px rgba(255,46,99,0.15)',
        overflow: 'hidden',
        animation: 'slideDown 0.2s ease',
      }}
    >
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        background: 'rgba(255, 46, 99, 0.08)',
        borderBottom: '1px solid var(--border-hud)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ShieldAlert size={14} color="var(--cyber-red)" />
          <span style={{ fontFamily: 'Orbitron', fontSize: 11, fontWeight: 800, color: '#FFFFFF' }}>
            SYSTEM ALERTS
          </span>
          {criticalCount > 0 && (
            <span style={{
              background: 'var(--cyber-red)', color: '#fff',
              fontSize: 9, fontWeight: 800, padding: '1px 6px', borderRadius: 3,
            }}>
              {criticalCount} CRITICAL
            </span>
          )}
          {warningCount > 0 && (
            <span style={{
              background: '#F59E0B', color: '#000',
              fontSize: 9, fontWeight: 800, padding: '1px 6px', borderRadius: 3,
            }}>
              {warningCount} WARN
            </span>
          )}
        </div>
        <button className="btn-ghost" onClick={() => setNotificationOpen(false)} style={{ padding: 4 }}>
          <X size={14} />
        </button>
      </div>

      {/* Alert List */}
      <div style={{ maxHeight: 380, overflowY: 'auto', padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {notifications.map((n) => {
          const isCritical = n.severity === 'critical';
          const isWarning = n.severity === 'warning';
          const color = isCritical ? '#FF2E63' : isWarning ? '#F59E0B' : '#10B981';
          const bg = isCritical ? 'rgba(255,46,99,0.08)' : isWarning ? 'rgba(245,158,11,0.08)' : 'rgba(16,185,129,0.08)';
          const Icon = isCritical ? AlertTriangle : isWarning ? AlertTriangle : Info;

          return (
            <div
              key={n.id}
              style={{
                background: bg,
                border: `1px solid ${color}33`,
                borderRadius: 6,
                padding: '10px 12px',
                display: 'flex', gap: 8, alignItems: 'flex-start',
              }}
            >
              <Icon size={14} color={color} style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <div style={{ fontFamily: 'Orbitron', fontSize: 10, fontWeight: 800, color: '#FFFFFF', marginBottom: 2 }}>
                  {n.title}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {n.detail}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ padding: '8px 16px', borderTop: '1px solid var(--border-subtle)', fontSize: 9, fontFamily: 'JetBrains Mono', color: 'var(--text-muted)' }}>
        ● ALERTS AUTO-COMPUTED FROM LIVE FINANCIAL DATA
      </div>
    </div>
  );
}
