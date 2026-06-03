'use client';

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { Group, Post, Comment, Member } from '@/types/community';
import type { PaginatedResponse } from '@/types/api';
import { toast } from 'sonner';

export function useGroups(filters: { type?: string; search?: string } = {}) {
  return useQuery({
    queryKey: ['groups', filters],
    queryFn: async () => {
      try {
        return await apiClient.get<PaginatedResponse<Group>>('/community/groups', {
          params: filters as Record<string, string>,
        });
      } catch (e: any) {
        // If unauthorized, return a small mock set so UI remains usable while offline/auth required
        if (e?.status === 401) {
          const mock: PaginatedResponse<Group> = {
            data: [
              {
                id: 'public-1',
                name: 'Groupe Demo: Maïs & Légumes',
                slug: 'demo-mais-legumes',
                description: 'Espace d\'échange pour les producteurs de maïs et légumes.',
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

export function useGroup(id: string) {
  return useQuery({
    queryKey: ['groups', id],
    queryFn: () => apiClient.get<Group>(`/community/groups/${id}`),
    enabled: !!id,
  });
}

export function useGroupPosts(groupId: string) {
  return useInfiniteQuery({
    queryKey: ['groups', groupId, 'posts'],
    queryFn: ({ pageParam = 1 }) =>
      apiClient.get<PaginatedResponse<Post>>(`/community/groups/${groupId}/posts`, {
        params: {
          page: pageParam as number,
          limit: 10,
        },
      }),
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
      toast.success('Demande envoyée !');
    },
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
    mutationFn: (data: FormData | Record<string, unknown>) => {
      // If FormData, use upload helper to handle files
      if (data instanceof FormData) {
        return apiClient.upload('/community/groups', data);
      }
      return apiClient.post('/community/groups', data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['groups'] });
      // also invalidate listings
      qc.invalidateQueries({ queryKey: ['groups', {}] });
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
