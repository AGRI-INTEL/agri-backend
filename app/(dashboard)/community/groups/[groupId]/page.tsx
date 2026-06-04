'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Users, UserPlus, UserMinus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

export default function GroupDetailPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const [expandedPost, setExpandedPost] = useState<string | null>(null);

  const { data: group, isLoading: groupLoading } = useGroup(groupId);
  const { data: postsData, isLoading: postsLoading, fetchNextPage, hasNextPage } = useGroupPosts(groupId);
  const { data: members, isLoading: membersLoading } = useGroupMembers(groupId);
  const join = useJoinGroup();
  const leave = useLeaveGroup();

  const posts = postsData?.pages.flatMap((p) => p.data) || [];

  if (groupLoading) return <LoadingSkeleton variant="card" count={3} className="p-6" />;
  if (!group) return null;

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      {/* Group header */}
      <div className="rounded-card border border-border overflow-hidden bg-card">
        <div className="h-32 bg-gradient-to-br from-primary/20 to-secondary/20 relative">
          {group.banner && (
            <Image
              src={group.banner}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
            />
          )}
        </div>
        <div className="px-4 pb-4">
          <div className="flex items-end justify-between -mt-8 mb-3">
            <div className="h-16 w-16 rounded-xl border-4 border-card bg-primary/10 flex items-center justify-center overflow-hidden relative">
              {group.avatar ? (
                <Image
                  src={group.avatar}
                  alt={group.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              ) : (
                <Users className="h-8 w-8 text-primary" />
              )}
            </div>
            <div className="flex gap-2 mt-2">
              {group.membership_status === 'none' && (
                <Button size="sm" onClick={() => join.mutate(group.id)} loading={join.isPending} className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  Rejoindre
                </Button>
              )}
              {group.membership_status === 'member' && (
                <Button size="sm" variant="outline" className="gap-2 border-red-200 text-red-600 hover:bg-red-50" onClick={() => leave.mutate(group.id)} disabled={leave.isPending}>
                  <UserMinus className="h-4 w-4" />
                  Quitter
                </Button>
              )}
            </div>
          </div>
          <h1 className="text-xl font-bold">{group.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-xs">{group.type}</Badge>
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Users className="h-3 w-3" />
              {group.members_count} membres
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">{group.description}</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="posts">
        <TabsList className="w-full">
          <TabsTrigger value="posts" className="flex-1">Publications</TabsTrigger>
          <TabsTrigger value="chat" className="flex-1">Chat</TabsTrigger>
          <TabsTrigger value="members" className="flex-1">Membres</TabsTrigger>
          <TabsTrigger value="about" className="flex-1">À propos</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-4 mt-4">
          {(group.membership_status === 'member' || group.membership_status === 'admin' || group.membership_status === 'owner') && (
            <PostComposer groupId={groupId} />
          )}

          {postsLoading ? (
            <LoadingSkeleton variant="card" count={3} />
          ) : posts.length === 0 ? (
            <EmptyState icon="📝" title="Aucune publication" description="Soyez le premier à publier dans ce groupe." />
          ) : (
            posts.map((post) => (
              <div key={post.id} className="space-y-2">
                <PostCard
                  post={post}
                  onComment={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                />
                {expandedPost === post.id && (
                  <div className="pl-4 border-l-2 border-border">
                    <CommentThread postId={post.id} />
                  </div>
                )}
              </div>
            ))
          )}

          {hasNextPage && (
            <Button variant="outline" className="w-full" onClick={() => fetchNextPage()}>
              Charger plus
            </Button>
          )}
        </TabsContent>

        <TabsContent value="chat" className="space-y-4 mt-4">
          <GroupThread groupId={groupId} />
        </TabsContent>

        <TabsContent value="members" className="mt-4">
          <div className="space-y-2">
            {(members || []).map((m) => (
              <div key={m.id} className="flex items-center gap-3 p-3 rounded-card border border-border bg-card">
                <UserAvatar src={m.avatar} name={m.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{m.name}</p>
                  <p className="text-xs text-muted-foreground">{m.country}</p>
                </div>
                <Badge variant="outline" className="text-xs">{m.role}</Badge>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="about" className="mt-4">
          <div className="rounded-card border border-border bg-card p-4 space-y-3">
            <div>
              <h3 className="text-sm font-semibold mb-1">Description</h3>
              <p className="text-sm text-muted-foreground">{group.description}</p>
            </div>
            {group.tags.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-2">Tags</h3>
                <div className="flex flex-wrap gap-1">
                  {group.tags.map((t) => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
