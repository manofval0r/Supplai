import { StarIcon } from './icons';

const items = [
  'Facility requests',
  'Transfer visibility',
  'Stock coordination',
  'Rider handoffs',
  'Ward-level context',
  'Delivery proof',
  'Public ledger',
  'LGA operations',
];

function MarqueeGroup({ hidden = false }: { hidden?: boolean }) {
  return (
    <div className="lp-marquee__group" aria-hidden={hidden || undefined}>
      {items.map((item) => (
        <span className="lp-marquee__item" key={item}>
          {item}
          <StarIcon />
        </span>
      ))}
    </div>
  );
}

export default function Marquee() {
  return (
    <div className="lp-marquee-section">
      <p className="lp-sr-only">
        Supplai capabilities: facility requests, transfer visibility, stock
        coordination, rider handoffs, ward-level context, delivery proof, public
        ledger, and LGA operations.
      </p>
      <div className="lp-marquee">
        <div className="lp-marquee__track">
          <MarqueeGroup />
          <MarqueeGroup hidden />
        </div>
      </div>
    </div>
  );
}
