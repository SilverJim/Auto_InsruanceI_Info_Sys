# Ratewise — Ontario Auto Insurance Comparison

Ratewise is a coverage-first Ontario private-passenger auto insurance comparison prototype. It collects one accurate user profile, returns normalized demo quotes, distinguishes comparable quotes from estimates, and shows provider verification and evidence metadata.

## Run locally

```bash
npm install
npm run dev
```

Then open the local URL shown by the development server. Create a deployment build with `npm run build`.

## Current implementation

- Five-step driver, vehicle, history, coverage, and consent intake
- Responsive quote comparison and coverage ledger
- Fictional provider data with exact, non-comparable, and estimate outcomes
- Replaceable `QuoteProvider` adapter in `app/services/quotes.ts`
- Route-level consent language, provider identity, evidence, and confidence display

All displayed providers and premiums are fictional. No form information leaves the browser in the current prototype.

## Documentation

- [Requirements](requirement_doc.md)
- [System design](design.md)
