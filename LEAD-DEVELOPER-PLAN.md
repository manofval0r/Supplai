# Lead Developer Plan

## Goal

Own the Supplai technical core and deliver a tested, deployed end-to-end demonstration. Four rounds are sufficient if scope remains controlled. Each round should end with working software, not disconnected components.

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

