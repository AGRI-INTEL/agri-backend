import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Conditions d\'Utilisation',
  description: 'Conditions d\'utilisation de la plateforme AgriIntel360.',
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Conditions d&apos;Utilisation</h1>
      <p className="mb-4">Dernière mise à jour : 11 juin 2026</p>
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">1. Acceptation des conditions</h2>
        <p>En accédant à AgriIntel360, vous acceptez d&apos;être lié par ces conditions d&apos;utilisation.</p>
      </section>
      {/* Contenu simplifié pour le MVP */}
      <p>Le contenu complet sera disponible prochainement.</p>
    </div>
  );
}
