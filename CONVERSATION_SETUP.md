## Setup Instructions for Conversation Storage

### Step 1: Create Supabase Tables

1. Go to your Supabase dashboard at https://supabase.com
2. Navigate to your project
3. Click on "SQL Editor" in the left sidebar
4. Click "New Query"
5. Copy and paste the SQL from `supabase/migrations/create_conversations_table.sql`
6. Click "Run"

This will create:
- `conversations` table: Stores conversation metadata
- `messages` table: Stores individual messages
- Row-Level Security policies for data protection
- Indexes for optimal performance

### Step 2: Verify Installation

All necessary files have been created:

**New Files Created:**
- `src/lib/conversationDb.ts` - Database utility functions
- `src/components/ConversationHistory.tsx` - Conversation sidebar component
- `supabase/migrations/create_conversations_table.sql` - Database schema

**Updated Files:**
- `src/pages/Chat.tsx` - Integrated conversation storage and sidebar

**Required Components (Already Exist):**
- `src/components/ui/scroll-area.tsx` ✓
- `src/components/ui/alert-dialog.tsx` ✓

### Step 3: How It Works

**Conversation Flow:**
1. User sends first message → New conversation auto-created
2. Conversation title auto-generated from first message
3. All messages saved to database (user & bot)
4. Conversation history shown in left sidebar (desktop only)
5. Click previous conversation to load history
6. Delete button to remove conversations

**Features:**
- Auto-save all messages to Supabase
- Load previous conversations
- Generate intelligent conversation titles
- Delete conversations with confirmation
- Mobile responsive (sidebar hidden on mobile)
- Row-level security (users see only their conversations)

### Step 4: Environment Variables

Ensure your `.env` file has:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_WEBHOOK_URL=your_webhook_url
```

### Step 5: Testing

1. Start the application: `bun run dev`
2. Sign in or create an account
3. Send a message - it should auto-create a conversation
4. Conversation should appear in the sidebar (on desktop)
5. Load the page - messages should persist
6. Click a previous conversation to load it
7. Click the trash icon to delete a conversation

### Database Schema

**Conversations Table:**
- `id` (UUID): Primary key
- `user_id` (UUID): Reference to auth user
- `title` (TEXT): Conversation title (auto-generated)
- `preview` (TEXT): First message preview
- `created_at` (TIMESTAMP): When created
- `updated_at` (TIMESTAMP): Last message timestamp

**Messages Table:**
- `id` (UUID): Primary key
- `conversation_id` (UUID): Reference to conversation
- `user_id` (UUID): Reference to auth user
- `role` (TEXT): 'user' or 'bot'
- `content` (TEXT): Message text
- `formatted_content` (JSONB): Formatted message data (for bold/italic/code)
- `created_at` (TIMESTAMP): When sent

### Troubleshooting

**Messages not saving:**
- Check Supabase credentials in `.env`
- Verify RLS policies are enabled
- Check browser console for errors

**Sidebar not showing:**
- Sidebar is hidden on mobile/tablet (lg breakpoint)
- Use desktop view or larger screen
- Check if ConversationHistory component loaded

**Conversations not loading:**
- Refresh the page
- Check network tab for API calls
- Verify user is authenticated
