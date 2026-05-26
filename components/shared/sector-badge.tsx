import { Badge } from '@/components/ui/badge';
import { SECTOR_LABELS } from '@/lib/utils';
import type { Sector } from '@/types/actor';

interface SectorBadgeProps {
  sector: Sector;
  className?: string;
}

export function SectorBadge({ sector, className }: SectorBadgeProps) {
  return (
    <Badge variant={sector as 'vegetal' | 'animal' | 'halieutique' | 'forestier'} className={className}>
      {SECTOR_LABELS[sector]}
    </Badge>
  );
}
