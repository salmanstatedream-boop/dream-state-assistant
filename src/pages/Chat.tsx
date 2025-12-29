import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import { sendChatMessage } from '@/lib/chatApi';
import { formatMessage } from '@/lib/messageFormatter';
import {
  createConversation,
  addMessageToConversation,
  generateConversationTitle,
  updateConversationTitle,
  getConversationWithMessages,
  saveMessagesToConversation,
} from '@/lib/conversationDb';
import { Navbar } from '@/components/Navbar';
import { ChatWindow } from '@/components/ChatWindow';
import { ConversationHistory } from '@/components/ConversationHistory';
import { Message } from '@/components/MessageBubble';
import { useToast } from '@/hooks/use-toast';

export default function Chat() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [conversationTitle, setConversationTitle] = useState<string>('New Chat');

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
    setCurrentConversationId(null);
    setConversationTitle('New Chat');
  };

  const handleSelectConversation = async (conversationId: string) => {
    const { conversation, messages: dbMessages } = await getConversationWithMessages(conversationId);
    if (conversation) {
      setCurrentConversationId(conversationId);
      setConversationTitle(conversation.title);
      // Convert DB messages to Message format
      const loadedMessages: Message[] = dbMessages.map((msg) => ({
        id: msg.id,
        content: msg.content,
        formatted: msg.formatted_content,
        role: msg.role,
        timestamp: new Date(msg.created_at),
      }));
      setMessages(loadedMessages);
    }
  };

  const ensureConversation = async (): Promise<string | null> => {
    if (currentConversationId) return currentConversationId;

    if (!user) return null;

    // Create new conversation with the title from first message
    const title = generateConversationTitle(messages[0]?.content || 'New Chat');
    const preview = messages[0]?.content.substring(0, 100);
    const conversation = await createConversation(user.id, title, preview);

    if (conversation) {
      setCurrentConversationId(conversation.id);
      setConversationTitle(conversation.title);

      // Save existing messages to the new conversation
      if (messages.length > 0) {
        await saveMessagesToConversation(conversation.id, user.id, messages);
      }

      return conversation.id;
    }

    return null;
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
      // Ensure we have a conversation to save to
      const conversationId = await ensureConversation();
      if (!conversationId) {
        throw new Error('Failed to create conversation');
      }

      // Save user message
      await addMessageToConversation(conversationId, user.id, 'user', content);

      // Send message to API
      const replies = await sendChatMessage(content, {
        email: user.email || '',
        id: user.id,
      });

      const botMessages: Message[] = replies.map((reply) => ({
        id: crypto.randomUUID(),
        content: reply,
        formatted: formatMessage(reply),
        role: 'bot',
        timestamp: new Date(),
      }));

      setMessages((prev) => [...prev, ...botMessages]);

      // Save bot messages to conversation
      for (const botMsg of botMessages) {
        await addMessageToConversation(
          conversationId,
          user.id,
          'bot',
          botMsg.content,
          botMsg.formatted
        );
      }

      // Update conversation title if it's the first exchange
      if (messages.length === 1) {
        const newTitle = generateConversationTitle(content);
        await updateConversationTitle(conversationId, newTitle);
        setConversationTitle(newTitle);
      }
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
  }, [user, messages.length, toast]);

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
      <div className="flex flex-1 overflow-hidden">
        {/* Conversation History Sidebar - Hidden on mobile */}
        <div className="w-64 hidden lg:flex flex-col">
          <ConversationHistory
            userId={user.id}
            onSelectConversation={handleSelectConversation}
            onNewChat={handleNewChat}
            currentConversationId={currentConversationId || undefined}
          />
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          <div className="border-b border-border px-6 py-4 bg-card/50">
            <h1 className="text-2xl font-semibold text-foreground">{conversationTitle}</h1>
          </div>
          <ChatWindow
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
