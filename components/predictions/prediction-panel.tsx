'use client';

import { useState } from 'react';
import { Brain, TrendingUp, CloudSun, Wheat } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  usePredictYield,
  usePredictPrice,
  usePredictWeather,
  usePredictionHistory,
} from '@/hooks/use-predictions';
import { formatNumber, formatRelativeDate } from '@/lib/utils';
import type { PredictionResult } from '@/types/prediction';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

function PredictionResultView({ result }: { result: PredictionResult }) {
  const chartData = [
    ...(result.historical_data || []).map((p) => ({ date: p.date, value: p.value, type: 'historique' })),
    ...(result.prediction_data || []).map((p) => ({ date: p.date, value: p.value, type: 'prédiction' })),
  ];

  return (
    <Card className="mt-4 border-primary/20">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          Résultat
          <span className="text-2xl font-data font-bold text-primary">
            {formatNumber(result.value)} {result.unit}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Confiance</span>
            <span className="font-data">{Math.round(result.confidence_score * 100)}%</span>
          </div>
          <Progress value={result.confidence_score * 100} />
        </div>
        {result.key_factors?.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Facteurs clés</p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {result.key_factors.slice(0, 4).map((f, i) => (
                <li key={i}>• {f.name}: {f.description}</li>
              ))}
            </ul>
          </div>
        )}
        {chartData.length > 0 && (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function PredictionPanel() {
  const [yieldResult, setYieldResult] = useState<PredictionResult | null>(null);
  const [priceResult, setPriceResult] = useState<PredictionResult | null>(null);
  const [weatherResult, setWeatherResult] = useState<PredictionResult | null>(null);

  const predictYield = usePredictYield();
  const predictPrice = usePredictPrice();
  const predictWeather = usePredictWeather();
  const { data: history } = usePredictionHistory();

  const [crop, setCrop] = useState('maïs');
  const [region, setRegion] = useState('Dakar');
  const [product, setProduct] = useState('riz');
  const [city, setCity] = useState('Dakar');

  return (
    <div className="space-y-6">
      <Tabs defaultValue="yield">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="yield" className="gap-2"><Wheat className="h-4 w-4" />Rendement</TabsTrigger>
          <TabsTrigger value="price" className="gap-2"><TrendingUp className="h-4 w-4" />Prix</TabsTrigger>
          <TabsTrigger value="weather" className="gap-2"><CloudSun className="h-4 w-4" />Météo IA</TabsTrigger>
        </TabsList>

        <TabsContent value="yield" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Prédiction de rendement</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input placeholder="Culture" value={crop} onChange={(e) => setCrop(e.target.value)} />
                <Input placeholder="Région" value={region} onChange={(e) => setRegion(e.target.value)} />
              </div>
              <Button
                loading={predictYield.isPending}
                onClick={() =>
                  predictYield.mutate(
                    { crop, region, area_ha: 10, date: new Date().toISOString().slice(0, 10), country: 'SN' },
                    { onSuccess: setYieldResult }
                  )
                }
                className="gap-2"
              >
                <Brain className="h-4 w-4" />
                Lancer la prédiction
              </Button>
              {yieldResult && <PredictionResultView result={yieldResult} />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="price" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Prédiction de prix</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Input placeholder="Produit" value={product} onChange={(e) => setProduct(e.target.value)} />
              <Select defaultValue="30d">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 jours</SelectItem>
                  <SelectItem value="30d">30 jours</SelectItem>
                  <SelectItem value="90d">90 jours</SelectItem>
                </SelectContent>
              </Select>
              <Button
                loading={predictPrice.isPending}
                onClick={() =>
                  predictPrice.mutate(
                    { product, market: 'Dakar', period: '30d', country: 'SN' },
                    { onSuccess: setPriceResult }
                  )
                }
                className="gap-2"
              >
                <Brain className="h-4 w-4" />
                Prédire le prix
              </Button>
              {priceResult && <PredictionResultView result={priceResult} />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weather" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Prévision météo IA</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Input placeholder="Ville" value={city} onChange={(e) => setCity(e.target.value)} />
              <Button
                loading={predictWeather.isPending}
                onClick={() =>
                  predictWeather.mutate(
                    { latitude: 14.69, longitude: -17.44, city, horizon: '7d' },
                    { onSuccess: setWeatherResult }
                  )
                }
                className="gap-2"
              >
                <Brain className="h-4 w-4" />
                Analyser
              </Button>
              {weatherResult && <PredictionResultView result={weatherResult} />}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {history && history.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Historique des prédictions</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {history.slice(0, 10).map((h) => (
              <div key={h.id} className="flex justify-between text-sm py-2 border-b border-border last:border-0">
                <span>{h.label}</span>
                <span className="text-muted-foreground">{formatRelativeDate(h.created_at)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
