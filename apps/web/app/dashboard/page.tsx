import type { Metadata } from 'next';
import SiteShell from '../../components/landing/SiteShell';
import MobileClient from '../mobile-client';

export const metadata: Metadata = {
  title: 'Dashboard | Supplai',
  description: 'Supplai facility and delivery coordination dashboard.',
};

export default function DashboardPage() {
  return (
    <SiteShell>
      <div
        style={{
          width: 'min(95%, 1220px)',
          margin: '24px auto 0',
          padding: '12px 18px',
          border: '2px solid #030407',
          borderRadius: 18,
          background: '#f2f4f8',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              padding: '4px 10px',
              borderRadius: 999,
              border: '1.5px solid #030407',
              background: '#D4FF24',
              color: '#030407',
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 0.4,
            }}
          >
            DEMO CONSOLE
          </span>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#030407' }}>
            Ado-Odo/Ota LGA Operations Workspace
          </span>
        </div>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#646f82' }}>
          Fictional facility stock &amp; courier telemetry
        </span>
      </div>
      <MobileClient />
    </SiteShell>
  );
}
