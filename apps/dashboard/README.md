# Supplai dashboard

The dashboard is a fixture-backed LGA operations view for the Round 1 demo. It
consumes `@supplai/contracts` for API payloads and keeps the fictional source
data in the repository-level `fixtures/` directory.

## Run locally

From the repository root:

```powershell
npm install
npm run dev -w @supplai/dashboard
```

Open `http://localhost:5173`. The current mode is always shown as **Fixture
mode** when the API is unavailable. Set `VITE_API_BASE_URL` when the API is
running on another origin; the dashboard polls the existing `/api/overview` and
`/api/failures` routes every 10 seconds. See
[`docs/dashboard-api-map.md`](../../docs/dashboard-api-map.md) for the exact
route mapping and gaps.

Useful checks:

```powershell
npm run typecheck -w @supplai/dashboard
npm test -w @supplai/dashboard
npm run build -w @supplai/dashboard
```

The theme toggle persists in local storage and the layout collapses to a
navigation bar on narrow screens. No proof code or patient information is
included in fixtures or rendered views.

## Nigeria location data

The `data/` directory contains the normalized source data for all 37 states,
774 LGAs, and 8,811 wards. `states.csv`, `lgas.csv`, and `wards.csv` are
generated, CRLF-safe exports with stable state and LGA identifiers. The
Facilities workspace uses the source JSON to provide linked State, LGA, and
Ward selectors and plots the selected ward coordinates in an offline SVG map.
