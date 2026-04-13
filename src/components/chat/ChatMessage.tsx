'use client';

import Image from 'next/image';
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
        <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden">
          <Image src="/icons/icon-192.png" alt="Au7o" width={32} height={32} className="object-cover" />
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
 * Render inline markdown: links, bold, italic, inline code
 * Returns React nodes with clickable links and styled text
 */
function renderInlineMarkdown(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  // Match markdown links [text](url), bold **text**, italic *text*, inline code `text`
  const inlineRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|\*\*(.+?)\*\*|\*(.+?)\*|`([^`]+)`/g;
  let lastIndex = 0;
  let match;

  while ((match = inlineRegex.exec(text)) !== null) {
    // Guard against infinite loop on zero-length matches
    if (match[0].length === 0) { inlineRegex.lastIndex++; continue; }

    // Add text before the match
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    if (match[1] && match[2]) {
      // Markdown link [text](url)
      nodes.push(
        <a
          key={match.index}
          href={match[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline underline-offset-2 font-medium"
        >
          {match[1]}
        </a>
      );
    } else if (match[3]) {
      // Bold **text**
      nodes.push(<strong key={match.index} className="font-semibold">{match[3]}</strong>);
    } else if (match[4]) {
      // Italic *text*
      nodes.push(<em key={match.index}>{match[4]}</em>);
    } else if (match[5]) {
      // Inline code `text`
      nodes.push(
        <code key={match.index} className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono">
          {match[5]}
        </code>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes.length > 0 ? nodes : [text];
}

/**
 * Format message content for display with rich rendering
 * - Clickable links (blue, underlined)
 * - Bold and italic text
 * - Bullet points
 * - Headers
 */
function formatMessageContent(content: string): React.ReactNode {
  // Check if this is a diagnosis message
  if (content.includes('DIAGNOSIS:')) {
    return formatDiagnosisMessage(content);
  }

  // Split into lines and render each with inline markdown
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Headers
    const headerMatch = line.match(/^(#{1,3})\s+(.+)/);
    if (headerMatch) {
      const level = headerMatch[1].length;
      const cls = level === 1 ? 'text-lg font-bold' : level === 2 ? 'text-base font-semibold' : 'text-sm font-semibold';
      elements.push(
        <p key={i} className={`${cls} text-gray-900 mt-3 mb-1`}>
          {renderInlineMarkdown(headerMatch[2])}
        </p>
      );
      continue;
    }

    // Bullet points (- or * or •)
    const bulletMatch = line.match(/^\s*[-*•]\s+(.+)/);
    if (bulletMatch) {
      elements.push(
        <div key={i} className="flex items-start gap-2 ml-1">
          <span className="text-gray-400 mt-0.5 select-none">•</span>
          <span>{renderInlineMarkdown(bulletMatch[1])}</span>
        </div>
      );
      continue;
    }

    // Numbered lists
    const numberedMatch = line.match(/^\s*(\d+)[.)]\s+(.+)/);
    if (numberedMatch) {
      elements.push(
        <div key={i} className="flex items-start gap-2 ml-1">
          <span className="text-gray-500 font-medium min-w-[1.25rem] text-right">{numberedMatch[1]}.</span>
          <span>{renderInlineMarkdown(numberedMatch[2])}</span>
        </div>
      );
      continue;
    }

    // Empty line = spacing
    if (line.trim() === '') {
      elements.push(<div key={i} className="h-2" />);
      continue;
    }

    // Regular line with inline markdown
    elements.push(
      <p key={i}>{renderInlineMarkdown(line)}</p>
    );
  }

  return <div className="space-y-1">{elements}</div>;
}

/**
 * Parse a single diagnosis block (primary or alternative)
 */
interface ParsedDiagnosis {
  title: string;
  confidence: string;
  description: string;
  causes: string[];
  recommendation: string;
}

function parseSingleDiagnosis(text: string): ParsedDiagnosis {
  const titleMatch = text.match(/^([^\n]+)/);
  const confidenceMatch = text.match(/(?:CONFIDENCE|ALT\d+_CONFIDENCE):\s*(high|medium|low)/i);
  const descriptionMatch = text.match(/(?:DESCRIPTION|ALT\d+_DESCRIPTION):\s*([\s\S]+?)(?=(?:POSSIBLE CAUSES|RECOMMENDATION|ALTERNATIVE|$))/i);
  const causesMatch = text.match(/POSSIBLE CAUSES:\s*([\s\S]+?)(?=RECOMMENDATION|ALTERNATIVE|$)/i);
  const recommendationMatch = text.match(/RECOMMENDATION:\s*([\s\S]+?)(?=ALTERNATIVE|$)/i);

  const causes = causesMatch
    ? causesMatch[1].split('\n').map(l => l.replace(/^[-•]\s*/, '').trim()).filter(l => l.length > 0)
    : [];

  return {
    title: titleMatch ? titleMatch[1].trim() : '',
    confidence: confidenceMatch ? confidenceMatch[1].toLowerCase() : '',
    description: descriptionMatch ? descriptionMatch[1].trim() : '',
    causes,
    recommendation: recommendationMatch ? recommendationMatch[1].trim() : '',
  };
}

/**
 * Render a diagnosis card (used for both primary and alternatives)
 */
function renderDiagnosisCard(diag: ParsedDiagnosis, index: number, isPrimary: boolean): React.ReactNode {
  const badgeClass =
    diag.confidence === 'high'
      ? 'bg-green-100 text-green-700'
      : diag.confidence === 'medium'
      ? 'bg-amber-100 text-amber-700'
      : 'bg-orange-100 text-orange-700';

  return (
    <div key={index} className={`${isPrimary ? 'bg-gray-50' : 'bg-gray-50/60'} rounded-xl p-4 space-y-3`}>
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
          {isPrimary ? 'Diagnosis' : `Alternative ${index}`}
        </p>
        <p className={`${isPrimary ? 'text-lg' : 'text-base'} font-semibold text-gray-900`}>
          {diag.title}
        </p>
      </div>

      {diag.confidence && (
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Confidence:
          </span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badgeClass}`}>
            {diag.confidence}
          </span>
        </div>
      )}

      {diag.description && (
        <div className="text-gray-700">
          {formatMessageContent(diag.description)}
        </div>
      )}

      {diag.causes.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
            Possible Causes
          </p>
          <ul className="space-y-1">
            {diag.causes.map((cause, i) => (
              <li key={i} className="flex items-start gap-2 text-gray-700">
                <span className="text-gray-400 mt-1">•</span>
                <span>{renderInlineMarkdown(cause)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {diag.recommendation && (
        <div className="pt-2 border-t border-gray-200">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            Recommendation
          </p>
          <div className="text-gray-700">{formatMessageContent(diag.recommendation)}</div>
        </div>
      )}
    </div>
  );
}

/**
 * Format diagnosis message with clean styling
 */
function formatDiagnosisMessage(content: string): React.ReactNode {
  // Split before the diagnosis section to get intro text
  const [introText, ...rest] = content.split('DIAGNOSIS:');
  const diagnosisContent = 'DIAGNOSIS:' + rest.join('DIAGNOSIS:');

  // Split out alternatives
  const altSplitRegex = /ALTERNATIVE\s+\d+:\s*/g;
  const parts = diagnosisContent.split(altSplitRegex);
  const altMatches = diagnosisContent.match(altSplitRegex) || [];

  // Parse primary diagnosis
  const primary = parseSingleDiagnosis(parts[0].replace(/^DIAGNOSIS:\s*/, ''));

  // Parse alternatives
  const alternatives: ParsedDiagnosis[] = [];
  for (let i = 1; i < parts.length; i++) {
    const alt = parseSingleDiagnosis(parts[i]);
    if (alt.title) alternatives.push(alt);
  }

  return (
    <div className="space-y-4">
      {introText.trim() && (
        <div>{formatMessageContent(introText.trim())}</div>
      )}

      {renderDiagnosisCard(primary, 0, true)}

      {alternatives.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Other Possibilities
          </p>
          {alternatives.map((alt, i) => renderDiagnosisCard(alt, i + 1, false))}
        </div>
      )}
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
        <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden">
          <Image src="/icons/icon-192.png" alt="Au7o" width={32} height={32} className="object-cover" />
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
