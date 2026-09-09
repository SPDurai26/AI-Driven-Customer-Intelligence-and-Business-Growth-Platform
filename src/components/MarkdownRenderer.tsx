'use client';

import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  style?: React.CSSProperties;
}

// ─── Inline Formatter Helper ──────────────────────────────────────────────────

function renderInlineFormatted(text: string): React.ReactNode[] {
  // Regex tokenization for: **bold**, *italic*, `code`, and plain text
  const tokens: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Bold: **text**
    const boldMatch = remaining.match(/^(\*\*|__)(.*?)\1/);
    if (boldMatch) {
      tokens.push(
        <strong key={key++} style={{ color: '#FFFFFF', fontWeight: 700 }}>
          {renderInlineFormatted(boldMatch[2])}
        </strong>
      );
      remaining = remaining.slice(boldMatch[0].length);
      continue;
    }

    // Inline Code: `code`
    const codeMatch = remaining.match(/^`([^`]+)`/);
    if (codeMatch) {
      tokens.push(
        <code
          key={key++}
          style={{
            background: 'rgba(0, 240, 255, 0.08)',
            border: '1px solid rgba(0, 240, 255, 0.25)',
            color: 'var(--cyber-cyan, #00F0FF)',
            padding: '1px 6px',
            borderRadius: 3,
            fontSize: '0.9em',
            fontFamily: 'JetBrains Mono, monospace',
          }}
        >
          {codeMatch[1]}
        </code>
      );
      remaining = remaining.slice(codeMatch[0].length);
      continue;
    }

    // Italic: *text* or _text_
    const italicMatch = remaining.match(/^(\*|_)(.*?)\1/);
    if (italicMatch) {
      tokens.push(
        <em key={key++} style={{ color: 'var(--text-secondary, #A0A5B5)', fontStyle: 'italic' }}>
          {renderInlineFormatted(italicMatch[2])}
        </em>
      );
      remaining = remaining.slice(italicMatch[0].length);
      continue;
    }

    // Plain text up to next special character
    const nextSpecial = remaining.search(/[\*_`]/);
    if (nextSpecial === -1) {
      tokens.push(remaining);
      break;
    } else if (nextSpecial === 0) {
      // Just a literal symbol that didn't match a full tag
      tokens.push(remaining[0]);
      remaining = remaining.slice(1);
    } else {
      tokens.push(remaining.slice(0, nextSpecial));
      remaining = remaining.slice(nextSpecial);
    }
  }

  return tokens;
}

// ─── Block Parser ─────────────────────────────────────────────────────────────

export default function MarkdownRenderer({ content, className = '', style }: MarkdownRendererProps) {
  if (!content) return null;

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let index = 0;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // 1. Empty lines
    if (!trimmed) {
      continue;
    }

    // 2. Horizontal Rule: --- or ***
    if (/^(---|___|\*\*\*)$/.test(trimmed)) {
      elements.push(
        <hr
          key={`hr-${index++}`}
          style={{
            border: 'none',
            borderTop: '1px solid var(--border-hud, rgba(255,46,99,0.25))',
            margin: '16px 0',
            opacity: 0.7,
          }}
        />
      );
      continue;
    }

    // 3. Headers: #, ##, ###, ####
    const headerMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (headerMatch) {
      const level = headerMatch[1].length;
      const title = headerMatch[2];
      const inline = renderInlineFormatted(title);

      if (level === 1) {
        elements.push(
          <h1
            key={`h1-${index++}`}
            style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '1.25rem',
              fontWeight: 900,
              color: '#FFFFFF',
              marginTop: 18,
              marginBottom: 8,
              letterSpacing: '0.04em',
              borderBottom: '1px solid rgba(0,240,255,0.25)',
              paddingBottom: 6,
            }}
          >
            {inline}
          </h1>
        );
      } else if (level === 2) {
        elements.push(
          <h2
            key={`h2-${index++}`}
            style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '1.1rem',
              fontWeight: 800,
              color: 'var(--cyber-cyan, #00F0FF)',
              marginTop: 16,
              marginBottom: 6,
              letterSpacing: '0.03em',
            }}
          >
            {inline}
          </h2>
        );
      } else if (level === 3) {
        elements.push(
          <h3
            key={`h3-${index++}`}
            style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '0.98rem',
              fontWeight: 700,
              color: 'var(--cyber-gold, #FFB800)',
              marginTop: 14,
              marginBottom: 6,
            }}
          >
            {inline}
          </h3>
        );
      } else {
        elements.push(
          <h4
            key={`h4-${index++}`}
            style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '0.9rem',
              fontWeight: 700,
              color: '#FFFFFF',
              marginTop: 12,
              marginBottom: 4,
            }}
          >
            {inline}
          </h4>
        );
      }
      continue;
    }

    // 4. Tables: Lines starting with '|'
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const tableRows: string[][] = [];
      let j = i;

      while (j < lines.length && lines[j].trim().startsWith('|') && lines[j].trim().endsWith('|')) {
        const rowLine = lines[j].trim();
        // Skip separator row |---|---|
        if (!/^[\|\s\-:]+$/.test(rowLine)) {
          const cells = rowLine
            .slice(1, -1)
            .split('|')
            .map(c => c.trim());
          tableRows.push(cells);
        }
        j++;
      }

      if (tableRows.length > 0) {
        const headerCells = tableRows[0];
        const bodyRows = tableRows.slice(1);

        elements.push(
          <div
            key={`table-wrap-${index++}`}
            style={{
              overflowX: 'auto',
              margin: '14px 0',
              borderRadius: 6,
              border: '1px solid var(--border-hud, rgba(0,240,255,0.25))',
              background: '#040711',
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.85rem',
                textAlign: 'left',
              }}
            >
              <thead>
                <tr style={{ background: 'rgba(0, 240, 255, 0.08)', borderBottom: '1px solid rgba(0, 240, 255, 0.25)' }}>
                  {headerCells.map((h, hIdx) => (
                    <th
                      key={hIdx}
                      style={{
                        padding: '10px 14px',
                        fontFamily: 'Orbitron, sans-serif',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        color: 'var(--cyber-cyan, #00F0FF)',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {renderInlineFormatted(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bodyRows.map((row, rIdx) => (
                  <tr
                    key={rIdx}
                    style={{
                      borderBottom: rIdx === bodyRows.length - 1 ? 'none' : '1px solid rgba(255, 255, 255, 0.05)',
                      background: rIdx % 2 === 1 ? 'rgba(255, 255, 255, 0.015)' : 'transparent',
                    }}
                  >
                    {row.map((cell, cIdx) => (
                      <td
                        key={cIdx}
                        style={{
                          padding: '10px 14px',
                          color: 'var(--text-primary, #E2E8F0)',
                          lineHeight: 1.5,
                          verticalAlign: 'top',
                        }}
                      >
                        {renderInlineFormatted(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        i = j - 1;
        continue;
      }
    }

    // 5. Code Block: ```
    if (trimmed.startsWith('```')) {
      const codeLines: string[] = [];
      let j = i + 1;
      while (j < lines.length && !lines[j].trim().startsWith('```')) {
        codeLines.push(lines[j]);
        j++;
      }
      elements.push(
        <pre
          key={`codeblock-${index++}`}
          style={{
            background: '#040711',
            borderRadius: 6,
            padding: 14,
            border: '1px solid var(--border-subtle, rgba(255,255,255,0.08))',
            color: 'var(--cyber-cyan, #00F0FF)',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.85rem',
            overflowX: 'auto',
            margin: '12px 0',
            lineHeight: 1.5,
          }}
        >
          {codeLines.join('\n')}
        </pre>
      );
      i = j;
      continue;
    }

    // 6. Blockquote: > Quote
    if (trimmed.startsWith('>')) {
      const quoteText = trimmed.replace(/^>\s*/, '');
      elements.push(
        <blockquote
          key={`quote-${index++}`}
          style={{
            margin: '10px 0',
            padding: '8px 14px',
            background: 'rgba(255, 46, 99, 0.06)',
            borderLeft: '3px solid var(--cyber-red, #FF2E63)',
            borderRadius: '0 4px 4px 0',
            color: 'var(--text-secondary, #A0A5B5)',
            fontSize: '0.88rem',
            lineHeight: 1.5,
          }}
        >
          {renderInlineFormatted(quoteText)}
        </blockquote>
      );
      continue;
    }

    // 7. Bullet List item: - or *
    if (/^[-*]\s+/.test(trimmed)) {
      const itemText = trimmed.replace(/^[-*]\s+/, '');
      elements.push(
        <div
          key={`li-${index++}`}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 8,
            margin: '4px 0',
            fontSize: '0.9rem',
            lineHeight: 1.55,
            color: 'var(--text-primary, #E2E8F0)',
          }}
        >
          <span style={{ color: 'var(--cyber-red, #FF2E63)', fontWeight: 800, marginTop: 1 }}>●</span>
          <div style={{ flex: 1 }}>{renderInlineFormatted(itemText)}</div>
        </div>
      );
      continue;
    }

    // 8. Numbered List item: 1. 2. etc.
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (numMatch) {
      elements.push(
        <div
          key={`oli-${index++}`}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 8,
            margin: '5px 0',
            fontSize: '0.9rem',
            lineHeight: 1.55,
            color: 'var(--text-primary, #E2E8F0)',
          }}
        >
          <span
            style={{
              color: 'var(--cyber-cyan, #00F0FF)',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.85rem',
              fontWeight: 700,
              minWidth: 20,
            }}
          >
            {numMatch[1]}.
          </span>
          <div style={{ flex: 1 }}>{renderInlineFormatted(numMatch[2])}</div>
        </div>
      );
      continue;
    }

    // 9. Standard Paragraph
    elements.push(
      <p
        key={`p-${index++}`}
        style={{
          margin: '6px 0',
          fontSize: '0.9rem',
          lineHeight: 1.6,
          color: 'var(--text-primary, #E2E8F0)',
        }}
      >
        {renderInlineFormatted(trimmed)}
      </p>
    );
  }

  return (
    <div
      className={className}
      style={{
        fontFamily: 'Rajdhani, sans-serif',
        fontSize: '0.92rem',
        color: 'var(--text-primary, #E2E8F0)',
        ...style,
      }}
    >
      {elements}
    </div>
  );
}
