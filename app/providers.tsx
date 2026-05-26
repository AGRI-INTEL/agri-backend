'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';
import { queryClient } from '@/lib/query-client';
import { AuthHydrator } from '@/components/auth/auth-hydrator';
import { useUIStore } from '@/stores/ui-store';
import { useEffect } from 'react';

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useUIStore();

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
    }
  }, [theme]);

  return <>{children}</>;
}

function ProductionConsoleGuard({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      return;
    }

    const originalWarn = console.warn;
    const originalError = console.error;
    const devtoolsMatch = /(React DevTools|react-devtools|download.*React DevTools)/i;

    console.warn = (...args: unknown[]) => {
      if (args.some((value) => typeof value === 'string' && devtoolsMatch.test(value))) {
        return;
      }
      originalWarn(...args);
    };

    console.error = (...args: unknown[]) => {
      if (args.some((value) => typeof value === 'string' && devtoolsMatch.test(value))) {
        return;
      }
      originalError(...args);
    };

    return () => {
      console.warn = originalWarn;
      console.error = originalError;
    };
  }, []);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ProductionConsoleGuard>
        <ThemeProvider>
          <AuthHydrator />
          {children}
          <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              classNames: {
                toast: 'rounded-card shadow-card',
              },
            }}
          />
        </ThemeProvider>
      </ProductionConsoleGuard>
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
