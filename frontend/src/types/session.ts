/**
 * Type definitions for sessions and messages.
 */

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  parameters?: Record<string, any>;
}

export interface Session {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  model_name: string;
  endpoint_type: 'chat' | 'generate';
  message_count?: number;
}

export interface SessionDetail extends Session {
  messages: Message[];
}

export interface CreateSessionRequest {
  name: string;
  model_name: string;
  endpoint_type: 'chat' | 'generate';
}

export interface ContextInfo {
  total_messages: number;
  context_messages: number;
  estimated_tokens: number;
  context_limit: number;
  usage_percentage: number;
}
