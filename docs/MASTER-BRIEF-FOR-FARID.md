# Supplai — Master Brief for Final Report (Farid)

**Prepared:** 2026-11-14  
**Product:** Supplai — Role-based essential medicine redistribution for Nigerian primary health centres (Ado-Odo/Ota LGA simulation)  
**Important Demo Disclosure:** All facilities, stock quantities, courier identities, wallet balances, and delivery routes in the demo are **fictional scenario data**. Live Supabase persistence is tabled until the new Supabase project reference is linked post-Round 13; the hosted API currently runs the deterministic in-memory repository.

---

## 1. Problem & Operational Scope

- **Core Problem:** Primary health centres (PHCs) experience localized stockouts of essential ambient-stable commodities while neighboring clinics hold surplus stock, without a shared, auditable custody workflow.
- **Included Commodities (Ambient-Stable Only):**
  - **ORS 20.5 g** (Oral Rehydration Salts)
  - **Zinc Sulfate 20 mg**
- **Explicit Safety Boundary (Cold-Chain Exclusion):**
  - Motorcycle couriers in Supplai **only** transport ambient-stable commodities. Cold-chain items such as **Oxytocin** and **vaccines** (requiring continuous 2°C–8°C cold-chain verification) are explicitly blocked by protocol and routed to the LGA Cold Store.
- **Safety-Floor & Custody Controls:**
  - **Source Safety Floor:** Releasing clinics cannot drop below their protected minimum stock threshold (e.g., 20–30 units depending on scenario), capping surplus releases and escalating unmet deficits to the LGA Central Store.
  - **FEFO & Batch Traceability:** Batch numbers and expiry dates (e.g., `B209, Exp 10/2027`) are recorded before release.
  - **Two-Sided Handover Verification:** Tamper-evident seal (`#7842`) and 4-digit handover PIN (`5082`) unlock paired ledger stock movements (`-qty` source / `+qty` receiver).

---

## 2. System Architecture & Surfaces

| Surface             | Package / Path                                               | Purpose                                                                        | Key Routes / Screens                                                                                                                                                                                      |
| :------------------ | :----------------------------------------------------------- | :----------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mobile App**      | `apps/mobile` (`@supplai/mobile`, Expo SDK 58)               | Primary working surface for facility custodians, couriers, and Scenario Lab    | `RolePicker` (Request, Release, Track), `FacilityScreen`, `RiderScreen` (Leaflet/OSM map), `ActivityScreen` (incl. read-only LGA Oversight card), `AccountScreen` (Settings, Developer Menu, OTA Updates) |
| **Web Platform**    | `apps/web` (`@supplai/web`, Next.js 16)                      | Marketing landing, interactive web console, LGA decision desk, and app preview | `/` (Landing), `/login`, `/dashboard` (Interactive Console), `/lga` (LGA Priority Queue & Oversight), `/app-preview` (3D Phone Mockups, APK Link, Google Drive Video Embeds)                              |
| **API Server**      | `apps/api` (`@supplai/api`, Fastify 5)                       | REST API, Scenario Lab state machine, and repository layer                     | `/health`, `/api/lga/overview`, `/api/lga/transfers`, `/api/transfers/:reference`, `/api/operations/failures`, `/api/requests`, `/api/orders/:reference/actions`, `/api/notifications`, `/demo/scenarios` |
| **Shared Packages** | `packages/contracts`, `packages/config`, `packages/database` | Zod schemas, assistant query rules, env validation, 13 Supabase SQL migrations | `packages/contracts/src/index.ts`, `supabase/migrations/`                                                                                                                                                 |

---

## 3. Live Endpoints & Build Artifacts

- **Hosted API (Render):** `https://supplai-api.onrender.com`
  - Service ID: `srv-dbs638gn74is738v7s90` (Frankfurt region, Node runtime, `npx tsx apps/api/src/index.ts`)
  - Verified live responses: `GET /health` (`{"service":"supplai-api","status":"ok"}`), `GET /api/lga/overview`, `GET /api/operations/failures`, `GET /demo/scenarios` (7 deterministic scenarios).
- **Android Preview APK (EAS Build):**
  - Build ID: `b8dd3fa6-8d2a-4f81-80d9-71b6481ee29e` (`preview` channel, runtime `0.1.0`)
  - Build Page: `https://expo.dev/accounts/manofval0r/projects/supplai/builds/b8dd3fa6-8d2a-4f81-80d9-71b6481ee29e`
  - Direct APK: `https://expo.dev/artifacts/eas/SbcBPrh1j2aQ1N3N3phRE37QuxNpm2xVVx5Gz7tbdCA.apk`
  - Verified on `Pixel_9a` Android emulator (`emulator-5554`): installs cleanly, launches with zero `AndroidRuntime` crashes (R8/ProGuard `GLView`/`ExpoView` keep rules applied), and includes live Expo OTA update checking in Settings.

---

## 4. Visual Assets & Screenshots for the Report

- **Mobile Screenshots (`docs/screenshots/mobile/`):**
  - `00-splash.png` — Dynamic light/dark animated splash screen
  - `01-role.png` — Home role picker with 3D illustrations (`Request stock`, `Release surplus`, `Track delivery` progress bar) and FloatingDock
  - `02-facility-request.png` — Facility stock request with 3D ORS sachet, safety-floor preview, and nearest clinic ETA
  - `03-facility-release.png` — Facility surplus release with 3D sealed crate (`#7842`) and batch/expiry metadata
  - `05-activity.png` — Activity ledger, live courier progress, and read-only LGA Oversight card
  - `06-account.png` — Facility profile, simulated wallet, and navigation to Settings / Developer Menu
  - `07-settings-ota.png` — Preferences and Expo OTA `Check for updates` (`Channel: preview`)
  - `08-dev-menu.png` — Developer simulation controls (UI scale, 2D art scale, handover PIN `5082`, courier speed)
- **Web Screenshots (`docs/screenshots/web/`):**
  - `04-lga-1440.png` — `/lga` Priority Queue & Safety-Floor Oversight desk (canonical cobalt/lime/white parity, `Demo data · Fictional scenario` badge)
  - `05-app-preview-1440.png` — `/app-preview` 3D mobile showcase, EAS APK download link, and Google Drive video preview section

---

## 5. Quality Verification & Honest Scope

- **Automated Verification (`npm run check` & `npm run build`):**
  - Formatting (`prettier --check .`), Linting (`eslint .`), Typechecking (`tsc --noEmit` across all 6 workspaces), and **54/54 tests across 12 test files** (`@supplai/api` 24, `@supplai/web` 17, `@supplai/mobile` 4, `@supplai/contracts` 7, `@supplai/config` 2).
  - Production Next.js build (`next build --webpack`) compiles 9 static routes (`/`, `/app-preview`, `/dashboard`, `/lga`, `/login`, icons, 404).
- **Out of Scope / Tabled Items:**
  - **CSV Import/Export:** Explicitly out of scope for this release.
  - **Supabase Live DB Smoke Test:** Tabled until the new Supabase project ref is linked and `SUPABASE_SECRET_KEY` is added to Render (`scripts/supabase-smoke.mjs` is ready to run).
  - **Round 13 (Optional Polish):** Apple-style Liquid Glass UI upgrade (`@zakisheriff/liquid-glass` on web, `expo-glass-effect` on mobile).
