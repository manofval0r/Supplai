# Supplai Development Plan

## 1. Objective

Build a presentation-ready MVP that demonstrates this complete flow:

1. A nurse at a requesting PHC sends an SMS asking for medicine.
2. Supplai identifies the medicine and finds nearby facilities with recorded surplus.
3. A supplying PHC checks its physical shelf and confirms availability.
4. Supplai reserves one valid match and dispatches a rider.
5. The receiving PHC verifies delivery with a proof code.
6. Supplai records the stock movement for both facilities.
7. The LGA dashboard shows the request, transfer, outcome, and operational metrics.

The initial demonstration uses fictional facilities in one fictional LGA. The tracer products are ORS sachets and zinc 20 mg tablets. The system must work without a paid SMS account by using a local SMS simulator. A real provider can be connected later through the same gateway interface.

## 2. Team responsibilities

### Lead developer

Responsible for:

- Project architecture and repository structure
- Fastify API and PostgreSQL database
- Database schema, migrations, constraints, and seed foundation
- SMS simulator and provider-neutral webhook contract
- Message parsing and drug matching
- Request, match, confirmation, reservation, and expiry workflow
- Dispatch orchestration and delivery proof code
- Append-only stock movement ledger
- Security controls, logging, tests, deployment, and final integration

The lead developer owns final technical decisions and resolves integration conflicts.

### Akolo

Responsible for:

- React dashboard application
- Dashboard API integration
- Fictional PHC, rider, medicine, and stock fixtures
- CSV stock import and movement export
- Mock dispatch adapter and dispatch status presentation
- Operational views for failed, unmatched, and expired requests
- Dashboard tests, responsive behavior, and demo usability

Akolo must not change workflow states, ledger rules, confirmation expiry, or reservation logic without agreement from the lead developer.

### Farid

Responsible for:

- Research and evidence validation
- Confirming that the problem and solution remain aligned with the challenge
- Reviewing claims, statistics, medicine choices, and operational assumptions
- Seeking feedback from PHC or LGA stakeholders where possible
- Confirming submission requirements and competition compliance
- Coordinating the team's schedule and identifying blockers
- Supplying UI references or examples that reflect the intended audience and context

Farid does not own implementation or code review.

## 3. Technical structure

Use a TypeScript workspace with the following applications and packages:

```text
apps/
  api/             Fastify API and background workflow
  dashboard/       React LGA dashboard
packages/
  contracts/       Shared request and response types
  database/        Schema, migrations, seeds, and database helpers
  config/          Environment validation and shared configuration
fixtures/          Fictional facilities, stock, messages, and demo scenarios
docs/              Architecture, API, setup, and demonstration instructions
```

Core technology:

- TypeScript
- Fastify
- PostgreSQL 16
- React
- Vitest for unit and integration tests
- Docker Compose for local PostgreSQL
- Provider-neutral SMS and dispatch interfaces

## 4. Core system rules

- Only public facilities can transfer stock to other public facilities in the MVP.
- Inventory records may suggest a match, but a human shelf confirmation commits it.
- A confirmation expires after ten minutes.
- Concurrent confirmations must create exactly one winning transfer.
- Duplicate webhook events must not create duplicate requests or movements.
- A completed transfer creates one negative movement for the supplier and one positive movement for the receiver.
- Stock movements are append-only.
- The rider cannot verify their own delivery.
- No patient data is collected or stored.
- ORS and zinc are the primary demo products. Cold-chain products are excluded.

## 5. Development process

### Step 1: Agree contracts before parallel work

The lead developer defines:

- Shared domain types
- Dashboard overview response
- Transfer list response
- Failure list response
- CSV column formats
- Dispatch adapter interface

Akolo builds against checked-in JSON fixtures using these contracts while the backend is being implemented.

### Step 2: Work through short feature branches

Use one behavior per branch and pull request. Suggested branch names:

- `feat/schema-foundation`
- `feat/sms-intake`
- `feat/request-confirmation`
- `feat/delivery-ledger`
- `feat/demo-fixtures`
- `feat/dashboard-shell`
- `feat/stock-csv`
- `feat/dispatch-adapter`

The developer who owns a feature tests it before requesting integration. The lead developer performs final integration.

### Step 3: Integrate at the end of every round

Do not wait until both developers have completed all work. At the end of each round:

1. Run formatting, type checking, and tests.
2. Merge compatible work.
3. Run the current demonstration path.
4. Record failures and assign an owner.
5. Update API contracts before starting the next round.

### Step 4: Use one controlled demonstration scenario

The final scripted scenario is:

1. Facility A has insufficient ORS.
2. Facility A sends `NEED ORS 20`.
3. Supplai offers the request to eligible nearby facilities.
4. Facility B replies `YES 20` after checking its shelf.
5. Supplai reserves Facility B and creates a dispatch.
6. Facility A receives a four-digit proof code.
7. The simulated rider completes delivery.
8. Facility A enters the code.
9. The supplier loses 20 units and the receiver gains 20 units.
10. The dashboard updates the transfer and relevant metrics.

## 6. API responsibilities

| Route | Purpose | Owner |
|---|---|---|
| `POST /demo/sms` | Submit a simulated inbound SMS | Lead developer |
| `POST /webhooks/sms/:provider` | Receive a real provider webhook | Lead developer |
| `GET /api/lga/overview` | Return dashboard metrics | Lead developer contract, Akolo consumer |
| `GET /api/lga/transfers` | Return transfer records | Lead developer contract, Akolo consumer |
| `GET /api/operations/failures` | Return failed or unmatched events | Shared, Akolo owns presentation |
| `POST /api/imports/stock-csv` | Validate and import stock data | Akolo |
| `GET /api/exports/movements.csv` | Export stock movements | Akolo |

## 7. Integration checkpoints

### Checkpoint 1: Foundation

- Workspace starts locally with one documented command.
- PostgreSQL migrations and fictional seed data run successfully.
- Dashboard renders fixture data.
- Shared API contracts compile in both applications.

### Checkpoint 2: Request and confirmation

- Simulated SMS creates a request.
- Drug aliases resolve ORS and zinc correctly.
- A supplying facility can confirm or decline.
- Expired and duplicate confirmations are rejected.
- Dashboard displays open and confirmed requests.

### Checkpoint 3: Delivery and records

- One confirmation creates one dispatch.
- Delivery proof is single-use and limited to two attempts.
- Completed delivery writes two correctly signed stock movements.
- CSV import and export work with documented templates.
- Dashboard displays transfers and failures.

### Checkpoint 4: Presentation-ready MVP

- The scripted demo works from a clean installation.
- Tests cover duplicate messages, expiry, concurrent confirmations, delivery proof, and ledger signs.
- Responsive dashboard is usable on a laptop and projected screen.
- Deployment is available through a stable URL.
- Setup, demo, architecture, limitations, and fallback instructions are documented.

## 8. Definition of done

The MVP is complete when the full scripted scenario works without manually changing the database, all critical tests pass, the dashboard reflects the final state, and another person can run the demo from the written instructions.

The MVP does not require a paid SMS provider, real PHC data, live rider tracking, payments, cold-chain support, or OpenLMIS real-time integration.

