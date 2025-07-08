#!/bin/bash

# Spool Cognito Integration Test Setup Script
# This script helps you set up and run the Cognito integration tests

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if a service is running
check_service() {
    local service=$1
    local port=$2
    local url=$3
    
    print_status "Checking if $service is running on port $port..."
    
    if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "200\|404"; then
        print_success "$service is running on port $port"
        return 0
    else
        print_error "$service is not running on port $port"
        return 1
    fi
}

# Function to start a service
start_service() {
    local service=$1
    local directory=$2
    local command=$3
    
    print_status "Starting $service..."
    
    if [ -d "$directory" ]; then
        cd "$directory"
        if [ -f "package.json" ]; then
            print_status "Installing dependencies for $service..."
            npm install
            print_status "Starting $service with: $command"
            eval "$command" &
            local pid=$!
            print_success "$service started with PID $pid"
            cd - > /dev/null
        else
            print_error "No package.json found in $directory"
            return 1
        fi
    else
        print_error "Directory $directory not found"
        return 1
    fi
}

# Function to verify AWS credentials
verify_aws_credentials() {
    print_status "Verifying AWS credentials..."
    
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI not found. Please install AWS CLI first."
        return 1
    fi
    
    if ! aws sts get-caller-identity --profile spool &> /dev/null; then
        print_error "AWS credentials not configured for 'spool' profile"
        print_warning "Please run: aws configure --profile spool"
        return 1
    fi
    
    print_success "AWS credentials verified"
    return 0
}

# Function to verify Cognito setup
verify_cognito_setup() {
    print_status "Verifying Cognito setup..."
    
    # Check User Pool
    if aws cognito-idp describe-user-pool --user-pool-id us-east-1_TBQtRz0K6 --profile spool &> /dev/null; then
        print_success "Cognito User Pool verified"
    else
        print_error "Cognito User Pool not found or not accessible"
        return 1
    fi
    
    # Check App Client
    if aws cognito-idp describe-user-pool-client --user-pool-id us-east-1_TBQtRz0K6 --client-id 2qlls9iq8b2des063h1prtoh66 --profile spool &> /dev/null; then
        print_success "Cognito App Client verified"
    else
        print_error "Cognito App Client not found or not accessible"
        return 1
    fi
    
    return 0
}

# Main function
main() {
    echo "=============================================="
    echo "🚀 Spool Cognito Integration Test Setup"
    echo "=============================================="
    
    # Step 1: Verify AWS credentials
    if ! verify_aws_credentials; then
        print_error "AWS credentials verification failed"
        exit 1
    fi
    
    # Step 2: Verify Cognito setup
    if ! verify_cognito_setup; then
        print_error "Cognito setup verification failed"
        exit 1
    fi
    
    # Step 3: Check if services are running
    local frontend_running=false
    local backend_running=false
    
    if check_service "Frontend" "3000" "http://localhost:3000"; then
        frontend_running=true
    fi
    
    if check_service "Auth Service" "3001" "http://localhost:3001/health"; then
        backend_running=true
    fi
    
    # Step 4: Start services if needed
    if [ "$frontend_running" = false ]; then
        print_warning "Frontend not running. You may need to start it manually:"
        print_warning "  npm run dev  # in the Spool directory"
        print_warning ""
    fi
    
    if [ "$backend_running" = false ]; then
        print_warning "Auth Service not running. You may need to start it manually:"
        print_warning "  cd ../spool-auth-service && npm run dev"
        print_warning ""
    fi
    
    # Step 5: Run the tests
    print_status "Running Cognito integration tests..."
    echo ""
    
    if [ -f "test-cognito-integration.js" ]; then
        node test-cognito-integration.js
    else
        print_error "Test script not found: test-cognito-integration.js"
        exit 1
    fi
}

# Usage function
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help          Show this help message"
    echo "  -v, --verify-only   Only verify setup, don't run tests"
    echo "  -t, --test-only     Only run tests, skip setup verification"
    echo ""
    echo "Examples:"
    echo "  $0                  # Run full setup and tests"
    echo "  $0 --verify-only    # Only verify AWS and Cognito setup"
    echo "  $0 --test-only      # Only run the integration tests"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            usage
            exit 0
            ;;
        -v|--verify-only)
            verify_aws_credentials
            verify_cognito_setup
            print_success "Setup verification complete"
            exit 0
            ;;
        -t|--test-only)
            if [ -f "test-cognito-integration.js" ]; then
                node test-cognito-integration.js
            else
                print_error "Test script not found: test-cognito-integration.js"
                exit 1
            fi
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            usage
            exit 1
            ;;
    esac
    shift
done

# Run main function
main 