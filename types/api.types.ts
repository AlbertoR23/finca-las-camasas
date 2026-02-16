// Respuestas API genéricas
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Errores
export interface ApiError {
  code: string;
  message: string;
  details?: any;
  stack?: string;
}

// Métricas
export interface HealthCheckResponse {
  status: "healthy" | "unhealthy";
  timestamp: string;
  version: string;
  environment: string;
  services: {
    supabase: boolean;
    bcv: boolean;
    telegram: boolean;
  };
}

// Configuración
export interface AppConfig {
  version: string;
  environment: "development" | "production" | "test";
  features: {
    telegram: boolean;
    genealogia: boolean;
    exportData: boolean;
  };
}

// Webhooks
export interface WebhookPayload<T = any> {
  event: string;
  timestamp: string;
  data: T;
}

export interface TelegramWebhookPayload {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      is_bot: boolean;
      first_name: string;
      username?: string;
    };
    chat: {
      id: number;
      type: string;
    };
    date: number;
    text?: string;
  };
}
