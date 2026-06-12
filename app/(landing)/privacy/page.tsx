import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Politique de Confidentialité',
  description: 'Politique de confidentialité de la plateforme AgriIntel360.',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Politique de Confidentialité</h1>
      <p className="mb-4">Dernière mise à jour : 11 juin 2026</p>
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">1. Collecte des données</h2>
        <p>Nous collectons les données nécessaires au bon fonctionnement de nos services agricoles.</p>
      </section>
      {/* Contenu simplifié pour le MVP */}
      <p>Le contenu complet sera disponible prochainement.</p>
    </div>
  );
}
