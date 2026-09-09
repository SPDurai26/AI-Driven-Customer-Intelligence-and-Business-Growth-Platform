import { NextRequest, NextResponse } from 'next/server';
import { PnLStatement, BalanceSheet, MarketSalesRecord, CohortAnalysisDataset } from '@/lib/report-store';
import { calculatePnLMetrics } from '@/lib/financial-engine';
import { calculateBalanceSheetRatios } from '@/lib/balance-sheet-engine';
import { calculateCohortMetrics } from '@/lib/cohort-engine';
import { buildLocalReply } from '@/lib/ai-cofounder-fallback';
import OpenAI from 'openai';

// ─── Types ───────────────────────────────────────────────────────────────────

type RequestMode = 'chat' | 'document' | 'idea-validator';

interface RequestBody {
  message: string;
  history?: { role: 'user' | 'assistant'; content: string }[];
  statement?: PnLStatement;
  balanceSheet?: BalanceSheet;
  marketSales?: MarketSalesRecord[];
  cohortDataset?: CohortAnalysisDataset;
  mode?: RequestMode;
  /** For document mode: the document template's generate prompt */
  documentPrompt?: string;
}

// ─── Groq client (OpenAI-compatible) ─────────────────────────────────────────

function getGroqClient(): OpenAI | null {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({
    apiKey,
    baseURL: 'https://api.groq.com/openai/v1',
  });
}

// ─── SSE helpers ─────────────────────────────────────────────────────────────

function makeSSEStream(
  fn: (controller: ReadableStreamDefaultController) => Promise<void>
): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const enqueue = (obj: Record<string, unknown>) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
      try {
        await fn(controller);
      } catch (err) {
        console.error('[Groq streaming error]', err);
        enqueue({ delta: '\n\n*(AI service error — try again)*', source: 'error' });
        enqueue({ done: true, source: 'error' });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}

// ─── Build financial context string for system prompt ─────────────────────────

function buildFinancialContext(
  pnl: PnLStatement,
  balanceSheet?: BalanceSheet,
  marketSales?: MarketSalesRecord[],
  cohortDataset?: CohortAnalysisDataset,
): { system: string; pnlMetrics: ReturnType<typeof calculatePnLMetrics>; currSymbol: string } {
  const pnlMetrics = calculatePnLMetrics(pnl);
  const bsMetrics = balanceSheet ? calculateBalanceSheetRatios(balanceSheet) : null;
  const cohortM = cohortDataset ? calculateCohortMetrics(cohortDataset) : null;
  const currSymbol = pnl.currency === 'INR' ? '₹' : '$';

  const system = `You are BizAI, an executive AI Co-Founder and Strategic Partner collaborating directly with the leadership of "${pnl.businessName}".

FINANCIAL BASELINE CONTEXT (${pnl.currency}):
- Revenue: ${currSymbol}${pnl.revenue.toLocaleString()} (Growth: ${pnlMetrics.revenueGrowthPercent >= 0 ? '+' : ''}${pnlMetrics.revenueGrowthPercent.toFixed(1)}%)
- Gross Profit: ${currSymbol}${pnlMetrics.grossProfit.toLocaleString()} (${pnlMetrics.grossMarginPercent.toFixed(1)}% Gross Margin)
- Total OpEx: ${currSymbol}${pnlMetrics.totalOperatingExpenses.toLocaleString()} | Net Margin: ${pnlMetrics.netMarginPercent.toFixed(1)}%
${bsMetrics ? `- Working Capital: ${currSymbol}${bsMetrics.workingCapital.toLocaleString()} (Current Ratio: ${bsMetrics.currentRatio.toFixed(2)}x, Quick Ratio: ${bsMetrics.quickRatio.toFixed(2)}x)` : ''}
${cohortM ? `- Cohort Retention (NRR): ${cohortM.netRevenueRetentionPercent}% | LTV:CAC: ${cohortM.ltvToCacRatio}x | Payback: ${cohortM.cacPaybackMonths} mo` : ''}

BEHAVIORAL DIRECTIVES (CRITICAL):
1. INTERACTIVE CHATBOT STYLE: Respond conversationally, proactively, and dynamically like an elite startup co-founder in a live brainstorming meeting.
2. FUTURE PLANS OVER CURRENT DETAILS: DO NOT repeat or dump current financial statements, static ledger tables, or summaries of what the data is today. Instead, use the numbers internally as context to advise on future plans, strategic growth roadmaps, scenario forecasts, and next milestones.
3. STRUCTURED FORWARD-LOOKING ADVICE: When asked about new initiatives (like launching a product, expanding channels, raising prices, or optimizing ops):
   - Direct Strategic Take / Thesis
   - Phased Future Roadmap (Phase 1: Validation & Setup, Phase 2: Launch & Go-To-Market, Phase 3: Scale & Retention)
   - Target Unit Economics & Guardrails (Target Gross Margin, Max CAC, Payback Horizon)
   - Interactive Co-Founder Next Steps & clarifying question.
4. CLEAN PROFESSIONAL FORMAT: Do NOT use emojis. Use clean markdown bolding, structured lists, and concise paragraphs.`;

  return { system, pnlMetrics, currSymbol };
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as RequestBody;
    const {
      message = '',
      history = [],
      statement,
      balanceSheet,
      marketSales,
      cohortDataset,
      mode = 'chat',
      documentPrompt,
    } = body;

    const pnl = statement;
    if (!pnl) {
      return NextResponse.json({ error: 'Active Profit & Loss statement is required' }, { status: 400 });
    }

    const { system, pnlMetrics, currSymbol } = buildFinancialContext(pnl, balanceSheet, marketSales, cohortDataset);
    const client = getGroqClient();

    // ── Document Generation Mode ──────────────────────────────────────────────
    if (mode === 'document') {
      const prompt = documentPrompt || message;
      if (!prompt) return NextResponse.json({ error: 'Document prompt required' }, { status: 400 });

      if (!client) {
        return NextResponse.json({ error: 'No GROQ_API_KEY configured' }, { status: 503 });
      }

      return makeSSEStream(async (controller) => {
        const encoder = new TextEncoder();
        const enqueue = (obj: Record<string, unknown>) =>
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));

        const docSystem = `${system}

You are now generating a professional business document. Format it in clean markdown with clear sections, headers, bullet points, and tables where appropriate. Ground all numbers in the financial data provided above. Be thorough, professional, and investment-grade.`;

        const groqStream = await client.chat.completions.create({
          model: 'openai/gpt-oss-120b',
          stream: true,
          messages: [
            { role: 'system', content: docSystem },
            { role: 'user', content: prompt },
          ],
          max_tokens: 2000,
        });

        for await (const chunk of groqStream) {
          const delta = chunk.choices[0]?.delta?.content ?? '';
          if (delta) enqueue({ delta, source: 'groq' });
        }
        enqueue({ done: true, source: 'groq' });
      });
    }

    // ── Idea Validator Mode ───────────────────────────────────────────────────
    if (mode === 'idea-validator') {
      if (!message.trim()) return NextResponse.json({ error: 'Idea text required' }, { status: 400 });

      if (!client) {
        return NextResponse.json({ error: 'No GROQ_API_KEY configured' }, { status: 503 });
      }

      return makeSSEStream(async (controller) => {
        const encoder = new TextEncoder();
        const enqueue = (obj: Record<string, unknown>) =>
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));

        const ideaSystem = `${system}

You are now validating a business idea or expansion initiative. Provide a structured analysis covering:
1. Market Sizing (TAM / SAM / SOM) with specific numbers
2. Strategic Alignment with ${pnl.businessName}'s current financials
3. Margin impact and working capital requirements grounded in the actual numbers above
4. Competitive Moat & Key Risks
5. Final Verdict with a Feasibility Score out of 100 and clear next action

Be specific, data-driven, and grounded in the provided financial context. Format in clean markdown.`;

        const groqStream = await client.chat.completions.create({
          model: 'openai/gpt-oss-120b',
          stream: true,
          messages: [
            { role: 'system', content: ideaSystem },
            { role: 'user', content: `Validate this business idea for ${pnl.businessName}: ${message}` },
          ],
          max_tokens: 1500,
        });

        for await (const chunk of groqStream) {
          const delta = chunk.choices[0]?.delta?.content ?? '';
          if (delta) enqueue({ delta, source: 'groq' });
        }
        enqueue({ done: true, source: 'groq' });
      });
    }

    // ── Chat Mode (default) ───────────────────────────────────────────────────
    if (!message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    if (client) {
      return makeSSEStream(async (controller) => {
        const encoder = new TextEncoder();
        const enqueue = (obj: Record<string, unknown>) =>
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));

        const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
          { role: 'system', content: system },
          ...history.map((h) => ({
            role: h.role as 'user' | 'assistant',
            content: h.content,
          })),
          { role: 'user', content: message },
        ];

        let full = '';
        let sawContent = false;

        const groqStream = await client.chat.completions.create({
          model: 'openai/gpt-oss-120b',
          stream: true,
          messages,
          max_tokens: 1024,
        });

        for await (const chunk of groqStream) {
          const delta = chunk.choices[0]?.delta?.content ?? '';
          if (delta) {
            full += delta;
            sawContent = true;
            enqueue({ delta, source: 'groq' });
          }
        }

        if (!sawContent) {
          // Model returned nothing — fall back to rule-based engine
          const bsMetrics = balanceSheet ? calculateBalanceSheetRatios(balanceSheet) : null;
          const cohortM = cohortDataset ? calculateCohortMetrics(cohortDataset) : null;
          const fallback = buildLocalReply(message, pnl, pnlMetrics, bsMetrics, cohortM, marketSales ?? [], currSymbol);
          enqueue({ delta: fallback, source: 'fallback' });
          enqueue({ done: true, metrics: pnlMetrics, source: 'fallback' });
        } else {
          enqueue({ done: true, metrics: pnlMetrics, source: 'groq' });
        }
      });
    }

    // No API key — local fallback engine
    const bsMetrics = balanceSheet ? calculateBalanceSheetRatios(balanceSheet) : null;
    const cohortM = cohortDataset ? calculateCohortMetrics(cohortDataset) : null;
    const generatedReply = buildLocalReply(message, pnl, pnlMetrics, bsMetrics, cohortM, marketSales ?? [], currSymbol);

    return NextResponse.json({
      reply: generatedReply,
      metrics: pnlMetrics,
      source: 'fallback',
      fallbackReason: 'no_api_key',
    });

  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error in AI Co-Founder API:', err);
    return NextResponse.json(
      { error: 'Internal Server Error', message: err.message },
      { status: 500 }
    );
  }
}
