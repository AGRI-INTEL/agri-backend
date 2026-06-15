'use client';

import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useUIStore } from '@/stores/ui-store';
import { useUpdateProfile } from '@/hooks/use-auth';
import { useUpdatePreferences, useGetPreferences } from '@/hooks/use-settings';
import { toast } from 'sonner';
import { 
  Bell, Moon, Monitor, Sun, Globe, Clock, Eye, Mail,
  MessageSquare, AlertCircle, Calendar, Check, RotateCcw, Wifi,
} from 'lucide-react';

export function PreferencesForm() {
  const { theme, setTheme } = useUIStore();
  const updateProfile = useUpdateProfile();
  const updatePreferences = useUpdatePreferences();
  const { data: serverPrefs, isLoading: prefsLoading } = useGetPreferences();

  const [notifPreferences, setNotifPreferences] = useState({
    email_alerts: true,
    push_notifications: true,
    weekly_digest: false,
    weather_alerts: true,
    prediction_alerts: true,
    community_updates: true,
    market_price_changes: false,
    system_notifications: true,
    newsletter: false,
  });

  const [generalPreferences, setGeneralPreferences] = useState({
    language: 'fr',
    timezone: 'Africa/Dakar',
    date_format: 'DD/MM/YYYY',
    time_format: '24h',
    default_view: 'grid',
    enable_shortcuts: true,
  });

  const [privacyPreferences, setPrivacyPreferences] = useState({
    profile_public: true,
    show_online_status: true,
    allow_messages: true,
    share_activity: false,
    show_email: false,
    show_phone: false,
  });

  // Hydrate from server on load
  useEffect(() => {
    if (!serverPrefs) return;
    if (serverPrefs.notifications) {
      setNotifPreferences((prev) => ({ ...prev, ...(serverPrefs.notifications as Record<string, unknown>) }));
    }
    if (serverPrefs.privacy) {
      setPrivacyPreferences((prev) => ({ ...prev, ...(serverPrefs.privacy as Record<string, unknown>) }));
    }
    if (serverPrefs.language) {
      setGeneralPreferences((prev) => ({ ...prev, language: serverPrefs.language! }));
    }
    if (serverPrefs.timezone) {
      setGeneralPreferences((prev) => ({ ...prev, timezone: serverPrefs.timezone! }));
    }
    if (serverPrefs.date_format) {
      setGeneralPreferences((prev) => ({ ...prev, date_format: serverPrefs.date_format! }));
    }
    if (serverPrefs.time_format) {
      setGeneralPreferences((prev) => ({ ...prev, time_format: serverPrefs.time_format! }));
    }
  }, [serverPrefs]);

  const saveTheme = (t: 'light' | 'dark' | 'system') => {
    setTheme(t);
    updateProfile.mutate({ theme: t } as { theme: 'light' | 'dark' | 'system' });
  };

  const savePreferences = async () => {
    await updatePreferences.mutateAsync({
      language: generalPreferences.language,
      timezone: generalPreferences.timezone,
      date_format: generalPreferences.date_format,
      time_format: generalPreferences.time_format,
      default_view: generalPreferences.default_view,
      enable_shortcuts: generalPreferences.enable_shortcuts,
      notifications: notifPreferences,
      privacy: privacyPreferences,
    });
    // Also sync language/timezone to user profile
    updateProfile.mutate({
      language: generalPreferences.language,
      timezone: generalPreferences.timezone,
    } as Record<string, string>);
  };

  const resetToDefaults = () => {
    setNotifPreferences({
      email_alerts: true,
      push_notifications: true,
      weekly_digest: false,
      weather_alerts: true,
      prediction_alerts: true,
      community_updates: true,
      market_price_changes: false,
      system_notifications: true,
      newsletter: false,
    });
    setGeneralPreferences({
      language: 'fr',
      timezone: 'Africa/Dakar',
      date_format: 'DD/MM/YYYY',
      time_format: '24h',
      default_view: 'grid',
      enable_shortcuts: true,
    });
    setPrivacyPreferences({
      profile_public: true,
      show_online_status: true,
      allow_messages: true,
      share_activity: false,
      show_email: false,
      show_phone: false,
    });
    toast.success('Préférences réinitialisées par défaut');
  };

  if (prefsLoading) {
    return (
      <div className="space-y-4">
        {[1,2,3,4].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
      </div>
    );
  }

  const isSaving = updatePreferences.isPending || updateProfile.isPending;

  return (
    <div className="space-y-8">
      {/* Section Apparence */}
      <div className="space-y-4 pb-6 border-b border-border">
        <div className="flex items-center gap-2">
          <Monitor className="h-5 w-5 text-primary" />
          <h3 className="text-base font-semibold">Apparence</h3>
        </div>
        
        <div className="max-w-xs space-y-3 ml-7">
          <div>
            <label className="text-sm font-medium block mb-2">Thème</label>
            <Select value={theme} onValueChange={(v) => saveTheme(v as 'light' | 'dark' | 'system')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    Mode clair
                  </div>
                </SelectItem>
                <SelectItem value="dark">
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4" />
                    Mode sombre
                  </div>
                </SelectItem>
                <SelectItem value="system">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    Système
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">Vue par défaut</label>
            <Select 
              value={generalPreferences.default_view} 
              onValueChange={(value) => 
                setGeneralPreferences({...generalPreferences, default_view: value})
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grid">Grille</SelectItem>
                <SelectItem value="list">Liste</SelectItem>
                <SelectItem value="compact">Compacte</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Section Paramètres Régionaux */}
      <div className="space-y-4 pb-6 border-b border-border">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          <h3 className="text-base font-semibold">Paramètres régionaux</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-7">
          <div>
            <label className="text-sm font-medium block mb-2">Langue</label>
            <Select 
              value={generalPreferences.language} 
              onValueChange={(lang) => 
                setGeneralPreferences({...generalPreferences, language: lang})
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="pt">Português</SelectItem>
                <SelectItem value="wo">Wolof</SelectItem>
                <SelectItem value="ar">العربية</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">Fuseau horaire</label>
            <Select 
              value={generalPreferences.timezone} 
              onValueChange={(tz) => 
                setGeneralPreferences({...generalPreferences, timezone: tz})
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Africa/Dakar">Africa/Dakar (GMT)</SelectItem>
                <SelectItem value="Africa/Lagos">Africa/Lagos (GMT+1)</SelectItem>
                <SelectItem value="Africa/Nairobi">Africa/Nairobi (GMT+3)</SelectItem>
                <SelectItem value="Africa/Johannesburg">Africa/Johannesburg (GMT+2)</SelectItem>
                <SelectItem value="Africa/Casablanca">Africa/Casablanca (GMT+1)</SelectItem>
                <SelectItem value="Europe/Paris">Europe/Paris (GMT+1/2)</SelectItem>
                <SelectItem value="UTC">UTC</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">Format de date</label>
            <Select 
              value={generalPreferences.date_format} 
              onValueChange={(fmt) => 
                setGeneralPreferences({...generalPreferences, date_format: fmt})
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">Format d'heure</label>
            <Select 
              value={generalPreferences.time_format} 
              onValueChange={(fmt) => 
                setGeneralPreferences({...generalPreferences, time_format: fmt})
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">24 heures</SelectItem>
                <SelectItem value="12h">12 heures (AM/PM)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Section Notifications */}
      <div className="space-y-4 pb-6 border-b border-border">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          <h3 className="text-base font-semibold">Notifications</h3>
        </div>

        <div className="space-y-3 ml-7">
          {[
            { key: 'email_alerts', label: 'Alertes par email', icon: Mail },
            { key: 'push_notifications', label: 'Notifications push', icon: Wifi },
            { key: 'weather_alerts', label: 'Alertes météo', icon: AlertCircle },
            { key: 'prediction_alerts', label: 'Alertes de prédiction', icon: Eye },
            { key: 'community_updates', label: 'Mises à jour communautaires', icon: Globe },
            { key: 'market_price_changes', label: 'Variations de prix marchés', icon: MessageSquare },
            { key: 'weekly_digest', label: 'Résumé hebdomadaire', icon: Calendar },
            { key: 'system_notifications', label: 'Notifications système', icon: Monitor },
            { key: 'newsletter', label: 'Newsletter', icon: Mail },
          ].map(({ key, label, icon: Icon }) => (
            <div key={key} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{label}</span>
              </div>
              <Switch
                checked={notifPreferences[key as keyof typeof notifPreferences]}
                onCheckedChange={(checked) =>
                  setNotifPreferences({ ...notifPreferences, [key]: checked })
                }
              />
            </div>
          ))}
        </div>
      </div>

      {/* Section Confidentialité */}
      <div className="space-y-4 pb-6 border-b border-border">
        <div className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-primary" />
          <h3 className="text-base font-semibold">Confidentialité</h3>
        </div>

        <div className="space-y-3 ml-7">
          {[
            { key: 'profile_public', label: 'Profil public' },
            { key: 'show_online_status', label: 'Afficher le statut en ligne' },
            { key: 'allow_messages', label: 'Autoriser les messages' },
            { key: 'show_email', label: 'Afficher mon email' },
            { key: 'show_phone', label: 'Afficher mon téléphone' },
            { key: 'share_activity', label: 'Partager mon activité' },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">{label}</span>
              <Switch
                checked={privacyPreferences[key as keyof typeof privacyPreferences]}
                onCheckedChange={(checked) =>
                  setPrivacyPreferences({ ...privacyPreferences, [key]: checked })
                }
              />
            </div>
          ))}
        </div>
      </div>

      {/* Section Accessibilité */}
      <div className="space-y-4 pb-6 border-b border-border">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <h3 className="text-base font-semibold">Accessibilité</h3>
        </div>

        <div className="space-y-3 ml-7">
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div>
              <span className="text-sm font-medium block">Raccourcis clavier</span>
              <span className="text-xs text-muted-foreground">Activez les raccourcis clavier pour une navigation rapide</span>
            </div>
            <Switch 
              checked={generalPreferences.enable_shortcuts}
              onCheckedChange={(checked) => 
                setGeneralPreferences({...generalPreferences, enable_shortcuts: checked})
              }
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          onClick={savePreferences}
          disabled={isSaving}
          className="flex items-center gap-2"
        >
          <Check className="h-4 w-4" />
          {isSaving ? 'Enregistrement...' : 'Enregistrer les préférences'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={resetToDefaults}
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Réinitialiser par défaut
        </Button>
      </div>
    </div>
  );
}

