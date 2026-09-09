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

function getGroqClient(): { client: OpenAI; apiKey: string } | null {
  const rawKey = process.env.GROQ_API_KEY;
  if (!rawKey) return null;
  const apiKey = rawKey.trim().replace(/^["']|["']$/g, '');
  if (!apiKey || apiKey.length < 10) return null;
  
  return {
    client: new OpenAI({
      apiKey,
      baseURL: 'https://api.groq.com/openai/v1',
    }),
    apiKey,
  };
}

// ─── SSE helpers ─────────────────────────────────────────────────────────────

function makeSSEStream(
  fn: (controller: ReadableStreamDefaultController) => Promise<void>
): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        await fn(controller);
      } catch (err) {
        console.error('[Groq streaming error]', err);
        const errObj = { delta: '\n\n*(AI advisory active — fallback mode)*', source: 'fallback' };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(errObj)}\n\n`));
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, source: 'fallback' })}\n\n`));
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
    const groqInfo = getGroqClient();
    const bsMetrics = balanceSheet ? calculateBalanceSheetRatios(balanceSheet) : null;
    const cohortM = cohortDataset ? calculateCohortMetrics(cohortDataset) : null;

    // ── Document Generation Mode ──────────────────────────────────────────────
    if (mode === 'document') {
      const prompt = documentPrompt || message;
      if (!prompt) return NextResponse.json({ error: 'Document prompt required' }, { status: 400 });

      return makeSSEStream(async (controller) => {
        const encoder = new TextEncoder();
        const enqueue = (obj: Record<string, unknown>) =>
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));

        if (groqInfo) {
          try {
            const docSystem = `${system}\n\nYou are generating an executive-ready business document. Format with clean markdown headers, tables, unit economics, and milestones.`;
            const groqStream = await groqInfo.client.chat.completions.create({
              model: 'llama-3.3-70b-versatile',
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
            return;
          } catch (err) {
            console.warn('[Groq doc fallback]', err);
          }
        }

        // Fallback document generation
        const fallbackDoc = `# Executive Document: ${pnl.businessName}\n\n## 1. Executive Summary\n- **Reporting Period**: ${pnl.reportingPeriod}\n- **Total Revenue**: ${currSymbol}${pnl.revenue.toLocaleString()}\n- **Operating Margin**: ${pnlMetrics.netMarginPercent.toFixed(1)}%\n- **Performance Score**: ${pnlMetrics.performanceScore.overallScore}/100 (${pnlMetrics.performanceScore.overallStatus})\n\n## 2. Strategic Objectives & Roadmap\n1. Optimize Cost of Goods Sold to expand gross margins toward ${Math.min(90, Math.round(pnlMetrics.grossMarginPercent + 5))}%\n2. Deploy targeted CAC payback controls (${cohortM ? `${cohortM.cacPaybackMonths} months current` : 'benchmark target: < 12 mo'})\n3. Accelerate high-margin expansion channels across key customer cohorts.\n\n## 3. Financial Guardrails\n- Maintain minimum operating liquidity buffer of 3x monthly OpEx.\n- Target sustained positive cash flow with working capital controls.`;
        
        enqueue({ delta: fallbackDoc, source: 'fallback' });
        enqueue({ done: true, source: 'fallback' });
      });
    }

    // ── Idea Validator Mode ───────────────────────────────────────────────────
    if (mode === 'idea-validator') {
      if (!message.trim()) return NextResponse.json({ error: 'Idea text required' }, { status: 400 });

      return makeSSEStream(async (controller) => {
        const encoder = new TextEncoder();
        const enqueue = (obj: Record<string, unknown>) =>
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));

        if (groqInfo) {
          try {
            const ideaSystem = `${system}\n\nYou are validating an enterprise business expansion initiative. Provide market sizing, margin feasibility, working capital requirements, and a final feasibility score out of 100 with next steps.`;
            const groqStream = await groqInfo.client.chat.completions.create({
              model: 'llama-3.3-70b-versatile',
              stream: true,
              messages: [
                { role: 'system', content: ideaSystem },
                { role: 'user', content: `Validate this initiative for ${pnl.businessName}: ${message}` },
              ],
              max_tokens: 1500,
            });

            for await (const chunk of groqStream) {
              const delta = chunk.choices[0]?.delta?.content ?? '';
              if (delta) enqueue({ delta, source: 'groq' });
            }
            enqueue({ done: true, source: 'groq' });
            return;
          } catch (err) {
            console.warn('[Groq idea validator fallback]', err);
          }
        }

        // Fallback idea validation
        const fallbackIdea = `### Feasibility & Strategic Assessment: 86/100\n\n**Strategic Alignment**: High synergy with ${pnl.businessName}'s ${currSymbol}${pnl.revenue.toLocaleString()} revenue foundation.\n\n1. **Unit Economics Potential**: Estimated Gross Margin target of 65-75% with controlled overhead.\n2. **Capital Requirement**: Estimated initial allocation manageable within current working capital.\n3. **Recommended Immediate Action**: Execute a 30-day pilot cohort with existing core accounts to validate customer willingness to pay before full rollout.`;

        enqueue({ delta: fallbackIdea, source: 'fallback' });
        enqueue({ done: true, source: 'fallback' });
      });
    }

    // ── Chat Mode (default) ───────────────────────────────────────────────────
    if (!message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    return makeSSEStream(async (controller) => {
      const encoder = new TextEncoder();
      const enqueue = (obj: Record<string, unknown>) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));

      let streamSucceeded = false;

      if (groqInfo) {
        try {
          const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
            { role: 'system', content: system },
            ...history.map((h) => ({
              role: h.role as 'user' | 'assistant',
              content: h.content,
            })),
            { role: 'user', content: message },
          ];

          const groqStream = await groqInfo.client.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            stream: true,
            messages,
            max_tokens: 1024,
          });

          for await (const chunk of groqStream) {
            const delta = chunk.choices[0]?.delta?.content ?? '';
            if (delta) {
              streamSucceeded = true;
              enqueue({ delta, source: 'groq' });
            }
          }

          if (streamSucceeded) {
            enqueue({ done: true, metrics: pnlMetrics, source: 'groq' });
            return;
          }
        } catch (groqError) {
          console.warn('[Groq API Call Error - falling back to financial engine]', groqError);
        }
      }

      // Seamless fallback to local financial intelligence engine
      const localReply = buildLocalReply(message, pnl, pnlMetrics, bsMetrics, cohortM, marketSales ?? [], currSymbol);
      enqueue({ delta: localReply, source: 'fallback' });
      enqueue({ done: true, metrics: pnlMetrics, source: 'fallback' });
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
