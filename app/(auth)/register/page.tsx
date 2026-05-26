'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { motion, AnimatePresence } from '@/lib/motion';
import { Eye, EyeOff, Check } from 'lucide-react';
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

const STEPS = ['Informations', 'Profil', 'Vérification'];

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<RegisterData>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const { register: registerUser, isRegisterLoading } = useAuth();

  const step1Form = useForm<RegisterStep1Data>({ resolver: zodResolver(registerStep1Schema) });
  const step2Form = useForm<RegisterStep2Data>({
    resolver: zodResolver(registerStep2Schema),
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
  };

  const handleStep2 = (data: RegisterStep2Data) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setStep(3);
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
          setApiError(error?.message ?? 'Une erreur est survenue pendant l’inscription.');
        },
      }
    );
  };

  return (
    <div>
      <header className="mb-6 text-center sm:mb-7">
        <h1 className="text-[1.4rem] font-bold tracking-tight text-slate-900 sm:text-2xl">
          Créer un compte
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          Rejoignez 12&nbsp;000+ agriculteurs sur Agri Intel
        </p>
      </header>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          {STEPS.map((s, i) => (
            <span key={s} className={i + 1 <= step ? 'text-primary font-medium' : ''}>{s}</span>
          ))}
        </div>
        <Progress value={(step / 3) * 100} className="h-1.5" />
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.form
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onSubmit={step1Form.handleSubmit(handleStep1)}
            className="space-y-4"
            noValidate
          >
            <div>
              <label className="text-sm font-medium block mb-1.5">Nom complet</label>
              <Input
                placeholder="Amadou Diallo"
                error={step1Form.formState.errors.name?.message}
                {...step1Form.register('name')}
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Email</label>
              <Input
                type="email"
                placeholder="vous@exemple.com"
                error={step1Form.formState.errors.email?.message}
                {...step1Form.register('email')}
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Téléphone</label>
              <Input
                type="tel"
                placeholder="+221 77 000 00 00"
                error={step1Form.formState.errors.phone?.message}
                {...step1Form.register('phone')}
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Mot de passe</label>
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                rightIcon={
                  <button type="button" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
                error={step1Form.formState.errors.password?.message}
                {...step1Form.register('password')}
              />
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-1 flex-1 rounded-full transition-colors"
                        style={{ backgroundColor: i < strength.score ? strength.color : '#E2E8F0' }}
                      />
                    ))}
                  </div>
                  <p className="text-xs" style={{ color: strength.color }}>{strength.label}</p>
                </div>
              )}
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Confirmer le mot de passe</label>
              <Input
                type="password"
                placeholder="••••••••"
                error={step1Form.formState.errors.password_confirm?.message}
                {...step1Form.register('password_confirm')}
              />
            </div>
            <Button type="submit" className="w-full" size="lg">
              Continuer →
            </Button>
          </motion.form>
        )}

        {step === 2 && (
          <motion.form
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onSubmit={step2Form.handleSubmit(handleStep2)}
            className="space-y-4"
            noValidate
          >
            <div>
              <label className="text-sm font-medium block mb-1.5">Pays</label>
              <CountrySelector
                value={step2Form.watch('country')}
                onChange={(v) => step2Form.setValue('country', v)}
              />
              {step2Form.formState.errors.country && (
                <p className="text-xs text-destructive mt-1">{step2Form.formState.errors.country.message}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Organisation (optionnel)</label>
              <Input
                placeholder="Coopérative agricole de..."
                {...step2Form.register('organisation')}
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Secteur</label>
              <Select
                value={step2Form.watch('sector')}
                onValueChange={(v) => step2Form.setValue('sector', v as RegisterStep2Data['sector'])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner votre secteur" />
                </SelectTrigger>
                <SelectContent>
                  {SECTORS.map((sector) => (
                    <SelectItem key={sector.value} value={sector.value}>{sector.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Rôle</label>
              <Select
                value={step2Form.watch('role')}
                onValueChange={(v) => step2Form.setValue('role', v as RegisterStep2Data['role'])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner votre rôle" />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {step2Form.formState.errors.role && (
                <p className="text-xs text-destructive mt-1">{step2Form.formState.errors.role.message}</p>
              )}
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(1)}>
                ← Retour
              </Button>
              <Button type="submit" className="flex-1">
                Continuer →
              </Button>
            </div>
          </motion.form>
        )}

        {step === 3 && (
          <motion.form
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onSubmit={step3Form.handleSubmit(handleStep3)}
            className="space-y-4"
            noValidate
          >
            {/* Summary */}
            <div className="bg-muted/50 rounded-card p-4 space-y-3 text-sm">
              <h3 className="font-semibold">Récapitulatif</h3>
              {[
                { label: 'Nom', value: formData.name },
                { label: 'Email', value: formData.email },
                { label: 'Téléphone', value: formData.phone },
                { label: 'Pays', value: formData.country },
                { label: 'Organisation', value: formData.organisation || 'Aucune' },
                { label: 'Secteur', value: SECTORS.find((s) => s.value === formData.sector)?.label || formData.sector || 'Non renseigné' },
                { label: 'Rôle', value: ROLES.find((r) => r.value === formData.role)?.label || formData.role },
              ].map((item) => (
                <div key={item.label} className="flex justify-between gap-4">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-medium text-right">{item.value}</span>
                </div>
              ))}
            </div>

            {apiError ? (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {apiError}
              </div>
            ) : null}

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-0.5 rounded"
                {...step3Form.register('accept_terms')}
              />
              <span className="text-sm text-muted-foreground">
                J&apos;accepte les{' '}
                <Link href="/cgu" className="text-primary hover:underline">
                  Conditions Générales d&apos;Utilisation
                </Link>{' '}
                et la{' '}
                <Link href="/privacy" className="text-primary hover:underline">
                  Politique de confidentialité
                </Link>
              </span>
            </label>
            {step3Form.formState.errors.accept_terms && (
              <p className="text-xs text-destructive">{step3Form.formState.errors.accept_terms.message}</p>
            )}

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-0.5 rounded"
                {...step3Form.register('accept_privacy')}
              />
              <span className="text-sm text-muted-foreground">
                J&apos;autorise le traitement de mes données personnelles conformément à la{' '}
                <Link href="/privacy" className="text-primary hover:underline">
                  Politique de confidentialité
                </Link>
              </span>
            </label>
            {step3Form.formState.errors.accept_privacy && (
              <p className="text-xs text-destructive">{step3Form.formState.errors.accept_privacy.message}</p>
            )}

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="rounded"
                {...step3Form.register('newsletter')}
              />
              <span className="text-sm text-muted-foreground">
                Je souhaite recevoir des conseils, des alertes météo et des nouveautés par email.
              </span>
            </label>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(2)}>
                ← Retour
              </Button>
              <Button type="submit" className="flex-1 gap-2" loading={isRegisterLoading}>
                <Check className="h-4 w-4" />
                Créer mon compte
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <p className="text-center text-sm text-muted-foreground mt-6">
        Déjà un compte ?{' '}
        <Link href="/login" className="text-primary font-medium hover:underline">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
