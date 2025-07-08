#!/bin/bash

# Setup RDS PostgreSQL for Spool Platform
# This script uses the AI Assistant role to create RDS infrastructure

set -e

echo "🐘 Setting up RDS PostgreSQL for Spool Platform..."
echo "=================================================="

# Configuration
REGION="us-east-1"
DB_INSTANCE_ID="spool-postgres-prod"
DB_NAME="spool"
MASTER_USERNAME="spooladmin"
AI_ASSISTANT_ROLE="arn:aws:iam::560281064968:role/SpoolAIAssistantRole"
EXTERNAL_ID="spool-ai-assistant-external-id"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

# Function to assume AI Assistant role
assume_role() {
    log_info "Assuming AI Assistant role..."
    
    CREDS=$(aws sts assume-role \
        --role-arn "$AI_ASSISTANT_ROLE" \
        --role-session-name "RDSSetupSession" \
        --external-id "$EXTERNAL_ID" \
        --query 'Credentials.[AccessKeyId,SecretAccessKey,SessionToken]' \
        --output text)
    
    export AWS_ACCESS_KEY_ID=$(echo $CREDS | cut -d' ' -f1)
    export AWS_SECRET_ACCESS_KEY=$(echo $CREDS | cut -d' ' -f2)
    export AWS_SESSION_TOKEN=$(echo $CREDS | cut -d' ' -f3)
    
    log_success "Successfully assumed AI Assistant role"
}

# Function to create VPC and subnets if needed
setup_vpc() {
    log_info "Checking VPC setup..."
    
    # Check if VPC exists
    VPC_ID=$(aws ec2 describe-vpcs \
        --filters "Name=tag:Name,Values=spool-vpc" \
        --query 'Vpcs[0].VpcId' \
        --output text \
        --region $REGION 2>/dev/null || echo "None")
    
    if [ "$VPC_ID" = "None" ]; then
        log_info "Creating VPC..."
        VPC_ID=$(aws ec2 create-vpc \
            --cidr-block 10.0.0.0/16 \
            --tag-specifications "ResourceType=vpc,Tags=[{Key=Name,Value=spool-vpc}]" \
            --query 'Vpc.VpcId' \
            --output text \
            --region $REGION)
        log_success "Created VPC: $VPC_ID"
        
        # Enable DNS hostnames
        aws ec2 modify-vpc-attribute \
            --vpc-id $VPC_ID \
            --enable-dns-hostnames \
            --region $REGION
    else
        log_info "Using existing VPC: $VPC_ID"
    fi
    
    # Create DB subnet group
    log_info "Creating DB subnet group..."
    
    # Create subnets in different AZs
    SUBNET1_ID=$(aws ec2 create-subnet \
        --vpc-id $VPC_ID \
        --cidr-block 10.0.20.0/24 \
        --availability-zone ${REGION}a \
        --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=spool-db-subnet-1}]" \
        --query 'Subnet.SubnetId' \
        --output text \
        --region $REGION 2>/dev/null || \
        aws ec2 describe-subnets \
        --filters "Name=tag:Name,Values=spool-db-subnet-1" \
        --query 'Subnets[0].SubnetId' \
        --output text \
        --region $REGION)
    
    SUBNET2_ID=$(aws ec2 create-subnet \
        --vpc-id $VPC_ID \
        --cidr-block 10.0.21.0/24 \
        --availability-zone ${REGION}b \
        --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=spool-db-subnet-2}]" \
        --query 'Subnet.SubnetId' \
        --output text \
        --region $REGION 2>/dev/null || \
        aws ec2 describe-subnets \
        --filters "Name=tag:Name,Values=spool-db-subnet-2" \
        --query 'Subnets[0].SubnetId' \
        --output text \
        --region $REGION)
    
    # Create DB subnet group
    aws rds create-db-subnet-group \
        --db-subnet-group-name spool-db-subnet-group \
        --db-subnet-group-description "Subnet group for Spool RDS instances" \
        --subnet-ids $SUBNET1_ID $SUBNET2_ID \
        --tags "Key=Application,Value=Spool" \
        --region $REGION 2>/dev/null || \
        log_info "DB subnet group already exists"
    
    echo $VPC_ID
}

# Function to create security group for RDS
create_security_group() {
    local vpc_id=$1
    log_info "Creating security group for RDS..."
    
    SG_ID=$(aws ec2 create-security-group \
        --group-name spool-rds-sg \
        --description "Security group for Spool RDS PostgreSQL" \
        --vpc-id $vpc_id \
        --query 'GroupId' \
        --output text \
        --region $REGION 2>/dev/null || \
        aws ec2 describe-security-groups \
        --filters "Name=group-name,Values=spool-rds-sg" \
        --query 'SecurityGroups[0].GroupId' \
        --output text \
        --region $REGION)
    
    # Allow PostgreSQL access from ECS services
    aws ec2 authorize-security-group-ingress \
        --group-id $SG_ID \
        --protocol tcp \
        --port 5432 \
        --source-group $SG_ID \
        --region $REGION 2>/dev/null || \
        log_info "Security group rule already exists"
    
    echo $SG_ID
}

# Function to generate and store password in Secrets Manager
store_db_password() {
    log_info "Generating and storing database password..."
    
    # Generate secure password
    DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    
    # Store in Secrets Manager
    aws secretsmanager create-secret \
        --name "spool/rds/master-password" \
        --description "Master password for Spool RDS PostgreSQL" \
        --secret-string "$DB_PASSWORD" \
        --region $REGION 2>/dev/null || \
        aws secretsmanager put-secret-value \
        --secret-id "spool/rds/master-password" \
        --secret-string "$DB_PASSWORD" \
        --region $REGION
    
    log_success "Database password stored in Secrets Manager"
    echo $DB_PASSWORD
}

# Function to create RDS instance
create_rds_instance() {
    local sg_id=$1
    local db_password=$2
    
    log_info "Creating RDS PostgreSQL instance..."
    
    aws rds create-db-instance \
        --db-instance-identifier $DB_INSTANCE_ID \
        --db-instance-class db.t3.medium \
        --engine postgres \
        --engine-version 15.4 \
        --allocated-storage 100 \
        --storage-type gp3 \
        --storage-encrypted \
        --master-username $MASTER_USERNAME \
        --master-user-password "$db_password" \
        --db-name $DB_NAME \
        --vpc-security-group-ids $sg_id \
        --db-subnet-group-name spool-db-subnet-group \
        --backup-retention-period 7 \
        --preferred-backup-window "03:00-04:00" \
        --preferred-maintenance-window "Mon:04:00-Mon:05:00" \
        --multi-az \
        --no-publicly-accessible \
        --enable-performance-insights \
        --performance-insights-retention-period 7 \
        --tags "Key=Application,Value=Spool" "Key=Environment,Value=Production" \
        --region $REGION
    
    log_success "RDS instance creation initiated"
}

# Function to wait for RDS instance to be available
wait_for_rds() {
    log_info "Waiting for RDS instance to become available (this may take 10-15 minutes)..."
    
    aws rds wait db-instance-available \
        --db-instance-identifier $DB_INSTANCE_ID \
        --region $REGION
    
    log_success "RDS instance is now available!"
}

# Function to get RDS endpoint
get_rds_endpoint() {
    ENDPOINT=$(aws rds describe-db-instances \
        --db-instance-identifier $DB_INSTANCE_ID \
        --query 'DBInstances[0].Endpoint.Address' \
        --output text \
        --region $REGION)
    
    echo $ENDPOINT
}

# Main execution
main() {
    log_info "Starting RDS PostgreSQL setup..."
    
    # Assume AI Assistant role
    assume_role
    
    # Setup VPC and subnets
    VPC_ID=$(setup_vpc)
    
    # Create security group
    SG_ID=$(create_security_group $VPC_ID)
    log_success "Security group created: $SG_ID"
    
    # Check if RDS instance already exists
    EXISTING=$(aws rds describe-db-instances \
        --db-instance-identifier $DB_INSTANCE_ID \
        --query 'DBInstances[0].DBInstanceIdentifier' \
        --output text \
        --region $REGION 2>/dev/null || echo "None")
    
    if [ "$EXISTING" != "None" ]; then
        log_warning "RDS instance $DB_INSTANCE_ID already exists"
        ENDPOINT=$(get_rds_endpoint)
    else
        # Generate and store password
        DB_PASSWORD=$(store_db_password)
        
        # Create RDS instance
        create_rds_instance $SG_ID $DB_PASSWORD
        
        # Wait for instance to be available
        wait_for_rds
        
        # Get endpoint
        ENDPOINT=$(get_rds_endpoint)
    fi
    
    # Store connection info in Secrets Manager
    log_info "Storing connection information..."
    
    CONNECTION_STRING="postgresql://${MASTER_USERNAME}:${DB_PASSWORD}@${ENDPOINT}:5432/${DB_NAME}"
    
    aws secretsmanager create-secret \
        --name "spool/rds/connection-string" \
        --description "PostgreSQL connection string for Spool" \
        --secret-string "$CONNECTION_STRING" \
        --region $REGION 2>/dev/null || \
        aws secretsmanager put-secret-value \
        --secret-id "spool/rds/connection-string" \
        --secret-string "$CONNECTION_STRING" \
        --region $REGION
    
    # Output summary
    echo ""
    log_success "🎉 RDS PostgreSQL Setup Complete!"
    echo ""
    echo "📋 Summary:"
    echo "  Instance ID: $DB_INSTANCE_ID"
    echo "  Endpoint: $ENDPOINT"
    echo "  Database: $DB_NAME"
    echo "  Username: $MASTER_USERNAME"
    echo "  VPC: $VPC_ID"
    echo "  Security Group: $SG_ID"
    echo ""
    echo "🔑 Secrets:"
    echo "  Password: spool/rds/master-password"
    echo "  Connection String: spool/rds/connection-string"
    echo ""
    echo "🔗 Next Steps:"
    echo "  1. Update service configurations with RDS endpoint"
    echo "  2. Run database migrations"
    echo "  3. Configure connection pooling"
    echo "  4. Set up monitoring and alerts"
}

# Run main function
main 