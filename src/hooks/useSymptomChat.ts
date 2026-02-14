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
  alternativeDiagnoses: Diagnosis[];
  hasDiagnosis: boolean;

  // Actions
  sendMessage: (overrideMessage?: string) => Promise<void>;
  clearChat: () => void;
  selectAlternative: (alternative: Diagnosis) => void;
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
  const [alternativeDiagnoses, setAlternativeDiagnoses] = useState<Diagnosis[]>([]);

  // Ref to track if component is mounted
  const isMountedRef = useRef(true);

  // Send message to AI
  const sendMessage = useCallback(async (overrideMessage?: string) => {
    // Handle case where event object is passed instead of string
    const messageToSend = typeof overrideMessage === 'string' ? overrideMessage : currentMessage;
    if (!messageToSend.trim() || !vehicle) return;
    if (status === 'sending') return;

    const userMessage = createChatMessage('user', messageToSend.trim());

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

      // Check for alternatives
      if (data.alternativeDiagnoses && data.alternativeDiagnoses.length > 0) {
        setAlternativeDiagnoses(data.alternativeDiagnoses);
      }

      setStatus('idle');
    } catch (err) {
      if (!isMountedRef.current) return;

      setStatus('error');
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  }, [currentMessage, messages, vehicle, status, obdCodes]);

  // Select an alternative diagnosis as the primary
  const selectAlternative = useCallback((alternative: Diagnosis) => {
    // Move current diagnosis to alternatives (if exists) and set new primary
    setAlternativeDiagnoses((prev) => {
      const newAlternatives = prev.filter((d) => d.id !== alternative.id);
      if (diagnosis) {
        // Add current diagnosis to alternatives
        newAlternatives.unshift(diagnosis);
      }
      return newAlternatives.slice(0, 3); // Keep max 3 alternatives
    });
    setDiagnosis(alternative);
  }, [diagnosis]);

  // Clear chat and start over
  const clearChat = useCallback(() => {
    setMessages([]);
    setCurrentMessage('');
    setStatus('idle');
    setError(null);
    setDiagnosis(null);
    setAlternativeDiagnoses([]);
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
    alternativeDiagnoses,
    hasDiagnosis: diagnosis !== null,

    // Actions
    sendMessage,
    clearChat,
    selectAlternative,
  };
}
