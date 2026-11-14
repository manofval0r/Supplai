import type { Metadata } from 'next';
import PageHero from '../../components/landing/PageHero';
import SiteShell from '../../components/landing/SiteShell';
import MobileClient from '../mobile-client';
import styles from './dashboard.module.css';

export const metadata: Metadata = {
  title: 'Dashboard | Supplai',
  description: 'Supplai facility and delivery coordination dashboard.',
};

const STEPS = [
  {
    title: 'Request',
    body: 'A receiving clinic asks for ORS or Zinc from a nearby peer.',
  },
  {
    title: 'Release',
    body: 'The source custodian confirms batch, expiry, and the safety floor.',
  },
  {
    title: 'Dispatch',
    body: (
      <>
        A rider collects the stock and seals it with tag <code>#7842</code>.
      </>
    ),
  },
  {
    title: 'Confirm',
    body: (
      <>
        The receiver enters PIN <code>5082</code> to close the handover.
      </>
    ),
  },
];

export default function DashboardPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Interactive demo console"
        title={
          <>
            Run a full handover, <em>start to finish.</em>
          </>
        }
        description="Pick a role below and walk a real transfer through the Ado-Odo/Ota network: request, release, dispatch, and a PIN-verified receipt."
        chips={[
          { label: 'Workspace', value: 'Ado-Odo/Ota LGA' },
          { label: 'Stock', value: 'ORS · Zinc' },
          { label: 'Data', value: 'Fictional' },
        ]}
      />

      <div className={styles.wrap}>
        <ol className={styles.steps}>
          {STEPS.map((step, index) => (
            <li className={styles.step} key={step.title}>
              <span className={styles.num}>
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </li>
          ))}
        </ol>

        <section className={styles.panel} aria-label="Interactive console">
          <div className={styles.panelBar}>
            <span className={styles.live}>
              <i /> Live console
            </span>
            <span>Fictional facility stock &amp; courier telemetry</span>
          </div>
          <div className={styles.panelBody}>
            <MobileClient />
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
