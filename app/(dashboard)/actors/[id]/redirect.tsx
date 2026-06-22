'use client';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function ActorRedirect() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const id = pathname?.split('/actors/')?.[1]?.split('/')?.[0];
    if (id && id !== '_') {
      router.replace('/actors?id=' + id);
    } else {
      router.replace('/actors');
    }
  }, [pathname, router]);

  return null;
}
