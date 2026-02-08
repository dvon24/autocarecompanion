'use client';

import { useState, useCallback, useRef } from 'react';
import {
  type ChatMessage,
  type Diagnosis,
  createChatMessage,
} from '@/schemas/chat.schema';
import { type Vehicle } from '@/schemas/vehicle.schema';
import { type OBDCodeEntry } from '@/schemas/obd.schema';

/**
 * useSymptomChat Hook - Symptom Chat State Management
 *
 * Manages the AI symptom diagnosis conversation.
 *
 * Follows Architecture patterns:
 * - Async function naming: sendMessage (async API call)
 * - Immutable state updates
 */

type ChatStatus = 'idle' | 'sending' | 'error';

type UseSymptomChatReturn = {
  // Message state
  messages: ChatMessage[];
  currentMessage: string;
  setCurrentMessage: (message: string) => void;

  // Status
  status: ChatStatus;
  error: string | null;
  isLoading: boolean;

  // Diagnosis state
  diagnosis: Diagnosis | null;
  hasDiagnosis: boolean;

  // Actions
  sendMessage: () => Promise<void>;
  clearChat: () => void;
};

type UseSymptomChatOptions = {
  vehicle: Vehicle | null;
  obdCodes?: OBDCodeEntry[];
};

export function useSymptomChat(options: UseSymptomChatOptions): UseSymptomChatReturn {
  const { vehicle, obdCodes = [] } = options;
  // Message state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');

  // Status state
  const [status, setStatus] = useState<ChatStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  // Diagnosis state
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);

  // Ref to track if component is mounted
  const isMountedRef = useRef(true);

  // Send message to AI
  const sendMessage = useCallback(async () => {
    if (!currentMessage.trim() || !vehicle) return;
    if (status === 'sending') return;

    const userMessage = createChatMessage('user', currentMessage.trim());

    // Add user message immediately
    setMessages((prev) => [...prev, userMessage]);
    setCurrentMessage('');
    setStatus('sending');
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          conversationHistory: messages,
          vehicle: {
            year: vehicle.year,
            make: vehicle.make,
            model: vehicle.model,
            trim: vehicle.trim,
          },
          obdCodes: obdCodes.length > 0 ? obdCodes : undefined,
        }),
      });

      if (!isMountedRef.current) return;

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to send message');
      }

      const data = await response.json();

      if (!isMountedRef.current) return;

      // Add assistant message
      if (data.message) {
        setMessages((prev) => [...prev, data.message]);
      }

      // Check for diagnosis
      if (data.diagnosis) {
        setDiagnosis(data.diagnosis);
      }

      setStatus('idle');
    } catch (err) {
      if (!isMountedRef.current) return;

      setStatus('error');
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  }, [currentMessage, messages, vehicle, status, obdCodes]);

  // Clear chat and start over
  const clearChat = useCallback(() => {
    setMessages([]);
    setCurrentMessage('');
    setStatus('idle');
    setError(null);
    setDiagnosis(null);
  }, []);

  return {
    // Messages
    messages,
    currentMessage,
    setCurrentMessage,

    // Status
    status,
    error,
    isLoading: status === 'sending',

    // Diagnosis
    diagnosis,
    hasDiagnosis: diagnosis !== null,

    // Actions
    sendMessage,
    clearChat,
  };
}
