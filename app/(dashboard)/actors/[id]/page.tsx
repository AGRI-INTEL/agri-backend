import ActorDetailClient from './actor-detail-client';

export function generateStaticParams() {
  return [{ id: '_' }];
}

export default function ActorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <ActorDetailClient params={params} />;
}
