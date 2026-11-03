// Builds the send-ready PPTX from the exported 3200×1800 slide renders.
// Pixel-identical to supplai_deck.html — no re-typesetting, no drift.
const pptxgen = require('pptxgenjs');
const fs = require('fs');
const path = require('path');

const W = 13.333,
  H = 7.5; // 16:9 inches, matches 1600×900 at 120 px/in
const SRC = path.join(__dirname, 'pptx', 'slides');
const OUT = path.join(
  __dirname,
  'Supplai — GBSN Social Logistics Challenge 2026.pptx',
);
const BG = '0A0908';

const slides = [
  {
    file: 's1.png',
    alt: 'Title slide: Supplai, a carton across the road could save a life. Photograph of mothers waiting at a child clinic in Lagos, 1930.',
    notes:
      'Supplai — peer-to-peer medicine sharing between Nigerian primary health centres. The claim: a carton four kilometres away can end a stockout the same day, and the receiving clinic confirms the shelf before a rider moves.',
  },
  {
    file: 's2.png',
    alt: 'Problem slide: 36.2% of essential medicines available, 20,000 facilities on paper, 14-day order-to-delivery lag.',
    notes:
      '36.2% mean availability of essential medicines at primary health centres. Around 20,000 facilities still record stock on paper. A fortnight or more between order and delivery is the strongest predictor of stockout — the gap is noticed too late to fix.',
  },
  {
    file: 's3.png',
    alt: 'Slide showing two clinics four kilometres apart: one stocked out, one holding surplus that will expire.',
    notes:
      'Redistribution between neighbouring facilities is already government guidance. Nothing executes it at the public PHC tier, where phones are basic and records are paper. Clinic A is empty while Clinic B holds 31 units it will write off.',
  },
  {
    file: 's4.png',
    alt: 'Slide listing three failures — paper records, bimonthly ordering, stale inventory data — and the line: the failure is not ignorance, it is latency.',
    notes:
      'Paper bin cards drift from the shelf. Bimonthly ordering means a gap on day three waits for the next cycle, then two more weeks. System records run 70–87% accurate, so a clinic promises stock its own database says exists. The failure is latency, not ignorance.',
  },
  {
    file: 's5.png',
    alt: 'Six-step flow — report, match, find, confirm, deliver, record — with an SMS exchange and a motorcycle rider.',
    notes:
      'The nurse texts a shortcode. Fuzzy matching normalises the drug name. Nearby surplus is located. Each holder is asked to check the physical shelf and reply yes or no. A rider moves it the same day. Both records update from the confirmed transfer.',
  },
  {
    file: 's6.png',
    alt: 'Slide arguing a real gap, not a crowded space, with five design properties of the service.',
    notes:
      'Existing players serve private pharmacies, hospital networks or donated stock. None runs a peer-to-peer exchange between public primary health centres on basic phones. OpenLMIS is already in Nigeria and credited with saving 850,000 doses; we connect to it rather than replace it.',
  },
  {
    file: 's7.png',
    alt: 'Open-source stack: OpenBoxes/OpenLMIS for inventory, Fleetbase for dispatch, Africa\u2019s Talking for messaging, RxNorm and pg_trgm for matching.',
    notes:
      'Four proven open-source parts. We build the thin connecting layer: matching, routing and the confirmation logic that makes them behave as one service.',
  },
  {
    file: 's8.png',
    alt: 'Payer table: pharmacies 12,000 naira monthly, LGA health 150,000 per LGA, public clinics free, riders 1,000 per verified drop.',
    notes:
      'We never sell the medicine — only movement and visibility. Pharmacies pay 12,000 naira a month, LGAs 150,000. Fifteen to eighteen pharmacy subscribers fund one rider at 176 deliveries a month, so public clinic transfers cost the clinic nothing.',
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
    'Peer-to-peer medicine stock sharing between Nigerian primary health centres';
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
