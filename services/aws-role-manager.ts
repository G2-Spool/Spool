import { STSClient, AssumeRoleCommand } from "@aws-sdk/client-sts"

interface AssumedRoleCredentials {
  accessKeyId: string
  secretAccessKey: string
  sessionToken: string
  expiration: Date
}

class AWSRoleManager {
  private stsClient: STSClient
  private credentials: AssumedRoleCredentials | null = null
  private readonly roleArn = `arn:aws:iam::560281064968:role/SpoolAIAssistantRole`
  private readonly externalId = "spool-ai-assistant-external-id"
  private readonly sessionName = "SpoolAIAssistantSession"

  constructor() {
    this.stsClient = new STSClient({
      region: process.env.NEXT_PUBLIC_AWS_REGION || "us-east-1",
    })
  }

  /**
   * Assume the AI Assistant role for AWS operations
   */
  async assumeAIAssistantRole(): Promise<AssumedRoleCredentials> {
    // Check if current credentials are still valid (with 5-minute buffer)
    if (this.credentials && this.credentials.expiration > new Date(Date.now() + 5 * 60 * 1000)) {
      return this.credentials
    }

    try {
      const command = new AssumeRoleCommand({
        RoleArn: this.roleArn,
        RoleSessionName: this.sessionName,
        ExternalId: this.externalId,
        DurationSeconds: 3600, // 1 hour
      })

      const response = await this.stsClient.send(command)

      if (!response.Credentials) {
        throw new Error("No credentials returned from AssumeRole")
      }

      this.credentials = {
        accessKeyId: response.Credentials.AccessKeyId!,
        secretAccessKey: response.Credentials.SecretAccessKey!,
        sessionToken: response.Credentials.SessionToken!,
        expiration: response.Credentials.Expiration!,
      }

      return this.credentials
    } catch (error) {
      console.error("Failed to assume AI Assistant role:", error)
      throw new Error("Unable to assume AI Assistant role for AWS operations")
    }
  }

  /**
   * Get AWS SDK client configuration with assumed role credentials
   */
  async getAWSConfig() {
    const credentials = await this.assumeAIAssistantRole()
    
    return {
      region: process.env.NEXT_PUBLIC_AWS_REGION || "us-east-1",
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
        sessionToken: credentials.sessionToken,
      },
    }
  }

  /**
   * Clear cached credentials (useful for testing or manual refresh)
   */
  clearCredentials(): void {
    this.credentials = null
  }

  /**
   * Check if the role assumption is working correctly
   */
  async testRoleAssumption(): Promise<boolean> {
    try {
      await this.assumeAIAssistantRole()
      return true
    } catch (error) {
      console.error("Role assumption test failed:", error)
      return false
    }
  }
}

// Export singleton instance
export const awsRoleManager = new AWSRoleManager()

// Export types for use in other modules
export type { AssumedRoleCredentials } 