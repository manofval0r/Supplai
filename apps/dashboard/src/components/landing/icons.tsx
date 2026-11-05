import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

function strokeProps(props: IconProps): IconProps {
  return {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2.2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
    focusable: false,
    ...props,
  };
}

function fillProps(props: IconProps): IconProps {
  return {
    viewBox: '0 0 24 24',
    fill: 'currentColor',
    'aria-hidden': true,
    focusable: false,
    ...props,
  };
}

export function RouteIcon(props: IconProps) {
  return (
    <svg {...strokeProps(props)}>
      <circle cx="5" cy="18" r="2.5" />
      <circle cx="19" cy="6" r="2.5" />
      <path d="M7.5 18h4.2a3 3 0 0 0 3-3v-3a3 3 0 0 1 3-3H19" />
    </svg>
  );
}

export function ShieldCheckIcon(props: IconProps) {
  return (
    <svg {...strokeProps(props)}>
      <path d="M12 3 19 6v5.2c0 4.4-2.8 7.6-7 9.8-4.2-2.2-7-5.4-7-9.8V6l7-3Z" />
      <path d="m8.8 12 2.1 2.1 4.4-4.4" />
    </svg>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <svg {...strokeProps(props)}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}

export function PillIcon(props: IconProps) {
  return (
    <svg {...strokeProps(props)}>
      <rect
        x="3.6"
        y="8.7"
        width="16.8"
        height="6.6"
        rx="3.3"
        transform="rotate(-35 12 12)"
      />
      <path d="m8.7 7.6 7.7 8.8" />
    </svg>
  );
}

export function CapsuleIcon(props: IconProps) {
  return (
    <svg {...strokeProps(props)}>
      <rect
        x="4"
        y="9"
        width="16"
        height="6"
        rx="3"
        transform="rotate(25 12 12)"
      />
      <path d="M9.2 7.4 14.8 16.6" />
    </svg>
  );
}

export function BottleIcon(props: IconProps) {
  return (
    <svg {...strokeProps(props)}>
      <path d="M9 3h6v3l1.7 2.2a3 3 0 0 1 .6 1.8v8a3 3 0 0 1-3 3h-4.6a3 3 0 0 1-3-3v-8a3 3 0 0 1 .6-1.8L9 6V3Z" />
      <path d="M8 12h8M11 9.5h2M11 14.5h2" />
    </svg>
  );
}

export function PinIcon(props: IconProps) {
  return (
    <svg {...strokeProps(props)}>
      <path d="M12 21s6.5-5.4 6.5-10.5a6.5 6.5 0 1 0-13 0C5.5 15.6 12 21 12 21Z" />
      <circle cx="12" cy="10.5" r="2.3" />
    </svg>
  );
}

export function HeartPulseIcon(props: IconProps) {
  return (
    <svg {...strokeProps(props)}>
      <path d="M20.8 8.7c0 5-8.8 10.3-8.8 10.3S3.2 13.7 3.2 8.7A4.3 4.3 0 0 1 12 6.8a4.3 4.3 0 0 1 8.8 1.9Z" />
      <path d="M4 12h4l1.6-3 2.8 6 1.8-3H20" />
    </svg>
  );
}

export function LockIcon(props: IconProps) {
  return (
    <svg {...strokeProps(props)}>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
      <path d="M12 14.5v2" />
    </svg>
  );
}

export function BoxIcon(props: IconProps) {
  return (
    <svg {...strokeProps(props)}>
      <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
      <path d="m4 7.5 8 4.5 8-4.5M12 12v9" />
      <path d="m8 5.3 8 4.5" />
    </svg>
  );
}

export function UploadIcon(props: IconProps) {
  return (
    <svg {...strokeProps(props)}>
      <path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5" />
      <path d="M5 15v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3" />
    </svg>
  );
}

export function StoreIcon(props: IconProps) {
  return (
    <svg {...strokeProps(props)}>
      <path d="M4 10v9h16v-9" />
      <path d="M3 10l2-6h14l2 6a3 3 0 0 1-5 2 3 3 0 0 1-4 0 3 3 0 0 1-4 0 3 3 0 0 1-5-2Z" />
      <path d="M9 19v-4h6v4" />
    </svg>
  );
}

export function CardIcon(props: IconProps) {
  return (
    <svg {...strokeProps(props)}>
      <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
      <path d="M3 10h18M7 15h3" />
    </svg>
  );
}

export function ScooterIcon(props: IconProps) {
  return (
    <svg {...strokeProps(props)}>
      <circle cx="5.5" cy="17.5" r="2.5" />
      <circle cx="18.5" cy="17.5" r="2.5" />
      <path d="M8 17.5h7.5M15.5 17.5l2-8h2.5M17.5 9.5H14l-2.5 6H8.5l-2-3H4" />
    </svg>
  );
}

export function FileCheckIcon(props: IconProps) {
  return (
    <svg {...strokeProps(props)}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
      <path d="M14 3v5h5M8.5 14l2 2 4-4.5" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg {...strokeProps(props)}>
      <path d="m5 12.5 4.3 4.3L19 7" />
    </svg>
  );
}

export function StarIcon(props: IconProps) {
  return (
    <svg {...fillProps(props)}>
      <path d="m12 2.8 2.7 5.6 6.1.8-4.5 4.3 1.1 6.1-5.4-3-5.4 3 1.1-6.1L3.2 9.2l6.1-.8L12 2.8Z" />
    </svg>
  );
}

export function SparkIcon(props: IconProps) {
  return (
    <svg {...fillProps(props)}>
      <path d="M12 2c.6 5.3 3.7 8.4 9 9-5.3.6-8.4 3.7-9 9-.6-5.3-3.7-8.4-9-9 5.3-.6 8.4-3.7 9-9Z" />
    </svg>
  );
}

export function SquiggleIcon(props: IconProps) {
  return (
    <svg {...strokeProps(props)}>
      <path d="M2 12c2.4-5 4.8-5 7.2 0s4.8 5 7.2 0 3.6-5 5.6-1.2" />
    </svg>
  );
}

export function ArrowIcon(props: IconProps) {
  return (
    <svg {...strokeProps(props)}>
      <path d="M4 12h16m0 0-6-6m6 6-6 6" />
    </svg>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <svg {...strokeProps(props)}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg {...strokeProps(props)}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <svg {...strokeProps(props)}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function QuoteIcon(props: IconProps) {
  return (
    <svg {...fillProps(props)}>
      <path d="M10.2 5.5C6.6 7.1 4.5 10 4.5 13.6c0 2.8 1.6 4.9 4 4.9 2.1 0 3.7-1.5 3.7-3.6 0-2-1.4-3.4-3.3-3.4-.4 0-.8.1-1 .1.5-1.6 1.8-2.9 3.4-3.7l-1.1-2.4Zm9 0C15.6 7.1 13.5 10 13.5 13.6c0 2.8 1.6 4.9 4 4.9 2.1 0 3.7-1.5 3.7-3.6 0-2-1.4-3.4-3.3-3.4-.4 0-.8.1-1 .1.5-1.6 1.8-2.9 3.4-3.7l-1.1-2.4Z" />
    </svg>
  );
}

export function MailIcon(props: IconProps) {
  return (
    <svg {...strokeProps(props)}>
      <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

export function PhoneIcon(props: IconProps) {
  return (
    <svg {...strokeProps(props)}>
      <path d="M8.2 3.5 10 8 7.8 9.5a13.2 13.2 0 0 0 6.7 6.7L16 14l4.5 1.8-.7 3a2 2 0 0 1-2.2 1.4C10.8 19 5 13.2 3.8 6.4A2 2 0 0 1 5.2 4.2l3-.7Z" />
    </svg>
  );
}

export function BellIcon(props: IconProps) {
  return (
    <svg {...strokeProps(props)}>
      <path d="M6 10a6 6 0 1 1 12 0c0 3 1.2 4.5 2 5.5H4c.8-1 2-2.5 2-5.5Z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </svg>
  );
}

export function InstagramIcon(props: IconProps) {
  return (
    <svg {...strokeProps(props)}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.3" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function LinkedInIcon(props: IconProps) {
  return (
    <svg {...fillProps(props)}>
      <path d="M4.5 3.5a2.2 2.2 0 1 1 0 4.4 2.2 2.2 0 0 1 0-4.4ZM3 9h3v12H3V9Zm5.5 0h2.9v1.7c.6-1 1.8-2 3.7-2 3 0 4.4 1.8 4.4 5.2V21h-3v-6.5c0-1.8-.7-2.8-2.2-2.8-1.4 0-2.8 1-2.8 3.1V21h-3V9Z" />
    </svg>
  );
}

export function XIcon(props: IconProps) {
  return (
    <svg {...fillProps(props)}>
      <path d="M4 3h4.6l4.2 5.8L17.5 3H21l-6.7 8 7 10h-4.6l-4.6-6.3L6.5 21H3l7.2-8.6L4 3Z" />
    </svg>
  );
}

export function AppleIcon(props: IconProps) {
  return (
    <svg {...fillProps(props)}>
      <path d="M16.6 12.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.7-1.8-3.3-1.8-1.4-.1-2.7.8-3.4.8-.7 0-1.8-.8-3-.8-1.5 0-3 .9-3.8 2.3-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.3 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3 .7c1.3 0 2.1-1.1 2.9-2.2.9-1.3 1.3-2.5 1.3-2.6-.1 0-2.8-1.1-2.8-3.8ZM14.4 5.6c.6-.8 1.1-1.9 1-3-.9 0-2 .6-2.7 1.4-.6.7-1.2 1.8-1 2.9 1 .1 2-.5 2.7-1.3Z" />
    </svg>
  );
}

export function PlayStoreIcon(props: IconProps) {
  return (
    <svg {...fillProps(props)}>
      <path d="M4.2 3.3 14 12 4.2 20.7a1.7 1.7 0 0 1-.7-1.4V4.7c0-.6.3-1.1.7-1.4Zm10.9 9.8 2.8 2.5-9.2 4.9 6.4-7.4Zm2.8-3.5 2 .6c1.2.4 1.2 2 0 2.4l-2 .6-3.2-1.8 3.2-1.8ZM8.7 3.5l9.2 4.9-2.8 2.5-6.4-7.4Z" />
    </svg>
  );
}
