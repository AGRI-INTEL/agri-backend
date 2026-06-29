'use client';

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { Group, Post, Comment, Member } from '@/types/community';
import type { PaginatedResponse } from '@/types/api';
import { toast } from 'sonner';

function mapBackendGroup(g: any): Group {
  return {
    id: g.id,
    name: g.name,
    slug: g.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') || `group-${g.id}`,
    description: g.description || '',
    type: g.type || 'public',
    sector: g.sector || 'general',
    avatar: g.avatar_url || g.avatar,
    banner: g.banner_url || g.banner,
    tags: g.tags || [],
    members_count: g.members_count ?? g.member_count ?? 0,
    posts_count: g.posts_count ?? g.post_count ?? 0,
    is_member: g.is_member ?? false,
    membership_status: g.membership_status || (g.is_member ? 'member' : 'none'),
    requires_approval: g.requires_approval ?? false,
    moderated: g.moderated ?? false,
    created_at: g.created_at,
    created_by: g.created_by,
    updated_at: g.updated_at,
    rules: g.rules,
    country: g.country,
    region: g.region,
    city: g.city,
  } as Group;
}

function mapBackendPost(p: any): Post {
  return {
    id: p.id,
    group_id: p.group_id,
    author: p.author ?? {
      id: p.author_id ?? '',
      name: p.author_name ?? 'Anonyme',
      avatar: p.author_avatar ?? undefined,
      role: p.author_role ?? '',
    },
    content: p.content ?? '',
    media: p.attachments?.map((a: any) => ({
      id: a.id,
      type: (a.file_type as any) ?? 'document',
      url: a.storage_url ?? a.url ?? '',
      filename: a.original_name ?? a.filename,
      caption: a.caption,
    })) ?? p.media ?? [],
    reactions: p.reactions ?? {
      like: p.like_count ?? 0,
      love: 0,
      insightful: 0,
      support: 0,
      sad: 0,
      angry: 0,
    },
    user_reaction: p.user_reaction,
    comments_count: p.comments_count ?? p.comment_count ?? 0,
    shares_count: p.shares_count ?? p.share_count ?? 0,
    views_count: p.views_count ?? p.view_count ?? 0,
    is_bookmarked: p.is_bookmarked ?? false,
    is_pinned: p.is_pinned ?? false,
    status: p.status ?? (p.is_published ? 'published' : 'draft'),
    created_at: p.created_at ?? new Date().toISOString(),
    updated_at: p.updated_at ?? new Date().toISOString(),
    group: p.group_name ? {
      id: p.group_id,
      name: p.group_name,
      slug: '',
      type: 'public',
      sector: p.group_sector || 'general',
      members_count: 0,
      posts_count: 0,
      is_member: false,
      membership_status: 'none',
    } : undefined,
  } as Post;
}

function mapBackendMember(m: any): Member {
  return {
    id: m.user_id ?? m.id ?? '',
    user_id: m.user_id ?? m.id ?? '',
    name: m.full_name ?? m.username ?? m.name ?? 'Inconnu',
    avatar: m.avatar_url ?? m.avatar,
    role: (m.role ?? 'member') as any,
    joined_at: m.joined_at ?? new Date().toISOString(),
    country: m.country,
    is_verified: m.is_verified,
    is_online: m.is_online,
  };
}

function mapBackendGroupList(raw: any): PaginatedResponse<Group> {
  const items = (raw.groups || raw.data || []).map(mapBackendGroup);
  const page = raw.page || 1;
  const limit = raw.per_page || raw.limit || 20;
  const total = raw.total || 0;
  const total_pages = raw.pages || raw.total_pages || 1;
  const has_next = raw.has_next ?? page < total_pages;
  const has_prev = raw.has_prev ?? page > 1;
  return {
    data: items,
    meta: { page, limit, total, total_pages, has_next, has_prev },
    page,
    limit,
    total,
    total_pages,
    has_next,
    has_prev,
  };
}

export function useGroups(filters: { type?: string; search?: string; sort?: string; sector?: string } = {}) {
  return useQuery({
    queryKey: ['groups', filters],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (filters.search) params.search = filters.search;
      if (filters.type) params.type = filters.type;
      if (filters.sort) params.sort = filters.sort;
      if (filters.sector) params.sector = filters.sector;

      const raw = await apiClient.get<any>('/community/groups', { params });
      return mapBackendGroupList(raw);
    },
  });
}

export function useCommunityStats() {
  return useQuery({
    queryKey: ['community', 'stats'],
    queryFn: () =>
      apiClient.get<{
        active_members: number;
        total_discussions: number;
        total_groups: number;
        growth_percent: number;
      }>('/community/stats'),
    staleTime: 60_000,
    retry: false,
  });
}

function mapBackendPostList(raw: any): PaginatedResponse<Post> {
  const items = (raw.posts || raw.data || []).map(mapBackendPost);
  const page = raw.page || 1;
  const limit = raw.per_page || raw.limit || 10;
  const total = raw.total || 0;
  const total_pages = raw.pages || raw.total_pages || 1;
  const has_next = raw.has_next ?? page < total_pages;
  const has_prev = raw.has_prev ?? page > 1;
  return {
    data: items,
    meta: { page, limit, total, total_pages, has_next, has_prev },
    page,
    limit,
    total,
    total_pages,
    has_next,
    has_prev,
  };
}

function isValidGroupId(id: string | undefined | null): boolean {
  return !!id && id !== '_' && id.length > 4;
}

export function useGroup(id: string) {
  return useQuery({
    queryKey: ['groups', id],
    queryFn: async () => {
      const raw = await apiClient.get<any>(`/community/groups/${id}`);
      return mapBackendGroup(raw);
    },
    enabled: isValidGroupId(id),
    retry: 1,
  });
}

export function useGroupPosts(groupId: string) {
  return useInfiniteQuery({
    queryKey: ['groups', groupId, 'posts'],
    queryFn: async ({ pageParam = 1 }) => {
      const raw = await apiClient.get<any>(`/community/groups/${groupId}/posts`, {
        params: { page: pageParam as number, limit: 10 },
      });
      return mapBackendPostList(raw);
    },
    initialPageParam: 1,
    getNextPageParam: (last) => last.has_next ? last.page + 1 : undefined,
    enabled: isValidGroupId(groupId),
  });
}

export function usePublicPosts(filters: { search?: string; page?: number } = {}) {
  return useQuery({
    queryKey: ['community', 'public-posts', filters],
    queryFn: async () => {
      const params: Record<string, any> = { per_page: 20 };
      if (filters.search) params.search = filters.search;
      if (filters.page) params.page = filters.page;
      const raw = await apiClient.get<any>('/community/posts/public', { params });
      return {
        posts: (raw.posts || []).map(mapBackendPost) as Post[],
        total: raw.total || 0,
        has_next: raw.has_next || false,
        page: raw.page || 1,
      };
    },
    staleTime: 30_000,
    retry: false,
  });
}

function mapBackendComment(c: any): Comment {
  return {
    id: c.id,
    post_id: c.post_id,
    author: c.author ?? {
      id: c.author_id ?? '',
      name: c.author_name ?? 'Anonyme',
      avatar: c.author_avatar ?? undefined,
      role: c.author_role ?? '',
    },
    content: c.content ?? c.body ?? '',
    parent_id: c.parent_id,
    created_at: c.created_at ?? new Date().toISOString(),
    reactions: c.reactions ?? {},
    replies_count: c.replies_count ?? 0,
    user_reaction: c.user_reaction,
    is_edited: c.is_edited ?? false,
    edited_at: c.edited_at,
    is_pinned: c.is_pinned ?? false,
  };
}

export function usePostComments(postId: string) {
  return useInfiniteQuery({
    queryKey: ['posts', postId, 'comments'],
    queryFn: async ({ pageParam = 1 }) => {
      const raw = await apiClient.get<any>(`/community/posts/${postId}/comments`, {
        params: { page: pageParam as number, limit: 10 },
      });
      const items = (raw?.data || raw || []).map(mapBackendComment);
      const page = raw?.page || 1;
      const has_next = raw?.has_next ?? false;
      return { data: items, page, has_next } as PaginatedResponse<Comment>;
    },
    initialPageParam: 1,
    getNextPageParam: (last) => last.has_next ? last.page + 1 : undefined,
    enabled: !!postId,
  });
}

export function useGroupMembers(groupId: string) {
  return useQuery({
    queryKey: ['groups', groupId, 'members'],
    queryFn: async () => {
      const raw = await apiClient.get<any[]>(`/community/groups/${groupId}/members`);
      return (raw || []).map(mapBackendMember);
    },
    enabled: isValidGroupId(groupId),
  });
}

export function useJoinGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (groupId: string) => apiClient.post(`/community/groups/${groupId}/join`),
    onSuccess: (_, groupId) => {
      qc.invalidateQueries({ queryKey: ['groups', groupId] });
      qc.invalidateQueries({ queryKey: ['groups'] });
      toast.success('Demande envoyée !');
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });
}

export function useLeaveGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (groupId: string) => apiClient.post(`/community/groups/${groupId}/leave`),
    onSuccess: (_, groupId) => {
      qc.invalidateQueries({ queryKey: ['groups', groupId] });
      qc.invalidateQueries({ queryKey: ['groups'] });
      toast.success('Vous avez quitté le groupe');
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });
}

export function useDeleteGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (groupId: string) => apiClient.delete(`/community/groups/${groupId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['groups'] });
      toast.success('Groupe supprimé');
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });
}

export function useTrendingGroups() {
  return useQuery({
    queryKey: ['community', 'trending-groups'],
    queryFn: () =>
      apiClient.get<Array<{ id: string; name: string; members_count: number; growth_percent: number }>>(
        '/community/trending'
      ),
    staleTime: 120_000,
    retry: false,
  });
}

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: FormData) => apiClient.upload<Post>('/community/posts', data),
    onSuccess: (post) => {
      qc.invalidateQueries({ queryKey: ['groups', post.group_id, 'posts'] });
      qc.invalidateQueries({ queryKey: ['community', 'public-posts'] });
      qc.invalidateQueries({ queryKey: ['community', 'trending-posts'] });
      qc.invalidateQueries({ queryKey: ['community', 'stats'] });
      toast.success('Publication créée !');
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });
}

export function useReactToPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, reaction }: { postId: string; reaction: string }) =>
      apiClient.post(`/community/posts/${postId}/react`, { reaction }),
    onSuccess: (_, { postId }) => {
      qc.invalidateQueries({ queryKey: ['posts', postId] });
      qc.invalidateQueries({ queryKey: ['community', 'public-posts'] });
      qc.invalidateQueries({ queryKey: ['community', 'trending-posts'] });
    },
  });
}

export function useAddComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, content, parentId }: { postId: string; content: string; parentId?: string }) =>
      apiClient.post<Comment>(`/community/posts/${postId}/comments`, { content, parent_id: parentId }),
    onSuccess: (_, { postId }) => {
      qc.invalidateQueries({ queryKey: ['posts', postId, 'comments'] });
    },
  });
}

export function useCreateGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiClient.post('/community/groups', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['groups'] });
      qc.invalidateQueries({ queryKey: ['community', 'stats'] });
      qc.invalidateQueries({ queryKey: ['community', 'trending-groups'] });
      toast.success('Groupe créé avec succès');
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });
}

export function useTrendingPosts(limit = 10) {
  return useQuery({
    queryKey: ['community', 'trending-posts', limit],
    queryFn: async () => {
      const raw = await apiClient.get<any[]>('/community/trending-posts', {
        params: { limit },
      });
      return (raw || []).map(mapBackendPost);
    },
    staleTime: 60_000,
    retry: false,
  });
}

export function useGroupMessages(groupId: string, opts: { enabled?: boolean; refetchInterval?: number } = {}) {
  return useQuery({
    queryKey: ['groups', groupId, 'messages'],
    queryFn: () => apiClient.get<any[]>(`/community/groups/${groupId}/messages`),
    enabled: !!groupId && opts.enabled !== false,
    // Stop polling on error — prevents infinite 503 error storm when backend is down
    refetchInterval: (query) => {
      if (query.state.error) return false;
      return opts.refetchInterval ?? 5000;
    },
    retry: 1,
  });
}

export function useSendGroupMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, content }: { groupId: string; content: string }) =>
      apiClient.post(`/community/groups/${groupId}/messages`, { content }),
    onSuccess: (_, { groupId }) => {
      qc.invalidateQueries({ queryKey: ['groups', groupId, 'messages'] });
    },
  });
}

export function useEditGroupMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, messageId, content }: { groupId: string; messageId: string; content: string }) =>
      apiClient.put(`/community/groups/${groupId}/messages/${messageId}`, { content }),
    onSuccess: (_, { groupId }) => {
      qc.invalidateQueries({ queryKey: ['groups', groupId, 'messages'] });
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });
}

export function useDeleteGroupMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, messageId }: { groupId: string; messageId: string }) =>
      apiClient.delete(`/community/groups/${groupId}/messages/${messageId}`),
    onSuccess: (_, { groupId }) => {
      qc.invalidateQueries({ queryKey: ['groups', groupId, 'messages'] });
      toast.success('Message supprimé');
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });
}

export function useSendVoiceMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, audioUrl, duration }: { groupId: string; audioUrl: string; duration: number }) =>
      apiClient.post(`/community/groups/${groupId}/messages`, {
        content: '',
        message_type: 'voice',
        audio_url: audioUrl,
        audio_duration: duration,
      }),
    onSuccess: (_, { groupId }) => {
      qc.invalidateQueries({ queryKey: ['groups', groupId, 'messages'] });
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });
}

export function useAddGroupMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, userId }: { groupId: string; userId: string }) =>
      apiClient.post(`/community/groups/${groupId}/members/add`, { user_id: userId }),
    onSuccess: (_, { groupId }) => {
      qc.invalidateQueries({ queryKey: ['groups', groupId, 'members'] });
      qc.invalidateQueries({ queryKey: ['groups', groupId] });
      toast.success('Membre ajouté');
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });
}

export function useRemoveGroupMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, userId }: { groupId: string; userId: string }) =>
      apiClient.delete(`/community/groups/${groupId}/members/${userId}`),
    onSuccess: (_, { groupId }) => {
      qc.invalidateQueries({ queryKey: ['groups', groupId, 'members'] });
      qc.invalidateQueries({ queryKey: ['groups', groupId] });
      toast.success('Membre retiré');
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });
}

export function useUpdateMemberRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, userId, role }: { groupId: string; userId: string; role: string }) =>
      apiClient.put(`/community/groups/${groupId}/members/${userId}/role`, { role }),
    onSuccess: (_, { groupId }) => {
      qc.invalidateQueries({ queryKey: ['groups', groupId, 'members'] });
      toast.success('Rôle mis à jour');
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });
}

// ── Meetups / Events ──────────────────────────────────────────────────────────

export interface Meetup {
  id: string;
  group_id: string;
  title?: string;
  content?: string;
  type: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  metadata?: {
    event_date?: string;
    event_time?: string;
    event_end_time?: string;
    location?: string;
    meeting_url?: string;
    event_type?: string;
    max_participants?: number;
    banner?: string;
  };
  created_at: string;
}

export function useGroupMeetups(groupId: string) {
  return useQuery({
    queryKey: ['groups', groupId, 'meetups'],
    queryFn: () => apiClient.get<Meetup[]>(`/community/groups/${groupId}/meetups`),
    enabled: !!groupId,
  });
}

export function useCreateMeetup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, ...data }: { groupId: string; title: string; description: string; date: string; time?: string; end_time?: string; location?: string; meeting_url?: string; event_type?: string }) =>
      apiClient.post(`/community/groups/${groupId}/meetups`, data),
    onSuccess: (_, { groupId }) => {
      qc.invalidateQueries({ queryKey: ['groups', groupId, 'meetups'] });
      toast.success('Événement créé');
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });
}

export function useReportMember() {
  return useMutation({
    mutationFn: ({ groupId, userId, reason, description }: {
      groupId: string;
      userId: string;
      reason: string;
      description?: string;
    }) =>
      apiClient.post(`/community/groups/${groupId}/members/${userId}/report`, {
        reason,
        description: description || '',
      }),
    onSuccess: () => {
      toast.success('Signalement envoyé aux administrateurs');
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });
}
