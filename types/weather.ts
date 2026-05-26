// ============================================================================
// WEATHER TYPES — Alignés avec api.ts Section 10 + enrichissements locaux
// ============================================================================

import type { WeatherData, WeatherForecastDay as ApiForecastDay, WeatherAlert as ApiWeatherAlert } from './api';

// ── Extension des conditions pour le contexte africain ──
export type LocalWeatherCondition =
  | 'sunny'
  | 'partly_cloudy'
  | 'cloudy'
  | 'rainy'
  | 'stormy'
  | 'foggy'
  | 'windy'
  | 'hot'
  | 'harmattan'; // Spécifique Afrique de l'Ouest

// ── Mapping vers le type générique de api.ts ──
export function mapToApiCondition(condition: LocalWeatherCondition): string {
  const mapping: Record<LocalWeatherCondition, string> = {
    sunny: 'Clear',
    partly_cloudy: 'Partly cloudy',
    cloudy: 'Cloudy',
    rainy: 'Rain',
    stormy: 'Thunderstorm',
    foggy: 'Fog',
    windy: 'Wind',
    hot: 'Extreme heat',
    harmattan: 'Dust', // Mappé vers le type 'dust' de api.ts
  };
  return mapping[condition] || condition;
}

// ── Version simplifiée de WeatherCurrent (lightweight) ──
export interface WeatherCurrentCompact {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  temperature: number;
  feels_like: number;
  condition: LocalWeatherCondition;
  description: string;
  humidity: number;
  wind_speed: number;
  wind_direction: string; // api.ts utilise `number` (degrés)
  pressure: number;
  visibility: number;
  uv_index: number;
  updated_at: string;
}

// ── Conversion vers le format api.ts ──
export function expandToWeatherData(compact: WeatherCurrentCompact): WeatherData {
  return {
    location: {
      coordinates: [compact.longitude, compact.latitude],
      city: compact.city,
      country: compact.country,
    },
    current: {
      temperature: compact.temperature,
      feels_like: compact.feels_like,
      humidity: compact.humidity,
      pressure: compact.pressure,
      wind_speed: compact.wind_speed,
      wind_direction: parseInt(compact.wind_direction) || 0, // Conversion string → number
      precipitation: 0, // Non fourni dans la version compacte
      visibility: compact.visibility,
      uv_index: compact.uv_index,
      condition: compact.description,
      icon: getWeatherIcon(compact.condition),
      updated_at: compact.updated_at,
    },
    forecast: [],
  };
}

// ── Helper: icône selon condition ──
export function getWeatherIcon(condition: LocalWeatherCondition): string {
  const icons: Record<LocalWeatherCondition, string> = {
    sunny: '☀️',
    partly_cloudy: '⛅',
    cloudy: '☁️',
    rainy: '🌧️',
    stormy: '⛈️',
    foggy: '🌫️',
    windy: '💨',
    hot: '🌡️',
    harmattan: '🌫️', // Brouillard de sable
  };
  return icons[condition] || '❓';
}

// ── Prévision journalière enrichie (étend api.ts) ──
export interface WeatherForecastDayEnriched extends ApiForecastDay {
  condition: LocalWeatherCondition; // Override du `string` de api.ts
  icon: string; // Assuré par le mapping
  hourly?: Array<{
    time: string;
    temperature: number;
    precipitation_probability: number;
    precipitation_mm: number;
    wind_speed: number;
    condition: LocalWeatherCondition;
    icon: string;
  }>;
}

// ── Alerte météo adaptée au contexte africain ──
export type AfricanWeatherAlertType =
  | 'drought'
  | 'flood'
  | 'storm'
  | 'heat_wave'
  | 'frost'
  | 'harmattan';

export type AlertSeverityLocal = 'watch' | 'warning' | 'emergency';

// Mapping vers l'échelle api.ts
const SEVERITY_MAPPING: Record<AlertSeverityLocal, ApiWeatherAlert['severity']> = {
  watch: 'minor',
  warning: 'severe',
  emergency: 'extreme',
};

export interface WeatherAlertAfrican {
  id: string;
  type: AfricanWeatherAlertType;
  severity: AlertSeverityLocal;
  title: string;
  description: string;
  regions: string[];
  starts_at: string;
  ends_at: string;
}

// ── Conversion vers le format standard api.ts ──
export function mapToApiAlert(alert: WeatherAlertAfrican): ApiWeatherAlert {
  const typeMapping: Record<AfricanWeatherAlertType, ApiWeatherAlert['type']> = {
    drought: 'heatwave', // Approximation
    flood: 'flood',
    storm: 'storm',
    heat_wave: 'heatwave',
    frost: 'coldwave',
    harmattan: 'dust',
  };

  return {
    id: alert.id,
    type: typeMapping[alert.type],
    severity: SEVERITY_MAPPING[alert.severity],
    title: alert.title,
    description: alert.description,
    start_time: alert.starts_at,
    end_time: alert.ends_at,
    areas: alert.regions,
    instructions: undefined,
  };
}

// ── Type aliases pour compatibilité avec les hooks ──
export type WeatherCurrent = WeatherCurrentCompact;
export type WeatherForecast = {
  city: string;
  country: string;
  forecast: WeatherForecastDayEnriched[];
};