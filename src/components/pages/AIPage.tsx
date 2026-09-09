'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/app-context';
import {
  Bot, Sparkles, CheckCircle2, ArrowRight, ShieldAlert,
  TrendingUp, RefreshCw, Send, Scale, FileText, CheckCircle,
  HelpCircle, DollarSign, Target, Lightbulb, Users,
  Copy, Download, Layers, MessageSquare, Terminal, Cpu,
  Landmark, Mail, Presentation, User
} from 'lucide-react';
import {
  DOCUMENT_TEMPLATES, BusinessDocumentTemplate,
  EXECUTIVE_PERSONAS, PersonaAdvisor
} from '@/lib/ai-cofounder-tools';
import MarkdownRenderer from '@/components/MarkdownRenderer';

export default function AIPage() {
  const {
    pnlStatement, metrics, balanceSheetMetrics, cohortMetrics, setIsReportModalOpen,
    balanceSheet, marketSalesReport, cohortDataset,
  } = useApp();
  const currSymbol = pnlStatement.currency === 'INR' ? '₹' : '$';

  const [suiteTab, setSuiteTab] = useState<'advisory-board' | 'action-plan' | 'idea-validator' | 'doc-builder'>('advisory-board');
  const [selectedPersona, setSelectedPersona] = useState<PersonaAdvisor>(EXECUTIVE_PERSONAS[0]);

  // Chat State
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content: `STRATEGIC ADVISORY ACTIVE // **Marcus Vance (AI CFO)**\n\nI am your conversational AI Co-Founder for **${pnlStatement.businessName}**. Rather than reviewing static past numbers, let us build your forward-looking growth roadmap.\n\nTell me what initiative you are planning (e.g. launching a new product line, entering a new sales territory, adjusting price tiering, or securing inventory financing), and I will model a phased execution strategy with target unit economics.`
    }
  ]);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});

  // Document Generator
  const [generatedDoc, setGeneratedDoc] = useState<{ title: string; content: string } | null>(null);
  const [isGeneratingDoc, setIsGeneratingDoc] = useState(false);

  // Idea Validator
  const [ideaInput, setIdeaInput] = useState('');
  const [validatedIdeaResult, setValidatedIdeaResult] = useState<string | null>(null);
  const [isValidatingIdea, setIsValidatingIdea] = useState(false);

  const toggleStep = (stepKey: string) => {
    setCompletedSteps(prev => ({ ...prev, [stepKey]: !prev[stepKey] }));
  };

  const handlePersonaChange = (persona: PersonaAdvisor) => {
    setSelectedPersona(persona);
    setChatMessages([
      {
        role: 'assistant',
        content: `EXECUTIVE ADVISOR ACTIVE // **${persona.name} (${persona.role})**\n\n${persona.greeting}\n\nWhat future strategy or execution milestone shall we plan together?`
      }
    ]);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || chatInput;
    if (!text.trim() || isAiThinking) return;

    const newHistory = [...chatMessages, { role: 'user' as const, content: text }];
    setChatMessages(newHistory);
    setChatMessages(prev => [...prev, { role: 'assistant', content: '' }]);
    setChatInput('');
    setIsAiThinking(true);

    const appendToLastAssistant = (delta: string) => {
      setChatMessages(prev => {
        const copy = [...prev];
        const last = copy[copy.length - 1];
        if (last?.role === 'assistant') copy[copy.length - 1] = { ...last, content: last.content + delta };
        return copy;
      });
    };

    try {
      const res = await fetch('/api/ai-cofounder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `[Speaking as ${selectedPersona.role}]: ${text}`,
          history: newHistory.slice(-8),
          statement: pnlStatement,
          balanceSheet,
          marketSales: marketSalesReport,
          cohortDataset,
        }),
      });

      if (!res.ok) throw new Error('API response failed');

      const contentType = res.headers.get('Content-Type') || '';
      if (contentType.includes('text/event-stream') && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const events = buffer.split('\n\n');
          buffer = events.pop() || '';

          for (const evt of events) {
            const line = evt.replace(/^data: /, '').trim();
            if (!line) continue;
            const parsed = JSON.parse(line) as { delta?: string; done?: boolean };
            if (parsed.delta) appendToLastAssistant(parsed.delta);
          }
        }
      } else {
        const data = await res.json();
        appendToLastAssistant(data.reply || 'Strategy generation complete.');
      }
    } catch (err) {
      console.error(err);
      appendToLastAssistant('\n\n*(Could not connect to AI advisor. Please try again.)*');
    } finally {
      setIsAiThinking(false);
    }
  };

  const handleGenerateDocument = async (template: BusinessDocumentTemplate) => {
    setIsGeneratingDoc(true);
    setGeneratedDoc({ title: template.title, content: '' });

    try {
      const res = await fetch('/api/ai-cofounder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: template.generatePrompt,
          documentPrompt: template.generatePrompt,
          statement: pnlStatement,
          balanceSheet,
          marketSales: marketSalesReport,
          cohortDataset,
          mode: 'document',
        }),
      });

      if (!res.ok) throw new Error('Document generation failed');

      const contentType = res.headers.get('Content-Type') || '';
      if (contentType.includes('text/event-stream') && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const events = buffer.split('\n\n');
          buffer = events.pop() || '';
          for (const evt of events) {
            const line = evt.replace(/^data: /, '').trim();
            if (!line) continue;
            const parsed = JSON.parse(line) as { delta?: string; done?: boolean };
            if (parsed.delta) {
              setGeneratedDoc(prev => prev ? { ...prev, content: prev.content + parsed.delta } : null);
            }
          }
        }
      } else {
        const data = await res.json();
        setGeneratedDoc({ title: template.title, content: data.reply || data.error || 'Generation failed' });
      }
    } catch (err) {
      console.error(err);
      setGeneratedDoc({ title: template.title, content: 'Failed to generate document. Please check your API connection and try again.' });
    } finally {
      setIsGeneratingDoc(false);
    }
  };

  const handleValidateIdea = async () => {
    if (!ideaInput.trim()) return;
    setIsValidatingIdea(true);
    setValidatedIdeaResult('');

    try {
      const res = await fetch('/api/ai-cofounder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: ideaInput,
          statement: pnlStatement,
          balanceSheet,
          marketSales: marketSalesReport,
          cohortDataset,
          mode: 'idea-validator',
        }),
      });

      if (!res.ok) throw new Error('Validation failed');

      const contentType = res.headers.get('Content-Type') || '';
      if (contentType.includes('text/event-stream') && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const events = buffer.split('\n\n');
          buffer = events.pop() || '';
          for (const evt of events) {
            const line = evt.replace(/^data: /, '').trim();
            if (!line) continue;
            const parsed = JSON.parse(line) as { delta?: string; done?: boolean };
            if (parsed.delta) setValidatedIdeaResult(prev => (prev ?? '') + parsed.delta);
          }
        }
      } else {
        const data = await res.json();
        setValidatedIdeaResult(data.reply || 'Validation failed.');
      }
    } catch (err) {
      console.error(err);
      setValidatedIdeaResult('Idea validation failed. Please check your connection.');
    } finally {
      setIsValidatingIdea(false);
    }
  };

  function getPersonaIcon(iconKey: string, size = 16, color = '#FFFFFF') {
    switch (iconKey) {
      case 'landmark':
        return <Landmark size={size} color={color} />;
      case 'trending-up':
        return <TrendingUp size={size} color={color} />;
      case 'cpu':
        return <Cpu size={size} color={color} />;
      case 'layers':
        return <Layers size={size} color={color} />;
      default:
        return <Bot size={size} color={color} />;
    }
  }

  function getDocIcon(iconKey: string, size = 18, color = 'var(--cyber-cyan)') {
    switch (iconKey) {
      case 'presentation':
        return <Presentation size={size} color={color} />;
      case 'file-text':
        return <FileText size={size} color={color} />;
      case 'mail':
        return <Mail size={size} color={color} />;
      case 'dollar-sign':
        return <DollarSign size={size} color={color} />;
      case 'scale':
        return <Scale size={size} color={color} />;
      case 'trending-up':
        return <TrendingUp size={size} color={color} />;
      default:
        return <FileText size={size} color={color} />;
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, width: '100%', minWidth: 0, overflow: 'hidden' }}>
      
      {/* Header Banner */}
      <div className="hud-corner-box" style={{
        padding: '20px 24px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 4,
            background: 'linear-gradient(135deg, #FF2E63 0%, #00F0FF 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 15px rgba(255, 46, 99, 0.4)', flexShrink: 0,
          }}>
            <Cpu size={22} color="#000003" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <h1 style={{ fontFamily: 'Orbitron', fontSize: 18, fontWeight: 900, color: '#FFFFFF' }}>
                AI CO-FOUNDER STRATEGIC COMMAND
              </h1>
              <span className="badge badge-legendary" style={{ fontSize: 9 }}>ONLINE // STRATEGIC REASONING</span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Interactive Chief Financial Officer & Strategic Co-Founder for <strong>{pnlStatement.businessName}</strong>.
            </p>
          </div>
        </div>

        <button className="btn-secondary" onClick={() => setIsReportModalOpen(true)}>
          <RefreshCw size={12} /> SYNC STATEMENTS
        </button>
      </div>

      {/* 4-Tab Clean Navigation Bar */}
      <div style={{
        display: 'flex', gap: 4,
        background: 'rgba(6, 9, 19, 0.9)',
        padding: 5, borderRadius: 4,
        border: '1px solid var(--border-hud)',
        overflowX: 'auto',
        minWidth: 0,
        flexShrink: 0,
      }}>
        {[
          { key: 'advisory-board', label: 'EXECUTIVE ADVISORY BOARD', icon: Users },
          { key: 'action-plan', label: 'STRATEGIC ACTION COMMAND', icon: Target },
          { key: 'idea-validator', label: 'IDEA & MARKET VALIDATOR', icon: Lightbulb },
          { key: 'doc-builder', label: 'BUSINESS DOCUMENT BUILDER', icon: FileText },
        ].map(tab => {
          const Icon = tab.icon;
          const active = suiteTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setSuiteTab(tab.key as typeof suiteTab)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 14px', borderRadius: 3, border: 'none', cursor: 'pointer',
                fontSize: 11, fontFamily: 'Orbitron', fontWeight: active ? 800 : 600, whiteSpace: 'nowrap',
                background: active ? 'rgba(255, 46, 99, 0.2)' : 'transparent',
                color: active ? '#FFFFFF' : 'var(--text-muted)',
                borderBottom: active ? '2px solid var(--cyber-red)' : 'none',
                boxShadow: active ? '0 0 15px rgba(255, 46, 99, 0.2)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={13} color={active ? 'var(--cyber-red)' : 'var(--text-muted)'} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: EXECUTIVE ADVISORY BOARD (Interactive Chatbot) */}
      {suiteTab === 'advisory-board' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          {/* Persona Picker Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
            {EXECUTIVE_PERSONAS.map(p => {
              const active = selectedPersona.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => handlePersonaChange(p)}
                  className="hud-corner-box"
                  style={{
                    padding: 14, cursor: 'pointer',
                    borderColor: active ? p.color : 'var(--border-subtle)',
                    background: active ? 'rgba(255, 46, 99, 0.08)' : 'var(--bg-card)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 4,
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: `1px solid ${p.color}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      {getPersonaIcon(p.iconKey, 16, p.color)}
                    </div>
                    <div>
                      <div style={{ fontFamily: 'Orbitron', fontWeight: 800, fontSize: 11, color: '#FFFFFF' }}>{p.name}</div>
                      <div style={{ fontSize: 10, color: p.color, fontWeight: 700 }}>{p.role}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.3 }}>
                    {p.expertise}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Persona Chat Stream */}
          <div className="hud-corner-box" style={{ overflow: 'hidden' }}>
            <div style={{
              padding: '12px 18px', borderBottom: '1px solid var(--border-hud)',
              display: 'flex', alignItems: 'center', gap: 10,
              background: '#040711',
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: 4,
                background: 'rgba(255, 255, 255, 0.08)',
                border: `1px solid ${selectedPersona.color}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {getPersonaIcon(selectedPersona.iconKey, 15, selectedPersona.color)}
              </div>
              <div>
                <h3 style={{ fontFamily: 'Orbitron', fontSize: 12, fontWeight: 800, color: '#FFFFFF' }}>
                  CONSULTING: {selectedPersona.name.toUpperCase()} ({selectedPersona.role.toUpperCase()})
                </h3>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                  Interactive Co-Founder strategy session for {pnlStatement.businessName}
                </div>
              </div>
            </div>

            {/* Chat Stream */}
            <div style={{ maxHeight: 420, minHeight: 240, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {chatMessages.map((msg, idx) => (
                <div key={idx} style={{
                  display: 'flex', gap: 8,
                  flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 4,
                    background: msg.role === 'assistant' ? 'linear-gradient(135deg, #FF2E63 0%, #00F0FF 100%)' : 'var(--bg-elevated)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    {msg.role === 'assistant' ? <Bot size={14} color="#000003" /> : <User size={13} color="#FFFFFF" />}
                  </div>
                  <div className={msg.role === 'assistant' ? 'chat-bubble-ai' : 'chat-bubble-user'} style={{ maxWidth: '82%' }}>
                    {msg.role === 'assistant' ? (
                      <MarkdownRenderer content={msg.content} />
                    ) : (
                      <div style={{ fontSize: 12, lineHeight: 1.6, fontFamily: 'Rajdhani' }}>
                        {msg.content}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isAiThinking && (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ width: 28, height: 28, borderRadius: 4, background: 'var(--gradient-cyber-red)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Bot size={14} color="#FFFFFF" />
                  </div>
                  <div className="chat-bubble-ai" style={{ fontSize: 11, color: 'var(--cyber-cyan)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Sparkles size={12} className="animate-spin" /> {selectedPersona.name} is formulating future execution roadmap...
                  </div>
                </div>
              )}
            </div>

            {/* Quick Prompts Bar (Sector Specific) */}
            <div style={{ padding: '8px 16px', display: 'flex', gap: 6, flexWrap: 'wrap', borderTop: '1px solid var(--border-subtle)', background: 'rgba(4,7,17,0.7)' }}>
              {(selectedPersona.samplePrompts || []).map(q => (
                <button
                  key={q}
                  onClick={() => handleSendMessage(q)}
                  style={{
                    fontSize: 10, fontFamily: 'Orbitron', padding: '4px 10px', borderRadius: 3,
                    background: 'rgba(0, 240, 255, 0.08)', color: 'var(--cyber-cyan)',
                    border: '1px solid rgba(0, 240, 255, 0.25)', cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(0, 240, 255, 0.2)';
                    e.currentTarget.style.borderColor = 'var(--cyber-cyan)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(0, 240, 255, 0.08)';
                    e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.25)';
                  }}
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div style={{ padding: '12px 18px', borderTop: '1px solid var(--border-hud)', background: '#020308' }}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                style={{ display: 'flex', gap: 8 }}
              >
                <input
                  className="input"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder={`Ask ${selectedPersona.name}: e.g. '${selectedPersona.samplePrompts[0]}'`}
                  style={{ fontSize: 12 }}
                />
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isAiThinking || !chatInput.trim()}
                  style={{ padding: '8px 16px', fontSize: 10 }}
                >
                  <Send size={12} /> TRANSMIT
                </button>
              </form>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: STRATEGIC ACTION COMMAND */}
      {suiteTab === 'action-plan' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          
          <div className="hud-corner-box" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldAlert size={16} color="var(--cyber-red)" />
                <h3 style={{ fontFamily: 'Orbitron', fontSize: 13, fontWeight: 800, color: '#FFFFFF' }}>
                  MULTI-STATEMENT STRATEGIC AUDIT
                </h3>
              </div>
              <span className="badge badge-uncommon">
                {metrics.performanceScore.overallScore}/100 SCORE
              </span>
            </div>

            <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Cross-ledger analysis for <strong>{pnlStatement.businessName}</strong> synthesized across P&L, Balance Sheet, Regional Market Variance, and Cohort Retention.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {metrics.recommendedActions.map((action, idx) => {
              const doneCount = action.steps.filter((_, sIdx) => completedSteps[`${action.id}-${sIdx}`]).length;
              const allDone = doneCount === action.steps.length;

              return (
                <div key={action.id} className="hud-corner-box" style={{ padding: 18, borderColor: allDone ? 'var(--cyber-emerald)' : undefined }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontFamily: 'Orbitron', fontWeight: 900, fontSize: 12, color: 'var(--cyber-red)' }}>
                        #{idx + 1}
                      </span>
                      <h4 style={{ fontFamily: 'Orbitron', fontSize: 12, fontWeight: 800, color: '#FFFFFF' }}>
                        {action.title}
                      </h4>
                    </div>
                    <span className="badge badge-legendary" style={{ fontSize: 9 }}>
                      {action.estimatedSavingsOrGain}
                    </span>
                  </div>

                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>
                    <strong>{action.category}</strong> — {action.priority}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {action.steps.map((step, sIdx) => {
                      const isDone = !!completedSteps[`${action.id}-${sIdx}`];
                      return (
                        <div
                          key={sIdx}
                          onClick={() => toggleStep(`${action.id}-${sIdx}`)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: '6px 10px', borderRadius: 3,
                            background: isDone ? 'rgba(0, 255, 136, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                            border: `1px solid ${isDone ? 'rgba(0, 255, 136, 0.3)' : 'var(--border-subtle)'}`,
                            cursor: 'pointer',
                          }}
                        >
                          <CheckCircle2 size={13} color={isDone ? 'var(--cyber-emerald)' : 'var(--text-muted)'} />
                          <span style={{
                            fontSize: 11,
                            color: isDone ? 'var(--cyber-emerald)' : 'var(--text-primary)',
                            textDecoration: isDone ? 'line-through' : 'none',
                          }}>
                            {step}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: IDEA VALIDATOR */}
      {suiteTab === 'idea-validator' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="hud-corner-box" style={{ padding: 22 }}>
            <h3 style={{ fontFamily: 'Orbitron', fontSize: 14, fontWeight: 800, color: '#FFFFFF', marginBottom: 6 }}>
              BUSINESS INITIATIVE & MARKET EXPANSION VALIDATOR
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
              Input any new product line, expansion initiative, or business concept. AI Co-Founder computes market size, margin viability, and working capital impact.
            </p>

            <div style={{ display: 'flex', gap: 8 }}>
              <input
                className="input"
                value={ideaInput}
                onChange={e => setIdeaInput(e.target.value)}
                placeholder="e.g. Launch automated B2B recurring subscription tier for wholesale distributors..."
                style={{ fontSize: 13 }}
              />
              <button
                className="btn-primary"
                onClick={handleValidateIdea}
                disabled={isValidatingIdea || !ideaInput.trim()}
                style={{ whiteSpace: 'nowrap', padding: '9px 18px' }}
              >
                <Sparkles size={13} className={isValidatingIdea ? 'animate-spin' : ''} />
                {isValidatingIdea ? 'ANALYZING...' : 'VALIDATE WITH AI'}
              </button>
            </div>
          </div>

          {(validatedIdeaResult !== null) && (
            <div className="hud-corner-box hud-corner-cyan" style={{ padding: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ fontFamily: 'Orbitron', fontSize: 11, fontWeight: 800, color: '#FFFFFF' }}>AI STRATEGIC ANALYSIS</span>
                {isValidatingIdea && <Sparkles size={12} className="animate-spin" color="var(--cyber-cyan)" />}
              </div>
              <div style={{ background: '#040711', borderRadius: 6, padding: '16px 20px', border: '1px solid var(--border-subtle)' }}>
                {validatedIdeaResult ? (
                  <MarkdownRenderer content={validatedIdeaResult} />
                ) : (
                  <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Analyzing idea...</span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: DOCUMENT BUILDER */}
      {suiteTab === 'doc-builder' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
            {DOCUMENT_TEMPLATES.map(doc => (
              <div key={doc.id} className="hud-corner-box" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 4,
                    background: 'rgba(0, 240, 255, 0.08)',
                    border: '1px solid rgba(0, 240, 255, 0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {getDocIcon(doc.iconKey, 18, 'var(--cyber-cyan)')}
                  </div>
                  <span className="badge badge-rare" style={{ fontSize: 8 }}>{doc.category}</span>
                </div>
                <div>
                  <h3 style={{ fontFamily: 'Orbitron', fontSize: 12, fontWeight: 800, color: '#FFFFFF', marginBottom: 4 }}>
                    {doc.title}
                  </h3>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    {doc.description}
                  </p>
                </div>
                <button
                  className="btn-primary"
                  style={{ marginTop: 'auto', fontSize: 10, justifyContent: 'center', padding: '7px 10px' }}
                  onClick={() => handleGenerateDocument(doc)}
                  disabled={isGeneratingDoc}
                >
                  <Sparkles size={12} className={isGeneratingDoc ? 'animate-spin' : ''} />
                  {isGeneratingDoc ? 'GENERATING...' : 'GENERATE DOCUMENT'}
                </button>
              </div>
            ))}
          </div>

          {generatedDoc && (
            <div className="hud-corner-box hud-corner-cyan" style={{ padding: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h3 style={{ fontFamily: 'Orbitron', fontSize: 14, fontWeight: 800, color: '#FFFFFF' }}>{generatedDoc.title}</h3>
                  {isGeneratingDoc && <Sparkles size={12} className="animate-spin" color="var(--cyber-cyan)" />}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    className="btn-secondary"
                    style={{ fontSize: 10, padding: '4px 8px' }}
                    onClick={() => navigator.clipboard.writeText(generatedDoc.content)}
                  >
                    <Copy size={11} /> COPY
                  </button>
                  <button
                    className="btn-secondary"
                    style={{ fontSize: 10, padding: '4px 8px' }}
                    onClick={() => {
                      const blob = new Blob([generatedDoc.content], { type: 'text/plain' });
                      const a = document.createElement('a');
                      a.href = URL.createObjectURL(blob);
                      a.download = `${generatedDoc.title.replace(/\s+/g, '_')}.md`;
                      a.click();
                    }}
                  >
                    <Download size={11} /> DOWNLOAD
                  </button>
                </div>
              </div>
              <div style={{ background: '#040711', borderRadius: 6, padding: '18px 22px', border: '1px solid var(--border-subtle)', maxHeight: 520, overflowY: 'auto' }}>
                {generatedDoc.content ? (
                  <MarkdownRenderer content={generatedDoc.content} />
                ) : (
                  <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Generating document...</span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
