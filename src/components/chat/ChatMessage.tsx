'use client';

import { type ChatMessage as ChatMessageType } from '@/schemas/chat.schema';

/**
 * ChatMessage - Individual chat message bubble
 *
 * Follows Architecture patterns:
 * - Discovery phase styling (calm, exploratory)
 * - Named exports only
 */

type ChatMessageProps = {
  message: ChatMessageType;
};

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div
        className={`
          max-w-[85%] rounded-2xl px-4 py-3
          ${isUser
            ? 'bg-gray-900 text-white rounded-br-md'
            : 'bg-white border border-gray-200 text-gray-900 rounded-bl-md shadow-sm'
          }
        `}
      >
        {!isUser && (
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">AI</span>
            </div>
            <span className="text-xs text-gray-500">Au7o Assistant</span>
          </div>
        )}
        <div className="whitespace-pre-wrap text-sm leading-relaxed">
          {formatMessageContent(message.content)}
        </div>
      </div>
    </div>
  );
}

/**
 * Format message content for display
 * Handles line breaks and basic formatting
 */
function formatMessageContent(content: string): React.ReactNode {
  // Check if this is a diagnosis message
  if (content.includes('DIAGNOSIS:')) {
    return formatDiagnosisMessage(content);
  }

  // Regular message - just handle line breaks
  return content;
}

/**
 * Format diagnosis message with styling
 */
function formatDiagnosisMessage(content: string): React.ReactNode {
  const parts = content.split(/(DIAGNOSIS:|CONFIDENCE:|DESCRIPTION:|POSSIBLE CAUSES:|RECOMMENDATION:)/);

  return (
    <div className="space-y-2">
      {parts.map((part, index) => {
        const trimmed = part.trim();

        if (trimmed === 'DIAGNOSIS:') {
          return (
            <div key={index} className="font-semibold text-blue-600 text-xs uppercase tracking-wide mt-2">
              Diagnosis
            </div>
          );
        }

        if (trimmed === 'CONFIDENCE:') {
          return (
            <div key={index} className="font-semibold text-gray-500 text-xs uppercase tracking-wide mt-3">
              Confidence
            </div>
          );
        }

        if (trimmed === 'DESCRIPTION:') {
          return (
            <div key={index} className="font-semibold text-gray-500 text-xs uppercase tracking-wide mt-3">
              Description
            </div>
          );
        }

        if (trimmed === 'POSSIBLE CAUSES:') {
          return (
            <div key={index} className="font-semibold text-gray-500 text-xs uppercase tracking-wide mt-3">
              Possible Causes
            </div>
          );
        }

        if (trimmed === 'RECOMMENDATION:') {
          return (
            <div key={index} className="font-semibold text-gray-500 text-xs uppercase tracking-wide mt-3">
              Recommendation
            </div>
          );
        }

        if (!trimmed) return null;

        // Format the content after labels
        const prevPart = parts[index - 1]?.trim();

        if (prevPart === 'DIAGNOSIS:') {
          return (
            <div key={index} className="text-lg font-medium text-gray-900">
              {trimmed}
            </div>
          );
        }

        if (prevPart === 'CONFIDENCE:') {
          const confidence = trimmed.toLowerCase();
          const colorClass =
            confidence === 'high'
              ? 'bg-green-100 text-green-800'
              : confidence === 'medium'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-orange-100 text-orange-800';

          return (
            <span
              key={index}
              className={`inline-block px-2 py-1 rounded text-xs font-medium capitalize ${colorClass}`}
            >
              {trimmed}
            </span>
          );
        }

        return (
          <div key={index} className="text-gray-700">
            {trimmed}
          </div>
        );
      })}
    </div>
  );
}

/**
 * ChatMessageLoading - Loading indicator for AI response
 */
export function ChatMessageLoading() {
  return (
    <div className="flex justify-start mb-4">
      <div className="max-w-[85%] rounded-2xl rounded-bl-md px-4 py-3 bg-white border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">AI</span>
          </div>
          <span className="text-xs text-gray-500">Au7o Assistant</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
