'use client';

import { Component, type ReactNode } from 'react';
import { Button } from './button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    this.props.onRetry?.();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex flex-col items-center justify-center gap-4 py-20 px-4 text-center">
          <div className="rounded-full bg-red-50 p-4">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Une erreur est survenue</h3>
          <p className="text-sm text-slate-500 max-w-md">
            {this.state.error?.message || 'Le chargement de cette section a échoué.'}
          </p>
          <Button onClick={this.handleRetry} variant="outline" className="gap-2 rounded-xl">
            <RefreshCw className="h-4 w-4" />
            Réessayer
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
