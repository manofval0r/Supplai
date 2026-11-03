# Akolo Co-Developer Plan

> **Current product direction, 3 November 2026:** Supplai is an app-first, LGA-authorised emergency exception workflow for ambient tracer commodities. It has one Expo Android app for facility and rider roles, plus this responsive web operations console. The Scenario Lab demonstrates fictional, deterministic operations under both successful and unsafe conditions. SMS/WhatsApp are simulated intake bridges, not the primary product.

## Role and boundary

You are an equal co-developer. You own the web operations and visual experience. The other co-developer owns the canonical workflow, Supabase migrations, API contracts, Expo facility/rider app, channel boundary, and Scenario Lab engine. Work from shared contracts, not copied types or locally invented backend states.

## Outcome

Deliver a polished responsive operations console that lets a judge understand the live state of a fictional scenario, make an LGA release/escalation decision, inspect a transfer, and replay the outcome without terminal access or manual database edits.

## Progress tracker

- `[ ]` Not started
- `[~]` In progress
- `[x]` Completed
- `[!]` Blocked

| Round | Status | Completion condition |
| --- | --- | --- |
| A. Web foundation | `[ ]` | Dashboard shell and shared visual language work from fixtures |
| B. Operations workflow | `[ ]` | Queue, transfer detail, authority actions, and exceptions use shared contracts |
| C. Scenario Lab | `[ ]` | An operator can start, advance, reset, and replay every deterministic scenario |
| D. OSM map and notification centre | `[ ]` | Web map and notification inbox work with visible fallbacks and no hidden provider dependency |
| E. Demonstration polish | `[ ]` | Responsive, accessible console works in live and fixture modes and is recording-ready |

## Round A: web foundation

### Build

- [ ] Establish `apps/dashboard` as a Vite/React operations console.
- [ ] Create the shared web token sheet: colour meanings, typography, spacing, elevation, status chips, timeline items, and evidence chips.
- [ ] Build the application shell, navigation, loading, empty, and error states.
- [ ] Build transparent fixture mode using fictional data only. It must be visibly labelled `Demo data` and `Fictional scenario`.
- [ ] Design for laptop and projector first, then maintain a usable narrow layout.
- [ ] Add a calm, clinical visual direction. Use motion only to explain an event, route, or status change.

### Completion check

The console opens directly into a believable demo state at laptop/projector size with no console errors and no patient data.

## Round B: operations workflow

### Build

- [ ] Build the operations overview with open requests, transfers in flight, safe completions, blocked transfers, and owned escalations.
- [ ] Build a priority queue that explains why each item needs attention and who owns the next action.
- [ ] Build transfer detail: request, source offer, safety-floor evidence, batch/expiry evidence, source confirmation, LGA/pharmacist release, rider timeline, receipt/refusal, and ledger outcome.
- [ ] Build the release/escalation drawer using the co-developer’s action contracts. Never let the requester approve a source offer.
- [ ] Build exception views for source decline, safety-floor block, FEFO reroute, no eligible match, delayed rider, refused receipt, and demand shock.
- [ ] Build a stylised fictional service map with animated route segments. Do not depend on paid maps, live GPS, or carrier APIs.
- [ ] Consume the shared API as it becomes available. Keep fixture fallback clearly marked.

### Completion check

An operator can identify the next decision, inspect why it is safe or blocked, take the authorised action, and see the resulting timeline state.

## Round C: Scenario Lab

### Build

- [ ] Build the Scenario Lab entry point and scenario picker.
- [ ] Show selected scenario, learning goal, fictional-data label, simulation clock, active event, role actions, and modelled outcome card.
- [ ] Integrate start, tick, read-run, replay, and reset endpoints when provided.
- [ ] Create reusable visual fixture packs for these scenarios:
  - [ ] Authorised ambient transfer
  - [ ] Shelf mismatch
  - [ ] Safety-floor shield
  - [ ] FEFO reroute
  - [ ] Delayed rider
  - [ ] Refused receipt
  - [ ] Demand shock and LGA escalation
- [ ] Ensure every outcome names the next accountable owner. Never display modelled outputs as real impact metrics.

### Completion check

A facilitator can run any scenario from a clean seed, explain the decision made, show the outcome, and reset it without help from the terminal.

## Round D: OSM map and notification centre

### Build

- [ ] Add an interactive Leaflet map to the web operations console, using a configurable OpenStreetMap-compatible tile provider.
- [ ] Display `© OpenStreetMap contributors` visibly and preserve browser referrer/caching defaults. Do not prefetch, bulk-download, or promise offline maps.
- [ ] Render fictional facility markers, a rider marker, route segments, delayed-route status, and a no-map route/ETA fallback from the same fixture data.
- [ ] Build the web notification centre: inbox, unread count, severity/status, actor, order reference, event time, read/dismiss state, and deep links to transfer or exception detail.
- [ ] Add in-app toast/banner notifications for scenario events. Ask for browser notification permission only from an explicit user action.
- [ ] Treat service-worker/browser push as an optional enhancement after the in-app notification centre is complete and deployed over HTTPS.

### Completion check

The dashboard still tells the complete operational story when tile loading fails or browser notifications are denied.

## Round E: demonstration polish

### Build

- [ ] Add responsive layouts, keyboard navigation, focus states, readable contrast, and reduced-motion support.
- [ ] Capture desktop and mobile-width screenshots for every finished route.
- [ ] Test the fixture fallback when the API is unavailable.
- [ ] Add dashboard tests for loading, populated, empty, error, and critical exception states.
- [ ] Remove dead copy, speculative numbers, real-partner implications, and any old SMS-first wording.
- [ ] Join three full demo rehearsals and log every visual or integration failure.
- [ ] Provide Farid with truthful screenshots, a short flow capture, and labelled fictional scenario data for the creative illustration.

### Completion check

The console is stable, accessible, recording-ready, and agrees exactly with the mobile app, API state, Scenario Lab, deck, and report.

## Coordination rules

- Keep work on a focused feature branch and commit at each meaningful checkpoint.
- Import shared contracts from `@supplai/contracts`; do not duplicate API models.
- Ask for a contract change before building against an assumption.
- Include a screenshot or short GIF for each visual pull request and tests for behaviour changes.
- Report blockers early. Do not quietly replace unavailable APIs with incompatible temporary behaviour.
- Update this tracker after each working session.
