import { FormattedContent } from '@/components/MessageBubble';

export function formatMessage(content: string): FormattedContent[] {
  const result: FormattedContent[] = [];
  let lastIndex = 0;

  // Patterns to match: **bold**, *italic*, `code`, ```codeblock```
  const patterns = [
    { regex: /```([\s\S]*?)```/g, type: 'codeblock' as const },
    { regex: /\*\*(.*?)\*\*/g, type: 'bold' as const },
    { regex: /\*(.*?)\*/g, type: 'italic' as const },
    { regex: /`(.*?)`/g, type: 'code' as const },
  ];

  // Process codeblocks first (highest priority)
  let processedContent = content;
  const codeblockMatches: Array<{ start: number; end: number; content: string }> = [];
  const codeblockRegex = /```([\s\S]*?)```/g;
  let match;

  while ((match = codeblockRegex.exec(content)) !== null) {
    codeblockMatches.push({
      start: match.index,
      end: match.index + match[0].length,
      content: match[1],
    });
  }

  if (codeblockMatches.length > 0) {
    // If we have codeblocks, parse them and handle remaining text
    let currentIndex = 0;
    for (const block of codeblockMatches) {
      if (currentIndex < block.start) {
        // Process text before codeblock
        parseTextPatterns(
          content.substring(currentIndex, block.start),
          result
        );
      }
      result.push({ type: 'codeblock', content: block.content });
      currentIndex = block.end;
    }
    if (currentIndex < content.length) {
      parseTextPatterns(content.substring(currentIndex), result);
    }
    return result;
  }

  // No codeblocks, parse remaining patterns
  parseTextPatterns(content, result);

  return result.length > 0 ? result : [{ type: 'text', content }];
}

function parseTextPatterns(text: string, result: FormattedContent[]): void {
  let lastIndex = 0;
  const regex = /(\*\*.*?\*\*|\*.*?\*|`[^`\n]*?`)/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Add plain text before match
    if (match.index > lastIndex) {
      result.push({
        type: 'text',
        content: text.substring(lastIndex, match.index),
      });
    }

    const matched = match[0];
    if (matched.startsWith('**') && matched.endsWith('**')) {
      result.push({
        type: 'bold',
        content: matched.slice(2, -2),
      });
    } else if (matched.startsWith('*') && matched.endsWith('*')) {
      result.push({
        type: 'italic',
        content: matched.slice(1, -1),
      });
    } else if (matched.startsWith('`') && matched.endsWith('`')) {
      result.push({
        type: 'code',
        content: matched.slice(1, -1),
      });
    }

    lastIndex = match.index + matched.length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    result.push({
      type: 'text',
      content: text.substring(lastIndex),
    });
  }
}
