'use client';

import { useState } from 'react';
import { motion } from '@/lib/motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ThumbsUp, ThumbsDown, RotateCcw, Copy, Share2, Bot, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserAvatar } from '@/components/ui/avatar';
import { MediaGrid } from '@/components/media/media-grid';
import { formatRelativeDate, cn } from '@/lib/utils';
import type { Message } from '@/types/chatbot';
import type { PostMedia } from '@/types/community';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

interface MessageBubbleProps {
  message: Message;
  onRegenerate?: () => void;
  userName?: string;
  userAvatar?: string;
}

const CHART_COLORS = ['#16A34A', '#D97706', '#0891B2', '#92400E', '#8B5CF6'];

function MiniChart({ chart }: { chart: NonNullable<Message['chart']> }) {
  return (
    <div className="mt-3 rounded-card border border-border p-3 bg-muted/30">
      {chart.title && <p className="text-xs font-semibold mb-2 text-muted-foreground">{chart.title}</p>}
      <ResponsiveContainer width="100%" height={160}>
        {chart.type === 'bar' ? (
          <BarChart data={chart.data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey={chart.x_key} tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip contentStyle={{ fontSize: 11 }} />
            {chart.y_keys.map((k, i) => (
              <Bar key={k} dataKey={k} fill={CHART_COLORS[i % CHART_COLORS.length]} radius={[2, 2, 0, 0]} />
            ))}
          </BarChart>
        ) : chart.type === 'pie' ? (
          <PieChart>
            <Pie data={chart.data} dataKey={chart.y_keys[0]} nameKey={chart.x_key} cx="50%" cy="50%" outerRadius={60}>
              {chart.data.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ fontSize: 11 }} />
          </PieChart>
        ) : (
          <LineChart data={chart.data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey={chart.x_key} tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip contentStyle={{ fontSize: 11 }} />
            {chart.y_keys.map((k, i) => (
              <Line key={k} type="monotone" dataKey={k} stroke={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={2} dot={false} />
            ))}
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

function DataTable({ table }: { table: NonNullable<Message['table']> }) {
  return (
    <div className="mt-3 overflow-x-auto rounded-card border border-border">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-primary/10">
            {table.headers.map((h) => (
              <th key={h} className="px-3 py-2 text-left font-semibold text-foreground whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, i) => (
            <tr key={i} className="border-t border-border hover:bg-muted/30 transition-colors">
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2 text-muted-foreground whitespace-nowrap font-data">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function MessageBubble({ message, onRegenerate, userName = 'Vous', userAvatar }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Convert message media to PostMedia format
  const postMedia: PostMedia[] = (message.media || []).map((m) => ({
    id: m.url,
    type: m.type,
    url: m.url,
    thumbnail: m.thumbnail,
    filename: m.filename,
    size: m.size,
    duration: m.duration,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
    >
      <div className={cn('flex gap-4 group mb-1', isUser ? 'flex-row-reverse' : 'flex-row')}>
        {/* Avatar */}
        <div className="shrink-0 mt-1">
          {isUser ? (
            <UserAvatar src={userAvatar} name={userName} size="sm" className="ring-2 ring-primary/20 shadow-sm" />
          ) : (
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
              <Bot className="h-5 w-5 text-white" />
            </div>
          )}
        </div>

        <div className={cn('flex flex-col gap-1.5 max-w-[85%]', isUser ? 'items-end' : 'items-start')}>
          {/* Bubble */}
          <div className={cn(
            'rounded-3xl px-5 py-3.5 text-sm leading-relaxed relative overflow-hidden transition-all duration-300',
            isUser
              ? 'bg-primary text-primary-foreground rounded-tr-sm shadow-md shadow-primary/10'
              : 'bg-card border border-border/50 text-foreground rounded-tl-sm shadow-xl shadow-black/5 backdrop-blur-sm'
          )}>
            {/* Subtle glow for bot */}
            {!isUser && (
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl -z-10" />
            )}

            {/* Media attachments */}
            {postMedia.length > 0 && (
              <div className="mb-3 rounded-2xl overflow-hidden shadow-inner">
                <MediaGrid media={postMedia} />
              </div>
            )}

            {/* Text content */}
            {message.content && (
              <div className={cn(
                "prose prose-sm max-w-none",
                isUser ? "prose-invert text-primary-foreground" : "dark:prose-invert"
              )}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {message.content}
                </ReactMarkdown>
              </div>
            )}

            {/* Chart */}
            {message.chart && <MiniChart chart={message.chart} />}

            {/* Table */}
            {message.table && <DataTable table={message.table} />}

            {/* SQL */}
            {message.sql_query && (
              <div className="mt-4 rounded-xl bg-slate-950 p-4 font-mono text-xs text-green-400 overflow-x-auto shadow-inner border border-white/5">
                <p className="text-slate-500 text-[10px] mb-2 uppercase tracking-widest font-bold">Requête SQL</p>
                <pre className="opacity-90 leading-relaxed">{message.sql_query}</pre>
              </div>
            )}

            {/* Sources */}
            {message.sources && message.sources.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border/50">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-2">Sources vérifiées</p>
                <div className="flex flex-wrap gap-2">
                  {message.sources.map((s) => (
                    <Badge key={s.id} variant="secondary" className="text-[10px] py-0 h-5 bg-muted/50 hover:bg-muted border-none font-medium">
                      {s.title}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Timestamp + status */}
          <div className="flex items-center gap-3 px-2">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-tighter opacity-70">
              {formatRelativeDate(message.created_at)}
            </span>
            {isUser && (
              <div className="flex items-center gap-0.5">
                <span className={cn(
                  "text-[10px] font-bold tracking-tighter",
                  message.status === 'read' ? 'text-primary' : 'text-muted-foreground'
                )}>
                  {message.status === 'read' ? 'REÇU' : message.status === 'received' ? 'TRANSMI' : 'ENVOI...'}
                </span>
                <div className="flex -space-x-1">
                  <Check className={cn("h-2.5 w-2.5", (message.status === 'received' || message.status === 'read') ? "text-primary" : "text-muted-foreground")} />
                  <Check className={cn("h-2.5 w-2.5", message.status === 'read' ? "text-primary" : "text-muted-foreground")} />
                </div>
              </div>
            )}
          </div>

          {/* Actions (bot messages only) */}
          {!isUser && (
            <div className="flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0 px-2">
              <div className="flex items-center bg-card/80 backdrop-blur-sm border border-border/50 rounded-full p-0.5 shadow-sm">
                <Button variant="ghost" size="icon-sm" className="h-7 w-7 rounded-full hover:bg-primary/10 hover:text-primary" aria-label="J'aime">
                  <ThumbsUp className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon-sm" className="h-7 w-7 rounded-full hover:bg-destructive/10 hover:text-destructive" aria-label="Je n'aime pas">
                  <ThumbsDown className="h-3.5 w-3.5" />
                </Button>
                <div className="w-px h-4 bg-border mx-0.5" />
                {onRegenerate && (
                  <Button variant="ghost" size="icon-sm" className="h-7 w-7 rounded-full hover:bg-primary/10 hover:text-primary" onClick={onRegenerate} aria-label="Régénérer">
                    <RotateCcw className="h-3.5 w-3.5" />
                  </Button>
                )}
                <Button variant="ghost" size="icon-sm" className="h-7 w-7 rounded-full hover:bg-primary/10 hover:text-primary" onClick={handleCopy} aria-label="Copier">
                  {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
                <Button variant="ghost" size="icon-sm" className="h-7 w-7 rounded-full hover:bg-primary/10 hover:text-primary" aria-label="Partager">
                  <Share2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
