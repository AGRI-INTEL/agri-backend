'use client';

import { useState, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { Conversation, Message, LLMProvider } from '@/types/chatbot';
import { toast } from 'sonner';

interface ChatResponse {
  type: string;
  message: string;
  sql_query?: string | null;
  data?: Record<string, unknown>[] | null;
  provider?: string | null;
  timestamp: string;
  error: boolean;
}

function msgId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function userMsg(content: string, convId: string): Message {
  return {
    id: msgId(),
    conversation_id: convId,
    role: 'user',
    content,
    media_type: 'text',
    status: 'sent',
    created_at: new Date().toISOString(),
  };
}

function asstMsg(r: ChatResponse, convId: string): Message {
  return {
    id: msgId(),
    conversation_id: convId,
    role: 'assistant',
    content: r.message,
    media_type: 'text',
    status: 'read',
    created_at: r.timestamp || new Date().toISOString(),
    sql_query: r.sql_query || undefined,
  };
}

function pendingMsg(convId: string): Message {
  return {
    id: `pending-${msgId()}`,
    conversation_id: convId,
    role: 'assistant',
    content: '',
    media_type: 'text',
    status: 'streaming',
    created_at: new Date().toISOString(),
  };
}

export function useChatbot() {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [provider, setProviderState] = useState<LLMProvider>('kimi');
  const qc = useQueryClient();
  const abortRef = useRef<AbortController | null>(null);

  const { data: providerStatus } = useQuery({
    queryKey: ['chatbot', 'status'],
    queryFn: () =>
      apiClient
        .get<{
          ai_enabled: boolean;
          provider: string;
          kimi_configured: boolean;
          deepseek_configured: boolean;
          openai_configured: boolean;
        }>('/chatbot/status')
        .catch(() => undefined),
    retry: 1,
    staleTime: 120_000,
  });

  const { data: conversations } = useQuery({
    queryKey: ['chatbot', 'conversations'],
    queryFn: () =>
      apiClient.get<Conversation[]>('/chatbot/conversations').catch(() => []),
    retry: 1,
  });

  const { data: activeConversation, isLoading: convLoading } = useQuery({
    queryKey: ['chatbot', 'conversations', activeConversationId],
    queryFn: () =>
      apiClient
        .get<Conversation>(`/chatbot/conversations/${activeConversationId}`)
        .then((c) => ({
          ...c,
          messages: Array.isArray(c?.messages) ? c.messages : [],
        }))
        .catch(() => undefined),
    enabled: !!activeConversationId,
    retry: 1,
  });

  const createConversation = useMutation({
    mutationFn: () => apiClient.post<{ id: string }>('/chatbot/conversations'),
    onSuccess: (conv) => {
      qc.invalidateQueries({ queryKey: ['chatbot', 'conversations'] });
      setActiveConversationId(conv.id);
    },
    onError: () => toast.error('Impossible de créer une nouvelle conversation'),
  });

  const sendMessage = useMutation({
    mutationFn: async ({
      content,
      convId,
    }: {
      content: string;
      convId: string;
    }) => {
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      const response = await apiClient.post<ChatResponse>(
        '/chatbot/messages',
        { content, conversation_id: convId, provider },
        { signal: abortRef.current.signal },
      );

      if (!response || response.error) {
        throw new Error(response?.message || 'Erreur de réponse du chatbot');
      }
      return { response, convId, content };
    },

    onMutate: async ({ content, convId }) => {
      await qc.cancelQueries({
        queryKey: ['chatbot', 'conversations', convId],
      });
      const prev = qc.getQueryData<Conversation>([
        'chatbot',
        'conversations',
        convId,
      ]);

      qc.setQueryData<Conversation>(
        ['chatbot', 'conversations', convId],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            messages: [
              ...old.messages,
              userMsg(content, convId),
              pendingMsg(convId),
            ],
            message_count: old.messages.length + 2,
            updated_at: new Date().toISOString(),
          };
        },
      );

      return { prev };
    },

    onSuccess: ({ response, convId, content }, _vars, ctx) => {
      const prev = ctx?.prev;
      qc.setQueryData<Conversation>(
        ['chatbot', 'conversations', convId],
        (old) => {
          if (!old) return old;
          const withoutPending = old.messages.filter(
            (m) => !m.id.startsWith('pending-'),
          );
          const assistant = asstMsg(response, convId);
          const user = userMsg(content, convId);
          return {
            ...old,
            messages: [...withoutPending, user, assistant],
            message_count: withoutPending.length + 2,
            updated_at: response.timestamp,
          };
        },
      );
      qc.invalidateQueries({ queryKey: ['chatbot', 'conversations'] });
    },

    onError: (e: Error, { convId }, ctx) => {
      if (e.name === 'AbortError') return;
      if (ctx?.prev) {
        qc.setQueryData(['chatbot', 'conversations', convId], ctx.prev);
      }
      const msg =
        e.message.includes('503') || e.message.includes('temporairement')
          ? 'Le service est momentanément indisponible. Réessayez dans quelques instants.'
          : e.message.includes('timeout')
            ? 'Le délai d\'attente est dépassé. Vérifiez votre connexion.'
            : e.message;
      toast.error(msg);
    },
  });

  const sendTextMessage = useCallback(
    async (content: string) => {
      const convId =
        activeConversationId ??
        (await createConversation.mutateAsync()).id;
      await sendMessage.mutateAsync({ content, convId });
    },
    [activeConversationId, createConversation, sendMessage],
  );

  const sendMediaMessage = useCallback(
    async (content: string, _files: File[]) => {
      const convId =
        activeConversationId ??
        (await createConversation.mutateAsync()).id;
      await sendMessage.mutateAsync({ content, convId });
    },
    [activeConversationId, createConversation, sendMessage],
  );

  const newConversation = useCallback(() => {
    setActiveConversationId(null);
    createConversation.mutate();
  }, [createConversation]);

  const hasPending = (activeConversation?.messages ?? []).some((m) =>
    m.id.startsWith('pending-'),
  );

  return {
    conversations: conversations || [],
    activeConversation,
    activeConversationId,
    provider,
    isLoading: sendMessage.isPending || convLoading,
    hasPending,
    providerStatus,
    setActiveConversationId,
    setProvider: setProviderState,
    sendTextMessage,
    sendMediaMessage,
    newConversation,
    cancel: () => {
      abortRef.current?.abort();
    },
  };
}
