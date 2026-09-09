'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/lib/app-context';
import { Bot, X, Send, Sparkles, User, AlertTriangle } from 'lucide-react';
import MarkdownRenderer from '@/components/MarkdownRenderer';

type Message = { role: 'assistant' | 'user'; content: string };

export default function AIChatPanel() {
  const {
    aiChatOpen, setAiChatOpen,
    pnlStatement, metrics,
    balanceSheet, marketSalesReport, cohortDataset,
  } = useApp();
  const currSymbol = pnlStatement.currency === 'INR' ? '₹' : '$';

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hello! I am your **AI Co-Founder** for **${pnlStatement.businessName}**.\n\nI have analyzed your **${pnlStatement.reportingPeriod} Financials**:\n- Revenue: ${currSymbol}${pnlStatement.revenue.toLocaleString()} | Net Margin: ${metrics.netMarginPercent.toFixed(1)}%\n- Performance Score: ${metrics.performanceScore.overallScore}/100 (${metrics.performanceScore.overallStatus})\n\nAsk me anything about your financials, margins, customer retention, or growth strategy!`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  // Set to true whenever the most recent reply came from the local rule-based
  // engine rather than the real model (e.g. no GEMINI_API_KEY configured).
  const [usingFallback, setUsingFallback] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const msg = text || input;
    if (!msg.trim() || loading) return;
    setInput('');
    const newMessages: Message[] = [...messages, { role: 'user', content: msg }];
    setMessages(newMessages);
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);
    setLoading(true);

    const appendToLastAssistantMessage = (delta: string) => {
      setMessages((prev) => {
        const copy = [...prev];
        const last = copy[copy.length - 1];
        if (last?.role === 'assistant') {
          copy[copy.length - 1] = { ...last, content: last.content + delta };
        }
        return copy;
      });
    };

    try {
      const res = await fetch('/api/ai-cofounder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          history: newMessages.slice(-8),
          statement: pnlStatement,
          balanceSheet,
          marketSales: marketSalesReport,
          cohortDataset,
        }),
      });

      if (!res.ok) throw new Error('Request failed');

      const contentType = res.headers.get('Content-Type') || '';

      if (contentType.includes('text/event-stream') && res.body) {
        // Streamed reply from the real model.
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let sawFallback = false;

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const events = buffer.split('\n\n');
          buffer = events.pop() || '';

          for (const evt of events) {
            const line = evt.replace(/^data: /, '').trim();
            if (!line) continue;
            const parsed = JSON.parse(line) as { delta?: string; done?: boolean; source?: string };
            if (parsed.delta) {
              appendToLastAssistantMessage(parsed.delta);
              if (parsed.source === 'fallback') sawFallback = true;
            }
            if (parsed.done && parsed.source === 'fallback') sawFallback = true;
          }
        }
        setUsingFallback(sawFallback);
      } else {
        // Non-streamed JSON reply (no API key configured, or Gemini failed pre-stream).
        const data = await res.json();
        appendToLastAssistantMessage(data.reply);
        setUsingFallback(data.source === 'fallback');
      }
    } catch {
      appendToLastAssistantMessage(
        `Sorry — I couldn't reach the AI Co-Founder service just now. Please try again in a moment.`
      );
      setUsingFallback(true);
    } finally {
      setLoading(false);
    }
  };

  if (!aiChatOpen) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 200,
      width: 380, maxHeight: 520,
      background: 'var(--bg-card)',
      border: '1px solid var(--border-default)',
      borderRadius: 16,
      boxShadow: '0 25px 50px rgba(0,0,0,0.6)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 16px',
        background: 'linear-gradient(135deg, rgba(124,58,237,0.2) 0%, rgba(6,182,212,0.1) 100%)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bot size={16} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>AI Co-Founder</div>
            <div style={{ fontSize: 10, color: usingFallback ? 'var(--amber, #f59e0b)' : 'var(--emerald)' }}>
              {usingFallback ? '● Basic mode (no live model connected)' : '● Live Financial Analysis'}
            </div>
          </div>
        </div>
        <button className="btn-ghost" onClick={() => setAiChatOpen(false)} style={{ padding: 4 }}>
          <X size={16} />
        </button>
      </div>

      {usingFallback && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 6,
          padding: '8px 14px', fontSize: 10.5, lineHeight: 1.4,
          background: 'rgba(245,158,11,0.08)', borderBottom: '1px solid var(--border-subtle)',
          color: 'var(--text-muted)',
        }}>
          <AlertTriangle size={12} style={{ flexShrink: 0, marginTop: 1, color: '#f59e0b' }} />
          <span>Running on the built-in rule-based engine, not the live model. Set <code>GROQ_API_KEY</code> in <code>.env.local</code> to enable full AI reasoning.</span>
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ display: 'flex', gap: 8, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
            <div style={{
              width: 26, height: 26, borderRadius: 6, flexShrink: 0,
              background: msg.role === 'assistant' ? 'var(--gradient-brand)' : 'var(--bg-elevated)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {msg.role === 'assistant' ? <Bot size={13} color="white" /> : <User size={12} color="var(--text-muted)" />}
            </div>
            <div style={{
              maxWidth: '80%',
              background: msg.role === 'assistant' ? 'var(--bg-elevated)' : 'rgba(124,58,237,0.15)',
              border: `1px solid ${msg.role === 'assistant' ? 'var(--border-subtle)' : 'rgba(124,58,237,0.3)'}`,
              borderRadius: 10, padding: '8px 12px',
              fontSize: 12, lineHeight: 1.5,
              color: 'var(--text-primary)',
            }}>
              {msg.role === 'assistant' ? (
                msg.content ? <MarkdownRenderer content={msg.content} /> : (loading && idx === messages.length - 1 ? '…' : '')
              ) : (
                <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Sparkles size={12} className="animate-spin" style={{ color: 'var(--violet-light)' }} />
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Analyzing...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick Prompts */}
      <div style={{ padding: '6px 12px', display: 'flex', gap: 6, flexWrap: 'wrap', borderTop: '1px solid var(--border-subtle)' }}>
        {['Action plan', 'Fix margins', 'Cohort retention'].map(q => (
          <button
            key={q}
            onClick={() => handleSend(q)}
            style={{
              fontSize: 10, padding: '3px 8px', borderRadius: 6,
              background: 'rgba(124,58,237,0.08)', color: 'var(--violet-light)',
              border: '1px solid rgba(124,58,237,0.2)', cursor: 'pointer',
            }}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: 8 }}>
        <input
          className="input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="Ask your AI Co-Founder..."
          style={{ fontSize: 12, flex: 1 }}
        />
        <button
          className="btn-primary"
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
          style={{ padding: '6px 12px', fontSize: 12 }}
        >
          <Send size={13} />
        </button>
      </div>
    </div>
  );
}
