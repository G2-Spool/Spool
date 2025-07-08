import { API_ENDPOINTS, apiCall } from '@/lib/api-config'

export interface AuthResponse {
  accessToken?: string
  idToken?: string
  refreshToken?: string
  challengeName?: string
  session?: string
  error?: string
}

export interface User {
  sub: string
  email: string
  email_verified: boolean
  given_name?: string
  family_name?: string
}

export async function signIn(email: string, password: string): Promise<AuthResponse> {
  const response = await apiCall<AuthResponse>(API_ENDPOINTS.AUTH.SIGNIN, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })

  if (response.success && response.data) {
    return response.data
  }

  return { error: response.error || 'Authentication failed' }
}

export async function signUp(email: string, password: string): Promise<AuthResponse> {
  const response = await apiCall<AuthResponse>(API_ENDPOINTS.AUTH.SIGNUP, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })

  if (response.success && response.data) {
    return response.data
  }

  return { error: response.error || 'Registration failed' }
}

export async function signOut(): Promise<void> {
  await apiCall(API_ENDPOINTS.AUTH.SIGNOUT, {
    method: 'POST',
  })
}

export async function getCurrentUser(): Promise<User | null> {
  const response = await apiCall<User>(API_ENDPOINTS.AUTH.ME, {
    method: 'GET',
  })

  if (response.success && response.data) {
    return response.data
  }

  return null
}

export async function confirmSignUp(email: string, code: string): Promise<AuthResponse> {
  const response = await apiCall<AuthResponse>(API_ENDPOINTS.AUTH.CONFIRM, {
    method: 'POST',
    body: JSON.stringify({ email, code }),
  })

  if (response.success && response.data) {
    return response.data
  }

  return { error: response.error || 'Confirmation failed' }
}

export async function forgotPassword(email: string): Promise<AuthResponse> {
  const response = await apiCall<AuthResponse>(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
    method: 'POST',
    body: JSON.stringify({ email }),
  })

  if (response.success && response.data) {
    return response.data
  }

  return { error: response.error || 'Password reset request failed' }
}

export async function resetPassword(email: string, code: string, newPassword: string): Promise<AuthResponse> {
  const response = await apiCall<AuthResponse>(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
    method: 'POST',
    body: JSON.stringify({ email, code, newPassword }),
  })

  if (response.success && response.data) {
    return response.data
  }

  return { error: response.error || 'Password reset failed' }
}

export async function refreshToken(refreshToken: string): Promise<AuthResponse> {
  const response = await apiCall<AuthResponse>(API_ENDPOINTS.AUTH.REFRESH, {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  })

  if (response.success && response.data) {
    return response.data
  }

  return { error: response.error || 'Token refresh failed' }
}

// Helper function to parse JWT token (client-side use only)
export function parseJwtToken(token: string): any {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error("Token parsing error:", error)
    return null
  }
} 