#!/bin/bash

# Script to import existing AWS resources into Terraform state
echo "🔄 Importing existing AWS resources into Terraform state..."

# Set variables
ENV="staging"
VAR_FILE="environments/staging.tfvars"

# CloudFront policies (need to get existing IDs)
echo "📋 Getting CloudFront policy IDs..."
API_ORIGIN_POLICY_ID=$(aws cloudfront list-origin-request-policies --query 'OriginRequestPolicyList.Items[?OriginRequestPolicyConfig.Name==`prodready-infra-api-origin-request-policy`].Id' --output text)
STATIC_CACHE_POLICY_ID=$(aws cloudfront list-cache-policies --query 'CachePolicyList.Items[?CachePolicyConfig.Name==`prodready-infra-static-cache-policy`].Id' --output text)
DYNAMIC_CACHE_POLICY_ID=$(aws cloudfront list-cache-policies --query 'CachePolicyList.Items[?CachePolicyConfig.Name==`prodready-infra-dynamic-cache-policy`].Id' --output text)

# Import resources one by one
echo "🏗️ Importing resources..."

# DynamoDB
echo "Importing DynamoDB table..."
terraform import -var-file="$VAR_FILE" 'module.dynamodb.aws_dynamodb_table.tables["prodready-infra-items"]' "prodready-infra-prodready-infra-items-staging" || true

# CloudWatch Log Groups
echo "Importing CloudWatch log groups..."
terraform import -var-file="$VAR_FILE" 'module.ecs.aws_cloudwatch_log_group.backend[0]' "/ecs/prodready-infra-backend-staging" || true
terraform import -var-file="$VAR_FILE" 'module.ecs.aws_cloudwatch_log_group.frontend[0]' "/ecs/prodready-infra-frontend-staging" || true
terraform import -var-file="$VAR_FILE" 'module.lambda.aws_cloudwatch_log_group.lambda_logs["prodready-infra-api-handler"]' "/aws/lambda/prodready-infra-prodready-infra-api-handler-staging" || true

# IAM Roles
echo "Importing IAM roles..."
terraform import -var-file="$VAR_FILE" 'module.ecs.aws_iam_role.task_execution_role' "prodready-infra-task-execution-role-staging" || true
terraform import -var-file="$VAR_FILE" 'module.ecs.aws_iam_role.task_role' "prodready-infra-task-role-staging" || true
terraform import -var-file="$VAR_FILE" 'module.lambda.aws_iam_role.lambda_role' "prodready-infra-lambda-role-staging" || true
terraform import -var-file="$VAR_FILE" 'module.rds.aws_iam_role.rds_monitoring_role' "prodready-infra-rds-monitoring-role-staging" || true

# IAM Policies
echo "Importing IAM policies..."
DYNAMODB_POLICY_ARN=$(aws iam list-policies --query 'Policies[?PolicyName==`prodready-infra-dynamodb-policy-staging`].Arn' --output text)
if [ ! -z "$DYNAMODB_POLICY_ARN" ]; then
    terraform import -var-file="$VAR_FILE" 'module.ecs.aws_iam_policy.dynamodb_policy' "$DYNAMODB_POLICY_ARN" || true
fi

# Load Balancer and Target Groups
echo "Importing load balancer and target groups..."
ALB_ARN=$(aws elbv2 describe-load-balancers --names "prodready-infra-alb-staging" --query 'LoadBalancers[0].LoadBalancerArn' --output text)
if [ ! -z "$ALB_ARN" ]; then
    terraform import -var-file="$VAR_FILE" 'module.ecs.aws_lb.main' "$ALB_ARN" || true
fi

BACKEND_TG_ARN=$(aws elbv2 describe-target-groups --names "pinfra-be-tg-staging" --query 'TargetGroups[0].TargetGroupArn' --output text)
if [ ! -z "$BACKEND_TG_ARN" ]; then
    terraform import -var-file="$VAR_FILE" 'module.ecs.aws_lb_target_group.backend' "$BACKEND_TG_ARN" || true
fi

FRONTEND_TG_ARN=$(aws elbv2 describe-target-groups --names "pinfra-fe-tg-staging" --query 'TargetGroups[0].TargetGroupArn' --output text)
if [ ! -z "$FRONTEND_TG_ARN" ]; then
    terraform import -var-file="$VAR_FILE" 'module.ecs.aws_lb_target_group.frontend' "$FRONTEND_TG_ARN" || true
fi

# Secrets Manager
echo "Importing secrets..."
terraform import -var-file="$VAR_FILE" 'module.rds.aws_secretsmanager_secret.db_password' "prodready-infra-db-password-staging" || true

# S3 Bucket
echo "Importing S3 bucket..."
terraform import -var-file="$VAR_FILE" 'module.s3_hosting.aws_s3_bucket.main' "prodready-infra-assets-staging" || true

# DB Subnet Group
echo "Importing DB subnet group..."
terraform import -var-file="$VAR_FILE" 'module.vpc.aws_db_subnet_group.database' "prodready-infra-vpc-db-subnet-group-v2" || true

# Cognito User Pool Domain
echo "Importing Cognito domain..."
terraform import -var-file="$VAR_FILE" 'module.cognito.aws_cognito_user_pool_domain.main' "prodready-infra-staging" || true

# CloudFront policies (if IDs were found)
if [ ! -z "$API_ORIGIN_POLICY_ID" ]; then
    echo "Importing CloudFront API origin request policy..."
    terraform import -var-file="$VAR_FILE" 'module.cloudfront.aws_cloudfront_origin_request_policy.api' "$API_ORIGIN_POLICY_ID" || true
fi

if [ ! -z "$STATIC_CACHE_POLICY_ID" ]; then
    echo "Importing CloudFront static cache policy..."
    terraform import -var-file="$VAR_FILE" 'module.cloudfront.aws_cloudfront_cache_policy.static' "$STATIC_CACHE_POLICY_ID" || true
fi

if [ ! -z "$DYNAMIC_CACHE_POLICY_ID" ]; then
    echo "Importing CloudFront dynamic cache policy..."
    terraform import -var-file="$VAR_FILE" 'module.cloudfront.aws_cloudfront_cache_policy.dynamic' "$DYNAMIC_CACHE_POLICY_ID" || true
fi

echo "✅ Import process completed!"
echo "📝 Running terraform plan to verify state synchronization..."

terraform plan -var-file="$VAR_FILE"