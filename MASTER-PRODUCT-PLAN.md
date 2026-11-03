# Supplai Product Recovery Plan

**Version:** 1.0  
**Prepared:** 3 November 2026  
**Target:** GBSN Social Logistics Challenge, Health and Humanitarian Supply Chains  
**Submission deadline shown by GBSN:** 15 November 2026  
**Working mode:** prototype with clearly labelled fictional data, backed by human-led local validation
**Supporting evidence:** [GBSN challenge evidence brief](references/gbsn-challenge-evidence.md)

## The decision

Build **Supplai as an LGA-authorised emergency medicine-response control tower**, not as an SMS stock marketplace.

The primary product is a responsive web application that behaves like three role-specific apps:

1. **Facility app** for a PHC custodian to raise, approve, and receive an urgent exception order.
2. **Operations web console** for an LGA/pharmacist to see, authorise, and resolve exceptions.
3. **Rider app** for pickup, in-transit tracking, and documented handover.

SMS and WhatsApp are secondary entry and notification channels. A message creates the same canonical order as the facility app, and the complete state appears when the user next opens the app or web console. This is the right analogy: a request can start in a low-connectivity channel, but the system of record and visible experience live in the product.

## The non-negotiable eligibility gate

There is a material conflict to resolve immediately. The live GBSN page says entrants should **not** use generative AI to develop, write, analyse, or substantially modify their submission, and says undisclosed or inappropriate use can affect eligibility. It also requires a written report plus a creative illustration, approximately three minutes or an equivalent non-video format. [GBSN, *The Social Logistics Challenge*](https://gbsn.org/slc/)

Your statement that AI has been allowed may reflect a written organiser clarification, but the public rules currently say the opposite. The fact that the idea is human-led does not, by itself, resolve that conflict.

**Farid's first task is to obtain or preserve the organiser's written approval before any AI-assisted material is submitted.** Until then:

- Treat this file, generated code suggestions, and AI-produced wording as internal working material only.
- Recreate and verify all contest-facing analysis, prose, visuals, and claims yourselves from your own notes and sources.
- Keep a dated human research log, interview notes, source register, sketches, design decisions, and Git history.
- Do not claim a live pilot, partner, legal approval, or delivery integration unless it is real and documented.

This is a protection for the team, not a reason to slow down the prototype.

## Why Supplai can win

GBSN asks teams to keep the logistics system at the centre, identify a local community and stakeholders, give an actionable business solution, measure intended outcomes, state their biggest assumption, and communicate it creatively. [GBSN, *The Social Logistics Challenge*](https://gbsn.org/slc/)

The 2025 winner, HemoMesh VN, was not merely an inventory interface. It connected fragmented actors around a precise health-supply problem, combining stock balancing with end-to-end quality controls, expiry control, transport quality, and a human operating model. [GBSN, *Winners of the 2025 Social Logistics Challenge*](https://gbsn.org/winners-of-the-2025-gbsn-social-logistics-challenge/)

Supplai's winning distinction is therefore not “we send medicine by SMS.” It is:

> **When a public PHC has an urgent stockout, Supplai turns a fragmented, phone-call-based scramble into one authorised, traceable exception workflow that protects the donor facility and makes unresolved demand visible to the LGA.**

That means the product needs to prove five things in one memorable flow:

1. A real exception is raised quickly, whether from the app, SMS, or WhatsApp.
2. The supplying facility, not the requester, confirms that stock is physically available and safe to release.
3. An LGA/pharmacist authorises the movement, with safety stock, product restriction, batch, and expiry checks visible.
4. A rider completes a two-sided, auditable handover.
5. A failed or unmatched request becomes an LGA replenishment exception, not a silent dead end.

## Honest critique of the current repository

The foundation is good. The product surface and real-world operating model are not yet complete.

| Area | What exists now | What must change before the creative illustration |
| --- | --- | --- |
| API and database | Fastify, Supabase schema, typed contracts, SMS normalisation, request/match/reservation flow, mock dispatch, delivery proof, append-only movement ledger, tests | Keep this as the system core and evolve it rather than rebuilding it. |
| Web and mobile UX | A dashboard workspace with a README and a contract example, but no Vite/React screen, no routing, no PWA, and no visual system | Build the facility, operations, and rider experiences now. Judges must be able to see and understand the system without reading code. |
| Product position | The repository describes Supplai as SMS-first medicine stock coordination | Reposition it as LGA-authorised emergency exception management. Messaging becomes a bridge into the workflow. |
| Clinical and regulatory safety | Current records model medicine and quantity, but not batch, expiry, condition, safety stock, programme restrictions, authorised people, source pickup proof, refusal, recall, or quarantine paths | Add only the minimum fields and states needed to show a responsible ambient-medicine pilot. Do not portray a demo as approval to move real stock. |
| Delivery | `MockDispatchAdapter` and demo endpoints provide a valid simulation seam | Integrate a rider UI and simulated live tracking. Label the carrier connection as simulated unless a real partner is integrated and verified. |
| Evidence | Fictional seed data is appropriate for a demo but cannot prove impact | Farid must assemble human-led local evidence and clearly distinguish evidence, assumptions, and simulated data. |
| Security | Supabase RLS is closed to browser users and the server handles privileged access | Replace visible four-digit proof-only UX with authenticated role actions plus a short-lived one-time code. Rate-limit demo endpoints before deployment. |

The current architecture is not wasted work. It is the transaction engine beneath the product we now need to make visible.

## Product boundary: one narrow, credible pilot

### Pilot story

Use one named LGA only after Farid has verified it. Until then, use **“Aiyetoro Demo LGA, fictional data”** everywhere in the prototype and do not imply that it is a partner site.

| Item | Controlled MVP scope |
| --- | --- |
| Facilities | 6–8 public PHCs plus one LGA store; no private marketplace |
| Commodities | Two locally validated, ambient-stable tracer commodities. ORS and zinc remain the development defaults until a pharmacist validates alternatives. |
| Service | Authorised emergency exception response during a defined operating window |
| Geography | One LGA, fictional map coordinates and routes until permission exists |
| Users | Facility requester/custodian, source custodian, LGA/pharmacist, rider, receiving custodian |
| Data | No patient data. Fictional staff, facilities, inventory, rider, and route data in the public demo. |
| Integration | Supabase is real; SMS and WhatsApp can be simulated or sandboxed; dispatch tracking is simulated unless a qualified carrier is available. |

### What we deliberately do not build

- A national LMIS replacement
- Open public medicine listings or direct patient ordering
- Payments, procurement, or commercial pricing screens
- Cold-chain, controlled medicines, vaccines, or high-risk products
- Real medicine movement without written authority, product-quality procedures, and a trained carrier
- A generic AI chatbot or “AI matching” claim
- A full provider-grade WhatsApp production onboarding journey

This discipline is a strength. Nigeria's NAFDAC distribution guidance makes traceability, authorised recipients, valid delivery orders, batch/expiry records, transport conditions, and dispatch documentation central to pharmaceutical distribution. [NAFDAC, *Good Storage and Distribution Practices Guidelines for Pharmaceutical Products*, 2024](https://www.nafdac.gov.ng/wp-content/uploads/Files/Resources/Guidelines/PMS_Guidelines_2024/NAFDAC-Good-Storage-and-Distribution-Practice-Guidelines-For-Pharmaceutical-Products-1.pdf)

## The end-to-end product flow

```mermaid
flowchart LR
    A["Facility app\nSMS\nWhatsApp"] --> B["Canonical emergency request"]
    B --> C["Formulary + safety + eligibility checks"]
    C --> D["Source custodian confirms\nbatch, expiry and quantity"]
    D --> E["LGA/pharmacist authorises\nrelease"]
    E --> F["Rider app\npickup and route status"]
    F --> G["Receiving custodian\naccepts or refuses"]
    G --> H["Append-only ledger +\noperations dashboard"]
    C --> I["Unmatched / unsafe / declined"]
    I --> J["LGA exception queue\nreplenishment follow-up"]
```

### Canonical order lifecycle

Use one canonical `emergency_request` regardless of origin. Each inbound channel produces an `InboundIntent`, which is parsed and attached to an order. The interface, messages, and operational console display the same reference and state.

1. **Request created**: a facility selects a controlled formulary item, quantity, urgency reason, and optional note. SMS and WhatsApp send the same request through an adapter.
2. **Safety check**: the system assesses formulary, source safety stock, available stock, product restriction, expiry threshold, service hours, route availability, and role authority.
3. **Sequential source offer**: one eligible source custodian receives a clear offer. It is never a broadcast promise.
4. **Source confirmation**: the source custodian confirms actual shelf stock, batch, expiry, pack size, condition, and releasable quantity. A decline or timeout releases the offer and advances the queue.
5. **LGA release**: an LGA/pharmacist sees the audit strip and approves, rejects, or escalates. In the visual demo this should take one obvious action.
6. **Rider pickup**: the source confirms collection with a short-lived release code or signed action. The rider cannot create or approve their own delivery.
7. **In transit**: the rider app shows a focused route, next destination, package reference, handling note, and live status. No patient details.
8. **Receiving and exception handling**: the destination checks quantity, condition, batch, expiry, and seal. It accepts or refuses. A refusal creates a visible incident, not a silent completion.
9. **Close or escalate**: an accepted handover writes two movements and updates the facility stock. An unmatched, declined, unsafe, failed, or expired request becomes an owned LGA exception.

## The primary experiences

### 1. Facility app, mobile-first PWA

This is the emotional centre of the demo. It should feel fast, calm, and trustworthy, not like a form-heavy government portal.

**Core screens**

1. **Home / stock health**: a compact greeting, facility status, at-risk tracer commodities, active request card, and one large “Request emergency fill” action.
2. **Create request**: searchable controlled formulary, pack quantity, urgency reason, optional note, and a clear explanation of what happens next.
3. **Request timeline**: a living timeline from created to source-confirmed to rider-assigned to received. It displays the transfer reference and ETA, with channel updates collected in the same feed.
4. **Incoming source offer**: one decision card showing requested medicine, requested quantity, safety floor after release, required batch/expiry information, and confirm/decline actions.
5. **Receive handover**: a visually deliberate verification checklist, not just a PIN field. The user can accept or refuse and record the reason.
6. **Request history**: a clean audit list with status chips and a clear “Escalated to LGA” state.

**Interaction principles**

- One primary action per screen.
- All progress is visible through a vertical transfer timeline.
- Use clear language: “Needs review”, “Awaiting source confirmation”, “Rider en route”, “Received”, and “Escalated”.
- Treat the PWA as an installable app. It gives the mobile feeling without taking the schedule risk of separate native iOS/Android work.

### 2. LGA operations console, web-first

The console must make a judge understand the operational value in ten seconds. It should look like a focused command centre, not a generic admin dashboard.

**Home layout**

- Top rail: active exceptions, awaiting source confirmation, awaiting LGA release, riders in transit, and unresolved requests.
- Main left: an LGA map or stylised geographic network with active route arcs and facility status dots. Use fictional geography until field permission exists.
- Main right: a priority stack. The next operational decision is always at the top.
- Bottom: a live transfer feed with timestamps and an impact strip: average time to source confirmation, matched request rate, successful handovers, unresolved exceptions.

**Essential views**

1. **Exception queue**: primary operator view for unmatched, expired, rejected, delayed, or unsafe requests. Every exception has a named next owner and an escalation route.
2. **Release review drawer**: shows source safety stock, batch, expiry, destination, rider, and audit requirements together before approval.
3. **Transfer detail**: exact status timeline, handover evidence, incident timeline, and ledger entries.
4. **Facility network**: stock health for the two tracer commodities, response behaviour, and facilities needing stock reconciliation.
5. **Audit export**: a constrained CSV/download state showing this is a compliance-aware operating tool, not just a pretty dashboard.

### 3. Rider app, mobile-first PWA

The rider has one job at a time. This must never become a dense operations dashboard.

**Core screens**

1. **Assigned job**: pickup and destination cards, medicine category, package reference, route preview, handling condition, and call buttons.
2. **Pickup confirmation**: source release code/signature, package condition check, and “Start journey”.
3. **In-transit route**: a clean animated route line, elapsed time, destination, and an incident action.
4. **Handover**: “Arrived” action followed by receiver-controlled acceptance. The rider cannot self-complete delivery.

### 4. SMS and WhatsApp, secondary but real in the story

Do not use SMS/WhatsApp as the showcase surface. Use them as resilient access points.

| Channel | Demo purpose | MVP implementation |
| --- | --- | --- |
| SMS | Low-data fallback and notification | Existing provider-neutral webhook boundary plus a simulator. Use a controlled message grammar and link every message to an order reference. |
| WhatsApp | Familiar rich notification and quick request entry | Add an adapter and an in-product conversation simulator first. A Twilio sandbox can support a controlled test if the account is available. |
| Web/PWA | Primary experience and system of record | Role-based facility, operations, and rider interfaces against the Fastify API. |

WhatsApp is sensible as an add-on, but do not let provider onboarding block the build. Twilio's official sandbox supports testing before sender registration; production requires business-account and sender onboarding, and outbound messaging is constrained by platform rules. [Twilio, *Quickstart: Send and receive WhatsApp messages*](https://www.twilio.com/docs/whatsapp/quickstart) [Twilio, *WhatsApp Business Platform overview*](https://www.twilio.com/docs/whatsapp/api)

## Data, safety, and interface changes

### Required model evolution

Keep the current ledger and request core. Add the following incrementally, with migrations and fixtures, before building screen polish around it.

| Needed capability | Minimum data/change |
| --- | --- |
| Controlled medicines list | Replace free text as the decisive input with `formulary_item` identifiers, local aliases, strength, form, pack size, and a transferable flag. SMS/WhatsApp can suggest an item but must demand unambiguous confirmation. |
| Donor protection | Add a facility/item safety stock threshold and calculate usable balance as on-hand minus safety stock minus outstanding reservations. |
| Batch traceability | Introduce `stock_batch` or an equivalent batch record with batch number, expiry date, condition, quantity, and source. Create a transfer line that locks the chosen batch. |
| Authority | Add role assignments for requester, source custodian, LGA/pharmacist approver, rider, and receiving custodian. Keep demo auth simple, but model whose approval is required. |
| Handover quality | Record source release, collection time, package identifier, receiving check, accept/refuse reason, and an incident state. |
| Exceptions | Add explicit states for `awaiting_lga_release`, `unmatched`, `cancelled`, `refused_at_receipt`, `incident`, and `escalated_for_replenishment`. |
| Channel continuity | Add an order event/feed table so UI, SMS, and WhatsApp use one timeline and one correlation reference. |
| Ethical claims | Mark every dashboard metric as `simulated` in the prototype. Define pilot measurement before claiming impact. |

### Design rules derived from the operating reality

- The system must never promise a medicine only because a stale stock record exists.
- A requester must not approve a supply from another facility.
- A source must not release stock below its safety floor.
- A rider must not confirm receipt on behalf of a facility.
- Every resolved transfer records batch and expiry in the demo model; every rejected transfer remains visible.
- Every message, screen, and CSV record uses the same order reference.
- No live medicine movement is implied by a simulated rider route.

## Technical build approach

### Keep

- TypeScript monorepo
- Fastify API and shared Zod contracts
- Supabase PostgreSQL with server-only privileged data access
- Existing provider and dispatch adapter boundaries
- Append-only stock movements and the existing test suite
- Fictional fixtures and repeatable demo seed/reset work

### Add

| Layer | Decision |
| --- | --- |
| Frontend | Vite + React for a single responsive web codebase, with route groups for facility, operations, and rider. Build it as a PWA rather than separate native apps. |
| Server state | TanStack Query or an equally simple typed fetch layer. Poll in the demo first; add SSE or Supabase Realtime only if it improves the final rehearsal. |
| Local UI state | Small route-local state or Zustand only where necessary. Do not build a global state machine in the browser. |
| Visual system | CSS variables, deliberate typography, a tight token system, reusable status and timeline components, and a single dark/light direction chosen before screens are made. |
| Motion | Framer Motion or native CSS transforms for state transitions, route animation, status reveals, skeletons, and number updates. Respect reduced-motion preferences. |
| Map | A stylised fictional service map first. Add MapLibre only if it is stable and materially improves the demonstration. |
| Deployment | Vercel/Netlify for the PWA, a simple Node host for Fastify, Supabase for data. Create preview deployments before the final day. |
| Demo controls | A protected reset endpoint/script, a scenario launcher, deterministic seeded timestamps, and a visible `Demo data` label. |

### API contract work

The current API endpoints support a proof of flow. They need role-facing read and action endpoints. Establish the contracts before either frontend starts deep work.

```text
POST /api/orders                         create facility request
GET  /api/orders/:reference              order, timeline, actions, and evidence
POST /api/orders/:reference/source-offer source custodian confirm or decline
POST /api/orders/:reference/release      LGA/pharmacist approve or reject
POST /api/transfers/:reference/pickup    source release and rider pickup proof
POST /api/transfers/:reference/status    simulated rider location/status update
POST /api/transfers/:reference/receipt   receiving custodian accept or refuse
GET  /api/operations/queue               ranked exceptions and decisions
GET  /api/operations/overview            command-centre metrics and active routes
POST /api/demo/reset                     protected deterministic scenario reset
POST /webhooks/messages/:provider        canonical SMS/WhatsApp adapter boundary
```

Do not ship all endpoints before showing a screen. Implement in the exact order required by the scripted transfer.

## Visual direction and creative illustration

The visual illustration does **not** need a filmed team video. Make a polished, approximately three-minute screen-recorded product story with short kinetic captions, narrated only if the team chooses. It is still a video-format creative illustration, but the product is the star.

### Visual character

- **Mood:** calm, clinical, capable, locally grounded. Avoid ambulance-red panic UI and generic “AI health” gradients.
- **Information hierarchy:** one decision at a time on mobile; command-centre priority stack on desktop.
- **Identity:** Supplai should feel like infrastructure people can trust, with a distinctive transfer-line motif and restrained colour meaning.
- **Status system:** teal/green only for completed or safe, amber for waiting/attention, red for an actual blocked risk, neutral for planned/simulated.
- **Evidence strip:** make the invisible operational work visible through safety stock, batch, expiry, authority, route, and handover chips.
- **Motion:** use movement to explain causality. A request becomes an offer, an approved release becomes a moving package, a received package becomes a ledger update. Do not use decorative animation that hides status.

### Three-minute screen story

| Time | Scene | What it proves |
| --- | --- | --- |
| 0:00–0:18 | A PHC has an urgent, named stockout; the current manual scramble is shown as fragmented calls/messages | The specific local logistics breakdown |
| 0:18–0:45 | Facility user creates the request in the PWA; an SMS/WhatsApp message appears as the same request event | Access without making messaging the product |
| 0:45–1:12 | A source custodian confirms actual batch, expiry, safe-to-release stock, then LGA approves | Human authority and donor protection |
| 1:12–1:42 | Rider pickup, animated route, in-transit status, and exception alert | Physical flow and accountable delivery |
| 1:42–2:08 | Receiver inspects and accepts; ledger and facility stock update | Traceability and closed-loop handover |
| 2:08–2:35 | Operations console shows one resolved transfer and one unmatched request escalated to replenishment | Supplai is an exception-management layer, not a magic marketplace |
| 2:35–3:00 | Pilot scope, operating partners, measurement plan, and honest “what needs validation” close | Feasibility and discipline |

Record each role flow from a deterministic, resettable demo environment. Assemble only after every screen is stable. A fancy edit cannot rescue a broken live demo.

## Measurement and credibility plan

### Prototype metrics, clearly labelled simulated

- Time from request to source response
- Eligible match rate
- Time from approval to rider assignment
- Delivery completion rate
- Requests escalated to LGA replenishment
- Transfers blocked by safety stock, restriction, expiry, or authority

### Pilot metrics to measure, not promise

- Emergency-fill response time, median and 90th percentile
- Stockout episode days for the two tracer commodities
- Source safety-floor breaches, target zero
- Batch/expiry completion rate
- Successful handover rate and reason for refusals
- Cost per authorised emergency transfer
- Share of unmet requests closed by an accountable replenishment pathway

### Single biggest assumption

There is sufficient authorised, usable, ambient-stable surplus within a practical LGA service radius to make emergency redistribution worthwhile without endangering source facilities.

**If wrong:** Supplai must not force peer redistribution. It pivots to the same exception-control interface, but directs unmet demand to the LGA store, approved emergency supplier, or procurement/replenishment pathway.

## Responsibility map

The two developers are co-developers. These are component owners, not a leadership hierarchy. Both review integration decisions that affect the whole product.

| Workstream | Primary owner | Contribution expected from the other co-developer | Completion evidence |
| --- | --- | --- | --- |
| Product workflow, Supabase migrations, canonical domain model, security rules, API contracts | **You** | Akolo validates UI contract needs before migration/API freeze | Migration, typed contracts, integration tests, documented state transitions |
| Facility PWA, rider app, order tracking, dispatch/rider integration | **You** | Akolo supplies shared visual components and reviews data clarity | End-to-end mobile flow from request to accepted handover |
| SMS/WhatsApp adapter boundary and in-product conversation simulation | **You** | Akolo places channel events in the console timeline | One inbound message creates a visible canonical order; app/web state stays in sync |
| Operations command centre, exception queue, transfer detail, map/network views, responsive web design | **Akolo** | You supply stable contracts and integration support | Operators can complete the priority decisions from live data |
| Shared design system, motion rules, status components, reusable fixtures, screen-recording composition assets | **Akolo** | You make role screens consume those primitives and preserve UX consistency | Visual token sheet, reusable components, screenshots at mobile and desktop widths |
| Demo reset, seeded scenarios, deployment configuration, end-to-end rehearsal | **Shared** | Both own failure recovery | Three clean consecutive rehearsals from reset |
| Local evidence, stakeholder validation, partner/authority checks, claim register, rubric mapping, UI reference collection | **Farid** | You and Akolo provide questions and prototype screenshots | Evidence log with source/claim/owner/status; a validation memo |
| Written report and contest-facing creative material | **Team, subject to AI eligibility gate** | Farid owns evidence integrity; both developers validate product truthfulness | Requirements checklist, source register, final disclosure/credit check |

## Delivery plan: 3–15 November

This is deliberately shorter than a normal build plan. The product must look finished, but scope must be frozen early enough to rehearse.

### Phase 0: freeze the winning thesis, 3 November

**Owner: all; Farid owns the evidence/eligibility checks**

- [ ] Obtain and record the AI-policy clarification from GBSN. If no written approval exists, ring-fence AI output from the submission.
- [ ] Choose the one target community or keep every prototype screen explicitly fictional.
- [ ] Confirm two tracer commodities with a pharmacist/credible source.
- [ ] Freeze the product statement, operating roles, non-goals, and three-minute story in this file.
- [ ] Choose a visual direction and collect 6–10 interface references. Farid supplies references; both developers choose one coherent direction.
- [ ] Freeze the UI routes and API action contract before component work begins.

**Gate:** no development proceeds on real-world claims until the product scope, evidence wording, and AI policy are resolved.

### Phase 1: make the engine safe enough to show, 4–5 November

**You:** migrations, API, contracts, fixture reset.  
**Akolo:** design tokens, operations shell, shared components.

- [ ] Add a controlled demo formulary and donor safety-stock calculation.
- [ ] Add batch, expiry, condition, source release, receiving decision, and exception-event fields.
- [ ] Replace four-digit proof-only completion with role-gated receipt plus a short-lived code in the demo.
- [ ] Define the canonical event timeline and order detail response.
- [ ] Create the Vite/React shell, route layout, visual tokens, typography, status chips, timeline, and empty/loading/error states.
- [ ] Create a deterministic `request → offer → release → pickup → receipt → ledger` scenario and reset path.

**Gate:** the API can complete one traceable transfer from a fresh demo seed, with batch/expiry and safety-floor evidence visible.

### Phase 2: build the visible role experiences, 5–8 November

**You:** facility PWA, rider PWA, API integration.  
**Akolo:** operations console, exception queue, network/transfer views.

- [ ] Facility home, request creation, request timeline, source offer, and receiving screens.
- [ ] Rider job, pickup, in-transit, and handover screens with simulated tracking.
- [ ] Operations overview, priority queue, release drawer, transfer detail, and exception escalation.
- [ ] Consume shared live contracts. Retain fixture mode only as a transparent fallback.
- [ ] Add responsive behaviour for 360px mobile, laptop, and projected desktop widths.
- [ ] Capture screenshots after each integrated route, not at the end.

**Gate:** a judge can follow a complete transfer without terminal access, database edits, or verbal explanation.

### Phase 3: channel resilience and operational failure paths, 8–10 November

**You:** channel adapters and cross-role state.  
**Akolo:** event visualization, exception UX, polish.

- [ ] Make the SMS simulator create the same canonical order event as the facility UI.
- [ ] Add a WhatsApp conversation simulator. Use Twilio Sandbox only if it can be activated without distracting from the primary build.
- [ ] Show message-originated events in the order timeline and operations feed.
- [ ] Implement and display source decline, safety-floor block, no eligible match, timeout, delayed rider, refusal at receipt, and failed handover.
- [ ] Link all UI states to deterministic fixtures for easy screen capture.
- [ ] Add accessible motion, reduce-motion support, keyboard focus, and readable text contrast.

**Gate:** SMS/WhatsApp are convincing fallback channels, not fragile dependencies; all unhappy paths create an owned LGA action.

### Phase 4: production-quality demo and report evidence, 10–12 November

**You and Akolo:** integration, performance, staging.  
**Farid:** validation, evidence, claims, rubric.

- [ ] Deploy a stable preview URL and verify it on a phone and a laptop.
- [ ] Add protected demo reset, prefilled role accounts, and clear fictional-data labels.
- [ ] Run type checks, tests, and end-to-end smoke tests after each demo-relevant change.
- [ ] Use Farid's validation findings to correct labels, pilot assumptions, and stakeholder responsibilities.
- [ ] Assemble a claim-to-source register. Do not use prototype numbers as real impact evidence.
- [ ] Map every report section to the official GBSN requirement.

**Gate:** the product, written claims, and creative story agree with each other exactly.

### Phase 5: creative illustration, rehearsal, and submission hardening, 12–15 November

**Shared. Farid owns the final requirements checklist.**

- [ ] Record clean, short role flows from the deployed resettable build.
- [ ] Assemble the three-minute screen story with captions, motion, and English text/subtitles.
- [ ] Prepare a fallback recording and static storyboard in case hosting fails.
- [ ] Conduct three full rehearsals from a clean reset, with one person driving and the others observing failure points.
- [ ] Test mobile, laptop, slow network, and first-load states.
- [ ] Complete report citations, credits, scope labels, AI-policy disclosure requirements, and final export checks.
- [ ] Submit before the deadline, not on the final hour.

**Gate:** a stranger can open the product, understand the flow, see one complete transfer and one safe failure, and trace every material claim.

## Engineering standards for every pull request

- One user-visible behaviour or one narrowly-scoped infrastructure change per branch.
- Use a `codex/` branch only for assistant-initiated implementation work; both developers use clear feature branches and commit at each working checkpoint.
- Include a screenshot or short GIF for visual changes and a test for workflow changes.
- Do not duplicate contracts in a frontend. Import from `@supplai/contracts`.
- No migration without fixture/seed updates and an upgrade note.
- No UI status label without a defined backend transition.
- No demo endpoint exposed in an unprotected production route.
- Do not merge a screen that only works with manually edited database state.
- Update `LEAD-DEVELOPER-PLAN.md` and this plan's checkboxes at the end of each build session.

## Definition of done

Supplai is ready for the creative illustration when all of the following are true:

- [ ] The product proposition is visibly an LGA-authorised emergency exception system, not a generic medicine marketplace.
- [ ] A request may start in the facility PWA, simulated SMS, or simulated WhatsApp and resolves to the same order and timeline.
- [ ] Source confirmation, LGA release, rider pickup, receiver acceptance/refusal, and LGA escalation are distinct role actions.
- [ ] The completed demo records the medicine, quantity, source/destination, batch, expiry, release/receipt timestamps, and ledger movements.
- [ ] A source cannot donate below its safety stock and an unsafe/expired/restricted item cannot complete the happy path.
- [ ] One successful transfer and one unresolved/unsafe exception are both clear in the operations console.
- [ ] The facility and rider views are polished on a phone-size viewport; the operations console is polished on a laptop/projector viewport.
- [ ] The demo can be reset and run successfully three times without direct database changes.
- [ ] All visible data is marked as fictional/simulated unless Farid's evidence register proves otherwise.
- [ ] The report and creative illustration satisfy the official requirements and the AI eligibility issue is resolved in writing.

## Decisions needed today

The plan can start with sensible defaults, but these decisions change what can truthfully appear in the submission:

1. **AI eligibility:** Do you have a written GBSN approval that supersedes the public policy? If yes, send Farid the exact wording and keep it with the submission log.
2. **Community:** Which actual LGA/community are you prepared to research, or should we keep the prototype entirely labelled “Aiyetoro Demo LGA, fictional” until validation arrives?
3. **Mobile form factor:** I recommend the installable PWA route, not Expo/native. Confirm this so we do not split attention across platforms.
4. **Visual direction:** Ask Farid today for 6–10 UI references. If he cannot provide them, I recommend a calm dark operations console paired with a warm, clear mobile facility app, joined by the same transfer-line motif.
5. **Deployment:** Which account will host the frontend and Fastify API? Vercel plus Render/Railway is enough for the demo, with Supabase remaining the database.

## Immediate next action

Freeze the PWA decision, choose the initial visual direction, then begin Phase 1 with the data/safety migration and the shared React shell in parallel. The first page we should build is the facility request timeline, because it makes the entire product story visible and provides the spine for SMS, WhatsApp, rider tracking, and the operations console.
