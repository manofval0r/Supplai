'use client';

import dynamic from 'next/dynamic';

const MobileApp = dynamic(() => import('../App'), {
  ssr: false,
  loading: () => <div className="app-loading" aria-label="Loading Supplai" />,
});

export default function MobileClient() {
  return (
    <div id="supplai-root">
      <MobileApp />
    </div>
  );
}
