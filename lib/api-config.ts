// API Service URLs
export const API_SERVICES = {
  AUTH: process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://localhost:3001',
  CONTENT: process.env.NEXT_PUBLIC_CONTENT_SERVICE_URL || 'http://localhost:3002',
  INTERVIEW: process.env.NEXT_PUBLIC_INTERVIEW_SERVICE_URL || 'http://localhost:8080',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  // Auth Service
  AUTH: {
    SIGNIN: `${API_SERVICES.AUTH}/auth/signin`,
    SIGNUP: `${API_SERVICES.AUTH}/auth/signup`,
    CONFIRM: `${API_SERVICES.AUTH}/auth/confirm`,
    SIGNOUT: `${API_SERVICES.AUTH}/auth/signout`,
    ME: `${API_SERVICES.AUTH}/auth/me`,
    REFRESH: `${API_SERVICES.AUTH}/auth/refresh`,
    FORGOT_PASSWORD: `${API_SERVICES.AUTH}/auth/forgot-password`,
    RESET_PASSWORD: `${API_SERVICES.AUTH}/auth/reset-password`,
  },
  
  // Content Service
  CONTENT: {
    GENERATE_EXERCISE: `${API_SERVICES.CONTENT}/content/generate-exercise`,
    ASSESS_ANSWER: `${API_SERVICES.CONTENT}/content/assess-answer`,
    RECOMMENDATIONS: `${API_SERVICES.CONTENT}/content/recommendations`,
    STATS: `${API_SERVICES.CONTENT}/content/stats`,
    LEARNING_PATH: `${API_SERVICES.CONTENT}/content/learning-path`,
    UPDATE_LEARNING_PATH: `${API_SERVICES.CONTENT}/content/learning-path/update`,
  },
  
  // Interview Service
  INTERVIEW: {
    WEBSOCKET: `${API_SERVICES.INTERVIEW.replace('http', 'ws')}/interview`,
  },
} as const;

// Helper function to get auth headers
export function getAuthHeaders(token?: string): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

// Helper function for API calls
export async function apiCall<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: data.error || `HTTP ${response.status}`,
      };
    }
    
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('API call error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
} 