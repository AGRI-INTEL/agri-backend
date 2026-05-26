'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useUIStore } from '@/stores/ui-store';
import { useUpdateProfile } from '@/hooks/use-auth';
import { toast } from 'sonner';

export function PreferencesForm() {
  const { theme, setTheme } = useUIStore();
  const updateProfile = useUpdateProfile();

  const saveTheme = (t: 'light' | 'dark' | 'system') => {
    setTheme(t);
    updateProfile.mutate(
      { theme: t === 'system' ? undefined : t },
      { onSuccess: () => toast.success('Préférences enregistrées') }
    );
  };

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h3 className="text-sm font-medium mb-3">Apparence</h3>
        <Select value={theme} onValueChange={(v) => saveTheme(v as 'light' | 'dark' | 'system')}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Clair</SelectItem>
            <SelectItem value="dark">Sombre</SelectItem>
            <SelectItem value="system">Système</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-3">Notifications</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Alertes par email</span>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Notifications push</span>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Résumé hebdomadaire</span>
            <Switch />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-3">Langue</h3>
        <Select defaultValue="fr" onValueChange={(lang) => updateProfile.mutate({ language: lang })}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="fr">Français</SelectItem>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="pt">Português</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
