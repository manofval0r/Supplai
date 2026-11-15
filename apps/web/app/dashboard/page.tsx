import type { Metadata } from 'next';
import DashboardShell from './DashboardShell';

export const metadata: Metadata = {
  title: 'Workspace | Supplai',
  description: 'Supplai facility and delivery operations workspace.',
};

export default function DashboardPage() {
  return <DashboardShell />;
}
