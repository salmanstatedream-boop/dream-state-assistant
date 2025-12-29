import { useEffect, useRef } from 'react';
import { MessageBubble, TypingIndicator, Message } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { MessageSquare } from 'lucide-react';

interface ChatWindowProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export function ChatWindow({ messages, onSendMessage, isLoading }: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-background to-background/95">
      {/* Messages Area */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 scroll-smooth"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 py-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 shadow-lg">
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              Welcome to Dream State
            </h2>
            <p className="text-muted-foreground max-w-md leading-relaxed text-sm sm:text-base">
              Your intelligent property management assistant is ready to help. Ask me about guest check-ins, property details, owner payouts, or maintenance requests.
            </p>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md">
              <div className="p-3 rounded-lg bg-accent/50 border border-border">
                <p className="font-medium text-xs text-foreground">💬 Ask Questions</p>
              </div>
              <div className="p-3 rounded-lg bg-accent/50 border border-border">
                <p className="font-medium text-xs text-foreground">⚡ Get Instant Help</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isLoading && <TypingIndicator />}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <ChatInput onSend={onSendMessage} disabled={isLoading} />
    </div>
  );
}
