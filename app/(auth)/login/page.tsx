'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { motion } from '@/lib/motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    mode: 'onBlur',
  });

  const onSubmit = async (data: LoginFormData) => {
    setApiError(null);
    try {
      await loginAsync(data);
    } catch (e) {
      const error = e as { message?: string };
      setApiError(error?.message ?? 'Erreur de connexion. Veuillez vérifier vos identifiants.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-sm"
    >
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Bienvenue
        </h1>
        <p className="text-slate-600">
          Connectez-vous à votre compte AgriIntel
        </p>
      </div>

      {/* Error Alert */}
      {apiError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4"
          data-testid="error-message"
        >
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0 text-red-600" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-900">{apiError}</p>
          </div>
        </motion.div>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5"
        noValidate
      >
        {/* Email/Username Field */}
        <div>
          <label htmlFor="identifier" className="block text-sm font-medium text-slate-700 mb-2">
            Email ou nom d&apos;utilisateur
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" strokeWidth={1.5} />
            <Input
              id="identifier"
              type="text"
              placeholder="votreemail@exemple.com"
              autoComplete="username"
              className="pl-10 h-11"
              data-testid="identifier-input"
              {...register('identifier')}
            />
          </div>
          {errors.identifier && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <span className="inline-block w-1 h-1 bg-red-600 rounded-full" />
              {errors.identifier.message}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
              Mot de passe
            </label>
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              Oublié&nbsp;?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" strokeWidth={1.5} />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="current-password"
              className="pl-10 pr-12 h-11"
              data-testid="password-input"
              {...register('password')}
            />
            <button
              type="button"
              data-testid="toggle-password"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
              aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <span className="inline-block w-1 h-1 bg-red-600 rounded-full" />
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Remember Me */}
        <div className="flex items-center">
          <input
            id="remember_me"
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
            {...register('remember_me')}
          />
          <label htmlFor="remember_me" className="ml-2 text-sm text-slate-600 cursor-pointer">
            Se souvenir de moi
          </label>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoginLoading}
          className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
          data-testid="login-submit"
        >
          {isLoginLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="inline-block"
            >
              ⏳
            </motion.div>
          ) : (
            'Se connecter'
          )}
        </Button>
      </form>

      {/* Divider */}
      <div className="my-6 flex items-center gap-4">
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-sm text-slate-500">ou</span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      {/* Sign Up Link */}
      <div className="text-center">
        <p className="text-slate-600">
          Pas encore de compte ?{' '}
          <Link
            href="/register"
            className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            S&apos;inscrire
          </Link>
        </p>
      </div>

      {/* Footer Note */}
      <p className="mt-8 text-center text-xs text-slate-500">
        En vous connectant, vous acceptez nos{' '}
        <Link href="/terms" className="underline hover:text-slate-700">
          conditions d&apos;utilisation
        </Link>
        {' '}et notre{' '}
        <Link href="/privacy" className="underline hover:text-slate-700">
          politique de confidentialité
        </Link>
      </p>
    </motion.div>
  );
}
