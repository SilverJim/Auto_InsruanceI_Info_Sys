export type QuoteRequest = Record<string, string | boolean>;

export type Quote = {
  id: string; brand: string; initials: string; color: string; underwriter: string;
  sourceId: string; annual: number | null; monthly: number | null; fee: number;
  liability: string; deductible: string; dcpd: boolean | null; opcf44: boolean | null;
  comparable: boolean; verified: boolean; exact: boolean; status: string;
  statusLabel: string; differences: string[]; reference: string;
  confidence: "High" | "Medium" | "Low"; evidenceUrl: string; capturedAt: string;
  sourceRoute: string; sampleProfile?: string;
};

export interface QuoteProvider { getQuotes(request: QuoteRequest): Promise<Quote[]> }

class PythonQuoteProvider implements QuoteProvider {
  constructor(private readonly baseUrl = process.env.NEXT_PUBLIC_QUOTE_API_URL ?? "http://localhost:8010") {}

  async getQuotes(request: QuoteRequest): Promise<Quote[]> {
    const response = await fetch(`${this.baseUrl}/api/quotes/rates_ca`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`Quote collector returned ${response.status}: ${detail}`);
    }
    const payload = await response.json() as { quotes: Quote[] };
    return payload.quotes;
  }
}

export const quoteProvider: QuoteProvider = new PythonQuoteProvider();

export function compareQuotes(quotes: Quote[]) {
  return [...quotes].sort((a, b) => {
    if (a.comparable !== b.comparable) return a.comparable ? -1 : 1;
    if (a.exact !== b.exact) return a.exact ? -1 : 1;
    return (a.annual ?? Number.MAX_SAFE_INTEGER) - (b.annual ?? Number.MAX_SAFE_INTEGER);
  });
}
