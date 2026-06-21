import AlertDetailClient from './alert-detail-client';

export function generateStaticParams() {
  return [{ id: '_' }];
}

export default function AlertDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <AlertDetailClient params={params} />;
}
