# AI-Driven Customer Intelligence & Business Growth Platform

A full-stack, enterprise-grade financial intelligence, customer analytics, and AI executive co-founder platform built with **Next.js 16**, **React 19**, **TypeScript**, and **Tailwind CSS**.

---

## 🚀 Quick Start (Any System: Windows / macOS / Linux)

### 1. Prerequisites
- **Node.js 18+** or **Node.js 20+** installed
- A Groq API key (optional for basic mode, or get a free key at [console.groq.com](https://console.groq.com))

### 2. Setup & Run
```bash
# 1. Install dependencies
npm install

# 2. (Optional) Set environment variables
cp .env.example .env.local

# 3. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 👥 Demo Logins

| Email | Password | Organization | Currency |
|---|---|---|---|
| `apex@demo.com` | `apex123` | Apex Retail & Distribution | USD ($) |
| `bharat@demo.com` | `bharat123` | Bharat Precision Works | INR (₹) |

---

## 📦 Sharing With Teammates

### Option A: Via GitHub (Recommended)
Invite your teammates directly to the GitHub repository. They just clone and run:
```bash
git clone https://github.com/SPDurai26/AI-Driven-Customer-Intelligence-and-Business-Growth-Platform.git
cd AI-Driven-Customer-Intelligence-and-Business-Growth-Platform
npm install
npm run dev
```

### Option B: Sharing via ZIP File (Avoid Broken Files)
When creating a zip file to send to teammates:
1. **DO NOT include `node_modules/` or `.next/` folders** in the zip (these contain thousands of OS-specific binary symlinks and path-length issues that break on extraction).
2. The recipient unzips the folder and simply runs:
   ```bash
   npm install
   npm run dev
   ```

---

## 🔑 Environment Variables

Create `.env.local` in the project root:

```env
# NextAuth Configuration
NEXTAUTH_SECRET=bizai-demo-secret-key-2024
NEXTAUTH_URL=http://localhost:3000

# Groq AI Model Key (Free from https://console.groq.com)
GROQ_API_KEY=your_groq_api_key_here
```

---

## 🌐 Deploy to Vercel (1-Click)

Since the project is now structured directly at the repository root:
1. Connect the GitHub repo to [vercel.com](https://vercel.com).
2. Leave **Root Directory** as default (`.` / root).
3. Add `GROQ_API_KEY`, `NEXTAUTH_SECRET`, and `NEXTAUTH_URL` under **Environment Variables**.
4. Click **Deploy**.

---

## 🐳 Docker Deployment

```bash
# Build and run containers
docker compose up -d --build
```
Access at `http://localhost:3000`.
