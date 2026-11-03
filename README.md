# Supplai

Supplai is a TypeScript monorepo for the Social Logistics Challenge prototype.

## Repository layout

- `apps/api` — Fastify API and workflow engine.
- `apps/dashboard` — React web operations console.
- `apps/mobile` — reserved for the Expo facility/rider app in Round 5.
- `packages` — shared contracts, configuration, and database types.
- `supabase` — database migrations and seed data.
- `references` — source material brought in from outside the project.
- `tools` — reproducible developer helpers, including legacy presentation tooling.
- `artifacts` — ignored local output: plans, reports, decks, screenshots, PDFs, and temporary review material.

Generated or working material belongs in `artifacts` and must not be committed. Production code, migrations, shared contracts, and reusable tools remain version-controlled.
