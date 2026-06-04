'use client';

import { useState } from 'react';
import {
  Cloud, Sun, CloudRain, Wind, Droplets, Thermometer, Eye,
  Gauge, AlertTriangle, RefreshCw, MapPin, Clock, TrendingUp,
  Sunset, Sunrise, Navigation,
} from 'lucide-react';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, LineChart, Line, Legend,
} from 'recharts';
import { useWeather, useWeatherForecast, useWeatherHistory, useWeatherAlerts } from '@/hooks/use-weather';
import { cn } from '@/lib/utils';
import type { LocalWeatherCondition } from '@/types/weather';

const CITIES = [
  'Dakar', 'Abidjan', 'Accra', 'Lagos', 'Bamako', 'Niamey',
  'Lomé', 'Cotonou', 'Conakry', 'Ouagadougou', 'Bissau', 'Freetown',
];

const WEATHER_ICONS: Record<string, React.ElementType> = {
  sunny: Sun, hot: Sun,
  partly_cloudy: Cloud, cloudy: Cloud, foggy: Cloud,
  rainy: CloudRain, stormy: CloudRain,
  windy: Wind, harmattan: Wind,
};

const WEATHER_COLORS: Record<string, string> = {
  sunny: '#F59E0B', hot: '#EF4444',
  partly_cloudy: '#6B7280', cloudy: '#9CA3AF', foggy: '#D1D5DB',
  rainy: '#3B82F6', stormy: '#1D4ED8',
  windy: '#10B981', harmattan: '#D97706',
};

const SEVERITY_CONFIG = {
  minor: { color: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-950/20 dark:border-yellow-800 dark:text-yellow-200', label: 'Mineur' },
  moderate: { color: 'bg-orange-50 border-orange-200 text-orange-800 dark:bg-orange-950/20 dark:border-orange-800 dark:text-orange-200', label: 'Modéré' },
  severe: { color: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/20 dark:border-red-800 dark:text-red-200', label: 'Sévère' },
  extreme: { color: 'bg-red-100 border-red-400 text-red-900 dark:bg-red-950/40 dark:border-red-600 dark:text-red-100', label: 'Extrême' },
};

function WeatherMetricCard({
  icon: Icon, label, value, unit, color = 'text-primary',
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  unit?: string;
  color?: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-xl">
      <div className={cn('p-2 rounded-lg bg-background', color === 'text-primary' ? 'bg-primary/10' : '')}>
        <Icon className={cn('h-5 w-5', color)} />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold">{value}{unit && <span className="text-xs text-muted-foreground ml-0.5">{unit}</span>}</p>
      </div>
    </div>
  );
}

export default function WeatherPage() {
  const [city, setCity] = useState('Dakar');
  const [historyDays, setHistoryDays] = useState(7);

  const { data: weather, isLoading: currentLoading, refetch } = useWeather(city);
  const { data: forecast, isLoading: forecastLoading } = useWeatherForecast(city, 7);
  const { data: history, isLoading: historyLoading } = useWeatherHistory(city, historyDays);
  const { data: weatherAlerts } = useWeatherAlerts(city);

  const WeatherIcon = weather?.condition
    ? (WEATHER_ICONS[weather.condition as string] || Sun)
    : Sun;

  const iconColor = weather?.condition
    ? (WEATHER_COLORS[weather.condition as string] || '#F59E0B')
    : '#F59E0B';

  // Format forecast for recharts
  const forecastChartData = (forecast?.forecast || []).map((day: any) => ({
    name: new Date(day.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
    max: day.temperature_max,
    min: day.temperature_min,
    pluie: day.precipitation_probability,
    vent: day.wind_speed,
  }));

  // Format history for recharts
  const historyChartData = (history?.data || []).map((d: any) => ({
    name: new Date(d.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
    max: d.temperature_max,
    min: d.temperature_min,
    humidite: d.humidity,
    pluie_mm: d.precipitation_mm,
  }));

  const now = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  return (
    <PageWrapper
      title="Météo"
      description="Conditions en temps réel, prévisions 7 jours et historique climatique"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Actualiser
          </Button>
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CITIES.map((c) => (
                <SelectItem key={c} value={c}>
                  <span className="flex items-center gap-2">
                    <MapPin className="h-3 w-3" /> {c}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      }
    >
      {/* Weather Alerts Banner */}
      {weatherAlerts && weatherAlerts.length > 0 && (
        <div className="space-y-2 mb-4">
          {weatherAlerts.map((alert) => {
            const cfg = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.minor;
            return (
              <div key={alert.id} className={cn('flex items-start gap-3 p-3 rounded-lg border', cfg.color)}>
                <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{alert.title}</span>
                    <Badge variant="outline" className="text-xs">{cfg.label}</Badge>
                  </div>
                  <p className="text-xs mt-0.5">{alert.description}</p>
                  <p className="text-xs opacity-70 mt-0.5">
                    {new Date(alert.start_time).toLocaleDateString('fr-FR')} → {new Date(alert.end_time).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* ── Current Weather Card ── */}
        <div className="xl:col-span-1">
          <Card className="h-full bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-950/20 dark:to-sky-950/20 border-blue-200 dark:border-blue-800">
            {currentLoading ? (
              <CardContent className="p-6">
                <Skeleton className="h-64 w-full" />
              </CardContent>
            ) : weather ? (
              <CardContent className="p-6 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span className="font-medium">{weather.city}, {weather.country}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {now}
                    <span className="ml-1 h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  </div>
                </div>

                {/* Main temp */}
                <div className="flex items-center gap-4">
                  <WeatherIcon
                    className="h-20 w-20 flex-shrink-0"
                    style={{ color: iconColor }}
                  />
                  <div>
                    <p className="text-6xl font-bold font-mono">{weather.temperature}°</p>
                    <p className="text-muted-foreground capitalize mt-1 text-sm">{weather.description}</p>
                    {weather.feels_like !== undefined && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Ressenti {weather.feels_like}°C
                      </p>
                    )}
                  </div>
                </div>

                {/* Metrics grid */}
                <div className="grid grid-cols-2 gap-2">
                  <WeatherMetricCard icon={Droplets} label="Humidité" value={weather.humidity} unit="%" color="text-blue-500" />
                  <WeatherMetricCard icon={Wind} label="Vent" value={weather.wind_speed} unit=" km/h" color="text-green-500" />
                  <WeatherMetricCard icon={Eye} label="Visibilité" value={weather.visibility ?? '—'} unit=" km" color="text-purple-500" />
                  <WeatherMetricCard icon={Gauge} label="Pression" value={weather.pressure ?? '—'} unit=" hPa" color="text-orange-500" />
                  <WeatherMetricCard icon={Sun} label="UV" value={`${weather.uv_index ?? '—'}`} color="text-yellow-500" />
                  {weather.dew_point !== undefined && (
                    <WeatherMetricCard icon={Thermometer} label="Point de rosée" value={weather.dew_point} unit="°C" color="text-cyan-500" />
                  )}
                </div>

                {/* Sunrise/Sunset */}
                {(weather.sunrise || weather.sunset) && (
                  <div className="flex justify-around pt-2 border-t border-blue-200 dark:border-blue-800">
                    {weather.sunrise && (
                      <div className="text-center">
                        <Sunrise className="h-5 w-5 text-orange-400 mx-auto" />
                        <p className="text-xs text-muted-foreground mt-1">Lever</p>
                        <p className="text-sm font-semibold">{weather.sunrise}</p>
                      </div>
                    )}
                    {weather.sunset && (
                      <div className="text-center">
                        <Sunset className="h-5 w-5 text-purple-400 mx-auto" />
                        <p className="text-xs text-muted-foreground mt-1">Coucher</p>
                        <p className="text-sm font-semibold">{weather.sunset}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            ) : (
              <CardContent className="p-6 flex items-center justify-center h-48 text-muted-foreground text-sm">
                Données météo non disponibles
              </CardContent>
            )}
          </Card>
        </div>

        {/* ── 7-Day Forecast ── */}
        <div className="xl:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-5 w-5 text-primary" />
                Prévisions 7 jours — {city}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {forecastLoading ? (
                <Skeleton className="h-48 w-full" />
              ) : (
                <div className="space-y-4">
                  {/* Forecast cards row */}
                  <div className="grid grid-cols-7 gap-1">
                    {(forecast?.forecast || []).slice(0, 7).map((day: any) => {
                      const DayIcon = WEATHER_ICONS[day.condition as string] || Cloud;
                      const dayColor = WEATHER_COLORS[day.condition as string] || '#6B7280';
                      const date = new Date(day.date);
                      const isToday = date.toDateString() === new Date().toDateString();
                      return (
                        <div
                          key={day.date}
                          className={cn(
                            'text-center p-2 rounded-xl border transition-colors',
                            isToday
                              ? 'bg-primary/10 border-primary/30'
                              : 'bg-muted/30 border-transparent hover:border-border'
                          )}
                        >
                          <p className="text-xs text-muted-foreground font-medium">
                            {isToday ? 'Auj.' : date.toLocaleDateString('fr-FR', { weekday: 'short' })}
                          </p>
                          <p className="text-xs text-muted-foreground">{date.getDate()}</p>
                          <DayIcon className="h-6 w-6 mx-auto my-1.5" style={{ color: dayColor }} />
                          <p className="text-xs font-bold">{day.temperature_max}°</p>
                          <p className="text-xs text-muted-foreground">{day.temperature_min}°</p>
                          <div className="flex items-center justify-center gap-0.5 mt-1">
                            <Droplets className="h-2.5 w-2.5 text-blue-400" />
                            <span className="text-xs text-blue-500">{day.precipitation_probability}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Temperature chart */}
                  {forecastChartData.length > 0 && (
                    <div className="h-36">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={forecastChartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                          <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                          <Tooltip
                            contentStyle={{
                              background: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px',
                              fontSize: '12px',
                            }}
                          />
                          <Area type="monotone" dataKey="max" stroke="#EF4444" fill="#EF444420" name="Max °C" strokeWidth={2} />
                          <Area type="monotone" dataKey="min" stroke="#3B82F6" fill="#3B82F620" name="Min °C" strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Historical Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Temperature history */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Thermometer className="h-5 w-5 text-orange-500" />
                Historique des températures
              </CardTitle>
              <Select value={String(historyDays)} onValueChange={(v) => setHistoryDays(Number(v))}>
                <SelectTrigger className="w-24 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 jours</SelectItem>
                  <SelectItem value="14">14 jours</SelectItem>
                  <SelectItem value="30">30 jours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {historyLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : historyChartData.length > 0 ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historyChartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} unit="°" />
                    <Tooltip
                      contentStyle={{
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Line type="monotone" dataKey="max" stroke="#EF4444" dot={false} name="Max °C" strokeWidth={2} />
                    <Line type="monotone" dataKey="min" stroke="#3B82F6" dot={false} name="Min °C" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
                Aucun historique disponible
              </div>
            )}
          </CardContent>
        </Card>

        {/* Precipitation + humidity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Droplets className="h-5 w-5 text-blue-500" />
              Précipitations & Humidité
            </CardTitle>
          </CardHeader>
          <CardContent>
            {historyLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : historyChartData.length > 0 ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={historyChartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} unit="mm" />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} unit="%" />
                    <Tooltip
                      contentStyle={{
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar yAxisId="left" dataKey="pluie_mm" fill="#3B82F6" name="Pluie mm" radius={[2, 2, 0, 0]} />
                    <Line yAxisId="right" type="monotone" dataKey="humidite" stroke="#10B981" dot={false} name="Humidité %" strokeWidth={2} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
                Aucun historique disponible
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Multi-city comparison ── */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Navigation className="h-5 w-5 text-primary" />
            Comparaison multi-villes (conditions actuelles)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {CITIES.slice(0, 6).map((c) => (
              <CityWeatherCard key={c} city={c} selected={c === city} onClick={() => setCity(c)} />
            ))}
          </div>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}

function CityWeatherCard({ city, selected, onClick }: { city: string; selected: boolean; onClick: () => void }) {
  const { data, isLoading } = useWeather(city);
  const Icon = data?.condition ? (WEATHER_ICONS[data.condition as string] || Sun) : Sun;
  const color = data?.condition ? (WEATHER_COLORS[data.condition as string] || '#F59E0B') : '#F59E0B';

  return (
    <button
      onClick={onClick}
      className={cn(
        'p-3 rounded-xl border text-center transition-all hover:shadow-md',
        selected ? 'bg-primary/10 border-primary shadow-md' : 'bg-muted/30 border-border hover:border-primary/50'
      )}
    >
      {isLoading ? (
        <Skeleton className="h-16 w-full" />
      ) : (
        <>
          <p className="text-xs font-medium truncate">{city}</p>
          <Icon className="h-7 w-7 mx-auto my-1.5" style={{ color }} />
          <p className="text-xl font-bold">{data?.temperature ?? '—'}°</p>
          <p className="text-xs text-muted-foreground">{data?.humidity ?? '—'}%</p>
        </>
      )}
    </button>
  );
}
