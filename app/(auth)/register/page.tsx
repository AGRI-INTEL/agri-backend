'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { motion, AnimatePresence } from '@/lib/motion';
import { Eye, EyeOff, Check, AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
      {
        ...formData,
        ...data,
      } as RegisterData,
      {
        onError: (error: { message?: string }) => {
          setApiError(error?.message ?? 'Une erreur est survenue pendant l\'inscription. Veuillez réessayer.');
        },
      }
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl"
    >
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Créer un compte AgriIntel
        </h1>
        <p className="text-slate-600">
          Rejoignez la communauté des agriculteurs intelligents
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex justify-between mb-4">
          {STEPS.map((s) => (
            <div key={s.id} className="flex flex-col items-center flex-1">
              <motion.div
                animate={{
                  scale: step >= s.id ? 1 : 0.9,
                  opacity: step >= s.id ? 1 : 0.5,
                }}
                className={`mb-2 flex h-10 w-10 items-center justify-center rounded-full font-semibold transition-all ${
                  step >= s.id
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {step > s.id ? <Check className="h-5 w-5" /> : s.id}
              </motion.div>
              <p className="text-center text-xs font-medium text-slate-900">{s.label}</p>
              <p className="text-center text-xs text-slate-500 hidden sm:block">{s.desc}</p>
            </div>
          ))}
        </div>
        <Progress value={(step / 3) * 100} className="h-2" />
      </div>

      {/* Error Alert */}
      {apiError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4"
        >
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0 text-red-600" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-900">{apiError}</p>
          </div>
        </motion.div>
      )}

      {/* Forms */}
      <AnimatePresence mode="wait">
        {/* Step 1: Personal Info */}
        {step === 1 && (
          <motion.form
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            onSubmit={step1Form.handleSubmit(handleStep1)}
            className="space-y-5"
            noValidate
          >
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                Nom complet *
              </label>
              <Input
                id="name"
                placeholder="Amadou Diallo"
                className="h-11"
                data-testid="name-input"
                {...step1Form.register('name')}
              />
              {step1Form.formState.errors.name && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <span className="inline-block w-1 h-1 bg-red-600 rounded-full" />
                  {step1Form.formState.errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Email *
              </label>
              <Input
                id="email"
                type="email"
                placeholder="vous@exemple.com"
                className="h-11"
                data-testid="email-input"
                {...step1Form.register('email')}
              />
              {step1Form.formState.errors.email && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <span className="inline-block w-1 h-1 bg-red-600 rounded-full" />
                  {step1Form.formState.errors.email.message}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">
                Téléphone *
              </label>
              <Input
                id="phone"
                type="tel"
                placeholder="+221 77 000 00 00"
                className="h-11"
                data-testid="phone-input"
                {...step1Form.register('phone')}
              />
              {step1Form.formState.errors.phone && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <span className="inline-block w-1 h-1 bg-red-600 rounded-full" />
                  {step1Form.formState.errors.phone.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Mot de passe *
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pr-12 h-11"
                  data-testid="password-input"
                  {...step1Form.register('password')}
                />
                <button
                  type="button"
                  data-testid="register-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              
              {/* Password Strength */}
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-1.5 flex-1 rounded-full transition-colors"
                        style={{ backgroundColor: i < strength.score ? strength.color : '#E2E8F0' }}
                      />
                    ))}
                  </div>
                  <p className="text-xs font-medium" style={{ color: strength.color }}>
                    Force: {strength.label}
                  </p>
                </div>
              )}

              {step1Form.formState.errors.password && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <span className="inline-block w-1 h-1 bg-red-600 rounded-full" />
                  {step1Form.formState.errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="password_confirm" className="block text-sm font-medium text-slate-700 mb-2">
                Confirmer le mot de passe *
              </label>
              <Input
                id="password_confirm"
                type="password"
                placeholder="••••••••"
                className="h-11"
                data-testid="password-confirm-input"
                {...step1Form.register('password_confirm')}
              />
              {step1Form.formState.errors.password_confirm && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <span className="inline-block w-1 h-1 bg-red-600 rounded-full" />
                  {step1Form.formState.errors.password_confirm.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              data-testid="register-continue"
            >
              Continuer <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </motion.form>
        )}

        {/* Step 2: Profile */}
        {step === 2 && (
          <motion.form
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            onSubmit={step2Form.handleSubmit(handleStep2)}
            className="space-y-5"
            noValidate
          >
            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Pays *
              </label>
              <CountrySelector
                value={step2Form.watch('country')}
                onChange={(v) => step2Form.setValue('country', v)}
              />
              {step2Form.formState.errors.country && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <span className="inline-block w-1 h-1 bg-red-600 rounded-full" />
                  {step2Form.formState.errors.country.message}
                </p>
              )}
            </div>

            {/* Organisation */}
            <div>
              <label htmlFor="organisation" className="block text-sm font-medium text-slate-700 mb-2">
                Organisation (optionnel)
              </label>
              <Input
                id="organisation"
                placeholder="Coopérative agricole de..."
                className="h-11"
                {...step2Form.register('organisation')}
              />
            </div>

            {/* Sector */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Secteur d&apos;activité *
              </label>
              <Select
                value={step2Form.watch('sector')}
                onValueChange={(v) => step2Form.setValue('sector', v as RegisterStep2Data['sector'])}
              >
                <SelectTrigger className="h-11">
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
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Rôle / Statut *
              </label>
              <Select
                value={step2Form.watch('role')}
                onValueChange={(v) => step2Form.setValue('role', v as RegisterStep2Data['role'])}
              >
                <SelectTrigger className="h-11">
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
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <span className="inline-block w-1 h-1 bg-red-600 rounded-full" />
                  {step2Form.formState.errors.role.message}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-11"
                onClick={() => setStep(1)}
              >
                ← Retour
              </Button>
              <Button
                type="submit"
                className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              >
                Continuer <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </motion.form>
        )}

        {/* Step 3: Conditions */}
        {step === 3 && (
          <motion.form
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            onSubmit={step3Form.handleSubmit(handleStep3)}
            className="space-y-5"
            noValidate
          >
            {/* Summary Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 space-y-3">
              <h3 className="font-semibold text-slate-900">Vérifiez vos informations</h3>
              <div className="space-y-2 text-sm">
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
                    <span className="text-slate-600">{item.label}</span>
                    <span className="font-medium text-slate-900 text-right">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Accept Terms */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                className="mt-1 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer h-5 w-5"
                {...step3Form.register('accept_terms')}
              />
              <span className="text-sm text-slate-600 group-hover:text-slate-900">
                J&apos;accepte les{' '}
                <Link href="/terms" target="_blank" className="text-emerald-600 hover:underline font-medium">
                  Conditions d&apos;utilisation
                </Link>
                {' '}et la{' '}
                <Link href="/privacy" target="_blank" className="text-emerald-600 hover:underline font-medium">
                  Politique de confidentialité
                </Link>
              </span>
            </label>
            {step3Form.formState.errors.accept_terms && (
              <p className="text-sm text-red-600 flex items-center gap-1 -mt-3">
                <span className="inline-block w-1 h-1 bg-red-600 rounded-full" />
                {step3Form.formState.errors.accept_terms.message}
              </p>
            )}

            {/* Accept Privacy */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                className="mt-1 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer h-5 w-5"
                {...step3Form.register('accept_privacy')}
              />
              <span className="text-sm text-slate-600 group-hover:text-slate-900">
                J&apos;autorise AgriIntel à traiter mes données personnelles conformément à la{' '}
                <Link href="/privacy" target="_blank" className="text-emerald-600 hover:underline font-medium">
                  Politique de confidentialité
                </Link>
              </span>
            </label>
            {step3Form.formState.errors.accept_privacy && (
              <p className="text-sm text-red-600 flex items-center gap-1 -mt-3">
                <span className="inline-block w-1 h-1 bg-red-600 rounded-full" />
                {step3Form.formState.errors.accept_privacy.message}
              </p>
            )}

            {/* Newsletter */}
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer h-5 w-5"
                {...step3Form.register('newsletter')}
              />
              <span className="text-sm text-slate-600 group-hover:text-slate-900">
                Je souhaite recevoir des conseils, des alertes météo et des actualités
              </span>
            </label>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-11"
                onClick={() => setStep(2)}
                disabled={isRegisterLoading}
              >
                ← Retour
              </Button>
              <Button
                type="submit"
                disabled={isRegisterLoading}
                className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                data-testid="register-submit"
              >
                {isRegisterLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="inline-block"
                  >
                    ⏳
                  </motion.div>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Créer mon compte
                  </>
                )}
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Login Link */}
      <p className="mt-8 text-center text-sm text-slate-600">
        Déjà un compte ?{' '}
        <Link href="/login" className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
          Se connecter
        </Link>
      </p>
    </motion.div>
  );
}
