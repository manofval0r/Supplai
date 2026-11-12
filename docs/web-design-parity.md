# Web design parity brief

**Owner:** Akolo (web)
**Canonical source:** `apps/mobile` (owned by David)
**Last verified:** 11 November 2026 against `origin/main` at `ad7a9cd`
**Goal:** bring `apps/web` to visual parity with the shipped mobile app, without changing mobile, API contracts, or shared packages.

---

## 1. The one rule

The mobile app defines the **look**. The web defines the **layout**.

That means colour, type, radius, elevation, illustration style, and component shape come from `apps/mobile`. Only breakpoint behaviour, page shell width, focus rings, and browser-only affordances are allowed to differ.

When in doubt, open the mobile screenshot for that screen and match it.

---

## 2. Canonical design system files

Read these before touching `apps/web`. Do not invent a second system.

| What                                       | File                                                                | Why it wins                                                                            |
| ------------------------------------------ | ------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Colour, theme, spacing, motion, app config | `apps/mobile/lib/theme.ts`                                          | Single source of truth for light and dark                                              |
| Shared primitives and icons                | `apps/mobile/components/ui.tsx`                                     | Button, Press, Toggle, SegmentedControl, KV, all icons                                 |
| 2D line illustrations                      | `apps/mobile/components/LineArt.tsx`                                | `ArtName` set: cyclist, sachet, blister, clinic, crate, route, pills, handover, shield |
| 3D product stage                           | `apps/mobile/components/Stage3D.tsx` and `apps/mobile/lib/three/`   | Material colours and lighting                                                          |
| Brand assets and native colours            | `apps/mobile/app.json` plus `apps/mobile/assets/`                   | Icon, adaptive icon background `#1558C9`, splash, EAS project                          |
| Screen structure                           | `apps/mobile/screens/*.tsx`                                         | Facility, rider, activity, account, settings, dev menu                                 |
| Navigation shell                           | `apps/mobile/App.tsx` and `apps/mobile/components/FloatingDock.tsx` | Dock shape, active pill, screen order                                                  |

`apps/web` is a copy of these files plus web patches. It is not a separate design.

---

## 3. Current drift, in one paragraph

`apps/web/lib/theme.ts` was retinted to a warm cream, forest green, and amber system (`#FFF4D6`, `#0B5240`, `#FFC700`) and primitives were reshaped into pill buttons with 2px ink borders. The mobile app is white, ink, cobalt, and lime (`#ffffff`, `#030407`, `#1558C9`, `#D4FF24`) with 16 to 22 radius corners and almost no hard borders. The landing page and login page also use the warm system, so the web currently looks like a different product from the app.

Everything else in `apps/web` is structurally close to mobile and can be re-synced file by file.

---

## 4. Colour tokens

### 4.1 Shared palette

| Token                                                           | Mobile (use this) | Web now      | Action  |
| --------------------------------------------------------------- | ----------------- | ------------ | ------- |
| `midnight`                                                      | `#030407`         | `#071811`    | Replace |
| `cobalt`                                                        | `#1558C9`         | `#0B5240`    | Replace |
| `lime`                                                          | `#D4FF24`         | `#FFC700`    | Replace |
| `limeInk`                                                       | `#030407`         | `#17140C`    | Replace |
| `red`                                                           | `#e5484d`         | `#B42318`    | Replace |
| `green`                                                         | `#12a36b`         | `#0B5240`    | Replace |
| `forest`, `yellow`, `orange`, `pink`, `sky`, `lavender`, `mint` | Do not exist      | Added on web | Delete  |

### 4.2 Light theme

| Token           | Mobile                      | Web now                     |
| --------------- | --------------------------- | --------------------------- |
| `bg`            | `#ffffff`                   | `#FFF4D6`                   |
| `bgSoft`        | `#f4f6fa`                   | `#FFF0CC`                   |
| `tile`          | `#f2f4f8`                   | `#ffffff`                   |
| `tileHover`     | `#e8ecf4`                   | `#FFF9E8`                   |
| `surface`       | `#ffffff`                   | `#ffffff`                   |
| `ink`           | `#030407`                   | `#111410`                   |
| `mute`          | `#646f82`                   | `#4B5A51`                   |
| `line`          | `#e6e9ef`                   | `#D8CBB1`                   |
| `cobalt`        | `#1558C9`                   | `#0B5240`                   |
| `cobaltSoft`    | `#e9f0fd`                   | `#DDECE4`                   |
| `lime`          | `#D4FF24`                   | `#FFC700`                   |
| `limeInk`       | `#030407`                   | `#17140C`                   |
| `artStroke`     | `#1558C9`                   | `#0B5240`                   |
| `artFill`       | `#dde7fb`                   | `#DDECE4`                   |
| `artHighlight`  | `#D4FF24`                   | `#FFC700`                   |
| `dockBg`        | `rgba(255, 255, 255, 0.94)` | same                        |
| `dockBorder`    | `rgba(3, 4, 7, 0.08)`       | `rgba(17, 20, 16, 0.16)`    |
| `dockActiveBg`  | `#1558C9`                   | `#0B5240`                   |
| `dockActiveInk` | `#ffffff`                   | `#ffffff`                   |
| `red`           | `#e5484d`                   | `#B42318`                   |
| `heroTileBg`    | `#030407`                   | `#0B5240`                   |
| `heroSubColor`  | `rgba(255, 255, 255, 0.68)` | `rgba(255, 255, 255, 0.82)` |

### 4.3 Dark theme

| Token           | Mobile                    | Web now                   |
| --------------- | ------------------------- | ------------------------- |
| `bg`            | `#030407`                 | `#081811`                 |
| `bgSoft`        | `#0b0e15`                 | `#0D2118`                 |
| `tile`          | `#10131c`                 | `#13271E`                 |
| `tileHover`     | `#171b27`                 | `#1B3428`                 |
| `surface`       | `#0d1018`                 | `#102219`                 |
| `ink`           | `#f5f7fb`                 | `#F8F5EC`                 |
| `mute`          | `#8b95a7`                 | `#C4CEC5`                 |
| `line`          | `#1b2030`                 | `#30463A`                 |
| `cobalt`        | `#1558C9`                 | `#16745A`                 |
| `cobaltSoft`    | `rgba(21, 88, 201, 0.22)` | `rgba(22, 116, 90, 0.25)` |
| `lime`          | `#D4FF24`                 | `#FFD44D`                 |
| `artStroke`     | `#D4FF24`                 | `#BFE5D0`                 |
| `artFill`       | `rgba(21, 88, 201, 0.42)` | `rgba(22, 116, 90, 0.36)` |
| `artHighlight`  | `#1558C9`                 | `#FFD44D`                 |
| `dockBg`        | `rgba(16, 19, 28, 0.94)`  | `rgba(19, 39, 30, 0.96)`  |
| `dockActiveBg`  | `#D4FF24`                 | `#FFD44D`                 |
| `dockActiveInk` | `#030407`                 | `#17140C`                 |
| `red`           | `#ff5c61`                 | `#FF8A80`                 |
| `heroTileBg`    | `#1558C9`                 | `#0B5240`                 |

### 4.4 Do this, not that

1. Copy `apps/mobile/lib/theme.ts` over `apps/web/lib/theme.ts`.
2. Then remove every import of `designTokens`. It is a web-only addition and will no longer exist and will fail typecheck. Replace with `colors.*` inside components, or the literal mobile value in `StyleSheet.create`.
3. Do not keep a second palette for the landing page.

Files importing `designTokens` today, all of which need a follow-up edit:

- `apps/web/components/AnimatedSplash.tsx`
- `apps/web/components/FloatingDock.tsx`
- `apps/web/components/OsmMap.tsx`
- `apps/web/components/RolePicker.tsx`
- `apps/web/components/ui.tsx`
- `apps/web/screens/AccountScreen.tsx`
- `apps/web/screens/ActivityScreen.tsx`
- `apps/web/screens/FacilityScreen.tsx`

---

## 5. Shape, borders, and elevation

The mobile app uses soft corners and almost no outlines. The web currently uses pill buttons and outlined cards.

| Element                 | Mobile                                     | Web now                                                            | Fix                                    |
| ----------------------- | ------------------------------------------ | ------------------------------------------------------------------ | -------------------------------------- |
| `Button`                | height 54, `borderRadius: 16`, no border   | `minHeight: 54`, `borderRadius: 999`, `borderWidth: 2`, ink border | Restore mobile values                  |
| `Press`                 | scale spring, no outline                   | adds `className` and accessibility state                           | Keep accessibility, drop visual border |
| Activity cards          | radius 18 to 22, no border                 | 2px ink border plus radius tokens                                  | Remove border                          |
| Account rows and groups | radius 16 to 20, no border                 | 2px ink border plus radius tokens                                  | Remove border                          |
| Facility cards          | radius 18 to 22, no border                 | 2px ink border                                                     | Remove border                          |
| Legacy `theme.radii`    | 6, 8, 12, 16, 9999                         | unchanged                                                          | Keep                                   |
| Legacy `theme.borders`  | 1.5, 2, 3, ink `#030407`                   | unchanged                                                          | Keep for icon strokes, not for cards   |
| Legacy `theme.shadows`  | hard offset 2 to 4 px, opacity 1, radius 0 | unchanged                                                          | Keep for art and dock only             |

Keep a visible keyboard focus ring on web. Use `outline: 2px solid #1558C9` with offset, applied through `:focus-visible` in `apps/web/app/styles.css`. Do not use the ink border as a substitute for focus.

---

## 6. Web-only patches that must survive the re-sync

These are legitimate web adaptations. Re-apply them after copying any file from mobile. Nothing else should differ.

1. `nativeID` hooks used by `apps/web/app/styles.css`: `web-app-shell`, `web-dock`, `web-dock-wrap`, `web-role-body`, `web-role-headline`, `web-role-bento`, `web-role-row`, `web-role-request`, `web-role-release`, `web-role-track`, `web-role-idle`, `web-activity-content`, `web-activity-title`, `web-activity-stats`, `web-activity-filters`, `web-activity-live`, `web-activity-earlier`, `web-account-screen`, `web-facility-screen`.
2. Desktop shell in `apps/web/app/styles.css`: at `min-width: 700px`, centre content at `max-width: 1480px`, two-column bento grid, larger headings. This is allowed because mobile screenshots only define the phone layout.
3. Sign-out: `onSignOut` prop in `apps/web/App.tsx` and `apps/web/screens/AccountScreen.tsx`, routing to `/`.
4. Browser APIs: `Notification` in `apps/web/lib/notifications.ts`, iframe map in `apps/web/components/OsmMap.tsx`, `THREE.WebGLRenderer` with a real canvas in `apps/web/components/Stage3D.tsx`.
5. `Apps/web` route shell: `/` landing, `/login`, `/dashboard`. Keep.
6. Accessibility props: `accessibilityRole`, `accessibilityState`, `aria` labels, `prefers-reduced-motion` blocks.

Do not port from mobile:

- `expo-notifications` and `expo-haptics`
- `react-native-webview` map wrapper
- `expo-gl` renderer
- safe-area insets beyond the small mobile gutter

---

## 7. Screen-by-screen parity

Re-sync order matters because primitives cascade.

1. `lib/theme.ts`
2. `components/ui.tsx`
3. `components/LineArt.tsx`
4. `components/BrandLogo.tsx`
5. `components/FloatingDock.tsx`
6. `components/RolePicker.tsx`
7. `components/AnimatedSplash.tsx`
8. `components/NotificationInbox.tsx`
9. `components/ScenarioLabRunner.tsx`
10. `screens/FacilityScreen.tsx`
11. `screens/RiderScreen.tsx`
12. `screens/ActivityScreen.tsx`
13. `screens/AccountScreen.tsx`
14. `components/Stage3D.tsx` and `lib/three/`
15. `components/OsmMap.tsx`

For each file, diff mobile against web first:

```powershell
git diff --no-index apps/mobile/components/ui.tsx apps/web/components/ui.tsx
```

The expected surviving diff after the port is only the web-only patches in section 6. Any colour, radius, or font difference is a bug.

### Screens and their references

| Screen              | Mobile reference                                                                                                                                                                                                     | What must match                                                                                |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Home (RolePicker)   | `128-light-default-live.png`, `80-v2-mobile-home-live.png`, `149-home-after-fresh-bundle.png`                                                                                                                        | White page, black headline, pale blue tiles, black tracking card, lime ETA, cobalt dock pill   |
| Home dark           | `85-v2-mobile-home-dark-live.png`                                                                                                                                                                                    | Near-black canvas, cobalt hero tile, lime active dock pill                                     |
| Request stock, ORS  | `90-v2-mobile-request-ors-live.png`                                                                                                                                                                                  | White segmented control thumb, cobalt primary CTA, lime stock bar, lime ETA chip               |
| Request stock, zinc | `91-v2-mobile-request-zinc-live.png`                                                                                                                                                                                 | Same, zinc blister art                                                                         |
| Release surplus     | `92-v2-mobile-release-live.png`                                                                                                                                                                                      | Sealed crate art, cobalt CTA, KV rows without card borders                                     |
| Delivery map        | `93-v2-mobile-live-delivery-map.png`                                                                                                                                                                                 | Light grey map, cobalt route, lime source label, black destination label, white bottom sheet   |
| Handover            | `94-v2-mobile-handover-native-keyboard.png`, `95-v2-mobile-handover-confirmed-live.png`                                                                                                                              | PIN slots, confirmation state                                                                  |
| Activity            | `151-activity-screen.png`, `150-activity-tab-3d.png`, `81-v2-mobile-activity-live.png`                                                                                                                               | Stat tiles, white segmented control, black live card, lime progress, bordered-none list groups |
| Account hub         | `100-v2-account-hub-separated.png`, `110-v2-mobile-live.png`, `82-v2-mobile-account-live.png`                                                                                                                        | Avatar with lime ring, grouped rows, red sign out                                              |
| Settings            | `101-v2-settings-pure.png`, `83-v2-mobile-settings-light-live.png`, `84-v2-mobile-settings-dark-live.png`                                                                                                            | Light and dark parity                                                                          |
| Developer menu      | `102-v2-developer-menu-pure.png`, `119-v2-dev-menu-top.png`, `98-v2-developer-menu-top-live.png`, `99-v2-developer-menu-bottom-live.png`                                                                             | Section order, segmented control, cobalt and lime test buttons                                 |
| Support             | `111-v2-support-hub.png`, `88-v2-mobile-support-live.png`                                                                                                                                                            | Hub rows                                                                                       |
| Safety              | `89-v2-mobile-safety-live.png`                                                                                                                                                                                       | Rules and seal states                                                                          |
| Payment             | `86-v2-mobile-payment-live.png`                                                                                                                                                                                      | Simulated wallet, labelled as simulated                                                        |
| Saved places        | `87-v2-mobile-saved-places-live.png`                                                                                                                                                                                 | List and selected state                                                                        |
| Chat assistant      | `112-v2-chat-assistant-screen.png`, `113-v2-chat-nearby-stock-response.png`, `114-v2-chat-safety-rules.png`, `116-v2-chat-safety-rules-rendered.png`                                                                 | User bubble cobalt, assistant bubble tile, inline stock card                                   |
| Scenario Lab        | `119-v2-dev-scenario-runner.png`, `120-v2-scenario-safety-floor-blocked.png`, `121-v2-scenario-broken-seal-refusal.png`, `122-v2-scenario-demand-shock-lga-buffer.png`, `123-v2-scenario-demand-shock-completed.png` | Step card, evidence block, Next, Replay, Reset                                                 |
| Splash              | `96-v2-animated-splash-live.png`, `97-v2-home-after-splash-live.png`                                                                                                                                                 | Dark ink or white canvas, brand mark, no warm cream                                            |

Screenshot paths at `origin/main` are under `Phase-5-Refined-Chowdeck-Bento-v2/`. Local duplicates live in `artifacts/screenshots/`. All are 1080 by 2424 phone captures, so treat them as mobile reference only. Do not stretch them to desktop.

`130-facility-request-procedural-3d.png` is not a design reference. It shows the Expo developer overlay. Use `140-facility-request-stage3d.png` for the request screen.

---

## 8. Map

`apps/web/components/OsmMap.tsx` was recoloured. Restore the mobile values.

| Item                  | Mobile                                                    | Web now                                                    |
| --------------------- | --------------------------------------------------------- | ---------------------------------------------------------- |
| Tile filter, light    | `saturate(.72) contrast(.97) brightness(1.03)`            | `saturate(.58) sepia(.18) contrast(.96) brightness(1.03)`  |
| Map background, light | `#e8ecf2`                                                 | `#FFF4D6`                                                  |
| Map background, dark  | `#0b0e15`                                                 | `#081811`                                                  |
| Route casing          | `#ffffff`, weight 11                                      | background cream, weight 11                                |
| Route                 | `#1558C9`, weight 6                                       | `#0B5240`, weight 6                                        |
| Source marker         | lime background `#D4FF24`, ink text, radius 16, no border | yellow background, 2px ink border, radius 999, hard shadow |
| Destination marker    | `#030407` background, white text, radius 16               | forest background, 2px ink border, radius 999              |
| Puck                  | cobalt core, lime ring                                    | forest core, yellow ring                                   |

Keep the iframe implementation and the `postMessage` progress bridge. Only the styling changes.

---

## 9. 3D stage

`apps/web/components/Stage3D.tsx` uses Three.js with a DOM canvas. The geometry is correct. The materials were retinted. Match mobile.

| Web value  | Mobile value                        | Use                                     |
| ---------- | ----------------------------------- | --------------------------------------- |
| `0x0b5240` | `0x1558c9`                          | Brand plates and crate body             |
| `0xffc700` | `0xd4ff24`                          | Cross, arrow, badge, beacon, highlights |
| `0xddece4` | `0xdde7fb`                          | Soft fills                              |
| `0xfffdf5` | `0xf8faff`                          | Sachet and card stock                   |
| `0xbfe5d0` | match the rim light block in mobile | Rim light                               |
| `0xd8cbb1` | remove                              | Warm line                               |

Best method: copy the equivalent material block from `apps/mobile/components/Stage3D.tsx`, then keep the web renderer setup. Do not copy the `expo-gl` context.

---

## 10. Landing page and login

`apps/web/app/site-pages.css` (37 KB) and `apps/web/app/styles.css` carry the warm cream and forest identity. This is the largest remaining visual mismatch.

Rules:

- Page background: `#ffffff`.
- Primary text: `#030407`.
- Muted text: `#646f82`.
- Lines and dividers: `#e6e9ef`.
- Primary action: cobalt `#1558C9` with white label.
- Accent and highlight only: lime `#D4FF24`, used like the app uses it, not as a large background.
- Soft surfaces: `#f4f6fa` and `#e9f0fd`.
- Dark sections: `#030407`.
- No cream `#FFF4D6`, no forest `#0B5240`, no amber `#FFC700`.
- Buttons follow the app: 16 radius, no 2px ink border. For a secondary button on white, use a `#f2f4f8` fill with ink label.
- Keep the existing layout, type scale, and brand mark. This is a retheme, not a redesign.
- Keep `prefers-reduced-motion` rules.

Login is part of the same product. It should look like the app, not like a separate marketing site.

### 10.1 Demo labelling

Every surface that shows fixture data must say so in the UI, not only in the README.

- Landing hero: `Demo build. Facilities, stock, riders, and deliveries are fictional.`
- Login footer: `Fictional facilities, stock, and deliveries`.
- Dashboard: a persistent top banner, `Demo data. All facilities, stock, riders, and deliveries are fictional.`
- Scenario Lab and any API-fallback banner: the same `Demo data` and `Fictional scenario` wording.
- Payment, dispatch, and notifications: keep `Simulated` on paid or partner-dependent services.

The banner must not cover the app shell or push the dock off screen. Keep it in normal flow above the shell.

### 10.2 App preview section

The landing page includes an interactive preview of the Expo app, not a static mockup.

- Component: `apps/web/components/AppPreview3D.tsx`.
- Renders a Three.js phone with five screen textures: Home, Request, Release, Handover, Activity.
- Textures live in `apps/web/public/preview/` and come from `140-facility-request-stage3d.png`, `92-v2-mobile-release-live.png`, `72-mobile-handover-pin-live.png`, `81-v2-mobile-activity-live.png`, and `128-light-default-live.png`.
- Drag rotates the phone. Tab buttons flip the screen texture. Pointer hover tilts it.
- `prefers-reduced-motion` disables idle float and hover tilt but keeps drag.
- WebGL failure falls back to a plain image of the active screen.
- The download button reads `NEXT_PUBLIC_EXPO_PREVIEW_URL` and opens the latest build or Expo project page. No build URL is committed in source.
- Tabs are real buttons with `role="tab"`, `aria-selected`, visible focus, and an `aria-live` caption.

### 10.3 Tests and environment

`apps/web` owns its tests. They run with public configuration only.

```powershell
npm test -w @supplai/web
```

- Vitest config: `apps/web/vitest.config.ts`.
- Tests live in `apps/web/tests/`.
- Covered now: API base resolution from `NEXT_PUBLIC_API_URL` then `EXPO_PUBLIC_API_URL` then localhost; `.env.example` contains only `NEXT_PUBLIC_` keys and placeholder secrets.
- Required next: loading, populated, empty, error, and critical exception states through the fixture adapter.
- The web app must never hold a server secret. Supabase, SMS, and delivery secrets stay in the API environment.
- `.env.example` is tracked; real `.env` files are not.

### 10.4 LGA decision surface

`ad7a9cd` removed the old operations console and `apps/web` has no LGA view. Judges still need to see the authority decision.

Add one minimal, read-only surface at `/lga` using existing endpoints only:

- `GET /api/lga/overview`
- `GET /api/lga/transfers`
- `GET /api/transfers/:reference`
- `GET /api/operations/failures`
- One release action through the existing `POST /api/orders/:reference/actions`

The surface shows the priority queue, why each item needs attention, the next accountable owner, safety-floor and batch/expiry evidence, and the release or escalation result. Keep it read-only except for that one action. Do not add endpoints, contracts, or mobile changes, and do not restore `apps/dashboard`.

### 10.5 Companion duties for Akolo

- Keep `apps/web/README.md` true: routes, env, tests, 3D, and build commands.
- Keep `vercel.json` pointed at `apps/web`.
- Capture 390 and 1440 screenshots for every finished route and commit them under `docs/screenshots/web/`.
- Update `artifacts/plans/AKOLO-PLAN.md` after each session with what changed, what is blocked, and the next verifiable action.
- Join all three rehearsals and log visual or integration failures.

---

## 11. Definition of done

Run these from the repo root.

```powershell
npm run typecheck -w @supplai/web
npm test -w @supplai/web
npm run build -w @supplai/web
npm run dev -w @supplai/web
```

Then confirm all of the following.

- [ ] `apps/web/lib/theme.ts` is byte-identical to `apps/mobile/lib/theme.ts`.
- [ ] `rg "designTokens" apps/web` returns nothing.
- [ ] `rg "0B5240|FFC700|FFF4D6|081811|designTokens" apps/web --glob "*.tsx" --glob "*.ts" --glob "*.css"` returns nothing.
- [ ] At 390 by 844, home matches `128-light-default-live.png`: white canvas, cobalt dock pill, lime ETA, no card borders, no pill CTA.
- [ ] At 390 by 844, request stock matches `90-v2-mobile-request-ors-live.png`.
- [ ] At 390 by 844, activity matches `151-activity-screen.png`.
- [ ] At 390 by 844, account matches `100-v2-account-hub-separated.png`.
- [ ] Dark mode matches `85-v2-mobile-home-dark-live.png` and `84-v2-mobile-settings-dark-live.png`.
- [ ] At 1440 by 900, the shell is centred at 1480 max, bento is two columns, and nothing stretches to full width.
- [ ] Map route is cobalt, source label is lime, destination label is black.
- [ ] Landing and login use the app palette.
- [ ] Keyboard focus is visible on every interactive element.
- [ ] No horizontal scroll at 320, 390, 768, 1024, 1440.
- [ ] Fresh screenshots are saved for every route at 390 and 1440.
- [ ] `Demo data` is visible on the dashboard, landing, login, Scenario Lab, and API fallback.
- [ ] The app preview renders five screens, rotates on drag, and flips screens from the tabs.
- [ ] The preview download link comes from `NEXT_PUBLIC_EXPO_PREVIEW_URL`.
- [ ] `npm test -w @supplai/web` passes and `apps/web` has no server secret in any file.
- [ ] `/lga` shows one decision from existing endpoints only and changes no contract.

---

## 12. Copy-paste brief for your agent

```text
You are updating apps/web to match apps/mobile, which is canonical.

Read apps/mobile/lib/theme.ts, apps/mobile/components/ui.tsx,
apps/mobile/components/LineArt.tsx, and apps/mobile/app.json first.

1. Replace apps/web/lib/theme.ts with the mobile file verbatim.
2. Remove every designTokens import in apps/web and replace each use with
   the mobile token or the mobile literal value.
3. Revert pill buttons and 2px ink borders in apps/web/components/ui.tsx and
   in the card styles of Activity, Account, and Facility. Mobile uses
   height 54, radius 16 buttons, and radius 18 to 22 cards without borders.
4. Re-sync each screen and component from mobile, then re-apply only these
   web patches: nativeID hooks, the 700px desktop grid in app/styles.css,
   onSignOut, browser Notification, iframe map, WebGL canvas renderer,
   and accessibility props.
5. Restore the mobile map colours and filters in components/OsmMap.tsx.
6. Replace 0x0b5240 with 0x1558c9 and 0xffc700 with 0xd4ff24 in
   components/Stage3D.tsx, and match the remaining material blocks to mobile.
7. Retheme app/site-pages.css and app/styles.css from cream and forest to
   white, ink, cobalt, and lime.
8. Do not edit apps/mobile, apps/api, packages, or supabase.
9. Keep the Three.js app preview and its env-driven Expo link. Extend it,
   do not replace it with a static image.
10. Add a minimal read-only /lga surface from the existing endpoints in
    section 10.4. No new endpoints and no contract changes.
11. Add tests for the states listed in section 10.3, public env only.
12. Run typecheck, tests, and build for @supplai/web, then compare against
    the screenshots listed in docs/web-design-parity.md.
```

---

## 13. Non-goals

- No new features, except the preview section in 10.2 and the read-only LGA surface in 10.4.
- No API or contract changes.
- No dependency additions beyond what the preview and tests already use (`three` and `vitest` are installed).
- No mobile edits.
- No copy rewrite beyond removing warm-system wording and adding demo labels.
- No change to the Scenario Lab data or the seven outcomes.
