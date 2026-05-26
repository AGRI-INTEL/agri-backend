'use client';

import { LLM_PROVIDERS } from '@/lib/constants';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import type { LLMProvider } from '@/types/chatbot';

interface ProviderSwitcherProps {
  provider: LLMProvider;
  isDemoMode: boolean;
  onProviderChange: (p: LLMProvider) => void;
  onDemoModeChange: (v: boolean) => void;
}

export function ProviderSwitcher({ provider, isDemoMode, onProviderChange, onDemoModeChange }: ProviderSwitcherProps) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <Select value={provider} onValueChange={(v) => onProviderChange(v as LLMProvider)}>
        <SelectTrigger className="h-7 w-36 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {LLM_PROVIDERS.map((p) => (
            <SelectItem key={p.id} value={p.id} className="text-xs">
              {p.emoji} {p.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex items-center gap-2">
        <Switch
          checked={isDemoMode}
          onCheckedChange={onDemoModeChange}
          id="demo-mode"
          aria-label="Mode démo"
        />
        <label htmlFor="demo-mode" className="text-xs text-muted-foreground cursor-pointer">
          Mode Démo
        </label>
      </div>

      <Badge variant="outline" className="text-xs">
        💬 Stockage local
      </Badge>
    </div>
  );
}
