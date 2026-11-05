import {
  BellIcon,
  BoxIcon,
  CheckIcon,
  ClockIcon,
  HeartPulseIcon,
  PinIcon,
  RouteIcon,
  ShieldCheckIcon,
} from './icons';

function HomeIcon(props: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={props.className}
    >
      <path d="m4 11 8-7 8 7v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8Z" />
      <path d="M9.5 20v-6h5v6" />
    </svg>
  );
}

export default function PhoneMockup() {
  return (
    <div
      className="lp-phone"
      role="img"
      aria-label="Illustrative preview of the Supplai app showing a live delivery route and an order progress card."
    >
      <div className="lp-phone__screen">
        <div className="lp-phone__status" aria-hidden="true">
          <span>9:41</span>
          <span className="lp-phone__status-icons">
            <i />
            <i />
            <i />
          </span>
        </div>

        <div className="lp-phone__appbar">
          <span className="lp-phone__mark" aria-hidden="true">
            S
          </span>
          <span className="lp-phone__name">supplai</span>
          <span className="lp-phone__bell" aria-hidden="true">
            <BellIcon />
          </span>
        </div>

        <div className="lp-phone__body">
          <p className="lp-phone__eyebrow">LIVE ORDER</p>
          <h3 className="lp-phone__title">On the way to you</h3>

          <div className="lp-phone__map">
            <svg
              viewBox="0 0 260 150"
              className="lp-phone__map-svg"
              aria-hidden="true"
            >
              <path
                className="lp-phone__road"
                d="M0 40h260M0 92h260M54 0v150M168 0v150"
              />
              <path
                className="lp-phone__route"
                d="M42 124c22-8 24-38 52-42s40 18 60-4 10-40 40-44"
              />
              <circle className="lp-phone__node" cx="42" cy="124" r="6" />
              <circle className="lp-phone__node" cx="194" cy="34" r="6" />
              <g transform="translate(128 78)">
                <path
                  d="M0-20c-9 0-16 7-16 16 0 12 16 27 16 27s16-15 16-27c0-9-7-16-16-16Z"
                  fill="var(--brand-red)"
                  stroke="var(--brand-blue-deep)"
                  strokeWidth="3"
                />
                <circle
                  cx="0"
                  cy="-4"
                  r="5"
                  fill="var(--surface)"
                  stroke="var(--brand-blue-deep)"
                  strokeWidth="3"
                />
              </g>
            </svg>
            <span className="lp-phone__live">
              <i /> Rider nearby
            </span>
          </div>

          <div className="lp-phone__card">
            <div className="lp-phone__card-top">
              <span className="lp-phone__card-icon">
                <BoxIcon />
              </span>
              <div>
                <strong>Order in progress</strong>
                <small>Prescription order · 2 items</small>
              </div>
              <CheckIcon className="lp-phone__card-check" />
            </div>

            <div className="lp-phone__steps">
              <span className="is-done">Confirmed</span>
              <span className="is-done">Packed</span>
              <span className="is-current">On the way</span>
              <span>Delivered</span>
            </div>
          </div>

          <div className="lp-phone__row">
            <span className="lp-phone__row-icon">
              <ShieldCheckIcon />
            </span>
            <div>
              <strong>Pharmacist verified</strong>
              <small>Prescription checked before dispatch</small>
            </div>
          </div>

          <div className="lp-phone__row">
            <span className="lp-phone__row-icon lp-phone__row-icon--green">
              <ClockIcon />
            </span>
            <div>
              <strong>Refill reminder</strong>
              <small>Set a reminder for your next order</small>
            </div>
          </div>
        </div>

        <div className="lp-phone__tabs" aria-hidden="true">
          <span className="is-active">
            <HomeIcon />
            Home
          </span>
          <span>
            <RouteIcon />
            Orders
          </span>
          <span>
            <HeartPulseIcon />
            Health
          </span>
          <span>
            <PinIcon />
            Addresses
          </span>
        </div>
      </div>
    </div>
  );
}
