'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from '@/lib/motion';
import { apiClient } from '@/lib/api-client';

// ─── Ease curve matching design system ────────────────────────────────────────
const EASE = [0.25, 0.46, 0.45, 0.94] as const;

type Status = 'loading' | 'success' | 'error';

// ─── Animated SVG spinner (native, no framer-motion dep for the rotation) ────
function GoldSpinner() {
  return (
    <svg
      width="44"
      height="44"
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ animation: 'spin 0.9s linear infinite' }}
      aria-hidden
    >
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      {/* Track */}
      <circle
        cx="22"
        cy="22"
        r="18"
        stroke="rgba(196,146,58,0.15)"
        strokeWidth="3"
      />
      {/* Arc */}
      <circle
        cx="22"
        cy="22"
        r="18"
        stroke="#C4923A"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="60 53"
        strokeDashoffset="0"
      />
    </svg>
  );
}

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

  return (
    <AnimatePresence mode="wait">
      {status === 'loading' && (
        <motion.div
          key="loading"
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.55, ease: EASE }}
          className="text-center py-4"
        >
          {/* Spinner container */}
          <div
            className="mx-auto mb-5 flex h-[72px] w-[72px] items-center justify-center rounded-2xl"
            style={{
              background: 'rgba(196,146,58,0.08)',
              border: '1px solid rgba(196,146,58,0.22)',
            }}
          >
            <GoldSpinner />
          </div>

          <h2
            className="font-display text-[1.35rem] font-bold italic mb-2"
            style={{ color: '#E4DBC8' }}
          >
            Vérification en cours...
          </h2>
          <p className="text-sm" style={{ color: '#5E7A68' }}>
            Validation de votre adresse email
          </p>
        </motion.div>
      )}

      {status === 'success' && (
        <motion.div
          key="success"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.55, ease: EASE }}
          className="text-center"
        >
          {/* Check icon with bounce */}
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: [0.7, 1.08, 0.96, 1], opacity: 1 }}
            transition={{
              duration: 0.65,
              delay: 0.08,
              times: [0, 0.55, 0.8, 1],
              ease: 'easeOut',
            }}
            className="mx-auto mb-5 flex h-[72px] w-[72px] items-center justify-center rounded-2xl"
            style={{
              background: 'rgba(30,107,62,0.18)',
              border: '1px solid rgba(30,107,62,0.35)',
              boxShadow: '0 0 28px rgba(74,222,128,0.10)',
            }}
          >
            <CheckCircle2
              style={{
                color: '#4ADE80',
                width: '32px',
                height: '32px',
                filter: 'drop-shadow(0 0 8px rgba(74,222,128,0.40))',
              }}
              strokeWidth={1.7}
            />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.18, ease: EASE }}
            className="font-display text-[1.4rem] font-bold italic mb-2"
            style={{ color: '#4ADE80' }}
          >
            Email vérifié !
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.26, ease: EASE }}
            className="text-sm leading-[1.65] mb-7"
            style={{ color: '#5E7A68' }}
          >
            Votre compte est maintenant actif. Bienvenue sur AgriIntel360 !
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.34, ease: EASE }}
          >
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl font-bold text-[15px] transition-all duration-200 hover:-translate-y-[1px] active:translate-y-0"
              style={{
                background: 'linear-gradient(135deg, #C4923A 0%, #b07928 100%)',
                color: '#07100A',
                boxShadow: '0 4px 20px rgba(196,146,58,0.28)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.filter = 'brightness(1.1)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 24px rgba(196,146,58,0.36)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.filter = 'brightness(1)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(196,146,58,0.28)';
              }}
            >
              <span>Accéder à mon espace</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </motion.div>
        </motion.div>
      )}

      {status === 'error' && (
        <motion.div
          key="error"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.55, ease: EASE }}
          className="text-center"
        >
          {/* Error icon */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.08, ease: EASE }}
            className="mx-auto mb-5 flex h-[72px] w-[72px] items-center justify-center rounded-2xl"
            style={{
              background: 'rgba(248,113,113,0.10)',
              border: '1px solid rgba(248,113,113,0.25)',
            }}
          >
            <XCircle
              style={{
                color: '#f87171',
                width: '32px',
                height: '32px',
              }}
              strokeWidth={1.7}
            />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.16, ease: EASE }}
            className="font-display text-[1.4rem] font-bold italic mb-2"
            style={{ color: '#E4DBC8' }}
          >
            Lien invalide
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.24, ease: EASE }}
            className="text-sm leading-[1.65] mb-7"
            style={{ color: '#5E7A68' }}
          >
            Ce lien a expiré ou est invalide.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.32, ease: EASE }}
            className="flex flex-col gap-2.5"
          >
            {/* Primary — create account */}
            <Link
              href="/register"
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl font-bold text-[15px] transition-all duration-200 hover:-translate-y-[1px] active:translate-y-0"
              style={{
                background: 'linear-gradient(135deg, #C4923A 0%, #b07928 100%)',
                color: '#07100A',
                boxShadow: '0 4px 20px rgba(196,146,58,0.28)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.filter = 'brightness(1.1)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 24px rgba(196,146,58,0.36)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.filter = 'brightness(1)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(196,146,58,0.28)';
              }}
            >
              Créer un compte
            </Link>

            {/* Outline — login */}
            <Link
              href="/login"
              className="flex h-11 w-full items-center justify-center rounded-xl text-sm font-semibold transition-all duration-200 hover:-translate-y-[1px] active:translate-y-0"
              style={{
                border: '1px solid rgba(196,146,58,0.22)',
                background: 'transparent',
                color: '#E4DBC8',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(196,146,58,0.42)';
                (e.currentTarget as HTMLElement).style.background = 'rgba(196,146,58,0.04)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(196,146,58,0.22)';
                (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
            >
              Se connecter
            </Link>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
