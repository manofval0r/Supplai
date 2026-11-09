'use client';

import { useEffect, useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBoxesStacked,
  faBuilding,
  faCircleCheck,
  faCircleExclamation,
  faClipboardList,
  faArrowLeft,
  faBars,
  faGear,
  faHouse,
  faMoon,
  faRoute,
  faRightFromBracket,
  faSackDollar,
  faSun,
  faTriangleExclamation,
  faTruckFast,
  faUser,
  faBell,
  faComments,
  faPrescriptionBottleMedical,
  faTablets,
} from '@fortawesome/free-solid-svg-icons';

import {
  fixtureFacilities,
  fixtureFailures,
  fixtureMedicines,
  fixtureOverview,
  fixtureStock,
  getStockPosition,
} from './data/fixtures';
import { loadLiveDashboard } from './data/api';
import {
  getWardLocations,
  locationLgas,
  locationStates,
} from './data/locations';
import nigeriaMapHtml from '../Nigeria_Map_14e11598.html?raw';
import { transferStatusLabel } from './lib/statusLabels';
import LandingPage from './components/landing/LandingPage';
import { MapLibreMap } from './components/MapLibreMap';
import { NotificationDrawer } from './components/NotificationDrawer';
import { ChatAssistantDrawer } from './components/ChatAssistantDrawer';
import {
  TransferDetailModal,
  type TransferDetailData,
} from './components/TransferDetailModal';
import { ScenarioLabControls } from './components/ScenarioLabControls';
import { RequestStockModal } from './components/RequestStockModal';
import {
  StatTile,
  Badge,
  Button,
  SearchField,
  BottomNav,
  MedicineCard,
  OrderTimeline,
  EmptyState,
  IconChip,
} from './components/ui';

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
    () =>
      (typeof window !== 'undefined'
        ? (window.localStorage.getItem('supplai-theme') as Theme)
        : null) || 'light',
  );
  const [showLanding, setShowLanding] = useState(true);
  const [isPageTransitioning, setIsPageTransitioning] = useState(false);
  const [activeNav, setActiveNav] = useState('Overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [overview, setOverview] = useState(fixtureOverview);
  const [failures, setFailures] = useState(fixtureFailures);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadAlertCount, setUnreadAlertCount] = useState(3);
  const [chatOpen, setChatOpen] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [selectedTransfer, setSelectedTransfer] =
    useState<TransferDetailData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [requestMedicineId, setRequestMedicineId] = useState<string | null>(
    null,
  );

  const showActionFeedback = (message: string) => {
    setActionFeedback(message);
    window.setTimeout(() => setActionFeedback(null), 4200);
  };

  const transitionTo = (callback: () => void) => {
    setIsPageTransitioning(true);
    window.setTimeout(() => {
      callback();
    }, 180);
    window.setTimeout(() => setIsPageTransitioning(false), 320);
  };

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('supplai-theme', theme);
  }, [theme]);

  useEffect(() => {
    const scriptId = 'aidesigner-effects-runtime';
    if (document.getElementById(scriptId)) return;
    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://cdn.aidesigner.ai/effects/runtime/v1.js';
    script.async = true;
    document.body.appendChild(script);
    return () => script.remove();
  }, []);

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
      } catch (error) {
        if (
          !active ||
          (error instanceof DOMException && error.name === 'AbortError')
        )
          return;
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

  const query = searchQuery.trim().toLowerCase();
  const matches = (...fields: (string | undefined)[]) =>
    !query || fields.some((field) => field?.toLowerCase().includes(query));
  const facilityName = (id: string) =>
    fixtureFacilities.find((entry) => entry.id === id)?.name;
  const medicineName = (id: string) =>
    fixtureMedicines.find((entry) => entry.id === id)?.name;

  const visibleTransfers = overview.transfers.filter((transfer) =>
    matches(
      transfer.reference,
      transfer.fromFacility,
      transfer.toFacility,
      transfer.drug,
      transfer.status,
    ),
  );
  const visibleStockouts = stockouts.filter((item) =>
    matches(facilityName(item.facilityId), medicineName(item.medicineId)),
  );
  const visibleFacilities = fixtureFacilities.filter((facility) =>
    matches(facility.name, facility.ward),
  );
  const visibleFailures = failures.filter((failure) =>
    matches(failure.reference, failure.detail, failure.category),
  );

  if (showLanding) {
    return (
      <>
        {isPageTransitioning && (
          <div className="page-transition" aria-hidden="true" />
        )}
        <LandingPage
          onOpenDashboard={() => transitionTo(() => setShowLanding(false))}
        />
      </>
    );
  }

  return (
    <>
      {isPageTransitioning && (
        <div className="page-transition" aria-hidden="true" />
      )}
      <div
        className={`app-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}
      >
        <a className="skip-link" href="#main-content">
          Skip to main content
        </a>
        <aside className="nav-rail" aria-label="Primary navigation">
          <div className="brand">
            <span className="brand-mark">S</span>
            <span className="nav-label">supplai</span>
          </div>
          <button
            className="sidebar-toggle"
            aria-label={
              sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'
            }
            onClick={() => setSidebarCollapsed((current) => !current)}
          >
            <FontAwesomeIcon icon={faBars} />
          </button>
          <div className="lga-label">
            <span className="nav-label">DEMO-LGA </span>
            <span className="live-dot" />{' '}
            <span className="nav-label">LIVE</span>
          </div>
          <nav>
            {navItems.map(([label, icon]) => (
              <button
                className={
                  activeNav === label ? 'nav-item is-active' : 'nav-item'
                }
                key={label}
                onClick={() => transitionTo(() => setActiveNav(label))}
              >
                <span aria-hidden="true">
                  <FontAwesomeIcon icon={icon} />
                </span>
                <span className="nav-label">{label}</span>
                {label === 'Operations' && (
                  <b className="nav-count">{failures.length}</b>
                )}
              </button>
            ))}
          </nav>
          <button
            type="button"
            className="alert-center-button"
            onClick={() => setNotificationsOpen(true)}
            aria-label={`Open alerts${unreadAlertCount ? `, ${unreadAlertCount} unread` : ''}`}
          >
            <FontAwesomeIcon icon={faBell} aria-hidden="true" />
            <span className="nav-label">Alerts</span>
            {unreadAlertCount > 0 && <b>{unreadAlertCount}</b>}
          </button>
          <div className="sidebar-settings">
            <button
              className={settingsOpen ? 'nav-item is-active' : 'nav-item'}
              onClick={() => setSettingsOpen((current) => !current)}
              aria-expanded={settingsOpen}
            >
              <span aria-hidden="true">
                <FontAwesomeIcon icon={faGear} />
              </span>
              <span className="nav-label">Settings</span>
            </button>
            {settingsOpen && (
              <div className="settings-menu">
                <button className="settings-item">
                  <FontAwesomeIcon icon={faUser} />
                  <span className="nav-label">Profile</span>
                </button>
                <button
                  className="settings-item"
                  onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                >
                  <FontAwesomeIcon icon={theme === 'light' ? faMoon : faSun} />
                  <span className="nav-label">
                    Theme: {theme === 'light' ? 'Light' : 'Dark'}
                  </span>
                </button>
              </div>
            )}
          </div>
          <div className="nav-footer">
            <span className="avatar">AO</span>
            <div className="nav-label">
              <strong>Akolo</strong>
              <small>Health operations</small>
            </div>
            <button
              className="logout-button"
              aria-label="Log out"
              onClick={() => {
                setActiveNav('Overview');
                transitionTo(() => setShowLanding(true));
              }}
            >
              <FontAwesomeIcon icon={faRightFromBracket} />
              <span className="nav-label">Logout</span>
            </button>
          </div>
        </aside>
        <main id="main-content">
          <header className="topbar">
            <div className="topbar-title">
              <p className="eyebrow">LGA COMMAND CENTER</p>
              <h1>{activeNav}</h1>
            </div>
            <SearchField
              value={searchQuery}
              onChange={setSearchQuery}
              className="topbar-search"
            />
            <div className="topbar-actions">
              {activeNav !== 'Overview' && (
                <Button
                  variant="ghost"
                  size="sm"
                  icon={faArrowLeft}
                  className="back-dashboard-button"
                  onClick={() => setActiveNav('Overview')}
                >
                  Back
                </Button>
              )}
              <Button
                variant="ghost"
                icon={faBell}
                className={`topbar-btn ${notificationsOpen ? 'is-active' : ''}`}
                onClick={() => setNotificationsOpen(true)}
                aria-label="Alerts"
              >
                <span className="topbar-btn__label">Alerts</span>
                {unreadAlertCount > 0 && (
                  <span className="badge-count">{unreadAlertCount}</span>
                )}
              </Button>
              <Button
                variant="ghost"
                icon={faComments}
                className={`topbar-btn ${chatOpen ? 'is-active' : ''}`}
                onClick={() => setChatOpen(true)}
                aria-label="LGA Assistant"
              >
                <span className="topbar-btn__label">Assistant</span>
              </Button>
            </div>
          </header>
          <div
            className={`content ${activeNav !== 'Overview' ? 'service-page' : ''}`}
          >
            <ScenarioLabControls />
            <section className="metric-grid" aria-label="LGA summary metrics">
              <StatTile
                label="Open stockouts"
                value={formatMetric(overview.metrics.openStockouts, 'number')}
                caption="Facilities below minimum"
                icon={faCircleExclamation}
                tone="alert"
              />
              <StatTile
                label="Transfers in flight"
                value={formatMetric(
                  overview.metrics.transfersInFlight,
                  'number',
                )}
                caption="Moving between facilities"
                icon={faTruckFast}
                tone="route"
              />
              <StatTile
                label="Completed transfers"
                value={formatMetric(
                  overview.metrics.completedTransfers,
                  'number',
                )}
                caption="This month"
                icon={faCircleCheck}
                tone="done"
              />
              <StatTile
                label="Unmet requests"
                value={formatMetric(overview.metrics.unmetRequests, 'number')}
                caption="Need operator attention"
                icon={faCircleExclamation}
                tone="warning"
              />
              <StatTile
                label="Response rate"
                value={formatMetric(overview.metrics.responseRate, 'percent')}
                caption="Offers answered by facilities"
                icon={faSackDollar}
                tone="rate"
              />
            </section>
            <div className="dashboard-grid">
              <section className="panel attention-panel">
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow">NEEDS ATTENTION</p>
                    <h3>Stockouts to resolve</h3>
                  </div>
                  <button
                    className="text-button"
                    onClick={() => setActiveNav('Stock')}
                  >
                    View all
                  </button>
                </div>
                {visibleStockouts.length === 0 ? (
                  <EmptyState
                    icon={faCircleCheck}
                    title="No stockouts match"
                    text="Every clinic is above its safety floor for this search."
                  />
                ) : (
                  visibleStockouts.map((item) => {
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
                        <IconChip
                          icon={faTriangleExclamation}
                          tone="warning"
                          size="sm"
                        />
                        <div>
                          <strong>{facility?.name}</strong>
                          <small>{medicine?.name}</small>
                        </div>
                        <b>
                          {item.onHand} / {item.minimum}
                        </b>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="row-action"
                          aria-label={`Review ${facility?.name}`}
                          onClick={() => setRequestMedicineId(item.medicineId)}
                        >
                          Review
                        </Button>
                      </div>
                    );
                  })
                )}
              </section>
              <section className="panel map-panel">
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow">FACILITY NETWORK & CORRIDOR</p>
                    <h3>Live LGA Corridor Map</h3>
                  </div>
                  <span className="facility-count">
                    {fixtureFacilities.length} facilities
                  </span>
                </div>
                <MapLibreMap onAction={showActionFeedback} />
              </section>
              <section className="panel transfer-panel">
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow">ACTIVE TRANSFERS</p>
                    <h3>Moving now</h3>
                  </div>
                  <button
                    className="text-button"
                    onClick={() => setActiveNav('Transfers')}
                  >
                    All transfers
                  </button>
                </div>
                {visibleTransfers
                  .filter((transfer) => transfer.status !== 'delivered')
                  .map((transfer) => (
                    <div
                      className="transfer-card"
                      key={transfer.id}
                      onClick={() =>
                        setSelectedTransfer({
                          id: transfer.id,
                          reference: transfer.reference,
                          status: transfer.status,
                          drug:
                            transfer.drug === 'Oral Rehydration Salts'
                              ? 'ORS sachets'
                              : 'Zinc tablets',
                          quantity: transfer.quantity,
                          fromFacility: transfer.fromFacility,
                          toFacility: transfer.toFacility,
                          batchNumber: 'B209',
                          expiryDate: '10/2027',
                          sealNumber: '7842',
                          courierName: 'Ade Okafor',
                          etaMinutes: 4,
                        })
                      }
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          event.currentTarget.click();
                        }
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="transfer-card__top">
                        <span className="transfer-ref">
                          {transfer.reference}
                        </span>
                        <Badge status={transfer.status}>
                          {transferStatusLabel(transfer.status)}
                        </Badge>
                      </div>
                      <div className="transfer-route">
                        <strong>{transfer.fromFacility}</strong>
                        <span className="transfer-connector">to</span>
                        <strong>{transfer.toFacility}</strong>
                      </div>
                      <OrderTimeline
                        orientation="horizontal"
                        currentIndex={2}
                        steps={[
                          { title: 'Reserved' },
                          { title: 'Dispatched' },
                          { title: 'In transit' },
                          { title: 'Delivered' },
                        ]}
                      />
                      <small>
                        {transfer.quantity}{' '}
                        {transfer.drug === 'Oral Rehydration Salts'
                          ? 'ORS sachets'
                          : 'Zinc tablets'}{' '}
                        · Rider assigned · Tap to manage
                      </small>
                    </div>
                  ))}
                {visibleTransfers.filter((t) => t.status !== 'delivered')
                  .length === 0 && (
                  <EmptyState
                    icon={faTruckFast}
                    title="No active transfers match"
                    text="Adjust your search or start a new stock request."
                  />
                )}
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
                  visibleTransfers.map((transfer) => (
                    <div
                      className="table-row"
                      key={transfer.id}
                      onClick={() =>
                        setSelectedTransfer({
                          id: transfer.id,
                          reference: transfer.reference,
                          status: transfer.status,
                          drug: transfer.drug,
                          quantity: transfer.quantity,
                          fromFacility: transfer.fromFacility,
                          toFacility: transfer.toFacility,
                          batchNumber: 'B209',
                          expiryDate: '10/2027',
                          sealNumber: '7842',
                          courierName: 'Ade Okafor',
                          etaMinutes: 4,
                        })
                      }
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          event.currentTarget.click();
                        }
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <strong>{transfer.reference}</strong>
                      <span>
                        {transfer.fromFacility} to {transfer.toFacility}
                      </span>
                      <span>
                        {transfer.quantity} · {transfer.drug}
                      </span>
                      <Badge status={transfer.status} />
                    </div>
                  ))}
                {activeNav === 'Transfers' && visibleTransfers.length === 0 && (
                  <EmptyState
                    icon={faRoute}
                    title="No transfers match"
                    text="Try a different reference, facility or medicine."
                  />
                )}
                {activeNav === 'Operations' &&
                  visibleFailures.map((failure) => (
                    <div className="table-row" key={failure.id}>
                      <strong>{failure.reference}</strong>
                      <span>{failure.detail}</span>
                      <Badge status={failure.category} />
                    </div>
                  ))}
                {activeNav === 'Operations' && visibleFailures.length === 0 && (
                  <EmptyState
                    icon={faCircleCheck}
                    title="No failures match"
                    text="Operational exceptions will appear here."
                  />
                )}
                {activeNav === 'Stock' && (
                  <div className="medicine-grid">
                    {fixtureMedicines
                      .filter((medicine) =>
                        matches(medicine.name, medicine.unit),
                      )
                      .map((medicine) => {
                        const position = getStockPosition('PHC-B', medicine.id);
                        const onHand = position?.onHand ?? 0;
                        const minimum = position?.minimum ?? 0;
                        const transferable = Math.max(0, onHand - minimum);
                        const availability =
                          onHand <= 0
                            ? { tone: 'danger' as const, label: 'Stockout' }
                            : onHand < minimum
                              ? { tone: 'warning' as const, label: 'Low stock' }
                              : { tone: 'success' as const, label: 'In stock' };
                        return (
                          <MedicineCard
                            key={medicine.id}
                            name={medicine.name}
                            strength={
                              medicine.id === 'MED-ORS'
                                ? '20.5 g · oral rehydration salts'
                                : '20 mg · dispersible tablet'
                            }
                            icon={
                              medicine.id === 'MED-ORS'
                                ? faPrescriptionBottleMedical
                                : faTablets
                            }
                            onHand={onHand}
                            unit={medicine.unit}
                            availability={availability}
                            transferable={transferable}
                            etaLabel="7 MIN"
                            onRequest={() => setRequestMedicineId(medicine.id)}
                          />
                        );
                      })}
                  </div>
                )}
                {activeNav === 'Stock' &&
                  visibleStockouts.map((item) => (
                    <div
                      className="table-row"
                      key={`${item.facilityId}-${item.medicineId}`}
                    >
                      <strong>{facilityName(item.facilityId)}</strong>
                      <span>{medicineName(item.medicineId)}</span>
                      <span>
                        {item.onHand} / {item.minimum}
                      </span>
                      <Badge status="stockout" />
                    </div>
                  ))}
                {activeNav === 'Requests' && (
                  <EmptyState
                    icon={faClipboardList}
                    title="No request detail route is available yet."
                    text="The API contract currently exposes aggregate unmet-request metrics only."
                    action={
                      <Button
                        variant="primary"
                        icon={faPrescriptionBottleMedical}
                        onClick={() => setRequestMedicineId('MED-ORS')}
                      >
                        Request stock
                      </Button>
                    }
                  />
                )}
                {activeNav === 'Facilities' && (
                  <>
                    <NigeriaMap />
                    <WardMap />
                    <div className="facility-grid">
                      {visibleFacilities.map((facility) => (
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
                    {visibleFacilities.length === 0 && (
                      <EmptyState
                        icon={faBuilding}
                        title="No facilities match"
                        text="Try a different facility name or ward."
                      />
                    )}
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
                  <button
                    className="text-button"
                    onClick={() => setActiveNav('Stock')}
                  >
                    Stock view
                  </button>
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
        <BottomNav
          items={navItems.map(([label, icon]) => ({
            label,
            icon,
            badge: label === 'Operations' ? failures.length : undefined,
          }))}
          active={activeNav}
          onSelect={(label) => transitionTo(() => setActiveNav(label))}
        />
        <button
          className="help-button"
          aria-label="Open Supplai Assistant"
          onClick={() => setChatOpen(true)}
        >
          <FontAwesomeIcon icon={faComments} />
        </button>
        {actionFeedback && (
          <div className="app-toast" role="status">
            <FontAwesomeIcon icon={faCircleCheck} />
            <span>{actionFeedback}</span>
          </div>
        )}

        <NotificationDrawer
          isOpen={notificationsOpen}
          onClose={() => setNotificationsOpen(false)}
          onUnreadCountChange={setUnreadAlertCount}
          onSelectOrder={(ref) => {
            const found = overview.transfers.find((t) => t.reference === ref);
            if (found) {
              setSelectedTransfer({
                id: found.id,
                reference: found.reference,
                status: found.status,
                drug: found.drug,
                quantity: found.quantity,
                fromFacility: found.fromFacility,
                toFacility: found.toFacility,
                batchNumber: 'B209',
                expiryDate: '10/2027',
                sealNumber: '7842',
                courierName: 'Ade Okafor',
                etaMinutes: 4,
              });
            }
          }}
        />

        <ChatAssistantDrawer
          isOpen={chatOpen}
          onClose={() => setChatOpen(false)}
          onRequestTransfer={(facName, drug, qty) => {
            showActionFeedback(
              `Initiating transfer request: ${qty} units of ${drug} from ${facName}. Dispatching to local queue.`,
            );
          }}
        />

        <TransferDetailModal
          transfer={selectedTransfer}
          onClose={() => setSelectedTransfer(null)}
        />

        <RequestStockModal
          medicineId={requestMedicineId}
          onClose={() => setRequestMedicineId(null)}
          onConfirm={(facName, drug, qty) => {
            showActionFeedback(
              `Initiating transfer request: ${qty} units of ${drug} from ${facName}. Dispatching to local queue.`,
            );
          }}
        />
      </div>
    </>
  );
}
