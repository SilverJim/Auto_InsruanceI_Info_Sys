"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { compareQuotes, quoteProvider, type Quote } from "./services/quotes";

type FormData = {
  firstName: string; lastName: string; birthDate: string; postalCode: string;
  licenceClass: string; firstLicensed: string; vehicleYear: string; make: string;
  model: string; annualKm: string; use: string; claims: string; convictions: string;
  currentInsurer: string; liability: string; deductible: string; effectiveDate: string;
};

const initialForm: FormData = {
  firstName: "", lastName: "", birthDate: "", postalCode: "", licenceClass: "G",
  firstLicensed: "", vehicleYear: "2022", make: "Toyota", model: "RAV4",
  annualKm: "12000", use: "Commute", claims: "0", convictions: "0",
  currentInsurer: "", liability: "$2,000,000", deductible: "$1,000", effectiveDate: "2026-09-01",
};

const steps = ["About you", "Your vehicle", "Driving history", "Coverage", "Review"];

function Mark({ children, tone = "green" }: { children: React.ReactNode; tone?: "green" | "amber" | "blue" }) {
  return <span className={`mark ${tone}`}>{children}</span>;
}

function Field({ label, name, value, onChange, type = "text", options, hint, required = true }: {
  label: string; name: keyof FormData; value: string; onChange: (name: keyof FormData, value: string) => void;
  type?: string; options?: string[]; hint?: string; required?: boolean;
}) {
  return <label className="field">
    <span>{label}{required && <b aria-hidden="true"> *</b>}</span>
    {options ? <select value={value} onChange={e => onChange(name, e.target.value)} aria-label={label}>
      {options.map(option => <option key={option}>{option}</option>)}
    </select> : <input type={type} value={value} onChange={e => onChange(name, e.target.value)} aria-label={label} />}
    {hint && <small>{hint}</small>}
  </label>;
}

export default function Home() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [consent, setConsent] = useState(false);
  const [quotes, setQuotes] = useState<Quote[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "comparable">("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const update = (name: keyof FormData, value: string) => setForm(prev => ({ ...prev, [name]: value }));
  const progress = quotes ? 100 : ((step + 1) / steps.length) * 100;
  const visibleQuotes = useMemo(() => {
    const sorted = quotes ? compareQuotes(quotes) : [];
    return filter === "comparable" ? sorted.filter(q => q.comparable) : sorted;
  }, [quotes, filter]);

  const submit = async () => {
    setLoading(true);
    setError("");
    try {
      const results = await quoteProvider.getQuotes({ ...form, consent });
      setQuotes(results);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The live collector could not be reached.");
    } finally {
      setLoading(false);
    }
  };

  const restart = () => { setQuotes(null); setStep(0); setConsent(false); };

  return <main>
    <header className="topbar">
      <Link className="brand" href="/" aria-label="Ratewise home">
        <span className="brand-glyph">R</span><span>Ratewise</span>
      </Link>
      <div className="header-note"><span className="shield">✓</span> Private by design</div>
      <button className="help">Need help? <b>1-800-555-0182</b></button>
    </header>

    {!quotes ? <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-intro">
          <p className="eyebrow light">ONTARIO AUTO INSURANCE</p>
          <h1>A clearer way to compare.</h1>
          <p>One secure profile. Multiple verified providers. Coverage differences you can actually see.</p>
        </div>
        <nav className="steps" aria-label="Quote progress">
          {steps.map((label, index) => <div className={`step ${index === step ? "active" : ""} ${index < step ? "done" : ""}`} key={label}>
            <span>{index < step ? "✓" : index + 1}</span><div><b>{label}</b><small>{index === 0 ? "Driver details" : index === 1 ? "Car & usage" : index === 2 ? "Claims & convictions" : index === 3 ? "Your comparison baseline" : "Consent & submit"}</small></div>
          </div>)}
        </nav>
        <div className="trust-note"><span>◈</span><div><b>We stop before purchase</b><p>Ratewise compares information. It never binds a policy or gives coverage advice.</p></div></div>
      </aside>

      <section className="form-panel">
        <div className="mobile-progress"><span>Step {step + 1} of {steps.length}</span><div><i style={{ width: `${progress}%` }} /></div></div>
        {step === 0 && <section className="form-card">
          <p className="eyebrow">LET&apos;S GET STARTED</p><h2>First, tell us about you.</h2>
          <p className="lede">Use your legal information for a live quote. We only ask for what selected providers need.</p>
          <div className="grid two"><Field label="Legal first name" name="firstName" value={form.firstName} onChange={update} /><Field label="Legal last name" name="lastName" value={form.lastName} onChange={update} /></div>
          <div className="grid two"><Field label="Date of birth" name="birthDate" value={form.birthDate} onChange={update} type="date" /><Field label="Home postal code" name="postalCode" value={form.postalCode} onChange={update} hint="Your normal residence and vehicle garaging location" /></div>
          <div className="grid two"><Field label="Ontario licence class" name="licenceClass" value={form.licenceClass} onChange={update} options={["G", "G2", "G1"]} /><Field label="Year first licensed" name="firstLicensed" value={form.firstLicensed} onChange={update} type="number" /></div>
          <div className="privacy-callout"><span>⌁</span><div><b>Sensitive details stay separate</b><p>Licence numbers are collected only if a selected provider requires one—and never shown in saved evidence.</p></div></div>
        </section>}
        {step === 1 && <section className="form-card">
          <p className="eyebrow">YOUR VEHICLE</p><h2>What do you drive?</h2><p className="lede">Vehicle and usage details help providers calculate the risk consistently.</p>
          <div className="grid three"><Field label="Model year" name="vehicleYear" value={form.vehicleYear} onChange={update} type="number" /><Field label="Make" name="make" value={form.make} onChange={update} /><Field label="Model" name="model" value={form.model} onChange={update} /></div>
          <div className="grid two"><Field label="Primary use" name="use" value={form.use} onChange={update} options={["Commute", "Pleasure", "School", "Business"]} /><Field label="Annual kilometres" name="annualKm" value={form.annualKm} onChange={update} type="number" hint="Your best accurate estimate" /></div>
          <div className="info-strip"><b>Demo note</b><span>VIN and lienholder fields will appear only for live providers that require them.</span></div>
        </section>}
        {step === 2 && <section className="form-card">
          <p className="eyebrow">DRIVING HISTORY</p><h2>A little about your record.</h2><p className="lede">Please answer accurately. Quote results may change after provider verification.</p>
          <div className="grid two"><Field label="At-fault claims in last 6 years" name="claims" value={form.claims} onChange={update} options={["0", "1", "2", "3+"]} /><Field label="Convictions in last 3 years" name="convictions" value={form.convictions} onChange={update} options={["0", "1", "2", "3+"]} /></div>
          <Field label="Current insurer" name="currentInsurer" value={form.currentInsurer} onChange={update} required={false} hint="Optional — helps identify potential loyalty or switching conditions" />
          <div className="warning-callout"><span>!</span><p>Live quotes must use truthful risk information. We never alter facts to manufacture a lower premium.</p></div>
        </section>}
        {step === 3 && <section className="form-card">
          <p className="eyebrow">COMPARISON BASELINE</p><h2>Compare like with like.</h2><p className="lede">Every provider receives the same benchmark. This is for comparison—not coverage advice.</p>
          <div className="grid two"><Field label="Third-party liability" name="liability" value={form.liability} onChange={update} options={["$1,000,000", "$2,000,000"]} /><Field label="Collision & comprehensive deductible" name="deductible" value={form.deductible} onChange={update} options={["$500", "$1,000", "$2,000"]} /></div>
          <Field label="Requested effective date" name="effectiveDate" value={form.effectiveDate} onChange={update} type="date" />
          <div className="baseline-list"><div><span>✓</span><p><b>DCPD included</b><small>Direct Compensation – Property Damage</small></p></div><div><span>✓</span><p><b>Mandatory accident benefits</b><small>Medical, rehabilitation & attendant care</small></p></div><div><span>✓</span><p><b>OPCF 44R requested</b><small>Family protection endorsement</small></p></div><div><span>–</span><p><b>No telematics</b><small>Unless you opt in separately</small></p></div></div>
        </section>}
        {step === 4 && <section className="form-card review-card">
          <p className="eyebrow">READY TO COLLECT</p><h2>Review what will happen.</h2><p className="lede">The Python browser collector will read Rates.ca&apos;s public, JavaScript-rendered recent-quote evidence. It will not submit an invented identity, request a callback, or express purchase intent.</p>
          <div className="summary-grid"><div><small>SEARCH PROFILE</small><b>{form.postalCode || "Ontario"}</b><span>Used only to rank relevant public samples</span></div><div><small>VEHICLE</small><b>{form.vehicleYear} {form.make} {form.model}</b><span>{Number(form.annualKm).toLocaleString()} km · {form.use}</span></div><div><small>BENCHMARK</small><b>{form.liability} liability</b><span>{form.deductible} deductibles · DCPD</span></div><div><small>LIVE ROUTE</small><b>Rates.ca public evidence</b><span>Playwright Chromium · no form submission</span></div></div>
          <div className="provider-row"><div className="provider-mini navy">R</div><p><b>Rates.ca JavaScript browser adapter</b><span>Other broker and aggregator routes remain registered for future adapters.</span></p></div>
          <div className="consent"><input id="demo-consent" type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} aria-labelledby="demo-consent-label" /><span><label id="demo-consent-label" htmlFor="demo-consent"><b>I approve live collection of public Rates.ca evidence.</b></label><small>No identity, callback request, declaration, or purchase intent will be submitted.</small></span></div>
          {error && <div className="warning-callout"><span>!</span><p>{error} Start the Python backend on port 8000 and try again.</p></div>}
        </section>}
        <footer className="form-actions"><button className="back" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>← Back</button>{step < 4 ? <button className="primary" onClick={() => setStep(step + 1)}>Continue <span>→</span></button> : <button className="primary" disabled={!consent || loading} onClick={submit}>{loading ? "Collecting live evidence…" : "Collect Rates.ca samples"} <span>→</span></button>}</footer>
      </section>
    </div> : <section className="results-page">
      <div className="results-hero"><div><Mark tone="green">✓ Live evidence collected</Mark><h1>Rates.ca public rate samples.</h1><p>These are recently published anonymous quotes, ranked for relevance to your vehicle. They are <b>not applicant-specific quotes</b> and are not comparable until coverage and underwriter details are known.</p></div><div className="hero-score"><small>ACTIVE ROUTE</small><strong>1</strong><span>Rates.ca · JavaScript browser</span></div></div>
      <div className="result-toolbar"><div className="tabs"><button className={filter === "all" ? "selected" : ""} onClick={() => setFilter("all")}>All public samples <span>{quotes.length}</span></button><button className={filter === "comparable" ? "selected" : ""} onClick={() => setFilter("comparable")}>Comparable only <span>{quotes.filter(q => q.comparable).length}</span></button></div><button className="edit-profile" onClick={restart}>← Edit profile</button></div>
      <div className="results-layout"><div className="quote-list">
        {visibleQuotes.map((quote, index) => <article className={`quote-card ${index === 0 && quote.comparable ? "featured" : ""}`} key={quote.id}>
          {index === 0 && quote.comparable && <div className="best-label">LOWEST COMPARABLE COST</div>}
          <div className="quote-main"><div className={`provider-logo ${quote.color}`}>{quote.initials}</div><div className="provider-info"><div className="provider-title"><h3>{quote.brand}</h3><Mark tone={quote.exact ? "green" : "amber"}>{quote.exact ? "Exact quote" : quote.statusLabel}</Mark></div><p>{quote.sampleProfile || `Underwritten by ${quote.underwriter}`}</p><small>Captured {new Date(quote.capturedAt).toLocaleString()} · Source {quote.sourceId}</small></div><div className="price"><small>PUBLISHED ANNUAL RATE</small><strong>{quote.annual === null ? "—" : `$${quote.annual.toLocaleString()}`}</strong><span>{quote.monthly === null ? "No rate returned" : `$${quote.monthly}/month`}</span></div></div>
          <div className="coverage-row"><div><small>LIABILITY</small><b>{quote.liability}</b></div><div><small>DEDUCTIBLES</small><b>{quote.deductible}</b></div><div><small>DCPD</small><b>{quote.dcpd === null ? "Unknown" : quote.dcpd ? "Included" : "Not included"}</b></div><div><small>OPCF 44R</small><b>{quote.opcf44 === null ? "Unknown" : quote.opcf44 ? "Included" : "Not included"}</b></div><Mark tone={quote.comparable ? "blue" : "amber"}>{quote.comparable ? "Benchmark matched" : quote.statusLabel}</Mark></div>
          {quote.differences.length > 0 && <div className="difference"><span>!</span><p><b>{quote.differences.length} coverage difference{quote.differences.length > 1 ? "s" : ""}</b> {quote.differences[0]}</p></div>}
          <button className="details" onClick={() => setExpanded(expanded === quote.id ? null : quote.id)}>{expanded === quote.id ? "Hide" : "View"} coverage & evidence <span>{expanded === quote.id ? "↑" : "↓"}</span></button>
          {expanded === quote.id && <div className="evidence"><div><small>OUTCOME</small><b>{quote.status}</b><p>{quote.exact ? "Exact demo premium" : "Indicative estimate"}</p></div><div><small>EVIDENCE</small><b>Demo response #{quote.reference}</b><p>Captured Aug 9, 2026 · Redacted</p></div><div><small>CONFIDENCE</small><b>{quote.confidence}</b><p>{quote.exact ? "Structured result with coverage" : "Estimate, not a firm quote"}</p></div></div>}
        </article>)}
      </div><aside className="ledger"><p className="eyebrow">ROUTE LEDGER</p><h3>Collection boundaries are explicit.</h3><div className="ledger-stat"><strong>1</strong><span>Implemented live<br/>public-data route</span></div><div className="ledger-lines"><p><i className="dot green-dot"/>Rates.ca public evidence <b>Live</b></p><p><i className="dot blue-dot"/>JS-rendered collection <b>Playwright</b></p><p><i className="dot amber-dot"/>Personal form submission <b>Stopped</b></p><p><i className="dot grey-dot"/>Purchase intent <b>Never</b></p></div><div className="ledger-note"><span>i</span><p><b>Public samples are not your quote.</b><br/>A live personal quote requires truthful applicant data and route-level consent.</p></div></aside></div>
      <div className="demo-banner"><span>LIVE PUBLIC DATA</span><p>Collected from Rates.ca&apos;s public Ontario page. No fabricated identity, callback request, declaration, or purchase action is submitted.</p></div>
    </section>}
    <footer className="site-footer"><span>Ratewise</span><p>Ontario auto insurance comparison prototype · Information only, not insurance advice.</p><nav><Link href="/#privacy">Privacy</Link><Link href="/#how-it-works">How it works</Link><Link href="/#delete-data">Delete my data</Link></nav></footer>
  </main>;
}
