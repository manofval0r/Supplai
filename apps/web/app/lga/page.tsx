import type { Metadata } from 'next';
import LgaDecisionClient from './lga-client';

export const metadata: Metadata = {
  title: 'LGA Oversight Desk | Supplai',
  description:
    'LGA supervisor priority queue, safety-floor evidence, and exception oversight.',
};

export default function LgaPage() {
  return <LgaDecisionClient />;
}
