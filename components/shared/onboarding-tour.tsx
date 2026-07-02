'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from '@/lib/motion';
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useOnboarding } from '@/hooks/use-onboarding';

interface OnboardingTourProps {
  show: boolean;
}

export function OnboardingTour({ show }: OnboardingTourProps) {
  const { currentStep, total, current, next, prev, complete, skip } = useOnboarding();

  useEffect(() => {
    if (!show || !current) return;
    const el = document.querySelector(current.target);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [show, current, currentStep]);

  if (!show || !current) return null;

  const isLast = currentStep === total - 1;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60" onClick={skip} />

        {/* Tooltip */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative z-10 max-w-sm w-full mx-4 rounded-2xl p-6 shadow-2xl"
          style={{
            background: '#152219',
            border: '1px solid rgba(196,146,58,0.2)',
          }}
        >
          {/* Progress bar */}
          <div className="flex gap-1 mb-4">
            {Array.from({ length: total }).map((_, i) => (
              <div
                key={i}
                className="h-1 flex-1 rounded-full transition-all"
                style={{
                  background: i <= currentStep ? '#C4923A' : 'rgba(196,146,58,0.15)',
                }}
              />
            ))}
          </div>

          <button
            onClick={skip}
            className="absolute top-3 right-3 p-1 rounded-lg transition-colors"
            style={{ color: '#5E7A68' }}
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Content */}
          <div className="mb-2" style={{ color: '#E4DBC8' }}>
            <h3 className="text-lg font-bold">{current.title}</h3>
          </div>
          <p className="text-sm mb-6" style={{ color: '#7D9486' }}>{current.description}</p>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium" style={{ color: '#5E7A68' }}>
              {currentStep + 1} / {total}
            </span>
            <div className="flex gap-2">
              {currentStep > 0 && (
                <button
                  onClick={prev}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: 'rgba(196,146,58,0.1)',
                    color: '#C4923A',
                  }}
                >
                  <ChevronLeft className="h-3 w-3" />
                  Précédent
                </button>
              )}
              {isLast ? (
                <button
                  onClick={complete}
                  className="flex items-center gap-1 px-4 py-1.5 rounded-lg text-xs font-bold transition-all"
                  style={{
                    background: '#C4923A',
                    color: '#0C1810',
                  }}
                >
                  <Check className="h-3 w-3" />
                  Terminer
                </button>
              ) : (
                <button
                  onClick={next}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                  style={{
                    background: '#C4923A',
                    color: '#0C1810',
                  }}
                >
                  Suivant
                  <ChevronRight className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
