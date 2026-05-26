'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useState } from 'react';
import { AuthField } from '@/components/auth/auth-field';
import {
  AuthCardHeader,
  AuthCheckbox,
  AuthDivider,
  AuthFooterLink,
  AuthGoogleButton,
  AuthPrimaryButton,
  GoogleIcon,
} from '@/components/auth/auth-ui';
import { useAuth } from '@/hooks/use-auth';
import { loginSchema, type LoginFormData } from '@/lib/validators';

export default function LoginPage() {
  const { loginAsync, isLoginLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  return (
    <div>
      <AuthCardHeader title="Connectez-vous" />

      {apiError ? (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 mb-3 text-sm text-red-700" data-testid="error-message">
          {apiError}
        </div>
      ) : null}

      <form
        onSubmit={handleSubmit(async (data) => {
          setApiError(null);
          try {
            await (loginAsync as any)(data);
          } catch (e: any) {
            setApiError(e?.message ?? 'Erreur de connexion au serveur');
          }
        })}
        className="space-y-3.5"
        noValidate
      >
        <AuthField
          id="identifier"
          type="text"
          placeholder="Email ou nom d'utilisateur"
          autoComplete="username"
          leftIcon={<Mail className="h-[18px] w-[18px]" strokeWidth={1.75} />}
          error={errors.identifier?.message || errors.email?.message}
          data-testid="identifier-input"
          {...register('identifier')}
        />

        <div>
          <AuthField
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Mot de passe"
            autoComplete="current-password"
            leftIcon={<Lock className="h-[18px] w-[18px]" strokeWidth={1.75} />}
            error={errors.password?.message}
            data-testid="password-input"
            rightElement={
              <button
                type="button"
                data-testid="toggle-password"
                className="p-1 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showPassword ? (
                  <EyeOff className="h-[18px] w-[18px]" />
                ) : (
                  <Eye className="h-[18px] w-[18px]" />
                )}
              </button>
            }
            {...register('password')}
          />
          <div className="mt-1.5 flex justify-end">
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-[#059669] hover:text-[#047857] hover:underline transition-colors"
            >
              Mot de passe oublié ?
            </Link>
          </div>
        </div>

        <div className="pt-1">
          <AuthCheckbox label="Se souvenir de moi" {...register('remember_me')} />
        </div>

        <AuthPrimaryButton data-testid="login-submit" loading={isLoginLoading}>
          {isLoginLoading ? 'Connexion…' : 'Connexion'}
        </AuthPrimaryButton>
      </form>

      <AuthDivider />

      <AuthGoogleButton>
        <GoogleIcon />
        Continuer avec Google
      </AuthGoogleButton>

      <AuthFooterLink text="Pas encore de compte ?" linkText="S'inscrire" href="/register" />
    </div>
  );
}
