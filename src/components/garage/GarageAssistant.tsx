'use client';

import { useState, useRef, useEffect, useMemo } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface MaintenanceStatus {
  type: string;
  typeName: string;
  status: 'ok' | 'due_soon' | 'overdue' | 'unknown';
  message: string;
}

interface NewVehiclePrompt {
  vehicleName: string;
  vehicleId: string;
}

interface GarageAssistantProps {
  onActionComplete?: () => void;
  vehicleId?: string;
  vehicleName?: string;
  maintenanceStatuses?: MaintenanceStatus[];
  newVehiclePrompt?: NewVehiclePrompt;
  onNewVehiclePromptShown?: () => void;
}

export function GarageAssistant({
  onActionComplete,
  vehicleId,
  vehicleName,
  maintenanceStatuses = [],
  newVehiclePrompt,
  onNewVehiclePromptShown,
}: GarageAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasShownNewVehiclePrompt, setHasShownNewVehiclePrompt] = useState(false);

  // Get overdue and due soon items for proactive suggestions
  const overdueItems = useMemo(() =>
    maintenanceStatuses.filter(s => s.status === 'overdue'),
    [maintenanceStatuses]
  );
  const dueSoonItems = useMemo(() =>
    maintenanceStatuses.filter(s => s.status === 'due_soon'),
    [maintenanceStatuses]
  );

  // Generate contextual welcome message
  const welcomeMessage = useMemo(() => {
    let message = "Hi! I'm your garage assistant. I can help you:\n\n• Log maintenance (\"Log oil change at 45,000 miles\")\n• Update mileage (\"Update my Civic to 50,000 miles\")\n• Check what's due (\"What maintenance is due?\")\n";

    if (overdueItems.length > 0) {
      const overdueNames = overdueItems.slice(0, 3).map(i => i.typeName).join(', ');
      message += `\n⚠️ Attention: ${overdueItems.length === 1 ? `${overdueNames} is` : `${overdueNames} are`} overdue. Would you like me to log ${overdueItems.length === 1 ? 'it' : 'any of them'}?`;
    } else if (dueSoonItems.length > 0) {
      const dueNames = dueSoonItems.slice(0, 2).map(i => i.typeName).join(', ');
      message += `\n📅 Coming up: ${dueNames} ${dueSoonItems.length === 1 ? 'is' : 'are'} due soon.`;
    }

    message += '\n\nHow can I help?';
    return message;
  }, [overdueItems, dueSoonItems]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: welcomeMessage,
    },
  ]);

  // Update welcome message when maintenance statuses change
  useEffect(() => {
    setMessages(prev => [{
      id: 'welcome',
      role: 'assistant',
      content: welcomeMessage,
    }, ...prev.slice(1)]);
  }, [welcomeMessage]);

  // Auto-open and show new vehicle prompt
  useEffect(() => {
    if (newVehiclePrompt && !hasShownNewVehiclePrompt) {
      setHasShownNewVehiclePrompt(true);
      setIsOpen(true);

      // Add a special welcome message for the new vehicle
      const newVehicleMessage: Message = {
        id: `new-vehicle-${Date.now()}`,
        role: 'assistant',
        content: `Congratulations on adding your ${newVehiclePrompt.vehicleName}! I can help you set up maintenance tracking right away.\n\nWould you like me to:\n• Log your recent maintenance history\n• Check what services might be due based on mileage\n• Set up maintenance reminders\n\nJust tell me about any recent oil changes, tire rotations, or other services you've had done, and I'll add them to your records.`,
      };

      setMessages(prev => [...prev, newVehicleMessage]);
      onNewVehiclePromptShown?.();
    }
  }, [newVehiclePrompt, hasShownNewVehiclePrompt, onNewVehiclePromptShown]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/garage/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          conversationHistory: messages
            .filter(m => m.id !== 'welcome')
            .map(m => ({ role: m.role, content: m.content })),
          // Include vehicle context if available
          vehicleContext: vehicleId ? {
            vehicleId,
            vehicleName,
            overdueItems: overdueItems.map(i => ({ type: i.type, name: i.typeName })),
            dueSoonItems: dueSoonItems.map(i => ({ type: i.type, name: i.typeName })),
          } : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('API Error:', response.status, data);
        throw new Error(data.error || 'Failed to send message');
      }

      let responseContent = data.message;

      // If an action was performed and there are more overdue items, suggest next action
      if (data.actions && data.actions.length > 0) {
        const actionTypes = data.actions.map((a: { tool: string }) => a.tool);

        // If we just logged maintenance, check if there are more items to log
        if (actionTypes.includes('log_maintenance') && overdueItems.length > 1) {
          const remainingOverdue = overdueItems.slice(1);
          if (remainingOverdue.length > 0) {
            responseContent += `\n\n📋 You still have ${remainingOverdue.length} more overdue ${remainingOverdue.length === 1 ? 'item' : 'items'}. Would you like to log ${remainingOverdue[0].typeName.toLowerCase()} next?`;
          }
        }

        onActionComplete?.();
      }

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: responseContent,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Generate contextual quick actions
  const quickActions = useMemo(() => {
    const actions: string[] = [];

    // Add overdue items as quick actions
    if (overdueItems.length > 0) {
      const firstOverdue = overdueItems[0];
      actions.push(`Log ${firstOverdue.typeName.toLowerCase()}`);
    }

    // Add due soon items
    if (dueSoonItems.length > 0 && actions.length < 2) {
      const firstDueSoon = dueSoonItems[0];
      if (!actions.some(a => a.toLowerCase().includes(firstDueSoon.typeName.toLowerCase()))) {
        actions.push(`Log ${firstDueSoon.typeName.toLowerCase()}`);
      }
    }

    // Default actions
    if (!actions.some(a => a.includes("What's due"))) {
      actions.push("What's due soon?");
    }
    if (actions.length < 3) {
      actions.push("Update mileage");
    }

    return actions.slice(0, 3);
  }, [overdueItems, dueSoonItems]);

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
          isOpen
            ? 'bg-gray-600 hover:bg-gray-700'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
        aria-label={isOpen ? 'Close assistant' : 'Open garage assistant'}
      >
        {isOpen ? (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col" style={{ height: '500px', maxHeight: 'calc(100vh - 8rem)' }}>
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-sm">Garage Assistant</h3>
                <p className="text-xs text-blue-100">Manage your vehicles with AI</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm shadow-sm'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 px-4 py-2.5 rounded-2xl rounded-bl-sm border border-gray-100 shadow-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick actions */}
          {messages.length <= 2 && !isLoading && (
            <div className="px-4 py-2 border-t border-gray-100 bg-white">
              <div className="flex flex-wrap gap-2">
                {quickActions.map(action => (
                  <button
                    key={action}
                    onClick={() => {
                      setInput(action);
                      inputRef.current?.focus();
                    }}
                    className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-gray-200 bg-white">
            <div className="flex gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={1}
                style={{ maxHeight: '100px' }}
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
