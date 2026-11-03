# Supplai — developer handover

**For:** Akolo, full-stack developer and integration owner
**From:** the team
**Status:** architecture decided, nothing built yet
**Read next:** `report.md` (the evidence), `PRODUCT.md` (the pitch), `supplai_deck.html` (the story we have already told people)

---

## 1. What we are building

A thin coordination layer that lets two Nigerian primary health centres move medicine between themselves in a few hours, using the phones they already have.

We are **not** building an inventory system, a pharmacy, a delivery company, or a marketplace. Three of those already exist in Nigeria and are better funded than us. We are building the piece that connects them: a request, a match, a confirmation from the physical shelf, a rider, a proof of delivery, and two stock records that agree afterwards.

The whole product is one idea: **confirm before dispatch.** The clinic that is about to receive medicine must check its own shelf and reply before a rider moves. Everything else is plumbing around that.

## 2. Why that one idea decides the architecture

Published inventory accuracy in Nigerian LMIS deployments runs **70–87%**. If we dispatch on the database, roughly one delivery in four is wasted: the rider arrives, the "surplus" is not there, the trip is burned, and the receiving clinic loses trust in the system forever.

So the database is allowed to _suggest_. Only a human at the shelf is allowed to _commit_.

That has three hard consequences you must not design away:

1. A match is not a commitment. It is an invitation to check.
2. A confirmation has a short life. Ten minutes by default. A "yes" from this morning is worthless this afternoon.
3. Two facilities may confirm the same surplus at the same time. Exactly one may win.

If you build those three things correctly, the rest is CRUD.

## 3. Phase 1 scope — one vertical slice

Do not build the network. Build one cell of it.

| Dimension | Phase 1                                                                                 |
| --------- | --------------------------------------------------------------------------------------- |
| Geography | One LGA. Eight to twelve facilities.                                                    |
| Drugs     | Two or three tracer items from that LGA's essential medicines list, ambient-stable only |
| Channel   | SMS only. No USSD, no WhatsApp, no app.                                                 |
| Riders    | Two to four contracted okada riders, paid per verified drop                             |
| Records   | CSV import from the facility's existing bin cards or OpenLMIS export                    |
| Dashboard | Read-only, one LGA officer, daily refresh                                               |

**Ambient-stable matters.** Oxytocin — the example in the old deck mock — is a cold-chain item and phase 1 explicitly excludes cold chain. The demo uses **ORS sachets and zinc 20 mg tablets** as its two tracer products. They are essential child-health commodities, need no refrigeration, and let us demonstrate an urgent stock transfer without pretending we have validated a cold chain. Paracetamol may exist as seed data, but it is not the hero scenario. Remove oxytocin from the prototype and submission narrative unless cold-chain operations are separately designed and evidenced.

**Definition of done for phase 1:** a nurse at Facility A texts a request; a nurse at Facility B confirms from the shelf; a rider delivers; the receiver enters a code; A's and B's stock records both change; the LGA officer sees the movement the next morning without anyone phoning her.

## 4. What not to build (yet)

A junior developer will want to build all of these. Each one is a month.

- **No mobile app.** SMS is the product. An app excludes the users who matter.
- **No national drug database.** Seed 40 drugs. Add rows when a real request needs one.
- **No payments.** Money moves by bank transfer and mobile money, outside the channel. If we put money in the SMS thread we become a financial service and the regulator notices.
- **No cold chain.** No fridges, no temperature loggers, no vaccine.
- **No patient data.** Not a name, not a diagnosis, not a phone number of a patient. Ever. Facility, drug, quantity, time.
- **No AI.** Fuzzy matching is `pg_trgm`. That is enough and it is explainable to a regulator.
- **No public-to-private stock movement.** See §7. This is the one rule that kills the company if broken.

### 4.1 Team ownership and merge boundaries

Two full-stack developers are building one vertical slice. Ownership is about reducing collisions, not creating silos.

| Owner                         | Accountable for                                                                                                                                                                 | Must not change alone                                                           |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| **Technical/product lead**    | Repository and architecture; database schema; SMS state machine; matching; confirmation TTL; reservation races; proof code; stock ledger; deployment; final integration         | Dashboard contract after Akolo starts against it                                |
| **Akolo — integration owner** | Read-only LGA dashboard; LGA-scoped access; CSV import/export; facility and tracer-drug seed tooling; Fleetbase/mock-dispatch adapter; operational failure views; demo fixtures | Request state transitions, ledger signs, TTL, reservation or cross-ledger rules |

Both developers review changes to confirmation, reservation and ledger behaviour. Those changes require tests in the same pull request. Use small feature branches and one behaviour per PR; do not divide work by “frontend” and “backend” because both tracks cross that boundary.

## 5. Architecture

Five boxes. You own the middle one.

```
 ┌──────────────┐        ┌──────────────────────────┐        ┌──────────────┐
 │  Feature     │  SMS   │      SUPPLAI CORE        │  API   │  Fleetbase   │
 │  phone       │◄──────►│  request → match →       │◄──────►│  riders,     │
 │  (nurse)     │        │  confirm → dispatch →    │        │  tracking,   │
 └──────────────┘        │  proof → ledger          │        │  proof code  │
                         └───────────┬──────────────┘        └──────────────┘
                                     │
                    ┌────────────────┴────────────────┐
                    │                                 │
            ┌───────▼────────┐               ┌────────▼────────┐
            │ Africa's       │               │ OpenBoxes /     │
            │ Talking        │               │ OpenLMIS        │
            │ shortcode,     │               │ stock records   │
            │ reverse-billed │               │ (import first)  │
            └────────────────┘               └─────────────────┘
```

**Chosen stack:** TypeScript + Fastify + PostgreSQL 16 for the API, and React for the one-screen dashboard. Use one TypeScript workspace and one shared package for API types. Do not introduce a second backend language in phase 1.

**Why Postgres specifically:** `pg_trgm` gives us fuzzy drug-name matching with no extra service, and row-level security gives us LGA-scoped dashboards without a second authorisation layer.

### 5.1 External adapter and route contract

Build provider-neutral interfaces first. The demo must run at zero gateway cost with a simulator; Africa's Talking or Twilio is selected later through configuration, without changing domain logic.

| Route                            | Purpose                                                                               | Owner                    |
| -------------------------------- | ------------------------------------------------------------------------------------- | ------------------------ |
| `POST /webhooks/sms/:provider`   | Receive, authenticate, log and enqueue an inbound gateway event                       | Lead                     |
| `POST /demo/sms`                 | Send the same canonical inbound event from the demo simulator; disabled in production | Lead                     |
| `GET /api/lga/overview`          | Stockouts, transfers, unmet requests and response rate for one LGA                    | Lead contract / Akolo UI |
| `GET /api/lga/transfers`         | Filterable read-only transfer list                                                    | Akolo                    |
| `GET /api/operations/failures`   | Unmatched, expired and failed messages visible to the pilot operator                  | Akolo                    |
| `POST /api/imports/stock-csv`    | Validate and stage a nightly stock snapshot                                           | Akolo                    |
| `GET /api/exports/movements.csv` | Export completed movement rows for reconciliation                                     | Akolo                    |

`SmsGateway.send()` accepts our canonical outbound message. Provider adapters translate it to Africa's Talking or Twilio. Store the provider's message identifier, but never let provider-specific fields leak into request, match or transfer tables.

## 6. Data model

Append-only where it matters. Never store a balance you can derive.

```sql
facility (
  id, name, type,            -- 'phc' | 'pharmacy' | 'lga_store'
  lga_code, ward,
  phone_primary,             -- E.164, +234...
  ledger,                    -- 'public' | 'private'  ← see §7
  pcn_licence, verified_at   -- pharmacies only
)

drug (
  id, canonical_name, strength, form,
  rxnorm_cui,                -- nullable, we are not authoritative
  cold_chain boolean,
  active boolean
)

drug_alias (                 -- what people actually type
  alias, drug_id, source     -- 'seed' | 'learned'
)

stock_level (                -- what the records believe
  facility_id, drug_id, qty, as_of, source  -- 'import' | 'transfer' | 'manual'
)

request (
  id, facility_id, drug_id, qty, raw_text,
  status,                    -- open | matched | confirmed | dispatched | delivered | failed | expired
  created_at, expires_at
)

match (
  id, request_id, facility_id, drug_id, qty_offered,
  status,                    -- offered | confirmed | declined | expired | reserved | consumed
  confirmed_at, confirm_expires_at,
  UNIQUE (request_id, facility_id)
)

transfer (
  id, request_id, match_id,
  from_facility, to_facility, drug_id, qty,
  rider_id, dispatch_code,   -- 4 digits, generated at dispatch
  dispatched_at, delivered_at, proof_verified_at,
  status
)

stock_movement (             -- append-only ledger, one row per side
  id, transfer_id, facility_id, drug_id,
  delta,                     -- negative for the giver, positive for the receiver
  reason,                    -- 'transfer_out' | 'transfer_in' | 'adjustment' | 'import'
  recorded_at, recorded_by
)

message_log (                -- every inbound and outbound SMS, verbatim
  id, direction, phone, body, provider_id, received_at, processed_at, error
)
```

**Rules that are not negotiable:**

- `stock_level` is a cache. `stock_movement` is the truth. Rebuild the cache from the ledger, never the other way.
- A `transfer` is created only from a `match` that is `confirmed` and not expired.
- `delta` signs are fixed: giver negative, receiver positive. Wrong signs are the most common bug in this class of system and they are silent.
- `message_log` keeps the raw text, including the misspellings. It is how you improve matching and how you prove what was said.

## 7. The two-ledger rule

Public stock and private stock live in the same database but **must never be connected by a transfer edge.**

- `facility.ledger = 'public'` → PHCs, LGA stores, public warehouses.
- `facility.ledger = 'private'` → licensed pharmacies.

A transfer is valid only when `from.ledger = to.ledger`. Enforce it in a database trigger, not in application code, and write a test that tries to break it.

Why: if public essential medicines can flow into a private pharmacy, we have built a diversion channel with a receipt. That is the single biggest way this project becomes a scandal instead of a service.

Pharmacies still participate — they pay subscriptions, they receive from other pharmacies, they deliver to public clinics as _riders_, never as recipients.

## 8. The SMS flow, exactly

Africa's Talking shortcode, **reverse-billed** so the nurse pays no airtime. Every inbound message is idempotent on `provider_id`.

```
09:14  A → shortcode
       NEED ORS 20

       [parse] [normalise] [match] [rank by distance] [offer to top 3]

09:15  shortcode → B
       Supplai: A PHC needs 20 ORS sachets.
       Do you have them ON THE SHELF now?
       Reply YES 20 / NO
       Ref 4471

09:19  B → shortcode
       YES 20

       [reserve] [create transfer] [call Fleetbase] [dispatch code]

09:20  shortcode → A
       Rider coming. Code 8842.
       Ref 4471

10:02  A → shortcode
       8842

       [verify code] [write two stock_movements] [close request]

10:02  shortcode → A and B
       Delivered. Records updated.
```

**Implementation notes:**

- **Idempotency.** The gateway retries. `provider_id` is the unique key. A duplicate webhook must return 200 and do nothing.
- **Phone normalisation.** `0803…`, `+234803…`, `234803…` are the same person. Normalise on the way in, store E.164, display local.
- **Out-of-order delivery.** SMS arrives late. Trust `received_at` from the gateway for ordering, but never let a message older than the request's TTL resurrect it.
- **Unknown sender.** Match the phone to a `facility`. If unknown, reply once with the registration instruction and stop. Do not create a facility from an inbound SMS.
- **The reply must parse in one pass.** `YES`, `YES 20`, `Y 20`, `yes 20.` all mean the same thing. Anything ambiguous gets one clarifying reply, then the match expires.
- **Never require punctuation.** Nurses type with one thumb, in a hurry, sometimes in the dark.

## 9. Drug matching

Users type `ORS`, `oral rehydration salts`, `oral salt`, `rehydration sachet`, or a misspelling such as `rehidration salt`.

```sql
SELECT drug_id, similarity(raw, canonical_name) AS s
FROM drug_alias
WHERE alias % $1              -- trigram operator, uses GIN index
ORDER BY s DESC
LIMIT 3;
```

- Build a GIN index: `CREATE INDEX ON drug_alias USING gin (alias gin_trgm_ops);`
- Threshold: accept ≥ 0.45 **only if** the top result beats the second by a margin. Otherwise ask one disambiguating question.
- Always store `raw_text` on the request. Matching improves; the audit trail must not.
- Seed 40 drugs and the aliases nurses actually use, learned from `message_log`.
- **Never let matching invent a drug.** If nothing clears the threshold, the request fails loudly and a human is told. A silent wrong match is a patient safety event.

## 10. Reservations and races

Two clinics confirming the same 20 units is not an edge case; it is Tuesday.

- Confirmation sets `match.status='reserved'` with `confirm_expires_at = now() + 10 minutes`.
- The reservation is taken with `SELECT … FOR UPDATE` on the `match` row, or a conditional update that returns the row count. Check the count.
- If the reserved match expires unused, it returns to `offered` **once**, then to `expired`. Do not re-offer forever; the surplus may genuinely be gone.
- When dispatch is created, `reserved → consumed`. No other transition may consume.
- Write a test with two concurrent confirmations and assert exactly one transfer exists. Run it a hundred times.

## 11. Proof of delivery

The code is generated **at dispatch**, sent to the receiving facility, and entered by the receiver.

- Four digits. Easy to read aloud, easy to mistype — so allow two attempts, then lock the transfer and flag it for a human.
- The rider never sees the code and cannot confirm. If the rider could self-confirm, the incentive to fake a delivery is one tap.
- Code lives on `transfer`, expires with the delivery window, is single-use.
- If the receiver has no phone in hand at the moment of delivery, the rider calls the facility landline and a supervisor enters the code in the dashboard. Log who entered it.

## 12. Records integration

Two phases, deliberately.

**Phase 1 — import and export.** Nightly CSV from OpenLMIS/OpenBoxes or from a photographed bin card keyed in by the LGA store. We read stock, we write movements back as a CSV the facility manager can paste. Ugly, honest, ships in a week.

**Phase 2 — API.** OpenLMIS has a REST API with stock management endpoints. Map our `stock_movement` to its stock event. Keep our ledger authoritative for _our_ transfers; treat theirs as the source for everything else.

Do not attempt bidirectional real-time sync in phase 1. Reconciliation bugs will eat the entire timeline.

## 13. Dashboard

One screen for the LGA officer, read-only, no configuration.

- Stockout list by facility and drug, with hours since the gap opened.
- Transfers in flight and their status.
- Unmet requests — the ones where nothing was found. This is the most valuable number in the system: it is the case for the next LGA's subscription.
- Response rate per facility. A facility that never confirms is a facility that will quietly break the network.

Row-level security on `lga_code`. An officer in Ikeja must not see Mushin. Test it by trying.

## 14. Security and privacy

- No patient data. Enforce with a schema review, not a policy document.
- Phone numbers are personal data under the NDPA 2023. Encrypt at rest, restrict to the facilities that need them, delete on request.
- Rate-limit inbound SMS per phone number; a stuck loop can cost real money at scale.
- The dispatch code is an authentication token. Treat it as one.
- Log every read of the dashboard's facility-level data. Auditors ask.

## 15. Testing that actually catches the failures

| Test                                    | What it protects                        |
| --------------------------------------- | --------------------------------------- |
| Duplicate webhook replay                | Double dispatch, double stock movement  |
| Two concurrent confirms                 | Over-allocation of the same surplus     |
| Expired confirmation used               | Stale-shelf dispatch — the core failure |
| `YES` variants parse table              | Nurses locked out by syntax             |
| Drug typo corpus (50 real misspellings) | Wrong-drug match                        |
| Sign test on ledger                     | Giver loses, receiver gains             |
| Cross-ledger transfer attempt           | Diversion                               |
| Clock skew: message from an hour ago    | Resurrection of a dead request          |

Keep a folder of real gateway payloads from the pilot's first week. Replay them as fixtures forever.

## 16. Operations

- Structured logs with a `request_id` that follows the SMS through every step.
- Alert on: webhook failure rate > 1%, unmatched-drug rate > 10%, confirmation rate < 30%.
- Dead-letter queue for inbound messages that fail parsing. Someone reads it daily during the pilot.
- A kill switch that stops outbound SMS. If we spam nurses at 3am, we lose the LGA.

## 17. Order of work

| Week | Ship                                                                            |
| ---- | ------------------------------------------------------------------------------- |
| 1    | Postgres schema, drug seed, SMS webhook, `message_log`, one hard-coded facility |
| 2    | Request → match → offer → confirm, with TTL and reservation races               |
| 3    | Fleetbase dispatch, proof code, ledger writes, end-to-end in a sandbox          |
| 4    | CSV import, LGA dashboard read-only                                             |
| 5    | Two real riders, one real LGA, two tracer drugs, supervised                     |
| 6    | Measure, fix the top three failure modes, write the handover                    |

Ship week 3 before you make week 4 pretty. A working loop with an ugly dashboard beats a beautiful dashboard over a broken loop.

## 18. Traps

1. **Optimising matching before you have real messages.** Seed 40 drugs, ship, learn.
2. **Treating the confirmation as a formality.** If it can be skipped for convenience, it will be, and the product loses its only defensible mechanic.
3. **Letting a "yes" live for hours.** TTL is the product. Short is correct.
4. **Building for the smartphone the developer owns.** The user has a feature phone, a shortcode, and no data bundle.
5. **Making the nurse pay for anything.** Reverse-billed, or it does not happen.
6. **Confusing the rider's phone with the receiver's confirmation.** They are different people and the separation is the integrity of the proof.
7. **Adding a public→private edge "just for the pilot".** That edge never comes back out.
8. **Deriving balances and storing them.** Rebuild from the ledger; do not trust the cache.
9. **Silent failures.** Every failed parse, failed match and failed dispatch must be visible to a human within a day.
10. **Scope creep into inventory management.** We are the connection, not the record.

## 19. How to work with us

- Bring a decision, not a question: "I'm doing X because Y, unless you say otherwise."
- Small pull requests, one behaviour each.
- Any change to the confirmation, reservation or ledger logic needs a test in the same PR. Those three are the product.
- If something in the deck and something in the data disagree, the data wins and you tell us.

### Akolo's first pull requests

Akolo can begin without waiting for the workflow engine:

1. `feat/demo-fixtures` — eight fictional public PHCs in one fictional LGA, two riders, ORS and zinc aliases, and reproducible stock snapshots.
2. `feat/stock-csv` — strict CSV validation, staged import, error report, and movement export fixture.
3. `feat/lga-dashboard-shell` — React dashboard against a checked-in JSON fixture matching `GET /api/lga/overview`.
4. `feat/dispatch-adapter` — an in-memory dispatch adapter with the same interface the Fleetbase adapter will implement.
5. `test/operations-views` — unmatched, expired and failed-event fixtures visible within one day.

The lead's first three PRs are schema and migrations, canonical SMS events plus webhook idempotency, then request → match → confirm with TTL and race tests. Integrate at the API contract after each pair of PRs; do not wait for both tracks to be “finished.”

---

_The pitch is done. What is left is the boring, correct version of one loop, in one LGA, for two drugs. That is the whole job._
