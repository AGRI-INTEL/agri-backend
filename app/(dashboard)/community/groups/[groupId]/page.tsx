import GroupDetailClient from './group-detail-client';

export function generateStaticParams() {
  return [{ groupId: '_' }];
}

export default function GroupDetailPage() {
  return <GroupDetailClient />;
}
