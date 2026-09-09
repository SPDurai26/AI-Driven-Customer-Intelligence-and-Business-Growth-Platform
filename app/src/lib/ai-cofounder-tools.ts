// AI Co-Founder Tools & Generator Library
// Inspired by harshmriduhash/AI_CO_FOUNDER

export interface BusinessDocumentTemplate {
  id: string;
  title: string;
  category: 'Investor & Pitch' | 'Sales & Legal' | 'Marketing & PR' | 'Operations & Strategy';
  description: string;
  iconKey: 'presentation' | 'file-text' | 'mail' | 'dollar-sign' | 'scale' | 'trending-up';
  generatePrompt: string;
}

export const DOCUMENT_TEMPLATES: BusinessDocumentTemplate[] = [
  {
    id: 'doc-pitch-deck',
    title: 'Investor Pitch Deck Outline & Script',
    category: 'Investor & Pitch',
    description: '10-slide standard venture pitch deck with problem, solution, market size, traction, and ask.',
    iconKey: 'presentation',
    generatePrompt: 'Generate a 10-slide investor pitch deck structure and script tailored to our business model and financial traction.'
  },
  {
    id: 'doc-exec-summary',
    title: 'Executive Summary (1-Pager)',
    category: 'Investor & Pitch',
    description: 'High-impact 1-page business brief highlighting revenue, margins, customer growth, and unique moat.',
    iconKey: 'file-text',
    generatePrompt: 'Draft an executive summary one-pager including our latest P&L metrics, unit economics, and growth objectives.'
  },
  {
    id: 'doc-investor-update',
    title: 'Monthly Shareholder & Investor Memo',
    category: 'Investor & Pitch',
    description: 'Structured monthly update covering MRR, NRR, burn rate, wins, bottlenecks, and specific asks.',
    iconKey: 'mail',
    generatePrompt: 'Draft a comprehensive monthly investor update memo based on our current P&L, balance sheet, and cohort metrics.'
  },
  {
    id: 'doc-pricing-strategy',
    title: 'Pricing Strategy & Tiering Blueprint',
    category: 'Sales & Legal',
    description: 'Tiered pricing matrix (Starter / Pro / Enterprise) with value metrics, margin projections, and packaging.',
    iconKey: 'dollar-sign',
    generatePrompt: 'Build a 3-tier pricing strategy document optimized to increase average order value and protect 60%+ gross margins.'
  },
  {
    id: 'doc-sla-sow',
    title: 'Client Service Level Agreement (SLA) & SOW',
    category: 'Sales & Legal',
    description: 'Commercial service contract outline with deliverables, payment terms, warranties, and liability caps.',
    iconKey: 'scale',
    generatePrompt: 'Draft a professional Statement of Work (SOW) and SLA template with payment milestones and delivery timelines.'
  },
  {
    id: 'doc-launch-pr',
    title: 'Product Launch Press Release & GTM Brief',
    category: 'Marketing & PR',
    description: 'Go-To-Market press release, value messaging, target audience hook, and launch distribution checklist.',
    iconKey: 'trending-up',
    generatePrompt: 'Write an official product launch press release and Go-To-Market messaging brief.'
  },
];

export interface PersonaAdvisor {
  id: string;
  name: string;
  role: 'CFO (Financial Strategist)' | 'CMO (Growth Architect)' | 'CTO (Technical Lead)' | 'COO (Operations & Scaling)';
  iconKey: 'landmark' | 'trending-up' | 'cpu' | 'layers';
  color: string;
  expertise: string;
  greeting: string;
  samplePrompts: string[];
}

export const EXECUTIVE_PERSONAS: PersonaAdvisor[] = [
  {
    id: 'persona-cfo',
    name: 'Marcus Vance',
    role: 'CFO (Financial Strategist)',
    iconKey: 'landmark',
    color: '#10B981',
    expertise: 'P&L modeling, Gross Margin expansion, Balance Sheet liquidity, Break-even optimization, and Cash runway extension.',
    greeting: 'I am Marcus, your AI CFO. I analyze your margins, working capital, and cost structures to keep the company solvent and highly profitable. What future growth plan or financial decision should we strategize?',
    samplePrompts: [
      'How do we expand gross margin by 8% over the next 2 quarters?',
      'Structure a working capital plan to optimize cash conversion cycle',
      'What break-even sales target should we model for our next expansion?',
      'How do we reduce OpEx while preserving growth velocity?',
    ]
  },
  {
    id: 'persona-cmo',
    name: 'Elena Rostova',
    role: 'CMO (Growth Architect)',
    iconKey: 'trending-up',
    color: '#06B6D4',
    expertise: 'Customer Acquisition (CAC), Net Revenue Retention (NRR), Cohort retention, GTM positioning, and campaign ROI.',
    greeting: 'I am Elena, your AI CMO. I specialize in scaling acquisition, product launches, and customer expansion. What is your upcoming launch plan or target market?',
    samplePrompts: [
      'Plan our next product launch & Go-To-Market pricing strategy',
      'How do we drive Net Revenue Retention (NRR) past 115%?',
      'Structure an acquisition campaign with sub-6-month CAC payback',
      'Which customer cohort vintage has the highest expansion potential?',
    ]
  },
  {
    id: 'persona-cto',
    name: 'Devin Chen',
    role: 'CTO (Technical Lead)',
    iconKey: 'cpu',
    color: '#7C3AED',
    expertise: 'System architecture, API integrations, billing webhooks, database modeling, and automated data pipelines.',
    greeting: 'I am Devin, your AI CTO. I help you build scalable technical foundations, product roadmaps, and automation pipelines. What technical strategy or infrastructure should we plan?',
    samplePrompts: [
      'What technical architecture roadmap will support 5x transaction scale?',
      'How should we automate billing & recurring payment webhooks?',
      'What data pipeline should we build for real-time customer analytics?',
      'How do we integrate external CRM and ERP APIs securely?',
    ]
  },
  {
    id: 'persona-coo',
    name: 'Siddharth Rao',
    role: 'COO (Operations & Scaling)',
    iconKey: 'layers',
    color: '#F59E0B',
    expertise: 'Supply chain negotiation, inventory turnover, team execution sprints, SLA management, and process automation.',
    greeting: 'I am Siddharth, your AI COO. I focus on operational efficiency, execution roadmaps, and inventory velocity. Where is your upcoming operational milestone?',
    samplePrompts: [
      'How do we accelerate inventory turnover and shorten supply lead times?',
      'Structure a 30-day cross-functional execution sprint for our team',
      'What vendor SLA renegotiation strategy should we deploy this month?',
      'Where are our primary operational bottlenecks and how do we automate them?',
    ]
  }
];
