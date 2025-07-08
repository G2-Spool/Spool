import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager"

const client = new SecretsManagerClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION || "us-east-1",
})

interface SecretCache {
  [key: string]: {
    value: string
    timestamp: number
  }
}

// Cache secrets for 5 minutes to reduce API calls
const secretCache: SecretCache = {}
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export async function getSecret(secretName: string): Promise<string> {
  const now = Date.now()
  const cached = secretCache[secretName]
  
  // Return cached value if still valid
  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    return cached.value
  }

  try {
    const command = new GetSecretValueCommand({
      SecretId: secretName,
    })
    
    const response = await client.send(command)
    const secretValue = response.SecretString
    
    if (!secretValue) {
      throw new Error(`Secret ${secretName} not found or empty`)
    }

    // Cache the secret
    secretCache[secretName] = {
      value: secretValue,
      timestamp: now,
    }
    
    return secretValue
  } catch (error) {
    console.error(`Failed to retrieve secret ${secretName}:`, error)
    throw error
  }
}

export async function getOpenAIKey(): Promise<string> {
  return getSecret("spool/openai-api-key")
} 