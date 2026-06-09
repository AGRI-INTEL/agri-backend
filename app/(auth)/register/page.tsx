'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { motion, AnimatePresence } from '@/lib/motion';
import { Eye, EyeOff, Check, AlertCircle, ArrowRight, Sprout, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CountrySelector } from '@/components/shared/country-selector';
import { useAuth } from '@/hooks/use-auth';
import {
  registerStep1Schema, registerStep2Schema, registerStep3Schema,
  getPasswordStrength,
  type RegisterStep1Data, type RegisterStep2Data, type RegisterStep3Data,
} from '@/lib/validators';
import type { RegisterData } from '@/types/auth';

const ROLES = [
  { value: 'producteur', label: 'Producteur agricole' },
  { value: 'eleveur', label: 'Éleveur' },
  { value: 'pecheur', label: 'Pêcheur' },
  { value: 'forestier', label: 'Exploitant forestier' },
  { value: 'chercheur', label: 'Analyste / Chercheur' },
  { value: 'cooperative', label: 'Coopérative / Groupement' },
  { value: 'ong', label: 'ONG / Institution' },
  { value: 'institution', label: 'Institution / Gouvernement' },
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
  { id: 1, label: 'Informations', desc: 'Vos données personnelles' },
  { id: 2, label: 'Profil', desc: "Votre secteur d'activité" },
  { id: 3, label: 'Conditions', desc: 'Acceptation des conditions' },
];

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const slideIn = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const slideOut = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit: { opacity: 0, x: -30, transition: { duration: 0.2 } },
};

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<RegisterData>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const { register: registerUser, isRegisterLoading } = useAuth();

  const step1Form = useForm<RegisterStep1Data>({
    resolver: zodResolver(registerStep1Schema),
    mode: 'onBlur',
  });
  const step2Form = useForm<RegisterStep2Data>({
    resolver: zodResolver(registerStep2Schema),
    mode: 'onBlur',
    defaultValues: { country: '', role: 'producteur', sector: 'vegetal' },
  });
  const step3Form = useForm<RegisterStep3Data>({
    resolver: zodResolver(registerStep3Schema),
    defaultValues: { accept_terms: false, accept_privacy: false, newsletter: false },
  });

  const password = step1Form.watch('password', '');
  const strength = getPasswordStrength(password);

  const handleStep1 = (data: RegisterStep1Data) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStep2 = (data: RegisterStep2Data) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStep3 = (data: { accept_terms: boolean; accept_privacy: boolean; newsletter?: boolean }) => {
    setApiError(null);
    registerUser(
      { ...formData, ...data } as RegisterData,
      {
        onError: (error: { message?: string }) => {
          setApiError(error?.message ?? 'Une erreur est survenue pendant l\'inscription.');
        },
      }
    );
  };

  const inputClass = (hasError?: boolean) =>
    `w-full h-12 px-4 text-[15px] font-semibold text-slate-900 rounded-xl border bg-white placeholder:text-slate-400 placeholder:font-normal transition-all duration-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 ${
      hasError ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-300 hover:border-slate-400'
    }`;

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="w-full max-w-md mx-auto"
    >
      {/* Animated decorative icon */}
      <motion.div variants={fadeUp} className="flex justify-center mb-5">
        <motion.div
          className="relative"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
        >
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <Sprout className="h-7 w-7 text-white" />
          </div>
          <motion.div
            className="absolute -inset-2 rounded-2xl bg-emerald-400/20 blur-xl -z-10"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          />
        </motion.div>
      </motion.div>

      {/* Header */}
      <motion.div variants={fadeUp} className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">
          Créer un compte
        </h1>
        <p className="text-sm text-slate-500">
          Rejoignez la communauté des agriculteurs intelligents
        </p>
      </motion.div>

      {/* Progress Indicator */}
      <motion.div variants={fadeUp} className="mb-6">
        <div className="flex justify-between mb-3">
          {STEPS.map((s) => (
            <div key={s.id} className="flex flex-col items-center flex-1">
              <motion.div
                animate={{
                  scale: step >= s.id ? 1 : 0.9,
                  opacity: step >= s.id ? 1 : 0.4,
                }}
                transition={{ duration: 0.3 }}
                className={`mb-1.5 flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all ${
                  step >= s.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {step > s.id ? <Check className="h-4 w-4" /> : s.id}
              </motion.div>
              <p className="text-[11px] font-semibold text-slate-800">{s.label}</p>
              <p className="text-[10px] text-slate-400 hidden sm:block">{s.desc}</p>
            </div>
          ))}
        </div>
        <motion.div
          initial={false}
          animate={{ scaleX: step / 3 }}
          className="h-1.5 bg-slate-100 rounded-full overflow-hidden"
          style={{ transformOrigin: 'left' }}
        >
          <motion.div
            animate={{ width: `${(step / 3) * 100}%` }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full"
          />
        </motion.div>
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

      {/* Forms */}
      <AnimatePresence mode="wait">
        {/* Step 1: Personal Info */}
        {step === 1 && (
          <motion.form
            key="step1"
            variants={slideIn}
            initial="hidden"
            animate="visible"
            exit="exit"
            onSubmit={step1Form.handleSubmit(handleStep1)}
            className="space-y-4"
            noValidate
          >
            <motion.div variants={fadeUp}>
              <label htmlFor="name" className="block text-sm font-semibold text-slate-800 mb-1.5">
                Nom complet <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                placeholder="Amadou Diallo"
                className={inputClass(!!step1Form.formState.errors.name)}
                {...step1Form.register('name')}
              />
              {step1Form.formState.errors.name && (
                <p className="mt-1 text-xs text-red-600">⚠ {step1Form.formState.errors.name.message}</p>
              )}
            </motion.div>

            <motion.div variants={fadeUp}>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-800 mb-1.5">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                placeholder="vous@exemple.com"
                className={inputClass(!!step1Form.formState.errors.email)}
                {...step1Form.register('email')}
              />
              {step1Form.formState.errors.email && (
                <p className="mt-1 text-xs text-red-600">⚠ {step1Form.formState.errors.email.message}</p>
              )}
            </motion.div>

            <motion.div variants={fadeUp}>
              <label htmlFor="phone" className="block text-sm font-semibold text-slate-800 mb-1.5">
                Téléphone <span className="text-red-500">*</span>
              </label>
              <input
                id="phone"
                type="tel"
                placeholder="+221 77 000 00 00"
                className={inputClass(!!step1Form.formState.errors.phone)}
                {...step1Form.register('phone')}
              />
              {step1Form.formState.errors.phone && (
                <p className="mt-1 text-xs text-red-600">⚠ {step1Form.formState.errors.phone.message}</p>
              )}
            </motion.div>

            <motion.div variants={fadeUp}>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-800 mb-1.5">
                Mot de passe <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`${inputClass(!!step1Form.formState.errors.password)} pr-11`}
                  {...step1Form.register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-0.5"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="h-1.5 flex-1 rounded-full"
                        style={{
                          backgroundColor: i < strength.score ? strength.color : '#E2E8F0',
                          transformOrigin: 'left',
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-xs font-semibold" style={{ color: strength.color }}>
                    {strength.label}
                  </p>
                </div>
              )}

              {step1Form.formState.errors.password && (
                <p className="mt-1 text-xs text-red-600">⚠ {step1Form.formState.errors.password.message}</p>
              )}
            </motion.div>

            <motion.div variants={fadeUp}>
              <label htmlFor="password_confirm" className="block text-sm font-semibold text-slate-800 mb-1.5">
                Confirmer le mot de passe <span className="text-red-500">*</span>
              </label>
              <input
                id="password_confirm"
                type="password"
                placeholder="••••••••"
                className={inputClass(!!step1Form.formState.errors.password_confirm)}
                {...step1Form.register('password_confirm')}
              />
              {step1Form.formState.errors.password_confirm && (
                <p className="mt-1 text-xs text-red-600">⚠ {step1Form.formState.errors.password_confirm.message}</p>
              )}
            </motion.div>

            <motion.div variants={fadeUp} whileTap={{ scale: 0.98 }}>
              <button
                type="submit"
                className="w-full h-11 rounded-xl font-semibold text-sm tracking-wide bg-gradient-to-r from-emerald-600 to-emerald-500 text-white transition-all duration-200 hover:from-emerald-700 hover:to-emerald-600 hover:shadow-lg hover:shadow-emerald-500/25 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                Continuer <ArrowRight className="h-4 w-4" />
              </button>
            </motion.div>
          </motion.form>
        )}

        {/* Step 2: Profile */}
        {step === 2 && (
          <motion.form
            key="step2"
            variants={slideIn}
            initial="hidden"
            animate="visible"
            exit="exit"
            onSubmit={step2Form.handleSubmit(handleStep2)}
            className="space-y-4"
            noValidate
          >
            <motion.div variants={fadeUp}>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                Pays <span className="text-red-500">*</span>
              </label>
              <CountrySelector
                value={step2Form.watch('country')}
                onChange={(v) => step2Form.setValue('country', v)}
              />
              {step2Form.formState.errors.country && (
                <p className="mt-1 text-xs text-red-600">⚠ {step2Form.formState.errors.country.message}</p>
              )}
            </motion.div>

            <motion.div variants={fadeUp}>
              <label htmlFor="organisation" className="block text-sm font-semibold text-slate-800 mb-1.5">
                Organisation <span className="text-slate-400">(optionnel)</span>
              </label>
              <input
                id="organisation"
                placeholder="Coopérative agricole de..."
                className={inputClass()}
                {...step2Form.register('organisation')}
              />
            </motion.div>

            <motion.div variants={fadeUp}>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                Secteur d&apos;activité <span className="text-red-500">*</span>
              </label>
              <Select
                value={step2Form.watch('sector')}
                onValueChange={(v) => step2Form.setValue('sector', v as RegisterStep2Data['sector'])}
              >
                <SelectTrigger className="h-12 rounded-xl border-slate-300 bg-white text-slate-900 font-semibold text-[15px] hover:border-slate-400 focus:ring-emerald-500/20">
                  <SelectValue placeholder="Sélectionner votre secteur" />
                </SelectTrigger>
                <SelectContent>
                  {SECTORS.map((sector) => (
                    <SelectItem key={sector.value} value={sector.value}>
                      {sector.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </motion.div>

            <motion.div variants={fadeUp}>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                Rôle / Statut <span className="text-red-500">*</span>
              </label>
              <Select
                value={step2Form.watch('role')}
                onValueChange={(v) => step2Form.setValue('role', v as RegisterStep2Data['role'])}
              >
                <SelectTrigger className="h-12 rounded-xl border-slate-300 bg-white text-slate-900 font-semibold text-[15px] hover:border-slate-400 focus:ring-emerald-500/20">
                  <SelectValue placeholder="Sélectionner votre rôle" />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {step2Form.formState.errors.role && (
                <p className="mt-1 text-xs text-red-600">⚠ {step2Form.formState.errors.role.message}</p>
              )}
            </motion.div>

            <motion.div variants={fadeUp} className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 h-11 rounded-xl text-sm font-semibold border border-slate-200 bg-white text-slate-700 transition-all duration-200 hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] cursor-pointer"
              >
                ← Retour
              </button>
              <button
                type="submit"
                className="flex-1 h-11 rounded-xl font-semibold text-sm tracking-wide bg-gradient-to-r from-emerald-600 to-emerald-500 text-white transition-all duration-200 hover:from-emerald-700 hover:to-emerald-600 hover:shadow-lg hover:shadow-emerald-500/25 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
              >
                Continuer <ArrowRight className="h-4 w-4" />
              </button>
            </motion.div>
          </motion.form>
        )}

        {/* Step 3: Conditions */}
        {step === 3 && (
          <motion.form
            key="step3"
            variants={slideIn}
            initial="hidden"
            animate="visible"
            exit="exit"
            onSubmit={step3Form.handleSubmit(handleStep3)}
            className="space-y-4"
            noValidate
          >
            <motion.div variants={fadeUp}>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
                <h3 className="font-bold text-sm text-slate-800">Vérifiez vos informations</h3>
                <div className="space-y-1.5 text-sm">
                  {[
                    { label: 'Nom', value: formData.name },
                    { label: 'Email', value: formData.email },
                    { label: 'Téléphone', value: formData.phone },
                    { label: 'Pays', value: formData.country },
                    { label: 'Organisation', value: formData.organisation || '—' },
                    { label: 'Secteur', value: SECTORS.find((s) => s.value === formData.sector)?.label },
                    { label: 'Rôle', value: ROLES.find((r) => r.value === formData.role)?.label },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between gap-4">
                      <span className="text-slate-500 text-xs">{item.label}</span>
                      <span className="font-semibold text-slate-900 text-xs text-right">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div variants={fadeUp}>
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500/30 accent-emerald-600 cursor-pointer"
                  {...step3Form.register('accept_terms')}
                />
                <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">
                  J&apos;accepte les{' '}
                  <Link href="/terms" target="_blank" className="text-emerald-600 hover:underline font-semibold">
                    Conditions d&apos;utilisation
                  </Link>
                  {' '}et la{' '}
                  <Link href="/privacy" target="_blank" className="text-emerald-600 hover:underline font-semibold">
                    Politique de confidentialité
                  </Link>
                </span>
              </label>
              {step3Form.formState.errors.accept_terms && (
                <p className="mt-1 text-xs text-red-600">⚠ {step3Form.formState.errors.accept_terms.message}</p>
              )}
            </motion.div>

            <motion.div variants={fadeUp}>
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500/30 accent-emerald-600 cursor-pointer"
                  {...step3Form.register('accept_privacy')}
                />
                <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">
                  J&apos;autorise AgriIntel à traiter mes données personnelles
                </span>
              </label>
              {step3Form.formState.errors.accept_privacy && (
                <p className="mt-1 text-xs text-red-600">⚠ {step3Form.formState.errors.accept_privacy.message}</p>
              )}
            </motion.div>

            <motion.div variants={fadeUp}>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500/30 accent-emerald-600 cursor-pointer"
                  {...step3Form.register('newsletter')}
                />
                <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">
                  Recevoir des conseils et alertes météo
                </span>
              </label>
            </motion.div>

            <motion.div variants={fadeUp} className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={isRegisterLoading}
                className="flex-1 h-11 rounded-xl text-sm font-semibold border border-slate-200 bg-white text-slate-700 transition-all duration-200 hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              >
                ← Retour
              </button>
              <button
                type="submit"
                disabled={isRegisterLoading}
                className="flex-1 h-11 rounded-xl font-semibold text-sm tracking-wide bg-gradient-to-r from-emerald-600 to-emerald-500 text-white transition-all duration-200 hover:from-emerald-700 hover:to-emerald-600 hover:shadow-lg hover:shadow-emerald-500/25 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {isRegisterLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Créer mon compte
                  </>
                )}
              </button>
            </motion.div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Login Link */}
      <motion.p variants={fadeUp} className="mt-6 text-center text-sm text-slate-500">
        Déjà un compte ?{' '}
        <Link href="/login" className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
          Se connecter
        </Link>
      </motion.p>
    </motion.div>
  );
}

function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
