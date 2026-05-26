'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface AuthFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
  error?: string;
}

export const AuthField = React.forwardRef<HTMLInputElement, AuthFieldProps>(
  ({ className, leftIcon, rightElement, error, type = 'text', ...props }, ref) => {
    return (
      <div className="w-full">
        <div className="relative">
          {leftIcon && (
            <div className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-slate-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            type={type}
            className={cn(
              'flex h-12 w-full rounded-2xl border bg-slate-50/80 text-[15px] text-slate-900',
              'placeholder:text-slate-400',
              'transition-all duration-200',
              'focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-3 focus:ring-emerald-500/15',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error
                ? 'border-red-400 bg-red-50/40 focus:border-red-500 focus:ring-red-500/15'
                : 'border-slate-200 hover:border-slate-300',
              leftIcon ? 'pl-11' : 'pl-4',
              rightElement ? 'pr-11' : 'pr-4',
              className
            )}
            aria-invalid={!!error}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3 top-1/2 z-10 -translate-y-1/2">{rightElement}</div>
          )}
        </div>
        {error && (
          <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600" role="alert">
            <span>⚠</span> {error}
          </p>
        )}
      </div>
    );
  }
);
AuthField.displayName = 'AuthField';
