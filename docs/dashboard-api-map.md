# Dashboard API map

This map reflects the checked-in API and contracts on 4 November 2026. The
dashboard uses fixture mode until the planned LGA routes are available.

| Method | Path                         | Auth                               | Request schema                                | Response schema            | Error shape                                                     | Owner                         | Status                                 |
| ------ | ---------------------------- | ---------------------------------- | --------------------------------------------- | -------------------------- | --------------------------------------------------------------- | ----------------------------- | -------------------------------------- |
| GET    | `/health`                    | None                               | None                                          | `HealthResponse`           | Fastify validation/error                                        | Lead                          | Implemented                            |
| POST   | `/demo/sms`                  | None (demo)                        | `DemoSmsRequest`                              | `SmsProcessingResult`      | Fastify validation/error                                        | Lead                          | Implemented                            |
| POST   | `/webhooks/sms/:provider`    | `x-webhook-secret` when configured | Provider payload adapted to `InboundSmsEvent` | `SmsProcessingResult`      | `{ error: "Unauthorized webhook" }` or Fastify validation/error | Lead                          | Implemented                            |
| POST   | `/demo/dispatch`             | None (demo)                        | `CreateDemoDispatch`                          | `DemoDispatchResult`       | `{ error: "Request is not confirmed or already dispatched" }`   | Lead                          | Implemented                            |
| POST   | `/demo/delivery/:reference`  | None (demo)                        | `VerifyDelivery`                              | `DeliveryResult`           | Fastify validation/error; non-delivered result uses HTTP 409    | Lead                          | Implemented                            |
| GET    | `/api/overview`              | None                               | None                                          | `LgaOverview`              | Repository/runtime error                                        | Lead                          | Implemented                            |
| GET    | `/api/transfers/:reference`  | None                               | Path `reference`                              | `TransferSummary`          | `{ error: "Transfer not found" }`                               | Lead                          | Implemented                            |
| GET    | `/api/failures`              | None                               | None                                          | `OperationalFailure[]`     | Repository/runtime error                                        | Lead / Akolo presentation     | Implemented                            |
| GET    | `/api/lga/overview`          | Not yet defined                    | Not yet defined                               | Planned dashboard overview | Not yet defined                                                 | Lead contract, Akolo consumer | Planned; use `/api/overview` currently |
| GET    | `/api/lga/transfers`         | Not yet defined                    | Not yet defined                               | Planned transfer list      | Not yet defined                                                 | Lead contract, Akolo consumer | Planned; no route                      |
| GET    | `/api/operations/failures`   | Not yet defined                    | Not yet defined                               | Planned failure list       | Not yet defined                                                 | Shared                        | Planned; use `/api/failures` currently |
| POST   | `/api/imports/stock-csv`     | Not yet defined                    | Planned CSV upload                            | Planned import result      | Planned row errors                                              | Akolo                         | Planned                                |
| GET    | `/api/exports/movements.csv` | Not yet defined                    | Planned date filter                           | CSV completed movements    | Planned export errors                                           | Akolo                         | Planned                                |

## Exact workflow states

Copied from `packages/contracts/src/index.ts`:

- Request: `open`, `matched`, `confirmed`, `dispatched`, `delivered`, `failed`, `expired`
- Transfer/dispatch: `pending`, `dispatched`, `in_transit`, `delivered`, `failed`, `locked`
- Dispatch result: `assigned`, `in_transit`, `delivered`, `failed`
- Delivery result: `delivered`, `invalid_proof`, `locked`, `expired`, `already_closed`, `not_found`, `unauthorized`
- Failure kinds: `unmatched`, `expired`, `dispatch`, `proof_locked`
- SMS processing outcomes: `accepted`, `offered`, `confirmed`, `declined`, `expired`, `unmatched`, `invalid`

There is no separate match-state schema in the shared contracts. The API's
in-memory offer uses `offered`, `confirmed`, and `declined` internally.

## Gaps and change requests

1. The plan names `/api/lga/overview`, `/api/lga/transfers`, and
   `/api/operations/failures`; the API currently exposes `/api/overview`,
   `/api/transfers/:reference`, and `/api/failures`.
2. `LgaOverview` only contains metrics and transfer summaries. The Round 1
   dashboard needs facility, medicine, stock snapshot, rider, and timeline
   contracts for live mode.
3. `TransferSummary` does not expose lifecycle timestamps, rider, supplier
   IDs, receiver IDs, or a full timeline.
4. No shared fixture-domain schemas exist for facilities, medicines, riders, or
   stock snapshots. Round 1 keeps these as a single provisional fixture type
   in `apps/dashboard/src/data/fixtures.ts`; replace it when contracts land.
5. `DispatchAdapter` currently only supports `createDispatch`; assignment,
   in-transit, delivered, and failure transitions are not represented.
6. `OperationsService` currently uses a 30-minute proof expiry while the
   development rules require 10 minutes. This dashboard does not change it;
   it is a lead-owned change request.
