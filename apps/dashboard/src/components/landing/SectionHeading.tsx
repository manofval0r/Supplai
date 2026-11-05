import type { ReactNode } from 'react';

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  tone = 'dark',
  id,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  align?: 'left' | 'center';
  tone?: 'dark' | 'light';
  id?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={`lp-section-heading lp-section-heading--${align} lp-section-heading--${tone}`}
    >
      <span className="lp-eyebrow">{eyebrow}</span>
      <h2 className="lp-section-heading__title" id={id}>
        {title}
      </h2>
      {description ? (
        <p className="lp-section-heading__description">{description}</p>
      ) : null}
      {children}
    </div>
  );
}
