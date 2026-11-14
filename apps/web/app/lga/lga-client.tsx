'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
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
    <main className="site-page" style={{ paddingBottom: 64 }}>
      <header className="site-header">
        <Link className="site-brand" href="/">
          <span className="brand-mark">+</span>
          <span>supplai</span>
        </Link>
        <nav aria-label="LGA navigation" className="site-nav">
          <Link href="/dashboard">Console</Link>
          <Link href="/app-preview">App Preview</Link>
          <Link href="/lga" style={{ color: '#1558C9', fontWeight: 700 }}>
            LGA Desk
          </Link>
        </nav>
      </header>

      <section
        style={{
          width: 'min(100% - 32px, 1120px)',
          margin: '32px auto 0',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            marginBottom: 24,
          }}
        >
          <div>
            <p
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 0.8,
                color: '#1558C9',
                textTransform: 'uppercase',
                margin: '0 0 6px',
              }}
            >
              Ota LGA Supervisor Decision Surface
            </p>
            <h1
              style={{
                fontSize: 'clamp(24px, 4vw, 34px)',
                fontWeight: 800,
                letterSpacing: -0.8,
                margin: 0,
                color: '#030407',
              }}
            >
              Priority Queue &amp; Safety-Floor Oversight
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              style={{
                padding: '6px 12px',
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 700,
                background: bundle?.source === 'live' ? '#D4FF24' : '#E9F0FD',
                color: bundle?.source === 'live' ? '#030407' : '#1558C9',
              }}
            >
              {bundle?.source === 'live'
                ? 'Live API Connected'
                : 'Demo data · Fictional scenario (API fallback)'}
            </span>
            <button
              onClick={() => void refresh()}
              style={{
                padding: '8px 14px',
                borderRadius: 12,
                border: '1px solid #e6e9ef',
                background: '#ffffff',
                fontWeight: 600,
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
                  <div
                    style={{ fontSize: 12.5, color: '#646f82', marginTop: 4 }}
                  >
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
                  No active transfers in queue — all clinic requests are
                  currently balanced.
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
                            item.priority === 'critical'
                              ? '#b91c1c'
                              : '#030407',
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
    </main>
  );
}
