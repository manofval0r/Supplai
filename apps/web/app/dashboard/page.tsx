import type { Metadata } from 'next';
import MobileClient from '../mobile-client';

export const metadata: Metadata = {
  title: 'Dashboard | Supplai',
  description: 'Supplai facility and delivery coordination dashboard.',
};

export default function DashboardPage() {
  return <MobileClient />;
}
