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
  const { login, isLoginLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

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

      <form onSubmit={handleSubmit((data) => login(data))} className="space-y-3.5" noValidate>
        <AuthField
          id="email"
          type="email"
          placeholder="Email"
          autoComplete="email"
          leftIcon={<Mail className="h-[18px] w-[18px]" strokeWidth={1.75} />}
          error={errors.email?.message}
          {...register('email')}
        />

        <div>
          <AuthField
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Mot de passe"
            autoComplete="current-password"
            leftIcon={<Lock className="h-[18px] w-[18px]" strokeWidth={1.75} />}
            error={errors.password?.message}
            rightElement={
              <button
                type="button"
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

        <AuthPrimaryButton loading={isLoginLoading}>
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
