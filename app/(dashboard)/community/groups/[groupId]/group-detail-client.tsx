'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Users, UserPlus, UserMinus, MessageSquare, FileText,
  Settings, Bell, BellOff, Share2, ChevronLeft, Hash,
  Shield, ShieldCheck, Crown, LogOut, Calendar, MapPin,
  Clock, ExternalLink, Trash2
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { UserAvatar } from '@/components/ui/avatar';
import { PostCard } from '@/components/community/post-card';
import { PostComposer } from '@/components/community/post-composer';
import { CommentThread } from '@/components/community/comment-thread';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { GroupSettingsDialog } from '@/components/community/group-settings-dialog';
import {
  useGroup, useGroupPosts, useGroupMembers, useGroupMeetups, useCreateMeetup,
  useJoinGroup, useLeaveGroup,
  useRemoveGroupMember, useUpdateMemberRole,
} from '@/hooks/use-community';
import { useCreateConversation } from '@/hooks/use-messaging';
import { GroupThread } from '@/components/community/group-thread';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth-store';

type Tab = 'posts' | 'chat' | 'events' | 'members' | 'about';

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

const ROLE_ICONS: Record<string, React.ElementType> = {
  owner: Crown,
  admin: ShieldCheck,
  moderator: Shield,
};

const ROLE_OPTIONS = ['member', 'moderator', 'admin'];

export default function GroupDetailClient() {
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const router = useRouter();
  const pathname = usePathname();
  const groupId = pathname?.split('/community/groups/')?.[1]?.split('/')?.[0] ?? '_';
  const [tab, setTab] = useState<Tab>('posts');
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const { data: group, isLoading: groupLoading, isError: groupError } = useGroup(groupId);
  const { data: postsData, isLoading: postsLoading, fetchNextPage, hasNextPage } = useGroupPosts(groupId);
  const { data: members } = useGroupMembers(groupId);
  const { data: meetups } = useGroupMeetups(groupId);
  const join = useJoinGroup();
  const leave = useLeaveGroup();
  const removeMember = useRemoveGroupMember();
  const updateRole = useUpdateMemberRole();
  const createConversation = useCreateConversation();
  const [showRemoveConfirm, setShowRemoveConfirm] = useState<string | null>(null);
  const [showDeleteGroupConfirm, setShowDeleteGroupConfirm] = useState(false);
  const [showReportMember, setShowReportMember] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('');

  const posts = postsData?.pages.flatMap(p => p.data) ?? [];
  const isMember = group?.membership_status === 'member' || group?.membership_status === 'admin' || group?.membership_status === 'owner';
  const isAdmin = group?.membership_status === 'admin' || group?.membership_status === 'owner';
  const isOwner = group?.membership_status === 'owner';
  const sectorKey = (group?.sector ?? 'general') as keyof typeof SECTOR_COLORS;
  const gradientClass = SECTOR_COLORS[sectorKey] ?? SECTOR_COLORS.general;

  const TABS: { id: Tab; label: string; icon: React.ElementType; count?: number }[] = [
    { id: 'posts',   label: 'Publications', icon: FileText,      count: posts.length || undefined },
    { id: 'chat',    label: 'Chat',          icon: MessageSquare },
    { id: 'events',  label: 'Événements',    icon: Calendar,      count: meetups?.length },
    { id: 'members', label: 'Membres',       icon: Users,         count: group?.members_count },
    { id: 'about',   label: 'À propos',      icon: Hash },
  ];

  async function handleContactMember(userId: string) {
    try {
      const conv = await createConversation.mutateAsync({ userId });
      router.push(`/messages?conv=${conv.id}`);
    } catch {
      toast.error('Impossible de contacter ce membre');
    }
  }

  if (!mounted) return null;

  if (groupLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="h-48 bg-muted animate-pulse rounded-b-2xl" />
        <div className="p-6"><LoadingSkeleton variant="card" count={3} /></div>
      </div>
    );
  }

  if (groupError || !group) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-6">
          <Users className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold mb-2">Groupe introuvable</h2>
        <p className="text-muted-foreground mb-6">
          Ce groupe n&apos;existe pas ou vous n&apos;avez pas accès à cette ressource.
        </p>
        <Link href="/community" className="inline-flex items-center gap-2 text-sm font-semibold text-[#D97706] hover:underline">
          <ChevronLeft className="h-4 w-4" />
          Retour à la communauté
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <GroupSettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} group={group} />

      {/* Report Member Dialog */}
      <AlertDialog open={!!showReportMember} onOpenChange={(v) => { if (!v) setShowReportMember(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Signaler un membre</AlertDialogTitle>
            <AlertDialogDescription>
              Décrivez le problème rencontré avec ce membre. Un administrateur examinera votre signalement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3">
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Raison du signalement..."
              rows={3}
              className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowReportMember(null)}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              disabled={!reportReason.trim()}
              onClick={() => {
                toast.success('Signalement envoyé. Un administrateur va examiner votre demande.');
                setShowReportMember(null);
                setReportReason('');
              }}
            >
              Signaler
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Group Dialog */}
      <AlertDialog open={showDeleteGroupConfirm} onOpenChange={setShowDeleteGroupConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le groupe</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Toutes les publications, messages et données du groupe seront définitivement supprimés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteGroupConfirm(false)}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                leave.mutate(group.id);
                setShowDeleteGroupConfirm(false);
                router.push('/community');
                toast.success('Groupe supprimé avec succès');
              }}
            >
              Supprimer définitivement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Hero Banner ── */}
      <div className={cn('relative h-48 bg-gradient-to-br overflow-hidden', gradientClass)}>
        {group.banner && (
          <Image src={group.banner} alt="" fill sizes="100vw" className="object-cover opacity-60" />
        )}
        <Link href="/community" className="absolute top-4 left-4 flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-medium bg-black/25 hover:bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full transition-colors">
          <ChevronLeft className="h-4 w-4" />
          Communauté
        </Link>
        <div className="absolute top-4 right-4 flex gap-2">
          <button onClick={() => setMuted(!muted)} className="h-8 w-8 flex items-center justify-center bg-black/30 hover:bg-black/50 text-white rounded-full backdrop-blur-sm transition-colors">
            {muted ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
          </button>
          <button className="h-8 w-8 flex items-center justify-center bg-black/30 hover:bg-black/50 text-white rounded-full backdrop-blur-sm transition-colors">
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Group Identity Row ── */}
      <div className="px-6 pb-0 relative">
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
          <div className="flex gap-2 flex-shrink-0">
            {group.membership_status === 'none' && (
              <Button onClick={() => join.mutate(group.id)} disabled={join.isPending} className="gap-2 bg-[#064E3B] hover:bg-[#065f46]">
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
                {isAdmin && (
                  <Button variant="outline" size="icon" title="Paramètres du groupe" onClick={() => setSettingsOpen(true)}>
                    <Settings className="h-4 w-4" />
                  </Button>
                )}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="gap-2 border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20">
                      <LogOut className="h-4 w-4" /> Quitter
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Quitter le groupe ?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Vous ne pourrez plus voir les publications et messages de ce groupe.
                        {group.membership_status === 'owner' && (
                          <span className="block mt-2 text-amber-600 font-semibold">
                            Vous êtes le fondateur. Le groupe sera supprimé si vous le quittez.
                          </span>
                        )}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => leave.mutate(group.id)}>
                        {group.membership_status === 'owner' ? 'Supprimer le groupe' : 'Quitter'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
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
              {t.count !== undefined && t.count > 0 && (
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
              <EmptyState icon="📝" title="Aucune publication" description={isMember ? 'Rédigez la première publication de ce groupe.' : 'Rejoignez le groupe pour voir et publier du contenu.'} />
            ) : (
              posts.map(post => (
                <div key={post.id} className="space-y-3">
                  <PostCard post={post} onComment={() => setExpandedPost(expandedPost === post.id ? null : post.id)} />
                  {expandedPost === post.id && (
                    <div className="ml-4 pl-4 border-l-2 border-border">
                      <CommentThread postId={post.id} />
                    </div>
                  )}
                </div>
              ))
            )}
            {hasNextPage && (
              <Button variant="outline" className="w-full" onClick={() => fetchNextPage()}>Charger plus de publications</Button>
            )}
          </div>
        )}

        {/* Chat */}
        {tab === 'chat' && <GroupThread groupId={groupId} />}

        {/* Événements */}
        {tab === 'events' && (
          <EventsTab groupId={groupId} isMember={isMember} />
        )}

        {/* Members */}
        {tab === 'members' && (
          <div className="space-y-2">
            {!members || members.length === 0 ? (
              <EmptyState icon="👥" title="Aucun membre" description="Le groupe ne compte aucun membre pour l'instant." />
            ) : (
              members.map(m => {
                const RoleIcon = ROLE_ICONS[m.role];
                const canManage = isAdmin && m.role !== 'owner' && m.role !== group.membership_status;
                return (
                  <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:border-border/80 transition-colors">
                    <UserAvatar src={m.avatar} name={m.name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate flex items-center gap-1.5">
                        {m.name}
                        {m.role === 'owner' && <Crown className="h-3.5 w-3.5 text-amber-500" />}
                      </p>
                      {m.country && <p className="text-xs text-muted-foreground">{m.country}</p>}
                    </div>

                    {m.role && (
                      <span className={cn(
                        'text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full flex items-center gap-1',
                        m.role === 'owner' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40' :
                        m.role === 'admin' ? 'bg-violet-100 text-violet-700 dark:bg-violet-950/40' :
                        m.role === 'moderator' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/40' :
                        'bg-muted text-muted-foreground'
                      )}>
                        {RoleIcon && <RoleIcon className="h-3 w-3" />}
                        {ROLE_LABELS[m.role] ?? m.role}
                      </span>
                    )}

                    {isMember && m.user_id && m.user_id !== user?.id && (
                      <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-8" onClick={() => handleContactMember(m.user_id)}>
                        <MessageSquare className="h-3 w-3" /> Contacter
                      </Button>
                    )}

                    {canManage && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                            <Settings className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          {isOwner && m.role !== 'owner' && (
                            <>
                              <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                Changer le rôle
                              </div>
                              {ROLE_OPTIONS.filter(r => r !== m.role).map(r => (
                                <DropdownMenuItem key={r} onClick={() => updateRole.mutate({ groupId, userId: m.id, role: r })} className="gap-2 text-sm">
                                  {r === 'admin' ? <ShieldCheck className="h-3.5 w-3.5" /> : r === 'moderator' ? <Shield className="h-3.5 w-3.5" /> : null}
                                  {ROLE_LABELS[r] ?? r}
                                </DropdownMenuItem>
                              ))}
                              <div className="h-px bg-border my-1" />
                            </>
                          )}
                          <DropdownMenuItem
                            onClick={() => setShowRemoveConfirm(m.id)}
                            className="gap-2 text-sm text-red-600 focus:text-red-600"
                          >
                            <UserMinus className="h-3.5 w-3.5" /> Retirer du groupe
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => { setShowReportMember(m.user_id || m.id); setReportReason(''); }}
                            className="gap-2 text-sm text-amber-600 focus:text-amber-600"
                          >
                            <Shield className="h-3.5 w-3.5" /> Signaler ce membre
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                    {showRemoveConfirm === m.id && (
                      <AlertDialog open onOpenChange={() => setShowRemoveConfirm(null)}>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Retirer {m.name} ?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Cette action est irréversible. Le membre devra refaire une demande pour rejoindre le groupe.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setShowRemoveConfirm(null)}>Annuler</AlertDialogCancel>
                            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => {
                              removeMember.mutate({ groupId, userId: m.id });
                              setShowRemoveConfirm(null);
                            }}>Retirer</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                );
              })
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
                      <span key={t} className="text-xs font-medium px-2.5 py-1 rounded-full bg-muted border border-border"># {t}</span>
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

        {/* Owner actions */}
        {isOwner && tab === 'about' && (
          <div className="mt-8 pt-6 border-t border-border">
            <h3 className="text-xs font-bold uppercase tracking-widest text-red-500 mb-3">Zone dangereuse</h3>
            <Button
              variant="outline"
              className="gap-2 border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
              onClick={() => setShowDeleteGroupConfirm(true)}
            >
              <Trash2 className="h-4 w-4" /> Supprimer le groupe
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Events Tab ──────────────────────────────────────────────────────────── */

function EventsTab({ groupId, isMember }: { groupId: string; isMember: boolean }) {
  const { data: meetups } = useGroupMeetups(groupId);
  const createMeetup = useCreateMeetup();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [meetingUrl, setMeetingUrl] = useState('');
  const [eventType, setEventType] = useState<string>('physical');

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !date) return;
    await createMeetup.mutateAsync({
      groupId, title: title.trim(), description, date,
      time: time || undefined, end_time: endTime || undefined,
      location: location || undefined, meeting_url: meetingUrl || undefined,
      event_type: eventType,
    });
    setTitle(''); setDescription(''); setDate(''); setTime(''); setEndTime('');
    setLocation(''); setMeetingUrl(''); setEventType('physical');
    setShowForm(false);
  }

  return (
    <div className="space-y-4">
      {isMember && (
        <>
          {showForm ? (
            <form onSubmit={handleCreate} className="rounded-2xl border border-border bg-card p-5 space-y-3">
              <h3 className="font-bold">Nouvel événement</h3>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Titre de l'événement" required />
              <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description (optionnelle)" rows={2} />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 block">Date</label>
                  <Input type="date" value={date} onChange={e => setDate(e.target.value)} required />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 block">Type</label>
                  <select value={eventType} onChange={e => setEventType(e.target.value)} className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                    <option value="physical">Physique</option>
                    <option value="online">En ligne</option>
                    <option value="hybrid">Hybride</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 block">Heure début</label>
                  <Input type="time" value={time} onChange={e => setTime(e.target.value)} />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 block">Heure fin</label>
                  <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
                </div>
              </div>
              <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="Lieu (ex: Paris, AgroParisTech)" />
              {eventType !== 'physical' && (
                <Input value={meetingUrl} onChange={e => setMeetingUrl(e.target.value)} placeholder="Lien de réunion (Zoom, Teams, etc.)" type="url" />
              )}
              <div className="flex gap-2 pt-1">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowForm(false)}>Annuler</Button>
                <Button type="submit" className="flex-1 bg-[#064E3B] hover:bg-[#065f46] gap-2" disabled={createMeetup.isPending}>
                  <Calendar className="h-4 w-4" /> Créer l'événement
                </Button>
              </div>
            </form>
          ) : (
            <Button variant="outline" className="w-full gap-2" onClick={() => setShowForm(true)}>
              <Calendar className="h-4 w-4" /> Organiser un événement
            </Button>
          )}
        </>
      )}

      {!meetups || meetups.length === 0 ? (
        <EmptyState icon="📅" title="Aucun événement" description={isMember ? 'Organisez le premier événement du groupe !' : 'Rejoignez le groupe pour voir les événements.'} />
      ) : (
        meetups.map(meetup => {
          const meta = meetup.metadata ?? {};
          const rawDate = meta.event_date;
          if (!rawDate) return null;
          const eventDate = new Date(rawDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
          return (
            <div key={meetup.id} className="rounded-2xl border border-border bg-card overflow-hidden">
              {meta.banner && (
                <div className="relative h-36">
                  <Image src={meta.banner} alt="" fill className="object-cover" />
                </div>
              )}
              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-lg">{meetup.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Organisé par {meetup.author_name}</p>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {meta.event_type === 'online' ? 'En ligne' : meta.event_type === 'hybrid' ? 'Hybride' : 'Physique'}
                  </Badge>
                </div>

                {meetup.content && <p className="text-sm text-muted-foreground">{meetup.content}</p>}

                <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{eventDate}</span>
                  {meta.event_time && <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{meta.event_time}{meta.event_end_time ? ` - ${meta.event_end_time}` : ''}</span>}
                  {meta.location && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{meta.location}</span>}
                  {meta.meeting_url && (
                    <a href={meta.meeting_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[#D97706] hover:underline">
                      <ExternalLink className="h-3.5 w-3.5" /> Lien de réunion
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
