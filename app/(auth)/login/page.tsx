'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from '@/lib/motion';
import { useAuth } from '@/hooks/use-auth';
import { loginSchema, type LoginFormData } from '@/lib/validators';
import type { LoginCredentials } from '@/types/auth';
import {
  SocialLoginButton,
  AuthDivider,
  AuthFooterLink,
} from '@/components/auth/auth-ui';

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: 0.08 * i, ease: 'easeOut' },
  }),
};

export default function LoginPage() {
  const { loginAsync, isLoginLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'microsoft' | null>(null);
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

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
      await loginAsync(data as LoginCredentials);
    } catch (e) {
      const error = e as { message?: string };
      setApiError(error?.message ?? 'Email ou mot de passe incorrect.');
    }
  };

  const handleOAuth = useCallback(
    async (provider: 'google' | 'microsoft') => {
      setOauthLoading(provider);
      try {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const prefix = process.env.NEXT_PUBLIC_API_PREFIX || '/api/v1';
        window.location.href = `${backendUrl}${prefix}/auth/oauth/${provider}`;
      } catch {
        setOauthLoading(null);
      }
    },
    []
  );

  const createRipple = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now() + Math.random();
    setRipples((prev) => [...prev, { x, y, id }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 600);
  }, []);

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="w-full"
    >
      {/* Title */}
      <motion.div custom={0} variants={itemVariants} className="text-center mb-8">
        <h1 className="text-[22px] font-bold text-[#111827] mb-1.5">
          Content de vous revoir
        </h1>
        <p className="text-sm text-[#6b7280]">
          Connectez-vous à votre espace AgriIntel
        </p>
      </motion.div>

      {/* API Error */}
      <AnimatePresence mode="wait">
        {apiError && (
          <motion.div
            key="api-error"
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.25 }}
            className="mb-5 overflow-hidden"
          >
            <div className="flex items-start gap-2.5 rounded-[10px] border border-red-200 bg-red-50 p-3">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-red-500" />
              <p className="text-sm text-red-700 flex-1">{apiError}</p>
              <button
                type="button"
                onClick={() => setApiError(null)}
                className="text-red-400 hover:text-red-600 transition-colors leading-none p-0.5"
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
        custom={1}
        variants={itemVariants}
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <div className="space-y-4">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-[#111827] mb-1.5"
            >
              Email
            </label>
            <div className="group relative transition-transform duration-200 focus-within:scale-[1.01]">
              <Mail
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af] transition-colors duration-200 group-focus-within:text-[#059669]"
                strokeWidth={1.5}
              />
              <input
                id="email"
                type="email"
                placeholder="exemple@email.com"
                autoComplete="email"
                data-testid="email-input"
                aria-invalid={!!errors.identifier}
                aria-describedby={errors.identifier ? 'email-error' : undefined}
                {...register('identifier')}
                style={{ borderWidth: '1.5px' }}
                className={cn(
                  'w-full h-[48px] pl-10 pr-4 text-[15px] text-[#111827] rounded-[10px] bg-white',
                  'border-[#e5e7eb]',
                  'placeholder:text-[#9ca3af]',
                  'transition-all duration-200 outline-none',
                  'focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/15',
                  errors.identifier && '!border-[#dc2626] !focus:border-[#dc2626] !focus:ring-[#dc2626]/15'
                )}
              />
            </div>
            {errors.identifier && (
              <motion.p
                id="email-error"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                role="alert"
                className="mt-1 text-xs text-[#dc2626]"
              >
                {errors.identifier.message}
              </motion.p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-[#111827]"
              >
                Mot de passe
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-[#059669] hover:text-[#047857] transition-colors"
              >
                Mot de passe oublié ?
              </Link>
            </div>
            <div className="group relative transition-transform duration-200 focus-within:scale-[1.01]">
              <Lock
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af] transition-colors duration-200 group-focus-within:text-[#059669]"
                strokeWidth={1.5}
              />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Entrez votre mot de passe"
                autoComplete="current-password"
                data-testid="password-input"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'password-error' : undefined}
                {...register('password')}
                style={{ borderWidth: '1.5px' }}
                className={cn(
                  'w-full h-[48px] pl-10 pr-11 text-[15px] text-[#111827] rounded-[10px] bg-white',
                  'border-[#e5e7eb]',
                  'placeholder:text-[#9ca3af]',
                  'transition-all duration-200 outline-none',
                  'focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/15',
                  errors.password && '!border-[#dc2626] !focus:border-[#dc2626] !focus:ring-[#dc2626]/15'
                )}
              />
              <button
                type="button"
                data-testid="toggle-password"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#6b7280] transition-colors p-0.5"
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <motion.p
                id="password-error"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                role="alert"
                className="mt-1 text-xs text-[#dc2626]"
              >
                {errors.password.message}
              </motion.p>
            )}
          </div>

          {/* Remember me */}
          <div className="flex items-center">
            <label className="flex cursor-pointer items-center gap-2.5 select-none">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-[#d1d5db] text-[#059669] focus:ring-[#059669]/30 accent-[#059669]"
                {...register('remember_me')}
              />
              <span className="text-sm text-[#6b7280]">Se souvenir de moi</span>
            </label>
          </div>

          {/* Submit */}
          <div className="pt-1">
            <button
              type="submit"
              disabled={isLoginLoading}
              onClick={createRipple}
              className={cn(
                'relative w-full h-[48px] rounded-[10px] overflow-hidden',
                'bg-[#059669] text-white font-semibold text-[15px]',
                'transition-all duration-200',
                'hover:bg-[#047857] hover:-translate-y-[1px] hover:shadow-lg hover:shadow-[#059669]/25',
                'active:translate-y-0 active:shadow-md',
                'disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none',
                'flex items-center justify-center gap-2.5'
              )}
            >
              {/* Ripple container */}
              {ripples.map((r) => (
                <span
                  key={r.id}
                  className="absolute rounded-full bg-white/40 pointer-events-none animate-ripple"
                  style={{
                    left: r.x - 3,
                    top: r.y - 3,
                    width: 6,
                    height: 6,
                  }}
                />
              ))}

              {isLoginLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Connexion en cours...</span>
                </>
              ) : (
                <>
                  <span>Se connecter</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </motion.form>

      {/* Divider + SSO */}
      <motion.div custom={2} variants={itemVariants}>
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
      <motion.div custom={3} variants={itemVariants}>
        <AuthFooterLink
          text="Pas encore de compte ?"
          linkText="Créer un compte"
          href="/register"
        />
      </motion.div>

      {/* Footer */}
      <motion.p
        custom={4}
        variants={itemVariants}
        className="mt-7 text-center text-[11px] text-[#9ca3af]"
      >
        En continuant, vous acceptez nos{' '}
        <Link
          href="/terms"
          className="underline hover:text-[#6b7280] transition-colors"
        >
          conditions d&apos;utilisation
        </Link>{' '}
        et notre{' '}
        <Link
          href="/privacy"
          className="underline hover:text-[#6b7280] transition-colors"
        >
          politique de confidentialité
        </Link>
      </motion.p>
    </motion.div>
  );
}

function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
