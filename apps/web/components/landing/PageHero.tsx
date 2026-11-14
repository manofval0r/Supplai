import type { ReactNode } from 'react';
import styles from './page-hero.module.css';

export type HeroChip = { label: string; value: string };

function RouteVisual() {
  return (
    <svg viewBox="0 0 420 300" aria-hidden="true">
      <rect
        x="8"
        y="8"
        width="404"
        height="284"
        rx="28"
        fill="#1558C9"
        fillOpacity="0.16"
        stroke="#1558C9"
        strokeOpacity="0.6"
        strokeWidth="2"
      />
      <path
        d="M40 232 H380 M40 196 H380"
        stroke="#1558C9"
        strokeOpacity="0.35"
        strokeWidth="2"
      />
      {/* nodes */}
      <g>
        <circle cx="86" cy="86" r="30" fill="#1558C9" />
        <path
          d="M86 70 V102 M70 86 H102"
          stroke="#D4FF24"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <circle cx="210" cy="150" r="34" fill="#D4FF24" />
        <path
          d="M210 132 V168 M192 150 H228"
          stroke="#030407"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <circle cx="336" cy="82" r="30" fill="#1558C9" />
        <path
          d="M336 66 V98 M320 82 H352"
          stroke="#D4FF24"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </g>
      <path
        className={styles.flow}
        d="M112 100 Q150 150 180 150 M240 150 Q300 130 316 104"
        fill="none"
        stroke="#D4FF24"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="8 10"
      />
      <circle
        className={styles.pulse}
        cx="210"
        cy="150"
        r="34"
        fill="#D4FF24"
      />
      {/* rider */}
      <g transform="translate(70 238)">
        <circle
          cx="0"
          cy="0"
          r="9"
          fill="#030407"
          stroke="#D4FF24"
          strokeWidth="3"
        />
        <circle
          cx="46"
          cy="0"
          r="9"
          fill="#030407"
          stroke="#D4FF24"
          strokeWidth="3"
        />
        <path
          d="M0 0 L20 -22 H38 L46 0 M20 -22 L14 -34"
          fill="none"
          stroke="#D4FF24"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>
      <rect x="236" y="212" width="132" height="50" rx="14" fill="#030407" />
      <text
        x="252"
        y="234"
        fill="#D4FF24"
        fontSize="11"
        fontWeight="800"
        letterSpacing="1.4"
      >
        SEAL #7842
      </text>
      <text x="252" y="252" fill="#fff" fontSize="13" fontWeight="700">
        Handover verified
      </text>
    </svg>
  );
}

export default function PageHero({
  eyebrow,
  title,
  description,
  chips,
  actions,
  visual,
}: {
  eyebrow: string;
  title: ReactNode;
  description: string;
  chips?: HeroChip[];
  actions?: ReactNode;
  visual?: ReactNode;
}) {
  return (
    <section className={styles.hero}>
      <div className={styles.grid}>
        <div>
          <p className={styles.eyebrow}>
            <i /> {eyebrow}
          </p>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.lead}>{description}</p>
          {chips && chips.length > 0 && (
            <div className={styles.chips}>
              {chips.map((chip) => (
                <div className={styles.chip} key={chip.label}>
                  <small>{chip.label}</small>
                  <b>{chip.value}</b>
                </div>
              ))}
            </div>
          )}
          {actions && <div className={styles.actions}>{actions}</div>}
        </div>
        <div className={styles.visual}>{visual ?? <RouteVisual />}</div>
      </div>
    </section>
  );
}
