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
    mutationFn: (formData: FormData) =>
      apiClient.upload<Message>(`/chatbot/conversations/${activeConversationId}/messages`, formData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['chatbot', 'conversations', activeConversationId] });
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });

  const sendTextMessage = useCallback(
    async (content: string) => {
      if (!activeConversationId) {
        const conv = await createConversation.mutateAsync();
        const formData = new FormData();
        formData.append('content', content);
        formData.append('provider', provider);
        formData.append('conversation_id', conv.id);
        return sendMessage.mutateAsync(formData);
      }

      const formData = new FormData();
      formData.append('content', content);
      formData.append('provider', provider);
      return sendMessage.mutateAsync(formData);
    },
    [activeConversationId, createConversation, provider, sendMessage]
  );

  const sendMediaMessage = useCallback(
    async (content: string, files: File[]) => {
      if (!activeConversationId) {
        await createConversation.mutateAsync();
      }

      const formData = new FormData();
      formData.append('content', content);
      formData.append('provider', provider);
      files.forEach((f) => formData.append('files', f));
      return sendMessage.mutateAsync(formData);
    },
    [activeConversationId, createConversation, provider, sendMessage]
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
