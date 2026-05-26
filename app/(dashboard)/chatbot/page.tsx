import type { Metadata } from 'next';
import { ChatInterface } from '@/components/chatbot/chat-interface';

export const metadata: Metadata = { title: 'AgriBot IA' };

export default function ChatbotPage() {
  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      <ChatInterface />
    </div>
  );
}
