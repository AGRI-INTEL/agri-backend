import type { Metadata } from 'next';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { FileExplorer } from '@/components/files/file-explorer';

export const metadata: Metadata = { title: 'Gestion Fichiers' };

export default function FilesPage() {
  return (
    <PageWrapper title="Mes Fichiers" description="Gérez vos photos, vidéos, documents et rapports">
      <div className="h-[calc(100vh-200px)]">
        <FileExplorer />
      </div>
    </PageWrapper>
  );
}
