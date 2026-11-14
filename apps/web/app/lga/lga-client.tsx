'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  loadLgaDecisionData,
  supplaiApi,
  type LgaDecisionBundle,
  type LgaDecisionItem,
} from '../../lib/api';

export default function LgaDecisionClient() {
  const [bundle, setBundle] = useState<LgaDecisionBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionResult, setActionResult] = useState<string | null>(null);
  const [busyRef, setBusyRef] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await loadLgaDecisionData();
    setBundle(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function handleEscalateOrRelease(item: LgaDecisionItem) {
    setBusyRef(item.reference);
    setActionResult(null);
    try {
      const res = await supplaiApi.actOnOrder(item.reference, {
        type: 'lga_escalate',
        actorRole: 'lga',
        reason: item.attentionReason,
      });
      setActionResult(`${item.reference}: ${res.message}`);
      await refresh();
    } catch (error) {
      if (bundle?.source === 'live' && error instanceof Error) {
        setActionResult(`${item.reference}: ${error.message}`);
      } else {
        setActionResult(
          `${item.reference}: Recorded escalation decision in Demo mode (API offline). Next owner: ${item.nextOwner}.`,
        );
      }
    } finally {
      setBusyRef(null);
    }
  }

  return (
    <section
      style={{
        width: 'min(95%, 1240px)',
        margin: '28px auto 0',
      }}
    >
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          background: '#030407',
          color: '#ffffff',
          border: '3px solid #030407',
          borderRadius: 28,
          boxShadow: '6px 6px 0 #1558C9',
          padding: 'clamp(22px, 3.5vw, 34px)',
          marginBottom: 24,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 800 180"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            opacity: 0.16,
            pointerEvents: 'none',
          }}
        >
          <path
            d="M0 140 H260 L310 90 H540 L600 125 H800"
            fill="none"
            stroke="#1558C9"
            strokeWidth="3.5"
          />
          <circle cx="310" cy="90" r="6" fill="#D4FF24" />
          <circle cx="540" cy="90" r="6" fill="#D4FF24" />
        </svg>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <p
            style={{
              fontSize: 11.5,
              fontWeight: 800,
              letterSpacing: 0.9,
              color: '#D4FF24',
              textTransform: 'uppercase',
              margin: '0 0 8px',
            }}
          >
            Ota LGA Supervisor Decision Surface
          </p>
          <h1
            style={{
              fontSize: 'clamp(26px, 4vw, 38px)',
              fontWeight: 800,
              letterSpacing: -1,
              margin: 0,
              color: '#ffffff',
            }}
          >
            Priority Queue &amp; Safety-Floor Oversight
          </h1>
        </div>

        <div
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <span
            style={{
              padding: '7px 14px',
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 800,
              background: '#D4FF24',
              color: '#030407',
              border: '1.5px solid #030407',
            }}
          >
            {bundle?.source === 'live'
              ? 'Live API Connected'
              : 'Demo data · Fictional scenario (API fallback)'}
          </span>
          <button
            onClick={() => void refresh()}
            style={{
              padding: '8px 16px',
              borderRadius: 999,
              border: '2px solid rgba(255, 255, 255, 0.3)',
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
            }}
            type="button"
          >
            Refresh
          </button>
        </div>
      </div>

      {actionResult ? (
        <div
          role="status"
          style={{
            padding: '12px 16px',
            borderRadius: 14,
            background: '#e9f0fd',
            color: '#030407',
            fontSize: 13.5,
            fontWeight: 600,
            marginBottom: 20,
          }}
        >
          {actionResult}
        </div>
      ) : null}

      {loading || !bundle ? (
        <div
          style={{
            padding: 28,
            borderRadius: 20,
            background: '#f2f4f8',
            color: '#646f82',
            fontWeight: 600,
          }}
        >
          Loading LGA overview and priority queue...
        </div>
      ) : (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 12,
              marginBottom: 28,
            }}
          >
            {[
              {
                label: 'Open Stockouts',
                value: bundle.overview.metrics.openStockouts,
              },
              {
                label: 'Transfers in Flight',
                value: bundle.overview.metrics.transfersInFlight,
              },
              {
                label: 'Completed Transfers',
                value: bundle.overview.metrics.completedTransfers,
              },
              {
                label: 'Unmet Requests',
                value: bundle.overview.metrics.unmetRequests,
              },
              {
                label: 'Response Rate',
                value: `${Math.round(bundle.overview.metrics.responseRate * 100)}%`,
              },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  background: '#f2f4f8',
                  borderRadius: 18,
                  padding: '16px 18px',
                }}
              >
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 800,
                    letterSpacing: -0.8,
                    color: '#030407',
                  }}
                >
                  {stat.value}
                </div>
                <div style={{ fontSize: 12.5, color: '#646f82', marginTop: 4 }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          <h2
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: '#030407',
              margin: '0 0 12px',
            }}
          >
            Transfer Priority Queue ({bundle.queue.length})
          </h2>

          <div style={{ display: 'grid', gap: 12, marginBottom: 28 }}>
            {bundle.queue.length === 0 ? (
              <div
                style={{
                  background: '#f2f4f8',
                  borderRadius: 18,
                  padding: 20,
                  color: '#646f82',
                  fontSize: 13.5,
                }}
              >
                No active transfers in queue — all clinic requests are currently
                balanced.
              </div>
            ) : (
              bundle.queue.map((item) => (
                <article
                  key={item.reference}
                  style={{
                    background: '#f2f4f8',
                    borderRadius: 20,
                    padding: 18,
                    display: 'grid',
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 10,
                    }}
                  >
                    <div>
                      <span
                        style={{
                          fontWeight: 800,
                          fontSize: 15,
                          color: '#030407',
                          marginRight: 8,
                        }}
                      >
                        {item.reference}
                      </span>
                      <span style={{ fontSize: 13.5, color: '#646f82' }}>
                        {item.fromFacility} → {item.toFacility} ·{' '}
                        {item.quantity} {item.drug}
                      </span>
                    </div>

                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: 999,
                        fontSize: 11.5,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        background:
                          item.priority === 'critical'
                            ? '#fee2e2'
                            : item.priority === 'attention'
                              ? '#D4FF24'
                              : '#e9f0fd',
                        color:
                          item.priority === 'critical' ? '#b91c1c' : '#030407',
                      }}
                    >
                      {item.priority} · {item.status}
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns:
                        'repeat(auto-fit, minmax(220px, 1fr))',
                      gap: 10,
                      fontSize: 13,
                      color: '#030407',
                    }}
                  >
                    <div>
                      <strong style={{ color: '#646f82' }}>
                        Attention reason:{' '}
                      </strong>
                      {item.attentionReason}
                    </div>
                    <div>
                      <strong style={{ color: '#646f82' }}>
                        Next accountable owner:{' '}
                      </strong>
                      {item.nextOwner}
                    </div>
                    <div>
                      <strong style={{ color: '#646f82' }}>
                        Safety-floor evidence:{' '}
                      </strong>
                      {item.safetyFloorEvidence}
                    </div>
                  </div>

                  {item.status !== 'delivered' ? (
                    <div>
                      <button
                        disabled={busyRef === item.reference}
                        onClick={() => void handleEscalateOrRelease(item)}
                        style={{
                          height: 40,
                          padding: '0 16px',
                          borderRadius: 12,
                          border: 'none',
                          background: '#1558C9',
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: 13,
                          cursor: 'pointer',
                        }}
                        type="button"
                      >
                        {busyRef === item.reference
                          ? 'Recording decision...'
                          : 'Escalate / Record Oversight'}
                      </button>
                    </div>
                  ) : null}
                </article>
              ))
            )}
          </div>

          <h2
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: '#030407',
              margin: '0 0 12px',
            }}
          >
            Operational Exceptions ({bundle.failures.length})
          </h2>
          <div style={{ display: 'grid', gap: 10 }}>
            {bundle.failures.length === 0 ? (
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e6e9ef',
                  borderRadius: 16,
                  padding: '14px 16px',
                  fontSize: 13.5,
                  color: '#646f82',
                }}
              >
                No operational exceptions recorded.
              </div>
            ) : (
              bundle.failures.map((f) => (
                <div
                  key={f.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e6e9ef',
                    borderRadius: 16,
                    padding: '14px 16px',
                    fontSize: 13.5,
                  }}
                >
                  <strong style={{ color: '#1558C9' }}>
                    [{f.category.toUpperCase()}] {f.reference}
                  </strong>{' '}
                  — {f.detail}
                </div>
              ))
            )}
          </div>
        </>
      )}
    </section>
  );
}
