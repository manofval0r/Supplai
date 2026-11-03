# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

static HTML/CSS (single self-contained file); user requested HTML over pptx for this surface; deploy target is browser + print-to-PDF.

## Users

Primary: GBSN Social Logistics Challenge judges (health/humanitarian supply chains track) and the team's partner. Situation: evaluating a 90-second-to-three-minute pitch deck for a student competition; decision criteria are strength of analysis and creativity of the proposed business solution. Secondary: potential riders, nurses, LGA health officers (named in the solution but not the deck's immediate audience).

## Product Purpose

A pitch deck for Supplai, a lateral medicine stock-sharing network for Nigerian primary health centres. It must make judges believe, on one screen, that PHC stockouts are a real, documented national problem and that confirm-before-dispatch SMS stock-sharing is the fix, then earn their vote/action (submission by Nov 15, 2026).

## Positioning

Confirm-before-dispatch: the clinic receiving a transfer must reply Y/N before a rider moves stock, attacking the documented stale-record failure mode (LMIS inventory accuracy 70–87%). Competitors (SIRUM, InStockRx, MedCycle, Remedial Health) serve private pharmacies or donations; none serve Nigeria's ~20,000 public PHCs on basic phones. Builds on DHIS2/OpenLMIS (already in Nigeria; saved 850,000 vaccine doses) instead of replacing it.

## Operating Context

Viewed as projected slides in a pitch room and as a self-contained HTML file opened in a browser or printed to PDF. No backend; no live data; speaker-carried narrative.

## Capabilities and Constraints

- Nine-slide narrative: title → problem → surplus paradox → why systems fail → solution flow → why it wins → open-source stack → sustainability → roadmap.
- Dark mode only; warm/espresso editorial palette; Georgia headings, Calibri body; no borders, no harsh shadows, no repeated layout, no thin rules, no gradients, no glass, no emoji, no icon-topped feature cards.
- Double-bezel cards (outer shell + inner core), macro whitespace, eyebrow tags, short accent rules.
- All statistics trace to report.md / report.pdf (NBS survey 36.2% availability; contraceptive stockout 41.7%, OR 1.76; LMIS accuracy 70–87%; OpenLMIS 850,000 doses).
- No invented testimonials, customers, benchmarks, pricing, or licensing claims.
- Single HTML file, printable one slide per page; keyboard + dot + prev/next navigation.

## Brand Commitments

Name: Supplai. Tagline concept: "A carton across the road could save a life. Let's move it." Date: 29 October 2026. Health track, SDG 3.8. Judge Dr. Obiora Madu (Nigeria). Prizes $5k / $1k / $1k; registration Nov 1, submission Nov 15, finals Dec 1–2, winner Dec 7.

## Evidence on Hand

report.md (research report, 3 rounds, 13 search angles) and report.pdf (6-page dark PDF) at project root; all deck statistics cite these.

## Product Principles

1. One idea per screen; the argument order is the section order.
2. Size contrast is the main lever: one display size, one text size, one small size; nothing in between.
3. Dark ground is a scene decision, not a default: judges in a dimmed pitch room.
4. No ornament without substance; every section carries its full content.
5. Real data only; no fabricated proof.

## Accessibility & Inclusion

Dark-on-cream contrast meets WCAG AA for body text; keyboard navigable; reduced-motion safe; single file opens offline.
