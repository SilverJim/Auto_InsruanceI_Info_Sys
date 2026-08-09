export type QuoteRequest = Record<string, string | boolean>;

export type Quote = {
  id: string; brand: string; initials: string; color: string; underwriter: string;
  sourceId: string; annual: number; monthly: number; fee: number; liability: string;
  deductible: string; dcpd: boolean; opcf44: boolean; comparable: boolean;
  verified: boolean; exact: boolean; status: string; statusLabel: string;
  differences: string[]; reference: string; confidence: "High" | "Medium" | "Low";
};

export interface QuoteProvider {
  getQuotes(request: QuoteRequest): Promise<Quote[]>;
}

const demoQuotes: Quote[] = [
  { id: "northstar", brand: "Northstar Direct", initials: "N", color: "navy", underwriter: "Northstar Insurance Company of Canada", sourceId: "RS-104", annual: 2148, monthly: 179, fee: 0, liability: "$2 million", deductible: "$1,000", dcpd: true, opcf44: true, comparable: true, verified: true, exact: true, status: "quoted_comparable", statusLabel: "Benchmark matched", differences: [], reference: "Q-ND-10842", confidence: "High" },
  { id: "maple", brand: "Maple Mutual", initials: "M", color: "green", underwriter: "Maple Mutual Insurance Group", sourceId: "RS-219", annual: 2316, monthly: 193, fee: 0, liability: "$2 million", deductible: "$1,000", dcpd: true, opcf44: true, comparable: true, verified: true, exact: true, status: "quoted_comparable", statusLabel: "Benchmark matched", differences: [], reference: "MM-77421", confidence: "High" },
  { id: "pioneer", brand: "Pioneer Auto", initials: "P", color: "plum", underwriter: "Pioneer General Insurance Inc.", sourceId: "RS-087", annual: 2264, monthly: 194, fee: 64, liability: "$2 million", deductible: "$1,000 / $1,500", dcpd: true, opcf44: true, comparable: false, verified: true, exact: true, status: "quoted_non_comparable", statusLabel: "Coverage differs", differences: ["Comprehensive deductible is $1,500 instead of the requested $1,000."], reference: "PA-55109", confidence: "High" },
  { id: "spark", brand: "Spark Compare", initials: "S", color: "orange", underwriter: "Underwriter shown after broker callback", sourceId: "RS-305", annual: 2050, monthly: 171, fee: 0, liability: "$2 million", deductible: "$1,000", dcpd: true, opcf44: false, comparable: false, verified: false, exact: false, status: "estimate_only", statusLabel: "Estimate only", differences: ["OPCF 44R status is unknown.", "A licensed broker must confirm the premium."], reference: "EST-9014", confidence: "Low" },
];

class MockQuoteProvider implements QuoteProvider {
  async getQuotes(request: QuoteRequest): Promise<Quote[]> {
    void request;
    await new Promise(resolve => setTimeout(resolve, 900));
    return structuredClone(demoQuotes);
  }
}

export const mockQuoteProvider: QuoteProvider = new MockQuoteProvider();

export function compareQuotes(quotes: Quote[]) {
  return [...quotes].sort((a, b) => {
    if (a.comparable !== b.comparable) return a.comparable ? -1 : 1;
    if (a.exact !== b.exact) return a.exact ? -1 : 1;
    return a.annual - b.annual;
  });
}
