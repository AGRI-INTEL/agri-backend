'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import type { Conversation, Message } from '@/types/chatbot';
import Image from 'next/image';
import { motion, AnimatePresence } from '@/lib/motion';
import {
  Send, Paperclip, Camera, Plus, Bot, Sparkles, TrendingUp,
  Cloud, DollarSign, Calendar, HelpCircle, X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageBubble } from './message-bubble';
import { ProviderSwitcher } from './provider-switcher';
import { AgriBotAvatar } from '@/components/shared/agribot-avatar';
import { useChatbot } from '@/hooks/use-chatbot';
import { useAuthStore } from '@/stores/auth-store';
import { cn, formatRelativeDate } from '@/lib/utils';

const SUGGESTIONS = [
  { icon: Cloud, label: 'Météo de la semaine au Sénégal' },
  { icon: DollarSign, label: 'Quel est le prix du maïs ?' },
  { icon: TrendingUp, label: 'Prévisions de récolte 2026' },
  { icon: Sparkles, label: 'Quelles cultures planter ?' },
  { icon: Calendar, label: 'Calendrier des semis' },
  { icon: HelpCircle, label: 'Conseils pour le maraîchage' },
];

function ChatMessage({ msg, userName, userAvatar }: {
  msg: Message; userName?: string; userAvatar?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
    >
      <MessageBubble message={msg} userName={userName} userAvatar={userAvatar} />
    </motion.div>
  );
}

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3 px-1"
    >
      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shrink-0 shadow-md shadow-green-500/20">
        <Bot className="h-4 w-4 text-white" />
      </div>
      <div className="bg-card border border-border/60 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm backdrop-blur-sm">
        <div className="flex gap-1 items-center">
          <span className="text-xs font-medium text-muted-foreground/70 mr-1">AgriBot réfléchit</span>
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-green-500/60 inline-block"
              animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
              transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15, ease: 'easeInOut' }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export function ChatInterface() {
  const { user } = useAuthStore();
  const {
    conversations, activeConversation, provider, isLoading, hasPending,
    providerStatus, setProvider, sendTextMessage, sendMediaMessage,
    newConversation, setActiveConversationId, cancel,
  } = useChatbot();

  const conversationList = useMemo(() => {
    const raw = conversations;
    if (Array.isArray(raw)) return raw as Conversation[];
    if (raw && typeof raw === 'object' && Array.isArray((raw as Record<string, unknown>).conversations)) {
      return (raw as Record<string, unknown>).conversations as Conversation[];
    }
    return [];
  }, [conversations]);

  const [input, setInput] = useState('');
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const messages = useMemo(
    () => (Array.isArray(activeConversation?.messages) ? activeConversation.messages : []).filter(
      (m) => !m.id.startsWith('pending-'),
    ),
    [activeConversation],
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, hasPending]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text && pendingFiles.length === 0) return;
    setInput('');
    setPendingFiles([]);
    if (pendingFiles.length > 0) {
      await sendMediaMessage(text, pendingFiles);
    } else {
      await sendTextMessage(text);
    }
  }, [input, pendingFiles, sendMediaMessage, sendTextMessage]);

  const handleSuggestion = useCallback((label: string) => {
    setInput(label);
    textareaRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setPendingFiles((prev) => [...prev, ...files].slice(0, 5));
    e.target.value = '';
  };

  // const handleVoiceSend = async (blob: Blob) => {
  //   const file = new File([blob], `voice-${Date.now()}.webm`, { type: blob.type });
  //   await sendMediaMessage('', [file]);
  // };

  const canSend = (input.trim().length > 0 || pendingFiles.length > 0) && !isLoading;

  return (
    <div className="flex h-full bg-gradient-to-b from-background to-muted/20">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-72 flex-col border-r border-border/60 bg-card/20 backdrop-blur-xl">
        <div className="p-4 border-b border-border/40">
          <Button
            onClick={newConversation}
            className="w-full gap-2 shadow-sm hover:shadow-primary/20 transition-all duration-300"
            size="sm"
            disabled={isLoading}
          >
            <Plus className="h-4 w-4" />
            Nouvelle conversation
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto p-2.5 space-y-1" aria-label="Historique">
          {conversationList.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center px-4 py-8">
              <Bot className="h-8 w-8 text-muted-foreground/30 mb-2" />
              <p className="text-xs text-muted-foreground/50">Aucune conversation</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {conversationList.slice(0, 20).map((conv, i) => (
                <motion.button
                  key={conv.id}
                  layout
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.25 }}
                  onClick={() => setActiveConversationId(conv.id)}
                  className={cn(
                    'w-full text-left px-3.5 py-2.5 rounded-xl text-sm transition-all duration-200 relative group',
                    activeConversation?.id === conv.id
                      ? 'bg-primary/10 text-primary shadow-sm border border-primary/20'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground border border-transparent',
                  )}
                >
                  <p className="truncate font-medium text-[13px] leading-tight">
                    {conv.title || 'Nouvelle conversation'}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[10px] font-medium opacity-60">
                      {conv.message_count} msg
                    </span>
                    <span className="text-[10px] opacity-30">·</span>
                    <span className="text-[10px] font-medium opacity-60">
                      {formatRelativeDate(conv.updated_at)}
                    </span>
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          )}
        </nav>
      </aside>

      {/* Main chat */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Messages */}
        <div
          className="flex-1 overflow-y-auto px-4 py-5 space-y-3 scroll-smooth"
          role="log"
          aria-live="polite"
        >
          {messages.length === 0 && !hasPending ? (
            <div className="flex flex-col items-center justify-center min-h-full text-center px-4 py-8 max-w-2xl mx-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              >
                <div className="mb-6">
                  <div className="relative inline-flex">
                    <AgriBotAvatar size={88} className="mx-auto" />
                    <motion.div
                      className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-green-500 border-2 border-background"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    />
                  </div>
                </div>
              </motion.div>

              <motion.h2
                className="text-2xl sm:text-3xl font-bold mb-2 text-foreground tracking-tight"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                Bonjour, je suis{' '}
                <span className="bg-gradient-to-r from-green-500 via-emerald-400 to-amber-400 bg-clip-text text-transparent">
                  AgriBot
                </span>
              </motion.h2>

              <motion.p
                className="text-muted-foreground/80 text-sm max-w-md mb-8 leading-relaxed"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                Votre assistant agricole intelligent — données en temps réel, analyses et conseils pour l&apos;Afrique.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="flex flex-wrap gap-2 justify-center max-w-lg mb-10"
              >
                {SUGGESTIONS.map(({ icon: Icon, label }, i) => (
                  <motion.button
                    key={label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + i * 0.06 }}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handleSuggestion(label)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium border border-border/60 bg-card/60 hover:bg-card hover:border-primary/30 hover:text-primary transition-all duration-200 shadow-sm"
                  >
                    <Icon className="h-3.5 w-3.5 text-muted-foreground/70" />
                    {label}
                  </motion.button>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-xl"
              >
                {[
                  { icon: '📝', label: 'Texte', desc: 'Questions & analyses', color: 'bg-blue-500/8 text-blue-500' },
                  { icon: '📷', label: 'Photo', desc: 'Diagnostic visuel', color: 'bg-green-500/8 text-green-500' },
                  { icon: '🎙', label: 'Vocal', desc: 'Commandes vocales', color: 'bg-purple-500/8 text-purple-500' },
                  { icon: '📎', label: 'Fichier', desc: 'Import de données', color: 'bg-amber-500/8 text-amber-500' },
                ].map((item, i) => (
                  <motion.button
                    key={item.label}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + i * 0.06 }}
                    whileHover={{ y: -3 }}
                    onClick={() => {
                      if (item.label === 'Photo') photoInputRef.current?.click();
                      if (item.label === 'Fichier') fileInputRef.current?.click();
                    }}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border/50 bg-card/40 hover:bg-card hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 text-center"
                  >
                    <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center text-lg', item.color)}>
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">{item.label}</p>
                      <p className="text-[9px] text-muted-foreground/60 mt-0.5 uppercase tracking-wider">{item.desc}</p>
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  msg={msg}
                  userName={user?.name}
                  userAvatar={user?.avatar}
                />
              ))}
            </AnimatePresence>
          )}

          {/* Pending / typing indicator */}
          <AnimatePresence>
            {hasPending && <TypingIndicator />}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>

        {/* Pending files preview */}
        <AnimatePresence>
          {pendingFiles.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-4 border-t border-border/40 bg-muted/20"
            >
              <div className="flex gap-2 py-2 overflow-x-auto">
                {pendingFiles.map((f, i) => (
                  <div key={i} className="relative shrink-0">
                    {f.type.startsWith('image/') ? (
                      <div className="relative h-14 w-14 rounded-lg overflow-hidden border border-border/60">
                        <Image
                          src={URL.createObjectURL(f)}
                          alt={f.name}
                          fill
                          unoptimized
                          className="object-cover"
                          sizes="56px"
                        />
                      </div>
                    ) : (
                      <div className="h-14 w-14 rounded-lg border border-border/60 bg-muted flex items-center justify-center">
                        <Paperclip className="h-4 w-4 text-muted-foreground/60" />
                      </div>
                    )}
                    <button
                      onClick={() => setPendingFiles((prev) => prev.filter((_, j) => j !== i))}
                      className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-background border border-border shadow-sm flex items-center justify-center hover:bg-destructive/10 transition-colors"
                      aria-label={`Retirer ${f.name}`}
                    >
                      <X className="h-3 w-3 text-muted-foreground" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input area */}
        <div className="border-t border-border/50 bg-background/80 backdrop-blur-sm px-4 py-3">
          <div className="flex items-end gap-2 max-w-4xl mx-auto">
            <div className="flex gap-0.5 shrink-0 pb-1">
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => photoInputRef.current?.click()}
                className="text-muted-foreground/60 hover:text-foreground h-9 w-9"
                disabled={isLoading}
              >
                <Camera className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                className="text-muted-foreground/60 hover:text-foreground h-9 w-9"
                disabled={isLoading}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Posez votre question agricole..."
                autoResize
                disabled={isLoading}
                className="min-h-[40px] max-h-[120px] resize-none border border-border/40 bg-muted/30 focus-visible:ring-1 focus-visible:ring-primary/30 rounded-xl text-sm placeholder:text-muted-foreground/40"
              />
            </div>

            <div className="shrink-0 pb-1">
              {isLoading ? (
                <Button
                  size="icon"
                  variant="outline"
                  onClick={cancel}
                  className="rounded-full h-9 w-9 border-destructive/30 text-destructive/70 hover:text-destructive hover:bg-destructive/5"
                  aria-label="Annuler"
                >
                  <X className="h-4 w-4" />
                </Button>
              ) : canSend ? (
                <Button
                  size="icon"
                  onClick={handleSend}
                  className="rounded-full h-9 w-9 shadow-sm shadow-primary/20"
                  aria-label="Envoyer"
                >
                  <Send className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
          </div>

          <div className="flex items-center justify-between mt-2 px-1 max-w-4xl mx-auto">
            <ProviderSwitcher
              provider={provider}
              onProviderChange={setProvider}
              aiEnabled={providerStatus?.ai_enabled}
            />
            {providerStatus?.ai_enabled === false && (
              <span className="text-[10px] text-amber-500/70 font-medium">
                Aucune clé API configurée
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
