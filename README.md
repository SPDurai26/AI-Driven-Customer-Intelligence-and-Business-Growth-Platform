# AI-Driven Customer Intelligence & Business Growth Platform

A full-stack, enterprise-grade financial intelligence, customer analytics, and AI executive co-founder platform built with **Next.js 15**, **TypeScript**, **Tailwind CSS**, and **Docker**.

---

## 🚀 Key Features

- **📊 Comprehensive Financial Intelligence**:
  - **P&L Statement Analyzer**: Dynamic revenue, COGS, operating expenses, EBITDA, and net margin computation with interactive breakdown.
  - **Balance Sheet & Solvency**: Liquidity (Current & Quick ratios), leverage (Debt-to-Equity), working capital, and financial health gauges.
  - **Cohort & Retention Analysis**: SaaS cohort retention matrices, Net Revenue Retention (NRR), customer churn velocity, and CAC payback period.
  - **Scenario Simulation ("What-If")**: Real-time slider-driven financial forecasting.

- **🤖 Autonomous AI Executive Co-Founder**:
  - Streaming AI advisory powered by Groq LLaMA 3.3 70B (`/api/ai-cofounder`).
  - Multi-persona advisory (CFO, CMO, COO, Chief Growth Officer).
  - Executive action blueprints, automated board-ready memo generation, and downloadable strategic decks.

- **🔐 Multi-Tenant Demo Authentication**:
  - NextAuth v5 credentials provider with preconfigured enterprise workspaces:
    - `apex@demo.com` (`apex123`) &rarr; **Apex Retail & Distribution (USD)**
    - `bharat@demo.com` (`bharat123`) &rarr; **Bharat Precision Works (INR)**
  - Per-tenant isolated state and persistence via client-side storage.

- **⚡ Enterprise Data Ingestion**:
  - Upload financial statements in CSV or TXT format with instant schema mapping.
  - Tracking of estimated vs. verified financial line items.

- **🐳 Production Ready**:
  - Multi-stage `Dockerfile` with standalone Next.js output optimization.
  - `docker-compose.yml` for single-command deployment.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router, React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Lucide React icons
- **Authentication**: NextAuth.js v5
- **AI / LLM**: Groq Cloud SDK (`llama-3.3-70b-versatile`)
- **Containerization**: Docker & Docker Compose

---

## 🏃 Quick Start

### 1. Prerequisites
- Node.js 18+ (or Docker & Docker Compose)
- A Groq API key (free at [console.groq.com](https://console.groq.com))

### 2. Local Setup
```bash
# Clone repository
git clone https://github.com/SPDurai26/<YOUR-REPO-NAME>.git
cd <YOUR-REPO-NAME>

# Configure environment
cp .env.example .env
# Open .env and add your GROQ_API_KEY

# Install dependencies and start development server
cd app
npm install
npm run dev
```

Visit `http://localhost:3000` in your browser.

### 3. Docker Setup
```bash
# Build and run containers
docker compose up -d --build
```
Access the application at `http://localhost:3000`.

---

## 👥 Demo Logins

| Email | Password | Organization | Currency |
|---|---|---|---|
| `apex@demo.com` | `apex123` | Apex Retail & Distribution | USD ($) |
| `bharat@demo.com` | `bharat123` | Bharat Precision Works | INR (₹) |

---

## 📄 License
This project is open source and available under the [MIT License](LICENSE).
