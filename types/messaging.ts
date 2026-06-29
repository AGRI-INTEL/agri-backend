export interface Conversation {
  id: string;
  title: string | null;
  is_group: boolean;
  participants: ConversationParticipant[];
  last_message: {
    content: string | null;
    sender_id: string | null;
    created_at: string | null;
    message_type?: string | null;
  } | null;
  unread_count: number;
  updated_at: string | null;
}

export interface ConversationParticipant {
  id: string;
  name: string;
  avatar?: string;
  is_online?: boolean;
}

export interface PrivateMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string;
  sender_online?: boolean;
  content: string | null;
  message_type: string;
  is_edited: boolean;
  audio_url?: string;
  audio_duration?: number;
  file_url?: string;
  file_name?: string;
  file_type?: string;
  poll_data?: PollData;
  created_at: string | null;
}

export interface PollData {
  question: string;
  options: string[];
  votes: Record<string, number>;
}

export interface SearchUserResult {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
}
