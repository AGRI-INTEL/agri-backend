'use client';

import { Button } from '@/components/ui/button';

interface EmptyStateIllustratedProps {
  variant?: 'default' | 'vegetal' | 'animal' | 'halieutique' | 'forestier' | 'messages' | 'alerts' | 'search' | 'files';
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const ILLUSTRATIONS: Record<string, string> = {
  vegetal: '🌱',
  animal: '🐄',
  halieutique: '🐟',
  forestier: '🌲',
  messages: '💬',
  alerts: '🔔',
  search: '🔍',
  files: '📁',
  default: '📭',
};

export function EmptyStateIllustrated({ variant = 'default', title, description, action, className = '' }: EmptyStateIllustratedProps) {
  const icon = ILLUSTRATIONS[variant] || ILLUSTRATIONS.default;

  return (
    <div className={`flex flex-col items-center justify-center py-16 text-center ${className}`}>
      <div
        className="flex items-center justify-center w-20 h-20 rounded-2xl mb-6"
        style={{
          background: 'rgba(196,146,58,0.08)',
          border: '1px solid rgba(196,146,58,0.12)',
        }}
        aria-hidden="true"
      >
        <span className="text-4xl">{icon}</span>
      </div>
      <h3 className="text-lg font-semibold mb-2" style={{ color: '#E4DBC8' }}>{title}</h3>
      {description && (
        <p className="text-sm max-w-sm mb-6" style={{ color: '#5E7A68' }}>{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick} size="sm">
          {action.label}
        </Button>
      )}
    </div>
  );
}
