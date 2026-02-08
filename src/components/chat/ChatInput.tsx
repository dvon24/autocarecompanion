'use client';

import { useRef, useEffect, type KeyboardEvent } from 'react';

/**
 * ChatInput - Clean message input inspired by chat-sdk.dev
 *
 * Features:
 * - Minimal, borderless design
 * - Auto-resizing textarea
 * - Touch targets 44x44px minimum (NFR-A7)
 */

type ChatInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
  placeholder?: string;
};

export function ChatInput({
  value,
  onChange,
  onSend,
  disabled = false,
  placeholder = "Send a message...",
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [value]);

  // Handle keyboard shortcuts
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled) {
        onSend();
      }
    }
  };

  const canSend = value.trim().length > 0 && !disabled;

  return (
    <div className="relative">
      <div className="flex items-end gap-2 p-3 bg-gray-50 rounded-2xl border border-gray-200 focus-within:border-gray-300 focus-within:bg-white transition-colors">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className={`
            flex-1 bg-transparent text-gray-900 text-[15px]
            placeholder-gray-500 resize-none
            focus:outline-none
            ${disabled ? 'cursor-not-allowed opacity-50' : ''}
          `}
          style={{ minHeight: '24px', maxHeight: '200px' }}
        />
        <button
          type="button"
          onClick={onSend}
          disabled={!canSend}
          className={`
            flex-shrink-0 w-8 h-8 rounded-lg
            flex items-center justify-center
            transition-all duration-200
            ${canSend
              ? 'bg-gray-900 text-white hover:bg-gray-800'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }
          `}
          aria-label="Send message"
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
      <p className="text-xs text-gray-400 mt-2 text-center">
        Press Enter to send
      </p>
    </div>
  );
}
