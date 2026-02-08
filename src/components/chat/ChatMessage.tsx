'use client';

import { type ChatMessage as ChatMessageType } from '@/schemas/chat.schema';

/**
 * ChatMessage - Individual chat message
 *
 * Clean, minimal design inspired by chat-sdk.dev
 * - No excessive borders or shadows
 * - Clean typography
 * - Subtle visual distinction between user/AI
 */

type ChatMessageProps = {
  message: ChatMessageType;
};

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end mb-6">
        <div className="max-w-[80%] bg-gray-100 rounded-3xl px-5 py-3">
          <p className="text-gray-900 text-[15px] leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="flex items-start gap-3">
        {/* AI Avatar */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
          <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        {/* Message Content */}
        <div className="flex-1 min-w-0">
          <div className="text-[15px] text-gray-900 leading-relaxed">
            {formatMessageContent(message.content)}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Format message content for display
 */
function formatMessageContent(content: string): React.ReactNode {
  // Check if this is a diagnosis message
  if (content.includes('DIAGNOSIS:')) {
    return formatDiagnosisMessage(content);
  }

  // Regular message - render with line breaks
  return (
    <div className="whitespace-pre-wrap">
      {content}
    </div>
  );
}

/**
 * Format diagnosis message with clean styling
 */
function formatDiagnosisMessage(content: string): React.ReactNode {
  // Split before the diagnosis section to get intro text
  const [introText, ...rest] = content.split('DIAGNOSIS:');
  const diagnosisContent = rest.join('DIAGNOSIS:');

  // Parse diagnosis sections
  const sections: { label: string; content: string }[] = [];
  const sectionRegex = /(DIAGNOSIS|CONFIDENCE|DESCRIPTION|POSSIBLE CAUSES|RECOMMENDATION):\s*([\s\S]*?)(?=(?:DIAGNOSIS|CONFIDENCE|DESCRIPTION|POSSIBLE CAUSES|RECOMMENDATION):|$)/g;

  let match;
  while ((match = sectionRegex.exec('DIAGNOSIS:' + diagnosisContent)) !== null) {
    sections.push({
      label: match[1],
      content: match[2].trim(),
    });
  }

  return (
    <div className="space-y-4">
      {introText.trim() && (
        <p className="whitespace-pre-wrap">{introText.trim()}</p>
      )}

      <div className="bg-gray-50 rounded-xl p-4 space-y-3">
        {sections.map((section, index) => {
          if (section.label === 'DIAGNOSIS') {
            return (
              <div key={index}>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Diagnosis
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {section.content}
                </p>
              </div>
            );
          }

          if (section.label === 'CONFIDENCE') {
            const confidence = section.content.toLowerCase();
            const badgeClass =
              confidence === 'high'
                ? 'bg-green-100 text-green-700'
                : confidence === 'medium'
                ? 'bg-amber-100 text-amber-700'
                : 'bg-orange-100 text-orange-700';

            return (
              <div key={index} className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Confidence:
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badgeClass}`}>
                  {section.content}
                </span>
              </div>
            );
          }

          if (section.label === 'DESCRIPTION') {
            return (
              <div key={index}>
                <p className="text-gray-700">{section.content}</p>
              </div>
            );
          }

          if (section.label === 'POSSIBLE CAUSES') {
            const causes = section.content
              .split('\n')
              .map((line) => line.replace(/^[-•]\s*/, '').trim())
              .filter((line) => line.length > 0);

            return (
              <div key={index}>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Possible Causes
                </p>
                <ul className="space-y-1">
                  {causes.map((cause, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-700">
                      <span className="text-gray-400 mt-1">•</span>
                      <span>{cause}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          }

          if (section.label === 'RECOMMENDATION') {
            return (
              <div key={index} className="pt-2 border-t border-gray-200">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Recommendation
                </p>
                <p className="text-gray-700">{section.content}</p>
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}

/**
 * ChatMessageLoading - Typing indicator
 */
export function ChatMessageLoading() {
  return (
    <div className="mb-6">
      <div className="flex items-start gap-3">
        {/* AI Avatar */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
          <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        {/* Loading dots */}
        <div className="flex items-center gap-1 py-3">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
