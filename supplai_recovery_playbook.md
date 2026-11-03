# Supplai Recovery Playbook — From Red-Team Failure to a Winning Version

> **Use:** post-mortem and next-cycle design guide. Each recommendation needs human-led validation before it is presented as fact. The 2026 GBSN rules say submissions should not use generative AI to develop, write, analyse, or substantially modify the entry; this file must therefore not be copied into a 2026 submission.

## The 56 failure modes and the strongest correction

| # | Failure mode | Best correction | Proof gate before claiming it |
|---:|---|---|---|
| 1 | GBSN generative-AI eligibility exposure | Keep AI out of the competition workstream; use an independently produced human post-mortem, field notes, calculations, and writing for any future eligible entry. | Team process log, source notebook, interview notes, version history, and an organiser ruling if needed. |
| 2 | Deck does not meet the required written-report + creative-illustration package | Produce two separate human-made xdeliverables: a requirements-mapped report and a three-minute visual demonstration. | A pre-submission checklist signed against the official rules. |
| 3 | “Nigeria” is not a local community | Select one named LGA and name the actual wards, PHCs, health authority, commodity programme, and transport partner. | Partner letter plus 5–10 stakeholder interviews and a local baseline stock audit. |
| 4 | Biggest assumption is hidden | State the assumption explicitly: enough authorised, usable surplus exists within a workable delivery radius; design a stop condition if it does not. | Four-week audit measuring eligible surplus, matching rate, response time, and actual transferability. |
| 5 | Absolute, unsupported win claims | Delete “none,” “always,” “same day,” and “works today” claims unless measured; replace with bounded pilot claims. | Claim-to-evidence register with source, date, scope, and owner. |
| 6 | Inferior comparison with the prior winning HemoMesh model | Beat that benchmark on a narrow dimension: LGA-authorised, ambient-medicine exception handling for low-connectivity PHCs—not generic stock balancing. | Feature comparison showing why the chosen constraint is locally necessary and solved. |
| 7 | Stock transfer is not technically novel | Treat transfer matching as commodity plumbing; differentiate through public-sector authorisation, source protection, auditability, and integration with existing LGA workflows. | Verified workflow map signed off by the LGA/pharmacist and not merely a feature list. |
| 8 | Local “nearby surplus” is only asserted | Begin with a manual, de-identified 30-day inventory/expiry audit across the pilot facilities. | Measured number of eligible surplus units, matched requests, and distance per feasible transfer. |
| 9 | Correlated outbreaks make peer-sharing fail exactly when demand spikes | Add outbreak/seasonality exclusion rules and a rapid escalation path to the LGA store or approved supplier. | Simulated outbreak scenario demonstrating that the system stops peer redistribution and escalates. |
| 10 | Root causes are broader than stale records | Position the product as an **exception-management layer** feeding procurement and last-mile response, not as a cure for stockouts. | Root-cause tree validated by facility, LGA, and supply-chain stakeholders. |
| 11 | Donor PHCs can be harmed | Require minimum/maximum levels, reserve stock, consumption-rate rules, and donor opt-out; never match solely on “quantity greater than request.” | Retrospective test showing no donor falls below its safety stock after transfers. |
| 12 | No donor-protection logic | Build a product eligibility rule: usable balance = on-hand − safety stock − pending commitments; rank FEFO and urgency. | Pilot records showing every transfer passed the eligibility rule. |
| 13 | No SDG 3.8 outcome chain | Define a constrained theory of change: verified emergency fill → fewer days unavailable → fewer deferred treatments/referrals. Do not claim mortality reduction. | Baseline/endline measures of stockout days and documented emergency fills. |
| 14 | No causal measurement | Use a pre-registered pilot dashboard: baseline period, intervention period, definitions, and a comparable non-participating facility/LGA where feasible. | Human-reviewed measurement protocol and raw audit trail. |
| 15 | Evidence is over-extrapolated | Separate Nigerian PHC facts, external analogies, and hypotheses; remove claims whose context does not match the pilot. | Every pitch statistic has a primary source and a scope note. |
| 16 | Expiry reduction is promised but expiry is untracked | Make batch, expiry, pack size, and condition mandatory at offer and receipt; rank by FEFO. | A complete transfer record with batch/expiry from source to destination. |
| 17 | “Digital works” is used as feasibility proof | Test this specific workflow with real users; describe national systems only as context and integration constraints. | Time-stamped, supervised end-to-end drill with real staff and no simulated confirmations. |
| 18 | No proof of clinical relevance | Choose one locally verified tracer commodity with a defined emergency use case and facility demand pattern. | Pharmacist/clinical lead confirms commodity, thresholds, and safe transfer rules. |
| 19 | Source facilities lack authority/ownership clarity | Create an LGA-approved transfer order and named authorised roles: requester, source custodian, approving pharmacist/LGA officer, receiver. | Written SOP and delegation letter approved by the responsible authority. |
| 20 | Peer transfer may be legally non-compliant | Obtain a regulator/PCN/NAFDAC-informed legal and operational review before moving real medicines; design only within the approved scope. | Written advice or approved SOP—not an assumption in a slide. |
| 21 | Public-to-public rule ignores programme/funder restrictions | Add commodity ownership, programme, funding source, restriction, and permitted-destination fields; default to “not transferable.” | Approved commodity whitelist for the pilot. |
| 22 | No qualified-person / GDP model | Put a licensed pharmacist or formally assigned qualified responsible person in charge of each distribution point and train all handlers. | Role register, training records, and quality SOP sign-off. |
| 23 | No recall traceability | Store manufacturer, batch, expiry, source, receiver, carrier, dispatch time, and receipt time; support batch-level recall search. | Conduct a mock recall tracing every affected unit in under an agreed time. |
| 24 | No damaged/expired/returned-product path | Add quarantine, refusal-at-receipt, damaged, return-to-source, disposal, and incident statuses before dispatch goes live. | Tabletop exercise covering each exception and its accountable owner. |
| 25 | Receiving proof does not confirm product quality | Use a two-sided handover: source confirms picked batch/quantity; receiver verifies item, quantity, expiry, seal/condition, and accepts or refuses. | Photo/scanned or witnessed handover record in a supervised drill. |
| 26 | No source-side proof of collection | Require source custodian release code/signature and package identifier at pickup. | Test that a rider cannot mark collection without source release. |
| 27 | No liability / incident answer | Contract the carrier, define insurance and loss ownership, escalate incidents, and maintain a clear stop-work threshold. | Signed SLA, incident playbook, and named insurer/coverage position. |
| 28 | Recordkeeping is inadequate | Build the minimum GDP record set and retention policy; export inspection-ready records rather than a generic ledger. | Compliance review against the regulator’s record fields and a five-year retention plan. |
| 29 | Privacy compliance is only a promise | Minimise data, issue staff privacy notices, set retention/deletion rules, restrict access, complete a DPIA, and use processor agreements. | DPIA and access-control test reviewed by a Nigerian data-protection professional. |
| 30 | The buyer is imaginary | Identify a single economic buyer—usually an LGA/state programme or donor-supported implementer—and solve its reporting/exception problem. | Letter of intent, budget interview, or paid/co-funded pilot commitment. |
| 31 | Payer, rider, and stock-replacement incentives conflict | Use a pilot transfer-cost pool funded by the authority/donor; keep medicine ownership and replenishment reconciliation explicit. | Unit-cost sheet and approved funding responsibility for every completed transfer. |
| 32 | No unit economics | Build a conservative model covering onboarding, training, messages, carrier, packaging, insurance, supervision, support, and replacement stock. | Actual pilot costs compared with forecast; no “subscription” claim without willingness-to-pay evidence. |
| 33 | Per-drop rider incentives compromise safety | Pay contracted, trained carriers a base availability fee plus compliant, documented completion—not only delivery volume. | Carrier SLA with handling, escalation, and audit clauses. |
| 34 | Rider capacity is invented | Size the service from observed request times, trip durations, geography, and peak demand; start with one defined coverage window. | Capacity model and completed supervised route-time trials. |
| 35 | Scope claims conflict across materials | Maintain one source-of-truth scope: one LGA, a fixed number of PHCs, two commodities, one channel, one operating window. | Requirements sheet checked against deck, report, prototype, and demo script. |
| 36 | Ten-minute confirmation is arbitrary | Measure staff response behaviour first; use a realistic TTL with escalation and cancellation rules. | Pilot median/p90 response times and a documented SLA. |
| 37 | No onboarding/change-management process | Assign an LGA implementation lead; use facility verification, training, job aids, staff-change procedures, and monthly review. | Training attendance, competency check, and active-contact refresh rate. |
| 38 | No service-level design | Define service hours, max radius, target dispatch time, authorised commodity list, cutoff rules, and human escalation. | Published pilot service charter accepted by every participant. |
| 39 | Unmet demand is not converted into replenishment | Route every unmet request to an LGA exception queue tied to stock review, procurement, or approved emergency resupply. | Weekly exception report with owner, resolution pathway, and closure date. |
| 40 | The confirmation concept is logically wrong | Make the **source custodian** confirm that the requested product is physically available and eligible; the receiver only confirms receipt. | Swim-lane workflow reviewed by a nurse, pharmacist, rider, and LGA officer. |
| 41 | Current implementation authorises the wrong party | Change confirmation authorization to the supplying facility and require its authenticated authorised custodian. | Automated integration test proving a requester cannot reserve another PHC’s stock. |
| 42 | No live outbound SMS | Implement and test an actual provider adapter with delivery status, retry policy, cost logging, fallback, and opt-in/consent handling. | Live sandbox + approved pilot number end-to-end test. |
| 43 | Dispatch is mocked | Either integrate a qualified carrier/dispatch partner or present the prototype honestly as a workflow simulation. | Live carrier dispatch, pickup, receipt, and incident drill. |
| 44 | No live NHLMIS/OpenLMIS integration | Start with a governed CSV exchange and reconciliation SOP; later integrate only after data ownership, endpoints, and change authority are agreed. | Two reconciliation cycles with zero unexplained discrepancies. |
| 45 | Matching ignores travel time | Use geospatial travel-time, carrier availability, hours, cost, source safety stock, and expiry—not stock quantity alone. | Ranking test compared against local route observations. |
| 46 | Only one supplier is offered | Offer sequentially to eligible sources with a clear timeout, release, re-rank, and escalation path; do not blast all sources. | Simulation of decline/timeout showing no double allocation. |
| 47 | Parallel requests can over-promise stock | Introduce atomic quantity reservations against a source facility/drug/batch, including expiry and release on cancellation. | Concurrency/load test proving total commitments never exceed usable stock. |
| 48 | Fuzzy drug matching can cause a patient-safety event | Use a controlled local formulary and structured codes; SMS may search aliases but must require a single unambiguous product/strength/form/pack confirmation. | Pharmacy-led test set with zero accepted ambiguous matches. |
| 49 | RxNorm does not establish Nigerian product suitability | Use the LGA/state formulary plus NAFDAC-registered product data and locally approved aliases; keep RxNorm optional only for semantic mapping. | Formulary governance document signed by pharmacist/LGA lead. |
| 50 | Dashboard metrics are misleading | Calculate actual stockout episodes, request-to-source response, eligible-match rate, dispatch time, fulfilment, donor-floor breaches, and unmet-demand escalation. | Metric dictionary plus raw-data audit for each displayed number. |
| 51 | Demo endpoints and dashboard are unsecured | Remove demo routes in production, enforce user roles/MFA or equivalent, verify provider signatures, rate-limit, and scope every query by LGA. | External security review and production-readiness checklist. |
| 52 | Delivery proof is weak | Replace a visible four-digit-only mechanism with authenticated role-based acceptance plus a short-lived, high-entropy one-time token; rate-limit and alert on failures. | Penetration test confirming a transfer cannot be locked or accepted by an unauthorised party. |
| 53 | Tests give false confidence | Add database-backed integration tests, provider contract tests, concurrency tests, role tests, security tests, and supervised field drills. | CI report plus drill evidence; no “tested” claim based solely on mocks. |
| 54 | No operational dashboard exists | Build the smallest actual LGA exception board: pending source confirmations, in-transit transfers, failures, unmet requests, and audit export. | A real user completes five tasks in usability testing without developer assistance. |
| 55 | Open-source licence exposure is ignored | Decide whether to avoid modified AGPL components, publish compliant source, or buy commercial licensing; get legal review before commercial claims. | Written licence inventory and approved deployment decision. |
| 56 | Provider availability is mistaken for launch readiness | Confirm shortcode/sender, reverse billing, WhatsApp approval, pricing, delivery receipts, outage support, and data-processing terms before naming a provider. | Provider contract/onboarding confirmation and multi-network live test. |

## The general shape of a winning version

| Element | Winning version |
|---|---|
| Problem | One named LGA has verified emergency stockout exceptions while other authorised public facilities hold eligible, usable stock; the present escalation process is too slow and opaque. |
| Position | **LGA-authorised emergency redistribution control tower**, not a peer-to-peer medicine marketplace and not a replacement LMIS. |
| Scope | 6–8 verified PHCs; two approved ambient-stable tracer commodities; one operating window; one LGA; one approved carrier arrangement; 90 days. |
| Human ownership | Requester → source custodian → LGA/pharmacist release authority → trained carrier → receiving custodian → LGA exception manager. |
| Transfer decision | Only if product, batch, expiry, condition, source safety stock, programme restriction, route, and authority all pass. |
| Technology | SMS/USSD may initiate an exception; structured human confirmation and a small LGA dashboard control the workflow; NHLMIS/CSV reconciliation remains the record-of-truth bridge. |
| Safety | Batch/expiry traceability, two-sided handover, carrier SOP, exception states, recall search, privacy controls, and audit export. |
| Economics | Authority/donor-funded pilot transfer pool first; unit costs measured; no speculative subscription claim until a real buyer validates it. |
| Evidence | Local stock/expiry audit, stakeholder interviews, written authority, live drill, baseline measures, and a transparent stopped/failed-transfer log. |
| Impact claim | “We reduce time-to-authorised emergency fill and stockout days for two defined commodities in one LGA.” Do not claim lives saved or national scale before evidence exists. |
| Win condition | The team can show judges one genuine local constraint, one authorised operating model, one working human-in-the-loop drill, measured pilot economics, and evidence that it complements—not duplicates—the national supply-chain system. |

## Non-negotiable kill gates

1. No written LGA/pharmacist authority: do not move real stock.
2. No verified eligible surplus after a four-week audit: abandon peer redistribution and pivot to exception visibility/escalation.
3. No accountable carrier and quality SOP: do not dispatch medicines.
4. No funded transfer cost: do not promise a sustainable service.
5. No safe structured product identification: do not accept fuzzy SMS matching for clinical products.
6. No baseline and audit trail: do not claim impact.
