"use client";

import React, { useState } from 'react';
import { useGroupMessages, useSendGroupMessage } from '@/hooks/use-community';
import { Button } from '@/components/ui/button';

interface GroupThreadProps {
  groupId: string;
}

export function GroupThread({ groupId }: GroupThreadProps) {
  const { data, isLoading } = useGroupMessages(groupId);
  const send = useSendGroupMessage();
  const [text, setText] = useState('');

  const messages: any[] = data || [];

  return (
    <div className="space-y-3">
      <div className="max-h-64 overflow-auto p-2 bg-card border border-border rounded-md">
        {isLoading ? (
          <p>Chargement...</p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun message</p>
        ) : (
          messages.map((m) => (
            <div key={m.id || m.created_at} className="mb-2">
              <div className="text-xs text-muted-foreground">{m.author?.name || m.user || 'Anonyme'}</div>
              <div className="bg-background p-2 rounded-md">{m.content || m.message}</div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); if (!text.trim()) return; send.mutate({ groupId, content: text }); setText(''); }} className="flex gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Envoyer un message" className="flex-1 rounded-input border border-input px-3 py-2" />
        <Button type="submit" disabled={send.isPending}>Envoyer</Button>
      </form>
    </div>
  );
}

export default GroupThread;
