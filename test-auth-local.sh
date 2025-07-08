#!/bin/bash

echo "Testing Local Authentication Setup"
echo "=================================="

# Check if auth service is running
echo -n "Checking auth service health... "
AUTH_HEALTH=$(curl -s http://localhost:3001/health)
if [[ $AUTH_HEALTH == *"ok"* ]]; then
    echo "✓ Auth service is running"
else
    echo "✗ Auth service is not running"
    echo "Please start it with: cd ../spool-auth-service && npm run dev"
    exit 1
fi

# Check if frontend is running
echo -n "Checking frontend... "
FRONTEND_CHECK=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
if [[ $FRONTEND_CHECK == "200" ]]; then
    echo "✓ Frontend is running"
else
    echo "✗ Frontend is not running"
    echo "Please start it with: npm run dev"
    exit 1
fi

echo ""
echo "Both services are running! You can now:"
echo "1. Open http://localhost:3000 in your browser"
echo "2. Click 'Sign In'"
echo "3. Use your Cognito credentials to authenticate"
echo ""
echo "The auth flow:"
echo "Frontend (3000) → Next.js API → Auth Service (3001) → AWS Cognito" 