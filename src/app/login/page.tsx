'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Bot, Lock, Mail, LogIn, AlertCircle, Cpu } from 'lucide-react';

const DEMO_ACCOUNTS = [
  { email: 'apex@demo.com', password: 'apex123', name: 'Apex Retail & Distribution', currency: 'USD ($)', badge: 'US RETAIL' },
  { email: 'bharat@demo.com', password: 'bharat123', name: 'Bharat Precision Works', currency: 'INR (₹)', badge: 'IND MFG' },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError('Invalid credentials. Use the demo accounts below.');
    } else {
      router.push('/');
      router.refresh();
    }
    setLoading(false);
  };

  const handleQuickLogin = async (acc: typeof DEMO_ACCOUNTS[0]) => {
    setLoading(true);
    setError('');
    const result = await signIn('credentials', {
      email: acc.email,
      password: acc.password,
      redirect: false,
    });
    if (result?.error) {
      setError('Login failed. Please try again.');
      setLoading(false);
    } else {
      router.push('/');
      router.refresh();
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-base)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      fontFamily: 'Rajdhani, sans-serif',
    }}>
      {/* Background grid effect */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: 'linear-gradient(rgba(255,46,99,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,46,99,0.04) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        pointerEvents: 'none',
      }} />

      <div style={{
        position: 'relative', zIndex: 1,
        width: '100%', maxWidth: 480,
        display: 'flex', flexDirection: 'column', gap: 20,
      }}>

        {/* Logo Header */}
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 8, margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #FF2E63 0%, #00F0FF 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 30px rgba(255, 46, 99, 0.5)',
          }}>
            <Cpu size={32} color="#000003" />
          </div>
          <h1 style={{ fontFamily: 'Orbitron', fontSize: 22, fontWeight: 900, color: '#FFFFFF', letterSpacing: '0.08em' }}>
            AI CONSORTIUM
          </h1>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            Enterprise Financial Intelligence & AI Co-Founder Platform
          </p>
        </div>

        {/* Login Card */}
        <div className="hud-corner-box" style={{ padding: 28 }}>
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontFamily: 'Orbitron', fontSize: 14, fontWeight: 800, color: '#FFFFFF', marginBottom: 4 }}>
              SYSTEM ACCESS // AUTHENTICATE
            </h2>
            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Demo platform — use one of the pre-loaded accounts below
            </p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 10, fontFamily: 'Orbitron', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                <Mail size={10} style={{ display: 'inline', marginRight: 4 }} />
                EMAIL ADDRESS
              </label>
              <input
                className="input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="apex@demo.com"
                required
                style={{ fontSize: 13 }}
              />
            </div>

            <div>
              <label style={{ fontSize: 10, fontFamily: 'Orbitron', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                <Lock size={10} style={{ display: 'inline', marginRight: 4 }} />
                PASSWORD
              </label>
              <input
                className="input"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{ fontSize: 13 }}
              />
            </div>

            {error && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'rgba(255, 46, 99, 0.1)', border: '1px solid rgba(255, 46, 99, 0.3)',
                borderRadius: 4, padding: '8px 12px', fontSize: 11, color: 'var(--cyber-red)',
              }}>
                <AlertCircle size={13} />
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ justifyContent: 'center', padding: '11px 16px', fontSize: 12 }}
            >
              <LogIn size={14} />
              {loading ? 'AUTHENTICATING...' : 'INITIALIZE SESSION [LOGIN]'}
            </button>
          </form>
        </div>

        {/* Quick-login demo accounts */}
        <div>
          <div style={{ fontSize: 10, fontFamily: 'Orbitron', color: 'var(--text-muted)', marginBottom: 10, textAlign: 'center' }}>
            ── DEMO ACCOUNTS (QUICK ACCESS) ──
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                className="hud-corner-box"
                onClick={() => handleQuickLogin(acc)}
                disabled={loading}
                style={{
                  padding: 14, cursor: 'pointer', textAlign: 'left',
                  border: '1px solid var(--border-hud)',
                  background: 'var(--bg-card)',
                  display: 'flex', flexDirection: 'column', gap: 4,
                  transition: 'all 0.15s ease',
                  fontFamily: 'inherit',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Bot size={14} color="var(--cyber-cyan)" />
                  <span className="badge badge-rare" style={{ fontSize: 8 }}>{acc.badge}</span>
                </div>
                <div style={{ fontFamily: 'Orbitron', fontSize: 10, fontWeight: 800, color: '#FFFFFF', lineHeight: 1.3 }}>
                  {acc.name}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{acc.currency}</div>
                <div style={{ fontSize: 9, color: 'var(--cyber-cyan)', fontFamily: 'JetBrains Mono', marginTop: 2 }}>
                  {acc.email}
                </div>
              </button>
            ))}
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: 9, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
          ● DEMO AUTH — NOT FOR PRODUCTION USE ● CREDENTIALS ARE HARDCODED ●
        </p>
      </div>
    </div>
  );
}
