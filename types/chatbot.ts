// ============================================================================
// SECTION 1: CORE TYPES & ENUMS
// ============================================================================

/**
 * Who sent the message in the conversation.
 */
export type MessageRole = 'user' | 'assistant' | 'system' | 'tool';

/**
 * Lifecycle state of a message.
 */
export type MessageStatus =
  | 'draft'        // Being composed, not yet sent
  | 'sending'      // Uploading / transmitting to server
  | 'queued'       // Waiting for LLM slot
  | 'streaming'    // Receiving tokens from LLM
  | 'sent'         // Delivered to server
  | 'received'     // Server acknowledged
  | 'read'         // User has seen it
  | 'error'        // Delivery or generation failed
  | 'cancelled';   // User aborted generation

/**
 * Available LLM providers.
 * Aligned with constants.ts LLM_PROVIDERS.
 */
export type LLMProvider =
  | 'kimi'       // Kimi K2.6 - Moonshot AI
  | 'deepseek'   // DeepSeek V3
  | 'openai';    // GPT-4o - OpenAI

/**
 * Supported languages for the chatbot interface.
 */
export type ChatLanguage =
  | 'fr'  // Français (default)
  | 'en'  // English
  | 'wo'  // Wolof
  | 'ha'  // Hausa
  | 'ar'  // Arabic
  | 'sw'  // Swahili
  | 'pt'  // Portuguese
  | 'bm'  // Bambara
  | 'dy'; // Dyula

// ============================================================================
// SECTION 2: MEDIA & ATTACHMENTS
// ============================================================================

/**
 * MIME type categories for uploaded / embedded media.
 */
export type MessageMediaType =
  | 'text'      // Plain text (default)
  | 'image'     // Static image
  | 'audio'     // Voice message or audio file
  | 'video'     // Video clip
  | 'document'  // PDF, Word, etc.
  | 'table'     // Structured data table
  | 'chart'     // Data visualization
  | 'map'       // Geographic map
  | 'card'      // Rich info card
  | 'sql'       // SQL query block
  | 'code'      // Code snippet with syntax highlighting
  | 'mixed';    // Multiple content types combined

/**
 * A single media attachment inside a message.
 */
export interface MessageMedia {
  /** Unique identifier for this attachment */
  id: string;
  /** Media category */
  type: 'image' | 'audio' | 'video' | 'document';
  /** Public or blob URL */
  url: string;
  /** Original filename */
  filename?: string;
  /** File size in bytes */
  size?: number;
  /** Duration in seconds (audio/video) */
  duration?: number;
  /** Thumbnail/preview URL */
  thumbnail?: string;
  /** MIME type */
  mime_type?: string;
  /** Upload progress 0-1 */
  upload_progress?: number;
  /** Whether upload is complete */
  upload_complete?: boolean;
}

// ============================================================================
// SECTION 3: RICH CONTENT BLOCKS
// ============================================================================

/**
 * Supported chart / graph types.
 */
export type ChartType =
  | 'bar'
  | 'line'
  | 'pie'
  | 'area'
  | 'scatter'
  | 'radar'
  | 'heatmap'
  | 'funnel'
  | 'gauge';

/**
 * Chart axis configuration.
 */
export interface ChartAxis {
  key: string;
  label?: string;
  type?: 'category' | 'number' | 'date';
  format?: string;
  min?: number;
  max?: number;
}

/**
 * A data visualization block.
 */
export interface ChartData {
  type: ChartType;
  title?: string;
  subtitle?: string;
  /** Row-oriented data */
  data: Record<string, unknown>[];
  /** X-axis field name */
  x_key: string;
  /** Y-axis field names */
  y_keys: string[];
  /** Optional color palette (hex) */
  colors?: string[];
  /** Axis configs */
  x_axis?: ChartAxis;
  y_axis?: ChartAxis;
  /** Whether to show legend */
  show_legend?: boolean;
  /** Whether to show tooltips */
  show_tooltips?: boolean;
  /** Stacked (for bar/area) */
  stacked?: boolean;
  /** Animation duration ms */
  animation_duration?: number;
}

/**
 * A structured data table block.
 */
export interface TableData {
  /** Column headers */
  headers: string[];
  /** Row data — aligned with headers */
  rows: (string | number | null)[][];
  /** Whether columns are sortable */
  sortable?: boolean;
  /** Default sort column index */
  default_sort_column?: number;
  /** Default sort direction */
  default_sort_direction?: 'asc' | 'desc';
  /** Column alignment overrides */
  column_align?: ('left' | 'center' | 'right')[];
  /** Pagination */
  page_size?: number;
  /** Total rows (if paginated server-side) */
  total_rows?: number;
}

/**
 * A geographic point on an embedded map.
 */
export interface MapPoint {
  /** Latitude */
  lat: number;
  /** Longitude */
  lng: number;
  /** Display label */
  label?: string;
  /** Popup info (HTML or markdown) */
  info?: string;
  /** Marker color (hex) */
  color?: string;
  /** Marker size */
  size?: number;
  /** Optional icon identifier */
  icon?: string;
  /** Related sector */
  sector?: 'vegetal' | 'animal' | 'halieutique' | 'forestier' | 'minier' | 'industriel';
}

/**
 * A rich info card (e.g. actor profile, market summary).
 */
export interface InfoCard {
  /** Card title */
  title: string;
  /** Description / body */
  description: string;
  /** Hero image URL */
  image?: string;
  /** Category tags */
  tags?: string[];
  /** CTA link */
  link?: string;
  /** Link label */
  link_label?: string;
  /** Metadata key-value pairs */
  metadata?: Record<string, string>;
  /** Card accent color (hex) */
  accent_color?: string;
}

/**
 * A syntax-highlighted code block.
 */
export interface CodeBlock {
  /** Programming language */
  language: string;
  /** Source code */
  code: string;
  /** Whether to show line numbers */
  show_line_numbers?: boolean;
  /** Whether the block is collapsible */
  collapsible?: boolean;
  /** Collapsed by default */
  collapsed?: boolean;
  /** File name hint */
  filename?: string;
}

// ============================================================================
// SECTION 4: MESSAGE ENTITY
// ============================================================================

/**
 * A single message within a conversation.
 */
export interface Message {
  /** Unique message ID (UUID) */
  id: string;
  /** Parent conversation ID */
  conversation_id: string;
  /** Who sent it */
  role: MessageRole;
  /** Primary text content (markdown supported) */
  content: string;
  /** Content type discriminator */
  media_type: MessageMediaType;

  // ── Attachments ──
  /** Uploaded files / media */
  media?: MessageMedia[];

  // ── Rich blocks ──
  /** Data visualization */
  chart?: ChartData;
  /** Structured table */
  table?: TableData;
  /** Geographic points */
  map_points?: MapPoint[];
  /** Info cards */
  info_cards?: InfoCard[];
  /** Code snippet */
  code?: CodeBlock;

  // ── AI-specific ──
  /** Generated SQL query */
  sql_query?: string;
  /** Source citations / references */
  sources?: MessageSource[];
  /** Thinking / reasoning chain (for reasoning models) */
  reasoning?: string;
  /** Suggested follow-up questions */
  suggestions?: string[];

  // ── Metadata ──
  /** Delivery state */
  status: MessageStatus;
  /** Creation timestamp (ISO 8601) */
  created_at: string;
  /** Last update timestamp */
  updated_at?: string;
  /** Token consumption (input + output) */
  tokens_used?: number;
  /** Input tokens only */
  tokens_input?: number;
  /** Output tokens only */
  tokens_output?: number;
  /** Generation latency in ms */
  latency_ms?: number;
  /** Which model generated this (for multi-model convos) */
  model?: string;
  /** User feedback: thumbs up / down */
  feedback?: 'positive' | 'negative' | null;
  /** User feedback text */
  feedback_text?: string;
}

/**
 * A citation / source reference attached to an assistant message.
 */
export interface MessageSource {
  /** Source ID or index */
  id: string;
  /** Display title */
  title: string;
  /** Source URL */
  url?: string;
  /** Snippet / excerpt */
  snippet?: string;
  /** Source type */
  type?: 'document' | 'web' | 'database' | 'api' | 'internal';
  /** Relevance score 0-1 */
  relevance?: number;
}

// ============================================================================
// SECTION 5: CONVERSATION ENTITY
// ============================================================================

/**
 * A chat conversation (thread).
 */
export interface Conversation {
  /** Unique conversation ID */
  id: string;
  /** Human-readable title (auto-generated or user-edited) */
  title: string;
  /** Messages in chronological order */
  messages: Message[];
  /** Primary LLM provider for this conversation */
  provider: LLMProvider;
  /** Specific model version (e.g. "kimi-k2.6", "gpt-4o") */
  model?: string;
  /** Creation timestamp */
  created_at: string;
  /** Last message timestamp */
  updated_at: string;
  /** Number of messages (cached for performance) */
  message_count: number;
  /** Total token usage for this conversation */
  total_tokens?: number;
  /** Whether the conversation is pinned */
  is_pinned?: boolean;
  /** Whether the conversation is archived */
  is_archived?: boolean;
  /** User-defined tags */
  tags?: string[];
  /** Related sector context */
  sector_context?: 'vegetal' | 'animal' | 'halieutique' | 'forestier' | 'minier' | 'industriel' | 'general';
  /** System prompt / persona used */
  system_prompt?: string;
}

/**
 * Summary of a conversation for list views.
 */
export interface ConversationSummary {
  id: string;
  title: string;
  preview: string;          // First ~100 chars of last message
  provider: LLMProvider;
  message_count: number;
  updated_at: string;
  is_pinned: boolean;
  is_archived: boolean;
  unread_count?: number;
}

// ============================================================================
// SECTION 6: CHATBOT STATE & CONFIG
// ============================================================================

/**
 * Global chatbot UI state (Redux / Zustand store shape).
 */
export interface ChatbotState {
  /** All loaded conversations */
  conversations: Conversation[];
  /** Currently open conversation ID */
  active_conversation_id?: string;
  /** Default provider for new conversations */
  provider: LLMProvider;
  /** Whether demo mode is active */
  is_demo_mode: boolean;
  /** Whether a message is being generated */
  is_loading: boolean;
  /** Whether the sidebar is open (desktop) */
  sidebar_open: boolean;
  /** Current input text (draft) */
  input_draft: string;
  /** Whether voice input is active */
  is_recording: boolean;
  /** Selected language for the chatbot UI */
  language: ChatLanguage;
  /** Whether streaming is enabled */
  streaming_enabled: boolean;
  /** Error message if any */
  error?: string;
}

/**
 * Chatbot configuration / settings.
 */
export interface ChatbotConfig {
  /** Default provider for new chats */
  default_provider: LLMProvider;
  /** Default language */
  default_language: ChatLanguage;
  /** Max messages to keep in context window */
  max_history: number;
  /** Max characters per message input */
  max_message_length: number;
  /** Enable streaming responses */
  streaming: boolean;
  /** Enable voice input */
  voice_input: boolean;
  /** Enable rich content (charts, maps, etc.) */
  rich_content: boolean;
  /** Enable message feedback */
  feedback_enabled: boolean;
  /** Suggested questions shown on empty state */
  suggestions: string[];
  /** System prompt template */
  system_prompt_template: string;
}

// ============================================================================
// SECTION 7: VOICE & AUDIO
// ============================================================================

/**
 * A recorded voice message.
 */
export interface VoiceRecording {
  /** Raw audio blob */
  blob: Blob;
  /** Object URL for playback */
  url: string;
  /** Duration in seconds */
  duration: number;
  /** Normalized waveform amplitudes (0-1) */
  waveform: number[];
  /** Recording sample rate */
  sample_rate?: number;
  /** MIME type of the recording */
  mime_type?: string;
  /** Transcribed text (if STT completed) */
  transcript?: string;
  /** Whether transcription is in progress */
  transcribing?: boolean;
}

/**
 * Text-to-speech settings.
 */
export interface TTSConfig {
  enabled: boolean;
  /** Voice identifier */
  voice?: string;
  /** Speed multiplier */
  speed?: number;
  /** Pitch adjustment */
  pitch?: number;
  /** Volume 0-1 */
  volume?: number;
  /** Auto-play assistant responses */
  auto_play?: boolean;
}

// ============================================================================
// SECTION 8: STREAMING & REAL-TIME
// ============================================================================

/**
 * A partial chunk received during streaming.
 */
export interface StreamChunk {
  /** Chunk ID (for ordering) */
  id: string;
  /** Conversation ID */
  conversation_id: string;
  /** Message ID being built */
  message_id: string;
  /** Chunk type */
  type: 'text' | 'thinking' | 'tool_call' | 'tool_result' | 'error' | 'done';
  /** Chunk payload */
  content: string;
  /** Whether this is the final chunk */
  is_final: boolean;
  /** Timestamp */
  timestamp: string;
}

/**
 * Tool call invoked by the LLM.
 */
export interface ToolCall {
  /** Unique call ID */
  id: string;
  /** Tool name */
  name: string;
  /** JSON arguments */
  arguments: Record<string, unknown>;
  /** Call timestamp */
  created_at: string;
}

/**
 * Result of a tool execution.
 */
export interface ToolResult {
  /** Matching call ID */
  call_id: string;
  /** Success or failure */
  success: boolean;
  /** Result payload (JSON-serializable) */
  data?: unknown;
  /** Error message if failed */
  error?: string;
  /** Execution latency ms */
  latency_ms?: number;
}

// ============================================================================
// SECTION 9: API REQUESTS / RESPONSES
// ============================================================================

/**
 * Payload to send a new message.
 */
export interface SendMessageRequest {
  /** Conversation ID (omit to create new) */
  conversation_id?: string;
  /** Message text */
  content: string;
  /** Optional media attachments */
  media?: Omit<MessageMedia, 'id' | 'upload_progress' | 'upload_complete'>[];
  /** Desired provider (override default) */
  provider?: LLMProvider;
  /** Desired model (override provider default) */
  model?: string;
  /** Whether to stream the response */
  stream?: boolean;
  /** System prompt override */
  system_prompt?: string;
}

/**
 * Response after sending a message.
 */
export interface SendMessageResponse {
  /** The user message that was created */
  user_message: Message;
  /** The assistant response (if not streaming) */
  assistant_message?: Message;
  /** Streaming session ID (if streaming) */
  stream_id?: string;
  /** Usage stats */
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Request to regenerate the last assistant message.
 */
export interface RegenerateRequest {
  conversation_id: string;
  message_id: string;
  /** Use a different provider for regeneration */
  provider?: LLMProvider;
}

/**
 * Request to edit a user message (and regenerate from that point).
 */
export interface EditMessageRequest {
  conversation_id: string;
  message_id: string;
  new_content: string;
}

// ============================================================================
// SECTION 10: CONSTANTS & DEFAULTS
// ============================================================================

/** Default chatbot name — aligned with constants.ts */
export const CHATBOT_NAME = 'AgriBot';

/** Default avatar path */
export const CHATBOT_AVATAR = '/images/agribot-avatar.png';

/** Max conversation history to send to LLM */
export const DEFAULT_MAX_HISTORY = 50;

/** Max message input length */
export const DEFAULT_MAX_MESSAGE_LENGTH = 2000;

/** Default system prompt for agricultural context */
export const DEFAULT_SYSTEM_PROMPT = `Tu es AgriBot, un assistant agricole intelligent spécialisé sur l'Afrique. Tu aides les producteurs, éleveurs, pêcheurs et autres acteurs agricoles avec des données précises, des prédictions et des conseils pratiques. Réponds toujours en français sauf demande contraire. Utilise des données chiffrées quand possible.`;

/** Default suggestions shown on empty state */
export const DEFAULT_SUGGESTIONS = [
  '📊 Quel est le rendement moyen du maïs au Sénégal ?',
  '💰 Compare les prix du riz entre le Ghana et le Nigeria',
  '🌧 Y a-t-il des alertes sécheresse cette semaine ?',
  '🔮 Prédire la production d\'arachide en 2026',
  '🐄 Quels sont les vaccins obligatoires pour les bovins ?',
  '🎣 Quelles sont les zones de pêche interdites actuellement ?',
  '🌱 Quelle est la meilleure période pour semer le mil au Burkina ?',
  '📈 Évolution des prix du cacao sur les 6 derniers mois',
] as const;

/** Provider display info */
export const PROVIDER_INFO: Record<LLMProvider, {
  name: string;
  emoji: string;
  description: string;
  max_tokens: number;
  supports_streaming: boolean;
  supports_vision: boolean;
  supports_tools: boolean;
}> = {
  kimi: {
    name: 'Kimi',
    emoji: '🧠',
    description: 'Kimi K2.6 - Moonshot AI',
    max_tokens: 200_000,
    supports_streaming: true,
    supports_vision: true,
    supports_tools: true,
  },
  deepseek: {
    name: 'DeepSeek',
    emoji: '🧠',
    description: 'DeepSeek V3',
    max_tokens: 64_000,
    supports_streaming: true,
    supports_vision: false,
    supports_tools: true,
  },
  openai: {
    name: 'GPT-4o',
    emoji: '🧠',
    description: 'GPT-4o - OpenAI',
    max_tokens: 128_000,
    supports_streaming: true,
    supports_vision: true,
    supports_tools: true,
  },
};

// ============================================================================
// SECTION 11: UTILITY FUNCTIONS
// ============================================================================

/**
 * Get provider display name.
 */
export function getProviderName(provider: LLMProvider): string {
  return PROVIDER_INFO[provider]?.name ?? provider;
}

/**
 * Get provider description.
 */
export function getProviderDescription(provider: LLMProvider): string {
  return PROVIDER_INFO[provider]?.description ?? provider;
}

/**
 * Check if provider supports streaming.
 */
export function supportsStreaming(provider: LLMProvider): boolean {
  return PROVIDER_INFO[provider]?.supports_streaming ?? false;
}

/**
 * Check if provider supports vision (image input).
 */
export function supportsVision(provider: LLMProvider): boolean {
  return PROVIDER_INFO[provider]?.supports_vision ?? false;
}

/**
 * Check if provider supports tool calling.
 */
export function supportsTools(provider: LLMProvider): boolean {
  return PROVIDER_INFO[provider]?.supports_tools ?? false;
}

/**
 * Get max context length for a provider.
 */
export function getMaxTokens(provider: LLMProvider): number {
  return PROVIDER_INFO[provider]?.max_tokens ?? 4_000;
}

/**
 * Check if a message is from the user.
 */
export function isUserMessage(message: Message): boolean {
  return message.role === 'user';
}

/**
 * Check if a message is from the assistant.
 */
export function isAssistantMessage(message: Message): boolean {
  return message.role === 'assistant';
}

/**
 * Check if a message is a system message.
 */
export function isSystemMessage(message: Message): boolean {
  return message.role === 'system';
}

/**
 * Check if a message is in a loading / pending state.
 */
export function isMessagePending(message: Message): boolean {
  return ['sending', 'queued', 'streaming'].includes(message.status);
}

/**
 * Check if a message has failed.
 */
export function isMessageFailed(message: Message): boolean {
  return message.status === 'error';
}

/**
 * Get the last user message in a conversation.
 */
export function getLastUserMessage(conversation: Conversation): Message | undefined {
  return [...conversation.messages].reverse().find((m) => m.role === 'user');
}

/**
 * Get the last assistant message in a conversation.
 */
export function getLastAssistantMessage(conversation: Conversation): Message | undefined {
  return [...conversation.messages].reverse().find((m) => m.role === 'assistant');
}

/**
 * Count tokens in a conversation (approximate).
 */
export function getConversationTokenCount(conversation: Conversation): number {
  return conversation.messages.reduce(
    (sum, m) => sum + (m.tokens_used ?? 0),
    0
  );
}

/**
 * Truncate conversation history to fit within token limit.
 */
export function truncateConversation(
  conversation: Conversation,
  maxTokens: number
): Message[] {
  const messages = [...conversation.messages];
  let total = getConversationTokenCount(conversation);

  // Remove oldest messages until under limit (keep system prompt if present)
  while (total > maxTokens && messages.length > 1) {
    const removed = messages.shift();
    if (removed) total -= removed.tokens_used ?? 0;
  }

  return messages;
}

/**
 * Generate a conversation title from the first user message.
 */
export function generateConversationTitle(conversation: Conversation): string {
  const firstUser = conversation.messages.find((m) => m.role === 'user');
  if (!firstUser) return 'Nouvelle conversation';

  const text = firstUser.content.trim();
  if (text.length <= 40) return text;
  return text.slice(0, 37) + '...';
}

/**
 * Create an empty conversation.
 */
export function createConversation(
  provider: LLMProvider = 'kimi',
  title?: string
): Conversation {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID?.() ?? `conv-${Date.now()}`,
    title: title ?? 'Nouvelle conversation',
    messages: [],
    provider,
    created_at: now,
    updated_at: now,
    message_count: 0,
  };
}

/**
 * Create a user message.
 */
export function createUserMessage(
  conversationId: string,
  content: string,
  media?: MessageMedia[]
): Message {
  return {
    id: crypto.randomUUID?.() ?? `msg-${Date.now()}`,
    conversation_id: conversationId,
    role: 'user',
    content,
    media_type: media && media.length > 0 ? 'mixed' : 'text',
    media,
    status: 'sending',
    created_at: new Date().toISOString(),
  };
}

/**
 * Create an assistant message placeholder (for streaming).
 */
export function createAssistantPlaceholder(
  conversationId: string
): Message {
  return {
    id: crypto.randomUUID?.() ?? `msg-${Date.now()}`,
    conversation_id: conversationId,
    role: 'assistant',
    content: '',
    media_type: 'text',
    status: 'streaming',
    created_at: new Date().toISOString(),
  };
}

// ============================================================================
// SECTION 12: EXPORT GROUPING
// ============================================================================

export const ChatbotTypes = {
  CHATBOT_NAME,
  CHATBOT_AVATAR,
  DEFAULT_MAX_HISTORY,
  DEFAULT_MAX_MESSAGE_LENGTH,
  DEFAULT_SYSTEM_PROMPT,
  DEFAULT_SUGGESTIONS,
  PROVIDER_INFO,
  getProviderName,
  getProviderDescription,
  supportsStreaming,
  supportsVision,
  supportsTools,
  getMaxTokens,
  isUserMessage,
  isAssistantMessage,
  isSystemMessage,
  isMessagePending,
  isMessageFailed,
  getLastUserMessage,
  getLastAssistantMessage,
  getConversationTokenCount,
  truncateConversation,
  generateConversationTitle,
  createConversation,
  createUserMessage,
  createAssistantPlaceholder,
} as const;
