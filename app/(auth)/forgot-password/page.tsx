'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { ArrowLeft, Mail, SendHorizonal, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from '@/lib/motion';
import { useAuth } from '@/hooks/use-auth';
import { forgotPasswordSchema, type ForgotPasswordData } from '@/lib/validators';

// ─── Floating-label input styles matching design system ───────────────────────
const inputWrapStyle: React.CSSProperties = {
  position: 'relative',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  height: '52px',
  background: 'rgba(255,255,255,0.04)',
  border: 'none',
  borderBottom: '1px solid rgba(196,146,58,0.25)',
  borderRadius: '6px 6px 0 0',
  color: '#E4DBC8',
  fontSize: '15px',
  paddingLeft: '40px',
  paddingRight: '1rem',
  paddingTop: '18px',
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
};

const inputErrorStyle: React.CSSProperties = {
  ...inputStyle,
  borderBottom: '1px solid rgba(248,113,113,0.60)',
};

const labelStyle: React.CSSProperties = {
  position: 'absolute',
  left: '40px',
  top: '50%',
  transform: 'translateY(-50%)',
  fontSize: '14px',
  color: '#5E7A68',
  pointerEvents: 'none',
  transition: 'transform 0.18s ease, font-size 0.18s ease, color 0.18s ease',
  transformOrigin: 'left center',
};

const labelFloatedStyle: React.CSSProperties = {
  ...labelStyle,
  transform: 'translateY(-1.6rem) translateX(-0.1rem) scale(0.8)',
  color: '#C4923A',
  fontSize: '14px',
};

// ─── Ease curve matching design system ────────────────────────────────────────
const EASE = [0.25, 0.46, 0.45, 0.94] as const;

export default function ForgotPasswordPage() {
  const { forgotPassword, isForgotLoading } = useAuth();
  const [sent, setSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [emailFocused, setEmailFocused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    watch,
  } = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const emailReg = register('email');
  const emailValue = watch('email', '');

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startCountdown = () => {
    setCountdown(60);
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const onSubmit = (data: ForgotPasswordData) => {
    forgotPassword(data.email);
    setSent(true);
    startCountdown();
  };

  const handleResend = () => {
    if (countdown > 0) return;
    const email = getValues('email');
    forgotPassword(email);
    startCountdown();
  };

  // ─── Sent state ─────────────────────────────────────────────────────────────
  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.55, ease: EASE }}
        className="text-center"
        style={{ paddingBottom: '0.5rem' }}
      >
        {/* Glowing send icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.55, delay: 0.08, ease: EASE }}
          className="mx-auto mb-5 flex h-[72px] w-[72px] items-center justify-center rounded-2xl"
          style={{
            background: 'rgba(196,146,58,0.10)',
            border: '1px solid rgba(196,146,58,0.28)',
            boxShadow: '0 0 28px rgba(196,146,58,0.16), 0 0 60px rgba(196,146,58,0.06)',
          }}
        >
          <SendHorizonal
            style={{
              color: '#C4923A',
              width: '30px',
              height: '30px',
              filter: 'drop-shadow(0 0 8px rgba(196,146,58,0.55))',
            }}
            strokeWidth={1.7}
          />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.14, ease: EASE }}
          className="font-display text-[1.4rem] font-bold italic mb-2"
          style={{ color: '#4ADE80' }}
        >
          Email envoyé !
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.22, ease: EASE }}
        >
          <p className="text-sm leading-[1.65] mb-1" style={{ color: '#5E7A68' }}>
            Lien envoyé à :
          </p>
          <p className="text-sm font-semibold mb-7" style={{ color: '#E4DBC8' }}>
            {getValues('email')}
          </p>
        </motion.div>

        {/* Resend button with countdown */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.30, ease: EASE }}
        >
          <button
            type="button"
            disabled={countdown > 0}
            onClick={handleResend}
            className="mb-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed"
            style={{
              border: '1px solid rgba(196,146,58,0.22)',
              background: countdown > 0 ? 'rgba(196,146,58,0.04)' : 'rgba(196,146,58,0.08)',
              color: countdown > 0 ? '#5E7A68' : '#E4DBC8',
              opacity: countdown > 0 ? 0.7 : 1,
            }}
            onMouseEnter={e => {
              if (countdown === 0) (e.currentTarget as HTMLElement).style.borderColor = 'rgba(196,146,58,0.42)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(196,146,58,0.22)';
            }}
          >
            {countdown > 0 ? (
              <span>
                Renvoyer dans{' '}
                <span style={{ fontFamily: 'monospace', color: '#C4923A', fontWeight: 700 }}>
                  {countdown}s
                </span>
              </span>
            ) : (
              <>
                <SendHorizonal className="h-4 w-4" />
                <span>Renvoyer le lien</span>
              </>
            )}
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.38, ease: EASE }}
        >
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 text-sm font-medium transition-colors"
            style={{ color: '#C4923A' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#DDA85A'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#C4923A'; }}
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à la connexion
          </Link>
        </motion.div>
      </motion.div>
    );
  }

  // ─── Form state ─────────────────────────────────────────────────────────────
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="forgot-form"
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -16, scale: 0.97 }}
        transition={{ duration: 0.55, ease: EASE }}
      >
        {/* Central icon */}
        <div className="flex justify-center mb-5">
          <div
            className="flex h-[60px] w-[60px] items-center justify-center rounded-2xl"
            style={{
              background: 'rgba(196,146,58,0.10)',
              border: '1px solid rgba(196,146,58,0.22)',
            }}
          >
            <Mail
              style={{ color: '#C4923A', width: '26px', height: '26px' }}
              strokeWidth={1.6}
            />
          </div>
        </div>

        <h1
          className="font-display text-[1.4rem] font-bold italic text-center mb-1.5"
          style={{ color: '#E4DBC8' }}
        >
          Mot de passe oublié
        </h1>
        <p className="text-center text-sm leading-[1.65] mb-7" style={{ color: '#5E7A68' }}>
          Entrez votre email pour recevoir un lien de réinitialisation
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          {/* Floating label email field */}
          <div>
            <div style={inputWrapStyle}>
              {/* Icon */}
              <Mail
                className="pointer-events-none absolute"
                strokeWidth={1.5}
                style={{
                  color: errors.email
                    ? 'rgba(248,113,113,0.60)'
                    : emailFocused
                    ? '#C4923A'
                    : 'rgba(196,146,58,0.45)',
                  width: '16px',
                  height: '16px',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  transition: 'color 0.2s',
                  zIndex: 2,
                }}
              />

              {/* Input */}
              <input
                id="email"
                type="email"
                autoComplete="email"
                style={
                  errors.email
                    ? { ...inputErrorStyle }
                    : {
                        ...inputStyle,
                        ...(emailFocused
                          ? {
                              borderBottomColor: '#C4923A',
                              boxShadow: '0 2px 0 0 rgba(196,146,58,0.12)',
                            }
                          : {}),
                      }
                }
                {...emailReg}
                onFocus={() => setEmailFocused(true)}
                onBlur={(e) => { emailReg.onBlur(e); setEmailFocused(false); }}
                aria-invalid={!!errors.email}
              />

              {/* Floating label */}
              <label
                htmlFor="email"
                style={
                  emailFocused || emailValue
                    ? labelFloatedStyle
                    : labelStyle
                }
              >
                Adresse email
              </label>
            </div>

            {errors.email && (
              <p role="alert" className="mt-1.5 text-xs" style={{ color: '#f87171' }}>
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Primary button */}
          <button
            type="submit"
            disabled={isForgotLoading}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl font-bold text-[15px] transition-all duration-200 hover:-translate-y-[1px] active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, #C4923A 0%, #b07928 100%)',
              color: '#07100A',
              boxShadow: '0 4px 20px rgba(196,146,58,0.28)',
            }}
            onMouseEnter={e => {
              if (!isForgotLoading) {
                (e.currentTarget as HTMLElement).style.filter = 'brightness(1.1)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 24px rgba(196,146,58,0.36)';
              }
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.filter = 'brightness(1)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(196,146,58,0.28)';
            }}
          >
            {isForgotLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Envoi en cours...</span>
              </>
            ) : (
              <>
                <span>Envoyer le lien</span>
                <SendHorizonal className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <Link
          href="/login"
          className="mt-6 flex items-center justify-center gap-2 text-sm font-medium transition-colors"
          style={{ color: '#5E7A68' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#C4923A'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#5E7A68'; }}
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la connexion
        </Link>
      </motion.div>
    </AnimatePresence>
  );
}
