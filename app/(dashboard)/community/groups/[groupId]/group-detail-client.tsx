'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import {
  Users, UserPlus, UserMinus, MessageSquare, FileText,
  Settings, Bell, BellOff, Share2, ChevronLeft, Hash
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserAvatar } from '@/components/ui/avatar';
import { PostCard } from '@/components/community/post-card';
import { PostComposer } from '@/components/community/post-composer';
import { CommentThread } from '@/components/community/comment-thread';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { useGroup, useGroupPosts, useGroupMembers, useJoinGroup, useLeaveGroup } from '@/hooks/use-community';
import { GroupThread } from '@/components/community/group-thread';
import { cn } from '@/lib/utils';

type Tab = 'posts' | 'chat' | 'members' | 'about';

const ROLE_LABELS: Record<string, string> = {
  owner: 'Fondateur',
  admin: 'Admin',
  moderator: 'Modérateur',
  member: 'Membre',
  guest: 'Invité',
};

const SECTOR_COLORS: Record<string, string> = {
  general: 'from-indigo-700/80 to-indigo-950/90',
  vegetal: 'from-green-700/80 to-green-950/90',
  animal: 'from-amber-700/80 to-amber-950/90',
  halieutique: 'from-blue-700/80 to-blue-950/90',
  forestier: 'from-[#064E3B]/80 to-[#021f18]/95',
};

export default function GroupDetailClient() {
  // In static export, useParams() always returns the build-time value ('_').
  // Read the real UUID from the URL instead.
  const pathname = usePathname();
  const groupId = pathname?.split('/community/groups/')?.[1]?.split('/')?.[0] ?? '_';
  const [tab, setTab] = useState<Tab>('posts');
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);

  const { data: group, isLoading: groupLoading } = useGroup(groupId);
  const { data: postsData, isLoading: postsLoading, fetchNextPage, hasNextPage } = useGroupPosts(groupId);
  const { data: members } = useGroupMembers(groupId);
  const join = useJoinGroup();
  const leave = useLeaveGroup();

  const posts = postsData?.pages.flatMap(p => p.data) ?? [];
  const isMember = group?.membership_status === 'member' || group?.membership_status === 'admin' || group?.membership_status === 'owner';
  const sectorKey = (group?.sector ?? 'general') as keyof typeof SECTOR_COLORS;
  const gradientClass = SECTOR_COLORS[sectorKey] ?? SECTOR_COLORS.general;

  const TABS: { id: Tab; label: string; icon: React.ElementType; count?: number }[] = [
    { id: 'posts',   label: 'Publications', icon: FileText,      count: posts.length || undefined },
    { id: 'chat',    label: 'Chat',          icon: MessageSquare },
    { id: 'members', label: 'Membres',       icon: Users,         count: group?.members_count },
    { id: 'about',   label: 'À propos',      icon: Hash },
  ];

  if (groupLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="h-48 bg-muted animate-pulse rounded-b-2xl" />
        <div className="p-6"><LoadingSkeleton variant="card" count={3} /></div>
      </div>
    );
  }
  if (!group) return null;

  return (
    <div className="max-w-4xl mx-auto">
      {/* ── Hero Banner ── */}
      <div className={cn('relative h-48 bg-gradient-to-br overflow-hidden', gradientClass)}>
        {group.banner && (
          <Image src={group.banner} alt="" fill sizes="100vw" className="object-cover opacity-60" />
        )}
        {/* Back nav */}
        <Link href="/community" className="absolute top-4 left-4 flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-medium bg-black/25 hover:bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full transition-colors">
          <ChevronLeft className="h-4 w-4" />
          Communauté
        </Link>
        {/* Actions */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={() => setMuted(!muted)}
            className="h-8 w-8 flex items-center justify-center bg-black/30 hover:bg-black/50 text-white rounded-full backdrop-blur-sm transition-colors"
          >
            {muted ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
          </button>
          <button className="h-8 w-8 flex items-center justify-center bg-black/30 hover:bg-black/50 text-white rounded-full backdrop-blur-sm transition-colors">
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Group Identity Row ── */}
      <div className="px-6 pb-0 relative">
        {/* Avatar overlapping banner */}
        <div className="absolute -top-8 left-6">
          <div className="h-20 w-20 rounded-2xl border-4 border-background shadow-xl overflow-hidden relative bg-card flex items-center justify-center">
            {group.avatar
              ? <Image src={group.avatar} alt={group.name} fill sizes="80px" className="object-cover" />
              : <div className={cn('absolute inset-0 flex items-center justify-center bg-gradient-to-br text-2xl', gradientClass)}>
                  <Users className="h-8 w-8 text-white" />
                </div>
            }
          </div>
        </div>

        <div className="pt-14 pb-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black tracking-tight">{group.name}</h1>
              {group.type && (
                <Badge variant="outline" className="text-xs font-semibold capitalize">{group.type}</Badge>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1.5 text-sm text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1.5"><Users className="h-4 w-4" />{group.members_count.toLocaleString('fr-FR')} membres</span>
              {group.posts_count !== undefined && (
                <span className="flex items-center gap-1.5"><MessageSquare className="h-4 w-4" />{group.posts_count} publications</span>
              )}
            </div>
          </div>
          {/* Membership CTA */}
          <div className="flex gap-2 flex-shrink-0">
            {group.membership_status === 'none' && (
              <Button
                onClick={() => join.mutate(group.id)}
                disabled={join.isPending}
                className="gap-2 bg-[#064E3B] hover:bg-[#065f46]"
              >
                <UserPlus className="h-4 w-4" />
                {group.requires_approval ? 'Demander à rejoindre' : 'Rejoindre'}
              </Button>
            )}
            {group.membership_status === 'pending' && (
              <span className="flex items-center px-4 py-2 text-sm font-semibold text-amber-700 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200">
                Demande en attente
              </span>
            )}
            {isMember && (
              <>
                {(group.membership_status === 'admin' || group.membership_status === 'owner') && (
                  <Button variant="outline" size="icon" title="Paramètres du groupe">
                    <Settings className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="gap-2 border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                  onClick={() => leave.mutate(group.id)}
                  disabled={leave.isPending}
                >
                  <UserMinus className="h-4 w-4" />
                  Quitter
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Sticky Tabs ── */}
      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-md border-b border-border px-6">
        <div className="flex gap-1 overflow-x-auto scrollbar-none">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'flex items-center gap-2 px-3 py-3.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors',
                tab === t.id
                  ? 'border-[#D97706] text-[#D97706]'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
              {t.count !== undefined && (
                <span className={cn(
                  'text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center',
                  tab === t.id ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' : 'bg-muted text-muted-foreground'
                )}>
                  {t.count > 99 ? '99+' : t.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab Content ── */}
      <div className="p-6">

        {/* Publications */}
        {tab === 'posts' && (
          <div className="space-y-4">
            {isMember && <PostComposer groupId={groupId} />}

            {postsLoading ? (
              <LoadingSkeleton variant="card" count={3} />
            ) : posts.length === 0 ? (
              <EmptyState
                icon="📝"
                title="Aucune publication"
                description={isMember ? 'Rédigez la première publication de ce groupe.' : 'Rejoignez le groupe pour voir et publier du contenu.'}
              />
            ) : (
              posts.map(post => (
                <div key={post.id} className="space-y-3">
                  <PostCard
                    post={post}
                    onComment={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                  />
                  {expandedPost === post.id && (
                    <div className="ml-4 pl-4 border-l-2 border-border">
                      <CommentThread postId={post.id} />
                    </div>
                  )}
                </div>
              ))
            )}
            {hasNextPage && (
              <Button variant="outline" className="w-full" onClick={() => fetchNextPage()}>
                Charger plus de publications
              </Button>
            )}
          </div>
        )}

        {/* Chat */}
        {tab === 'chat' && <GroupThread groupId={groupId} />}

        {/* Members */}
        {tab === 'members' && (
          <div className="space-y-2">
            {!members || members.length === 0 ? (
              <EmptyState icon="👥" title="Aucun membre" description="Le groupe ne compte aucun membre pour l'instant." />
            ) : (
              members.map(m => (
                <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:border-border/80 transition-colors">
                  <UserAvatar src={m.avatar} name={m.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{m.name}</p>
                    {m.country && <p className="text-xs text-muted-foreground">{m.country}</p>}
                  </div>
                  {m.role && m.role !== 'member' && (
                    <span className={cn(
                      'text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full',
                      m.role === 'owner' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40' :
                      m.role === 'admin' ? 'bg-violet-100 text-violet-700 dark:bg-violet-950/40' :
                      'bg-muted text-muted-foreground'
                    )}>
                      {ROLE_LABELS[m.role] ?? m.role}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* About */}
        {tab === 'about' && (
          <div className="max-w-xl space-y-5">
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Description</h3>
                <p className="text-sm leading-relaxed">{group.description || 'Aucune description fournie.'}</p>
              </div>

              {group.tags?.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {group.tags.map(t => (
                      <span key={t} className="text-xs font-medium px-2.5 py-1 rounded-full bg-muted border border-border">
                        # {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {group.rules && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Règles du groupe</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{group.rules}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
                {[
                  { label: 'Type', value: group.type },
                  { label: 'Secteur', value: group.sector },
                  { label: 'Membres', value: group.members_count?.toLocaleString('fr-FR') },
                  { label: 'Approbation', value: group.requires_approval ? 'Requise' : 'Libre' },
                ].filter(i => i.value).map(item => (
                  <div key={item.label}>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{item.label}</p>
                    <p className="text-sm font-semibold capitalize mt-0.5">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
