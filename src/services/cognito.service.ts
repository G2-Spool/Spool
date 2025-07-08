import { 
  CognitoIdentityProviderClient, 
  InitiateAuthCommand, 
  SignUpCommand,
  ConfirmSignUpCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
  GetUserCommand,
  AdminGetUserCommand,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  AdminDeleteUserCommand,
  GlobalSignOutCommand,
  ChangePasswordCommand
} from "@aws-sdk/client-cognito-identity-provider";
import { createHmac } from "crypto";
import { AuthResponse, UserProfile, CognitoConfig } from "../types/auth.types.js";
import { logger } from "../utils/logger.js";

export class CognitoService {
  private client: CognitoIdentityProviderClient;
  private config: CognitoConfig;

  constructor(config: CognitoConfig) {
    this.config = config;
    this.client = new CognitoIdentityProviderClient({
      region: config.region,
    });
  }

  /**
   * Generate secret hash for Cognito authentication
   */
  private generateSecretHash(username: string): string {
    const message = username + this.config.clientId;
    return createHmac('sha256', this.config.clientSecret)
      .update(message)
      .digest('base64');
  }

  /**
   * Sign in a user with email and password
   */
  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const secretHash = this.generateSecretHash(email);

      const command = new InitiateAuthCommand({
        AuthFlow: "USER_PASSWORD_AUTH",
        ClientId: this.config.clientId,
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password,
          SECRET_HASH: secretHash,
        },
      });

      const response = await this.client.send(command);

      if (response.ChallengeName) {
        return {
          success: false,
          challengeName: response.ChallengeName,
          session: response.Session,
        };
      }

      if (!response.AuthenticationResult) {
        throw new Error("No authentication result received");
      }

      return {
        success: true,
        tokens: {
          accessToken: response.AuthenticationResult.AccessToken!,
          idToken: response.AuthenticationResult.IdToken!,
          refreshToken: response.AuthenticationResult.RefreshToken!,
          expiresIn: response.AuthenticationResult.ExpiresIn,
        },
      };
    } catch (error: any) {
      logger.error("Sign in error:", error);
      return {
        success: false,
        error: error.message || "Authentication failed",
      };
    }
  }

  /**
   * Sign up a new user
   */
  async signUp(email: string, password: string, attributes?: Record<string, string>): Promise<AuthResponse> {
    try {
      const secretHash = this.generateSecretHash(email);

      const userAttributes = [
        { Name: "email", Value: email },
        ...(attributes ? Object.entries(attributes).map(([key, value]) => ({
          Name: key,
          Value: value,
        })) : []),
      ];

      const command = new SignUpCommand({
        ClientId: this.config.clientId,
        Username: email,
        Password: password,
        SecretHash: secretHash,
        UserAttributes: userAttributes,
      });

      const response = await this.client.send(command);

      return {
        success: true,
        challengeName: "EMAIL_VERIFICATION",
        userId: response.UserSub,
      };
    } catch (error: any) {
      logger.error("Sign up error:", error);
      return {
        success: false,
        error: error.message || "Registration failed",
      };
    }
  }

  /**
   * Confirm user sign up with verification code
   */
  async confirmSignUp(email: string, code: string): Promise<AuthResponse> {
    try {
      const secretHash = this.generateSecretHash(email);

      const command = new ConfirmSignUpCommand({
        ClientId: this.config.clientId,
        Username: email,
        ConfirmationCode: code,
        SecretHash: secretHash,
      });

      await this.client.send(command);

      return {
        success: true,
        message: "Email verified successfully",
      };
    } catch (error: any) {
      logger.error("Confirm sign up error:", error);
      return {
        success: false,
        error: error.message || "Verification failed",
      };
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string, email: string): Promise<AuthResponse> {
    try {
      const secretHash = this.generateSecretHash(email);

      const command = new InitiateAuthCommand({
        AuthFlow: "REFRESH_TOKEN_AUTH",
        ClientId: this.config.clientId,
        AuthParameters: {
          REFRESH_TOKEN: refreshToken,
          SECRET_HASH: secretHash,
        },
      });

      const response = await this.client.send(command);

      if (!response.AuthenticationResult) {
        throw new Error("No authentication result received");
      }

      return {
        success: true,
        tokens: {
          accessToken: response.AuthenticationResult.AccessToken!,
          idToken: response.AuthenticationResult.IdToken!,
          expiresIn: response.AuthenticationResult.ExpiresIn,
        },
      };
    } catch (error: any) {
      logger.error("Token refresh error:", error);
      return {
        success: false,
        error: error.message || "Token refresh failed",
      };
    }
  }

  /**
   * Get user profile from access token
   */
  async getUserProfile(accessToken: string): Promise<UserProfile | null> {
    try {
      const command = new GetUserCommand({
        AccessToken: accessToken,
      });

      const response = await this.client.send(command);

      const attributes = response.UserAttributes?.reduce((acc, attr) => {
        acc[attr.Name!] = attr.Value!;
        return acc;
      }, {} as Record<string, string>) || {};

      return {
        sub: attributes.sub,
        email: attributes.email,
        emailVerified: attributes.email_verified === 'true',
        username: response.Username!,
        attributes,
      };
    } catch (error: any) {
      logger.error("Get user profile error:", error);
      return null;
    }
  }

  /**
   * Initiate forgot password flow
   */
  async forgotPassword(email: string): Promise<AuthResponse> {
    try {
      const secretHash = this.generateSecretHash(email);

      const command = new ForgotPasswordCommand({
        ClientId: this.config.clientId,
        Username: email,
        SecretHash: secretHash,
      });

      await this.client.send(command);

      return {
        success: true,
        message: "Password reset code sent to email",
      };
    } catch (error: any) {
      logger.error("Forgot password error:", error);
      return {
        success: false,
        error: error.message || "Failed to initiate password reset",
      };
    }
  }

  /**
   * Confirm forgot password with reset code
   */
  async confirmForgotPassword(email: string, code: string, newPassword: string): Promise<AuthResponse> {
    try {
      const secretHash = this.generateSecretHash(email);

      const command = new ConfirmForgotPasswordCommand({
        ClientId: this.config.clientId,
        Username: email,
        ConfirmationCode: code,
        Password: newPassword,
        SecretHash: secretHash,
      });

      await this.client.send(command);

      return {
        success: true,
        message: "Password reset successfully",
      };
    } catch (error: any) {
      logger.error("Confirm forgot password error:", error);
      return {
        success: false,
        error: error.message || "Failed to reset password",
      };
    }
  }

  /**
   * Sign out user globally (invalidate all tokens)
   */
  async signOut(accessToken: string): Promise<AuthResponse> {
    try {
      const command = new GlobalSignOutCommand({
        AccessToken: accessToken,
      });

      await this.client.send(command);

      return {
        success: true,
        message: "Signed out successfully",
      };
    } catch (error: any) {
      logger.error("Sign out error:", error);
      return {
        success: false,
        error: error.message || "Failed to sign out",
      };
    }
  }

  /**
   * Admin: Get user by email
   */
  async adminGetUser(email: string): Promise<UserProfile | null> {
    try {
      const command = new AdminGetUserCommand({
        UserPoolId: this.config.userPoolId,
        Username: email,
      });

      const response = await this.client.send(command);

      const attributes = response.UserAttributes?.reduce((acc, attr) => {
        acc[attr.Name!] = attr.Value!;
        return acc;
      }, {} as Record<string, string>) || {};

      return {
        sub: attributes.sub,
        email: attributes.email,
        emailVerified: attributes.email_verified === 'true',
        username: response.Username!,
        attributes,
        enabled: response.Enabled,
        status: response.UserStatus,
        created: response.UserCreateDate,
        modified: response.UserLastModifiedDate,
      };
    } catch (error: any) {
      logger.error("Admin get user error:", error);
      return null;
    }
  }

  /**
   * Admin: Create user
   */
  async adminCreateUser(email: string, temporaryPassword: string, attributes?: Record<string, string>): Promise<AuthResponse> {
    try {
      const userAttributes = [
        { Name: "email", Value: email },
        { Name: "email_verified", Value: "true" },
        ...(attributes ? Object.entries(attributes).map(([key, value]) => ({
          Name: key,
          Value: value,
        })) : []),
      ];

      const command = new AdminCreateUserCommand({
        UserPoolId: this.config.userPoolId,
        Username: email,
        TemporaryPassword: temporaryPassword,
        UserAttributes: userAttributes,
        MessageAction: "SUPPRESS", // Don't send welcome email
      });

      const response = await this.client.send(command);

      return {
        success: true,
        userId: response.User?.Username,
        message: "User created successfully",
      };
    } catch (error: any) {
      logger.error("Admin create user error:", error);
      return {
        success: false,
        error: error.message || "Failed to create user",
      };
    }
  }

  /**
   * Admin: Delete user
   */
  async adminDeleteUser(email: string): Promise<AuthResponse> {
    try {
      const command = new AdminDeleteUserCommand({
        UserPoolId: this.config.userPoolId,
        Username: email,
      });

      await this.client.send(command);

      return {
        success: true,
        message: "User deleted successfully",
      };
    } catch (error: any) {
      logger.error("Admin delete user error:", error);
      return {
        success: false,
        error: error.message || "Failed to delete user",
      };
    }
  }
} 