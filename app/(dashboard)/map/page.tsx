import type { Metadata } from 'next';
import { InteractiveMap } from '@/components/map/interactive-map';

export const metadata: Metadata = { title: 'Carte Interactive' };

export default function MapPage() {
  return (
    <div className="h-[calc(100vh-64px)] p-4">
      <InteractiveMap className="h-full" />
    </div>
  );
}
