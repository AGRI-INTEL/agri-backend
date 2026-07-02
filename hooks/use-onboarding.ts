'use client';

import { useState, useCallback } from 'react';

interface OnboardingStep {
  target: string;
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const STEPS: OnboardingStep[] = [
  {
    target: '#main-content',
    title: '🎯 Bienvenue sur AgriIntel360 !',
    description: 'Votre plateforme complète pour l\'intelligence agricole en Afrique. Découvrons ensemble les fonctionnalités clés.',
    position: 'bottom',
  },
  {
    target: '[aria-label="Dashboard"]',
    title: '📊 Tableau de bord',
    description: 'Visionnez en un coup d\'œil les indicateurs clés, les alertes récentes et l\'activité de votre communauté.',
    position: 'right',
  },
  {
    target: '[href="/alerts"]',
    title: '🔔 Alertes intelligentes',
    description: 'Recevez des notifications personnalisées sur les crises, opportunités et changements de prix.',
    position: 'right',
  },
  {
    target: '[href="/chatbot"]',
    title: '🤖 AgriBot IA',
    description: 'Posez toutes vos questions agronomiques à notre assistant IA disponible 24h/24.',
    position: 'right',
  },
  {
    target: '[href="/community"]',
    title: '🌍 Communauté',
    description: 'Échangez avec des milliers d\'agriculteurs, coopératives et experts à travers l\'Afrique.',
    position: 'right',
  },
];

const ONBOARDING_KEY = 'agriintel360-onboarding-complete';

export function useOnboarding() {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const start = useCallback(() => {
    setIsActive(true);
    setCurrentStep(0);
  }, []);

  const next = useCallback(() => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      complete();
    }
  }, [currentStep]);

  const prev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  }, [currentStep]);

  const complete = useCallback(() => {
    setIsActive(false);
    setCurrentStep(0);
    try {
      localStorage.setItem(ONBOARDING_KEY, 'true');
    } catch {}
  }, []);

  const skip = useCallback(() => {
    complete();
  }, [complete]);

  const shouldShowOnboarding = useCallback(() => {
    try {
      return localStorage.getItem(ONBOARDING_KEY) !== 'true';
    } catch {
      return true;
    }
  }, []);

  return {
    isActive,
    currentStep,
    current: STEPS[currentStep],
    total: STEPS.length,
    start,
    next,
    prev,
    complete,
    skip,
    shouldShowOnboarding,
  };
}
