# CI/CD Pipeline Documentation

This document explains our CI/CD pipeline implemented with GitHub Actions.

## Pipeline Overview

Our CI/CD pipeline automates the following processes:

1. **On Pull Requests**:
   - Terraform plan (validation only, no apply)
   - Code linting and testing

2. **On Merge to Main Branch**:
   - Build Docker images (API and UI)
   - Push to ECR repositories
   - Apply Terraform changes
   - Deploy to ECS services
   - Run health checks
   - Send notifications

## Workflow Files

- `.github/workflows/ci-cd.yml`: Main CI/CD pipeline

## Pipeline Jobs

### Terraform Plan (PR Only)

This job runs when a pull request is created against the main branch:

- Checks Terraform formatting
- Initializes Terraform with S3 backend
- Validates Terraform configuration
- Creates a plan (but doesn't apply)

### Build and Push (Main Branch Only)

This job runs when code is merged to the main branch:

- Authenticates with AWS ECR
- Builds Docker images for backend and frontend
- Tags images with commit SHA and 'latest'
- Pushes images to ECR repositories

### Terraform Apply (Main Branch Only)

This job runs after successful image build and push:

- Initializes Terraform with S3 backend
- Creates a plan for applying
- Applies only changes detected in the plan
- Handles database password securely

### Deploy to Staging (Main Branch Only)

This job runs after Terraform apply:

- Updates ECS services to force new deployments
- Waits for services to stabilize
- Runs health checks against the backend API

### Notification (Always)

This job runs after deployment:

- Sends notifications on success or failure
- Can be integrated with Teams or Slack

## Environment Variables and Secrets

### Environment Variables (Set in Workflow)

- `AWS_REGION`: The AWS region (us-east-1)
- `BACKEND_REPOSITORY`: ECR repository name for the API
- `FRONTEND_REPOSITORY`: ECR repository name for the UI
- `ECS_CLUSTER`: ECS cluster name
- `ECS_BACKEND_SERVICE`: ECS service name for backend
- `ECS_FRONTEND_SERVICE`: ECS service name for frontend

### Required Secrets (Set in GitHub Repository)

- `AWS_ACCESS_KEY_ID`: AWS access key with permissions for ECR, ECS, etc.
- `AWS_SECRET_ACCESS_KEY`: Corresponding secret key
- `DB_PASSWORD`: Database password for Terraform
- `AWS_ACCOUNT_ID`: AWS account ID

## Health Checks

The pipeline performs health checks against the `/api/health` endpoint to verify the deployment was successful. The health check:

1. Gets the ALB DNS name
2. Attempts to call the health endpoint up to 10 times
3. Waits 30 seconds between attempts
4. Passes if a successful response is received
5. Fails the deployment if health check fails after all attempts

## Troubleshooting

Common issues and solutions:

1. **ECR Authentication Failures**:
   - Check AWS credentials in GitHub secrets
   - Verify IAM permissions include ECR access

2. **Terraform Failures**:
   - Check S3 backend configuration
   - Verify DB_PASSWORD is set correctly
   - Check IAM permissions for Terraform resources

3. **ECS Deployment Failures**:
   - Check task definition compatibility with ECS
   - Verify container health checks
   - Check container logs for application errors

4. **Health Check Failures**:
   - Verify API health endpoint is configured correctly
   - Check security groups allow traffic to the health endpoint
   - Review application logs for startup issues

For more details on setting up the required GitHub secrets, see [GitHub Secrets Setup](../docs/github-secrets-setup.md).