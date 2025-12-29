import { supabase } from './supabaseClient';
import { Message } from '@/components/MessageBubble';

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  preview?: string;
  created_at: string;
  updated_at: string;
}

export interface ConversationMessage {
  id: string;
  conversation_id: string;
  user_id: string;
  role: 'user' | 'bot';
  content: string;
  formatted_content?: any;
  created_at: string;
}

// Sanitize string inputs to prevent issues
function sanitizeInput(input: string, maxLength: number = 500): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  // Trim whitespace and truncate to max length
  return input.trim().substring(0, maxLength);
}

// Create a new conversation
export async function createConversation(
  userId: string,
  title: string,
  preview?: string
): Promise<Conversation | null> {
  try {
    const sanitizedTitle = sanitizeInput(title, 500);
    const sanitizedPreview = sanitizeInput(preview || title.substring(0, 100), 500);

    if (!sanitizedTitle) {
      throw new Error('Conversation title cannot be empty');
    }

    const { data, error } = await supabase
      .from('conversations')
      .insert([
        {
          user_id: userId,
          title: sanitizedTitle,
          preview: sanitizedPreview,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Error creating conversation:', error);
    }
    return null;
  }
}

// Get all conversations for a user
export async function getUserConversations(userId: string): Promise<Conversation[]> {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Error fetching conversations:', error);
    }
    return [];
  }
}

// Get a single conversation with its messages
export async function getConversationWithMessages(
  conversationId: string
): Promise<{ conversation: Conversation | null; messages: ConversationMessage[] }> {
  try {
    const { data: conversation, error: conversationError } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (conversationError) throw conversationError;

    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (messagesError) throw messagesError;

    return {
      conversation,
      messages: messages || [],
    };
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Error fetching conversation with messages:', error);
    }
    return { conversation: null, messages: [] };
  }
}

// Add message to conversation
export async function addMessageToConversation(
  conversationId: string,
  userId: string,
  role: 'user' | 'bot',
  content: string,
  formattedContent?: any
): Promise<ConversationMessage | null> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert([
        {
          conversation_id: conversationId,
          user_id: userId,
          role,
          content,
          formatted_content: formattedContent,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Update conversation's updated_at timestamp
    await updateConversationTimestamp(conversationId);

    return data;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Error adding message:', error);
    }
    return null;
  }
}

// Update conversation title
export async function updateConversationTitle(
  conversationId: string,
  title: string
): Promise<Conversation | null> {
  try {
    const sanitizedTitle = sanitizeInput(title, 500);

    const { data, error } = await supabase
      .from('conversations')
      .update({
        title: sanitizedTitle,
        updated_at: new Date().toISOString(),
      })
      .eq('id', conversationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Error updating conversation title:', error);
    }
    return null;
  }
}

// Update conversation preview
export async function updateConversationPreview(
  conversationId: string,
  preview: string
): Promise<Conversation | null> {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .update({
        preview,
        updated_at: new Date().toISOString(),
      })
      .eq('id', conversationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Error updating conversation preview:', error);
    }
    return null;
  }
}

// Delete conversation (cascades to messages)
export async function deleteConversation(conversationId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('conversations').delete().eq('id', conversationId);

    if (error) throw error;
    return true;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Error deleting conversation:', error);
    }
    return false;
  }
}

// Delete specific message
export async function deleteMessage(messageId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('messages').delete().eq('id', messageId);

    if (error) throw error;
    return true;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Error deleting message:', error);
    }
    return false;
  }
}

// Generate conversation title from first message
export function generateConversationTitle(message: string): string {
  const maxLength = 50;
  const title = message.substring(0, maxLength).trim();
  return title.length < message.length ? `${title}...` : title;
}

// Helper: Update conversation timestamp
async function updateConversationTimestamp(conversationId: string): Promise<void> {
  try {
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Error updating conversation timestamp:', error);
    }
  }
}

// Bulk save messages to a conversation
export async function saveMessagesToConversation(
  conversationId: string,
  userId: string,
  messages: Message[]
): Promise<ConversationMessage[]> {
  try {
    const dbMessages = messages.map((msg) => ({
      conversation_id: conversationId,
      user_id: userId,
      role: msg.role as 'user' | 'bot',
      content: msg.content,
      formatted_content: msg.formatted,
      created_at: msg.timestamp.toISOString(),
    }));

    const { data, error } = await supabase
      .from('messages')
      .insert(dbMessages)
      .select();

    if (error) throw error;

    // Update conversation timestamp
    await updateConversationTimestamp(conversationId);

    return data || [];
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Error saving messages:', error);
    }
    return [];
  }
}
