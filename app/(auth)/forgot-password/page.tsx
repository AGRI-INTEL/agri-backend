'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { ArrowLeft, Mail } from 'lucide-react';
import { AuthField } from '@/components/auth/auth-field';
import { AuthCardHeader, AuthPrimaryButton } from '@/components/auth/auth-ui';
import { useAuth } from '@/hooks/use-auth';
import { forgotPasswordSchema, type ForgotPasswordData } from '@/lib/validators';

export default function ForgotPasswordPage() {
  const { forgotPassword, isForgotLoading } = useAuth();
  const [sent, setSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = (data: ForgotPasswordData) => {
    forgotPassword(data.email);
    setSent(true);
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  if (sent) {
    return (
      <div className="text-center">
        <p className="mb-4 text-4xl" aria-hidden>
          📧
        </p>
        <h2 className="mb-2 text-xl font-bold text-gray-900">Vérifiez votre email</h2>
        <p className="mb-6 text-sm text-gray-600">
          Lien envoyé à <strong>{getValues('email')}</strong>
        </p>
        <button
          type="button"
          className="mb-4 flex h-11 w-full items-center justify-center rounded-lg border border-gray-300 bg-white text-sm text-gray-800 hover:bg-gray-50 disabled:opacity-50"
          disabled={countdown > 0}
          onClick={() => onSubmit({ email: getValues('email') })}
        >
          {countdown > 0 ? `Renvoyer dans ${countdown}s` : 'Renvoyer le lien'}
        </button>
        <Link href="/login" className="text-sm text-[#2563eb] hover:underline">
          Retour à la connexion
        </Link>
      </div>
    );
  }

  return (
    <div>
      <AuthCardHeader title="Mot de passe oublié" />
      <p className="-mt-4 mb-6 text-center text-sm text-gray-600">
        Entrez votre email pour recevoir un lien de réinitialisation
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <AuthField
          type="email"
          placeholder="Email"
          autoComplete="email"
          leftIcon={<Mail className="h-[18px] w-[18px]" strokeWidth={1.75} />}
          error={errors.email?.message}
          {...register('email')}
        />
        <AuthPrimaryButton loading={isForgotLoading}>
          {isForgotLoading ? 'Envoi…' : 'Envoyer le lien'}
        </AuthPrimaryButton>
      </form>

      <Link
        href="/login"
        className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à la connexion
      </Link>
    </div>
  );
}
