interface ChatUser {
  email: string;
  id: string;
}

interface ChatMessage {
  msg: string;
  user: ChatUser;
  context: {
    source: string;
    app: string;
  };
}

interface ChatResponse {
  reply?: string;
  message?: string;
  messages?: string[];
  [key: string]: unknown;
}

// Rate limiting: track message timestamps per user
const messageTimestamps = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds
const MAX_MESSAGES_PER_MINUTE = 20;

const WEBHOOK_URL = import.meta.env.VITE_WEBHOOK_URL;

// Validate webhook URL on initialization
if (!WEBHOOK_URL) {
  if (import.meta.env.DEV) {
    console.error('VITE_WEBHOOK_URL environment variable is required');
  }
}

// Validate URL is HTTPS and not a development endpoint
if (WEBHOOK_URL && !WEBHOOK_URL.startsWith('https://')) {
  if (import.meta.env.DEV) {
    console.error('VITE_WEBHOOK_URL must use HTTPS protocol');
  }
}

if (WEBHOOK_URL && (WEBHOOK_URL.includes('ngrok') || WEBHOOK_URL.includes('localhost') || WEBHOOK_URL.includes('127.0.0.1'))) {
  if (import.meta.env.DEV) {
    console.error('VITE_WEBHOOK_URL cannot be a development endpoint');
  }
}

// Validate message input
function validateMessageInput(message: string): { valid: boolean; error?: string } {
  if (!message || typeof message !== 'string') {
    return { valid: false, error: 'Invalid message format' };
  }

  const trimmed = message.trim();

  if (trimmed.length < 1) {
    return { valid: false, error: 'Message cannot be empty' };
  }

  if (trimmed.length > 5000) {
    return { valid: false, error: 'Message too long (max 5000 characters)' };
  }

  // Check for potentially malicious patterns
  if (/<script|javascript:|on\w+=/i.test(trimmed)) {
    return { valid: false, error: 'Invalid content detected' };
  }

  return { valid: true };
}

// Rate limiting function
function checkRateLimit(userId: string): { allowed: boolean; error?: string } {
  const now = Date.now();
  const timestamps = messageTimestamps.get(userId) || [];
  
  // Remove timestamps outside the rate limit window
  const recentTimestamps = timestamps.filter(ts => now - ts < RATE_LIMIT_WINDOW);
  
  if (recentTimestamps.length >= MAX_MESSAGES_PER_MINUTE) {
    return { 
      allowed: false, 
      error: `Rate limit exceeded. Maximum ${MAX_MESSAGES_PER_MINUTE} messages per minute.` 
    };
  }
  
  // Add current timestamp
  recentTimestamps.push(now);
  messageTimestamps.set(userId, recentTimestamps);
  
  return { allowed: true };
}

export async function sendChatMessage(
  message: string,
  user: ChatUser
): Promise<string[]> {
  // Check rate limit
  const rateLimitCheck = checkRateLimit(user.id);
  if (!rateLimitCheck.allowed) {
    throw new Error(rateLimitCheck.error || 'Rate limit exceeded');
  }

  // Validate input before processing
  const validation = validateMessageInput(message);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid message');
  }

  const payload: ChatMessage = {
    msg: message.trim(),
    user: {
      email: user.email,
      id: user.id,
    },
    context: {
      source: 'web',
      app: 'dreamstate-chat',
    },
  };

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    
    // Handle plain text response
    if (contentType && contentType.includes('text/plain')) {
      const text = await response.text();
      return [text];
    }

    // Handle JSON response
    const data: ChatResponse = await response.json();

    // Handle different response formats
    if (data.reply) {
      return [data.reply];
    }
    if (data.message) {
      return [data.message];
    }
    if (data.messages && Array.isArray(data.messages)) {
      return data.messages;
    }
    
    // Fallback: stringify the response
    return [JSON.stringify(data)];
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Chat API error:', error);
    }
    throw error;
  }
}
