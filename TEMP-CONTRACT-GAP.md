# Temporary contract gap

The shared contracts currently cover overview metrics, transfer summaries, and
operational failures, but not the fixture domain needed for the Round 1
dashboard. The provisional `FacilityFixture`, `MedicineFixture`,
`StockFixture`, and `RiderFixture` types live only in
`apps/dashboard/src/data/fixtures.ts`.

Lead developer change request: add shared schemas/types for public facilities
(including stable ID, ward, coordinates, and phone), medicines and aliases,
riders, and stock snapshots (on-hand, minimum, transferable surplus). Replace
the provisional types when those contracts are checked in.
