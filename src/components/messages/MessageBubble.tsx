'use client';

import { OptimisticMessage } from '@/types/messages';
import { formatMessageTime } from '@/lib/messages/optimistic';
import { AlertCircle, RotateCcw, Check, CheckCheck, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface MessageBubbleProps {
  message: OptimisticMessage;
  isOwn: boolean;
  onRetry?: () => void;
}

export function MessageBubble({ message, isOwn, onRetry }: MessageBubbleProps) {
  const timestamp = formatMessageTime(message.createdAt);

  return (
    <div
      className={cn('flex gap-2 items-end mb-2', isOwn ? 'justify-end' : 'justify-start')}
      key={message.id}
    >
      <div
        className={cn(
          'max-w-xs rounded-lg px-4 py-2 break-words',
          isOwn
            ? 'bg-blue-500 text-white rounded-br-none'
            : 'bg-muted text-foreground rounded-bl-none'
        )}
      >
        {message.isDeleted ? (
          <p className="text-sm italic opacity-50">This message was deleted</p>
        ) : (
          <>
            <p className="text-sm">{message.content}</p>
            <div className={cn('flex items-center gap-1 mt-1 text-xs', isOwn ? 'text-white/70' : 'text-muted-foreground')}>
              <span>{timestamp}</span>
              {isOwn && (
                <>
                  {message.isPending && <Clock className="size-3" />}
                  {message.failedToSend ? (
                    <AlertCircle className="size-3 text-red-400" />
                  ) : message.isOptimistic ? (
                    <Check className="size-3" />
                  ) : (
                    <CheckCheck className="size-3" />
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* Retry button for failed messages */}
      {isOwn && message.failedToSend && onRetry && (
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={onRetry}
          title="Retry sending"
        >
          <RotateCcw className="size-4 text-red-500" />
        </Button>
      )}
    </div>
  );
}
