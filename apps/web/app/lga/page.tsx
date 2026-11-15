import type { Metadata } from 'next';
import AuthGuard from '../../components/AuthGuard';
import SiteShell from '../../components/landing/SiteShell';
import LgaDecisionClient from './lga-client';

export const metadata: Metadata = {
  title: 'LGA Oversight Desk | Supplai',
  description:
    'LGA supervisor priority queue, safety-floor evidence, and exception oversight.',
};

export default function LgaPage() {
  return (
    <SiteShell>
      <AuthGuard>
        <LgaDecisionClient />
      </AuthGuard>
    </SiteShell>
  );
}
