// Dark-mode editorial deck for Supplai — GBSN Social Logistics Challenge
// High-end visual design: Editorial Luxury archetype, Double-Bezel cards,
// macro whitespace, eyebrow tags, Georgia headings, Calibri body.
// Palette: deep espresso (#0E0A07), warm cream ink (#F1E6D8), warm terracotta-gold accent (#C08962)
const pptxgenjs = require('pptxgenjs');
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const io = require('react-icons/io');
const md = require('react-icons/md');

const pptx = new pptxgenjs();
pptx.layout = 'LAYOUT_WIDE'; // 13.333 x 7.5 in

const BG = '0E0A07'; // deep espresso
const PANEL = '1B120A'; // outer bezel shell
const INNR = '261910'; // inner bezel core
const INK = 'F1E6D8'; // warm cream
const FADE = '9C8470'; // muted warm brown
const ACC = 'C08962'; // warm terracotta-gold
const ACCDK = '9E6A4A';
const WHT = 'FFFFFF';

const H = 'Georgia'; // artistic serif headings
const B = 'Calibri'; // safe body

const W = 13.333,
  Hh = 7.5;
const MX = 0.6;

const iconCache = {};
async function iconPng(Component, size = 26, color = ACC) {
  const key =
    (Component.displayName || Component.name || 'icon') +
    '|' +
    size +
    '|' +
    color;
  if (iconCache[key]) return iconCache[key];
  const svg = ReactDOMServer.renderToStaticMarkup(
    React.createElement(Component, { size, color }),
  );
  const buf = await sharp(Buffer.from(svg))
    .resize(size * 4, size * 4)
    .png()
    .toBuffer();
  iconCache[key] = buf;
  return buf;
}
function fresh(o) {
  return JSON.parse(JSON.stringify(o));
}

function bg(slide, color = BG) {
  slide.addShape('rect', {
    x: 0,
    y: 0,
    w: W,
    h: Hh,
    fill: { color },
    line: { type: 'none' },
    shadow: { type: 'none' },
  });
}

// Double-Bezel card: outer shell + inner core, no borders
function bezel(
  slide,
  {
    x,
    y,
    w,
    h,
    shell = PANEL,
    inner = INNR,
    pad = 0.22,
    outerR = 0.16,
    innerR = 0.09,
  },
) {
  rect(slide, {
    x,
    y,
    w,
    h,
    fill: shell,
    radius: outerR,
    shadow: { type: 'none' },
  });
  rect(slide, {
    x: x + pad,
    y: y + pad,
    w: w - 2 * pad,
    h: h - 2 * pad,
    fill: inner,
    radius: innerR,
    shadow: { type: 'none' },
  });
}
function rect(
  slide,
  { x, y, w, h, fill, line, radius, shadow = { type: 'none' } },
) {
  const opts = {
    x,
    y,
    w,
    h,
    rectRadius: radius || 0.06,
    line: line
      ? { color: line.color, width: line.width || 1 }
      : { type: 'none' },
    shadow: fresh(shadow),
  };
  if (fill) opts.fill = { color: fill };
  return slide.addShape('roundedRect', opts);
}
function text(
  slide,
  items,
  {
    x,
    y,
    w,
    h,
    align = 'left',
    valign = 'middle',
    margin = 0,
    wrap = true,
    lineSpacing = 1,
  } = {},
) {
  const arr = Array.isArray(items) ? items : [{ text: items }];
  return slide.addText(
    arr.map((it) => fresh({ text: it.text, ...it })),
    { x, y, w, h, align, valign, margin, wrap, autofit: false, lineSpacing },
  );
}
function eyebrow(slide, txt, x, y, w) {
  text(
    slide,
    [
      {
        text: txt,
        font: B,
        fontSize: 10,
        bold: true,
        color: ACC,
        charSpacing: 3,
      },
    ],
    { x, y, w, h: 0.26, margin: 0 },
  );
}
function titleBlock(slide, kicker, title, sub) {
  let y = 0.5;
  if (kicker) {
    eyebrow(slide, kicker, MX, y, 10);
    y += 0.42;
  }
  text(
    slide,
    [{ text: title, font: H, fontSize: 30, bold: true, color: INK }],
    { x: MX, y, w: 10.4, h: 0.95, margin: 0, wrap: false },
  );
  y += 1.05;
  if (sub) {
    text(
      slide,
      [{ text: sub, font: B, fontSize: 13.5, color: FADE, lineSpacing: 1.15 }],
      { x: MX, y, w: 10.4, h: 0.5, margin: 0 },
    );
    y += 0.62;
  }
  // short accent rule, not full width
  rect(slide, {
    x: MX,
    y: y - 0.1,
    w: 1.0,
    h: 0.04,
    fill: ACC,
    shadow: { type: 'none' },
  });
  return y + 0.35;
}
function footer(slide, n) {
  text(
    slide,
    [
      {
        text: 'Supplai · GBSN Social Logistics Challenge · Health Track',
        font: B,
        fontSize: 8.5,
        color: FADE,
      },
    ],
    { x: MX, y: 7.12, w: 6, h: 0.24, margin: 0 },
  );
  text(
    slide,
    [{ text: String(n), font: B, fontSize: 9, color: FADE, bold: true }],
    { x: W - MX - 0.5, y: 7.12, w: 0.5, h: 0.24, align: 'right', margin: 0 },
  );
}

async function main() {
  // ============ S1: Title ============
  {
    const s = pptx.addSlide();
    bg(s);
    // top accent hairline
    rect(s, { x: 0, y: 0, w: W, h: 0.1, fill: ACC, shadow: { type: 'none' } });
    rect(s, {
      x: 0,
      y: Hh - 0.1,
      w: W,
      h: 0.1,
      fill: ACC,
      shadow: { type: 'none' },
    });
    text(
      s,
      [
        {
          text: 'GBSN SOCIAL LOGISTICS CHALLENGE 2026  ·  HEALTH TRACK',
          font: B,
          fontSize: 10.5,
          bold: true,
          color: ACC,
          charSpacing: 3,
        },
      ],
      { x: MX, y: 1.15, w: 10, h: 0.3, margin: 0 },
    );
    text(
      s,
      [{ text: 'Supplai', font: H, fontSize: 60, bold: true, color: INK }],
      { x: MX, y: 1.6, w: 10, h: 1.3, margin: 0, wrap: false },
    );
    text(
      s,
      [
        {
          text: 'Lateral medicine stock-sharing for Nigerian primary health clinics',
          font: B,
          fontSize: 17,
          color: FADE,
          lineSpacing: 1.15,
        },
      ],
      { x: MX, y: 3.05, w: 9.2, h: 0.55, margin: 0 },
    );
    rect(s, {
      x: MX,
      y: 3.75,
      w: 1.1,
      h: 0.04,
      fill: ACC,
      shadow: { type: 'none' },
    });
    text(
      s,
      [
        {
          text: 'App-first · LGA-authorised · safety-aware · scenario-tested',
          font: B,
          fontSize: 12,
          color: FADE,
          italic: true,
        },
      ],
      { x: MX, y: 3.95, w: 10, h: 0.35, margin: 0 },
    );
    text(
      s,
      [
        {
          text: 'SDG 3.8  ·  29 October 2026',
          font: B,
          fontSize: 10.5,
          color: FADE,
        },
      ],
      { x: MX, y: 6.4, w: 10, h: 0.3, margin: 0 },
    );
    s.addNotes(
      'Title. Editorial Luxury dark treatment. Problem: Nigerian PHC stockouts. Solution: peer-to-peer lateral stock sharing.',
    );
  }

  // ============ S2: Problem (asymmetrical) ============
  {
    const s = pptx.addSlide();
    bg(s);
    const y = titleBlock(
      s,
      'The problem',
      'Stockouts at Nigerian primary health centres',
      'Only about a third of essential medicines are actually on PHC shelves',
    );
    // left: narrative block inside a bezel
    bezel(s, {
      x: MX,
      y,
      w: 5.55,
      h: 3.1,
      shell: PANEL,
      inner: INNR,
      pad: 0.3,
      outerR: 0.1,
      innerR: 0.06,
    });
    text(
      s,
      [
        {
          text: '~20,000 primary health facilities track medicines on paper and order bimonthly.',
          font: B,
          fontSize: 13.5,
          color: INK,
          bold: true,
        },
        {
          text: 'Stockouts surface late; resupply takes over two weeks.',
          font: B,
          fontSize: 13.5,
          color: FADE,
          lineSpacing: 1.25,
        },
        {
          text: "Meanwhile, surplus medicine sits unused — often expiring — on a neighbouring clinic's shelf.",
          font: B,
          fontSize: 13.5,
          color: FADE,
          lineSpacing: 1.25,
        },
      ],
      {
        x: MX + 0.6,
        y: y + 0.42,
        w: 4.95,
        h: 2.4,
        margin: 0,
        lineSpacing: 1.3,
      },
    );
    // right: stat column, asymmetrical, three stacked bezels
    const stats = [
      ['36.2%', 'essential medicines available at PHCs — NBS survey'],
      ['65.7%', 'of essential medicines missing from PHC shelves'],
      [
        '41.7%',
        'service delivery points stocked out of contraceptives in 3 months',
      ],
      ['>2 weeks', 'resupply delay — strongest stockout predictor (OR 1.76)'],
    ];
    let sy = y;
    for (const [big, small] of stats) {
      bezel(s, {
        x: 6.6,
        y: sy,
        w: 6.13,
        h: 0.78,
        shell: PANEL,
        inner: INNR,
        pad: 0.18,
        outerR: 0.1,
        innerR: 0.06,
      });
      text(s, [{ text: big, font: H, fontSize: 20, bold: true, color: ACC }], {
        x: 6.9,
        y: sy + 0.07,
        w: 1.7,
        h: 0.68,
        margin: 0,
      });
      text(
        s,
        [
          {
            text: small,
            font: B,
            fontSize: 10.5,
            color: FADE,
            lineSpacing: 1.05,
          },
        ],
        { x: 8.75, y: sy + 0.1, w: 3.85, h: 0.6, margin: 0, lineSpacing: 1.05 },
      );
      sy += 0.92;
    }
    footer(s, 2);
    s.addNotes(
      'Evidence: NBS National Health Facility Survey (36.2% availability), contraceptive stockout study (41.7%, OR 1.76 for >2-week resupply).',
    );
  }

  // ============ S3: Surplus paradox (two facing bezels) ============
  {
    const s = pptx.addSlide();
    bg(s);
    const y = titleBlock(
      s,
      'The surplus paradox',
      'The medicine is often nearby — but nobody knows',
      '',
    );
    // left card: Clinic A
    bezel(s, {
      x: 7.0,
      y,
      w: 2.75,
      h: 2.55,
      shell: PANEL,
      inner: INNR,
      pad: 0.22,
      outerR: 0.09,
      innerR: 0.05,
    });
    text(
      s,
      [
        {
          text: 'CLINIC A',
          font: B,
          fontSize: 9.5,
          bold: true,
          color: ACC,
          charSpacing: 1,
        },
      ],
      { x: 7.15, y: y + 0.18, w: 2.45, h: 0.3, margin: 0 },
    );
    text(
      s,
      [{ text: 'Stocked out', font: H, fontSize: 18, bold: true, color: INK }],
      { x: 7.15, y: y + 0.52, w: 2.45, h: 0.5, margin: 0 },
    );
    text(
      s,
      [
        {
          text: 'Essential medicines absent. A child waits.',
          font: B,
          fontSize: 10.5,
          color: FADE,
          lineSpacing: 1.1,
        },
      ],
      { x: 7.15, y: y + 1.08, w: 2.45, h: 0.95, margin: 0, lineSpacing: 1.15 },
    );
    // arrow
    text(s, [{ text: '→', font: H, fontSize: 20, bold: true, color: ACC }], {
      x: 9.9,
      y: y + 0.95,
      w: 0.45,
      h: 0.5,
      margin: 0,
      align: 'center',
    });
    // right card: Clinic B (lifted shell = accent hint)
    bezel(s, {
      x: 10.55,
      y,
      w: 2.75,
      h: 2.55,
      shell: INNR,
      inner: PANEL,
      pad: 0.22,
      outerR: 0.09,
      innerR: 0.05,
    });
    text(
      s,
      [
        {
          text: 'CLINIC B',
          font: B,
          fontSize: 9.5,
          bold: true,
          color: ACC,
          charSpacing: 1,
        },
      ],
      { x: 10.7, y: y + 0.18, w: 2.45, h: 0.3, margin: 0 },
    );
    text(
      s,
      [
        {
          text: 'Surplus stock',
          font: H,
          fontSize: 18,
          bold: true,
          color: INK,
        },
      ],
      { x: 10.7, y: y + 0.52, w: 2.45, h: 0.5, margin: 0 },
    );
    text(
      s,
      [
        {
          text: 'Sitting unused, close to expiry.',
          font: B,
          fontSize: 10.5,
          color: FADE,
          lineSpacing: 1.1,
        },
      ],
      { x: 10.7, y: y + 1.08, w: 2.45, h: 0.95, margin: 0, lineSpacing: 1.15 },
    );
    text(
      s,
      [
        {
          text: 'Government dashboards already recommend redistribution — no tool executes it at the PHC tier.',
          font: B,
          fontSize: 10,
          color: FADE,
          lineSpacing: 1.15,
        },
      ],
      { x: MX, y: y + 2.85, w: 12.1, h: 0.85, margin: 0, lineSpacing: 1.2 },
    );
    footer(s, 3);
    s.addNotes(
      'Surplus paradox: redistribution is recommended by government dashboards but no tool executes it at the public PHC tier on basic phones.',
    );
  }

  // ============ S4: Why systems fail (3 bezels row) ============
  {
    const s = pptx.addSlide();
    bg(s);
    const y = titleBlock(
      s,
      "Why today's systems fail",
      'Paper, delay, and stale records',
      '',
    );
    const cards = [
      [
        'Paper tracking',
        'Bin cards not updated per transaction; records diverge from shelf reality.',
        ACC,
      ],
      [
        'Bimonthly ordering',
        'Resupply takes over two weeks; stockouts surface too late.',
        ACCDK,
      ],
      [
        'Stale LMIS data',
        'Inventory accuracy is 70–87% — clinics promise drugs already sold.',
        ACC,
      ],
    ];
    let cx = MX;
    const cw = 3.92,
      gap = 0.235;
    for (const [t, d, c] of cards) {
      bezel(s, {
        x: cx,
        y,
        w: cw,
        h: 3.15,
        shell: PANEL,
        inner: INNR,
        pad: 0.28,
        outerR: 0.08,
        innerR: 0.04,
      });
      // thin left lift using accent color as inner shell
      rect(s, {
        x: cx + 0.05,
        y: y + 0.05,
        w: 0.06,
        h: 3.05,
        fill: c,
        shadow: { type: 'none' },
      });
      text(s, [{ text: t, font: H, fontSize: 15, bold: true, color: WHT }], {
        x: cx + 0.35,
        y: y + 0.35,
        w: cw - 0.7,
        h: 0.45,
        margin: 0,
      });
      text(
        s,
        [{ text: d, font: B, fontSize: 11.5, color: FADE, lineSpacing: 1.2 }],
        {
          x: cx + 0.35,
          y: y + 0.95,
          w: cw - 0.7,
          h: 2.0,
          margin: 0,
          lineSpacing: 1.25,
        },
      );
      cx += cw + gap;
    }
    rect(s, {
      x: MX,
      y: y + 3.4,
      w: 12.13,
      h: 0.78,
      shell: PANEL,
      inner: INNR,
      pad: 0.25,
      outerR: 0.09,
      innerR: 0.05,
    });
    text(
      s,
      [
        {
          text: 'The failure mode: promise-first, verify-never — a clinic promises drugs its own records say are in stock but are already gone.',
          font: B,
          fontSize: 12.5,
          color: INK,
          italic: true,
          lineSpacing: 1.2,
        },
      ],
      {
        x: MX + 0.5,
        y: y + 3.52,
        w: 11.6,
        h: 0.55,
        margin: 0,
        lineSpacing: 1.2,
      },
    );
    footer(s, 4);
    s.addNotes(
      'LMIS data-quality studies (70–87% accuracy) show records not updated per transaction — confirm-before-dispatch attacks exactly this.',
    );
  }

  // ============ S5: Solution flow (6 steps, minimal) ============
  {
    const s = pptx.addSlide();
    bg(s);
    const y = titleBlock(
      s,
      'The solution',
      'An emergency exception workflow for clinics',
      'Six gates, app-first, with human authority before dispatch',
    );
    const steps = [
      ['1', 'Request', 'Facility app, SMS, or WhatsApp', md.MdLocalHospital],
      ['2', 'Match', 'Eligible ambient stock only', md.MdInventory],
      ['3', 'Protect', 'Safety floor, batch, and expiry', md.MdMap],
      ['4', 'Confirm', 'Source custodian checks shelf', md.MdCheckCircle],
      ['5', 'Release', 'LGA/pharmacist approves, rider moves', md.MdLocalShipping],
      ['6', 'Receive', 'Inspection, receipt, and audit trail', md.MdDashboard],
    ];
    const stepW = 1.78,
      gap = 0.16,
      startX = MX;
    let sx = startX;
    for (let i = 0; i < steps.length; i++) {
      const [num, t, d, Comp] = steps[i];
      const buf = await iconPng(Comp, 24, ACC);
      s.addImage({
        data: 'image/png;base64,' + buf.toString('base64'),
        x: sx + stepW / 2 - 0.15,
        y: y + 0.05,
        w: 0.3,
        h: 0.3,
      });
      rect(s, {
        x: sx,
        y: y + 0.48,
        w: stepW,
        h: 0.04,
        fill: PANEL,
        shadow: { type: 'none' },
      });
      text(s, [{ text: num, font: H, fontSize: 15, bold: true, color: ACC }], {
        x: sx,
        y: y + 0.65,
        w: stepW,
        h: 0.4,
        margin: 0,
        align: 'center',
      });
      text(s, [{ text: t, font: B, fontSize: 11.5, bold: true, color: INK }], {
        x: sx,
        y: y + 1.08,
        w: stepW,
        h: 0.3,
        margin: 0,
        align: 'center',
      });
      text(
        s,
        [{ text: d, font: B, fontSize: 8.5, color: FADE, lineSpacing: 1.05 }],
        {
          x: sx + 0.14,
          y: y + 1.42,
          w: stepW - 0.28,
          h: 0.95,
          margin: 0,
          align: 'center',
          lineSpacing: 1.1,
        },
      );
      if (i < steps.length - 1) {
        text(
          s,
          [{ text: '→', font: H, fontSize: 13, bold: true, color: FADE }],
          {
            x: sx + stepW + 0.01,
            y: y + 0.95,
            w: 0.22,
            h: 0.4,
            margin: 0,
            align: 'center',
          },
        );
      }
      sx += stepW + gap + 0.22;
    }
    rect(s, {
      x: MX,
      y: y + 2.75,
      w: 12.13,
      h: 0.78,
      shell: PANEL,
      inner: INNR,
      pad: 0.25,
      outerR: 0.09,
      innerR: 0.05,
    });
    text(
      s,
      [
        {
          text: 'The facility app and operations console are primary. SMS/WhatsApp create the same request when data access is limited; only the source custodian can confirm stock.',
          font: B,
          fontSize: 11.5,
          color: INK,
          lineSpacing: 1.15,
        },
      ],
      {
        x: MX + 0.5,
        y: y + 2.85,
        w: 11.6,
        h: 0.6,
        margin: 0,
        lineSpacing: 1.2,
      },
    );
    footer(s, 5);
    s.addNotes(
      'Flow: app or channel request → eligibility and safety check → source shelf confirmation → authorised release → simulated rider handover → receipt and trace.',
    );
  }

  // ============ S6: Why it wins (vertical stack of bezels) ============
  {
    const s = pptx.addSlide();
    bg(s);
    const y = titleBlock(
      s,
      'Why this wins',
      'A real gap, not a crowded space',
      '',
    );
    const wins = [
      [
        'Source-confirm before dispatch',
        'A designated source custodian checks usable shelf stock before any release is proposed.',
      ],
      [
        'One canonical order',
        'The mobile app is primary; a simulated SMS or WhatsApp message creates the same order and timeline.',
      ],
      [
        'Public PHC workflow',
        'Designed around LGA-authorised exception handling, not an ungoverned peer marketplace.',
      ],
      [
        'Governance visible in-product',
        'Safety floors, batch/expiry, release authority, receipt, and escalation are visible decision gates.',
      ],
      [
        'Scenario-tested resilience',
        'The Scenario Lab demonstrates a successful transfer and the safe failure paths that stop unsafe movement.',
      ],
    ];
    let wy = y;
    for (const [t, d] of wins) {
      bezel(s, {
        x: MX,
        y: wy,
        w: 12.13,
        h: 0.82,
        shell: PANEL,
        inner: INNR,
        pad: 0.22,
        outerR: 0.09,
        innerR: 0.05,
      });
      text(s, [{ text: t, font: H, fontSize: 13, bold: true, color: INK }], {
        x: MX + 0.5,
        y: wy + 0.07,
        w: 3.7,
        h: 0.7,
        margin: 0,
      });
      text(
        s,
        [{ text: d, font: B, fontSize: 11, color: FADE, lineSpacing: 1.1 }],
        {
          x: MX + 4.5,
          y: wy + 0.09,
          w: 7.4,
          h: 0.65,
          margin: 0,
          lineSpacing: 1.1,
        },
      );
      wy += 0.97;
    }
    footer(s, 6);
    s.addNotes(
      'Positioning: Supplai is a fictional-demo prototype for LGA-authorised emergency exception control. Farid validates every comparative or local claim before submission.',
    );
  }

  // ============ S7: Open-source stack (4 bezels row) ============
  {
    const s = pptx.addSlide();
    bg(s);
    const y = titleBlock(
      s,
      'Demonstration architecture',
      'A controllable safety workflow, not a stack of unverified integrations',
      '',
    );
    const stack = [
      [
        'Expo mobile app',
        'Role-specific facility and rider flows built for a controlled Android demonstration.',
        io.IoIosMedical,
      ],
      [
        'Fastify + Supabase',
        'Typed workflow, append-only stock movements, scenario fixtures, and a resettable event timeline.',
        md.MdLocalShipping,
      ],
      [
        'Channel simulator',
        'SMS/WhatsApp-style intake is simulated and feeds the same canonical order as the app.',
        io.IoIosChatbubbles,
      ],
      [
        'Scenario Lab',
        'Scripted safety-floor, expiry, rider-delay, refusal, and demand-shock runs make the operating model inspectable.',
        md.MdInventory,
      ],
    ];
    const cw2 = 2.93,
      gap2 = 0.135;
    let cx3 = MX;
    for (const [t, d, Comp] of stack) {
      bezel(s, {
        x: cx3,
        y: y,
        w: cw2,
        h: 2.35,
        shell: PANEL,
        inner: INNR,
        pad: 0.22,
        outerR: 0.08,
        innerR: 0.04,
      });
      const buf = await iconPng(Comp, 22, ACC);
      s.addImage({
        data: 'image/png;base64,' + buf.toString('base64'),
        x: cx3 + 0.25,
        y: y + 0.18,
        w: 0.28,
        h: 0.28,
      });
      text(s, [{ text: t, font: H, fontSize: 11.5, bold: true, color: INK }], {
        x: cx3 + 0.65,
        y: y + 0.13,
        w: cw2 - 0.9,
        h: 0.45,
        margin: 0,
      });
      text(
        s,
        [{ text: d, font: B, fontSize: 9.5, color: FADE, lineSpacing: 1.1 }],
        {
          x: cx3 + 0.65,
          y: y + 0.68,
          w: cw2 - 0.9,
          h: 1.5,
          margin: 0,
          lineSpacing: 1.15,
        },
      );
      cx3 += cw2 + gap2;
    }
    rect(s, {
      x: MX,
      y: y + 2.65,
      w: 12.13,
      h: 0.78,
      shell: PANEL,
      inner: INNR,
      pad: 0.25,
      outerR: 0.09,
      innerR: 0.05,
    });
    text(
      s,
      [
        {
          text: 'Our build: the authority, safety, handover, and escalation layer that makes a time-critical exception accountable.',
          font: B,
          fontSize: 11.5,
          color: INK,
          italic: true,
          lineSpacing: 1.15,
        },
      ],
      {
        x: MX + 0.5,
        y: y + 2.75,
        w: 11.6,
        h: 0.6,
        margin: 0,
        lineSpacing: 1.2,
      },
    );
    footer(s, 7);
    s.addNotes(
      'Build scope: Expo, Fastify, Supabase, and a no-cost Scenario Lab. No live carrier, messaging, or medicine movement is implied.',
    );
  }

  // ============ S8: Sustainability (2x2 bezel grid) ============
  {
    const s = pptx.addSlide();
    bg(s);
    const y = titleBlock(s, 'Sustainability', 'How it works and lasts', '');
    const cols = [
      [
        'Transfer cost model',
        'A future pilot will measure carrier, handling, data, supervision, and incident costs per authorised handover.',
        md.MdLocalShipping,
      ],
      [
        'Funding hypothesis',
        'Potential LGA, state, donor, or programme funding is a research question, not a subscription claim.',
        md.MdDashboard,
      ],
      [
        'Equity control',
        'Safety floors and sequential offers prevent a well-stocked facility from being quietly drained.',
        md.MdCheckCircle,
      ],
      [
        'Pilot design',
        'Scope, commodities, partners, and measures remain subject to local validation before any real transfer.',
        io.IoIosPulse,
      ],
    ];
    const positions = [
      [MX, y],
      [6.83, y],
      [MX, y + 2.05],
      [6.83, y + 2.05],
    ];
    for (let i = 0; i < cols.length; i++) {
      const [t, d, Comp] = cols[i];
      const [px, py] = positions[i];
      bezel(s, {
        x: px,
        y: py,
        w: 5.95,
        h: 1.85,
        shell: PANEL,
        inner: INNR,
        pad: 0.2,
        outerR: 0.08,
        innerR: 0.04,
      });
      const buf = await iconPng(Comp, 22, ACC);
      s.addImage({
        data: 'image/png;base64,' + buf.toString('base64'),
        x: px + 0.25,
        y: py + 0.16,
        w: 0.28,
        h: 0.28,
      });
      text(s, [{ text: t, font: H, fontSize: 13.5, bold: true, color: INK }], {
        x: px + 0.65,
        y: py + 0.11,
        w: 5.1,
        h: 0.4,
        margin: 0,
      });
      text(
        s,
        [{ text: d, font: B, fontSize: 10, color: FADE, lineSpacing: 1.1 }],
        {
          x: px + 0.65,
          y: py + 0.58,
          w: 5.1,
          h: 1.15,
          margin: 0,
          lineSpacing: 1.15,
        },
      );
    }
    rect(s, {
      x: MX,
      y: y + 4.45,
      w: 12.13,
      h: 0.16,
      shell: PANEL,
      inner: INNR,
      pad: 0.2,
      outerR: 0.08,
      innerR: 0.04,
    });
    text(
      s,
      [
        {
          text: 'Every simulated transfer is source-confirmed, authority-released, and receipt-checked before it is treated as complete.',
          font: B,
          fontSize: 9,
          color: FADE,
          italic: true,
        },
      ],
      { x: MX, y: y + 4.48, w: 12.13, h: 0.14, margin: 0, align: 'center' },
    );
    footer(s, 8);
    s.addNotes(
      'Economics are intentionally modelled, not priced. Farid validates funder, carrier, and pilot assumptions before submission.',
    );
  }

  // ============ S9: Roadmap (timeline bezels + closing quote) ============
  {
    const s = pptx.addSlide();
    bg(s);
    const y = titleBlock(s, 'Roadmap', 'GBSN timeline and the ask', '');
    const miles = [
      ['Nov 1, 2026', 'Registration opens'],
      ['Nov 15, 2026', 'Submission deadline'],
      ['Dec 1–2, 2026', 'Finals'],
      ['Dec 7, 2026', 'Winner announced ($5k / $1k / $1k)'],
    ];
    let my = y;
    for (const [when, what] of miles) {
      bezel(s, {
        x: MX,
        y: my,
        w: 12.13,
        h: 0.72,
        shell: PANEL,
        inner: INNR,
        pad: 0.22,
        outerR: 0.09,
        innerR: 0.05,
      });
      rect(s, {
        x: MX + 0.05,
        y: my + 0.05,
        w: 0.06,
        h: 0.62,
        fill: ACC,
        shadow: { type: 'none' },
      });
      text(
        s,
        [{ text: when, font: H, fontSize: 13.5, bold: true, color: ACC }],
        { x: MX + 0.35, y: my + 0.05, w: 2.2, h: 0.62, margin: 0 },
      );
      text(s, [{ text: what, font: B, fontSize: 12, color: INK }], {
        x: MX + 2.8,
        y: my + 0.06,
        w: 9.1,
        h: 0.6,
        margin: 0,
      });
      my += 0.88;
    }
    text(
      s,
      [
        {
          text: '“A carton across the road could save a life. Let’s move it.”',
          font: H,
          fontSize: 19,
          italic: true,
          color: INK,
        },
      ],
      {
        x: MX,
        y: my + 0.15,
        w: 12.13,
        h: 0.6,
        margin: 0,
        align: 'center',
        lineSpacing: 1.1,
      },
    );
    footer(s, 9);
    s.addNotes(
      'Challenge dates: registration Nov 1, submission Nov 15, finals Dec 1–2, winner Dec 7. Prizes $5k / $1k / $1k; judge Dr. Obiora Madu (Nigeria).',
    );
  }

  await pptx.writeFile({
    fileName: path.resolve(__dirname, '../../artifacts/deck/supplai_deck.pptx'),
  });
  console.log('deck written');
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
