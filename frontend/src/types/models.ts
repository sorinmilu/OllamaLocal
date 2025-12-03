/**
 * Type definitions for models.
 */

export interface Model {
  name: string;
  modified_at: string;
  size: number;
  digest: string;
  details?: {
    format?: string;
    family?: string;
    parameter_size?: string;
    quantization_level?: string;
  };
}

export interface ModelInfo {
  modelfile?: string;
  parameters?: string;
  template?: string;
  details?: {
    format?: string;
    family?: string;
    parameter_size?: string;
    quantization_level?: string;
  };
}

export interface DownloadProgress {
  status: string;
  completed?: number;
  total?: number;
  error?: string;
}
