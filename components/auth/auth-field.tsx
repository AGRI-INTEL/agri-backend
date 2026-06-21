'use client';

import * as React from 'react';

export interface AuthFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
  error?: string;
}

export const AuthField = React.forwardRef<HTMLInputElement, AuthFieldProps>(
  ({ className, leftIcon, rightElement, error, type = 'text', style, ...props }, ref) => {
    return (
      <div className="w-full">
        <div className="relative">
          {leftIcon && (
            <div
              className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 transition-colors duration-200"
              style={{ color: error ? '#f87171' : 'rgba(196,146,58,0.45)' }}
            >
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            type={type}
            className={`flex h-12 w-full rounded-xl text-[15px] transition-all duration-200 outline-none disabled:cursor-not-allowed disabled:opacity-50 ${className ?? ''}`}
            style={{
              background: '#0C1810',
              color: '#E8E0CC',
              border: `1.5px solid ${error ? 'rgba(248,113,113,0.60)' : 'rgba(196,146,58,0.22)'}`,
              paddingLeft: leftIcon ? '2.75rem' : '1rem',
              paddingRight: rightElement ? '2.75rem' : '1rem',
              ...style,
            }}
            onFocus={e => {
              if (!error) {
                e.currentTarget.style.borderColor = '#C4923A';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(196,146,58,0.14)';
              }
            }}
            onBlur={e => {
              e.currentTarget.style.boxShadow = 'none';
              if (!error) e.currentTarget.style.borderColor = 'rgba(196,146,58,0.22)';
            }}
            aria-invalid={!!error}
            placeholder={props.placeholder}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3 top-1/2 z-10 -translate-y-1/2">{rightElement}</div>
          )}
        </div>
        {error && (
          <p
            className="mt-1.5 flex items-center gap-1 text-xs"
            role="alert"
            style={{ color: '#f87171' }}
            data-testid={props.id ? `${props.id}-error` : undefined}
          >
            <span aria-hidden>⚠</span> {error}
          </p>
        )}
      </div>
    );
  }
);
AuthField.displayName = 'AuthField';
