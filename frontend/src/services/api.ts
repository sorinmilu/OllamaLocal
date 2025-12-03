/**
 * API client for backend communication.
 */
import axios from 'axios';
import type { Model, ModelInfo } from '../types/models';
import type { Session, SessionDetail, CreateSessionRequest, ContextInfo } from '../types/session';
import type { Parameters, ParameterPreset, GenerateRequest } from '../types/parameters';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 502) {
      throw new Error('Ollama instance not available');
    }
    return Promise.reject(error);
  }
);

// Models API
export const getModels = async (): Promise<Model[]> => {
  const response = await apiClient.get('/models');
  return response.data;
};

export const getModelInfo = async (modelName: string): Promise<ModelInfo> => {
  const response = await apiClient.get(`/models/${modelName}/info`);
  return response.data;
};

export const downloadModel = async (modelName: string): Promise<Response> => {
  const response = await fetch(`${apiClient.defaults.baseURL}/models/download`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model_name: modelName }),
  });
  return response;
};

export const deleteModel = async (modelName: string): Promise<void> => {
  await apiClient.delete(`/models/${modelName}`);
};

// Sessions API
export const getSessions = async (): Promise<Session[]> => {
  const response = await apiClient.get('/sessions');
  return response.data;
};

export const createSession = async (data: CreateSessionRequest): Promise<Session> => {
  const response = await apiClient.post('/sessions', data);
  return response.data;
};

export const getSession = async (id: string, contextSize?: number): Promise<SessionDetail> => {
  const response = await apiClient.get(`/sessions/${id}`, {
    params: contextSize ? { context_size: contextSize } : {},
  });
  return response.data;
};

export const updateSession = async (id: string, updates: { name?: string }): Promise<Session> => {
  const response = await apiClient.put(`/sessions/${id}`, updates);
  return response.data;
};

export const deleteSession = async (id: string): Promise<void> => {
  await apiClient.delete(`/sessions/${id}`);
};

export const getContextInfo = async (sessionId: string): Promise<ContextInfo> => {
  const response = await apiClient.get(`/sessions/${sessionId}/context-info`);
  return response.data;
};

// Parameters API
export const getParameterPresets = async (): Promise<ParameterPreset[]> => {
  const response = await apiClient.get('/parameters/presets');
  return response.data;
};

export const getDefaultParameters = async (): Promise<Parameters> => {
  const response = await apiClient.get('/parameters/defaults');
  return response.data;
};

// Chat API
export const generateResponse = async (request: GenerateRequest): Promise<any> => {
  const response = await apiClient.post('/chat/generate', request);
  return response.data;
};

export const streamGenerate = async (request: GenerateRequest): Promise<Response> => {
  const response = await fetch(`${apiClient.defaults.baseURL}/chat/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
  return response;
};

// Export API
export const exportSessionToPDF = async (sessionId: string): Promise<Blob> => {
  const response = await apiClient.post(
    '/export/pdf',
    { session_id: sessionId },
    { responseType: 'blob' }
  );
  return response.data;
};

export default apiClient;
