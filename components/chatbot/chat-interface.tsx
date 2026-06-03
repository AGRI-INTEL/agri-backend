'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import type { Conversation } from '@/types/chatbot';
import Image from 'next/image';
import { motion } from '@/lib/motion';
import { Send, Paperclip, Camera, Plus, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageBubble } from './message-bubble';
import { SuggestionChips } from './suggestion-chips';
import { ProviderSwitcher } from './provider-switcher';
import { VoiceRecorder } from '@/components/media/voice-recorder';
import { UploadProgressList } from '@/components/media/upload-progress';
import { useChatbot } from '@/hooks/use-chatbot';
import { useAuthStore } from '@/stores/auth-store';
import { useMediaUpload } from '@/hooks/use-media-upload';
import { cn, formatRelativeDate } from '@/lib/utils';

export function ChatInterface() {
  const { user } = useAuthStore();
  const {
    conversations, activeConversation, provider, isDemoMode,
    isLoading, setProvider, setIsDemoMode,
    sendTextMessage, sendMediaMessage, newConversation, setActiveConversationId,
  } = useChatbot();

  // Défensive: certains endpoints retournent parfois un objet enveloppe
  const conversationList = (Array.isArray(conversations)
    ? conversations
    : (conversations && typeof conversations === 'object' && Array.isArray((conversations as unknown as Record<string, unknown>).conversations))
    ? (conversations as unknown as Record<string, unknown>).conversations as Conversation[]
    : []) as Conversation[];

  const [input, setInput] = useState('');
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { uploads, removeUpload } = useMediaUpload({ endpoint: '/chatbot/upload' });

  const messages = useMemo(() => activeConversation?.messages || [], [activeConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  const handleVoiceSend = async (blob: Blob) => {
    const file = new File([blob], `voice-${Date.now()}.webm`, { type: blob.type });
    await sendMediaMessage('', [file]);
  };

  const canSend = (input.trim().length > 0 || pendingFiles.length > 0) && !isLoading;

  return (
    <div className="flex h-full">
      {/* Sidebar — conversation history */}
      <aside className="hidden lg:flex w-72 flex-col border-r border-border bg-card/30 backdrop-blur-xl">
        <div className="p-4 border-b border-border/50">
          <Button onClick={newConversation} className="w-full gap-2 shadow-sm hover:shadow-primary/20 transition-all" size="sm">
            <Plus className="h-4 w-4" />
            Nouvelle conversation
          </Button>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-2" aria-label="Historique des conversations">
          {conversationList.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center px-4">
              <p className="text-xs text-muted-foreground">Aucune conversation</p>
            </div>
            ) : (
            conversationList.slice(0, 15).map((conv, i) => (
              <motion.button
                key={conv.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setActiveConversationId(conv.id)}
                className={cn(
                  'w-full text-left px-4 py-3 rounded-xl text-sm transition-all relative group overflow-hidden',
                  activeConversation?.id === conv.id
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <div className="relative z-10 flex flex-col gap-0.5">
                  <p className="truncate font-semibold tracking-tight">{conv.title || 'Nouvelle conversation'}</p>
                  <div className="flex items-center gap-2">
                    <p className={cn("text-[10px] font-medium opacity-70", activeConversation?.id === conv.id ? "text-white" : "text-muted-foreground")}>
                      {conv.message_count} messages
                    </p>
                    <span className="text-[10px] opacity-30">·</span>
                    <p className={cn("text-[10px] font-medium opacity-70", activeConversation?.id === conv.id ? "text-white" : "text-muted-foreground")}>
                      {formatRelativeDate(conv.updated_at)}
                    </p>
                  </div>
                </div>
                {activeConversation?.id !== conv.id && (
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/0 to-primary/5 translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                )}
              </motion.button>
            ))
          )}
        </nav>
      </aside>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4" role="log" aria-live="polite" aria-label="Messages">
          {messages.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center min-h-full text-center py-12 px-4 max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-primary via-primary/80 to-accent flex items-center justify-center mb-8 shadow-lg shadow-primary/20 relative">
                  <Bot className="h-12 w-12 text-white" />
                  <motion.div 
                    className="absolute -inset-1 rounded-3xl bg-primary/20 -z-10"
                    animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.2, 0.5] }}
                    transition={{ repeat: Infinity, duration: 4 }}
                  />
                </div>
              </motion.div>

              <motion.h2 
                className="text-3xl font-extrabold mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Bonjour ! Je suis AgriBot
              </motion.h2>
              
              <motion.p 
                className="text-muted-foreground text-base max-w-lg mb-10"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Votre assistant agricole intelligent. Posez-moi des questions, envoyez des photos ou partagez des fichiers pour obtenir des analyses précises.
              </motion.p>

              {/* Capability Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 w-full">
                {[
                  { icon: '📝', label: 'Texte', desc: 'Questions & analyses', color: 'bg-blue-500/10 text-blue-500' },
                  { icon: '📷', label: 'Photo', desc: 'Diagnostic & visuel', color: 'bg-green-500/10 text-green-500' },
                  { icon: '🎙', label: 'Vocal', desc: 'Commandes vocales', color: 'bg-purple-500/10 text-purple-500' },
                  { icon: '📎', label: 'Fichier', desc: 'Import de données', color: 'bg-amber-500/10 text-amber-500' },
                ].map((item, i) => (
                  <motion.button
                    key={item.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    onClick={() => {
                      if (item.label === 'Photo') photoInputRef.current?.click();
                      if (item.label === 'Fichier') fileInputRef.current?.click();
                      textareaRef.current?.focus();
                    }}
                    className="flex flex-col items-center gap-3 p-5 rounded-2xl border border-border bg-card/50 backdrop-blur-sm hover:bg-card hover:shadow-xl hover:shadow-primary/5 transition-all text-center"
                  >
                    <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center text-2xl mb-1", item.color)}>
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold">{item.label}</h3>
                      <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">{item.desc}</p>
                    </div>
                  </motion.button>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="w-full"
              >
                <div className="flex items-center gap-2 mb-4 justify-center">
                  <div className="h-px w-8 bg-border" />
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Suggestions populaires</span>
                  <div className="h-px w-8 bg-border" />
                </div>
                <SuggestionChips onSelect={(text) => { setInput(text); textareaRef.current?.focus(); }} />
              </motion.div>
            </div>
          ) : (
            messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                userName={user?.name}
                userAvatar={user?.avatar}
              />
            ))
          )}

          {/* Typing indicator */}
          {isLoading && (
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 shadow-card">
                <div className="flex gap-1 items-center">
                  <span className="text-xs text-muted-foreground mr-2">AgriBot réfléchit</span>
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ y: [0, -6, 0] }}
                      transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                    >
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Pending files preview */}
        {pendingFiles.length > 0 && (
          <div className="px-4 py-2 border-t border-border flex gap-2 flex-wrap">
            {pendingFiles.map((f, i) => (
              <div key={i} className="relative">
                {f.type.startsWith('image/') ? (
                  <div className="relative h-16 w-16">
                    <Image
                      src={URL.createObjectURL(f)}
                      alt={f.name}
                      fill
                      unoptimized
                      className="object-cover rounded-lg border border-border"
                      sizes="64px"
                    />
                  </div>
                ) : (
                  <div className="h-16 w-16 rounded-lg border border-border bg-muted flex items-center justify-center">
                    <Paperclip className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
                <button
                  onClick={() => setPendingFiles((prev) => prev.filter((_, j) => j !== i))}
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-white flex items-center justify-center text-xs"
                  aria-label={`Supprimer ${f.name}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Upload progress */}
        {uploads.length > 0 && (
          <div className="px-4 py-2 border-t border-border">
            <UploadProgressList uploads={uploads} onRemove={removeUpload} />
          </div>
        )}

        {/* Input area */}
        <div className="border-t border-border p-3 bg-card">
          <div className="flex items-end gap-2">
            {/* Media buttons */}
            <div className="flex gap-1 shrink-0 pb-1">
              <input ref={photoInputRef} type="file" accept="image/*" capture="environment" multiple className="hidden" onChange={handleFileSelect} aria-label="Prendre une photo" />
              <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileSelect} aria-label="Choisir un fichier" />

              <Button
                variant="ghost"
                size="icon"
                onClick={() => photoInputRef.current?.click()}
                className="text-muted-foreground hover:text-primary"
                aria-label="Envoyer une photo"
              >
                <Camera className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                className="text-muted-foreground hover:text-primary"
                aria-label="Joindre un fichier"
              >
                <Paperclip className="h-5 w-5" />
              </Button>
            </div>

            {/* Text input */}
            <div className="flex-1">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Posez votre question agricole..."
                autoResize
                className="min-h-[40px] max-h-[120px] resize-none border-0 bg-muted/50 focus-visible:ring-1 rounded-xl"
                aria-label="Message"
              />
            </div>

            {/* Voice or Send */}
            <div className="shrink-0 pb-1">
              {canSend ? (
                <Button
                  size="icon"
                  onClick={handleSend}
                  disabled={isLoading}
                  className="rounded-full"
                  aria-label="Envoyer"
                >
                  <Send className="h-4 w-4" />
                </Button>
              ) : (
                <VoiceRecorder onSend={handleVoiceSend} />
              )}
            </div>
          </div>

          {/* Footer bar */}
          <div className="flex items-center justify-between mt-2 px-1">
            <ProviderSwitcher
              provider={provider}
              isDemoMode={isDemoMode}
              onProviderChange={setProvider}
              onDemoModeChange={setIsDemoMode}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
