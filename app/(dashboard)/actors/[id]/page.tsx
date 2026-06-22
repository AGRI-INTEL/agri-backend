import ActorRedirect from './redirect';

export function generateStaticParams() { return [{ id: '_' }]; }
export const dynamicParams = false;

export default function ActorDetailPage() {
  return <ActorRedirect />;
}
