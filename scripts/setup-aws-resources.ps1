# AWS Resources Setup Script for Spool Application (PowerShell)
# This script creates the required AWS Cognito and Secrets Manager resources

# Configuration
$REGION = "us-east-1"
$USER_POOL_NAME = "spool-user-pool"
$APP_CLIENT_NAME = "spool-app-client"
$SECRET_NAME = "spool/openai-api-key"

Write-Host "🚀 Setting up AWS Resources for Spool Application..." -ForegroundColor Blue
Write-Host "====================================================" -ForegroundColor Blue

# Helper functions
function Write-Info {
    param($Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Blue
}

function Write-Success {
    param($Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Warning {
    param($Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Error {
    param($Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

# Check if AWS CLI is configured
try {
    $callerIdentity = aws sts get-caller-identity --output json | ConvertFrom-Json
    Write-Info "AWS Identity confirmed"
    Write-Host "Account: $($callerIdentity.Account)"
    Write-Host "User: $($callerIdentity.Arn)"
}
catch {
    Write-Error "AWS CLI is not configured or credentials are invalid"
    Write-Host "Please run: aws configure"
    exit 1
}

Write-Host ""
Write-Info "Step 1: Creating Cognito User Pool..."

# Check if user pool already exists
try {
    $existingPools = aws cognito-idp list-user-pools --max-results 10 --region $REGION --output json | ConvertFrom-Json
    $existingPool = $existingPools.UserPools | Where-Object { $_.Name -eq $USER_POOL_NAME }
    
    if ($existingPool) {
        Write-Warning "User pool '$USER_POOL_NAME' already exists with ID: $($existingPool.Id)"
        $USER_POOL_ID = $existingPool.Id
    }
    else {
        # Create user pool
        Write-Info "Creating user pool: $USER_POOL_NAME"
        
        $userPoolPolicy = @{
            PasswordPolicy = @{
                MinimumLength = 8
                RequireUppercase = $true
                RequireLowercase = $true
                RequireNumbers = $true
                RequireSymbols = $false
            }
        } | ConvertTo-Json -Compress
        
        $schema = @(
            @{
                Name = "email"
                Required = $true
                Mutable = $true
                AttributeDataType = "String"
            }
        ) | ConvertTo-Json -Compress
        
        $userPoolOutput = aws cognito-idp create-user-pool `
            --pool-name $USER_POOL_NAME `
            --policies $userPoolPolicy `
            --auto-verified-attributes email `
            --username-attributes email `
            --schema $schema `
            --region $REGION `
            --output json | ConvertFrom-Json
        
        $USER_POOL_ID = $userPoolOutput.UserPool.Id
        Write-Success "Created user pool with ID: $USER_POOL_ID"
    }
}
catch {
    Write-Error "Failed to create/check user pool: $($_.Exception.Message)"
    exit 1
}

Write-Host ""
Write-Info "Step 2: Creating App Client..."

# Check if app client already exists
try {
    $existingClients = aws cognito-idp list-user-pool-clients --user-pool-id $USER_POOL_ID --region $REGION --output json | ConvertFrom-Json
    $existingClient = $existingClients.UserPoolClients | Where-Object { $_.ClientName -eq $APP_CLIENT_NAME }
    
    if ($existingClient) {
        Write-Warning "App client '$APP_CLIENT_NAME' already exists with ID: $($existingClient.ClientId)"
        $APP_CLIENT_ID = $existingClient.ClientId
        
        # Get client secret
        $clientDetails = aws cognito-idp describe-user-pool-client --user-pool-id $USER_POOL_ID --client-id $existingClient.ClientId --region $REGION --output json | ConvertFrom-Json
        $APP_CLIENT_SECRET = $clientDetails.UserPoolClient.ClientSecret
    }
    else {
        # Create app client
        Write-Info "Creating app client: $APP_CLIENT_NAME"
        
        $clientOutput = aws cognito-idp create-user-pool-client `
            --user-pool-id $USER_POOL_ID `
            --client-name $APP_CLIENT_NAME `
            --generate-secret `
            --explicit-auth-flows ALLOW_USER_PASSWORD_AUTH ALLOW_REFRESH_TOKEN_AUTH `
            --supported-identity-providers COGNITO `
            --region $REGION `
            --output json | ConvertFrom-Json
        
        $APP_CLIENT_ID = $clientOutput.UserPoolClient.ClientId
        $APP_CLIENT_SECRET = $clientOutput.UserPoolClient.ClientSecret
        Write-Success "Created app client with ID: $APP_CLIENT_ID"
    }
}
catch {
    Write-Error "Failed to create/check app client: $($_.Exception.Message)"
    exit 1
}

Write-Host ""
Write-Info "Step 3: Setting up Secrets Manager..."

# Check if secret already exists
try {
    $secretExists = aws secretsmanager describe-secret --secret-id $SECRET_NAME --region $REGION 2>$null
    if ($secretExists) {
        Write-Warning "Secret '$SECRET_NAME' already exists"
        Write-Info "To update the secret value, run:"
        Write-Host "aws secretsmanager put-secret-value --secret-id '$SECRET_NAME' --secret-string 'YOUR_OPENAI_API_KEY' --region $REGION"
    }
    else {
        # Create secret
        Write-Info "Creating secret: $SECRET_NAME"
        
        aws secretsmanager create-secret `
            --name $SECRET_NAME `
            --description "OpenAI API key for Spool application" `
            --region $REGION | Out-Null
        
        Write-Success "Created secret: $SECRET_NAME"
        Write-Warning "You need to add your OpenAI API key value:"
        Write-Host "aws secretsmanager put-secret-value --secret-id '$SECRET_NAME' --secret-string 'YOUR_OPENAI_API_KEY' --region $REGION"
    }
}
catch {
    Write-Warning "Could not check/create secret (this is optional for authentication): $($_.Exception.Message)"
}

Write-Host ""
Write-Info "Step 4: Creating Environment Configuration..."

# Create .env.local file
$ENV_FILE = ".env.local"

$envContent = @"
# AWS Configuration
NEXT_PUBLIC_AWS_REGION=$REGION

# Cognito Configuration  
NEXT_PUBLIC_COGNITO_USER_POOL_ID=$USER_POOL_ID
NEXT_PUBLIC_COGNITO_APP_CLIENT_ID=$APP_CLIENT_ID
COGNITO_APP_CLIENT_SECRET=$APP_CLIENT_SECRET

# Secrets Manager
SECRET_NAME_OPENAI_API_KEY=$SECRET_NAME
"@

$envContent | Out-File -FilePath $ENV_FILE -Encoding utf8

Write-Success "Created $ENV_FILE with configuration"

Write-Host ""
Write-Success "🎉 AWS Resources Setup Complete!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green

Write-Host ""
Write-Host "📋 Resource Summary:"
Write-Host "   🔐 User Pool ID: $USER_POOL_ID"
Write-Host "   📱 App Client ID: $APP_CLIENT_ID"
Write-Host "   🔑 Secret Name: $SECRET_NAME"
Write-Host "   🌍 Region: $REGION"

Write-Host ""
Write-Host "🔧 Next Steps:"
Write-Host "1. Add your OpenAI API key to Secrets Manager:"
Write-Host "   aws secretsmanager put-secret-value \"
Write-Host "     --secret-id '$SECRET_NAME' \"
Write-Host "     --secret-string 'YOUR_ACTUAL_OPENAI_API_KEY' \"
Write-Host "     --region $REGION"

Write-Host ""
Write-Host "2. Your environment file has been created: $ENV_FILE"
Write-Host "   Review and adjust settings as needed."

Write-Host ""
Write-Host "3. Start your application:"
Write-Host "   npm run dev"

Write-Host ""
Write-Host "🔒 Security Notes:"
Write-Host "   - Keep your .env.local file secure and never commit it"
Write-Host "   - Rotate your Cognito client secret regularly"
Write-Host "   - Monitor AWS costs and usage"

Write-Success "Setup completed successfully! 🚀" 