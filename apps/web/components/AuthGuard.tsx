'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { getWorkspaceSession } from '../lib/auth';

export default function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname() || '/dashboard';
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const session = getWorkspaceSession();
    if (!session) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    setAuthorized(true);
  }, [pathname, router]);

  if (!authorized) {
    return (
      <div
        style={{
          minHeight: '60vh',
          display: 'grid',
          placeItems: 'center',
          color: '#536074',
          fontSize: '14px',
          fontWeight: 600,
        }}
      >
        Verifying workspace session…
      </div>
    );
  }

  return <>{children}</>;
}
