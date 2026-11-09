'use client';

import React, { useEffect, useRef, useState } from 'react';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Map as MapLibreInstance } from 'maplibre-gl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMapLocationDot,
  faLayerGroup,
  faTriangleExclamation,
  faLocationCrosshairs,
} from '@fortawesome/free-solid-svg-icons';

export type MapProvider = 'openfreemap' | 'osm-raster' | 'fallback';

interface FacilityLocation {
  id: string;
  name: string;
  ward: string;
  coords: [number, number]; // [lat, lng]
  status: 'critical' | 'donor' | 'normal';
  stockSummary: string;
}

const FACILITIES: FacilityLocation[] = [
  {
    id: 'PHC-A',
    name: 'Aiyetoro Central PHC',
    ward: 'Aiyetoro Ward',
    coords: [7.242, 3.036],
    status: 'critical',
    stockSummary: '0 ORS on hand (Min: 20)',
  },
  {
    id: 'PHC-B',
    name: 'Idera PHC (Demo PHC B)',
    ward: 'Idera Ward',
    coords: [7.2305, 3.0535],
    status: 'donor',
    stockSummary: '80 ORS on hand (60 surplus)',
  },
  {
    id: 'PHC-C',
    name: 'Ajegunle PHC',
    ward: 'Ajegunle Ward',
    coords: [7.251, 3.028],
    status: 'normal',
    stockSummary: '35 ORS on hand (15 surplus)',
  },
  {
    id: 'PHC-D',
    name: 'Oke-Odo PHC',
    ward: 'Oke-Odo Ward',
    coords: [7.228, 3.061],
    status: 'normal',
    stockSummary: '40 Zinc on hand (20 surplus)',
  },
];

const ROUTE_COORDINATES: [number, number][] = [
  [7.242, 3.036],
  [7.2412, 3.0378],
  [7.2398, 3.0396],
  [7.2386, 3.042],
  [7.2368, 3.0446],
  [7.235, 3.047],
  [7.2332, 3.0498],
  [7.2318, 3.0518],
  [7.2305, 3.0535],
];

export function MapLibreMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [provider, setProvider] = useState<MapProvider>('openfreemap');
  const [mapError, setMapError] = useState<string | null>(null);
  const [selectedFacility, setSelectedFacility] =
    useState<FacilityLocation | null>(null);
  const [progress, setProgress] = useState(0.42); // Rider position along route (0 to 1)

  // Interpolate rider coordinates based on progress
  const riderCoord = (() => {
    const idx = Math.min(
      Math.floor(progress * (ROUTE_COORDINATES.length - 1)),
      ROUTE_COORDINATES.length - 2,
    );
    const p1 = ROUTE_COORDINATES[idx] ?? ROUTE_COORDINATES[0]!;
    const p2 = ROUTE_COORDINATES[idx + 1] ?? ROUTE_COORDINATES[1]!;
    const segmentFraction = progress * (ROUTE_COORDINATES.length - 1) - idx;
    return [
      p1[0] + (p2[0] - p1[0]) * segmentFraction,
      p1[1] + (p2[1] - p1[1]) * segmentFraction,
    ] as [number, number];
  })();

  // Animate rider along route slowly
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => (prev >= 0.98 ? 0.05 : prev + 0.02));
    }, 1200);
    return () => clearInterval(timer);
  }, []);

  // Initialize MapLibre GL when not in fallback mode
  useEffect(() => {
    if (provider === 'fallback' || !containerRef.current) return;

    let mapInstance: MapLibreInstance | null = null;
    let isCancelled = false;

    async function initMap() {
      try {
        const maplibre = await import('maplibre-gl');
        if (isCancelled || !containerRef.current) return;

        // OpenFreeMap vector tile style or raster OSM fallback
        const style =
          provider === 'openfreemap'
            ? 'https://tiles.openfreemap.org/styles/bright'
            : {
                version: 8 as const,
                sources: {
                  'osm-raster': {
                    type: 'raster' as const,
                    tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
                    tileSize: 256,
                    attribution: '© OpenStreetMap contributors',
                  },
                },
                layers: [
                  {
                    id: 'osm-raster-layer',
                    type: 'raster' as const,
                    source: 'osm-raster',
                    minzoom: 0,
                    maxzoom: 19,
                  },
                ],
              };

        const map = new maplibre.Map({
          container: containerRef.current,
          style,
          center: [3.045, 7.236], // [lng, lat]
          zoom: 13.6,
          attributionControl: false,
        });

        mapInstance = map;

        map.addControl(
          new maplibre.AttributionControl({
            compact: false,
            customAttribution: '© OpenStreetMap contributors, © OpenFreeMap',
          }),
          'bottom-right',
        );

        map.addControl(
          new maplibre.NavigationControl({ showCompass: false }),
          'top-right',
        );

        map.on('error', (err) => {
          // If vector tile server is unreachable or CORS blocked, gracefully degrade
          console.warn('MapLibre error encountered:', err);
          setMapError(
            'Live tiles unavailable. Showing high-fidelity corridor schematic.',
          );
          setProvider('fallback');
        });

        map.on('load', () => {
          if (isCancelled) return;

          // Add route line GeoJSON
          map.addSource('route-corridor', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: ROUTE_COORDINATES.map(([lat, lng]) => [lng, lat]),
              },
            },
          });

          // Outer glowing casing
          map.addLayer({
            id: 'route-casing',
            type: 'line',
            source: 'route-corridor',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: {
              'line-color': '#005b3d',
              'line-width': 8,
              'line-opacity': 0.7,
            },
          });

          // Inner route line
          map.addLayer({
            id: 'route-line',
            type: 'line',
            source: 'route-corridor',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: {
              'line-color': '#008751',
              'line-width': 4,
              'line-dasharray': [2, 2],
            },
          });

          // Add Facility markers
          FACILITIES.forEach((fac) => {
            const el = document.createElement('div');
            el.className = `map-fac-marker map-fac-${fac.status}`;
            el.innerHTML = `
              <div class="marker-dot"></div>
              <div class="marker-label">${fac.name}</div>
            `;
            el.addEventListener('click', () => setSelectedFacility(fac));

            new maplibre.Marker({ element: el })
              .setLngLat([fac.coords[1], fac.coords[0]])
              .addTo(map);
          });

          // Add Courier Marker
          const courierEl = document.createElement('div');
          courierEl.className = 'map-courier-marker';
          courierEl.innerHTML = `
            <div class="courier-pulse"></div>
            <div class="courier-icon">🏍️</div>
            <div class="courier-badge">TRF-0042 • 4m</div>
          `;

          const courierMarker = new maplibre.Marker({ element: courierEl })
            .setLngLat([riderCoord[1], riderCoord[0]])
            .addTo(map);

          // Update courier marker on progress tick
          const updateInterval = setInterval(() => {
            if (isCancelled) return;
            courierMarker.setLngLat([riderCoord[1], riderCoord[0]]);
          }, 1200);

          map.on('remove', () => clearInterval(updateInterval));
        });
      } catch (err) {
        console.warn('MapLibre init failed:', err);
        setMapError('WebGL not supported or network blocked. Fallback active.');
        setProvider('fallback');
      }
    }

    void initMap();

    return () => {
      isCancelled = true;
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, [provider]);

  return (
    <div className="web-map-container">
      {/* Map toolbar */}
      <div className="web-map-toolbar">
        <div className="web-map-providers">
          <button
            type="button"
            className={`map-provider-btn ${provider === 'openfreemap' ? 'is-active' : ''}`}
            onClick={() => {
              setMapError(null);
              setProvider('openfreemap');
            }}
          >
            <FontAwesomeIcon icon={faMapLocationDot} /> OpenFreeMap
          </button>
          <button
            type="button"
            className={`map-provider-btn ${provider === 'osm-raster' ? 'is-active' : ''}`}
            onClick={() => {
              setMapError(null);
              setProvider('osm-raster');
            }}
          >
            <FontAwesomeIcon icon={faLayerGroup} /> OSM Raster
          </button>
          <button
            type="button"
            className={`map-provider-btn ${provider === 'fallback' ? 'is-active' : ''}`}
            onClick={() => setProvider('fallback')}
          >
            <FontAwesomeIcon icon={faLocationCrosshairs} /> Schematic Fallback
          </button>
        </div>

        <div className="web-map-status">
          <span className="live-dot" />
          <span className="web-map-eta">TRF-0042 • 4 min ETA • Ade Okafor</span>
        </div>
      </div>

      {mapError && (
        <div className="web-map-warning">
          <FontAwesomeIcon icon={faTriangleExclamation} />
          <span>{mapError}</span>
        </div>
      )}

      {/* Map display */}
      <div className="web-map-viewport">
        {provider !== 'fallback' ? (
          <div ref={containerRef} className="web-maplibre-canvas" />
        ) : (
          /* Schematic SVG Fallback with interactive facilities */
          <div
            className="schematic-corridor-view"
            aria-label="Schematic Route Corridor"
          >
            <svg viewBox="0 0 800 360" className="schematic-svg">
              <defs>
                <linearGradient
                  id="routeGrad"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="#c75959" />
                  <stop offset="45%" stopColor="#f4c542" />
                  <stop offset="100%" stopColor="#008751" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Grid backdrop */}
              <pattern
                id="gridPattern"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="rgba(219, 232, 230, 0.4)"
                  strokeWidth="1"
                />
              </pattern>
              <rect width="100%" height="100%" fill="url(#gridPattern)" />

              {/* Connecting road */}
              <path
                d="M 120 180 C 240 100, 360 260, 480 160 S 640 220, 680 180"
                fill="none"
                stroke="#dbe8e6"
                strokeWidth="16"
                strokeLinecap="round"
              />
              <path
                d="M 120 180 C 240 100, 360 260, 480 160 S 640 220, 680 180"
                fill="none"
                stroke="url(#routeGrad)"
                strokeWidth="6"
                strokeDasharray="8 6"
                strokeLinecap="round"
              />

              {/* PHC-A: Aiyetoro Central */}
              <g
                className="schematic-node"
                transform="translate(120, 180)"
                onClick={() => setSelectedFacility(FACILITIES[0] ?? null)}
                style={{ cursor: 'pointer' }}
              >
                <circle r="22" fill="#c75959" opacity="0.18" />
                <circle r="12" fill="#c75959" filter="url(#glow)" />
                <circle r="6" fill="#fff" />
                <text
                  x="0"
                  y="34"
                  textAnchor="middle"
                  className="node-text-title"
                >
                  Aiyetoro Central PHC
                </text>
                <text
                  x="0"
                  y="50"
                  textAnchor="middle"
                  className="node-text-sub"
                >
                  Requester (0 ORS stockout)
                </text>
              </g>

              {/* Courier in transit */}
              <g
                className="schematic-rider"
                transform={`translate(${120 + progress * (680 - 120)}, ${
                  180 + Math.sin(progress * Math.PI * 2) * 45
                })`}
              >
                <circle r="20" fill="rgba(0, 135, 81, 0.25)">
                  <animate
                    attributeName="r"
                    values="16;26;16"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.6;0.1;0.6"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </circle>
                <circle r="12" fill="#008751" />
                <text x="0" y="4" textAnchor="middle" fontSize="12" fill="#fff">
                  🏍️
                </text>
                <rect
                  x="-45"
                  y="-34"
                  width="90"
                  height="22"
                  rx="11"
                  fill="#0b4e4a"
                />
                <text
                  x="0"
                  y="-19"
                  textAnchor="middle"
                  fill="#d5f0e2"
                  fontSize="10"
                  fontWeight="bold"
                >
                  TRF-0042 • 4m
                </text>
              </g>

              {/* PHC-B: Idera PHC */}
              <g
                className="schematic-node"
                transform="translate(680, 180)"
                onClick={() => setSelectedFacility(FACILITIES[1] ?? null)}
                style={{ cursor: 'pointer' }}
              >
                <circle r="22" fill="rgba(0, 135, 81, 0.18)" />
                <circle r="12" fill="#008751" filter="url(#glow)" />
                <circle r="6" fill="#fff" />
                <text
                  x="0"
                  y="34"
                  textAnchor="middle"
                  className="node-text-title"
                >
                  Idera PHC (Donor)
                </text>
                <text
                  x="0"
                  y="50"
                  textAnchor="middle"
                  className="node-text-sub"
                >
                  60 surplus transferable
                </text>
              </g>

              {/* Intermediate PHC-C & D */}
              <g
                className="schematic-node"
                transform="translate(320, 110)"
                onClick={() => setSelectedFacility(FACILITIES[2] ?? null)}
                style={{ cursor: 'pointer' }}
              >
                <circle r="10" fill="#477db5" />
                <circle r="4" fill="#fff" />
                <text
                  x="0"
                  y="24"
                  textAnchor="middle"
                  className="node-text-small"
                >
                  Ajegunle PHC
                </text>
              </g>
              <g
                className="schematic-node"
                transform="translate(490, 240)"
                onClick={() => setSelectedFacility(FACILITIES[3] ?? null)}
                style={{ cursor: 'pointer' }}
              >
                <circle r="10" fill="#477db5" />
                <circle r="4" fill="#fff" />
                <text
                  x="0"
                  y="24"
                  textAnchor="middle"
                  className="node-text-small"
                >
                  Oke-Odo PHC
                </text>
              </g>
            </svg>

            <div className="schematic-attribution">
              <span>
                Attribution: © OpenStreetMap contributors, OpenFreeMap •
                Offline-Safe Fallback Active
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Selected facility info popup */}
      {selectedFacility && (
        <div className="web-map-fac-popup">
          <div className="popup-header">
            <strong>{selectedFacility.name}</strong>
            <button
              type="button"
              className="popup-close"
              onClick={() => setSelectedFacility(null)}
            >
              ✕
            </button>
          </div>
          <p className="popup-ward">{selectedFacility.ward}</p>
          <p className="popup-stock">
            <strong>Status:</strong> {selectedFacility.stockSummary}
          </p>
          <div className="popup-actions">
            <button
              type="button"
              className="popup-btn-primary"
              onClick={() => {
                alert(`Querying peer surplus for ${selectedFacility.name}...`);
              }}
            >
              Check Availability
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
