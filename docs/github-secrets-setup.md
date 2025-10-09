# GitHub Secrets Setup for CI/CD Pipeline

This document explains how to set up the required GitHub secrets for our CI/CD pipeline.

## Required Secrets

The following secrets are used in our GitHub Actions workflow:

1. `AWS_ACCESS_KEY_ID` - The AWS access key ID for authentication
2. `AWS_SECRET_ACCESS_KEY` - The AWS secret access key for authentication
3. `DB_PASSWORD` - The database password used for Terraform deployments
4. `AWS_ACCOUNT_ID` - Your AWS account ID (e.g., 123456789012)

## Setting Up Secrets

1. Go to your GitHub repository
2. Click on "Settings" tab
3. In the left sidebar, click on "Secrets and variables" > "Actions"
4. Click on "New repository secret"
5. Add each secret with its corresponding value:

   - Name: `AWS_ACCESS_KEY_ID`
     Value: Your AWS access key ID

   - Name: `AWS_SECRET_ACCESS_KEY`
     Value: Your AWS secret access key

   - Name: `DB_PASSWORD`
     Value: Your database password

   - Name: `AWS_ACCOUNT_ID`
     Value: Your AWS account ID

## IAM Permissions Required

The AWS user associated with the above credentials should have the following permissions:

- ECR: Push/pull images
- ECS: Describe services, update services
- ELB: Describe load balancers
- S3: Access to the Terraform state bucket
- Other permissions required for Terraform deployment

## Setting up an AWS IAM User (if you haven't already)

1. Go to AWS IAM Console
2. Create a new user with programmatic access
3. Attach the following policies:
   - AmazonECR-FullAccess
   - AmazonECS-FullAccess
   - AmazonS3ReadOnlyAccess (or custom policy for your Terraform state bucket)
   - Any other policies needed by your Terraform configuration

## GitHub CI/CD Workflow Configuration

After setting up these secrets, the CI/CD workflow will be able to:
- Authenticate with AWS
- Push Docker images to ECR
- Deploy updates to ECS
- Run Terraform with the necessary variables

## Troubleshooting

If you encounter the error "Context access might be invalid" in your GitHub workflow file, it's likely because the secrets aren't set up yet. This is just a linting warning and will resolve once the secrets are properly configured in the GitHub repository.