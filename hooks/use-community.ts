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

export function useGroups(filters: { type?: string; search?: string; sort?: string } = {}) {
  return useQuery({
    queryKey: ['groups', filters],
    queryFn: async () => {
      try {
        const raw = await apiClient.get<any>('/community/groups', {
          params: { ...filters } as Record<string, string>,
        });
        return mapBackendGroupList(raw);
      } catch (e: any) {
        if (e?.status === 401) {
          const mock: PaginatedResponse<Group> = {
            data: [
              {
                id: 'public-1',
                name: 'Groupe Demo: Maïs & Légumes',
                slug: 'demo-mais-legumes',
                description: "Espace d'échange pour les producteurs de maïs et légumes.",
                type: 'public',
                sector: 'vegetal',
                tags: ['maïs', 'légumes'],
                members_count: 120,
                posts_count: 45,
                is_member: false,
                membership_status: 'none',
                requires_approval: false,
                moderated: false,
                created_at: new Date().toISOString(),
                created_by: 'system',
              } as Group,
            ],
            meta: { page: 1, limit: 20, total: 1 } as any,
            page: 1,
            limit: 20,
            total: 1,
            total_pages: 1,
            has_next: false,
            has_prev: false,
          };
          return mock;
        }
        throw e;
      }
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
  const items = (raw.posts || raw.data || []).map((p: any) => ({
    ...p,
    author: p.author || { id: p.author_id, name: p.author_name, avatar: p.author_avatar },
  }));
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

export function useGroup(id: string) {
  return useQuery({
    queryKey: ['groups', id],
    queryFn: async () => {
      const raw = await apiClient.get<any>(`/community/groups/${id}`);
      return mapBackendGroup(raw);
    },
    enabled: !!id,
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
    enabled: !!groupId,
  });
}

export function usePostComments(postId: string) {
  return useInfiniteQuery({
    queryKey: ['posts', postId, 'comments'],
    queryFn: ({ pageParam = 1 }) =>
      apiClient.get<PaginatedResponse<Comment>>(`/community/posts/${postId}/comments`, {
        params: {
          page: pageParam as number,
          limit: 10,
        },
      }),
    initialPageParam: 1,
    getNextPageParam: (last) => last.has_next ? last.page + 1 : undefined,
    enabled: !!postId,
  });
}

export function useGroupMembers(groupId: string) {
  return useQuery({
    queryKey: ['groups', groupId, 'members'],
    queryFn: () => apiClient.get<Member[]>(`/community/groups/${groupId}/members`),
    enabled: !!groupId,
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

// Create a new group
export function useCreateGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiClient.post('/community/groups', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['groups'] });
      qc.invalidateQueries({ queryKey: ['community', 'stats'] });
    },
    onError: (e: any, _vars, _ctx) => {
      // If unauthorized, add a local optimistic group so the UI shows the created group
      if (e?.status === 401) {
        const local: Group = {
          id: `local-${Date.now()}`,
          name: (e?.name as string) || 'Nouveau groupe (local)',
          slug: `local-${Date.now()}`,
          description: 'Groupe créé localement. Connectez-vous pour le sauvegarder.',
          type: 'public',
          sector: 'general',
          tags: [],
          members_count: 1,
          posts_count: 0,
          is_member: true,
          membership_status: 'member',
          requires_approval: false,
          moderated: false,
          created_at: new Date().toISOString(),
          created_by: 'local',
        } as Group;
        qc.setQueryData(['groups'], (old: any) => {
          if (!old) return { data: [local], page: 1, limit: 20, total: 1, total_pages: 1, has_next: false, has_prev: false };
          return { ...old, data: [local, ...(old.data || [])], total: (old.total || 0) + 1 };
        });
        toast.success('Groupe créé localement (connexion requise pour le sauvegarder)');
      }
    },
  });
}

// Simple messages polling hook for group chat (fallback when WS unavailable)
export function useGroupMessages(groupId: string, opts: { enabled?: boolean; refetchInterval?: number } = {}) {
  return useQuery({
    queryKey: ['groups', groupId, 'messages'],
    queryFn: () => apiClient.get<any[]>(`/community/groups/${groupId}/messages`),
    enabled: !!groupId && opts.enabled !== false,
    refetchInterval: opts.refetchInterval ?? 3000,
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
