import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import DOMPurify from 'dompurify';

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'bot';
  timestamp: Date;
  formatted?: FormattedContent[];
}

export interface FormattedContent {
  type: 'text' | 'bold' | 'italic' | 'code' | 'codeblock';
  content: string;
}

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  // Sanitize content to prevent XSS attacks
  const sanitizeContent = (content: string): string => {
    return DOMPurify.sanitize(content, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
  };

  const renderContent = () => {
    if (message.formatted) {
      return (
        <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
          {message.formatted.map((item, idx) => {
            const sanitized = sanitizeContent(item.content);
            switch (item.type) {
              case 'bold':
                return <strong key={idx}>{sanitized}</strong>;
              case 'italic':
                return <em key={idx}>{sanitized}</em>;
              case 'code':
                return (
                  <code
                    key={idx}
                    className={cn(
                      'px-2 py-0.5 rounded text-xs font-mono',
                      isUser ? 'bg-primary-foreground/20' : 'bg-muted'
                    )}
                  >
                    {sanitized}
                  </code>
                );
              case 'codeblock':
                return (
                  <pre
                    key={idx}
                    className={cn(
                      'rounded p-2 text-xs font-mono mt-2 mb-2 overflow-x-auto',
                      isUser ? 'bg-primary-foreground/10' : 'bg-muted'
                    )}
                  >
                    <code>{sanitized}</code>
                  </pre>
                );
              default:
                return <span key={idx}>{sanitized}</span>;
            }
          })}
        </p>
      );
    }
    // Sanitize plain text content as well
    return <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{sanitizeContent(message.content)}</p>;
  };

  return (
    <div
      className={cn(
        'flex w-full animate-fade-in',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg rounded-2xl px-4 py-3 shadow-sm',
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-md'
            : 'bg-card border border-border rounded-bl-md'
        )}
      >
        {renderContent()}
        <p
          className={cn(
            'text-xs mt-1.5 font-medium',
            isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'
          )}
        >
          {format(message.timestamp, 'h:mm a')}
        </p>
      </div>
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex justify-start animate-fade-in">
      <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
        <div className="flex gap-1.5">
          <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-typing" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-typing" style={{ animationDelay: '200ms' }} />
          <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-typing" style={{ animationDelay: '400ms' }} />
        </div>
      </div>
    </div>
  );
}
