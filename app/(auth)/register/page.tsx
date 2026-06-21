'use client';

import { useState, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { motion, AnimatePresence } from '@/lib/motion';
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  ArrowRight,
  Loader2,
  ChevronLeft,
  Building2,
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CountrySelector } from '@/components/shared/country-selector';
import { useAuth } from '@/hooks/use-auth';
import {
  registerStep1Schema,
  registerStep2Schema,
  registerStep3Schema,
  getPasswordStrength,
  type RegisterStep1Data,
  type RegisterStep2Data,
  type RegisterStep3Data,
} from '@/lib/validators';
import type { RegisterData } from '@/types/auth';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const ROLES = [
  { value: 'producteur', label: 'Producteur agricole' },
  { value: 'eleveur', label: 'Éleveur' },
  { value: 'pecheur', label: 'Pêcheur' },
  { value: 'forestier', label: 'Exploitant forestier' },
  { value: 'chercheur', label: 'Analyste / Chercheur' },
  { value: 'cooperative', label: 'Coopérative / Groupement' },
  { value: 'ong', label: 'ONG / Institution' },
  { value: 'commercant', label: 'Acheteur / Commerçant' },
  { value: 'autre', label: 'Autre' },
];

const SECTORS = [
  { value: 'vegetal', label: 'Végétal' },
  { value: 'animal', label: 'Animal' },
  { value: 'halieutique', label: 'Halieutique' },
  { value: 'forestier', label: 'Forestier' },
  { value: 'minier', label: 'Minier' },
  { value: 'industriel', label: 'Industriel' },
];

const STEPS = [
  { id: 1, label: 'Informations' },
  { id: 2, label: 'Profil' },
  { id: 3, label: 'Conditions' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Design tokens
// ─────────────────────────────────────────────────────────────────────────────

const COLORS = {
  accent: '#C4923A',
  accentHover: '#DDA85A',
  accentGlow: 'rgba(196,146,58,0.14)',
  accentBorder: 'rgba(196,146,58,0.25)',
  accentBorderHover: 'rgba(196,146,58,0.45)',
  accentBg: 'rgba(196,146,58,0.08)',
  text: '#E4DBC8',
  textMuted: '#5E7A68',
  textDim: 'rgba(228,219,200,0.65)',
  error: '#f87171',
  errorBg: 'rgba(248,113,113,0.08)',
  errorBorder: 'rgba(248,113,113,0.30)',
  green: '#1E6B3E',
  surface: '#111D14',
  card: '#162019',
  inputBg: 'rgba(255,255,255,0.04)',
  inputBorder: 'rgba(196,146,58,0.25)',
};

// ─────────────────────────────────────────────────────────────────────────────
// FloatInput — floating label input with icon
// ─────────────────────────────────────────────────────────────────────────────

interface FloatInputProps {
  id: string;
  label: string;
  type?: string;
  autoComplete?: string;
  hasError?: boolean;
  errorMessage?: string;
  icon: React.ReactNode;
  rightSlot?: React.ReactNode;
  registration: ReturnType<ReturnType<typeof useForm>['register']>;
  required?: boolean;
  placeholder?: string;
}

function FloatInput({
  id,
  label,
  type = 'text',
  autoComplete,
  hasError,
  errorMessage,
  icon,
  rightSlot,
  registration,
  required,
  placeholder,
}: FloatInputProps) {
  const [focused, setFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);

  const isLifted = focused || hasValue;

  return (
    <div className="relative">
      {/* Icon */}
      <span
        className="pointer-events-none absolute left-[0.875rem] top-1/2 -translate-y-1/2 z-10 transition-colors duration-200"
        style={{ color: focused ? COLORS.accent : COLORS.textMuted }}
      >
        {icon}
      </span>

      {/* Input */}
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        placeholder={isLifted ? (placeholder ?? '') : ''}
        aria-invalid={!!hasError}
        aria-required={required}
        style={{
          background: COLORS.inputBg,
          color: COLORS.text,
          borderBottom: `1px solid ${hasError ? COLORS.error : focused ? COLORS.accent : COLORS.inputBorder}`,
          borderTop: 'none',
          borderLeft: 'none',
          borderRight: 'none',
          width: '100%',
          height: '52px',
          borderRadius: '8px 8px 0 0',
          fontSize: '15px',
          paddingLeft: '2.625rem',
          paddingRight: rightSlot ? '3rem' : '1rem',
          paddingTop: '1.25rem',
          paddingBottom: '0.25rem',
          outline: 'none',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          boxShadow: focused && !hasError ? `0 2px 0 0 ${COLORS.accent}, inset 0 0 0 100px ${COLORS.accentGlow}` : 'none',
        }}
        onFocus={() => setFocused(true)}
        onBlur={(e) => {
          setFocused(false);
          setHasValue(e.target.value.length > 0);
        }}
        onInput={(e) => setHasValue((e.target as HTMLInputElement).value.length > 0)}
        {...registration}
      />

      {/* Floating label */}
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-[2.625rem] top-1/2 origin-left transition-all duration-200 select-none"
        style={{
          color: hasError ? COLORS.error : focused ? COLORS.accent : COLORS.textMuted,
          fontSize: isLifted ? '11px' : '14px',
          transform: isLifted ? 'translateY(-1.55rem) translateX(-0.1rem) scale(1)' : 'translateY(-50%)',
          fontWeight: isLifted ? 600 : 400,
        }}
      >
        {label}
        {required && (
          <span style={{ color: COLORS.accent, marginLeft: '2px' }}>*</span>
        )}
      </label>

      {/* Right slot (e.g. show/hide password) */}
      {rightSlot && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10">
          {rightSlot}
        </div>
      )}

      {/* Error */}
      {errorMessage && (
        <p role="alert" className="mt-1 text-xs flex items-center gap-1" style={{ color: COLORS.error }}>
          <AlertCircle className="h-3 w-3 shrink-0" />
          {errorMessage}
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PasswordStrength
// ─────────────────────────────────────────────────────────────────────────────

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const { score, label, color } = getPasswordStrength(password);

  const barColors = [
    score >= 1 ? '#DC2626' : 'rgba(196,146,58,0.12)',
    score >= 2 ? '#F97316' : 'rgba(196,146,58,0.12)',
    score >= 3 ? '#EAB308' : 'rgba(196,146,58,0.12)',
    score >= 4 ? '#22C55E' : 'rgba(196,146,58,0.12)',
  ];

  return (
    <div className="mt-2 px-0.5">
      <div className="flex gap-1.5 mb-1.5">
        {barColors.map((bg, i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-400"
            style={{ background: bg }}
          />
        ))}
      </div>
      <p className="text-[11px] font-semibold" style={{ color }}>
        {label}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Stepper
// ─────────────────────────────────────────────────────────────────────────────

function Stepper({ current }: { current: number }) {
  return (
    <div className="flex items-start justify-between w-full mb-7 px-1">
      {STEPS.map((s, idx) => {
        const done = current > s.id;
        const active = current === s.id;

        return (
          <div key={s.id} className="flex flex-col items-center relative" style={{ flex: 1 }}>
            {/* Connector line left */}
            {idx > 0 && (
              <div
                className="absolute"
                style={{
                  top: '14px',
                  right: '50%',
                  left: '-50%',
                  height: '1.5px',
                  background: done || active ? COLORS.accent : COLORS.inputBorder,
                  transition: 'background 0.35s',
                  zIndex: 0,
                }}
              />
            )}

            {/* Circle */}
            <div
              className="relative z-10 flex h-7 w-7 items-center justify-center rounded-full transition-all duration-350 font-bold text-xs"
              style={
                done
                  ? {
                      background: COLORS.green,
                      color: '#E4DBC8',
                      boxShadow: `0 0 0 3px rgba(30,107,62,0.20)`,
                    }
                  : active
                  ? {
                      background: `linear-gradient(135deg, ${COLORS.accent} 0%, #b07928 100%)`,
                      color: '#07100A',
                      boxShadow: `0 0 0 3px ${COLORS.accentGlow}, 0 4px 12px rgba(196,146,58,0.25)`,
                    }
                  : {
                      background: 'transparent',
                      color: COLORS.textMuted,
                      border: `1px solid ${COLORS.inputBorder}`,
                    }
              }
            >
              {done ? (
                <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
              ) : (
                s.id
              )}
            </div>

            {/* Label */}
            <span
              className="mt-2 text-[10px] font-semibold tracking-wide text-center"
              style={{
                color: done ? COLORS.accent : active ? COLORS.text : COLORS.textMuted,
                transition: 'color 0.3s',
              }}
            >
              {s.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Buttons
// ─────────────────────────────────────────────────────────────────────────────

function PrimaryButton({
  type = 'submit',
  disabled,
  onClick,
  children,
  fullWidth,
}: {
  type?: 'submit' | 'button';
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  children: React.ReactNode;
  fullWidth?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`${fullWidth ? 'w-full' : 'flex-1'} h-[48px] rounded-[10px] flex items-center justify-center gap-2 font-bold text-[14px] tracking-wide transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer overflow-hidden`}
      style={{
        background: `linear-gradient(135deg, ${COLORS.accent} 0%, #b07928 100%)`,
        color: '#07100A',
        boxShadow: hovered && !disabled
          ? `0 6px 24px rgba(196,146,58,0.38)`
          : `0 4px 20px rgba(196,146,58,0.28)`,
        transform: hovered && !disabled ? 'translateY(-1px)' : 'translateY(0)',
      }}
    >
      {children}
    </button>
  );
}

function OutlineButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex-1 h-[48px] rounded-[10px] flex items-center justify-center gap-1.5 font-semibold text-[14px] transition-all duration-200 cursor-pointer"
      style={{
        background: 'transparent',
        border: `1px solid ${hovered ? COLORS.accentBorderHover : COLORS.accentBorder}`,
        color: hovered ? COLORS.text : COLORS.textMuted,
      }}
    >
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Checkbox row
// ─────────────────────────────────────────────────────────────────────────────

function CheckboxRow({
  id,
  registration,
  error,
  children,
}: {
  id: string;
  registration: ReturnType<ReturnType<typeof useForm>['register']>;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="flex items-start gap-3 cursor-pointer group">
        <div className="mt-0.5 flex-shrink-0">
          <input
            id={id}
            type="checkbox"
            className="h-4 w-4 rounded cursor-pointer"
            style={{ accentColor: COLORS.accent }}
            {...registration}
          />
        </div>
        <span className="text-[13px] leading-relaxed" style={{ color: COLORS.textMuted }}>
          {children}
        </span>
      </label>
      {error && (
        <p role="alert" className="mt-1 text-xs flex items-center gap-1" style={{ color: COLORS.error }}>
          <AlertCircle className="h-3 w-3 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Select field wrapper
// ─────────────────────────────────────────────────────────────────────────────

function SelectField({
  label,
  required,
  value,
  onValueChange,
  placeholder,
  options,
  error,
}: {
  label: string;
  required?: boolean;
  value: string;
  onValueChange: (v: string) => void;
  placeholder: string;
  options: { value: string; label: string }[];
  error?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5 tracking-wide" style={{ color: COLORS.textDim }}>
        {label}
        {required && <span style={{ color: COLORS.accent, marginLeft: '3px' }}>*</span>}
      </label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger
          className="h-[48px] rounded-[10px] text-[14px] font-medium [&>svg]:opacity-40 transition-all duration-200"
          style={{
            background: COLORS.inputBg,
            border: error ? `1px solid ${COLORS.error}` : `1px solid ${COLORS.inputBorder}`,
            color: value ? COLORS.text : COLORS.textMuted,
          }}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent
          style={{
            background: '#152219',
            border: `1px solid ${COLORS.inputBorder}`,
            color: COLORS.text,
          }}
        >
          {options.map((opt) => (
            <SelectItem
              key={opt.value}
              value={opt.value}
              className="focus:bg-[rgba(196,146,58,0.12)] focus:text-[#E4DBC8] text-[13px]"
            >
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && (
        <p role="alert" className="mt-1 text-xs flex items-center gap-1" style={{ color: COLORS.error }}>
          <AlertCircle className="h-3 w-3 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Slide variants
// ─────────────────────────────────────────────────────────────────────────────

function getSlideVariants(direction: 'forward' | 'backward') {
  return {
    enter: {
      x: direction === 'forward' ? 40 : -40,
      opacity: 0,
    },
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
    },
    exit: {
      x: direction === 'forward' ? -40 : 40,
      opacity: 0,
      transition: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  };
}

const cardEntrance = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [formData, setFormData] = useState<Partial<RegisterData>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const prevStepRef = useRef(1);

  const { register: registerUser, isRegisterLoading } = useAuth();

  const step1Form = useForm<RegisterStep1Data>({
    resolver: zodResolver(registerStep1Schema),
    mode: 'onChange',
  });

  const step2Form = useForm<RegisterStep2Data>({
    resolver: zodResolver(registerStep2Schema),
    mode: 'onChange',
    defaultValues: {
      country: '',
      role: 'producteur',
      sector: 'vegetal',
      organisation: '',
    },
  });

  const step3Form = useForm<RegisterStep3Data>({
    resolver: zodResolver(registerStep3Schema),
    defaultValues: { accept_terms: false, accept_privacy: false, newsletter: false },
  });

  const password = step1Form.watch('password', '');

  const navigate = useCallback((target: number) => {
    setDirection(target > prevStepRef.current ? 'forward' : 'backward');
    prevStepRef.current = target;
    setStep(target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleStep1 = step1Form.handleSubmit((data) => {
    setFormData((prev) => ({ ...prev, ...data }));
    navigate(2);
  });

  const handleStep2 = step2Form.handleSubmit((data) => {
    setFormData((prev) => ({ ...prev, ...data }));
    navigate(3);
  });

  const handleStep3 = step3Form.handleSubmit((data) => {
    setApiError(null);
    registerUser(
      { ...formData, ...data } as RegisterData,
      {
        onError: (error: { message?: string }) => {
          setApiError(error?.message ?? "Une erreur est survenue pendant l'inscription.");
        },
      }
    );
  });

  const handleGoogleLogin = () => {
    const prefix = process.env.NEXT_PUBLIC_API_PREFIX || '/api/v1';
    window.location.href = `${prefix}/auth/oauth/google`;
  };

  const handleMicrosoftLogin = () => {
    const prefix = process.env.NEXT_PUBLIC_API_PREFIX || '/api/v1';
    window.location.href = `${prefix}/auth/oauth/microsoft`;
  };

  const slideVariants = getSlideVariants(direction);

  return (
    <motion.div variants={cardEntrance} initial="hidden" animate="visible" className="w-full">

      {/* Header */}
      <div className="text-center mb-6">
        <h1
          className="font-display text-[1.45rem] font-bold italic mb-2 leading-tight"
          style={{ color: COLORS.text }}
        >
          Créer un compte
        </h1>
        <p className="text-[13px]" style={{ color: COLORS.textMuted }}>
          Rejoignez la communauté des acteurs agricoles
        </p>
      </div>

      {/* Stepper */}
      <Stepper current={step} />

      {/* API Error */}
      <AnimatePresence>
        {apiError && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="mb-5 rounded-[10px] p-3 flex items-start gap-2.5"
            style={{
              border: `1px solid ${COLORS.errorBorder}`,
              background: COLORS.errorBg,
            }}
          >
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" style={{ color: COLORS.error }} />
            <p className="text-sm flex-1" style={{ color: '#fca5a5' }}>{apiError}</p>
            <button
              type="button"
              onClick={() => setApiError(null)}
              className="leading-none p-0.5 transition-colors"
              style={{ color: 'rgba(248,113,113,0.55)' }}
              aria-label="Fermer"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Steps wrapper */}
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>

          {/* ─── Step 1: Informations ─── */}
          {step === 1 && (
            <motion.div
              key="step-1"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <form onSubmit={handleStep1} noValidate>
                <div className="space-y-5">

                  {/* Nom complet */}
                  <FloatInput
                    id="name"
                    label="Nom complet"
                    autoComplete="name"
                    hasError={!!step1Form.formState.errors.name}
                    errorMessage={step1Form.formState.errors.name?.message}
                    icon={<User className="h-4 w-4" strokeWidth={1.5} />}
                    registration={step1Form.register('name')}
                    required
                    placeholder="Amadou Diallo"
                  />

                  {/* Email */}
                  <FloatInput
                    id="email"
                    label="Adresse email"
                    type="email"
                    autoComplete="email"
                    hasError={!!step1Form.formState.errors.email}
                    errorMessage={step1Form.formState.errors.email?.message}
                    icon={<Mail className="h-4 w-4" strokeWidth={1.5} />}
                    registration={step1Form.register('email')}
                    required
                    placeholder="vous@exemple.com"
                  />

                  {/* Phone */}
                  <FloatInput
                    id="phone"
                    label="Téléphone"
                    type="tel"
                    autoComplete="tel"
                    hasError={!!step1Form.formState.errors.phone}
                    errorMessage={step1Form.formState.errors.phone?.message}
                    icon={<Phone className="h-4 w-4" strokeWidth={1.5} />}
                    registration={step1Form.register('phone')}
                    required
                    placeholder="+221 77 000 00 00"
                  />

                  {/* Password */}
                  <div>
                    <FloatInput
                      id="password"
                      label="Mot de passe"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      hasError={!!step1Form.formState.errors.password}
                      errorMessage={step1Form.formState.errors.password?.message}
                      icon={<Lock className="h-4 w-4" strokeWidth={1.5} />}
                      rightSlot={
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="transition-colors p-0.5"
                          style={{ color: COLORS.textMuted }}
                          aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = COLORS.accent; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = COLORS.textMuted; }}
                        >
                          {showPassword
                            ? <EyeOff className="h-4 w-4" />
                            : <Eye className="h-4 w-4" />}
                        </button>
                      }
                      registration={step1Form.register('password')}
                      required
                      placeholder="••••••••"
                    />
                    <PasswordStrength password={password} />
                  </div>

                  {/* Confirm password */}
                  <FloatInput
                    id="password_confirm"
                    label="Confirmer le mot de passe"
                    type={showConfirm ? 'text' : 'password'}
                    autoComplete="new-password"
                    hasError={!!step1Form.formState.errors.password_confirm}
                    errorMessage={step1Form.formState.errors.password_confirm?.message}
                    icon={<Lock className="h-4 w-4" strokeWidth={1.5} />}
                    rightSlot={
                      <button
                        type="button"
                        onClick={() => setShowConfirm((v) => !v)}
                        className="transition-colors p-0.5"
                        style={{ color: COLORS.textMuted }}
                        aria-label={showConfirm ? 'Masquer' : 'Afficher'}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = COLORS.accent; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = COLORS.textMuted; }}
                      >
                        {showConfirm
                          ? <EyeOff className="h-4 w-4" />
                          : <Eye className="h-4 w-4" />}
                      </button>
                    }
                    registration={step1Form.register('password_confirm')}
                    required
                    placeholder="••••••••"
                  />

                  {/* Next */}
                  <div className="pt-2">
                    <PrimaryButton type="submit" fullWidth>
                      <span>Continuer</span>
                      <ArrowRight className="h-4 w-4" />
                    </PrimaryButton>
                  </div>

                  {/* ── Divider ── */}
                  <div
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
                  </div>

                  {/* ── Social Login Buttons ── */}
                  <div
                    style={{
                      display: 'flex',
                      gap: '0.75rem',
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
                        border: '1px solid rgba(196, 146, 58, 0.20)',
                        background: 'rgba(255, 255, 255, 0.03)',
                        color: '#E4DBC8',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'background-color 0.2s ease, border-color 0.2s ease, transform 0.15s ease, box-shadow 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        const btn = e.currentTarget as HTMLButtonElement;
                        btn.style.background = 'rgba(255, 255, 255, 0.07)';
                        btn.style.borderColor = '#C4923A';
                        btn.style.transform = 'translateY(-1px)';
                        btn.style.boxShadow = '0 4px 12px rgba(196, 146, 58, 0.12)';
                      }}
                      onMouseLeave={(e) => {
                        const btn = e.currentTarget as HTMLButtonElement;
                        btn.style.background = 'rgba(255, 255, 255, 0.03)';
                        btn.style.borderColor = 'rgba(196, 146, 58, 0.20)';
                        btn.style.transform = 'translateY(0)';
                        btn.style.boxShadow = 'none';
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
                        border: '1px solid rgba(196, 146, 58, 0.20)',
                        background: 'rgba(255, 255, 255, 0.03)',
                        color: '#E4DBC8',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'background-color 0.2s ease, border-color 0.2s ease, transform 0.15s ease, box-shadow 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        const btn = e.currentTarget as HTMLButtonElement;
                        btn.style.background = 'rgba(255, 255, 255, 0.07)';
                        btn.style.borderColor = '#C4923A';
                        btn.style.transform = 'translateY(-1px)';
                        btn.style.boxShadow = '0 4px 12px rgba(196, 146, 58, 0.12)';
                      }}
                      onMouseLeave={(e) => {
                        const btn = e.currentTarget as HTMLButtonElement;
                        btn.style.background = 'rgba(255, 255, 255, 0.03)';
                        btn.style.borderColor = 'rgba(196, 146, 58, 0.20)';
                        btn.style.transform = 'translateY(0)';
                        btn.style.boxShadow = 'none';
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
                  </div>

                </div>
              </form>
            </motion.div>
          )}

          {/* ─── Step 2: Profil ─── */}
          {step === 2 && (
            <motion.div
              key="step-2"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <form onSubmit={handleStep2} noValidate>
                <div className="space-y-5">

                  {/* Rôle */}
                  <SelectField
                    label="Rôle / Statut"
                    required
                    value={step2Form.watch('role') ?? ''}
                    onValueChange={(v) =>
                      step2Form.setValue('role', v as RegisterStep2Data['role'], { shouldValidate: true })
                    }
                    placeholder="Sélectionner votre rôle"
                    options={ROLES}
                    error={step2Form.formState.errors.role?.message}
                  />

                  {/* Secteur */}
                  <SelectField
                    label="Secteur d'activité"
                    required
                    value={step2Form.watch('sector') ?? ''}
                    onValueChange={(v) =>
                      step2Form.setValue('sector', v as RegisterStep2Data['sector'], { shouldValidate: true })
                    }
                    placeholder="Sélectionner votre secteur"
                    options={SECTORS}
                    error={step2Form.formState.errors.sector?.message}
                  />

                  {/* Pays */}
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 tracking-wide" style={{ color: COLORS.textDim }}>
                      Pays <span style={{ color: COLORS.accent }}>*</span>
                    </label>
                    <CountrySelector
                      value={step2Form.watch('country')}
                      onChange={(v) =>
                        step2Form.setValue('country', v, { shouldValidate: true })
                      }
                    />
                    {step2Form.formState.errors.country && (
                      <p role="alert" className="mt-1 text-xs flex items-center gap-1" style={{ color: COLORS.error }}>
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        {step2Form.formState.errors.country.message}
                      </p>
                    )}
                  </div>

                  {/* Organisation */}
                  <div className="relative">
                    <label
                      htmlFor="organisation"
                      className="block text-xs font-semibold mb-1.5 tracking-wide"
                      style={{ color: COLORS.textDim }}
                    >
                      Organisation{' '}
                      <span className="font-normal" style={{ color: COLORS.textMuted }}>
                        (optionnel)
                      </span>
                    </label>
                    <div className="relative">
                      <Building2
                        className="pointer-events-none absolute left-[0.875rem] top-1/2 -translate-y-1/2 h-4 w-4"
                        strokeWidth={1.5}
                        style={{ color: COLORS.textMuted }}
                      />
                      <input
                        id="organisation"
                        type="text"
                        placeholder="Coopérative agricole de..."
                        autoComplete="organization"
                        style={{
                          background: COLORS.inputBg,
                          color: COLORS.text,
                          border: `1px solid ${COLORS.inputBorder}`,
                          width: '100%',
                          height: '48px',
                          borderRadius: '10px',
                          fontSize: '14px',
                          paddingLeft: '2.625rem',
                          paddingRight: '1rem',
                          outline: 'none',
                          transition: 'border-color 0.2s, box-shadow 0.2s',
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = COLORS.accent;
                          e.currentTarget.style.boxShadow = `0 0 0 3px ${COLORS.accentGlow}`;
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = COLORS.inputBorder;
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                        {...step2Form.register('organisation')}
                      />
                    </div>
                  </div>

                  {/* Nav */}
                  <div className="flex gap-3 pt-2">
                    <OutlineButton onClick={() => navigate(1)}>
                      <ChevronLeft className="h-4 w-4" />
                      Retour
                    </OutlineButton>
                    <PrimaryButton type="submit">
                      <span>Continuer</span>
                      <ArrowRight className="h-4 w-4" />
                    </PrimaryButton>
                  </div>

                </div>
              </form>
            </motion.div>
          )}

          {/* ─── Step 3: Conditions ─── */}
          {step === 3 && (
            <motion.div
              key="step-3"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <form onSubmit={handleStep3} noValidate>
                <div className="space-y-5">

                  {/* Summary card */}
                  <div
                    className="rounded-[10px] p-4"
                    style={{
                      background: COLORS.inputBg,
                      border: `1px solid rgba(196,146,58,0.18)`,
                    }}
                  >
                    <h3
                      className="text-[11px] font-bold uppercase tracking-widest mb-3"
                      style={{ color: COLORS.accent }}
                    >
                      Récapitulatif
                    </h3>
                    <div className="space-y-2">
                      {[
                        { label: 'Nom', value: formData.name },
                        { label: 'Email', value: formData.email },
                        { label: 'Téléphone', value: formData.phone },
                        { label: 'Pays', value: formData.country },
                        {
                          label: 'Organisation',
                          value: formData.organisation || (
                            <span style={{ color: COLORS.textMuted, fontStyle: 'italic', fontWeight: 400 }}>—</span>
                          ),
                        },
                        {
                          label: 'Secteur',
                          value: SECTORS.find((s) => s.value === formData.sector)?.label,
                        },
                        {
                          label: 'Rôle',
                          value: ROLES.find((r) => r.value === formData.role)?.label,
                        },
                      ].map((item) => (
                        <div key={item.label} className="flex justify-between items-baseline gap-4">
                          <span className="text-[11px] shrink-0" style={{ color: COLORS.textMuted }}>
                            {item.label}
                          </span>
                          <span
                            className="text-[12px] font-semibold text-right truncate"
                            style={{ color: COLORS.text }}
                          >
                            {item.value as React.ReactNode}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Divider */}
                  <div
                    className="h-px w-full"
                    style={{ background: 'rgba(196,146,58,0.12)' }}
                  />

                  {/* CGU */}
                  <CheckboxRow
                    id="accept_terms"
                    registration={step3Form.register('accept_terms')}
                    error={step3Form.formState.errors.accept_terms?.message}
                  >
                    J&apos;accepte les{' '}
                    <Link
                      href="/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold underline underline-offset-2 transition-colors"
                      style={{ color: COLORS.accent }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = COLORS.accentHover; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = COLORS.accent; }}
                    >
                      Conditions générales d&apos;utilisation
                    </Link>
                  </CheckboxRow>

                  {/* Confidentialité */}
                  <CheckboxRow
                    id="accept_privacy"
                    registration={step3Form.register('accept_privacy')}
                    error={step3Form.formState.errors.accept_privacy?.message}
                  >
                    J&apos;accepte la{' '}
                    <Link
                      href="/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold underline underline-offset-2 transition-colors"
                      style={{ color: COLORS.accent }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = COLORS.accentHover; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = COLORS.accent; }}
                    >
                      Politique de confidentialité
                    </Link>{' '}
                    et autorise le traitement de mes données personnelles
                  </CheckboxRow>

                  {/* Newsletter */}
                  <CheckboxRow
                    id="newsletter"
                    registration={step3Form.register('newsletter')}
                  >
                    Recevoir des conseils, alertes météo et actualités agricoles par email
                  </CheckboxRow>

                  {/* Nav */}
                  <div className="flex gap-3 pt-2">
                    <OutlineButton onClick={() => navigate(2)}>
                      <ChevronLeft className="h-4 w-4" />
                      Retour
                    </OutlineButton>
                    <PrimaryButton type="submit" disabled={isRegisterLoading}>
                      {isRegisterLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Inscription...</span>
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4" />
                          <span>Créer mon compte</span>
                        </>
                      )}
                    </PrimaryButton>
                  </div>

                </div>
              </form>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Login link */}
      <div className="mt-7 text-center">
        <p className="text-[13px]" style={{ color: COLORS.textMuted }}>
          Déjà inscrit ?{' '}
          <Link
            href="/login"
            className="font-semibold transition-colors"
            style={{ color: COLORS.accent }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = COLORS.accentHover; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = COLORS.accent; }}
          >
            Se connecter
          </Link>
        </p>
      </div>

    </motion.div>
  );
}
