'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';
import { persistAuthSession } from '@/lib/auth-session';
import { useAuthStore } from '@/stores/auth-store';
import { mapBackendUser } from '@/lib/user-mapper';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const data = searchParams.get('data');
    if (data) {
      try {
        let decoded;
        try {
          decoded = JSON.parse(atob(data));
        } catch {
          decoded = JSON.parse(atob(decodeURIComponent(data)));
        }
        if (decoded.access_token) {
          persistAuthSession(
            decoded.access_token,
            decoded.refresh_token,
            3600
          );

          if (decoded.user) {
            useAuthStore.getState().setUser(mapBackendUser(decoded.user as Record<string, unknown>));
          }

          router.replace('/dashboard');
        } else {
          setError('Token non trouvé dans la réponse.');
        }
      } catch (e) {
        console.error('Failed to decode OAuth data', e);
        setError('Erreur lors du traitement de la connexion.');
      }
    } else {
      const errorMsg = searchParams.get('error');
      if (errorMsg) {
        setError(decodeURIComponent(errorMsg));
      } else {
        setError('Aucune donnée de connexion reçue.');
      }
    }
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-[#f9fafb]">
        <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-red-100 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mb-6">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Échec de connexion</h1>
          <p className="text-gray-600 mb-8">{error}</p>
          <button
            onClick={() => router.replace('/login')}
            className="w-full h-12 bg-[#059669] text-white font-semibold rounded-xl hover:bg-[#047857] transition-all"
          >
            Retour à la connexion
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-[#f9fafb]">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-[#059669] mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Finalisation de la connexion</h1>
        <p className="text-gray-600">Veuillez patienter pendant que nous préparons votre espace...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-[#f9fafb]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-[#059669] mx-auto mb-6" />
            <p className="text-gray-600">Chargement...</p>
          </div>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
