# Akolo Development Plan

## Goal

Own the operational and presentation layer of the Supplai MVP as an equal co-developer. Deliver a clear LGA dashboard, reliable demo fixtures, stock data exchange, and a mock dispatch integration that connects cleanly to the technical core.

## Round 1: Fixtures and dashboard foundation

### Build

- Review the shared contracts supplied by the core workflow co-developer.
- Create eight fictional public PHCs in one fictional LGA.
- Create two fictional riders.
- Seed ORS sachets and zinc 20 mg tablets with realistic aliases.
- Create stock snapshots that support the agreed demonstration scenario.
- Create request, transfer, failure, and metric JSON fixtures.
- Initialize the React dashboard within the shared workspace.
- Build the page shell, navigation, loading state, empty state, and error state.

### Deliverable

A dashboard running entirely from checked-in fixtures, with reproducible demo data and no dependency on an unfinished API.

### Completion checks

- Fixture identifiers are stable.
- All facilities use the public ledger.
- Facility A lacks ORS and Facility B has transferable surplus.
- Dashboard works at common laptop and projector widths.

## Round 2: LGA operational dashboard

### Build

- Build summary metrics for open stockouts, transfers in flight, completed transfers, unmet requests, and response rate.
- Build a stockout list by facility and medicine.
- Build a transfer table with status and timestamps.
- Build an unmet-request view.
- Build a facility response-rate view.
- Add useful filtering without introducing configuration screens.
- Integrate `GET /api/lga/overview` and `GET /api/lga/transfers` when available.
- Keep fixture mode available as a demonstration fallback.

### Deliverable

A single-screen LGA dashboard that clearly shows what requires attention and what Supplai has accomplished.

### Completion checks

- API loading, empty, error, and populated states work.
- Status labels match shared workflow states exactly.
- No patient information appears.
- The most important information is understandable without explanation.

## Round 3: CSV tools, dispatch adapter, and failures

### Build

- Define and document the stock CSV template with the core workflow co-developer.
- Validate required columns, facility identifiers, medicine identifiers, quantities, and timestamps.
- Stage valid stock imports and return row-level errors for invalid files.
- Export completed stock movements as CSV.
- Implement the in-memory dispatch adapter using the shared dispatch interface.
- Support dispatch creation, assignment, in-transit state, delivered state, and simulated failure.
- Build an operations view for unmatched messages, expired requests, failed dispatches, and locked proof attempts.
- Integrate `GET /api/operations/failures`.

### Deliverable

Operators can import fictional stock, simulate rider dispatch, inspect failures, and export completed movement records.

### Completion checks

- Invalid CSV rows do not silently enter stock records.
- Import errors identify the exact row and reason.
- Exported movements preserve positive and negative signs.
- Dispatch states match the shared contract.
- Every simulated failure is visible to an operator.

## Round 4: Integration and demonstration polish

### Build

- Replace remaining temporary API assumptions with shared contracts.
- Integrate dashboard updates with the completed SMS workflow.
- Confirm that the demonstration state updates without a page reload where practical.
- Add a clear demo reset path with the core workflow co-developer.
- Improve responsive layout, accessibility, keyboard behavior, and projection readability.
- Add dashboard and CSV tests.
- Document Akolo-owned setup and troubleshooting steps.
- Participate in three consecutive full demo rehearsals.

### Deliverable

A polished operational layer fully connected to the Supplai core and safe to use during the recorded or live demonstration.

### Completion checks

- Dashboard reflects the final stock movement.
- Fixture fallback still works if the API or hosting fails.
- CSV tests and dashboard tests pass.
- No console errors occur during the scripted demonstration.
- Setup and troubleshooting instructions have been tested by another team member.

## Coordination rules

- Use shared contracts. Do not create a second set of API types.
- Coordinate any required workflow change with the co-developer who owns that component before implementing it.
- Keep pull requests small and focused on one behavior.
- Include screenshots for visible dashboard changes.
- Add tests for CSV validation, dispatch state changes, and critical dashboard states.
- Raise blockers early instead of building temporary incompatible behavior.
