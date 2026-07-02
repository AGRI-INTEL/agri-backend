'use client';

interface AgriBotAvatarProps {
  size?: number;
  className?: string;
}

export function AgriBotAvatar({ size = 40, className = '' }: AgriBotAvatarProps) {
  return (
    <div
      className={`flex items-center justify-center rounded-2xl shrink-0 select-none ${className}`}
      style={{
        width: size,
        height: size,
        background: 'linear-gradient(135deg, #16A34A 0%, #C4923A 100%)',
        boxShadow: '0 4px 16px rgba(196,146,58,0.3)',
      }}
      aria-label="AgriBot IA"
    >
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none" stroke="#0C1810" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a4 4 0 0 1 4 4v1a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z"/>
        <path d="M6 12a6 6 0 0 1 12 0v6a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-6z"/>
        <path d="M8 14h8"/>
        <path d="M9 17h6"/>
        <path d="M12 14v4"/>
        <path d="M4 12h2"/>
        <path d="M18 12h2"/>
      </svg>
    </div>
  );
}
