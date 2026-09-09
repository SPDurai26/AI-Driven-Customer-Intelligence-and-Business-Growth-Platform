# AI Consortium — Project Agent Guidelines

## Architecture Overview
- **Framework**: Next.js (App Router) + TypeScript + Vanilla Tailwind CSS
- **AI Engine**: Groq API (`llama-3.3-70b-versatile`) via OpenAI-compatible SDK in `/api/ai-cofounder`
- **Auth**: Next-Auth v5 Credentials provider with demo accounts:
  - `apex@demo.com` (password: `apex123`) → Apex Retail & Distribution (USD)
  - `bharat@demo.com` (password: `bharat123`) → Bharat Precision Works (INR)
- **State & Persistence**: `app-context.tsx` with per-user `localStorage` serialization.
- **Core Modules**:
  - `financial-engine.ts`: P&L ratios, break-even, performance score
  - `balance-sheet-engine.ts`: Liquidity & solvency ratios (Current, Quick, Debt-to-Equity)
  - `cohort-engine.ts`: SaaS cohort matrix, Net Revenue Retention (NRR), CAC payback
  - `pnl-parser.ts`: Structured CSV parsing with placeholder estimation tracking
  - `ai-cofounder-tools.ts`: Executive personas, document templates, code blueprints

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
