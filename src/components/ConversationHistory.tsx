import { useState, useEffect } from 'react';
import { Conversation, getUserConversations, deleteConversation } from '@/lib/conversationDb';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, MessageSquare, Plus } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ConversationHistoryProps {
  userId: string | undefined;
  onSelectConversation: (conversationId: string) => void;
  onNewChat: () => void;
  currentConversationId?: string;
}

export function ConversationHistory({
  userId,
  onSelectConversation,
  onNewChat,
  currentConversationId,
}: ConversationHistoryProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      loadConversations();
    }
  }, [userId]);

  const loadConversations = async () => {
    if (!userId) return;
    setIsLoading(true);
    const data = await getUserConversations(userId);
    setConversations(data);
    setIsLoading(false);
  };

  const handleDeleteConversation = async (conversationId: string) => {
    const success = await deleteConversation(conversationId);
    if (success) {
      setConversations((prev) => prev.filter((c) => c.id !== conversationId));
      setDeleteConfirmId(null);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-background border-r border-border">
      <div className="p-4 border-b border-border">
        <Button onClick={onNewChat} className="w-full gap-2 font-semibold" size="sm">
          <Plus className="w-4 h-4" />
          New Chat
        </Button>
      </div>

      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="p-4 text-center text-muted-foreground text-sm">Loading...</div>
        ) : conversations.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            No conversations yet. Start a new chat!
          </div>
        ) : (
          <div className="space-y-2 p-4">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`group p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                  currentConversationId === conversation.id
                    ? 'bg-primary/10 border border-primary/50'
                    : 'hover:bg-accent/50 border border-transparent'
                }`}
              >
                <div
                  onClick={() => onSelectConversation(conversation.id)}
                  className="space-y-1"
                >
                  <div className="flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{conversation.title}</p>
                      {conversation.preview && (
                        <p className="text-xs text-muted-foreground truncate">
                          {conversation.preview}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground ml-6">
                    {formatDate(conversation.updated_at)}
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity mt-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteConfirmId(conversation.id);
                  }}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      <AlertDialog open={deleteConfirmId !== null} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The conversation and all its messages will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmId && handleDeleteConversation(deleteConfirmId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
