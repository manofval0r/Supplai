'use client';

import React, { useCallback, useEffect, useState } from 'react';
import PageHero from '../../components/landing/PageHero';
import {
  loadLgaDecisionData,
  supplaiApi,
  type LgaDecisionBundle,
  type LgaDecisionItem,
} from '../../lib/api';
import styles from './lga.module.css';

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

  const stats = bundle
    ? [
        {
          label: 'Open stockouts',
          value: bundle.overview.metrics.openStockouts,
          hot: bundle.overview.metrics.openStockouts > 0,
        },
        {
          label: 'Transfers in flight',
          value: bundle.overview.metrics.transfersInFlight,
        },
        {
          label: 'Completed transfers',
          value: bundle.overview.metrics.completedTransfers,
        },
        {
          label: 'Unmet requests',
          value: bundle.overview.metrics.unmetRequests,
        },
        {
          label: 'Response rate',
          value: `${Math.round(bundle.overview.metrics.responseRate * 100)}%`,
        },
      ]
    : [];

  return (
    <>
      <PageHero
        eyebrow="Ota LGA supervisor desk"
        title={
          <>
            Every handover, <em>accountable.</em>
          </>
        }
        description="A read-mostly oversight surface: the priority queue, who owns the next step, and the safety-floor evidence behind each release."
        chips={[
          { label: 'Safety floor', value: '≥ 20 units' },
          { label: 'Drugs', value: 'ORS · Zinc' },
          {
            label: 'Data',
            value: bundle?.source === 'live' ? 'Live API' : 'Demo',
          },
        ]}
        actions={
          <>
            <span className={styles.statusPill}>
              <i />
              {bundle?.source === 'live'
                ? 'Live API connected'
                : 'Demo data · API fallback'}
            </span>
            <button
              className={styles.refresh}
              onClick={() => void refresh()}
              type="button"
            >
              {loading ? 'Refreshing…' : 'Refresh'}
            </button>
          </>
        }
      />

      <section className={styles.wrap}>
        {actionResult ? (
          <div className={styles.notice} role="status">
            {actionResult}
          </div>
        ) : null}

        {loading && !bundle ? (
          <div className={styles.loading}>
            Loading LGA overview and priority queue…
          </div>
        ) : bundle ? (
          <>
            <div className={styles.stats}>
              {stats.map((stat) => (
                <div
                  className={`${styles.stat} ${stat.hot ? styles.statHot : ''}`}
                  key={stat.label}
                >
                  <b>{stat.value}</b>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>

            <div className={styles.layout}>
              <div>
                <h2 className={styles.sectionTitle}>
                  Transfer priority queue
                  <span className={styles.count}>{bundle.queue.length}</span>
                </h2>
                <div className={styles.queue}>
                  {bundle.queue.length === 0 ? (
                    <div className={styles.empty}>
                      No active transfers in queue — all clinic requests are
                      currently balanced.
                    </div>
                  ) : (
                    bundle.queue.map((item) => {
                      const tone =
                        item.priority === 'critical'
                          ? styles.critical
                          : item.priority === 'attention'
                            ? styles.attention
                            : '';
                      const badgeTone =
                        item.priority === 'critical'
                          ? styles.badgeCritical
                          : item.priority === 'attention'
                            ? styles.badgeAttention
                            : '';
                      return (
                        <article
                          className={`${styles.card} ${tone}`}
                          key={item.reference}
                        >
                          <div className={styles.cardHead}>
                            <div>
                              <span className={styles.ref}>
                                {item.reference}
                              </span>
                              <div className={styles.route}>
                                {item.fromFacility} <em>→</em> {item.toFacility}
                                <small>
                                  {item.quantity} {item.drug}
                                </small>
                              </div>
                            </div>
                            <span className={`${styles.badge} ${badgeTone}`}>
                              {item.priority} · {item.status}
                            </span>
                          </div>

                          <div className={styles.facts}>
                            <div className={styles.fact}>
                              <small>Attention reason</small>
                              <p>{item.attentionReason}</p>
                            </div>
                            <div className={styles.fact}>
                              <small>Next accountable owner</small>
                              <p>{item.nextOwner}</p>
                            </div>
                            <div className={styles.fact}>
                              <small>Safety-floor evidence</small>
                              <p>{item.safetyFloorEvidence}</p>
                            </div>
                          </div>

                          {item.status !== 'delivered' ? (
                            <button
                              className={styles.action}
                              disabled={busyRef === item.reference}
                              onClick={() => void handleEscalateOrRelease(item)}
                              type="button"
                            >
                              {busyRef === item.reference
                                ? 'Recording decision…'
                                : 'Escalate / record oversight'}
                            </button>
                          ) : null}
                        </article>
                      );
                    })
                  )}
                </div>
              </div>

              <aside className={styles.side}>
                <div className={styles.rule}>
                  <small>Safety-floor rule</small>
                  <strong>≥ 20</strong>
                  <p>
                    A source facility may only release stock that leaves at
                    least 20 units on its own shelf. Every release is checked
                    before authorisation.
                  </p>
                </div>

                <div className={styles.exceptions}>
                  <h2 className={styles.sectionTitle}>
                    Exceptions
                    <span className={styles.count}>
                      {bundle.failures.length}
                    </span>
                  </h2>
                  {bundle.failures.length === 0 ? (
                    <div className={styles.empty}>
                      No operational exceptions recorded.
                    </div>
                  ) : (
                    bundle.failures.map((f) => (
                      <div className={styles.exception} key={f.id}>
                        <b>
                          {f.category.toUpperCase()} · {f.reference}
                        </b>
                        {f.detail}
                      </div>
                    ))
                  )}
                </div>
              </aside>
            </div>
          </>
        ) : null}
      </section>
    </>
  );
}
