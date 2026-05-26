'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';

type Status = 'loading' | 'success' | 'error';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<Status>(token ? 'loading' : 'error');

  useEffect(() => {
    if (!token) return;
    apiClient
      .post('/auth/verify-email', { token })
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  if (status === 'loading') {
    return (
      <div className="text-center py-8">
        <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Vérification en cours...</p>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="text-center">
        <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Email vérifié !</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Votre compte est maintenant actif. Bienvenue sur AgriIntel360 !
        </p>
        <Button className="w-full" onClick={() => router.push('/')}>
          Accéder au Dashboard 🚀
        </Button>
      </div>
    );
  }

  return (
    <div className="text-center">
      <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
      <h2 className="text-xl font-bold mb-2">Lien invalide</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Ce lien de vérification est invalide ou a expiré.
      </p>
      <Button variant="outline" className="w-full mb-3" asChild>
        <Link href="/register">Créer un nouveau compte</Link>
      </Button>
      <Link href="/login" className="text-sm text-primary hover:underline">
        Retour à la connexion
      </Link>
    </div>
  );
}
