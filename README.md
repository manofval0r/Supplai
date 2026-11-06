# Supplai

Supplai is a TypeScript monorepo for the Social Logistics Challenge prototype: an LGA-authorised workflow for moving ambient essential medicines between Nigerian primary health centres.

## Repository layout

- `apps/api` — Fastify API, SMS workflow, matching, confirmation, delivery proof, and ledger.
- `apps/dashboard` — React web operations console for LGA officers.
- `apps/mobile` — Expo facility and rider app.
- `packages` — shared contracts and configuration.
- `supabase` — database migrations and seed data.
- `references` — source material brought in from outside the project.
- `tools` — reproducible developer helpers, including legacy presentation tooling.
- `artifacts` — ignored local output: plans, reports, decks, screenshots, PDFs, and temporary review material.

## Requirements

- Node.js 22 or newer
- npm

## Run

```bash
npm install
npm run dev:api                              # http://127.0.0.1:3000
npm run dev -w @supplai/dashboard            # http://127.0.0.1:3001
npm run start -w @supplai/mobile             # Expo dev server
```

Without Supabase credentials the API uses an in-memory repository with demo fixtures.

## Quality gate

```bash
npm run check   # formatting, lint, typecheck, tests
npm run build
```

## Data boundaries

Ambient commodities only: ORS sachets and zinc 20 mg tablets. Every facility, phone number, and stock figure in the demo is fictional. Services that would cost money or depend on a partner (SMS gateway, map provider, remote push) are simulated or configurable through environment variables.

Generated or working material belongs in `artifacts` and must not be committed. Production code, migrations, shared contracts, and reusable tools remain version-controlled.
