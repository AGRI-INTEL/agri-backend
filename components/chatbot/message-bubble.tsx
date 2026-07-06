'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ThumbsUp, ThumbsDown, RotateCcw, Copy, Share2, Bot, Check, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatRelativeDate, cn } from '@/lib/utils';
import type { Message } from '@/types/chatbot';

interface MessageBubbleProps {
  message: Message;
  onRegenerate?: () => void;
  userName?: string;
  userAvatar?: string;
}

function CodeBlock({ language, code }: { language?: string; code: string }) {
  return (
    <div className="my-3 rounded-xl bg-[#0c0f15] border border-white/[0.06] overflow-hidden">
      {language && (
        <div className="px-4 py-1.5 border-b border-white/[0.06] bg-white/[0.02]">
          <span className="text-[10px] font-medium text-white/40 uppercase tracking-wider">{language}</span>
        </div>
      )}
      <pre className="p-4 overflow-x-auto text-[13px] leading-relaxed">
        <code className="text-green-400/90 font-mono">{code}</code>
      </pre>
    </div>
  );
}

export function MessageBubble({ message, onRegenerate, userName = 'Vous' }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn('flex gap-3 group', isUser ? 'flex-row-reverse' : 'flex-row')}>
      {/* Avatar */}
      <div className="shrink-0 mt-0.5">
        {isUser ? (
          <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
            <User className="h-4 w-4 text-primary/60" />
          </div>
        ) : (
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-sm shadow-green-500/20">
            <Bot className="h-4 w-4 text-white" />
          </div>
        )}
      </div>

      {/* Bubble */}
      <div className={cn('flex flex-col gap-1', isUser ? 'items-end' : 'items-start', 'max-w-[80%]')}>
        <div
          className={cn(
            'px-4 py-2.5 text-sm leading-relaxed relative',
            isUser
              ? 'bg-primary text-primary-foreground rounded-2xl rounded-tr-sm shadow-sm'
              : 'bg-card border border-border/40 rounded-2xl rounded-tl-sm shadow-sm',
          )}
        >
          {/* Markdown content */}
          {message.content && (
            <div
              className={cn(
                'prose prose-sm max-w-none',
                isUser ? 'prose-invert' : 'prose-zinc dark:prose-invert',
                '[&_p]:leading-relaxed [&_p:first-child]:mt-0 [&_p:last-child]:mb-0',
                '[&_ul]:my-1 [&_ol]:my-1',
                '[&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm [&_h4]:text-sm',
                '[&_h1]:font-bold [&_h2]:font-semibold [&_h3]:font-semibold',
                '[&_h1]:mt-3 [&_h2]:mt-3 [&_h3]:mt-2 [&_h1]:mb-1 [&_h2]:mb-1 [&_h3]:mb-1',
                '[&_table]:text-xs [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1',
                '[&_code]:text-[13px] [&_code]:bg-muted/50 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded',
                '[&_pre]:!bg-transparent [&_pre]:!p-0 [&_pre]:!border-0',
                '[&_hr]:my-3 [&_hr]:border-border/30',
                '[&_blockquote]:border-l-2 [&_blockquote]:border-primary/30 [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground/80 [&_blockquote]:italic [&_blockquote]:my-2',
              )}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    const code = String(children).replace(/\n$/, '');
                    if (match) {
                      return <CodeBlock language={match[1]} code={code} />;
                    }
                    return <code className="text-[13px] bg-muted/50 px-1 py-0.5 rounded before:hidden after:hidden" {...props}>{children}</code>;
                  },
                  table({ children }) {
                    return (
                      <div className="my-3 overflow-x-auto rounded-lg border border-border/40">
                        <table className="w-full text-xs">{children}</table>
                      </div>
                    );
                  },
                  th({ children }) {
                    return <th className="bg-muted/30 text-left font-semibold text-foreground px-3 py-2 whitespace-nowrap">{children}</th>;
                  },
                  td({ children }) {
                    return <td className="px-3 py-1.5 border-t border-border/20 text-muted-foreground">{children}</td>;
                  },
                  a({ href, children }) {
                    return (
                      <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary/80 hover:text-primary underline underline-offset-2 decoration-primary/20">
                        {children}
                      </a>
                    );
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}

          {/* SQL block */}
          {message.sql_query && (
            <div className="mt-3 rounded-lg bg-[#0c0f15] border border-white/[0.06] p-3">
              <p className="text-[9px] text-white/30 uppercase tracking-widest font-semibold mb-1.5">Requête SQL</p>
              <pre className="text-[12px] text-green-400/80 font-mono leading-relaxed overflow-x-auto">{message.sql_query}</pre>
            </div>
          )}
        </div>

        {/* Timestamp */}
        <div className="flex items-center gap-2 px-1">
          <span className="text-[10px] font-medium text-muted-foreground/50">
            {formatRelativeDate(message.created_at)}
          </span>
          {isUser && message.status === 'sent' && (
            <Check className="h-3 w-3 text-muted-foreground/40" />
          )}
        </div>

        {/* Actions (bot only) */}
        {!isUser && message.content && (
          <div className="flex items-center gap-1 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 px-1">
            <div className="flex items-center gap-0.5">
              <Button variant="ghost" size="icon-sm" className="h-6 w-6 rounded-full text-muted-foreground/40 hover:text-green-500 hover:bg-green-500/5">
                <ThumbsUp className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="icon-sm" className="h-6 w-6 rounded-full text-muted-foreground/40 hover:text-red-500 hover:bg-red-500/5">
                <ThumbsDown className="h-3 w-3" />
              </Button>
              {onRegenerate && (
                <Button variant="ghost" size="icon-sm" className="h-6 w-6 rounded-full text-muted-foreground/40 hover:text-foreground">
                  <RotateCcw className="h-3 w-3" />
                </Button>
              )}
              <Button variant="ghost" size="icon-sm" className="h-6 w-6 rounded-full text-muted-foreground/40 hover:text-foreground" onClick={handleCopy}>
                {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
              </Button>
              <Button variant="ghost" size="icon-sm" className="h-6 w-6 rounded-full text-muted-foreground/40 hover:text-foreground">
                <Share2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
