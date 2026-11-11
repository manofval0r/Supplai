# Supplai API map

This map reflects the checked-in API and contracts on 5 November 2026. The
mobile and web apps use the same API workflow. The web app is an independent
Next.js copy of the mobile client; API behavior and request types remain in
their respective app workspaces and the shared domain contracts.

## Routes

| Method | Path                         | Auth                               | Request schema                                | Response schema         | Error shape                                                     | Owner                         | Status                                 |
| ------ | ---------------------------- | ---------------------------------- | --------------------------------------------- | ----------------------- | --------------------------------------------------------------- | ----------------------------- | -------------------------------------- |
| GET    | `/health`                    | None                               | None                                          | `HealthResponse`        | Fastify validation/error                                        | Core                          | Implemented                            |
| POST   | `/demo/sms`                  | None (demo)                        | `DemoSmsRequest`                              | `SmsProcessingResult`   | Fastify validation/error                                        | Core                          | Implemented                            |
| POST   | `/webhooks/sms/:provider`    | `x-webhook-secret` when configured | Provider payload adapted to `InboundSmsEvent` | `SmsProcessingResult`   | `{ error: "Unauthorized webhook" }` or Fastify validation/error | Core                          | Implemented                            |
| POST   | `/demo/dispatch`             | None (demo)                        | `CreateDemoDispatch`                          | `DemoDispatchResult`    | `{ error: "Request is not confirmed or already dispatched" }`   | Core                          | Implemented                            |
| POST   | `/demo/delivery/:reference`  | None (demo)                        | `VerifyDelivery`                              | `DeliveryResult`        | Fastify validation/error; non-delivered result uses HTTP 409    | Core                          | Implemented                            |
| GET    | `/api/overview`              | None                               | None                                          | `LgaOverview`           | Repository/runtime error                                        | Core                          | Implemented                            |
| GET    | `/api/lga/overview`          | None                               | None                                          | `LgaOverview`           | Repository/runtime error                                        | Core                          | Implemented (alias of `/api/overview`) |
| GET    | `/api/lga/transfers`         | None                               | None                                          | `TransferSummary[]`     | Repository/runtime error                                        | Core                          | Implemented                            |
| GET    | `/api/transfers/:reference`  | None                               | Path `reference`                              | `TransferSummary`       | `{ error: "Transfer not found" }`                               | Core                          | Implemented                            |
| GET    | `/api/orders/:reference`     | None                               | Path `reference`                              | `OrderDetail`           | `{ error: "Order not found" }`                                  | Core                          | Implemented                            |
| GET    | `/api/failures`              | None                               | None                                          | `OperationalFailure[]`  | Repository/runtime error                                        | Core / Akolo presentation     | Implemented                            |
| GET    | `/api/operations/failures`   | None                               | None                                          | `OperationalFailure[]`  | Repository/runtime error                                        | Core / Akolo presentation     | Implemented (alias of `/api/failures`) |
| POST   | `/api/imports/stock-csv`     | Not yet defined                    | Planned CSV upload                            | Planned import result   | Planned row errors                                              | Akolo                         | Planned                                |
| GET    | `/api/exports/movements.csv` | Not yet defined                    | Planned date filter                           | CSV completed movements | Planned export errors                                           | Akolo                         | Planned                                |
| GET    | `/api/operations/directory`  | Not yet defined                    | None                                          | `DashboardDirectory`    | Repository/runtime error                                        | Core contract, Akolo consumer | Planned; fixtures are the source today |

## Fixture domain (shared contracts)

These shared schemas define the fixture domain:

- `FacilityFixture`: `id`, `name`, `ward`, `phone` (E.164), `coordinates`, `publicLedger`
- `MedicineFixture`: `id`, `name`, `unit`, `aliases`
- `StockFixture`: `facilityId`, `medicineId`, `onHand`, `minimum`
- `RiderFixture`: `id`, `name`, `phone`
- `DashboardDirectory`: `lgaCode`, `facilities`, `medicines`, `riders`, `stock`
- `transferableSurplus(stock)`: shared helper returning `max(0, onHand - minimum)`

## Exact workflow states

Copied from `packages/contracts/src/index.ts`:

- Request: `open`, `matched`, `confirmed`, `dispatched`, `delivered`, `failed`, `expired`
- Transfer/dispatch: `pending`, `dispatched`, `in_transit`, `delivered`, `failed`, `locked`
- Dispatch result: `assigned`, `in_transit`, `delivered`, `failed`
- Delivery result: `delivered`, `invalid_proof`, `locked`, `expired`, `already_closed`, `not_found`, `unauthorized`
- Failure kinds: `unmatched`, `expired`, `dispatch`, `proof_locked`
- SMS processing outcomes: `accepted`, `offered`, `confirmed`, `declined`, `expired`, `unmatched`, `invalid`
- Order detail status: `needs_review`, `awaiting_source_confirmation`, `rider_en_route`, `received`, `escalated`

## Transfer lifecycle fields

`TransferSummary` now carries optional `fromFacilityId`, `toFacilityId`,
`riderName`, `dispatchedAt`, and `deliveredAt`. They are optional so fixture
summaries remain valid; the full event timeline lives on `OrderDetail`.

## Resolved change requests

1. LGA route names: `/api/lga/overview` and `/api/operations/failures` now exist as aliases; `/api/lga/transfers` is new.
2. Fixture-domain contracts: now shared in `@supplai/contracts`.
3. Transfer lifecycle detail: optional fields added; timeline lives on `OrderDetail`.
4. `DispatchAdapter` now has an optional `updateDispatch` for in-transit, delivered, and failed transitions.
5. Proof-code expiry is 30 minutes. The 10-minute rule applies to the source confirmation TTL, not to delivery proof.
