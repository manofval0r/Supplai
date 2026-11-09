export default function HeroIllustration() {
  return (
    <svg
      className="lp-hero-art__svg"
      viewBox="0 0 620 540"
      role="img"
      aria-labelledby="lp-hero-art-title"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title id="lp-hero-art-title">
        A delivery rider on a scooter carrying a medicine parcel along a tracked
        route, surrounded by pills, a medicine bottle, and a location pin.
      </title>

      {/* Background shapes */}
      <circle
        cx="118"
        cy="126"
        r="82"
        fill="var(--brand-green-soft)"
        stroke="var(--brand-blue-deep)"
        strokeWidth="3"
      />
      <circle
        cx="520"
        cy="386"
        r="96"
        fill="var(--brand-yellow-soft)"
        stroke="var(--brand-blue-deep)"
        strokeWidth="3"
      />
      <path
        d="M40 300c38-26 70-16 94 8s54 22 78-10"
        fill="none"
        stroke="var(--brand-blue-deep)"
        strokeWidth="3"
        strokeDasharray="2 10"
        strokeLinecap="round"
        opacity="0.28"
      />

      {/* Route */}
      <path
        className="lp-art-route__base"
        d="M60 456c58-24 76-102 138-114s92 34 126-24 6-96 68-110 84-22 108-66"
        fill="none"
        stroke="var(--brand-blue-deep)"
        strokeWidth="5"
        strokeDasharray="3 12"
        strokeLinecap="round"
        opacity="0.3"
      />
      <path
        className="lp-art-route__draw"
        d="M60 456c58-24 76-102 138-114s92 34 126-24 6-96 68-110 84-22 108-66"
        fill="none"
        stroke="var(--brand-blue)"
        strokeWidth="5"
        strokeLinecap="round"
        pathLength="1"
      />

      {/* Destination pin */}
      <g className="lp-art-pin" transform="translate(500 92)">
        <circle
          className="lp-art-pin__pulse"
          cx="0"
          cy="0"
          r="30"
          fill="none"
          stroke="var(--brand-blue)"
          strokeWidth="3"
        />
        <path
          d="M0-30c-17 0-30 13-30 30 0 23 30 50 30 50s30-27 30-50c0-17-13-30-30-30Z"
          fill="var(--brand-red)"
          stroke="var(--brand-blue-deep)"
          strokeWidth="4"
        />
        <circle
          cx="0"
          cy="0"
          r="10"
          fill="var(--surface)"
          stroke="var(--brand-blue-deep)"
          strokeWidth="4"
        />
      </g>

      {/* Medicine bottle */}
      <g className="lp-art-float lp-art-float--a" transform="translate(70 350)">
        <rect
          x="5"
          y="5"
          width="72"
          height="120"
          rx="10"
          fill="var(--brand-blue-deep)"
        />
        <rect
          x="0"
          y="0"
          width="72"
          height="120"
          rx="10"
          fill="var(--surface)"
          stroke="var(--brand-blue-deep)"
          strokeWidth="3"
        />
        <rect
          x="14"
          y="-14"
          width="44"
          height="20"
          rx="4"
          fill="var(--brand-blue)"
          stroke="var(--brand-blue-deep)"
          strokeWidth="3"
        />
        <rect
          x="10"
          y="28"
          width="52"
          height="54"
          rx="4"
          fill="var(--brand-green-soft)"
          stroke="var(--brand-blue-deep)"
          strokeWidth="3"
        />
        <path
          d="M36 40v30M21 55h30"
          stroke="var(--brand-blue-deep)"
          strokeWidth="7"
          strokeLinecap="round"
        />
      </g>

      {/* Capsule — large */}
      <g
        className="lp-art-float lp-art-float--b"
        transform="translate(494 300)"
      >
        <g transform="rotate(-28)">
          <rect
            x="-46"
            y="-22"
            width="92"
            height="44"
            rx="22"
            fill="var(--surface)"
            stroke="var(--brand-blue-deep)"
            strokeWidth="3"
          />
          <path
            d="M-46 0a22 22 0 0 1 22-22h24v44h-24a22 22 0 0 1-22-22Z"
            fill="var(--brand-blue-soft)"
            stroke="var(--brand-blue-deep)"
            strokeWidth="3"
          />
          <path d="M0-22v44" stroke="var(--brand-blue-deep)" strokeWidth="3" />
        </g>
      </g>

      {/* Round pill */}
      <g
        className="lp-art-float lp-art-float--c"
        transform="translate(154 288)"
      >
        <circle
          cx="4"
          cy="4"
          r="31"
          fill="var(--brand-blue-deep)"
          opacity="0.2"
        />
        <circle
          cx="0"
          cy="0"
          r="31"
          fill="var(--surface)"
          stroke="var(--brand-blue-deep)"
          strokeWidth="3"
        />
        <path
          d="M-22 0h44"
          stroke="var(--brand-red)"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </g>

      {/* Small capsule */}
      <g className="lp-art-float lp-art-float--b" transform="translate(486 70)">
        <g transform="rotate(18)">
          <rect
            x="-30"
            y="-15"
            width="60"
            height="30"
            rx="15"
            fill="var(--brand-green-soft)"
            stroke="var(--brand-blue-deep)"
            strokeWidth="3"
          />
          <path d="M0-15v30" stroke="var(--brand-blue-deep)" strokeWidth="3" />
        </g>
      </g>

      {/* Scooter + rider */}
      <g>
        {/* shadow */}
        <ellipse
          cx="342"
          cy="456"
          rx="168"
          ry="18"
          fill="var(--brand-blue-deep)"
          opacity="0.14"
        />

        {/* wheels */}
        <g>
          <circle
            cx="238"
            cy="404"
            r="38"
            fill="var(--surface)"
            stroke="var(--brand-blue-deep)"
            strokeWidth="9"
          />
          <circle cx="238" cy="404" r="12" fill="var(--brand-blue-deep)" />
          <circle
            cx="438"
            cy="404"
            r="38"
            fill="var(--surface)"
            stroke="var(--brand-blue-deep)"
            strokeWidth="9"
          />
          <circle cx="438" cy="404" r="12" fill="var(--brand-blue-deep)" />
        </g>

        {/* scooter body */}
        <path
          d="M252 396h168"
          stroke="var(--brand-blue-deep)"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <path
          d="M268 392c0-30 22-50 52-50h82l30-38"
          fill="var(--brand-blue)"
          stroke="var(--brand-blue-deep)"
          strokeWidth="4"
        />
        <path
          d="m418 348 18-50h32"
          fill="none"
          stroke="var(--brand-blue-deep)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d="M450 298h44"
          stroke="var(--brand-blue-deep)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d="M470 292v-14"
          stroke="var(--brand-blue-deep)"
          strokeWidth="8"
          strokeLinecap="round"
        />

        {/* delivery box */}
        <g transform="rotate(-5 264 318)">
          <rect
            x="230"
            y="282"
            width="86"
            height="86"
            rx="7"
            fill="var(--brand-blue-deep)"
            opacity="0.18"
            transform="translate(6 6)"
          />
          <rect
            x="222"
            y="274"
            width="86"
            height="86"
            rx="7"
            fill="var(--surface)"
            stroke="var(--brand-blue-deep)"
            strokeWidth="3"
          />
          <path
            d="M222 296h86"
            stroke="var(--brand-blue-deep)"
            strokeWidth="3"
          />
          <rect
            x="222"
            y="274"
            width="86"
            height="22"
            rx="6"
            fill="var(--brand-blue)"
            stroke="var(--brand-blue-deep)"
            strokeWidth="3"
          />
          <text
            x="265"
            y="340"
            textAnchor="middle"
            fontFamily="var(--font-sans)"
            fontWeight="700"
            fontSize="30"
            fill="var(--brand-blue-deep)"
          >
            S
          </text>
        </g>

        {/* rider */}
        <path
          d="M326 354c-8-38 12-74 48-88l30 44-38 54-40-10Z"
          fill="var(--brand-blue)"
          stroke="var(--brand-blue-deep)"
          strokeWidth="4"
        />
        <path
          d="M338 340 382 392"
          stroke="var(--brand-blue-deep)"
          strokeWidth="14"
          strokeLinecap="round"
        />
        <path
          d="m382 392 30 2"
          stroke="var(--brand-blue-deep)"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <path
          d="m398 290 62 34"
          stroke="var(--brand-blue-deep)"
          strokeWidth="14"
          strokeLinecap="round"
        />
        <circle
          cx="462"
          cy="326"
          r="9"
          fill="var(--brand-neutral-soft)"
          stroke="var(--brand-blue-deep)"
          strokeWidth="4"
        />
        <circle
          cx="406"
          cy="238"
          r="27"
          fill="var(--brand-neutral-soft)"
          stroke="var(--brand-blue-deep)"
          strokeWidth="4"
        />
        <path
          d="M379 234c0-20 14-34 31-34 20 0 30 14 30 30l-8 2c-2-12-10-18-24-18-12 0-18 6-20 20h-9Z"
          fill="var(--brand-blue)"
          stroke="var(--brand-blue-deep)"
          strokeWidth="4"
        />
        <path
          d="M408 264c9 0 16 6 19 15"
          fill="none"
          stroke="var(--brand-blue-deep)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <circle cx="424" cy="243" r="3" fill="var(--brand-blue-deep)" />
      </g>

      {/* Decorative accents */}
      <g className="lp-art-spin" transform="translate(180 78)">
        <path
          d="M0-18c1 11 7 17 18 18C7 1 1 7 0 18-1 7-7 1-18 0-7-1-1-7 0-18Z"
          fill="var(--brand-red)"
          stroke="var(--brand-blue-deep)"
          strokeWidth="3"
        />
      </g>
      <g transform="translate(562 224)">
        <path
          d="M0-14 4-4l10 4-10 4-4 10-4-10-10-4 10-4 4-10Z"
          fill="var(--brand-blue)"
          stroke="var(--brand-blue-deep)"
          strokeWidth="2.5"
        />
      </g>
      <path
        d="M44 204c14-14 26-6 24 6s-18 18-28 10"
        fill="none"
        stroke="var(--brand-blue-deep)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M532 486c18-12 32-4 30 8"
        fill="none"
        stroke="var(--brand-blue-deep)"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
