'use client';

import { useState, useCallback, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
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

// ─── Animation variants ────────────────────────────────────────────────────────

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      delay: i * 0.08,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
};

// ─── FloatInput component ──────────────────────────────────────────────────────

interface FloatInputProps {
  id: string;
  label: string;
  icon: React.ElementType;
  type?: string;
  autoComplete?: string;
  error?: string;
  disabled?: boolean;
  rightSlot?: React.ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  registerProps: any;
}

function FloatInput({
  id,
  label,
  icon: Icon,
  type = 'text',
  autoComplete,
  error,
  disabled,
  rightSlot,
  registerProps,
}: FloatInputProps) {
  const [focused, setFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);
  const floated = focused || hasValue;

  const handleFocus = () => setFocused(true);
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocused(false);
    setHasValue(e.currentTarget.value.length > 0);
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasValue(e.currentTarget.value.length > 0);
    registerProps.onChange?.(e);
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Floating label */}
      <label
        htmlFor={id}
        style={{
          position: 'absolute',
          left: '2.75rem',
          top: floated ? '0.45rem' : '50%',
          transform: floated ? 'translateY(0) scale(0.8)' : 'translateY(-50%) scale(1)',
          transformOrigin: 'left center',
          color: error
            ? '#f87171'
            : floated
            ? '#C4923A'
            : '#5E7A68',
          fontSize: '0.9375rem',
          fontWeight: 500,
          pointerEvents: 'none',
          transition: 'top 0.18s ease, transform 0.18s ease, color 0.18s ease',
          lineHeight: 1,
          zIndex: 1,
        }}
      >
        {label}
      </label>

      {/* Left icon */}
      <Icon
        style={{
          position: 'absolute',
          left: '0.875rem',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '1rem',
          height: '1rem',
          color: error ? 'rgba(248,113,113,0.65)' : focused ? '#C4923A' : 'rgba(196,146,58,0.45)',
          pointerEvents: 'none',
          transition: 'color 0.18s ease',
          flexShrink: 0,
        }}
        strokeWidth={1.5}
      />

      {/* Input */}
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        onFocus={handleFocus}
        onBlur={(e) => {
          handleBlur(e);
          registerProps.onBlur?.(e);
        }}
        onChange={handleChange}
        ref={registerProps.ref}
        name={registerProps.name}
        style={{
          display: 'block',
          width: '100%',
          height: '3.5rem',
          paddingTop: floated ? '1.125rem' : '0',
          paddingLeft: '2.75rem',
          paddingRight: rightSlot ? '3rem' : '1rem',
          paddingBottom: '0',
          background: 'rgba(255,255,255,0.04)',
          border: 'none',
          borderBottom: `1px solid ${
            error
              ? 'rgba(248,113,113,0.55)'
              : focused
              ? '#C4923A'
              : 'rgba(196,146,58,0.25)'
          }`,
          borderRadius: '0.5rem 0.5rem 0 0',
          color: '#E4DBC8',
          fontSize: '0.9375rem',
          outline: 'none',
          boxShadow: focused
            ? error
              ? 'none'
              : 'inset 0 -1px 0 0 rgba(196,146,58,0.12)'
            : 'none',
          transition:
            'border-color 0.18s ease, box-shadow 0.18s ease, padding-top 0.18s ease',
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? 'not-allowed' : 'text',
        }}
      />

      {/* Right slot (password toggle etc.) */}
      {rightSlot && (
        <div
          style={{
            position: 'absolute',
            right: '0.875rem',
            top: '50%',
            transform: 'translateY(-50%)',
          }}
        >
          {rightSlot}
        </div>
      )}
    </div>
  );
}

// ─── LoginPage ─────────────────────────────────────────────────────────────────

function LoginForm() {
  const searchParams = useSearchParams();
  const { loginAsync, isLoginLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(() => {
    const err = searchParams.get('error');
    return err ? decodeURIComponent(err) : null;
  });

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
      await loginAsync(data as unknown as LoginCredentials);
    } catch (e) {
      const err = e as { message?: string };
      setApiError(err?.message ?? 'Email ou mot de passe incorrect.');
    }
  };

  const togglePassword = useCallback(() => setShowPassword((v) => !v), []);

  const handleGoogleLogin = () => {
    const prefix = process.env.NEXT_PUBLIC_API_PREFIX || '/api/v1';
    window.location.href = `${prefix}/auth/oauth/google`;
  };

  const handleMicrosoftLogin = () => {
    const prefix = process.env.NEXT_PUBLIC_API_PREFIX || '/api/v1';
    window.location.href = `${prefix}/auth/oauth/microsoft`;
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      style={{ width: '100%' }}
    >
      {/* ── Heading ── */}
      <motion.div
        custom={0}
        variants={itemVariants}
        style={{ textAlign: 'center', marginBottom: '1.75rem' }}
      >
        <h1
          style={{
            fontFamily: '"Playfair Display", Georgia, serif',
            fontWeight: 700,
            fontStyle: 'italic',
            fontSize: '1.5rem',
            color: '#E4DBC8',
            marginBottom: '0.375rem',
            lineHeight: 1.2,
          }}
        >
          Bon retour
        </h1>
        <p
          style={{
            fontSize: '0.875rem',
            color: '#5E7A68',
            lineHeight: 1.5,
          }}
        >
          Connectez-vous à votre espace AgriIntel360
        </p>
      </motion.div>

      {/* ── Global API error ── */}
      <AnimatePresence mode="wait">
        {apiError && (
          <motion.div
            key="api-error"
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.22 }}
            style={{ marginBottom: '1.25rem', overflow: 'hidden' }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.625rem',
                borderRadius: '0.625rem',
                padding: '0.75rem',
                background: 'rgba(248,113,113,0.08)',
                border: '1px solid rgba(248,113,113,0.25)',
              }}
            >
              <AlertCircle
                style={{
                  width: '1rem',
                  height: '1rem',
                  color: '#f87171',
                  flexShrink: 0,
                  marginTop: '0.125rem',
                }}
              />
              <p
                style={{
                  fontSize: '0.875rem',
                  color: '#fca5a5',
                  flex: 1,
                  lineHeight: 1.45,
                }}
              >
                {apiError}
              </p>
              <button
                type="button"
                onClick={() => setApiError(null)}
                aria-label="Fermer"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(248,113,113,0.55)',
                  cursor: 'pointer',
                  padding: '0.125rem',
                  lineHeight: 1,
                  fontSize: '0.75rem',
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = '#f87171';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color =
                    'rgba(248,113,113,0.55)';
                }}
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Form ── */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Email field */}
        <motion.div
          custom={1}
          variants={itemVariants}
          style={{ marginBottom: '1.25rem' }}
        >
          <FloatInput
            id="identifier"
            label="Email ou identifiant"
            icon={Mail}
            type="email"
            autoComplete="email"
            error={errors.identifier?.message}
            disabled={isLoginLoading}
            registerProps={register('identifier')}
          />
          <AnimatePresence>
            {errors.identifier && (
              <motion.p
                id="identifier-error"
                role="alert"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
                style={{
                  marginTop: '0.375rem',
                  fontSize: '0.75rem',
                  color: '#f87171',
                  paddingLeft: '0.25rem',
                }}
              >
                {errors.identifier.message}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Password field */}
        <motion.div
          custom={2}
          variants={itemVariants}
          style={{ marginBottom: '0.625rem' }}
        >
          <FloatInput
            id="password"
            label="Mot de passe"
            icon={Lock}
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            error={errors.password?.message}
            disabled={isLoginLoading}
            registerProps={register('password')}
            rightSlot={
              <button
                type="button"
                onClick={togglePassword}
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '0.25rem',
                  cursor: 'pointer',
                  color: 'rgba(196,146,58,0.45)',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = '#C4923A';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color =
                    'rgba(196,146,58,0.45)';
                }}
              >
                {showPassword ? (
                  <EyeOff style={{ width: '1rem', height: '1rem' }} />
                ) : (
                  <Eye style={{ width: '1rem', height: '1rem' }} />
                )}
              </button>
            }
          />
          <AnimatePresence>
            {errors.password && (
              <motion.p
                id="password-error"
                role="alert"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
                style={{
                  marginTop: '0.375rem',
                  fontSize: '0.75rem',
                  color: '#f87171',
                  paddingLeft: '0.25rem',
                }}
              >
                {errors.password.message}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Forgot password link */}
        <motion.div
          custom={3}
          variants={itemVariants}
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: '1.75rem',
          }}
        >
          <Link
            href="/forgot-password"
            style={{
              fontSize: '0.8125rem',
              fontWeight: 500,
              color: '#C4923A',
              textDecoration: 'none',
              transition: 'color 0.15s ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color = '#DDA85A';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color = '#C4923A';
            }}
          >
            Mot de passe oublié ?
          </Link>
        </motion.div>

        {/* Submit button */}
        <motion.div custom={4} variants={itemVariants}>
          <button
            type="submit"
            disabled={isLoginLoading}
            style={{
              position: 'relative',
              width: '100%',
              height: '3rem',
              borderRadius: '0.625rem',
              border: 'none',
              background: isLoginLoading
                ? 'linear-gradient(135deg, rgba(196,146,58,0.5) 0%, rgba(176,121,40,0.5) 100%)'
                : 'linear-gradient(135deg, #C4923A 0%, #b07928 100%)',
              color: '#07100A',
              fontSize: '0.9375rem',
              fontWeight: 700,
              cursor: isLoginLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: isLoginLoading
                ? 'none'
                : '0 4px 20px rgba(196,146,58,0.28)',
              opacity: isLoginLoading ? 0.6 : 1,
              transition:
                'opacity 0.2s ease, transform 0.15s ease, box-shadow 0.15s ease',
              overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
              if (!isLoginLoading) {
                const btn = e.currentTarget as HTMLButtonElement;
                btn.style.filter = 'brightness(1.1)';
                btn.style.transform = 'translateY(-1px)';
                btn.style.boxShadow = '0 6px 24px rgba(196,146,58,0.36)';
              }
            }}
            onMouseLeave={(e) => {
              const btn = e.currentTarget as HTMLButtonElement;
              btn.style.filter = 'none';
              btn.style.transform = 'translateY(0)';
              btn.style.boxShadow = isLoginLoading
                ? 'none'
                : '0 4px 20px rgba(196,146,58,0.28)';
            }}
            onMouseDown={(e) => {
              if (!isLoginLoading) {
                (e.currentTarget as HTMLButtonElement).style.transform =
                  'translateY(0)';
              }
            }}
          >
            {isLoginLoading ? (
              <>
                <Loader2
                  style={{ width: '1rem', height: '1rem', animation: 'spin 1s linear infinite' }}
                />
                <span>Connexion en cours…</span>
              </>
            ) : (
              <>
                <span>Se connecter</span>
                <ArrowRight style={{ width: '1rem', height: '1rem' }} />
              </>
            )}
          </button>
        </motion.div>
      </form>

      {/* ── Divider ── */}
      {process.env.NEXT_PUBLIC_OAUTH_ENABLED === 'true' && (
        <>
      <motion.div
        custom={5}
        variants={itemVariants}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          margin: '1.5rem 0',
        }}
      >
        <div
          style={{
            flex: 1,
            height: '1px',
            background: 'rgba(196,146,58,0.18)',
          }}
        />
        <span
          style={{
            fontSize: '0.8125rem',
            color: '#5E7A68',
            fontWeight: 500,
            letterSpacing: '0.04em',
            userSelect: 'none',
          }}
        >
          ou
        </span>
        <div
          style={{
            flex: 1,
            height: '1px',
            background: 'rgba(196,146,58,0.18)',
          }}
        />
      </motion.div>

      
      <motion.div
        custom={6}
        variants={itemVariants}
        style={{
          display: 'flex',
          gap: '0.75rem',
          marginBottom: '1.5rem',
        }}
      >
        <button
          type="button"
          onClick={handleGoogleLogin}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            height: '3rem',
            borderRadius: '0.625rem',
            border: '1px solid rgba(196, 146, 58, 0.18)',
            background: 'rgba(255, 255, 255, 0.03)',
            color: 'rgba(228, 219, 200, 0.75)',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'border-color 0.15s ease, background 0.15s ease',
          }}
          onMouseEnter={(e) => {
            const btn = e.currentTarget as HTMLButtonElement;
            btn.style.borderColor = 'rgba(196,146,58,0.45)';
            btn.style.background = 'rgba(255,255,255,0.06)';
          }}
          onMouseLeave={(e) => {
            const btn = e.currentTarget as HTMLButtonElement;
            btn.style.borderColor = 'rgba(196,146,58,0.18)';
            btn.style.background = 'rgba(255,255,255,0.03)';
          }}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" style={{ flexShrink: 0 }}>
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span>Google</span>
        </button>

        <button
          type="button"
          onClick={handleMicrosoftLogin}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            height: '3rem',
            borderRadius: '0.625rem',
            border: '1px solid rgba(196, 146, 58, 0.18)',
            background: 'rgba(255, 255, 255, 0.03)',
            color: 'rgba(228, 219, 200, 0.75)',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'border-color 0.15s ease, background 0.15s ease',
          }}
          onMouseEnter={(e) => {
            const btn = e.currentTarget as HTMLButtonElement;
            btn.style.borderColor = 'rgba(196,146,58,0.45)';
            btn.style.background = 'rgba(255,255,255,0.06)';
          }}
          onMouseLeave={(e) => {
            const btn = e.currentTarget as HTMLButtonElement;
            btn.style.borderColor = 'rgba(196,146,58,0.18)';
            btn.style.background = 'rgba(255,255,255,0.03)';
          }}
        >
          <svg viewBox="0 0 23 23" width="16" height="16" style={{ flexShrink: 0 }}>
            <path fill="#F25022" d="M1 1h10v10H1z"/>
            <path fill="#7FBA00" d="M12 1h10v10H12z"/>
            <path fill="#00A4EF" d="M1 12h10v10H1z"/>
            <path fill="#FFB900" d="M12 12h10v10H12z"/>
          </svg>
          <span>Microsoft</span>
        </button>
      </motion.div>
      </>
      )}

      {/* ── Register link ── */}
      <motion.div
        custom={7}
        variants={itemVariants}
        style={{ textAlign: 'center' }}
      >
        <p
          style={{
            fontSize: '0.875rem',
            color: '#5E7A68',
          }}
        >
          Pas encore de compte ?{' '}
          <Link
            href="/register"
            style={{
              color: '#C4923A',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'color 0.15s ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color = '#DDA85A';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color = '#C4923A';
            }}
          >
            S&apos;inscrire
          </Link>
        </p>
      </motion.div>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
