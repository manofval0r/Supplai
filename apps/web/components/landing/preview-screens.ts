export const PREVIEW_SCREENS = [
  {
    id: 'home',
    label: 'Role Hub',
    role: 'All roles',
    src: '/preview/screens/home.png',
    caption:
      'Role-based home with live transfer tracking, nearest clinic ETA, and FloatingDock.',
  },
  {
    id: 'request',
    label: 'Request',
    role: 'Receiving PHC',
    src: '/preview/screens/request.png',
    caption:
      'Facility teams request ambient-stable ORS 20.5 g or Zinc Sulfate against verified stock.',
  },
  {
    id: 'release',
    label: 'Release',
    role: 'Source Custodian',
    src: '/preview/screens/release.png',
    caption:
      'Source custodians confirm batch, expiry, tamper seal #7842, and safety-floor limits.',
  },
  {
    id: 'rider',
    label: 'Dispatch',
    role: 'Motorcycle Courier',
    src: '/preview/screens/rider.png',
    caption:
      'Live Ado-Odo/Ota dispatch route view with fallback coordinates and custody status.',
  },
  {
    id: 'activity',
    label: 'LGA & Activity',
    role: 'Supervisor Desk',
    src: '/preview/screens/activity.png',
    caption:
      'Paired stock ledger, timeline events, and read-only LGA Safety-Floor Oversight card.',
  },
  {
    id: 'ota',
    label: 'OTA & Controls',
    role: 'Device Settings',
    src: '/preview/screens/ota.png',
    caption:
      'Preferences and real-time Expo OTA update check on the preview release channel.',
  },
] as const;
