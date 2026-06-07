'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, AlertCircle, ArrowRight, Sprout } from 'lucide-react';
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from '@/lib/motion';
import { useAuth } from '@/hooks/use-auth';
import { loginSchema, type LoginFormData } from '@/lib/validators';
import { SocialLoginButton, AuthDivider } from '@/components/auth/auth-ui';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export default function LoginPage() {
  const { loginAsync, isLoginLoading } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'microsoft' | null>(null);

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
      await loginAsync(data as any);
    } catch (e) {
      const error = e as { message?: string };
      setApiError(error?.message ?? 'Email ou mot de passe incorrect.');
    }
  };

  const handleOAuth = useCallback(async (provider: 'google' | 'microsoft') => {
    setOauthLoading(provider);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const prefix = process.env.NEXT_PUBLIC_API_PREFIX || '/api/v1';
      window.location.href = `${backendUrl}${prefix}/auth/oauth/${provider}`;
    } catch {
      setOauthLoading(null);
    }
  }, []);

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="w-full max-w-sm mx-auto"
    >
      {/* Animated decorative blob */}
      <motion.div
        variants={fadeUp}
        className="flex justify-center mb-6"
      >
        <motion.div
          className="relative"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
        >
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <Sprout className="h-8 w-8 text-white" />
          </div>
          <motion.div
            className="absolute -inset-2 rounded-2xl bg-emerald-400/20 blur-xl -z-10"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          />
        </motion.div>
      </motion.div>

      {/* Header */}
      <motion.div variants={fadeUp} className="mb-7 text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-1.5">
          Content de vous revoir
        </h1>
        <p className="text-sm text-slate-500">
          Connectez-vous à votre espace AgriIntel
        </p>
      </motion.div>

      {/* Error Alert */}
      <AnimatePresence mode="wait">
        {apiError && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: -12, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -12, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-5 overflow-hidden"
          >
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0 text-red-500" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-red-800">{apiError}</p>
              </div>
              <button
                type="button"
                onClick={() => setApiError(null)}
                className="flex-shrink-0 text-red-400 hover:text-red-600 transition-colors p-0.5"
                aria-label="Fermer"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form */}
      <motion.form
        variants={fadeUp}
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
        noValidate
      >
        {/* Email/Username */}
        <div>
          <label htmlFor="identifier" className="block text-sm font-medium text-slate-700 mb-1.5">
            Email ou nom d&apos;utilisateur
          </label>
          <div className="relative group">
            <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors duration-200" strokeWidth={1.5} />
            <input
              id="identifier"
              type="text"
              placeholder="exemple@email.com"
              autoComplete="username"
              data-testid="identifier-input"
              {...register('identifier')}
              className={cn(
                'w-full h-11 pl-10 pr-4 text-sm rounded-xl border bg-white',
                'placeholder:text-slate-400',
                'transition-all duration-200',
                'focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20',
                errors.identifier
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-slate-200 hover:border-slate-300'
              )}
            />
          </div>
          {errors.identifier && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-1 text-xs text-red-600 flex items-center gap-1"
            >
              <span>⚠</span> {errors.identifier.message}
            </motion.p>
          )}
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
              Mot de passe
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              Mot de passe oublié&nbsp;?
            </Link>
          </div>
          <div className="relative group">
            <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors duration-200" strokeWidth={1.5} />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Entrez votre mot de passe"
              autoComplete="current-password"
              data-testid="password-input"
              {...register('password')}
              className={cn(
                'w-full h-11 pl-10 pr-11 text-sm rounded-xl border bg-white',
                'placeholder:text-slate-400',
                'transition-all duration-200',
                'focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20',
                errors.password
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-slate-200 hover:border-slate-300'
              )}
            />
            <button
              type="button"
              data-testid="toggle-password"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-0.5"
              aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-1 text-xs text-red-600 flex items-center gap-1"
            >
              <span>⚠</span> {errors.password.message}
            </motion.p>
          )}
        </div>

        {/* Remember Me */}
        <div className="flex items-center justify-between">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500/30 accent-emerald-600"
              {...register('remember_me')}
            />
            <span className="text-sm text-slate-600">Se souvenir de moi</span>
          </label>
        </div>

        {/* Submit */}
        <motion.div whileTap={{ scale: 0.98 }}>
          <button
            type="submit"
            disabled={isLoginLoading}
            className={cn(
              'w-full h-11 rounded-xl font-semibold text-sm tracking-wide',
              'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white',
              'transition-all duration-200',
              'hover:from-emerald-700 hover:to-emerald-600 hover:shadow-lg hover:shadow-emerald-500/25',
              'active:scale-[0.98]',
              'disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-none',
              'flex items-center justify-center gap-2'
            )}
          >
            {isLoginLoading ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Connexion en cours...
              </>
            ) : (
              <>
                Se connecter
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </motion.div>
      </motion.form>

      {/* Social Login */}
      <motion.div variants={fadeUp}>
        <AuthDivider />
        <div className="flex flex-col gap-2.5">
          <SocialLoginButton
            provider="google"
            onClick={() => handleOAuth('google')}
            loading={oauthLoading === 'google'}
          />
          <SocialLoginButton
            provider="microsoft"
            onClick={() => handleOAuth('microsoft')}
            loading={oauthLoading === 'microsoft'}
          />
        </div>
      </motion.div>

      {/* Register link */}
      <motion.div variants={fadeUp} className="mt-6 text-center">
        <p className="text-sm text-slate-500">
          Pas encore de compte&nbsp;?{' '}
          <Link
            href="/register"
            className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            Créer un compte
          </Link>
        </p>
      </motion.div>

      {/* Footer */}
      <motion.p
        variants={fadeUp}
        className="mt-8 text-center text-xs text-slate-400"
      >
        En continuant, vous acceptez nos{' '}
        <Link href="/terms" className="underline hover:text-slate-600 transition-colors">
          conditions d&apos;utilisation
        </Link>
        {' '}et notre{' '}
        <Link href="/privacy" className="underline hover:text-slate-600 transition-colors">
          politique de confidentialité
        </Link>
      </motion.p>
    </motion.div>
  );
}

function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
