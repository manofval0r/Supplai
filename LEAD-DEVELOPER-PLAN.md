# Core Workflow Co-Developer Plan

> **Product direction update, 3 November 2026:** Rounds 1–3 remain completed technical foundation work. Supplai is now being built as one role-based React Native/Expo Android app for facility and rider flows, plus an LGA operations web console. SMS/WhatsApp are secondary simulated order-intake channels. The authoritative recovery plan is [MASTER-PRODUCT-PLAN.md](MASTER-PRODUCT-PLAN.md). This plan remains the progress tracker for the co-developer work you own.

## Goal

Own the Supplai technical core and deliver a tested, deployed end-to-end demonstration. You and Akolo are equal co-developers with different component ownership. The original foundation rounds are complete or superseded; the remodel now has **eight tracked rounds**. Each round ends with independently demonstrable software, not disconnected components.

## Progress tracker

Update this tracker whenever a task begins, is completed, or becomes blocked.

- `[ ]` Not started
- `[~]` In progress
- `[x]` Completed
- `[!]` Blocked

### Overall progress

| Round                                | Status | Completion condition                                               | Notes                                                                                        |
| ------------------------------------ | ------ | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| Round 1: Foundation and contracts    | `[x]`  | Workspace, database, contracts, and checks work from a clean setup | Verified locally and on Supabase on 2026-11-03. Fictional demo foundation is loaded. |
| Round 2: SMS intake and confirmation | `[~]`  | One valid request reaches one confirmed reservation                | Reopened on 2026-11-03: direct review found requester-authorised confirmation; source-custodian authority must replace it. |
| Round 3: Dispatch, proof, and ledger | `[x]`  | A verified delivery writes two correct stock movements             | Ledger mechanics verified locally and with a rolled-back live Supabase workflow on 2026-11-03; product sign-off depends on the Round 2 authority correction. |
| Round 4: Safety, authority, and event spine | `[~]` | Source confirmation, safety data, canonical order timeline, and Scenario 1 API are safe and replayable | Product strategy was upgraded on 2026-11-03; source-confirmation authority fix remains the first implementation task. |
| Round 5: Native role app and notification core | `[ ]` | Facility/rider Android flows and the shared in-app notification centre consume one canonical event stream | Local notifications work in the Android demo; remote push is not a dependency. |
| Round 6: Web operations, OSM map, and notification centre | `[ ]` | Dashboard, exception workbench, interactive map, and web notification inbox work from API or fixtures | Akolo may work from versioned fixtures without waiting for live endpoints. |
| Round 7: Scenario Lab, channel resilience, and cross-platform hardening | `[ ]` | Every scenario, message bridge, map fallback, and notification path is deterministic and recoverable | Browser push and remote native push are enhancements, not gates. |
| Round 8: Deployment, creative illustration, and rehearsal | `[ ]` | Deployed scripted demo succeeds three consecutive times and supports screen recording | |

### Preflight

- [x] Configure a project-scoped Supabase MCP connection.
- [x] Verify access to project `nigoztdsmxunmcxminmx`.
- [x] Confirm the database has no existing application tables or migrations.
- [x] Capture a clean security and performance advisor baseline.
- [x] Apply migration `enable_pg_trgm`.
- [x] Verify `pg_trgm` 1.6 is installed in the `extensions` schema.
- [x] Confirm security and performance advisors remain clear after installation.

### Round 1 tasks

- [x] Verify the project-scoped Supabase MCP connection to project `nigoztdsmxunmcxminmx`.
- [x] Initialize the TypeScript workspace.
- [x] Create the Fastify API and shared packages.
- [x] Configure Supabase PostgreSQL without requiring local Docker.
- [x] Add environment validation.
- [x] Create and deploy the initial database migrations.
- [x] Add database constraints and fictional seed foundation.
- [x] Publish shared API and dispatch contracts for Akolo.
- [x] Configure formatting, type checking, tests, and CI commands.
- [x] Verify build, formatting, linting, types, tests, compiled health response, and remote database state.

### Round 2 tasks

- [x] Implement the SMS simulator route.
- [x] Define the canonical inbound SMS event.
- [x] Implement the provider webhook boundary.
- [x] Normalize Nigerian phone numbers.
- [x] Add message logging and webhook idempotency.
- [x] Parse medicine requests and confirmation replies.
- [x] Implement ORS and zinc alias matching.
- [x] Create and rank eligible matches.
- [x] Enforce confirmation expiry.
- [x] Protect reservations against concurrent confirmations.
- [x] Pass duplicate, expiry, parser, matching, and concurrency tests.
- [~] Replace requester-owned confirmation with source-custodian authorisation in the in-memory repository, Supabase function, contracts, and regression tests.

### Round 3 tasks

- [x] Connect confirmed matches to the dispatch interface.
- [x] Integrate the shared mock dispatch adapter boundary for Akolo.
- [x] Generate and protect delivery proof codes.
- [x] Enforce proof attempt and expiry rules.
- [x] Complete transfers after receiver verification.
- [x] Write paired stock movements transactionally.
- [x] Rebuild cached stock from the movement ledger.
- [x] Expose overview, transfer, and failure API routes.
- [x] Add structured logging.
- [x] Pass dispatch, proof, transaction, and ledger tests.

### Round 4 tasks

- [x] Freeze the Phase 1 implementation sequence and identify the affected source-confirmation files.
- [x] Confirm the first demo commodity set remains ambient only: ORS sachets and zinc 20 mg tablets.
- [x] Define Scenario 1 acceptance: source confirmation, authorised release, simulated pickup, receipt, ledger update, reset, and replay are visible from one seed.
- [ ] Define the controlled Scenario Lab contract: scenario, fixture version, event, role action, outcome, and reset.
- [ ] Implement Scenario 1: an authorised ambient transfer with a deterministic replayable timeline.
- [ ] Add fixture packs for safety-floor, shelf-mismatch, FEFO, rider-delay, refused-receipt, and demand-shock scenarios.
- [ ] Build a central admin panel for managing all scenarios and demo operations from one location, with authority beyond the LGA dashboards and access to behind-the-scenes controls.
- [ ] Integrate Akolo's dashboard, fixtures, CSV tools, and failure views.
- [ ] Connect the admin panel and dashboard to live API routes.
- [ ] Add demonstration authentication, role-based authority, and rate limiting.
- [ ] Configure demo-only routes and behind-the-scenes controls safely.
- [ ] Run the complete critical test suite.
- [ ] Deploy the API, admin panel, dashboard, and database.
- [ ] Document setup, architecture, demo, fallback, and limitations.
- [ ] Create and verify a demo reset command.
- [ ] Complete three consecutive successful rehearsals.
- [ ] Prepare a recorded fallback demonstration.

### Rounds 5–8 delivery gates

#### Round 5: Native role app and notification core

- [ ] Create the Expo facility/rider role shell and complete the facility request, order timeline, receiving inspection, rider pickup, in-transit, and handover flows.
- [ ] Build a shared notification event model and mobile inbox, unread badge, deep link target, read/dismiss action, and in-app banner.
- [ ] Add Expo local notifications for simulated critical events on Android. Treat remote push as an optional development-build enhancement, never a required demo dependency.
- [ ] Run an early native-map technical spike with a provider-switchable OSM-compatible implementation and visible attribution. Keep the route/ETA visual fallback until the Android build is proven.

**Gate:** a facility and rider can finish Scenario 1 on Android, receive visible event alerts, and understand route progress even with the map provider unavailable.

#### Round 6: Web operations, OSM map, and notification centre

- [ ] Akolo completes the operations overview, priority queue, transfer detail, authority drawer, Scenario Lab controls, and exception workbench against fixture mode first.
- [ ] Add a Leaflet-based OSM map to the web console with visible attribution, a configurable tile provider, no prefetching, and a stylised route fallback.
- [ ] Build the web notification centre with inbox, unread count, filters, read state, deep links, toast/banner alerts, and browser-permission prompt only after user intent.
- [ ] Connect web routes to live APIs only after the Round 4 contract is frozen; retain fixtures as a tested fallback.

**Gate:** the web console remains fully demonstrable when the API, map tiles, or browser-notification permission are unavailable.

#### Round 7: Scenario Lab, channel resilience, and cross-platform hardening

- [ ] Implement and verify all seven deterministic scenarios and their next-accountable-owner outcomes.
- [ ] Make the SMS/WhatsApp simulators write the same event and notification records as the facility app.
- [ ] Verify Android and web notification parity: event, badge, inbox, deep link, read/dismiss, and in-app alert.
- [ ] Add browser push only if HTTPS, service worker, permissions, and deployment are stable. Add native remote push only in an Expo development build if it adds demo value.
- [ ] Test map fallback, notification fallback, slow network, reload, API error, and fixture mode.

**Gate:** no external service or collaborator's unfinished interface can prevent a complete, resettable demonstration.

#### Round 8: Deployment, creative illustration, and rehearsal

- [ ] Deploy the API and web preview, make the Android build/install route repeatable, and secure demo reset/admin controls.
- [ ] Run three full demos from clean reset, including one map-provider failure and one notification-permission denial.
- [ ] Give Farid stable screen recordings, screenshots, labels, and scenario outcomes for the creative illustration and report.

**Gate:** the final demo works from its fallback path without terminal access or direct database edits.

## Dependency and blocker policy

- **Contract first:** Round 4 publishes versioned order, event, notification, route, and Scenario Lab fixtures. Akolo can build web screens from those fixtures before any live endpoint exists.
- **Adapters, not waits:** the mobile app and web console each have API and fixture adapters. A missing endpoint switches to labelled fixtures; it never stops visual work.
- **Map fallback:** the full web map uses interactive OSM tiles only when available. Native and web both ship a route/ETA visual fallback with the exact same coordinates and event state.
- **Notification fallback:** in-app inbox, banner, and badge are mandatory. Browser push and remote native push are progressive enhancements after permissions and deployment are stable.
- **Integration windows:** each developer merges against the shared contract after each round gate, not continuously. If one side is delayed, the other continues against fixtures and only swaps adapters during the planned integration window.

## Ready-to-start implementation queue

Work this queue in order. Commit after each completed item and update this tracker in the same commit.

### 1. Source-custodian authority correction

**Status:** `[~]` Ready to implement

**Files in scope:**

- `apps/api/src/sms/repository.ts`
- `apps/api/src/sms/service.ts`
- `apps/api/src/sms/memory-repository.ts`
- `apps/api/src/sms/supabase-repository.ts`
- `supabase/migrations/20261103160000_sms_confirmation_engine.sql`, followed by a new forward-only corrective migration
- `apps/api/test/sms.test.ts` and `apps/api/test/operations.test.ts`

**Required change:** an offer may be confirmed or declined only by the designated source facility/custodian. The requester can create and view a request but cannot authorise the source's stock. A confirmed offer must still respect expiry and reserve stock exactly once.

**Acceptance checks:**

- Requester confirmation is rejected.
- Source-custodian confirmation succeeds exactly once.
- Concurrent duplicate confirmation is rejected.
- Source decline, expiry, and reservation tests still pass.
- `npm run test -w @supplai/api`, `npm run typecheck -w @supplai/api`, and the affected Supabase RPC test pass.

### 2. Phase 1 safety data and order contract

**Status:** `[ ]` Starts immediately after item 1

- Add the minimal demo fields and states: controlled ambient formulary, source safety floor, batch, expiry, condition, source release, receipt/refusal, and exception event.
- Expose one typed order-detail response with timeline, available role actions, evidence chips, and next accountable owner.
- Add migration, typed contract, fixture/reset update, and regression tests together.

### 3. Scenario Lab reference run

**Status:** `[ ]` Starts immediately after item 2

- Define `Scenario`, `FixtureVersion`, `ScenarioEvent`, `ScenarioRun`, `RoleAction`, and `ScenarioOutcome` contracts.
- Build `authorised-ambient-transfer` as the reference deterministic run.
- Add protected start, tick, read-run, replay, and reset endpoints.
- Record only fictional identifiers and modelled outputs; no live message, rider, map, or medicine movement.

### 4. Expo app shell and API seam

**Status:** `[ ]` Starts when item 3 exposes stable contracts

- Create `apps/mobile` with Expo and the facility/rider role switch.
- Implement the facility request, order timeline, and receiving decision first.
- Implement rider pickup, in-transit, and handover second.
- Keep all UI actions on the shared typed API contract; do not duplicate workflow state in the app.

## Round 1: Foundation and contracts

### Build

- Initialize the TypeScript workspace.
- Create the Fastify API, React application location, and shared packages.
- Configure PostgreSQL and Docker Compose.
- Add environment validation and example environment variables.
- Create migrations for facilities, drugs, aliases, stock, requests, matches, transfers, movements, riders, and message logs.
- Enforce public-to-public transfer rules at database level.
- Create shared API and dispatch contracts for Akolo.
- Provide initial fixture shapes for dashboard development.
- Configure formatting, type checking, testing, and CI commands.

### Deliverable

A clean checkout can install dependencies, start PostgreSQL, run migrations, seed the database, start the API, and compile shared contracts.

### Completion checks

- Migration up and down paths work.
- Database constraints reject invalid transfer relationships.
- API health check succeeds.
- Akolo can import the shared contracts without copying types.

## Round 2: SMS intake and confirmation engine

### Build

- Implement `POST /demo/sms`.
- Define the canonical inbound SMS event.
- Implement `POST /webhooks/sms/:provider` behind an adapter boundary.
- Normalize Nigerian telephone numbers to E.164.
- Log every inbound and outbound message.
- Enforce idempotency using the provider message identifier.
- Parse `NEED <medicine> <quantity>` messages.
- Add ORS and zinc aliases and PostgreSQL trigram matching.
- Create requests and rank eligible supplying facilities.
- Parse confirmation and decline replies.
- Apply the ten-minute confirmation expiry.
- Prevent concurrent confirmations from creating more than one winning reservation.

### Deliverable

The simulator can create a request, send an offer, accept one valid shelf confirmation, and reject duplicates or expired replies.

### Completion checks

- Duplicate inbound event test passes.
- Unknown sender behavior is explicit.
- Ambiguous drug matches fail visibly.
- Confirmation parser accepts agreed reply variants.
- Concurrency test creates exactly one reservation.

## Round 3: Dispatch, proof, and stock ledger

### Build

- Connect the confirmed match to the dispatch interface.
- Integrate Akolo's mock dispatch adapter.
- Generate a four-digit proof code at dispatch time.
- Keep the proof code hidden from the rider.
- Allow two incorrect proof attempts before locking the transfer.
- Make the proof code single-use and time-limited.
- Complete the transfer after valid receiver verification.
- Write one negative supplier movement and one positive receiver movement in one transaction.
- Rebuild cached stock levels from movements.
- Expose overview, transfer, and failure API routes.
- Add structured logging with request identifiers.

### Deliverable

The complete SMS simulator path ends in a verified delivery, correctly signed movements, updated stock, and dashboard-readable API responses.

### Completion checks

- Dispatch cannot occur without a valid confirmation.
- The rider cannot self-confirm delivery.
- Reusing a proof code fails.
- A failed transaction writes neither movement.
- Ledger signs and resulting balances are correct.

## Round 4: Integration, deployment, and demonstration

### Build

- Integrate Akolo's dashboard, fixtures, CSV tools, and failure views.
- Replace fixture-backed dashboard calls with API calls.
- Add authentication appropriate for the demonstration.
- Add rate limiting and safe error responses.
- Ensure the demo-only SMS route is disabled by production configuration when necessary.
- Run the full critical test suite.
- Deploy the API, dashboard, and PostgreSQL database.
- Write setup, architecture, demo, fallback, and limitation documentation.
- Prepare a reset command that returns the demo to its initial state.
- Rehearse the full scenario and capture stable demonstration data.

### Deliverable

A deployed, repeatable MVP that demonstrates request, confirmation, dispatch, delivery proof, ledger update, and dashboard reporting.

### Completion checks

- Clean-install instructions have been tested.
- Deployment health checks succeed.
- Demonstration reset works.
- Full scripted demo succeeds at least three consecutive times.
- The system has a recorded fallback demonstration if external hosting fails.

## Work that remains outside these rounds

- Paid SMS account activation
- Live PHC onboarding
- Real rider tracking
- OpenLMIS real-time integration
- Payments
- Cold-chain products
- Patient-level information
