'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import type { LLMProvider } from '@/types/chatbot';

const PROVIDERS: { id: LLMProvider; label: string; emoji: string }[] = [
  { id: 'kimi', label: 'Kimi K2.6', emoji: '🧠' },
  { id: 'deepseek', label: 'DeepSeek V3', emoji: '🧠' },
  { id: 'openai', label: 'GPT-4o', emoji: '🧠' },
];

interface ProviderSwitcherProps {
  provider: LLMProvider;
  onProviderChange: (p: LLMProvider) => void;
  aiEnabled?: boolean;
}

export function ProviderSwitcher({ provider, onProviderChange, aiEnabled }: ProviderSwitcherProps) {
  return (
    <div className="flex items-center gap-2">
      <Select value={provider} onValueChange={(v) => onProviderChange(v as LLMProvider)}>
        <SelectTrigger className="h-7 w-36 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PROVIDERS.map((p) => (
            <SelectItem key={p.id} value={p.id} className="text-xs">
              {p.emoji} {p.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {aiEnabled === false && (
        <Badge variant="outline" className="text-xs text-amber-500 border-amber-500/30">
          IA non connectée
        </Badge>
      )}
      {provider && (
        <Badge variant="outline" className="text-xs text-muted-foreground">
          {provider === 'kimi' ? 'Kimi' : provider === 'deepseek' ? 'DeepSeek' : 'OpenAI'}
        </Badge>
      )}
    </div>
  );
}
