#!/bin/bash
# Health check script for iTrack infrastructure

# Set default AWS region
AWS_REGION=${AWS_REGION:-us-east-1}
PROJECT_NAME=${PROJECT_NAME:-itrack}
ENVIRONMENT=${ENVIRONMENT:-production}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=========================================${NC}"
echo -e "${YELLOW}iTrack Infrastructure Health Check${NC}"
echo -e "${YELLOW}=========================================${NC}"
echo "Region: $AWS_REGION"
echo "Environment: $ENVIRONMENT"
echo -e "${YELLOW}=========================================${NC}"

# Check ECS cluster and services
echo -e "\n${YELLOW}Checking ECS Cluster:${NC}"
CLUSTER_NAME="${PROJECT_NAME}-cluster-${ENVIRONMENT}"
CLUSTER_STATUS=$(aws ecs describe-clusters --clusters $CLUSTER_NAME --region $AWS_REGION --query 'clusters[0].status' --output text 2>/dev/null)

if [ "$CLUSTER_STATUS" == "ACTIVE" ]; then
    echo -e "${GREEN}✓ ECS Cluster is active${NC}"
    
    # Get ECS services
    SERVICES=$(aws ecs list-services --cluster $CLUSTER_NAME --region $AWS_REGION --query 'serviceArns[*]' --output text 2>/dev/null)
    
    if [ -n "$SERVICES" ]; then
        echo -e "\n${YELLOW}Checking ECS Services:${NC}"
        aws ecs describe-services --cluster $CLUSTER_NAME --services $SERVICES --region $AWS_REGION --query 'services[*].[serviceName,runningCount,desiredCount]' --output table
    else
        echo -e "${RED}✗ No ECS services found${NC}"
    fi
else
    echo -e "${RED}✗ ECS Cluster not found or not active${NC}"
fi

# Check RDS instance
echo -e "\n${YELLOW}Checking RDS Instance:${NC}"
DB_INSTANCE="${PROJECT_NAME}-db-${ENVIRONMENT}"
DB_STATUS=$(aws rds describe-db-instances --db-instance-identifier $DB_INSTANCE --region $AWS_REGION --query 'DBInstances[0].DBInstanceStatus' --output text 2>/dev/null)

if [ -n "$DB_STATUS" ]; then
    if [ "$DB_STATUS" == "available" ]; then
        echo -e "${GREEN}✓ RDS Instance is available${NC}"
        aws rds describe-db-instances --db-instance-identifier $DB_INSTANCE --region $AWS_REGION --query 'DBInstances[0].[DBInstanceClass,Engine,EngineVersion,MultiAZ]' --output table
    else
        echo -e "${YELLOW}! RDS Instance status: $DB_STATUS${NC}"
    fi
else
    echo -e "${RED}✗ RDS Instance not found${NC}"
fi

# Check DynamoDB tables
echo -e "\n${YELLOW}Checking DynamoDB Tables:${NC}"
TABLES=$(aws dynamodb list-tables --region $AWS_REGION --query "TableNames[?contains(@,'${PROJECT_NAME}')]" --output text 2>/dev/null)

if [ -n "$TABLES" ]; then
    echo -e "${GREEN}✓ Found DynamoDB tables:${NC}"
    for TABLE in $TABLES; do
        STATUS=$(aws dynamodb describe-table --table-name $TABLE --region $AWS_REGION --query 'Table.TableStatus' --output text 2>/dev/null)
        echo -e "  - $TABLE: $STATUS"
    done
else
    echo -e "${RED}✗ No DynamoDB tables found${NC}"
fi

# Check API Gateway
echo -e "\n${YELLOW}Checking API Gateway:${NC}"
API_ID=$(aws apigateway get-rest-apis --region $AWS_REGION --query "items[?name=='${PROJECT_NAME}-api-${ENVIRONMENT}'].id" --output text 2>/dev/null)

if [ -n "$API_ID" ]; then
    echo -e "${GREEN}✓ API Gateway found${NC}"
    echo "API ID: $API_ID"
    
    # Get stages
    STAGES=$(aws apigateway get-stages --rest-api-id $API_ID --region $AWS_REGION --query 'item[*].stageName' --output text 2>/dev/null)
    echo "Stages: $STAGES"
    
    # Get deployment details
    for STAGE in $STAGES; do
        DEPLOYMENT=$(aws apigateway get-deployment --rest-api-id $API_ID --deployment-id $(aws apigateway get-stage --rest-api-id $API_ID --stage-name $STAGE --region $AWS_REGION --query 'deploymentId' --output text) --region $AWS_REGION --query 'createdDate' --output text 2>/dev/null)
        echo "Latest deployment for $STAGE: $DEPLOYMENT"
    done
else
    echo -e "${RED}✗ API Gateway not found${NC}"
fi

# Check CloudFront distribution
echo -e "\n${YELLOW}Checking CloudFront Distribution:${NC}"
DISTRIBUTION=$(aws cloudfront list-distributions --region $AWS_REGION --query "DistributionList.Items[?contains(Comment,'${PROJECT_NAME}') && contains(Comment,'${ENVIRONMENT}')].[Id,DomainName,Status]" --output text 2>/dev/null)

if [ -n "$DISTRIBUTION" ]; then
    echo -e "${GREEN}✓ CloudFront Distribution found:${NC}"
    aws cloudfront list-distributions --region $AWS_REGION --query "DistributionList.Items[?contains(Comment,'${PROJECT_NAME}') && contains(Comment,'${ENVIRONMENT}')].[Id,DomainName,Status,Enabled]" --output table
else
    echo -e "${RED}✗ CloudFront Distribution not found${NC}"
fi

# Check Cognito User Pool
echo -e "\n${YELLOW}Checking Cognito User Pool:${NC}"
USER_POOL=$(aws cognito-idp list-user-pools --max-results 20 --region $AWS_REGION --query "UserPools[?contains(Name,'${PROJECT_NAME}') && contains(Name,'${ENVIRONMENT}')].Id" --output text 2>/dev/null)

if [ -n "$USER_POOL" ]; then
    echo -e "${GREEN}✓ Cognito User Pool found${NC}"
    echo "User Pool ID: $USER_POOL"
    
    # Get client apps
    CLIENTS=$(aws cognito-idp list-user-pool-clients --user-pool-id $USER_POOL --region $AWS_REGION --query 'UserPoolClients[*].ClientName' --output text 2>/dev/null)
    echo "Client Apps: $CLIENTS"
else
    echo -e "${RED}✗ Cognito User Pool not found${NC}"
fi

# Check S3 buckets
echo -e "\n${YELLOW}Checking S3 Buckets:${NC}"
BUCKETS=$(aws s3api list-buckets --query "Buckets[?contains(Name,'${PROJECT_NAME}') && contains(Name,'${ENVIRONMENT}')].Name" --output text 2>/dev/null)

if [ -n "$BUCKETS" ]; then
    echo -e "${GREEN}✓ S3 buckets found:${NC}"
    for BUCKET in $BUCKETS; do
        echo "  - $BUCKET"
    done
else
    echo -e "${RED}✗ No S3 buckets found${NC}"
fi

# Check CloudWatch alarms
echo -e "\n${YELLOW}Checking CloudWatch Alarms:${NC}"
ALARMS=$(aws cloudwatch describe-alarms --region $AWS_REGION --query "MetricAlarms[?contains(AlarmName,'${PROJECT_NAME}')].{Name:AlarmName,State:StateValue}" --output table 2>/dev/null)

echo "$ALARMS"

# Summary
echo -e "\n${YELLOW}=========================================${NC}"
echo -e "${YELLOW}Health Check Complete${NC}"
echo -e "${YELLOW}=========================================${NC}"