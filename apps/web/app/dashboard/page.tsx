import type { Metadata } from 'next';
import MobileClient from '../mobile-client';

export const metadata: Metadata = {
  title: 'Dashboard | Supplai',
  description: 'Supplai facility and delivery coordination dashboard.',
};

export default function DashboardPage() {
  return (
    <>
      <div className="demo-banner" role="note" aria-label="Demo data notice">
        <span className="demo-banner-dot" aria-hidden="true" />
        Demo data. All facilities, stock, riders, and deliveries are fictional.
      </div>
      <MobileClient />
    </>
  );
}
