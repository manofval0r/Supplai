export const landingContent = {
  navigation: [
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Our network', href: '#our-network' },
  ],
  hero: {
    headline: ['Essential medicine,', "where it's needed."],
    description:
      'Supplai helps health facilities coordinate essential stock and accountable delivery, so care teams can focus on the people who need them.',
    primaryAction: 'Go to dashboard',
    secondaryAction: 'How Supplai works',
  },
  network: {
    benefits: [
      'Facility-to-facility coordination',
      'Clear delivery milestones',
      'Accountable handovers',
    ],
    note: 'Designed for local health networks',
  },
  facilityApp: {
    eyebrow: 'The facility app',
    headline: 'Hold the whole handover in one hand.',
    description:
      'The Expo app is the working surface for facility teams and riders. Rotate the phone, move between screens, and see the same workflow the demo runs on.',
    features: [
      'Confirm stock, batch, expiry, and the source custodian',
      'Two-sided handover with a rider code and seal check',
      'Safety floors and FEFO guidance before a release',
    ],
    featureDetails: [
      'The source custodian confirms stock, batch, and expiry before release.',
      'Rider and facility both confirm the handover code and seal.',
      'Every active transfer, safety floor, and handover in one view.',
    ],
  },
  howItWorks: {
    eyebrow: 'A simpler way to move stock',
    headline: ['From available stock', 'to a confirmed handover.'],
    description:
      'One shared view helps every person in the journey know what happens next.',
    steps: [
      {
        number: '01',
        title: 'See what is available',
        body: 'Facilities share essential-medicine stock with nearby peer facilities.',
      },
      {
        number: '02',
        title: 'Coordinate a transfer',
        body: 'A clear request connects a facility with stock to the team that needs it.',
      },
      {
        number: '03',
        title: 'Follow every handover',
        body: 'Track the rider, confirm receipt, and keep a reliable record from start to finish.',
      },
    ],
  },
  callToAction: {
    eyebrow: 'A better-connected supply chain',
    headline: "Let's get essential supplies moving.",
    action: 'Open dashboard',
  },
  footer: {
    description: 'Making essential medicine logistics more visible.',
  },
} as const;
