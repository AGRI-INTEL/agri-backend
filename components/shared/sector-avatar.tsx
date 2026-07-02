'use client';

interface SectorAvatarProps {
  sector: 'vegetal' | 'animal' | 'halieutique' | 'forestier';
  size?: number;
  className?: string;
}

const SECTOR_CONFIG = {
  vegetal: { icon: '🌱', bg: '#166534', gradient: 'linear-gradient(135deg, #166534 0%, #22C55E 100%)' },
  animal: { icon: '🐄', bg: '#9A3412', gradient: 'linear-gradient(135deg, #9A3412 0%, #F97316 100%)' },
  halieutique: { icon: '🐟', bg: '#075985', gradient: 'linear-gradient(135deg, #075985 0%, #06B6D4 100%)' },
  forestier: { icon: '🌲', bg: '#854D0E', gradient: 'linear-gradient(135deg, #854D0E 0%, #EAB308 100%)' },
};

export function SectorAvatar({ sector, size = 40, className = '' }: SectorAvatarProps) {
  const config = SECTOR_CONFIG[sector] || SECTOR_CONFIG.vegetal;
  return (
    <div
      className={`flex items-center justify-center rounded-xl shrink-0 select-none ${className}`}
      style={{
        width: size,
        height: size,
        background: config.gradient,
        fontSize: size * 0.45,
        boxShadow: `0 2px 8px ${config.bg}44`,
      }}
      aria-label={`Filière ${sector}`}
    >
      {config.icon}
    </div>
  );
}
