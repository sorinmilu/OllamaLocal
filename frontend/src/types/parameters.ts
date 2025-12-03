/**
 * Type definitions for parameters.
 */

export interface Parameters {
  temperature: number;
  top_p: number;
  top_k: number;
  repeat_penalty: number;
  num_ctx: number;
  num_predict: number;
  stream: boolean;
  seed?: number;
  stop: string[];
  mirostat: number;
  mirostat_tau: number;
  mirostat_eta: number;
  num_thread: number;
}

export interface ParameterPreset {
  id: number;
  name: string;
  description?: string;
  parameters: Partial<Parameters>;
}

export interface GenerateRequest {
  model: string;
  endpoint_type: 'chat' | 'generate';
  messages: Array<{
    role: string;
    content: string;
  }>;
  parameters: Parameters;
  session_id?: string;
}
