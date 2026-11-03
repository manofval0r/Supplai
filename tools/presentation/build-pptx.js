// Builds the send-ready PPTX from the exported 3200×1800 slide renders.
// Pixel-identical to supplai_deck.html — no re-typesetting, no drift.
const pptxgen = require('pptxgenjs');
const fs = require('fs');
const path = require('path');

const W = 13.333,
  H = 7.5; // 16:9 inches, matches 1600×900 at 120 px/in
const SRC = path.resolve(__dirname, '../../artifacts/deck/pptx/slides');
const OUT = path.join(
  path.resolve(__dirname, '../../artifacts/deck'),
  'Supplai — GBSN Social Logistics Challenge 2026.pptx',
);
const BG = '0A0908';

const slides = [
  {
    file: 's1.png',
    alt: 'Title slide: Supplai, LGA-authorised emergency exception control for primary-health-centre medicine stockouts.',
    notes:
      'Supplai is an app-first, fictional-demo prototype for LGA-authorised emergency exception control. A designated source custodian confirms shelf stock, then an authorised release precedes any simulated rider movement.',
  },
  {
    file: 's2.png',
    alt: 'Problem slide: operational stockouts surface too late to act safely; all quantitative claims require source verification.',
    notes:
      'Use Farid’s source-verified problem statistics only. The product story is the operational gap between an urgent request, actual source shelf stock, authorised release, and accountable handover.',
  },
  {
    file: 's3.png',
    alt: 'Slide showing a fictional emergency request and an eligible ambient-stock decision.',
    notes:
      'The demonstrator uses fictional facilities and ambient tracer commodities. It tests the assumption that authorised, usable nearby stock may exist without portraying real transfer permission.',
  },
  {
    file: 's4.png',
    alt: 'Slide listing stale stock records, delayed escalation, and unclear accountability as workflow risks.',
    notes:
      'The workflow treats a stock record as a lead, not permission to move. Source confirmation, safety floors, batch/expiry, release authority, and receiving inspection make operational uncertainty visible.',
  },
  {
    file: 's5.png',
    alt: 'Six-gate flow: request, eligibility, protection, source confirmation, authorised release, and receipt.',
    notes:
      'The mobile app is primary. Simulated SMS or WhatsApp intake creates the same canonical order. The source custodian confirms available stock, an LGA/pharmacist role releases it, and receipt closes or escalates the transfer.',
  },
  {
    file: 's6.png',
    alt: 'Slide showing the product’s authority, safety, and scenario-testing design properties.',
    notes:
      'Supplai is not presented as a marketplace. It is a controlled emergency exception workflow. Any comparison, local-system, or partner claim is withheld until Farid validates it.',
  },
  {
    file: 's7.png',
    alt: 'Demonstration architecture: Expo, Fastify, Supabase, simulated channels, and a Scenario Lab.',
    notes:
      'The low-cost build uses a role-based Expo app, Fastify, Supabase, a simulated messaging boundary, and a deterministic Scenario Lab. No live provider, carrier, or medicine movement is implied.',
  },
  {
    file: 's8.png',
    alt: 'Validation table for future carrier, authority, donor-protection, and receiving-handover assumptions.',
    notes:
      'Economics are modelled rather than priced. A future pilot must validate the cost per authorised handover, carrier terms, funding pathway, and safeguards against donor depletion.',
  },
  {
    file: 's9.png',
    alt: 'Roadmap from 1 November to 7 December, closing with: a carton across the road could save a life. Let us move it.',
    notes:
      'Registration opens 1 November, submissions close 15 November, finals 1–2 December, winner announced 7 December.',
  },
];

(async () => {
  const pptx = new pptxgen();
  pptx.defineLayout({ name: 'SUPPLAI_16x9', width: W, height: H });
  pptx.layout = 'SUPPLAI_16x9';
  pptx.author = 'Supplai';
  pptx.company = 'Supplai';
  pptx.title = 'Supplai — GBSN Social Logistics Challenge 2026';
  pptx.subject =
    'LGA-authorised emergency exception control for primary-health-centre medicine stockouts';
  pptx.lang = 'en-GB';

  for (const s of slides) {
    const file = path.join(SRC, s.file);
    if (!fs.existsSync(file)) throw new Error('missing render: ' + file);
    const slide = pptx.addSlide();
    slide.background = { color: BG };
    slide.addImage({ path: file, x: 0, y: 0, w: W, h: H, altText: s.alt });
    slide.addNotes(s.notes);
  }

  await pptx.writeFile({ fileName: OUT });
  const kb = Math.round(fs.statSync(OUT).size / 1024);
  console.log(
    'wrote ' +
      path.basename(OUT) +
      '  (' +
      slides.length +
      ' slides, ' +
      kb +
      ' KB)',
  );
})();
