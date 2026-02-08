'use client';

import { useRef, useEffect, type KeyboardEvent } from 'react';

/**
 * ChatInput - Message input component with send button
 *
 * Follows Architecture patterns:
 * - Touch targets 44x44px minimum (NFR-A7)
 * - Discovery phase styling
 * - Named exports only
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
  placeholder = "Describe your vehicle's symptoms...",
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className={`
              w-full px-4 py-3 rounded-lg border border-gray-300
              text-gray-900 placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              resize-none transition-colors
              ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}
            `}
            style={{ minHeight: '44px' }}
          />
        </div>
        <button
          type="button"
          onClick={onSend}
          disabled={!canSend}
          className={`
            min-h-[44px] min-w-[44px] px-4
            rounded-lg font-medium transition-all
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            ${canSend
              ? 'bg-gray-900 text-white hover:bg-gray-800'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }
          `}
          aria-label="Send message"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </button>
      </div>
      {!disabled && (
        <p className="text-xs text-gray-400 mt-2 text-center">
          Press Enter to send, Shift+Enter for new line
        </p>
      )}
    </div>
  );
}
