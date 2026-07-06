'use client';

import { useState, useEffect } from 'react';
import {
  Cloud, Sun, CloudRain, Wind, Droplets, Thermometer, Eye,
  Gauge, AlertTriangle, RefreshCw, MapPin, Clock, TrendingUp,
  Sunset, Sunrise, Navigation,
} from 'lucide-react';
import { motion } from '@/lib/motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, LineChart, Line, Legend,
} from 'recharts';
import { useWeather, useWeatherForecast, useWeatherHistory, useWeatherAlerts } from '@/hooks/use-weather';
import { cn } from '@/lib/utils';

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

// Hero gradient by condition
const CONDITION_HERO: Record<string, { gradient: string; emoji: string }> = {
  sunny:        { gradient: 'from-amber-400 via-orange-400 to-yellow-500',      emoji: '☀️' },
  hot:          { gradient: 'from-red-400 via-orange-500 to-amber-500',          emoji: '🔥' },
  partly_cloudy:{ gradient: 'from-blue-400 via-sky-400 to-cyan-400',             emoji: '⛅' },
  cloudy:       { gradient: 'from-slate-400 via-gray-500 to-slate-500',          emoji: '☁️' },
  foggy:        { gradient: 'from-gray-300 via-slate-400 to-gray-500',           emoji: '🌫️' },
  rainy:        { gradient: 'from-blue-500 via-indigo-500 to-blue-700',          emoji: '🌧️' },
  stormy:       { gradient: 'from-purple-600 via-violet-600 to-indigo-700',      emoji: '⛈️' },
  windy:        { gradient: 'from-cyan-400 via-teal-400 to-cyan-600',            emoji: '💨' },
  harmattan:    { gradient: 'from-amber-500 via-yellow-500 to-orange-400',       emoji: '🏜️' },
};

const DEFAULT_HERO = { gradient: 'from-sky-500 via-blue-500 to-cyan-600', emoji: '🌡️' };

const SEVERITY_CONFIG = {
  minor:    { color: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-950/20 dark:border-yellow-800 dark:text-yellow-200', label: 'Mineur' },
  moderate: { color: 'bg-orange-50 border-orange-200 text-orange-800 dark:bg-orange-950/20 dark:border-orange-800 dark:text-orange-200', label: 'Modéré' },
  severe:   { color: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/20 dark:border-red-800 dark:text-red-200', label: 'Sévère' },
  extreme:  { color: 'bg-red-100 border-red-400 text-red-900 dark:bg-red-950/40 dark:border-red-600 dark:text-red-100', label: 'Extrême' },
};

function MetricPill({ icon: Icon, value, label, className }: {
  icon: React.ElementType; value: string | number; label: string; className?: string;
}) {
  return (
    <div className={cn('flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-xl px-3 py-2', className)}>
      <Icon className="h-4 w-4 text-white/80" />
      <div>
        <p className="text-white font-bold text-sm leading-none">{value}</p>
        <p className="text-white/60 text-[10px] leading-none mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function WeatherMetricCard({ icon: Icon, label, value, unit, color = 'text-primary' }: {
  icon: React.ElementType; label: string; value: string | number; unit?: string; color?: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-xl">
      <div className={cn('p-2 rounded-lg bg-background/80')}>
        <Icon className={cn('h-4 w-4', color)} />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold">
          {value}
          {unit && <span className="text-xs text-muted-foreground ml-0.5">{unit}</span>}
        </p>
      </div>
    </div>
  );
}

export default function WeatherPage() {
  const [city, setCity] = useState('Dakar');
  const [historyDays, setHistoryDays] = useState(7);

  const { data: weather, isLoading: currentLoading, isError: currentError, refetch } = useWeather(city);
  const { data: forecast, isLoading: forecastLoading, isError: forecastError } = useWeatherForecast(city, 7);
  const { data: history, isLoading: historyLoading } = useWeatherHistory(city, historyDays);
  const { data: weatherAlerts } = useWeatherAlerts(city);

  const [now, setNow] = useState('');
  const [todayStr, setTodayStr] = useState('');
  useEffect(() => {
    const fmt = () => new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    setNow(fmt());
    setTodayStr(new Date().toDateString());
    const id = setInterval(() => setNow(fmt()), 60_000);
    return () => clearInterval(id);
  }, []);

  const hero = weather?.condition ? (CONDITION_HERO[weather.condition as string] || DEFAULT_HERO) : DEFAULT_HERO;

  const forecastChartData = (forecast?.forecast || []).map((day) => ({
    name: new Date(day.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
    max: day.temperature_max,
    min: day.temperature_min,
    pluie: day.precipitation_probability,
    vent: day.wind_speed,
  }));

  const historyChartData = (history?.data || []).map((d) => ({
    name: new Date(d.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
    max: d.temperature_max,
    min: d.temperature_min,
    humidite: d.humidity,
    pluie_mm: d.precipitation_mm,
  }));

  return (
    <div className="min-h-full">
      {/* ── Hero Banner ───────────────────────────────────────────────────── */}
      <div className={cn('relative overflow-hidden bg-gradient-to-br', hero.gradient)}>
        {/* Background decor */}
        <div className="absolute -top-16 -right-16 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-60 h-60 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <svg className="absolute inset-0 w-full h-full opacity-[0.06] pointer-events-none" preserveAspectRatio="none">
          <defs>
            <pattern id="wgrid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#wgrid)" />
        </svg>

        <div className="relative z-10 px-6 py-8">
          {/* Top row: location + actions */}
          <div className="flex items-start justify-between mb-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <div className="flex items-center gap-2 text-white/70 text-sm mb-1">
                <MapPin className="h-4 w-4" />
                <span>{weather?.city ?? city}, {weather?.country ?? 'AF'}</span>
                <span className="h-1.5 w-1.5 rounded-full bg-green-300 animate-pulse" />
                <Clock className="h-3.5 w-3.5 ml-1" />
                <span>{now}</span>
              </div>
              {currentLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-20 w-48 bg-white/20" />
                  <Skeleton className="h-6 w-36 bg-white/20" />
                </div>
              ) : currentError ? (
                <div className="text-white/80 mt-2">
                  <AlertTriangle className="h-8 w-8 mb-2 text-white/60" />
                  <p className="text-sm">Service météo indisponible</p>
                </div>
              ) : weather ? (
                <>
                  <div className="flex items-end gap-2">
                    <span className="text-7xl sm:text-8xl font-bold text-white leading-none">{weather.temperature}°</span>
                    <span className="text-3xl text-white/60 mb-2">C</span>
                  </div>
                  <p className="text-white/80 text-base capitalize mt-1">{weather.description}</p>
                  {weather.feels_like !== undefined && (
                    <p className="text-white/60 text-sm mt-0.5">Ressenti {weather.feels_like}°C</p>
                  )}
                </>
              ) : null}
            </motion.div>

            <motion.div
              className="flex flex-col items-end gap-3"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <div className="text-6xl select-none">{hero.emoji}</div>
              {weather && (
                <div className="flex gap-2 flex-wrap justify-end">
                  <MetricPill icon={Droplets} value={`${weather.humidity}%`} label="Humidité" />
                  <MetricPill icon={Wind} value={`${weather.wind_speed} km/h`} label="Vent" />
                  {weather.uv_index !== undefined && (
                    <MetricPill icon={Sun} value={`UV ${weather.uv_index}`} label="Indice UV" />
                  )}
                </div>
              )}
              <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white border border-white/20 hover:bg-white/10 hover:text-white"
                    onClick={() => refetch()}
                    aria-label="Actualiser les données météo"
                  >
                    <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                    Actualiser
                  </Button>
              </div>
            </motion.div>
          </div>

          {/* City selector strip */}
          <motion.div
            className="flex gap-2 flex-wrap"
            role="radiogroup"
            aria-label="Sélectionner une ville"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            {CITIES.map((c) => (
              <button
                key={c}
                role="radio"
                aria-checked={city === c}
                onClick={() => setCity(c)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm font-medium transition-all border',
                  city === c
                    ? 'bg-white text-gray-800 border-white shadow-md'
                    : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                )}
              >
                {c}
              </button>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <div className="p-6 space-y-6">
        {/* Weather Alerts Banner */}
        {weatherAlerts && weatherAlerts.length > 0 && (
          <div className="space-y-2">
            {weatherAlerts.map((alert) => {
              const cfg = SEVERITY_CONFIG[alert.severity as keyof typeof SEVERITY_CONFIG] || SEVERITY_CONFIG.minor;
              return (
                <div key={alert.id} className={cn('flex items-start gap-3 p-3 rounded-xl border', cfg.color)}>
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
          {/* ── Detailed Metrics Card ── */}
          <div className="xl:col-span-1">
            <Card className="h-full shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-primary" />
                  Métriques détaillées — {city}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {currentLoading ? (
                  <Skeleton className="h-48 w-full" />
                ) : currentError ? (
                  <div className="flex flex-col items-center justify-center h-40 text-center gap-3">
                    <AlertTriangle className="h-8 w-8 text-amber-500" />
                    <p className="text-sm text-muted-foreground">Service météo temporairement indisponible</p>
                    <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
                      <RefreshCw className="h-3.5 w-3.5" />Réessayer
                    </Button>
                  </div>
                ) : weather ? (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <WeatherMetricCard icon={Droplets} label="Humidité" value={weather.humidity} unit="%" color="text-blue-500" />
                      <WeatherMetricCard icon={Wind} label="Vent" value={weather.wind_speed} unit=" km/h" color="text-green-500" />
                      <WeatherMetricCard icon={Eye} label="Visibilité" value={weather.visibility ?? '—'} unit=" km" color="text-purple-500" />
                      <WeatherMetricCard icon={Gauge} label="Pression" value={weather.pressure ?? '—'} unit=" hPa" color="text-orange-500" />
                      <WeatherMetricCard icon={Sun} label="UV" value={`${weather.uv_index ?? '—'}`} color="text-yellow-500" />
                      {weather.dew_point !== undefined && (
                        <WeatherMetricCard icon={Thermometer} label="Rosée" value={weather.dew_point} unit="°C" color="text-cyan-500" />
                      )}
                    </div>
                    {(weather.sunrise || weather.sunset) && (
                      <div className="flex justify-around pt-3 mt-2 border-t border-border">
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
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">Données non disponibles</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ── 7-Day Forecast ── */}
          <div className="xl:col-span-2">
            <Card className="h-full shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Prévisions 7 jours — {city}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {forecastLoading ? (
                  <Skeleton className="h-48 w-full" />
                ) : forecastError ? (
                  <div className="h-48 flex flex-col items-center justify-center text-center gap-3">
                    <AlertTriangle className="h-6 w-6 text-amber-500" />
                    <p className="text-sm text-muted-foreground">Prévisions indisponibles pour le moment</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-7 gap-1">
                      {(forecast?.forecast || []).slice(0, 7).map((day) => {
                        const DayIcon = WEATHER_ICONS[day.condition as string] || Cloud;
                        const dayColor = WEATHER_COLORS[day.condition as string] || '#6B7280';
                        const date = new Date(day.date);
                        const isToday = todayStr !== '' && date.toDateString() === todayStr;
                        return (
                          <div
                            key={day.date}
                            role="article"
                            aria-label={`Prévision ${isToday ? 'aujourd\'hui' : date.toLocaleDateString('fr-FR', { weekday: 'long' })}: ${day.temperature_max}°C max, ${day.temperature_min}°C min, ${day.precipitation_probability}% précipitations`}
                            className={cn(
                              'text-center p-2 rounded-xl border transition-all hover:shadow-md',
                              isToday
                                ? 'bg-primary/10 border-primary/30 shadow-sm'
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
                    {forecastChartData.length > 0 && (
                      <div className="h-36">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={forecastChartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="gMax" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#EF4444" stopOpacity={0.25} />
                                <stop offset="100%" stopColor="#EF4444" stopOpacity={0.02} />
                              </linearGradient>
                              <linearGradient id="gMin" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.25} />
                                <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.02} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.6} />
                            <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                            <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '10px', fontSize: '12px' }} />
                            <Area type="monotone" dataKey="max" stroke="#EF4444" fill="url(#gMax)" name="Max °C" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
                            <Area type="monotone" dataKey="min" stroke="#3B82F6" fill="url(#gMin)" name="Min °C" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Thermometer className="h-5 w-5 text-orange-500" />
                  Historique des températures
                </CardTitle>
                <div className="flex gap-1 bg-muted/50 rounded-lg p-0.5" role="radiogroup" aria-label="Période historique">
                  {[7, 14, 30].map((d) => (
                    <button
                      key={d}
                      role="radio"
                      aria-checked={historyDays === d}
                      onClick={() => setHistoryDays(d)}
                      className={cn(
                        'px-3 h-7 text-xs font-medium rounded-md transition-colors',
                        historyDays === d ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {d}j
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {historyLoading ? <Skeleton className="h-48 w-full" /> : historyChartData.length > 0 ? (
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={historyChartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.6} />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} unit="°" />
                      <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '10px', fontSize: '12px' }} />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Line type="monotone" dataKey="max" stroke="#EF4444" dot={false} name="Max °C" strokeWidth={2.5} />
                      <Line type="monotone" dataKey="min" stroke="#3B82F6" dot={false} name="Min °C" strokeWidth={2.5} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">Aucun historique disponible</div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Droplets className="h-5 w-5 text-blue-500" />
                Précipitations & Humidité
              </CardTitle>
            </CardHeader>
            <CardContent>
              {historyLoading ? <Skeleton className="h-48 w-full" /> : historyChartData.length > 0 ? (
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={historyChartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.6} />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                      <YAxis yAxisId="left" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} unit="mm" />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} unit="%" />
                      <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '10px', fontSize: '12px' }} />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Bar yAxisId="left" dataKey="pluie_mm" fill="#3B82F6" name="Pluie mm" radius={[3, 3, 0, 0]} />
                      <Line yAxisId="right" type="monotone" dataKey="humidite" stroke="#10B981" dot={false} name="Humidité %" strokeWidth={2.5} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">Aucun historique disponible</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Multi-city comparison ── */}
        <Card className="shadow-sm">
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
      </div>
    </div>
  );
}

function CityWeatherCard({ city, selected, onClick }: { city: string; selected: boolean; onClick: () => void }) {
  const { data, isLoading } = useWeather(city);
  const Icon = data?.condition ? (WEATHER_ICONS[data.condition as string] || Sun) : Sun;
  const color = data?.condition ? (WEATHER_COLORS[data.condition as string] || '#F59E0B') : '#F59E0B';
  const heroGrad = data?.condition ? (CONDITION_HERO[data.condition as string]?.gradient || DEFAULT_HERO.gradient) : DEFAULT_HERO.gradient;

  return (
    <button
      onClick={onClick}
      className={cn(
        'p-3 rounded-xl border text-center transition-all hover:shadow-md overflow-hidden relative',
        selected ? 'border-primary shadow-md' : 'border-border hover:border-primary/40'
      )}
    >
      {selected && (
        <div className={cn('absolute inset-0 bg-gradient-to-br opacity-10 pointer-events-none', heroGrad)} />
      )}
      {isLoading ? (
        <Skeleton className="h-16 w-full" />
      ) : (
        <>
          <p className="text-xs font-semibold truncate relative z-10">{city}</p>
          <Icon className="h-7 w-7 mx-auto my-1.5 relative z-10" style={{ color }} />
          <p className="text-xl font-bold font-data relative z-10">{data?.temperature ?? '—'}°</p>
          <p className="text-xs text-muted-foreground relative z-10">{data?.humidity ?? '—'}%</p>
        </>
      )}
    </button>
  );
}
