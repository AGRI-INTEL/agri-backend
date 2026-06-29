'use client';

import { useState, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, isBackendDown } from '@/lib/api-client';
import type { Conversation, Message, LLMProvider } from '@/types/chatbot';
import { toast } from 'sonner';

const DEMO_RESPONSES: Record<string, string> = {
  bonjour: 'Bonjour ! Je suis AgriBot, votre assistant agricole intelligent. Comment puis-je vous aider aujourd\'hui ?',
  salut: 'Salut ! Comment puis-je vous aider ?',
  météo: 'Pour consulter la météo agricole, rendez-vous dans la section Météo du tableau de bord.',
  prix: 'Les prix des cultures varient selon les marchés. Consultez la section Indicateurs pour les données actualisées.',
  culture: 'Je peux vous conseiller sur les cultures adaptées à votre région. De quelle culture souhaitez-vous parler ?',
  engrais: 'Le choix d\'engrais dépend de votre sol et de votre culture. Je recommande une analyse de sol d\'abord.',
  irrigation: 'L\'irrigation goutte-à-goutte est généralement la plus efficace pour les cultures maraîchères.',
  default: 'Je suis votre assistant IA pour l\'agriculture intelligente. Posez-moi des questions sur la météo, les cultures, les prix, les engrais, l\'irrigation et plus encore !',
};

const PROVIDER_ENDPOINTS: Record<string, string> = {
  openai: '/chatbot/providers/openai',
  openrouter: '/chatbot/providers/openrouter',
  deepseek: '/chatbot/providers/deepseek',
  demo: '/chatbot/messages',
};

export function useChatbot() {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [provider, setProviderState] = useState<LLMProvider>('demo');
  const [isDemoMode, setIsDemoMode] = useState(true);
  const qc = useQueryClient();
  const abortRef = useRef<AbortController | null>(null);

  const { data: conversations } = useQuery({
    queryKey: ['chatbot', 'conversations'],
    queryFn: () => apiClient.get<Conversation[]>('/chatbot/conversations').catch(() => []),
    retry: 1,
  });

  const { data: activeConversation, isLoading: convLoading } = useQuery({
    queryKey: ['chatbot', 'conversations', activeConversationId],
    queryFn: () => apiClient.get<Message[]>(`/chatbot/conversations/${activeConversationId}`).then(msgs => ({
      id: activeConversationId!,
      messages: msgs,
    } as unknown as Conversation)).catch(() => undefined),
    enabled: !!activeConversationId,
    retry: 1,
  });

  const createConversation = useMutation({
    mutationFn: () =>
      apiClient.post<{ id: string }>('/chatbot/conversations').catch(() => ({
        id: `demo-${Date.now()}`,
      })),
    onSuccess: (conv) => {
      qc.invalidateQueries({ queryKey: ['chatbot', 'conversations'] });
      setActiveConversationId(conv.id);
    },
  });

  const sendMessage = useMutation({
    mutationFn: async ({ content: msgContent, convId }: { content: string; convId: string }) => {
      if (isBackendDown() || isDemoMode) {
        await new Promise((r) => setTimeout(r, 800));
        const lower = msgContent.toLowerCase();
        let reply = DEMO_RESPONSES.default;
        for (const [key, val] of Object.entries(DEMO_RESPONSES)) {
          if (lower.includes(key)) { reply = val; break; }
        }
        return { id: `msg-${Date.now()}`, content: reply, role: 'assistant', created_at: new Date().toISOString() } as unknown as Message;
      }

      abortRef.current?.abort();
      abortRef.current = new AbortController();

      const endpoint = isDemoMode ? '/chatbot/messages' : PROVIDER_ENDPOINTS[provider] || '/chatbot/messages';
      return apiClient.post<Message>(endpoint, {
        content: msgContent,
        conversation_id: convId,
        provider: isDemoMode ? 'demo' : provider,
      }, { signal: abortRef.current.signal }).catch((err) => {
        if (err.name === 'AbortError') throw err;
        const lower = msgContent.toLowerCase();
        let reply = DEMO_RESPONSES.default;
        for (const [key, val] of Object.entries(DEMO_RESPONSES)) {
          if (lower.includes(key)) { reply = val; break; }
        }
        return { id: `msg-${Date.now()}`, content: reply, role: 'assistant', created_at: new Date().toISOString() } as unknown as Message;
      });
    },
    onSuccess: (_, { convId }) => {
      qc.invalidateQueries({ queryKey: ['chatbot', 'conversations', convId] });
      qc.invalidateQueries({ queryKey: ['chatbot', 'conversations'] });
    },
    onError: (e: Error) => {
      if (e.name !== 'AbortError') toast.error('Erreur lors de l\'envoi du message');
    },
  });

  const sendTextMessage = useCallback(
    async (content: string) => {
      const convId = activeConversationId ?? (await createConversation.mutateAsync()).id;
      return sendMessage.mutateAsync({ content, convId });
    },
    [activeConversationId, createConversation, sendMessage],
  );

  const sendMediaMessage = useCallback(
    async (content: string, _files: File[]) => {
      const convId = activeConversationId ?? (await createConversation.mutateAsync()).id;
      return sendMessage.mutateAsync({ content, convId });
    },
    [activeConversationId, createConversation, sendMessage],
  );

  const newConversation = useCallback(() => {
    setActiveConversationId(null);
    createConversation.mutate();
  }, [createConversation]);

  const setProvider = useCallback((p: LLMProvider) => {
    setProviderState(p);
    setIsDemoMode(p === 'demo');
  }, []);

  return {
    conversations: conversations || [],
    activeConversation,
    activeConversationId,
    provider,
    isDemoMode,
    isLoading: sendMessage.isPending || convLoading,
    setActiveConversationId,
    setProvider,
    setIsDemoMode,
    sendTextMessage,
    sendMediaMessage,
    newConversation,
    cancel: () => { abortRef.current?.abort(); },
  };
}
