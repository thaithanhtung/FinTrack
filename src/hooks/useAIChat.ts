import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { sendChatMessage } from '@/services/api';
import type { ChatMessage } from '@/types';

const STORAGE_KEY = 'fintrack_chat_history';
const MAX_HISTORY = 20;

// Load chat history from localStorage
function loadChatHistory(): ChatMessage[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((msg: ChatMessage) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }));
    }
  } catch (e) {
    console.error('Error loading chat history:', e);
  }
  return [];
}

// Save chat history to localStorage
function saveChatHistory(messages: ChatMessage[]) {
  try {
    // Keep only last MAX_HISTORY messages
    const toSave = messages.slice(-MAX_HISTORY);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (e) {
    console.error('Error saving chat history:', e);
  }
}

export function useAIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    loadChatHistory()
  );

  const mutation = useMutation({
    mutationFn: async (userMessage: string) => {
      // Prepare chat history for API (without id and timestamp)
      const historyForAPI = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      return sendChatMessage(userMessage, historyForAPI);
    },
    onSuccess: (aiResponse) => {
      // Add AI response to messages
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      };

      setMessages((prev) => {
        const updated = [...prev, aiMessage];
        saveChatHistory(updated);
        return updated;
      });
    },
  });

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      // Add user message immediately
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: content.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => {
        const updated = [...prev, userMessage];
        saveChatHistory(updated);
        return updated;
      });

      // Send to AI
      mutation.mutate(content.trim());
    },
    [mutation]
  );

  const clearHistory = useCallback(() => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    messages,
    sendMessage,
    clearHistory,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
