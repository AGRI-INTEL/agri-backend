'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { Conversation, Message, LLMProvider } from '@/types/chatbot';
import { toast } from 'sonner';

export function useChatbot() {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [provider, setProvider] = useState<LLMProvider>('demo');
  const [isDemoMode, setIsDemoMode] = useState(true);
  const qc = useQueryClient();

  const { data: conversations } = useQuery({
    queryKey: ['chatbot', 'conversations'],
    queryFn: () => apiClient.get<Conversation[]>('/chatbot/conversations'),
  });

  const { data: activeConversation } = useQuery({
    queryKey: ['chatbot', 'conversations', activeConversationId],
    queryFn: () => apiClient.get<Conversation>(`/chatbot/conversations/${activeConversationId}`),
    enabled: !!activeConversationId,
  });

  const createConversation = useMutation({
    mutationFn: () => apiClient.post<Conversation>('/chatbot/conversations'),
    onSuccess: (conv) => {
      qc.invalidateQueries({ queryKey: ['chatbot', 'conversations'] });
      setActiveConversationId(conv.id);
    },
  });

  const sendMessage = useMutation({
    mutationFn: ({ content: msgContent, convId }: { content: string; convId: string }) =>
      apiClient.post<Message>(`/chatbot/conversations/${convId}/messages`, {
        content: msgContent,
        provider,
      }),
    onSuccess: (_, { convId }) => {
      qc.invalidateQueries({ queryKey: ['chatbot', 'conversations', convId] });
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });

  const sendTextMessage = useCallback(
    async (content: string) => {
      const convId = activeConversationId ?? (await createConversation.mutateAsync()).id;
      return sendMessage.mutateAsync({ content, convId });
    },
    [activeConversationId, createConversation, sendMessage]
  );

  const sendMediaMessage = useCallback(
    async (content: string, _files: File[]) => {
      const convId = activeConversationId ?? (await createConversation.mutateAsync()).id;
      return sendMessage.mutateAsync({ content, convId });
    },
    [activeConversationId, createConversation, sendMessage]
  );

  const newConversation = useCallback(() => {
    setActiveConversationId(null);
    createConversation.mutate();
  }, [createConversation]);

  return {
    conversations: conversations || [],
    activeConversation,
    activeConversationId,
    provider,
    isDemoMode,
    isLoading: sendMessage.isPending,
    setActiveConversationId,
    setProvider,
    setIsDemoMode,
    sendTextMessage,
    sendMediaMessage,
    newConversation,
  };
}
