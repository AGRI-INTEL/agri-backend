'use client';

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { Group, Post, Comment, Member } from '@/types/community';
import type { PaginatedResponse } from '@/types/api';
import { toast } from 'sonner';

export function useGroups(filters: { type?: string; search?: string } = {}) {
  return useQuery({
    queryKey: ['groups', filters],
    queryFn: () => apiClient.get<PaginatedResponse<Group>>('/community/groups', {
      params: filters as Record<string, string>,
    }),
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
