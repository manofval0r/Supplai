export const PREVIEW_SCREENS = [
  {
    id: 'home',
    label: 'Home',
    src: '/preview/landing/home.svg',
    caption: 'Every active transfer, safety floor, and handover in one view.',
  },
  {
    id: 'request',
    label: 'Request',
    src: '/preview/landing/request.svg',
    caption:
      'Facility teams request ORS or zinc against a confirmed stock view.',
  },
  {
    id: 'release',
    label: 'Release',
    src: '/preview/landing/release.svg',
    caption:
      'The source custodian confirms stock, batch, and expiry before release.',
  },
  {
    id: 'handover',
    label: 'Handover',
    src: '/preview/landing/handover.svg',
    caption: 'Rider and facility both confirm the handover code and seal.',
  },
  {
    id: 'activity',
    label: 'Activity',
    src: '/preview/landing/activity.svg',
    caption:
      'A readable ledger of requests, releases, and confirmed deliveries.',
  },
] as const;
