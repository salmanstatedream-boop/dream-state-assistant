import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import { sendChatMessage } from '@/lib/chatApi';
import { Navbar } from '@/components/Navbar';
import { ChatWindow } from '@/components/ChatWindow';
import { Message } from '@/components/MessageBubble';
import { useToast } from '@/hooks/use-toast';

export default function Chat() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        navigate('/auth', { replace: true });
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        navigate('/auth', { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const handleNewChat = () => {
    setMessages([]);
  };

  const handleSendMessage = useCallback(async (content: string) => {
    if (!user) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      content,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const replies = await sendChatMessage(content, {
        email: user.email || '',
        id: user.id,
      });

      const botMessages: Message[] = replies.map((reply) => ({
        id: crypto.randomUUID(),
        content: reply,
        role: 'bot',
        timestamp: new Date(),
      }));

      setMessages((prev) => [...prev, ...botMessages]);
    } catch (error) {
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        content: "Sorry — I couldn't reach the server. Please try again.",
        role: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      
      toast({
        title: 'Connection Error',
        description: 'Failed to send message. Please check your connection and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <Navbar
        userEmail={user.email || 'User'}
        onSignOut={handleSignOut}
        onNewChat={handleNewChat}
      />
      <main className="flex-1 overflow-hidden">
        <div className="h-full max-w-4xl mx-auto">
          <ChatWindow
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
          />
        </div>
      </main>
    </div>
  );
}
