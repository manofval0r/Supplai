'use client';

import dynamic from 'next/dynamic';
import type { WebAppProps } from '../App';

const MobileApp = dynamic(() => import('../App'), {
  ssr: false,
  loading: () => <div className="app-loading" aria-label="Loading Supplai" />,
});

export default function MobileClient(props: WebAppProps) {
  return (
    <div id="supplai-root">
      <MobileApp {...props} />
    </div>
  );
}
