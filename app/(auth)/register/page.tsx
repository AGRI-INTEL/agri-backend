'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { motion } from '@/lib/motion';
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
} from 'lucide-react';
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
  { id: 1, label: 'Informations' },
  { id: 2, label: 'Profil' },
  { id: 3, label: 'Conditions' },
];

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<RegisterData>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);
  const { register: registerUser, isRegisterLoading } = useAuth();

  const step1Form = useForm<RegisterStep1Data>({
    resolver: zodResolver(registerStep1Schema),
    mode: 'onChange',
  });
  const step2Form = useForm<RegisterStep2Data>({
    resolver: zodResolver(registerStep2Schema),
    mode: 'onChange',
    defaultValues: { country: '', role: 'producteur', sector: 'vegetal' },
  });
  const step3Form = useForm<RegisterStep3Data>({
    resolver: zodResolver(registerStep3Schema),
    defaultValues: { accept_terms: false, accept_privacy: false, newsletter: false },
  });

  const password = step1Form.watch('password', '');
  const strength = getPasswordStrength(password);

  const goToStep = (s: number) => {
    setStep(s);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStep1 = (data: RegisterStep1Data) => {
    setFormData((prev) => ({ ...prev, ...data }));
    goToStep(2);
  };

  const handleStep2 = (data: RegisterStep2Data) => {
    setFormData((prev) => ({ ...prev, ...data }));
    goToStep(3);
  };

  const handleStep3 = (data: { accept_terms: boolean; accept_privacy: boolean; newsletter?: boolean }) => {
    setApiError(null);
    registerUser(
      { ...formData, ...data } as RegisterData,
      {
        onError: (error: { message?: string }) => {
          setApiError(error?.message ?? "Une erreur est survenue pendant l'inscription.");
        },
      }
    );
  };

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

  const inputClass = (hasError?: boolean, withIcon?: boolean) =>
    cn(
      'w-full h-[48px] text-[15px] text-[#111827] rounded-[10px] bg-white border-[1.5px]',
      'placeholder:text-[#9ca3af] transition-all duration-200 outline-none',
      'focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/15',
      withIcon ? 'pl-10 pr-4' : 'px-4',
      hasError
        ? '!border-[#dc2626] !focus:border-[#dc2626] !focus:ring-[#dc2626]/15'
        : 'border-[#e5e7eb]'
    );

  return (
    <motion.div variants={cardVariants} initial="hidden" animate="visible" className="w-full">
      {/* Title */}
      <div className="text-center mb-6">
        <h1 className="text-[22px] font-bold text-[#111827] mb-1.5">
          Créer un compte
        </h1>
        <p className="text-sm text-[#6b7280]">
          Rejoignez la communauté des agriculteurs intelligents
        </p>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between mb-3">
          {STEPS.map((s) => (
            <div key={s.id} className="flex flex-col items-center flex-1">
              <div
                className={cn(
                  'mb-1.5 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300',
                  step >= s.id ? 'bg-[#059669] text-white shadow-sm' : 'bg-[#e5e7eb] text-[#9ca3af]'
                )}
              >
                {step > s.id ? <Check className="h-3.5 w-3.5" /> : s.id}
              </div>
              <p className={cn('text-[11px] font-semibold', step >= s.id ? 'text-[#111827]' : 'text-[#9ca3af]')}>
                {s.label}
              </p>
            </div>
          ))}
        </div>
        <div className="h-1.5 bg-[#e5e7eb] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#059669] rounded-full transition-all duration-400 ease-in-out"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* Error */}
      {apiError && (
        <div className="mb-5 rounded-[10px] border border-red-200 bg-red-50 p-3 flex items-start gap-2.5">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-[#dc2626]" />
          <p className="text-sm text-[#dc2626] flex-1">{apiError}</p>
          <button
            type="button"
            onClick={() => setApiError(null)}
            className="text-red-400 hover:text-red-600 transition-colors leading-none p-0.5"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>
      )}

      {/* ──────── Step 1 ──────── */}
      {step === 1 && (
        <form onSubmit={step1Form.handleSubmit(handleStep1)} noValidate>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-[#111827] mb-1.5">
                Nom complet <span className="text-[#dc2626]">*</span>
              </label>
              <div className="group relative transition-transform duration-200 focus-within:scale-[1.01]">
                <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af] transition-colors duration-200 group-focus-within:text-[#059669]" strokeWidth={1.5} />
                <input id="name" placeholder="Amadou Diallo" autoComplete="name" aria-invalid={!!step1Form.formState.errors.name} {...step1Form.register('name')} className={inputClass(!!step1Form.formState.errors.name, true)} />
              </div>
              {step1Form.formState.errors.name && <p role="alert" className="mt-1 text-xs text-[#dc2626]">{step1Form.formState.errors.name.message}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-[#111827] mb-1.5">
                Email <span className="text-[#dc2626]">*</span>
              </label>
              <div className="group relative transition-transform duration-200 focus-within:scale-[1.01]">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af] transition-colors duration-200 group-focus-within:text-[#059669]" strokeWidth={1.5} />
                <input id="email" type="email" placeholder="vous@exemple.com" autoComplete="email" aria-invalid={!!step1Form.formState.errors.email} {...step1Form.register('email')} className={inputClass(!!step1Form.formState.errors.email, true)} />
              </div>
              {step1Form.formState.errors.email && <p role="alert" className="mt-1 text-xs text-[#dc2626]">{step1Form.formState.errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-[#111827] mb-1.5">
                Téléphone <span className="text-[#dc2626]">*</span>
              </label>
              <div className="group relative transition-transform duration-200 focus-within:scale-[1.01]">
                <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af] transition-colors duration-200 group-focus-within:text-[#059669]" strokeWidth={1.5} />
                <input id="phone" type="tel" placeholder="+221 77 000 00 00" autoComplete="tel" aria-invalid={!!step1Form.formState.errors.phone} {...step1Form.register('phone')} className={inputClass(!!step1Form.formState.errors.phone, true)} />
              </div>
              {step1Form.formState.errors.phone && <p role="alert" className="mt-1 text-xs text-[#dc2626]">{step1Form.formState.errors.phone.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-[#111827] mb-1.5">
                Mot de passe <span className="text-[#dc2626]">*</span>
              </label>
              <div className="group relative transition-transform duration-200 focus-within:scale-[1.01]">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af] transition-colors duration-200 group-focus-within:text-[#059669]" strokeWidth={1.5} />
                <input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" autoComplete="new-password" aria-invalid={!!step1Form.formState.errors.password} {...step1Form.register('password')} className={cn(inputClass(!!step1Form.formState.errors.password, true), 'pr-11')} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#6b7280] transition-colors p-0.5" aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="h-1.5 flex-1 rounded-full" style={{ backgroundColor: i < strength.score ? strength.color : '#e5e7eb' }} />
                    ))}
                  </div>
                  <p className="text-xs font-semibold" style={{ color: strength.color }}>{strength.label}</p>
                </div>
              )}
              {step1Form.formState.errors.password && <p id="password-error" role="alert" className="mt-1 text-xs text-[#dc2626]">{step1Form.formState.errors.password.message}</p>}
            </div>

            <div>
              <label htmlFor="password_confirm" className="block text-sm font-semibold text-[#111827] mb-1.5">
                Confirmer le mot de passe <span className="text-[#dc2626]">*</span>
              </label>
              <div className="group relative transition-transform duration-200 focus-within:scale-[1.01]">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af] transition-colors duration-200 group-focus-within:text-[#059669]" strokeWidth={1.5} />
                <input id="password_confirm" type="password" placeholder="••••••••" autoComplete="new-password" aria-invalid={!!step1Form.formState.errors.password_confirm} {...step1Form.register('password_confirm')} className={inputClass(!!step1Form.formState.errors.password_confirm, true)} />
              </div>
              {step1Form.formState.errors.password_confirm && <p id="password-confirm-error" role="alert" className="mt-1 text-xs text-[#dc2626]">{step1Form.formState.errors.password_confirm.message}</p>}
            </div>

            <div className="pt-1">
              <button type="submit" onClick={createRipple} className="relative w-full h-[48px] rounded-[10px] overflow-hidden bg-[#059669] text-white font-semibold text-[15px] transition-all duration-200 hover:bg-[#047857] hover:-translate-y-[1px] hover:shadow-lg hover:shadow-[#059669]/25 active:translate-y-0 active:shadow-md flex items-center justify-center gap-2.5">
                {ripples.map((r) => (<span key={r.id} className="absolute rounded-full bg-white/40 pointer-events-none animate-ripple" style={{ left: r.x - 3, top: r.y - 3, width: 6, height: 6 }} />))}
                <span>Continuer</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ──────── Step 2 ──────── */}
      {step === 2 && (
        <form onSubmit={step2Form.handleSubmit(handleStep2)} noValidate>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#111827] mb-1.5">
                Pays <span className="text-[#dc2626]">*</span>
              </label>
              <CountrySelector
                value={step2Form.watch('country')}
                onChange={(v) => step2Form.setValue('country', v, { shouldValidate: true })}
              />
            </div>

            <div>
              <label htmlFor="organisation" className="block text-sm font-semibold text-[#111827] mb-1.5">
                Organisation <span className="text-[#9ca3af]">(optionnel)</span>
              </label>
              <input id="organisation" placeholder="Coopérative agricole de..." {...step2Form.register('organisation')} className="w-full h-[48px] px-4 text-[15px] text-[#111827] rounded-[10px] bg-white border-[1.5px] border-[#e5e7eb] placeholder:text-[#9ca3af] transition-all duration-200 outline-none focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/15" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#111827] mb-1.5">
                Secteur d&apos;activité <span className="text-[#dc2626]">*</span>
              </label>
              <Select value={step2Form.watch('sector')} onValueChange={(v) => step2Form.setValue('sector', v as RegisterStep2Data['sector'])}>
                <SelectTrigger style={{ borderWidth: '1.5px' }} className="h-[48px] rounded-[10px] border-[#e5e7eb] bg-white text-[#111827] font-medium text-[15px] hover:border-[#d1d5db] focus:ring-[#059669]/15 focus:border-[#059669] [&>svg]:text-[#9ca3af]">
                  <SelectValue placeholder="Sélectionner votre secteur" />
                </SelectTrigger>
                <SelectContent>
                  {SECTORS.map((sector) => (<SelectItem key={sector.value} value={sector.value}>{sector.label}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#111827] mb-1.5">
                Rôle / Statut <span className="text-[#dc2626]">*</span>
              </label>
              <Select value={step2Form.watch('role')} onValueChange={(v) => step2Form.setValue('role', v as RegisterStep2Data['role'])}>
                <SelectTrigger style={{ borderWidth: '1.5px' }} className="h-[48px] rounded-[10px] border-[#e5e7eb] bg-white text-[#111827] font-medium text-[15px] hover:border-[#d1d5db] focus:ring-[#059669]/15 focus:border-[#059669] [&>svg]:text-[#9ca3af]">
                  <SelectValue placeholder="Sélectionner votre rôle" />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (<SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => goToStep(1)} className="flex-1 h-[48px] rounded-[10px] text-sm font-semibold border-[1.5px] border-[#e5e7eb] bg-white text-[#6b7280] transition-all duration-200 hover:bg-[#f9fafb] hover:border-[#d1d5db] active:scale-[0.98] cursor-pointer">
                ← Retour
              </button>
              <button type="submit" onClick={createRipple} className="relative flex-1 h-[48px] rounded-[10px] overflow-hidden bg-[#059669] text-white font-semibold text-[15px] transition-all duration-200 hover:bg-[#047857] hover:-translate-y-[1px] hover:shadow-lg hover:shadow-[#059669]/25 active:translate-y-0 active:shadow-md flex items-center justify-center gap-2 cursor-pointer">
                {ripples.map((r) => (<span key={r.id} className="absolute rounded-full bg-white/40 pointer-events-none animate-ripple" style={{ left: r.x - 3, top: r.y - 3, width: 6, height: 6 }} />))}
                <span>Continuer</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ──────── Step 3 ──────── */}
      {step === 3 && (
        <form onSubmit={step3Form.handleSubmit(handleStep3)} noValidate>
          <div className="space-y-4">
            <div className="rounded-[10px] border-[1.5px] border-[#e5e7eb] bg-[#f9fafb] p-4 space-y-2">
              <h3 className="font-bold text-sm text-[#111827] mb-2">Vérifiez vos informations</h3>
              <div className="space-y-1.5">
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
                    <span className="text-[#6b7280] text-xs">{item.label}</span>
                    <span className="font-semibold text-[#111827] text-xs text-right">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-start gap-3 cursor-pointer group">
                <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-[#d1d5db] text-[#059669] focus:ring-[#059669]/30 accent-[#059669] cursor-pointer" {...step3Form.register('accept_terms')} />
                <span className="text-sm text-[#6b7280] group-hover:text-[#111827] transition-colors">
                  J&apos;accepte les <Link href="/terms" target="_blank" className="text-[#059669] hover:underline font-semibold">Conditions d&apos;utilisation</Link> et la <Link href="/privacy" target="_blank" className="text-[#059669] hover:underline font-semibold">Politique de confidentialité</Link>
                </span>
              </label>
              {step3Form.formState.errors.accept_terms && <p className="mt-1 text-xs text-[#dc2626]">{step3Form.formState.errors.accept_terms.message}</p>}
            </div>

            <div>
              <label className="flex items-start gap-3 cursor-pointer group">
                <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-[#d1d5db] text-[#059669] focus:ring-[#059669]/30 accent-[#059669] cursor-pointer" {...step3Form.register('accept_privacy')} />
                <span className="text-sm text-[#6b7280] group-hover:text-[#111827] transition-colors">J&apos;autorise AgriIntel à traiter mes données personnelles</span>
              </label>
              {step3Form.formState.errors.accept_privacy && <p className="mt-1 text-xs text-[#dc2626]">{step3Form.formState.errors.accept_privacy.message}</p>}
            </div>

            <div>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" className="h-4 w-4 rounded border-[#d1d5db] text-[#059669] focus:ring-[#059669]/30 accent-[#059669] cursor-pointer" {...step3Form.register('newsletter')} />
                <span className="text-sm text-[#6b7280] group-hover:text-[#111827] transition-colors">Recevoir des conseils et alertes météo</span>
              </label>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => goToStep(2)} disabled={isRegisterLoading} className="flex-1 h-[48px] rounded-[10px] text-sm font-semibold border-[1.5px] border-[#e5e7eb] bg-white text-[#6b7280] transition-all duration-200 hover:bg-[#f9fafb] hover:border-[#d1d5db] active:scale-[0.98] disabled:opacity-50 cursor-pointer">
                ← Retour
              </button>
              <button type="submit" disabled={isRegisterLoading} onClick={createRipple} className="relative flex-1 h-[48px] rounded-[10px] overflow-hidden bg-[#059669] text-white font-semibold text-[15px] transition-all duration-200 hover:bg-[#047857] hover:-translate-y-[1px] hover:shadow-lg hover:shadow-[#059669]/25 active:translate-y-0 active:shadow-md disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-2 cursor-pointer">
                {ripples.map((r) => (<span key={r.id} className="absolute rounded-full bg-white/40 pointer-events-none animate-ripple" style={{ left: r.x - 3, top: r.y - 3, width: 6, height: 6 }} />))}
                {isRegisterLoading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /><span>Inscription en cours...</span></>
                ) : (
                  <><Check className="h-4 w-4" /><span>Créer mon compte</span></>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Login Link */}
      <div className="mt-6 text-center">
        <p className="text-sm text-[#6b7280]">
          Déjà un compte ?{' '}
          <Link href="/login" className="font-semibold text-[#059669] hover:text-[#047857] transition-colors">
            Se connecter
          </Link>
        </p>
      </div>
    </motion.div>
  );
}

function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
