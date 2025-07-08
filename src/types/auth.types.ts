export interface CognitoConfig {
  region: string;
  userPoolId: string;
  clientId: string;
  clientSecret: string;
}

export interface AuthTokens {
  accessToken: string;
  idToken: string;
  refreshToken?: string;
  expiresIn?: number;
}

export interface AuthResponse {
  success: boolean;
  tokens?: AuthTokens;
  challengeName?: string;
  session?: string;
  userId?: string;
  error?: string;
  message?: string;
}

export interface UserProfile {
  sub: string;
  email: string;
  emailVerified: boolean;
  username: string;
  attributes: Record<string, string>;
  enabled?: boolean;
  status?: string;
  created?: Date;
  modified?: Date;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignUpRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  attributes?: Record<string, string>;
}

export interface ConfirmSignUpRequest {
  email: string;
  code: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
  email: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  email_verified: boolean;
  exp: number;
  iat: number;
  [key: string]: any;
} 