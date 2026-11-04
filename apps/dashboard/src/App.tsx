import { useEffect, useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBoxesStacked,
  faBuilding,
  faCircleCheck,
  faCircleExclamation,
  faClipboardList,
  faHouse,
  faMoon,
  faRoute,
  faSackDollar,
  faSun,
  faTriangleExclamation,
  faTruckFast,
} from '@fortawesome/free-solid-svg-icons';

import {
  fixtureFacilities,
  fixtureFailures,
  fixtureMedicines,
  fixtureOverview,
  fixtureStock,
  getStockPosition,
} from './data/fixtures.js';
import { loadLiveDashboard } from './data/api.js';
import {
  getWardLocations,
  locationLgas,
  locationStates,
} from './data/locations.js';
import nigeriaMapHtml from '../Nigeria_Map_14e11598.html?raw';
import { transferStatusLabel } from './lib/statusLabels.js';
import './styles.css';

type Theme = 'light' | 'dark';

const navItems = [
  ['Overview', faHouse],
  ['Transfers', faRoute],
  ['Requests', faClipboardList],
  ['Stock', faBoxesStacked],
  ['Facilities', faBuilding],
  ['Operations', faTriangleExclamation],
] as const;

function formatMetric(value: number, metric: 'number' | 'percent') {
  return metric === 'percent'
    ? `${Math.round(value * 100)}%`
    : value.toString();
}

function StatusPill({ status }: { status: string }) {
  return <span className={`status status-${status}`}>{status}</span>;
}

function StockBar({
  facilityId,
  medicineId,
}: {
  facilityId: string;
  medicineId: string;
}) {
  const position = getStockPosition(facilityId, medicineId);
  if (!position) return null;
  const width = Math.min(
    100,
    (position.onHand / Math.max(position.minimum, 1)) * 100,
  );
  const surplus = Math.max(0, position.onHand - position.minimum);
  return (
    <div className="stock-row">
      <div className="stock-row__label">
        <span>
          {
            fixtureFacilities.find((facility) => facility.id === facilityId)
              ?.name
          }
        </span>
        <strong>{position.onHand} on hand</strong>
      </div>
      <div
        className="stock-track"
        aria-label={`${position.onHand} on hand, ${surplus} transferable surplus`}
      >
        <span
          className={
            position.onHand < position.minimum
              ? 'stock-fill is-low'
              : 'stock-fill'
          }
          style={{ width: `${width}%` }}
        />
      </div>
      <small>
        {surplus > 0 ? `${surplus} transferable surplus` : 'Below minimum'}
      </small>
    </div>
  );
}

function NigeriaMap() {
  const [hoveredRegion, setHoveredRegion] = useState('');
  const svg = nigeriaMapHtml.match(/<svg[\s\S]*<\/svg>/)?.[0] ?? '';

  return (
    <div
      className="nigeria-map"
      aria-label="Map of Nigeria with request region"
      onMouseMove={(event) => {
        const target = event.target;
        if (target instanceof SVGPathElement) {
          setHoveredRegion(target.getAttribute('name') ?? '');
        }
      }}
      onMouseLeave={() => setHoveredRegion('')}
    >
      <div
        className="nigeria-map__svg"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      <span
        className="request-marker"
        title="Request region: Lagos"
        role="img"
        aria-label="Request region: Lagos"
        onMouseEnter={() => setHoveredRegion('Lagos')}
      />
      {hoveredRegion && (
        <div className="map-tooltip" role="status">
          {hoveredRegion}
        </div>
      )}
      <div className="map-request-label">
        <i /> Request region: <strong>Lagos</strong>
      </div>
    </div>
  );
}

function HeroNetwork() {
  return (
    <div className="hero-network" aria-hidden="true">
      <div className="hero-orbit hero-orbit-one" />
      <div className="hero-orbit hero-orbit-two" />
      <div className="hero-glow" />
      <div className="hero-network-grid" />
      {fixtureFacilities.map((facility, index) => (
        <span
          className={`hero-node hero-node-${index % 4}`}
          key={facility.id}
          style={{
            left: `${facility.coordinates.x}%`,
            top: `${facility.coordinates.y}%`,
          }}
        >
          <i />
        </span>
      ))}
      <svg viewBox="0 0 100 70" preserveAspectRatio="none">
        <path d="M18 42 Q 28 20 42 25 T 70 18" />
        <path d="M42 25 Q 55 42 82 45" />
        <path d="M15 66 Q 38 56 53 45 T 63 68" />
      </svg>
    </div>
  );
}

function WardMap() {
  const [state, setState] = useState('Lagos');
  const [lga, setLga] = useState(() => locationLgas.Lagos?.[0] ?? '');
  const [ward, setWard] = useState('');
  const lgaOptions = locationLgas[state] ?? [];
  const locations = getWardLocations(state, lga);
  const selected = locations.find((item) => item.Ward === ward) ?? locations[0];
  const minLat = Math.min(
    ...locations.map((item) => item.Latitude),
    selected?.Latitude ?? 0,
  );
  const maxLat = Math.max(
    ...locations.map((item) => item.Latitude),
    selected?.Latitude ?? 1,
  );
  const minLng = Math.min(
    ...locations.map((item) => item.Longitude),
    selected?.Longitude ?? 0,
  );
  const maxLng = Math.max(
    ...locations.map((item) => item.Longitude),
    selected?.Longitude ?? 1,
  );
  const projectX = (longitude: number) =>
    8 + ((longitude - minLng) / Math.max(maxLng - minLng, 0.0001)) * 84;
  const projectY = (latitude: number) =>
    84 - ((latitude - minLat) / Math.max(maxLat - minLat, 0.0001)) * 68;

  useEffect(() => {
    setLga(locationLgas[state]?.[0] ?? '');
    setWard('');
  }, [state]);

  return (
    <div className="ward-explorer">
      <div className="ward-controls">
        <label>
          State
          <select
            value={state}
            onChange={(event) => setState(event.target.value)}
          >
            {locationStates.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label>
          LGA
          <select
            value={lga}
            onChange={(event) => {
              setLga(event.target.value);
              setWard('');
            }}
          >
            {lgaOptions.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label>
          Ward
          <select
            value={ward}
            onChange={(event) => setWard(event.target.value)}
          >
            <option value="">All wards</option>
            {locations.map((item) => (
              <option key={item.Ward}>{item.Ward}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="ward-map-wrap">
        <svg
          className="ward-map"
          viewBox="0 0 100 90"
          role="img"
          aria-label={`${state}, ${lga} ward map`}
        >
          <path
            className="ward-map-grid"
            d="M5 15H95M5 35H95M5 55H95M5 75H95M15 5V85M35 5V85M55 5V85M75 5V85M95 5V85"
          />
          {locations.map((item) => {
            const active = !ward || ward === item.Ward;
            return (
              <circle
                key={item.Ward}
                className={active ? 'ward-point' : 'ward-point is-muted'}
                cx={projectX(item.Longitude)}
                cy={projectY(item.Latitude)}
                r={ward === item.Ward ? 3.2 : 2}
              />
            );
          })}
        </svg>
        <div className="ward-map-caption">
          <strong>{selected?.Ward ?? 'No ward data'}</strong>
          <span>
            {locations.length} wards mapped in {lga}, {state}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem('supplai-theme') as Theme) || 'light',
  );
  const [activeNav, setActiveNav] = useState('Overview');
  const [notice, setNotice] = useState('');
  const [overview, setOverview] = useState(fixtureOverview);
  const [failures, setFailures] = useState(fixtureFailures);
  const [dataMode, setDataMode] = useState<'fixture' | 'live' | 'fallback'>(
    'fixture',
  );
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('supplai-theme', theme);
  }, [theme]);

  useEffect(() => {
    let active = true;
    let controller: AbortController | undefined;
    const refresh = async () => {
      controller?.abort();
      controller = new AbortController();
      try {
        const live = await loadLiveDashboard(controller.signal);
        if (!active) return;
        setOverview(live.overview);
        setFailures(live.failures);
        setDataMode('live');
        setApiError('');
      } catch (error) {
        if (
          !active ||
          (error instanceof DOMException && error.name === 'AbortError')
        )
          return;
        setDataMode((current) => (current === 'live' ? 'fallback' : 'fixture'));
        setApiError(
          error instanceof Error ? error.message : 'Live API is unavailable.',
        );
      }
    };
    void refresh();
    const interval = window.setInterval(() => void refresh(), 10_000);
    return () => {
      active = false;
      controller?.abort();
      window.clearInterval(interval);
    };
  }, []);

  const stockouts = useMemo(
    () => fixtureStock.filter((item) => item.onHand < item.minimum).slice(0, 4),
    [],
  );

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <aside className="nav-rail" aria-label="Primary navigation">
        <div className="brand">
          <span className="brand-mark">S</span>
          <span>supplai</span>
        </div>
        <div className="lga-label">
          DEMO-LGA <span className="live-dot" /> LIVE
        </div>
        <nav>
          {navItems.map(([label, icon]) => (
            <button
              className={
                activeNav === label ? 'nav-item is-active' : 'nav-item'
              }
              key={label}
              onClick={() => setActiveNav(label)}
            >
              <span aria-hidden="true">
                <FontAwesomeIcon icon={icon} />
              </span>
              {label}
              {label === 'Operations' && (
                <b className="nav-count">{failures.length}</b>
              )}
            </button>
          ))}
        </nav>
        <div className="nav-footer">
          <span className="avatar">AO</span>
          <div>
            <strong>Akolo</strong>
            <small>Health operations</small>
          </div>
        </div>
      </aside>
      <main id="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">LGA COMMAND CENTER</p>
            <h1>{activeNav}</h1>
          </div>
          <div className="topbar-actions">
            <span className={`mode-badge mode-${dataMode}`}>
              <i />{' '}
              {dataMode === 'live'
                ? 'Live'
                : dataMode === 'fallback'
                  ? 'Fixture (API unreachable)'
                  : 'Fixture mode'}
            </span>
            <button
              className="icon-button"
              aria-label="Toggle dark theme"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            >
              <FontAwesomeIcon icon={theme === 'light' ? faMoon : faSun} />
            </button>
            <button className="help-button">?</button>
          </div>
        </header>
        <div
          className={`content ${activeNav !== 'Overview' ? 'service-page' : ''}`}
        >
          {apiError && (
            <div className="notice notice-warning" role="alert">
              {apiError}
              <button onClick={() => window.location.reload()}>
                Retry live
              </button>
            </div>
          )}
          {notice && (
            <div className="notice" role="status">
              {notice}
              <button onClick={() => setNotice('')}>Dismiss</button>
            </div>
          )}
          <section className="hero-stage">
            <div className="hero-stage__copy">
              <p className="hero-kicker">
                <span /> SUPPLAI OPERATIONS CLOUD
              </p>
              <h2>
                Move essential stock
                <span> where it matters.</span>
              </h2>
              <p className="hero-stage__description">
                A live command center for faster, more accountable medicine
                transfers across your LGA.
              </p>
              <div className="hero-actions">
                <button
                  className="hero-cta"
                  onClick={() =>
                    document
                      .getElementById('operations-story')
                      ?.scrollIntoView({ behavior: 'smooth' })
                  }
                >
                  Open live operations
                </button>
                <span className="hero-note">
                  <i /> {fixtureFacilities.length} public facilities connected
                </span>
              </div>
            </div>
            <HeroNetwork />
          </section>
          <section className="hero-row" id="operations-story">
            <div>
              <h2>Good morning, Akolo</h2>
              <p>Here is what needs attention across the LGA today.</p>
            </div>
            <button
              className="primary-button"
              onClick={() => setNotice('Fixture data refreshed just now.')}
            >
              Refresh data
            </button>
          </section>
          <section className="metric-grid" aria-label="LGA summary metrics">
            {[
              [
                'Open stockouts',
                overview.metrics.openStockouts,
                'Facilities below minimum',
                'number',
                'alert',
              ],
              [
                'Transfers in flight',
                overview.metrics.transfersInFlight,
                'Moving between facilities',
                'number',
                'route',
              ],
              [
                'Completed transfers',
                overview.metrics.completedTransfers,
                'This month',
                'number',
                'done',
              ],
              [
                'Unmet requests',
                overview.metrics.unmetRequests,
                'Need operator attention',
                'number',
                'warning',
              ],
              [
                'Response rate',
                overview.metrics.responseRate,
                'Offers answered by facilities',
                'percent',
                'rate',
              ],
            ].map(([label, value, caption, format, tone]) => (
              <article className={`metric-card tone-${tone}`} key={label}>
                <div className="metric-icon">
                  {tone === 'done' ? (
                    <FontAwesomeIcon icon={faCircleCheck} />
                  ) : tone === 'alert' ? (
                    <FontAwesomeIcon icon={faCircleExclamation} />
                  ) : tone === 'route' ? (
                    <FontAwesomeIcon icon={faTruckFast} />
                  ) : tone === 'warning' ? (
                    <FontAwesomeIcon icon={faCircleExclamation} />
                  ) : (
                    <FontAwesomeIcon icon={faSackDollar} />
                  )}
                </div>
                <p>{label}</p>
                <strong aria-live="polite">
                  {formatMetric(
                    value as number,
                    format as 'number' | 'percent',
                  )}
                </strong>
                <small>{caption}</small>
              </article>
            ))}
          </section>
          <div className="dashboard-grid">
            <section className="panel attention-panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">NEEDS ATTENTION</p>
                  <h3>Stockouts to resolve</h3>
                </div>
                <button className="text-button">View all</button>
              </div>
              {stockouts.map((item) => {
                const facility = fixtureFacilities.find(
                  (entry) => entry.id === item.facilityId,
                );
                const medicine = fixtureMedicines.find(
                  (entry) => entry.id === item.medicineId,
                );
                return (
                  <div
                    className="attention-row"
                    key={`${item.facilityId}-${item.medicineId}`}
                  >
                    <span className="warning-icon">
                      <FontAwesomeIcon icon={faTriangleExclamation} />
                    </span>
                    <div>
                      <strong>{facility?.name}</strong>
                      <small>{medicine?.name}</small>
                    </div>
                    <b>
                      {item.onHand} / {item.minimum}
                    </b>
                    <button
                      className="row-action"
                      aria-label={`Review ${facility?.name}`}
                    >
                      Review
                    </button>
                  </div>
                );
              })}
            </section>
            <section className="panel map-panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">FACILITY NETWORK</p>
                  <h3>Live LGA position</h3>
                </div>
                <span className="facility-count">
                  {fixtureFacilities.length} facilities
                </span>
              </div>
              <NigeriaMap />
            </section>
            <section className="panel transfer-panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">ACTIVE TRANSFERS</p>
                  <h3>Moving now</h3>
                </div>
                <button className="text-button">All transfers</button>
              </div>
              {overview.transfers
                .filter((transfer) => transfer.status !== 'delivered')
                .map((transfer) => (
                  <div className="transfer-card" key={transfer.id}>
                    <div className="transfer-card__top">
                      <span className="transfer-ref">{transfer.reference}</span>
                      <StatusPill
                        status={transferStatusLabel(transfer.status)}
                      />
                    </div>
                    <div className="transfer-route">
                      <strong>{transfer.fromFacility}</strong>
                      <span className="transfer-connector">to</span>
                      <strong>{transfer.toFacility}</strong>
                    </div>
                    <div className="stepper">
                      <span className="done">Reserved</span>
                      <span className="done">Dispatched</span>
                      <span className="current">In transit</span>
                      <span>Delivered</span>
                    </div>
                    <small>
                      {transfer.quantity}{' '}
                      {transfer.drug === 'Oral Rehydration Salts'
                        ? 'ORS sachets'
                        : 'Zinc tablets'}{' '}
                      · Rider assigned
                    </small>
                  </div>
                ))}
            </section>
            <section className="panel feed-panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">LIVE ACTIVITY</p>
                  <h3>What just happened</h3>
                </div>
                <span className="live-label">
                  <i /> Live
                </span>
              </div>
              <div className="activity-feed" aria-live="polite">
                {[
                  [
                    '08:02',
                    'Delivery verified',
                    'Ajegunle PHC received 12 Zinc tablets',
                    'done',
                  ],
                  [
                    '07:58',
                    'Rider assigned',
                    'TRF-0042 is on the road to Aiyetoro',
                    'route',
                  ],
                  [
                    '07:51',
                    'Request matched',
                    'Idera PHC confirmed 20 ORS sachets',
                    'done',
                  ],
                  [
                    '07:45',
                    'Stockout detected',
                    'Aiyetoro Central PHC needs ORS',
                    'alert',
                  ],
                ].map(([time, title, detail, tone]) => (
                  <div className="activity-item" key={time}>
                    <span className={`activity-dot ${tone}`} />
                    <time>{time}</time>
                    <div>
                      <strong>{title}</strong>
                      <p>{detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
          {activeNav !== 'Overview' && (
            <section className="panel detail-panel" data-service={activeNav}>
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">{activeNav.toUpperCase()}</p>
                  <h3>
                    {activeNav === 'Transfers'
                      ? 'Transfer register'
                      : activeNav === 'Requests'
                        ? 'Requests needing follow-up'
                        : activeNav === 'Stock'
                          ? 'Stockout register'
                          : activeNav === 'Facilities'
                            ? 'Facility response network'
                            : 'Operational failures'}
                  </h3>
                </div>
                <span className="facility-count">
                  {activeNav === 'Operations'
                    ? `${failures.length} open`
                    : activeNav === 'Transfers'
                      ? `${overview.transfers.length} transfers`
                      : `${fixtureFacilities.length} facilities`}
                </span>
              </div>
              {activeNav === 'Transfers' &&
                overview.transfers.map((transfer) => (
                  <div className="table-row" key={transfer.id}>
                    <strong>{transfer.reference}</strong>
                    <span>
                      {transfer.fromFacility} to {transfer.toFacility}
                    </span>
                    <span>
                      {transfer.quantity} · {transfer.drug}
                    </span>
                    <StatusPill status={transfer.status} />
                  </div>
                ))}
              {activeNav === 'Operations' &&
                failures.map((failure) => (
                  <div className="table-row" key={failure.id}>
                    <strong>{failure.reference}</strong>
                    <span>{failure.detail}</span>
                    <StatusPill status={failure.category} />
                  </div>
                ))}
              {activeNav === 'Stock' &&
                stockouts.map((item) => (
                  <div
                    className="table-row"
                    key={`${item.facilityId}-${item.medicineId}`}
                  >
                    <strong>
                      {
                        fixtureFacilities.find(
                          (facility) => facility.id === item.facilityId,
                        )?.name
                      }
                    </strong>
                    <span>
                      {
                        fixtureMedicines.find(
                          (medicine) => medicine.id === item.medicineId,
                        )?.name
                      }
                    </span>
                    <span>
                      {item.onHand} / {item.minimum}
                    </span>
                    <StatusPill status="stockout" />
                  </div>
                ))}
              {activeNav === 'Requests' && (
                <div className="empty-state">
                  <span>◌</span>
                  <strong>No request detail route is available yet.</strong>
                  <p>
                    The API contract currently exposes aggregate unmet-request
                    metrics only.
                  </p>
                </div>
              )}
              {activeNav === 'Facilities' && (
                <>
                  <WardMap />
                  <div className="facility-grid">
                    {fixtureFacilities.map((facility) => (
                      <div className="facility-card" key={facility.id}>
                        <strong>{facility.name}</strong>
                        <small>{facility.ward} ward · Public ledger</small>
                        <b>
                          {Math.round(overview.metrics.responseRate * 100)}%
                          response rate
                        </b>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </section>
          )}
          {activeNav === 'Overview' && (
            <section className="panel stock-panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">STOCK POSITION</p>
                  <h3>Transferable surplus</h3>
                </div>
                <button className="text-button">Stock view</button>
              </div>
              <div className="stock-grid">
                <div>
                  <h4>ORS sachets</h4>
                  <StockBar facilityId="PHC-B" medicineId="MED-ORS" />
                  <StockBar facilityId="PHC-C" medicineId="MED-ORS" />
                </div>
                <div>
                  <h4>Zinc 20 mg tablets</h4>
                  <StockBar facilityId="PHC-B" medicineId="MED-ZINC" />
                  <StockBar facilityId="PHC-D" medicineId="MED-ZINC" />
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
