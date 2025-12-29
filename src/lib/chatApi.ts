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

const WEBHOOK_URL = import.meta.env.VITE_WEBHOOK_URL || 'https://paronymic-roma-unscripted.ngrok-free.dev/webhook/chat';

export async function sendChatMessage(
  message: string,
  user: ChatUser
): Promise<string[]> {
  const payload: ChatMessage = {
    msg: message,
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
    console.error('Chat API error:', error);
    throw error;
  }
}
