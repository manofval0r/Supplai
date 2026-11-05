import BrandLogo from './BrandLogo';

const columns = [
  {
    title: 'Explore',
    links: [
      ['How it works', '#how-it-works'],
      ['Features', '#features'],
      ['FAQ', '#faq'],
    ],
  },
  {
    title: 'Company',
    links: [
      ['About Supplai', '#about'],
      ['Open dashboard', '#dashboard'],
    ],
  },
];

export default function Footer({
  onOpenDashboard,
}: {
  onOpenDashboard: () => void;
}) {
  return (
    <footer className="lp-footer">
      <div className="lp-container lp-footer__inner">
        <div className="lp-footer__brand">
          <BrandLogo />
          <p>...Let&apos;s move essential medicine where it matters.</p>
        </div>

        <div className="lp-footer__links">
          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h3>{column.title}</h3>
              {column.links.map(([label, href]) =>
                label === 'Open dashboard' ? (
                  <button
                    className="lp-footer__link-button"
                    key={label}
                    type="button"
                    onClick={onOpenDashboard}
                  >
                    {label} ↗
                  </button>
                ) : (
                  <a key={label} href={href}>
                    {label}
                  </a>
                ),
              )}
            </nav>
          ))}
        </div>

        <p className="lp-footer__copyright">
          © {new Date().getFullYear()} Supplai. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
