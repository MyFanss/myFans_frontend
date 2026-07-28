'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip, Loader2 } from 'lucide-react';
import { sanitizeMessageText, validateMessage } from '@/lib/messages/optimistic';
import { cn } from '@/lib/utils';

interface MessageComposerProps {
  threadId: string;
  onSend: (content: string) => void;
  isPending: boolean;
  isThreadBlocked?: boolean;
  isParticipantDeleted?: boolean;
}

export function MessageComposer({
  threadId,
  onSend,
  isPending,
  isThreadBlocked,
  isParticipantDeleted,
}: MessageComposerProps) {
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isDisabled = isThreadBlocked || isParticipantDeleted || isPending;
  const isEmpty = content.trim().length === 0;

  const handleSend = useCallback(() => {
    const validation = validateMessage(content);
    if (!validation.valid) {
      setError(validation.error || 'Message is invalid');
      return;
    }

    const sanitized = sanitizeMessageText(content);
    onSend(sanitized);
    setContent('');
    setError(null);

    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [content, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isEmpty && !isPending) {
        handleSend();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const text = e.clipboardData?.getData('text/plain');
    if (text) {
      const sanitized = sanitizeMessageText(text);
      const newContent = content + sanitized;
      setContent(newContent.slice(0, 5000));
    }
  };

  if (isThreadBlocked) {
    return (
      <div className="border-t bg-muted/50 p-4 text-center text-sm text-muted-foreground">
        <p>You cannot message this user. This conversation is blocked.</p>
      </div>
    );
  }

  if (isParticipantDeleted) {
    return (
      <div className="border-t bg-muted/50 p-4 text-center text-sm text-muted-foreground">
        <p>This user has deleted their account. You cannot send new messages.</p>
      </div>
    );
  }

  return (
    <div className="border-t bg-background p-4 space-y-2">
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      <div className="flex gap-2">
        <Textarea
          ref={textareaRef}
          placeholder="Type a message... (Shift+Enter for new line)"
          value={content}
          onChange={(e) => {
            setContent(e.target.value.slice(0, 5000));
            setError(null);
          }}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          disabled={isDisabled}
          className="min-h-10 max-h-24 resize-none"
          rows={1}
          aria-label="Message input"
        />

        <div className="flex gap-1 flex-col">
          <Button
            variant="ghost"
            size="icon"
            disabled={true}
            title="Attachments coming soon"
            className="text-muted-foreground"
          >
            <Paperclip className="size-5" />
          </Button>

          <Button
            onClick={handleSend}
            disabled={isEmpty || isDisabled}
            size="icon"
            className={cn(
              'transition-all',
              isEmpty ? 'opacity-50' : 'opacity-100'
            )}
            aria-label="Send message"
          >
            {isPending ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <Send className="size-5" />
            )}
          </Button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        {content.length}/5000 • Shift+Enter for new line
      </p>
    </div>
  );
}
