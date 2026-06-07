'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export function GoogleIcon({ size = 18 }: { size?: number }) {
  return (
    <svg style={{ width: size, height: size, flexShrink: 0 }} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

export function MicrosoftIcon({ size = 18 }: { size?: number }) {
  return (
    <svg style={{ width: size, height: size, flexShrink: 0 }} viewBox="0 0 23 23" aria-hidden="true">
      <rect x="1" y="1" width="10" height="10" fill="#F25022" />
      <rect x="12" y="1" width="10" height="10" fill="#7FBA00" />
      <rect x="1" y="12" width="10" height="10" fill="#00A4EF" />
      <rect x="12" y="12" width="10" height="10" fill="#FFB900" />
    </svg>
  );
}

export function AuthCardHeader({ title }: { title: string }) {
  return (
    <h1 className="mb-7 text-center text-[1.4rem] font-bold text-slate-800 tracking-tight">
      {title}
    </h1>
  );
}

export function AuthPrimaryButton({
  children,
  loading,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      type="submit"
      disabled={loading || props.disabled}
      className={cn(
        'mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-2xl',
        'bg-gradient-to-r from-emerald-600 to-emerald-500',
        'text-[15px] font-semibold text-white tracking-wide',
        'transition-all duration-200 hover:from-emerald-700 hover:to-emerald-600',
        'hover:shadow-lg hover:shadow-emerald-500/30 active:scale-[0.98]',
        'disabled:pointer-events-none disabled:opacity-60 cursor-pointer',
        className
      )}
      {...props}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  );
}

export function SocialLoginButton({
  provider,
  onClick,
  disabled,
  loading,
}: {
  provider: 'google' | 'microsoft';
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  const isGoogle = provider === 'google';
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        'flex h-11 w-full items-center justify-center gap-3 rounded-xl',
        'border text-sm font-medium',
        'transition-all duration-200',
        'active:scale-[0.97]',
        isGoogle
          ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm'
          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm',
        (disabled || loading) && 'opacity-50 cursor-not-allowed'
      )}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
      ) : isGoogle ? (
        <GoogleIcon size={18} />
      ) : (
        <MicrosoftIcon size={18} />
      )}
      <span>{isGoogle ? 'Google' : 'Microsoft'}</span>
    </button>
  );
}

export function AuthDivider({ text = "ou continuer avec" }: { text?: string }) {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-slate-200" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-white px-4 text-xs font-medium text-slate-400 uppercase tracking-widest">
          {text}
        </span>
      </div>
    </div>
  );
}

export function AuthFooterLink({
  text,
  linkText,
  href,
}: {
  text: string;
  linkText: string;
  href: string;
}) {
  return (
    <p className="mt-6 text-center text-sm text-slate-500">
      {text}{' '}
      <Link href={href} className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline transition-colors">
        {linkText}
      </Link>
    </p>
  );
}

export function AuthCheckbox({
  label,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className={cn("flex cursor-pointer items-center gap-2.5", className)}>
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500/30 accent-emerald-600"
        {...props}
      />
      <span className="text-sm text-slate-600">{label}</span>
    </label>
  );
}
