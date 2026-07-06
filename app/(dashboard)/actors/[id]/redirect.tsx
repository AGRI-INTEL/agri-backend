'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ActorRedirect() {
  const pathname = usePathname();

  useEffect(() => {
    const id = pathname?.split('/actors/')?.[1]?.split('/')?.[0];
    if (id && id !== '_') {
      window.location.href = '/actors?id=' + id;
    } else {
      window.location.href = '/actors';
    }
  }, [pathname]);

  return null;
}
