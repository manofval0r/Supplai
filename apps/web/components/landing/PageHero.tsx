import type { ReactNode } from 'react';
import styles from './page-hero.module.css';

export type HeroChip = { label: string; value: string };

function RouteVisual() {
  return (
    <svg
      viewBox="0 0 420 300"
      aria-hidden="true"
      style={{
        background: '#ffffff',
        borderRadius: 24,
        border: '2.5px solid #030407',
        boxShadow: '5px 5px 0 #030407',
      }}
    >
      <rect x="8" y="8" width="404" height="284" rx="20" fill="#f8fafe" />
      <path
        d="M32 232 H388 M32 196 H388"
        stroke="#1558C9"
        strokeOpacity="0.22"
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
        <circle
          cx="210"
          cy="150"
          r="34"
          fill="#D4FF24"
          stroke="#030407"
          strokeWidth="2.5"
        />
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
        stroke="#1558C9"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeDasharray="8 10"
      />
      <circle
        className={styles.pulse}
        cx="210"
        cy="150"
        r="34"
        fill="#1558C9"
        fillOpacity="0.2"
      />
      {/* rider */}
      <g transform="translate(64 238)">
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
          stroke="#030407"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      </g>
      <rect x="236" y="210" width="140" height="52" rx="14" fill="#030407" />
      <text
        x="250"
        y="232"
        fill="#D4FF24"
        fontSize="11"
        fontWeight="800"
        letterSpacing="1.4"
      >
        SEAL #7842
      </text>
      <text x="250" y="250" fill="#fff" fontSize="13" fontWeight="700">
        Handover verified
      </text>
    </svg>
  );
}

export default function PageHero({
  eyebrow,
  title,
  description,
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
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.lead}>{description}</p>
          {actions && <div className={styles.actions}>{actions}</div>}
        </div>
        <div className={styles.visual}>{visual ?? <RouteVisual />}</div>
      </div>
    </section>
  );
}
