'use client';

import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/stores/ui-store';
import { useUpdateProfile } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { 
  Bell, 
  Moon, 
  Monitor, 
  Sun, 
  Globe, 
  Clock, 
  Eye, 
  Mail,
  MessageSquare,
  AlertCircle,
  Calendar,
  Check,
  RotateCcw
} from 'lucide-react';

export function PreferencesForm() {
  const { theme, setTheme } = useUIStore();
  const updateProfile = useUpdateProfile();
  const [isSaving, setIsSaving] = useState(false);

  // États des préférences de notifications
  const [notifPreferences, setNotifPreferences] = useState({
    emailAlerts: true,
    pushNotifications: true,
    weeklyDigest: false,
    weatherAlerts: true,
    predictionAlerts: true,
    communityUpdates: true,
    marketPriceChanges: false,
    systemNotifications: true,
    newsLetter: false,
  });

  const [generalPreferences, setGeneralPreferences] = useState({
    language: 'fr',
    timezone: 'Africa/Dakar',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    defaultListView: 'grid',
    enableShortcuts: true,
  });

  const [privacyPreferences, setPrivacyPreferences] = useState({
    profilePublic: true,
    showOnlineStatus: true,
    allowMessages: true,
    shareActivity: false,
    showEmail: false,
    showPhone: false,
  });

  const saveTheme = (t: 'light' | 'dark' | 'system') => {
    setTheme(t);
    updateProfile.mutate(
      { theme: t === 'system' ? undefined : t },
      { onSuccess: () => toast.success('Apparence mise à jour') }
    );
  };

  const savePreferences = async () => {
    try {
      setIsSaving(true);
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulation API
      
      updateProfile.mutate(
        {
          language: generalPreferences.language,
          timezone: generalPreferences.timezone,
          notifications: notifPreferences,
          privacy: privacyPreferences,
        } as any,
        { onSuccess: () => toast.success('Préférences enregistrées') }
      );
    } finally {
      setIsSaving(false);
    }
  };

  const resetToDefaults = () => {
    setNotifPreferences({
      emailAlerts: true,
      pushNotifications: true,
      weeklyDigest: false,
      weatherAlerts: true,
      predictionAlerts: true,
      communityUpdates: true,
      marketPriceChanges: false,
      systemNotifications: true,
      newsLetter: false,
    });
    setGeneralPreferences({
      language: 'fr',
      timezone: 'Africa/Dakar',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h',
      defaultListView: 'grid',
      enableShortcuts: true,
    });
    setPrivacyPreferences({
      profilePublic: true,
      showOnlineStatus: true,
      allowMessages: true,
      shareActivity: false,
      showEmail: false,
      showPhone: false,
    });
    toast.success('Préférences réinitialisées par défaut');
  };

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
              value={generalPreferences.defaultListView} 
              onValueChange={(value) => 
                setGeneralPreferences({...generalPreferences, defaultListView: value})
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
                <SelectItem value="Africa/Johannesburg">Africa/Johannesburg (GMT+2)</SelectItem>
                <SelectItem value="UTC">UTC</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">Format de date</label>
            <Select 
              value={generalPreferences.dateFormat} 
              onValueChange={(fmt) => 
                setGeneralPreferences({...generalPreferences, dateFormat: fmt})
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
              value={generalPreferences.timeFormat} 
              onValueChange={(fmt) => 
                setGeneralPreferences({...generalPreferences, timeFormat: fmt})
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
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Alertes par email</span>
            </div>
            <Switch 
              checked={notifPreferences.emailAlerts}
              onCheckedChange={(checked) => 
                setNotifPreferences({...notifPreferences, emailAlerts: checked})
              }
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Notifications push</span>
            </div>
            <Switch 
              checked={notifPreferences.pushNotifications}
              onCheckedChange={(checked) => 
                setNotifPreferences({...notifPreferences, pushNotifications: checked})
              }
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Alertes météo</span>
            </div>
            <Switch 
              checked={notifPreferences.weatherAlerts}
              onCheckedChange={(checked) => 
                setNotifPreferences({...notifPreferences, weatherAlerts: checked})
              }
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Alertes de prédiction</span>
            </div>
            <Switch 
              checked={notifPreferences.predictionAlerts}
              onCheckedChange={(checked) => 
                setNotifPreferences({...notifPreferences, predictionAlerts: checked})
              }
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Résumé hebdomadaire</span>
            </div>
            <Switch 
              checked={notifPreferences.weeklyDigest}
              onCheckedChange={(checked) => 
                setNotifPreferences({...notifPreferences, weeklyDigest: checked})
              }
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Mises à jour communautaires</span>
            </div>
            <Switch 
              checked={notifPreferences.communityUpdates}
              onCheckedChange={(checked) => 
                setNotifPreferences({...notifPreferences, communityUpdates: checked})
              }
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Newsletter</span>
            </div>
            <Switch 
              checked={notifPreferences.newsLetter}
              onCheckedChange={(checked) => 
                setNotifPreferences({...notifPreferences, newsLetter: checked})
              }
            />
          </div>
        </div>
      </div>

      {/* Section Confidentialité */}
      <div className="space-y-4 pb-6 border-b border-border">
        <div className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-primary" />
          <h3 className="text-base font-semibold">Confidentialité</h3>
        </div>

        <div className="space-y-3 ml-7">
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <span className="text-sm font-medium">Profil public</span>
            <Switch 
              checked={privacyPreferences.profilePublic}
              onCheckedChange={(checked) => 
                setPrivacyPreferences({...privacyPreferences, profilePublic: checked})
              }
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <span className="text-sm font-medium">Afficher le statut en ligne</span>
            <Switch 
              checked={privacyPreferences.showOnlineStatus}
              onCheckedChange={(checked) => 
                setPrivacyPreferences({...privacyPreferences, showOnlineStatus: checked})
              }
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <span className="text-sm font-medium">Autoriser les messages</span>
            <Switch 
              checked={privacyPreferences.allowMessages}
              onCheckedChange={(checked) => 
                setPrivacyPreferences({...privacyPreferences, allowMessages: checked})
              }
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <span className="text-sm font-medium">Afficher mon email</span>
            <Switch 
              checked={privacyPreferences.showEmail}
              onCheckedChange={(checked) => 
                setPrivacyPreferences({...privacyPreferences, showEmail: checked})
              }
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <span className="text-sm font-medium">Afficher mon téléphone</span>
            <Switch 
              checked={privacyPreferences.showPhone}
              onCheckedChange={(checked) => 
                setPrivacyPreferences({...privacyPreferences, showPhone: checked})
              }
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <span className="text-sm font-medium">Partager mon activité</span>
            <Switch 
              checked={privacyPreferences.shareActivity}
              onCheckedChange={(checked) => 
                setPrivacyPreferences({...privacyPreferences, shareActivity: checked})
              }
            />
          </div>
        </div>
      </div>

      {/* Section Raccourcis Clavier */}
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
              checked={generalPreferences.enableShortcuts}
              onCheckedChange={(checked) => 
                setGeneralPreferences({...generalPreferences, enableShortcuts: checked})
              }
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          onClick={savePreferences}
          loading={isSaving}
          className="flex items-center gap-2"
        >
          <Check className="h-4 w-4" />
          Enregistrer les préférences
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
