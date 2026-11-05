export default function BrandLogo({
  tone = 'dark',
}: {
  tone?: 'dark' | 'light';
}) {
  return (
    <span className={`lp-logo lp-logo--${tone}`}>
      <span className="lp-logo__mark" aria-hidden="true">
        S
      </span>{' '}
      <span className="lp-logo__word">supplai</span>
    </span>
  );
}
