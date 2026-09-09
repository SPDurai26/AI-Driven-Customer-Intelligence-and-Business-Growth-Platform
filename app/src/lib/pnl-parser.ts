// ============================================================================
// P&L PARSER — Smart Extraction from CSV / TXT Input
// Real CSV row/column parsing + regex fallback for plain text
// ============================================================================

import { PnLStatement, DEFAULT_PNL_STATEMENT, OperatingExpensesBreakdown } from './report-store';

export interface ParsedLineItem {
  key: string;
  value: number;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  isEstimated: boolean; // true = filled with Apex Retail placeholder, not from the file
}

export interface ParsedPnLResult {
  statement: PnLStatement;
  extractedLineItems: ParsedLineItem[];
  confidence: number; // 0–100
  currency: string;
}

type ValueMap = { [key: string]: number };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function detectCurrency(text: string): string {
  if (/₹|INR|lakh|crore|rupee/i.test(text)) return 'INR';
  if (/€|EUR|euro/i.test(text)) return 'EUR';
  if (/£|GBP|pound/i.test(text)) return 'GBP';
  return 'USD';
}

function extractNumber(text: string): number {
  const cleaned = text.replace(/[₹$€£,\s]/g, '');
  const num = parseFloat(cleaned);
  if (isNaN(num)) return 0;
  if (/lakh/i.test(text)) return num * 100000;
  if (/cr|crore/i.test(text)) return num * 10000000;
  return num;
}

function matchLineItem(line: string, patterns: RegExp[]): number | null {
  for (const pattern of patterns) {
    const match = line.match(pattern);
    if (match && match[1]) {
      const val = extractNumber(match[1]);
      if (val > 0) return val;
    }
  }
  return null;
}

// ─── Real CSV Parser ───────────────────────────────────────────────────────────

/**
 * Tries to parse structured CSV rows/columns.
 * Looks for a header row, then maps column names to known field names.
 * Returns a ValueMap if successful, null otherwise.
 */
function parseCSVColumns(raw: string): ValueMap | null {
  const rows = raw.split('\n').map(r => r.trim()).filter(Boolean);
  if (rows.length < 2) return null;

  // Detect CSV structure: rows should have commas
  const commaRows = rows.filter(r => r.includes(','));
  if (commaRows.length < 2) return null;

  // Try to find a header row (first row with text, not just numbers)
  const headerRow = rows[0];
  const cols = headerRow.split(',').map(c => c.trim().toLowerCase().replace(/['"]/g, ''));

  // Known column name aliases for value and label
  const LABEL_ALIASES = ['item', 'description', 'category', 'account', 'name', 'line item'];
  const VALUE_ALIASES = ['amount', 'value', 'current', 'current period', 'this period', 'total', 'actual', 'ytd'];

  const labelCol = cols.findIndex(c => LABEL_ALIASES.some(a => c.includes(a)));
  const valueCol = cols.findIndex(c => VALUE_ALIASES.some(a => c.includes(a)));

  if (labelCol === -1 && valueCol === -1) {
    // No recognizable headers. Try 2-column format: Label, Amount
    if (cols.length === 2) {
      return parse2ColumnCSV(rows.slice(1));
    }
    return null;
  }

  const lIdx = labelCol >= 0 ? labelCol : 0;
  const vIdx = valueCol >= 0 ? valueCol : 1;

  const result: ValueMap = {};
  for (const row of rows.slice(1)) {
    const parts = row.split(',').map(p => p.trim().replace(/['"]/g, ''));
    if (parts.length <= Math.max(lIdx, vIdx)) continue;
    const label = parts[lIdx].toLowerCase();
    const val = extractNumber(parts[vIdx]);
    if (val > 0) classifyLabel(label, val, result);
  }

  return Object.keys(result).length > 0 ? result : null;
}

function parse2ColumnCSV(dataRows: string[]): ValueMap {
  const result: ValueMap = {};
  for (const row of dataRows) {
    const parts = row.split(',').map(p => p.trim().replace(/['"]/g, ''));
    if (parts.length < 2) continue;
    const label = parts[0].toLowerCase();
    const val = extractNumber(parts[1]);
    if (val > 0) classifyLabel(label, val, result);
  }
  return result;
}

function classifyLabel(label: string, val: number, result: ValueMap) {
  if (/revenue|sales|turnover|income/i.test(label) && !/cost|expense/i.test(label)) {
    result.revenue = result.revenue ? Math.max(result.revenue, val) : val;
  } else if (/cogs|cost of (goods|sales)|direct cost/i.test(label)) {
    result.cogs = val;
  } else if (/salary|salaries|payroll|employee|staff|wages|personnel/i.test(label)) {
    result.payroll = val;
  } else if (/rent|lease|utilities|electricity/i.test(label)) {
    result.rent = val;
  } else if (/marketing|advertising|ads|promotion/i.test(label)) {
    result.marketing = val;
  } else if (/depreciation|amortization/i.test(label)) {
    result.depreciation = val;
  } else if (/interest|finance charge|bank charge/i.test(label)) {
    result.interest = val;
  } else if (/tax|gst|vat|income tax/i.test(label)) {
    result.taxes = val;
  }
}

// ─── Plain Text (regex) Fallback ──────────────────────────────────────────────

function parseWithRegex(lines: string[]): ValueMap {
  const result: ValueMap = {};

  const search = (patterns: RegExp[]): number | null => {
    for (const line of lines) {
      const val = matchLineItem(line, patterns);
      if (val !== null) return val;
    }
    return null;
  };

  const revenue = search([
    /(?:total\s+)?(?:net\s+)?(?:revenue|sales|turnover|income)[:\s]+([₹$€£]?[\d,\.]+\s*(?:lakh|crore|cr)?)/i,
  ]);
  if (revenue) result.revenue = revenue;

  const cogs = search([
    /(?:cost\s+of\s+(?:goods?\s+sold|sales)|cogs|direct\s+costs?)[:\s]+([₹$€£]?[\d,\.]+\s*(?:lakh|crore|cr)?)/i,
  ]);
  if (cogs) result.cogs = cogs;

  const payroll = search([
    /(?:salary|salaries|payroll|employee|staff|wages?|personnel)[:\s]+([₹$€£]?[\d,\.]+\s*(?:lakh|crore|cr)?)/i,
  ]);
  if (payroll) result.payroll = payroll;

  const rent = search([
    /(?:rent|lease|utilities|electricity|water)[:\s]+([₹$€£]?[\d,\.]+\s*(?:lakh|crore|cr)?)/i,
  ]);
  if (rent) result.rent = rent;

  const marketing = search([
    /(?:marketing|advertising|ads?|promotions?|digital\s+marketing)[:\s]+([₹$€£]?[\d,\.]+\s*(?:lakh|crore|cr)?)/i,
  ]);
  if (marketing) result.marketing = marketing;

  const depreciation = search([
    /(?:depreciation|amortization)[:\s]+([₹$€£]?[\d,\.]+\s*(?:lakh|crore|cr)?)/i,
  ]);
  if (depreciation) result.depreciation = depreciation;

  const interest = search([
    /(?:interest|finance\s+charges?|bank\s+charges?)[:\s]+([₹$€£]?[\d,\.]+\s*(?:lakh|crore|cr)?)/i,
  ]);
  if (interest) result.interest = interest;

  const taxes = search([
    /(?:tax(?:es)?|income\s+tax|gst|vat|provisional\s+tax)[:\s]+([₹$€£]?[\d,\.]+\s*(?:lakh|crore|cr)?)/i,
  ]);
  if (taxes) result.taxes = taxes;

  return result;
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export function parsePnLFromText(raw: string, fileName: string): ParsedPnLResult {
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
  const joined = lines.join('\n');
  const currency = detectCurrency(joined);

  // Attempt real CSV column parsing first, fall back to regex
  const csvValues = parseCSVColumns(raw);
  const values: ValueMap = csvValues ?? parseWithRegex(lines);

  const extracted: ParsedLineItem[] = [];
  const DEF = DEFAULT_PNL_STATEMENT;

  const track = (key: string, val: number | undefined, label: string, confidence: 'HIGH' | 'MEDIUM' | 'LOW') => {
    const isEstimated = val === undefined;
    extracted.push({ key: label, value: val ?? 0, confidence, isEstimated });
    return val;
  };

  const revenue = track('revenue', values.revenue, 'Revenue', 'HIGH');
  const cogs = track('cogs', values.cogs, 'Cost of Goods Sold', 'HIGH');
  const payroll = track('payroll', values.payroll, 'Employee Expenses', 'HIGH');
  const rent = track('rent', values.rent, 'Rent & Utilities', 'MEDIUM');
  const marketing = track('marketing', values.marketing, 'Marketing', 'HIGH');
  const depreciation = track('depreciation', values.depreciation, 'Depreciation', 'MEDIUM');
  const interest = track('interest', values.interest, 'Interest', 'MEDIUM');
  const taxes = track('taxes', values.taxes, 'Taxes', 'MEDIUM');

  // Business name detection
  let businessName = DEF.businessName;
  const bizMatch = joined.match(/(?:company|business|firm|name|for)[:\s]+([A-Z][A-Za-z\s&.,'-]{4,60})/);
  if (bizMatch) businessName = bizMatch[1].trim().replace(/\s+/g, ' ');
  // Also try first line if it looks like a business name
  if (businessName === DEF.businessName && lines[0] && /^[A-Z]/.test(lines[0]) && !lines[0].includes(':')) {
    const firstLine = lines[0].trim();
    if (firstLine.length > 4 && firstLine.length < 60) businessName = firstLine;
  }

  // Period detection
  let period = DEF.reportingPeriod;
  const periodMatch = joined.match(/(?:period|quarter|fy|financial\s+year|year|month|q[1-4])[:\s]+([A-Za-z0-9\s\-\/]+)/i);
  if (periodMatch) period = periodMatch[1].trim().slice(0, 30);

  const expenses: OperatingExpensesBreakdown = {
    employeeExpenses: payroll ?? 0,
    rentAndUtilities: rent ?? 0,
    marketingExpenses: marketing ?? 0,
    depreciation: depreciation ?? 0,
    interestExpenses: interest ?? 0,
    taxes: taxes ?? 0,
    otherExpenses: 0,
  };

  const statement: PnLStatement = {
    id: `pnl-parsed-${Date.now()}`,
    businessName,
    industry: DEF.industry,
    reportingPeriod: period,
    currency,
    revenue: revenue ?? 0,
    costOfGoodsSold: cogs ?? 0,
    expenses,
    previousPeriodRevenue: values.prevRevenue ?? null,
    previousPeriodNetProfit: values.prevNetProfit ?? null,
    fixedCosts: expenses.rentAndUtilities + expenses.employeeExpenses + expenses.depreciation,
  };

  const realCount = extracted.filter(e => !e.isEstimated).length;
  const confidence = Math.min(100, Math.round((realCount / 7) * 100));

  return { statement, extractedLineItems: extracted, confidence, currency };
}
