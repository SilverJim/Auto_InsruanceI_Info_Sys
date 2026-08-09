# Ontario All-Quote Agent - Requirements Specification

## 1. Purpose and Scope

The system shall be a personal-use agentic tool that obtains and compares Ontario private-passenger auto insurance quotes for its developer's own insurance-shopping needs.

The system shall:

- Collect the participant's accurate profile once.
- Discover every distinct, current rate source that the participant can lawfully and truthfully access for the stated risk.
- Plan and execute the appropriate web, phone, broker, aggregator, affinity, specialty, MGA/program, mutual, and residual-market route.
- Normalize quote results using consistent coverage assumptions.
- Produce evidence for every quote, blocker, handoff, or other terminal outcome.
- Explain incomplete coverage and unresolved markets without inflating market reach.

The system shall not obtain quotes, make calls, or submit information for friends, family, customers, or the public.

## 2. Definitions and Market Model

The system shall keep the following layers separate:

| Layer | Meaning |
|---|---|
| Legal underwriter | The licensed company named on the policy or rate filing. |
| Insurer group | The parent or operating group that may contain several legal underwriters. |
| Consumer brand | The name the applicant sees; it may be a direct brand, affinity brand, or broker brand. |
| Distributor | A direct writer, exclusive agent, independent broker, or digital brokerage that can place the business. |
| Aggregator | A comparison or lead platform whose output is limited to its live panel and the applicant's eligibility. |
| MGA or program | An administrator or wholesale market with delegated authority; it is not automatically a distinct insurer or standard auto market. |
| Residual market | A market of last resort accessed through a licensed broker or agent, not a normal direct quote path. |

“Every” means every distinct, current rate source that the applicant can lawfully and truthfully access for the stated risk. The system shall distinguish consumer brands, legal underwriting companies, insurer groups, broker panels, and distinct programs, and shall deduplicate routes that resolve to the same underlying rate source.

## 3. User, Eligibility, and Operating Modes

### 3.1 User restrictions

- The system is for one individual Ontario resident and the participant's own rates only.
- Live interactions shall use only the participant's own accurate information.
- The system shall not use a shared canned driver profile for live interactions.
- The quoted rate itself is not a success criterion; safe discovery, routing, evidence, handoffs, and normalized results are required.

### 3.2 Supported modes

The system shall support:

- `live-quote` mode using the participant's legal identity and accurate risk information.
- Discovery mode using an alias only where identity is not verified, no truth declaration is requested, and the destination's terms permit it.
- Estimate-only demonstration using a clearly labelled hypothetical profile only in a local sandbox or a destination flow that expressly permits non-binding estimates based on assumptions.

A hypothetical profile shall never:

- Contain a driver's licence number.
- Enter a verification, consent, declaration, callback, or purchase step.
- Be represented to a real person as a real applicant.

The resulting outcome shall be labelled `estimate_only`, `manual_handoff`, or `blocked` as appropriate.

## 4. Required End-to-End Behaviour

The recommended orchestration flow is:

`Consent-aware intake -> market registry -> route planner -> browser and voice agents -> evidence store -> quote normalizer -> coverage ledger and comparison`

The implementation may use computer use, browser automation, approved APIs or integrations, voice, structured data capture, a licensed intermediary, a human-in-the-loop workflow, or another permitted design. No specific SDK, model, browser framework, dashboard, or visible cursor interaction is required.

The system shall not treat tooling freedom as authorization to evade destination controls or use private endpoints or credentials without the owner's authorization.

## 5. Intake Requirements

The OAF 1 shall be the authoritative backbone of the canonical intake schema. The system shall collect a superset of the necessary fields while applying data minimization and asking only for fields required by selected routes.

### 5.1 Applicant, contact, and household

| Data group | Fields and rules |
|---|---|
| Consent and mode | Consent timestamp; live-quote or discovery mode; permitted channels; approved insurers or brokers; callback permission; recording or transcription choice. |
| Identity | Alias for permitted discovery-only use; legal name for a live quote; preferred language; date of birth; gender field as required by the form; marital status. |
| Contact | Email; mobile, home, or work phone; preferred callback window. |
| Primary address | Street; unit; city; province; postal code; residence start date; prior address if required; confirmation that this is the normal residence and garaging location. |
| Household | All licensed household members; all regular vehicle users; dependants relevant to optional benefits; other household vehicles. |

### 5.2 Driver information

| Data group | Fields and rules |
|---|---|
| Licence identity | Name exactly as shown on the licence; the participant's own valid Ontario driver's licence number when required; province; class; status; expiry if requested. |
| Licensing timeline | Dates or years for G1, G2, and G; date first licensed in Canada or the U.S.; other classes; recognized out-of-country experience and proof availability. |
| Training | Approved driver-training completion and certificate availability. |
| Assignment | Principal, secondary, or occasional driver; percentage use by vehicle; other regular access. |
| Discount eligibility | Retiree criteria; student status; good-driver or group discounts; willingness to consider telematics. Telematics quotes shall remain separate unless the user opts in. |
| Other drivers | All other licensed persons in the household or business and whether they have their own policy or require an exclusion form. |

### 5.3 Vehicle and use

| Data group | Fields and rules |
|---|---|
| Vehicle identity | VIN; model year; make; model; trim or body type; engine or fuel type; cylinders or engine size and GVWR where requested. |
| Ownership | Owned or leased; new or used; purchase or lease month and year; purchase price; registered owner; actual owner; lienholder or lessor details. |
| Use | Pleasure, commute, school, business, farm, or commercial; one-way commute distance; annual kilometres; business-use percentage; days commuting; carpool and passenger count. |
| Risk details | Garaging address; unrepaired damage; modifications or customization; non-factory equipment; winter tires; approved theft-recovery device; anti-theft features. |
| Special use | Rideshare; delivery; carshare; rental to others; passengers for compensation; trailer use; explosives or radioactive materials. These answers may trigger commercial or specialty handling. |
| Household fleet | Total household or business vehicles and driver-to-vehicle allocation. |

### 5.4 Insurance and driving history

| History group | Fields and lookback |
|---|---|
| Current insurance | Insurer; policy number; expiry date; current premium if volunteered; years continuously insured; reason for shopping. |
| Licence and permit events | Any driver's licence, vehicle permit, or similar suspension or cancellation in the last 6 years, with dates and details. |
| Insurance cancellations | Any insurer cancellation in the last 3 years, including non-payment where asked. |
| Misrepresentation | Any policy cancellation or claim denial for material misrepresentation in the last 3 years. |
| Fraud finding | Any court finding of fraud connected with auto insurance. |
| Accidents and claims | All ownership, use, or operation accidents and claims in the last 6 years: driver; vehicle; date; fault percentage if known; coverage; paid or estimated amount; details. |
| Convictions | All driving convictions in the last 3 years: driver; conviction date; description. |

## 6. Consent and Human Checkpoints

The system shall obtain the participant's explicit consent before sharing personal data with any quote route. Before submission, it shall show which route will receive which fields and allow the user to exclude a route.

The system shall not enter another household driver's information without that person's consent.

| Checkpoint | Required behaviour |
|---|---|
| Identity or database lookup | The applicant confirms the legal name, licence use, and consent immediately before submission. |
| Application declaration | Stop. Do not click or sign as part of the challenge. |
| Coverage advice | Present options and differences. Do not recommend suitability unless handled by a licensed professional. |
| CAPTCHA or access restriction | Hand off only if permitted; otherwise log the blocker. |
| Quote-to-purchase transition | Stop after saving the quote details. Do not bind. |

The system shall escalate immediately when a representative requires the applicant, licensed advice, a declaration, identity verification, or consent to obtain third-party records.

## 7. Market Registry Requirements

The regulatory seed is the Ontario private-passenger auto rate-approval dataset, which contained 60 legal insurer records across 32 insurer groups on August 6, 2026. It is a discovery seed and shall not be represented as proof that every entity is currently open for standard retail new business.

Each record shall be currently validated for legal name, amalgamation, product scope, new-business status, consumer-accessible route, and relevance to the participant's risk.

### 7.1 Required registry fields

| Field | Meaning |
|---|---|
| `registry_id` | Stable internal key. |
| `legal_underwriter` | Licensed company name. |
| `insurer_group` | Parent or operating group. |
| `brand_or_program` | Consumer-facing route. |
| `distribution_type` | `direct` \| `agent` \| `broker` \| `aggregator` \| `affinity` \| `MGA_program` \| `mutual` \| `residual`. |
| `product_scope` | `standard_PPA` \| `nonstandard_PPA` \| `high_net_worth` \| `collector` \| `commercial_specialty` \| `unknown`. |
| `distinct_rate_source_id` | Deduplication key. |
| `quote_url` | Official public quote URL. |
| `public_phone_route` | Public sales or callback route. |
| `licensed_intermediary` | Brokerage or agency name and regulator evidence. |
| `requirements` | `licence` \| `VIN` \| `membership` \| `callback` \| `human` \| `other`. |
| `automation_notes` | Terms, CAPTCHA, rate limit, and handoff notes. |
| `status` | One value from the status enum. |
| `source_url` | Authoritative evidence. |
| `last_verified_at` | ISO 8601 timestamp. |
| `evidence_artifact` | Redacted screenshot, structured call note, or response reference. |

The implementation shall also retain `known_panel_source`, callback route, requirement flags such as `requires_licence`, `requires_VIN`, `requires_membership`, and `requires_human`, and a source citation where those are represented separately.

## 8. Market Discovery and Routing

### 8.1 Practical route strategy

- Direct and exclusive-agent set: attempt Allstate, Aviva Direct, belairdirect, CAA, Co-operators, Desjardins, RBC Insurance, Sonnet, Square One, TD Insurance, and The Personal where the applicant qualifies.
- Broad broker engine A: use either Rates.ca or LowestRates.ca first, then inspect the returned legal underwriters.
- Broad broker engine B: use Surex to add or verify Aviva, Intact, Jevco, Wawanesa, CAA, Coachman, Definity/Economical, Gore, Pafco, Pembridge, SGI, and Travelers, subject to the live panel and profile.
- Independent broker verifier: use a broad licensed brokerage such as ThinkInsure, Onlia, or Scoop, or another RIBO-licensed broker, and request the complete carrier list and all quote outcomes.
- Gap-fill routes: contact Ontario mutuals, affinity programs, high-net-worth markets, collector programs, and the residual market through their actual routes.

Panel membership shall be re-verified during the hackathon. Each route shall record the verification date, source, and returned underwriter. Marketing claims such as “50+ providers” shall not be treated as proof of 50 Ontario PPA quotes for one profile.

### 8.2 Direct, affinity, and digital routes

The source brief provides the following explicit starting-map row:

| Route | Primary journey | Known underwriting layer |
|---|---|---|
| Allstate | Online quote plus agent path | Allstate Insurance Company of Canada |

The implementation shall capture the legal underwriter actually returned on the quote or disclosure page.

### 8.3 Broker, aggregator, and branded-broker routes

| Route | Required handling |
|---|---|
| Rates.ca / LowestRates.ca | Treat as overlapping broad online comparison routes until returned panels prove otherwise. |
| Surex | Use as a broad licensed brokerage and callback route; use published carrier and MGA disclosure. |
| ThinkInsure | Use as a broad independent brokerage with web intake and advisor completion. |
| Onlia | Capture the actual returned insurer, not the brokerage brand. |
| Scoop | Support the digital brokerage and callback workflow and confirm the full panel. |
| PC Insurance | Capture the returned underwriter and any eligibility discount. |
| Inova | Verify membership and the actual panel. |
| InsuranceHotline | Treat as a lead and broker-network route, not as the underwriting company. |
| Local independent broker | Use for full market disclosure, mutuals, non-standard, specialty, and residual-market access. |

### 8.4 MGA, program, specialty, mutual, and residual routes

- Do not assume every MGA produces a separate standard auto rate.
- Use Hagerty for collector vehicles only when vehicle and household rules are met; the program is administered separately and underwritten by Aviva, and it is not a daily-driver substitute.
- Treat Agile, APRIL Canada, Burns & Wilcox, Cambrian Special Risks, Milnco, and Special Risk as discovery leads. Count a source only after verifying that it accepts a relevant individual Ontario private-passenger risk.
- Test Echelon, Jevco, Pafco, and Coachman through licensed broker routes for a fitting non-standard auto profile.
- Verify Chubb and PURE through an appointed broker for high-net-worth or specialty risks; do not count inaccessible markets.
- Access Facility Association through a licensed intermediary for otherwise hard-to-place risks.
- Use the Ontario Mutuals locator and validate product availability and territory with the specific mutual.

## 9. Web and Computer-Use Routes

The system shall:

- Navigate official direct-writer sites and approved broker or aggregator quote journeys.
- Map destination questions to the canonical intake schema and ask the user only when a genuinely new field appears.
- Pause before any identity lookup, consent attestation, signature, payment, or purchase action.
- Capture the source URL, timestamp, quote or reference ID, premium, coverage, discounts, validity period, and a redacted evidence artifact.
- Stop at CAPTCHAs or explicit anti-automation barriers and record the status without evasion.

## 10. Voice and Cross-Channel Requirements

Voice may be used when a website does not return a rate, directs the user to a sales line, promises a callback, or requires a broker to reach a market manually. The implementation may place outbound calls and receive inbound callbacks.

Where a web route produces a quote or reference ID before a call, the system shall preserve the ID, source URL, partial progress, and consent state and hand that context to the caller. It shall record whether the handoff produced a rate, an eligibility answer, or an exact blocker.

At the beginning of every call, the system shall disclose that it is automated and identify its purpose. It shall not:

- Misrepresent itself as a licensed broker, agent, insurer employee, or human applicant.
- Claim affiliation with the Organizer, an insurer, or a brokerage.
- Spoof caller ID, pressure a representative, place repeated calls, or continue after a request to stop.

If asked about the prototype or its operator, the system shall answer truthfully and offer to transfer to the participant.

The system shall not record or transcribe unless the other party affirmatively agrees. If consent is refused, it shall retain only structured, non-audio outcome notes.

Suggested outbound opening:

> Hello, I am an automated assistant acting for [applicant's legal name] to request an Ontario private-passenger auto insurance quote. Is it okay to continue with an automated assistant? The applicant is available if you need verification or consent.

Suggested inbound opening:

> Thank you for calling back. I am an automated assistant receiving this call for [applicant's legal name]. May I continue, or would you prefer to speak directly with the applicant?

## 11. Coverage Configuration and Comparability

Every route shall receive the same requested effective date and benchmark coverage package. If a route cannot match it, the system shall preserve the quote, mark it non-comparable, and list every difference.

| Coverage group | Normalization requirement |
|---|---|
| Policy timing | Same requested effective date; 12-month term where available; same quote-date window. |
| Third-party liability | One consistent user-selected limit, such as $1 million or $2 million. Ontario's legal minimum is $200,000. |
| Accident benefits | Mandatory medical, rehabilitation, and attendant care; requested increased limits; explicit included or excluded status for every optional benefit after July 1, 2026. |
| Optional benefits to record | Income replacement; non-earner; caregiver; lost educational expenses; expenses of visitors; housekeeping and home maintenance; damage to personal items; death; funeral; dependant care; indexation; supplementary or increased medical, rehabilitation, and attendant care; catastrophic impairment. |
| Uninsured automobile | Included status and limit details where returned. |
| DCPD | Included or opted out; deductible if any. If OPCF 49 is elected, surface collision and all-perils implications. |
| Own-damage coverage | Specified perils, comprehensive, collision, or all perils; deductible for each. |
| Endorsements | At minimum, track OPCF 20 transportation replacement, OPCF 27 non-owned automobiles, OPCF 43 removing depreciation deduction, and OPCF 44R family protection when offered or requested. |
| Discounts | Bundle; multi-vehicle; winter tires; theft-recovery; driver training; claims-free; conviction-free; retiree; affinity; telematics. Record conditional discounts. |
| Payment | Annual versus monthly premium; finance charge or instalment fee; deposit; number and amount of instalments. Never submit payment. |

For new policies after July 1, 2026, only medical, rehabilitation, and attendant care remain mandatory accident benefits; all other accident benefits shall be captured explicitly as optional.

Suggested demo benchmark: $2 million third-party liability, DCPD included, standard mandatory medical/rehabilitation/attendant-care benefits, collision and comprehensive with $1,000 deductibles, OPCF 44R, and no telematics unless separately opted into. This is a comparison benchmark, not coverage advice. Every optional benefit shall be recorded as included, excluded, unavailable, or unknown.

## 12. Quote Result Schema

| Result group | Required output |
|---|---|
| Source identity | Registry ID; brand; legal underwriter; group; intermediary; distinct rate-source ID. |
| Outcome | Status enum; exact quote versus estimate; eligibility result; failure reason; next action. |
| Price | Annual premium; monthly amount; down payment; instalment or finance charges; taxes or fees; total estimated cost; currency. |
| Coverage | All requested limits, deductibles, optional benefits, and endorsements; every variance from the benchmark. |
| Discounts | Applied; available but not selected; conditional on purchase, bundle, membership, or telematics. |
| Validity | Quote or reference ID; effective date; expiry or guarantee date; whether verification may change the premium. |
| Evidence | Timestamp; source URL or public phone route; redacted screenshot or call outcome; evidence hash or artifact link. |
| Confidence | High for an exact premium with matching coverage; medium for a licensed representative's documented quote; low for an estimate or unresolved coverage difference. |
| Privacy | Fields disclosed to the route; consent receipt; retention deadline; proof that secrets were excluded from logs. |

## 13. Terminal Status Enum

Every distinct market shall end in one evidence-backed terminal status:

| Status | Meaning |
|---|---|
| `quoted_comparable` | Exact premium and benchmark coverage matched. |
| `quoted_non_comparable` | Exact premium returned, but one or more coverage assumptions differ. |
| `estimate_only` | Indicative price, range, or lead estimate, not a firm quote. |
| `callback_required` | A licensed representative must call before a rate is available. |
| `manual_handoff` | Applicant or human operator is required for consent, identity, or advice. |
| `ineligible` | The profile fails an approved rule or product requirement, with the stated reason. |
| `affinity_restricted` | A valid group, employer, or membership relationship is required. |
| `specialty_only` | The route does not write standard private-passenger use for this profile. |
| `duplicate_rate_source` | A different brand or route resolved to the same underlying rate program. |
| `not_currently_writing` | Evidence indicates no new applicable Ontario PPA business. |
| `blocked` | Terms, CAPTCHA, authentication, or another access control prevents automation. |
| `unreachable` | A bounded number of attempts produced no response. |
| `unresolved` | More research is required; this shall never be silently converted to “not offered.” |

An estimate, lead form, or callback promise shall never be presented as a firm quote.

## 14. Evidence, Metrics, and Comparison Experience

The system shall maintain a coverage ledger containing every verified applicable rate source, including unresolved records.

Required metrics:

- Market completion = distinct rate sources with evidence-backed terminal status / verified applicable rate sources.
- Comparable quote yield = `quoted_comparable` results / verified applicable rate sources.
- Evidence rate = outcomes with a valid source, timestamp, and redacted artifact / all outcomes.
- Duplicate suppression = brands or routes mapped to an existing `distinct_rate_source_id` rather than counted twice.
- Freshness = percentage of registry records verified during the hackathon window.

The comparison experience shall allow the user to:

- Sort by annual cost.
- See coverage differences before price differences.
- Filter estimates out.
- Open evidence for every outcome.
- Understand exactly which markets remain unresolved.

The system shall not label the lowest displayed number as “best” without surfacing non-price differences and eligibility conditions.

## 15. Bounded-Attempt Policy

- Web: one normal attempt plus one retry for a transient technical error. Do not retry a rejection, CAPTCHA, or terms restriction.
- Outbound voice: one call during published sales hours and one retry only if the line fails before connection. Do not repeatedly call representatives.
- Callback: wait through the declared callback window, then mark `callback_required` or `unreachable` with timestamps.
- Broker: ask once for the complete carrier list and all obtained quote outcomes; preserve the response as evidence.
- Unresolved records shall remain `unresolved` and shall not be silently removed from the denominator.

## 16. Identity, Privacy, and Security

### 16.1 Truthful identity and risk information

- Use truthful risk information for all live interactions.
- Use an alias only for a permitted discovery or estimate route with no identity verification or truth declaration.
- For a live consumer quote, use the participant's legal name and accurate risk information.
- If a driver's licence number is requested, use only the participant's own valid Ontario driver's licence number and the legal name exactly matching that licence.
- Never invent, generate, borrow, alter, or store another person's driver's licence number.
- If alias mode reaches an identity check, database lookup, consent declaration, or application attestation, stop and switch to a human checkpoint.
- Never combine an alias with a real licence number.
- If the participant has no licence, do not work around the field; preserve earlier non-verifying estimate or discovery evidence.

### 16.2 Sensitive data

Licence numbers, date of birth, address, claims history, voice data, and VIN shall be treated as sensitive data.

The system shall:

- Keep sensitive fields in a dedicated encrypted vault and inject them only into the destination that needs them.
- Mask licence numbers and other identifiers in the UI.
- Never place sensitive identifiers in prompts, traces, analytics, screenshots, demos, source control, or submitted datasets.
- Not retain raw page captures or call transcripts containing sensitive identifiers.
- Redact browser and call evidence before saving or presenting it.
- Use least-privilege access and short retention.
- Provide a one-click delete function.
- Delete hackathon quote data after judging unless the participant explicitly chooses otherwise.
- Keep consent receipts, access logs, and deletion records separate from the quote display.
- Follow destination terms, privacy notices, and rate limits and stop when automated access is not permitted.

### 16.3 Phone and recording safety

The system shall apply the stricter challenge rule: disclose automation, request affirmative recording or transcription consent, and retain no audio when consent is not granted. The prototype shall not be represented as production-ready telephony compliance.

## 17. Prohibited and Out-of-Scope Actions

The system shall not:

- Purchase, bind, renew, cancel, or modify an insurance policy.
- Submit payment information, an electronic signature, or an application declaration.
- Bypass CAPTCHAs, bot controls, authentication, rate limits, or other access controls.
- Use another person's identity, licence number, address, vehicle, claims history, or consent.
- Present hypothetical information as a real applicant's information.
- Change material facts across insurers to manufacture a lower premium.
- Present an estimate, lead form, or callback promise as a firm quote.
- Sell insurance, bind coverage, provide licensed advice, or decide which coverage is suitable.
- Sell, license, market, publish for public use, or deploy the submission as an insurance-quote service.

If the experience reaches advice or purchase, the system shall transfer the user to a properly licensed broker, agent, or insurer representative.

## 18. Error Handling and Auditability

The system shall:

- Preserve partial web progress, consent state, quote/reference IDs, and route context across handoffs.
- Recover from transient errors only within the bounded-attempt policy.
- Record exact rejection, eligibility, access-control, and technical failure reasons.
- Preserve an audit trail linking registry entry, route attempt, disclosed fields, consent, outcome, coverage, and evidence.
- Never hallucinate a missing market relationship, quote, coverage term, or terminal outcome.

## 19. Submission Deliverables

The submission shall include:

1. GitHub repository and setup instructions, with Organizer access if the repository is private.
2. A three-to-five-minute Loom walkthrough showing:
   - The product and market-routing logic.
   - One working route to a returned quote or exact terminal blocker.
   - Two normalized results.
   - One evidence-backed no-quote or handoff outcome.
   - Voice, callback, broker-assisted, or other context-preserving handoff where required by the route.
3. A machine-readable market registry in CSV or JSON containing sources, verification dates, channels, statuses, and distinct rate-source IDs.
4. A redacted run report containing the coverage ledger, comparisons, gaps, errors, and timestamps without real licence numbers or other sensitive data.
5. An architecture and safety note describing agent responsibilities, human checkpoints, consent flow, data storage, redaction, and deletion.
6. Known limitations, including dependencies on a human, licensed intermediary, membership, terms permission, or unavailable integration.
7. Acceptance of the linked Submission IP Agreement.

A pre-recorded walkthrough or static mock alone does not establish that the system works. A shortlisted participant may be required to run the system live and explain evidence lineage.

## 20. Minimum Demo Acceptance Criteria

| Area | Acceptance check |
|---|---|
| Retrieval | At least one permitted route reaches a returned rate or exact terminal blocker. A browser UI, specific SDK, and visible cursor movement are not required. |
| Cross-channel | Where required, demonstrate an outbound or inbound voice, callback, broker-assisted, or other permitted handoff that preserves context and discloses automation. |
| Normalization | At least two outcomes use the common schema and show coverage differences. |
| Market map | The registry distinguishes legal underwriter, group, brand, distributor, and rate source. |
| Evidence | Every demonstrated outcome has a timestamp and redacted evidence. |
| Safety | No real licence number, full address, payment data, or unredacted call recording appears in the submission; no route uses a fabricated licence number. |

## 21. Quality Attributes and Judging Alignment

The implementation should optimize for:

- Creativity and interpretation in navigating a fragmented market.
- Correct separation of insurers, brands, brokers, programs, and coverage differences.
- Reliable technical execution, error recovery, and audit trails.
- Live proof with evidence lineage and, where relevant, a quote ID or callback handoff.
- Honest market coverage without duplicated, estimated, or unverifiable inflation.
- Responsible identity, consent, sensitive-data, and access-control handling.
- Clear explanation of what was built, what was quoted, and what remains unresolved.

The governing quality principle is that a smaller number of trustworthy, comparable quotes with excellent evidence is stronger than a larger number of duplicated, estimated, or unverifiable results. The system shall make both reach and uncertainty legible.

## 22. Regulatory Seed List

The following seed list shall be treated as discovery input requiring current validation, not as proof of availability or relevance:

| Group | Legal entities in seed dataset | Starting route / validation note |
|---|---|---|
| AIG | AIG Insurance Company of Canada | Specialty/commercial broker; validate PPA relevance. |
| Allstate | Allstate Insurance Company of Canada; Esurance Insurance Company of Canada; Pafco Insurance Company; Pembridge Insurance Company | Allstate direct/agent; Pafco and Pembridge broker; validate Esurance. |
| Aviva | Aviva General Insurance Company; Aviva Insurance Company of Canada; S&Y Insurance Company; Scottish & York Insurance Co. Limited; Traders General Insurance Company | Direct, RBC, broker, and program routes; deduplicate and validate legacy entities. |
| Beneva | Unica Insurance Inc. | Broker route. |
| CAA | CAA Insurance Company; Echelon Insurance | CAA direct/broker; Echelon broker and non-standard. |
| Chubb | Chubb Insurance Company of Canada | High-net-worth or specialty broker. |
| Co-op | COSECO Insurance Company; CUMIS General Insurance Company; Co-operators General Insurance Company; The Sovereign General Insurance Company | Co-operators web/agent; affinity and specialty entities need validation. |
| Commonwell | The Commonwell Mutual Insurance Group | Mutual and broker/agent route. |
| Continental | Continental Casualty Company | Specialty/commercial broker; validate PPA relevance. |
| Definity | Definity Insurance Company; Sonnet Insurance Company | Definity/Economical broker; Sonnet direct. |
| Desjardins | Certas Direct Insurance Company; Certas Home and Auto Insurance Company; The Personal Insurance Company | Desjardins web/agent; The Personal affinity. |
| Economical | Economical Mutual Insurance Company | Broker route; map current legal entity/program. |
| FA | Facility Association | Residual-market route through licensed intermediary. |
| FMRe | Farm Mutual Reinsurance Plan Inc. (on behalf of Ontario Mutuals) | Ontario Mutuals locator and specific mutual validation. |
| Gore | Gore Mutual Insurance Company | Broker route. |
| Hartford | Hartford Fire Insurance Company | Specialty/commercial broker; validate PPA relevance. |
| Heartland | Heartland Farm Mutual Inc. | Mutual/local agent or broker. |
| Intact | Belair Insurance Company Inc.; The Guarantee Company of North America; Intact Insurance Company; Jevco Insurance Company; Novex Insurance Company; Royal & SunAlliance Insurance Company of Canada; Unifund Assurance Company; Western Assurance Company | belairdirect direct; Intact and Jevco broker; validate legacy/affinity entities. |
| Liberty | Liberty Mutual Insurance Company | Specialty/commercial broker; validate PPA relevance. |
| Northbridge | Federated Insurance Company of Canada; Northbridge General Insurance Corporation; Verassure Insurance Company; Zenith Insurance Company | Northbridge and Zenith broker; validate Federated/Verassure scope. |
| Optimum | Optimum Insurance Company Inc. | Broker route. |
| PURE | PURE Insurance | High-net-worth broker. |
| Peel | Peel Mutual Insurance Company | Mutual/local agent or broker. |
| Portage | The Portage la Prairie Mutual Insurance Company | Broker route. |
| SGI | Coachman Insurance Company; SGI CANADA Insurance Services Ltd. | Broker route; Coachman non-standard. |
| Sompo | Endurance Specialty Insurance Ltd.; Sompo Japan Insurance Inc. | Specialty/commercial broker; validate PPA relevance. |
| TD | Primmum Insurance Company; Security National Insurance Company; TD General Insurance Company | TD online, phone, and affinity routes. |
| Tokio | Tokio Marine and Nichido Fire Insurance Company Limited | Specialty/commercial broker; validate PPA relevance. |
| Travelers | The Dominion of Canada General Insurance Company | Broker route. |
| Wawanesa | The Wawanesa Mutual Insurance Company | Broker route. |
| XL | XL Specialty Insurance Company | Specialty/commercial broker; validate PPA relevance. |
| Zurich | Zurich Insurance Company | Square One direct for Ontario car; specialty broker routes may differ. |

Names in this seed list reflect the regulator's public dataset display. Current legal names, amalgamations, product scope, and new-business status shall be verified against authoritative sources during implementation.

