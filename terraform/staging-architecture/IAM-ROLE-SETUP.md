# IAM Role Creation Guide: ITrack-Staging-Environment-Role

This guide provides step-by-step instructions to create the IAM role required for deploying the ITrack staging infrastructure.

## Overview

**Role Name:** `ITrack-Staging-Environment-Role`  
**Purpose:** CI/CD deployment role for GitHub Actions with comprehensive AWS permissions  
**Trust Relationship:** GitHub Actions OIDC Provider (recommended) or IAM User

---

## Option 1: Create Role via AWS Console (Recommended for Beginners)

### Step 1: Navigate to IAM Console

1. Log in to AWS Console
2. Go to **Services** → **IAM**
3. Click **Roles** in the left sidebar
4. Click **Create role** button

### Step 2: Select Trusted Entity

**For GitHub Actions (OIDC - Recommended):**
1. Select **Web identity**
2. Choose **GitHub** as the identity provider (or create one if it doesn't exist)
3. For Organization: Enter `GRIFFINGlobalTech`
4. For Repository: Enter `rs-feb-25`
5. For Branch: Enter `feature/staging-v1` or `main`
6. Click **Next**

**For IAM User:**
1. Select **AWS account**
2. Select **This account**
3. Click **Next**

### Step 3: Attach Permissions

Instead of attaching individual policies, we'll create a custom policy.

1. Click **Create policy** (opens in new tab)
2. Click **JSON** tab
3. Copy the policy from `IAM-Policy.json` (see below)
4. Click **Next: Tags**
5. Add tags (optional):
   - Key: `Environment`, Value: `staging`
   - Key: `Project`, Value: `ITrack`
   - Key: `ManagedBy`, Value: `Terraform`
6. Click **Next: Review**
7. Policy name: `ITrack-Staging-Deployment-Policy`
8. Description: `Comprehensive deployment permissions for ITrack staging environment`
9. Click **Create policy**
10. Go back to the role creation tab and refresh the policies
11. Search for `ITrack-Staging-Deployment-Policy` and select it
12. Click **Next**

### Step 4: Name and Review

1. **Role name:** `ITrack-Staging-Environment-Role`
2. **Description:** `Deployment role for ITrack staging environment with comprehensive AWS service permissions`
3. **Tags (optional):**
   - Key: `Environment`, Value: `staging`
   - Key: `Project`, Value: `ITrack`
   - Key: `Purpose`, Value: `CICD-Deployment`
4. Review the trust policy and permissions
5. Click **Create role**

### Step 5: Get Role ARN

1. Search for the role: `ITrack-Staging-Environment-Role`
2. Click on the role name
3. Copy the **ARN** (e.g., `arn:aws:iam::875486186130:role/ITrack-Staging-Environment-Role`)
4. Save this ARN - you'll need it for GitHub Actions

---

## Option 2: Create Role via AWS CLI

### Prerequisites
- AWS CLI installed and configured
- Appropriate permissions to create IAM roles

### Step 1: Create Trust Policy

Create a file `trust-policy.json`:

**For GitHub Actions OIDC:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::875486186130:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:GRIFFINGlobalTech/rs-feb-25:*"
        }
      }
    }
  ]
}
```

**For IAM User:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::875486186130:root"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

### Step 2: Create the Role

```bash
aws iam create-role \
  --role-name ITrack-Staging-Environment-Role \
  --assume-role-policy-document file://trust-policy.json \
  --description "Deployment role for ITrack staging environment" \
  --tags Key=Environment,Value=staging Key=Project,Value=ITrack
```

### Step 3: Create and Attach Policy

Create the policy file `deployment-policy.json` (see complete policy below), then:

```bash
# Create the policy
aws iam create-policy \
  --policy-name ITrack-Staging-Deployment-Policy \
  --policy-document file://deployment-policy.json \
  --description "Comprehensive deployment permissions for ITrack staging"

# Attach the policy to the role
aws iam attach-role-policy \
  --role-name ITrack-Staging-Environment-Role \
  --policy-arn arn:aws:iam::875486186130:policy/ITrack-Staging-Deployment-Policy
```

### Step 4: Verify Role Creation

```bash
# Get role details
aws iam get-role --role-name ITrack-Staging-Environment-Role

# List attached policies
aws iam list-attached-role-policies --role-name ITrack-Staging-Environment-Role
```

---

## Option 3: Create Role via Terraform

### Step 1: Create Terraform Configuration

Create `iam-role.tf`:

```hcl
# IAM Role for GitHub Actions Deployment
resource "aws_iam_role" "itrack_staging_deployment" {
  name        = "ITrack-Staging-Environment-Role"
  description = "Deployment role for ITrack staging environment"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:oidc-provider/token.actions.githubusercontent.com"
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
          }
          StringLike = {
            "token.actions.githubusercontent.com:sub" = "repo:GRIFFINGlobalTech/rs-feb-25:*"
          }
        }
      }
    ]
  })

  tags = {
    Environment = "staging"
    Project     = "ITrack"
    ManagedBy   = "Terraform"
  }
}

# IAM Policy for Deployment
resource "aws_iam_policy" "itrack_staging_deployment" {
  name        = "ITrack-Staging-Deployment-Policy"
  description = "Comprehensive deployment permissions for ITrack staging environment"
  policy      = file("${path.module}/deployment-policy.json")
}

# Attach Policy to Role
resource "aws_iam_role_policy_attachment" "itrack_staging_deployment" {
  role       = aws_iam_role.itrack_staging_deployment.name
  policy_arn = aws_iam_policy.itrack_staging_deployment.arn
}

# Output the Role ARN
output "deployment_role_arn" {
  description = "ARN of the deployment role for GitHub Actions"
  value       = aws_iam_role.itrack_staging_deployment.arn
}

# Data source for current AWS account
data "aws_caller_identity" "current" {}
```

### Step 2: Apply Terraform

```bash
terraform init
terraform plan
terraform apply
```

---

## Complete IAM Policy JSON

Save this as `deployment-policy.json`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ECSPermissions",
      "Effect": "Allow",
      "Action": [
        "ecs:*"
      ],
      "Resource": "*"
    },
    {
      "Sid": "ECRPermissions",
      "Effect": "Allow",
      "Action": [
        "ecr:*"
      ],
      "Resource": "*"
    },
    {
      "Sid": "EC2Permissions",
      "Effect": "Allow",
      "Action": [
        "ec2:Describe*",
        "ec2:Create*",
        "ec2:Delete*",
        "ec2:Modify*",
        "ec2:Attach*",
        "ec2:Detach*",
        "ec2:Authorize*",
        "ec2:Revoke*",
        "ec2:Associate*",
        "ec2:Disassociate*",
        "ec2:Allocate*",
        "ec2:Release*",
        "ec2:RunInstances",
        "ec2:TerminateInstances"
      ],
      "Resource": "*"
    },
    {
      "Sid": "LoadBalancingPermissions",
      "Effect": "Allow",
      "Action": [
        "elasticloadbalancing:*"
      ],
      "Resource": "*"
    },
    {
      "Sid": "RDSPermissions",
      "Effect": "Allow",
      "Action": [
        "rds:*"
      ],
      "Resource": "*"
    },
    {
      "Sid": "S3Permissions",
      "Effect": "Allow",
      "Action": [
        "s3:*"
      ],
      "Resource": "*"
    },
    {
      "Sid": "CloudFrontPermissions",
      "Effect": "Allow",
      "Action": [
        "cloudfront:*"
      ],
      "Resource": "*"
    },
    {
      "Sid": "Route53Permissions",
      "Effect": "Allow",
      "Action": [
        "route53:*"
      ],
      "Resource": "*"
    },
    {
      "Sid": "CloudWatchPermissions",
      "Effect": "Allow",
      "Action": [
        "cloudwatch:*",
        "logs:*"
      ],
      "Resource": "*"
    },
    {
      "Sid": "SNSPermissions",
      "Effect": "Allow",
      "Action": [
        "sns:*"
      ],
      "Resource": "*"
    },
    {
      "Sid": "SecretsManagerPermissions",
      "Effect": "Allow",
      "Action": [
        "secretsmanager:*"
      ],
      "Resource": "*"
    },
    {
      "Sid": "LambdaPermissions",
      "Effect": "Allow",
      "Action": [
        "lambda:*"
      ],
      "Resource": "*"
    },
    {
      "Sid": "DynamoDBPermissions",
      "Effect": "Allow",
      "Action": [
        "dynamodb:*"
      ],
      "Resource": "*"
    },
    {
      "Sid": "APIGatewayPermissions",
      "Effect": "Allow",
      "Action": [
        "apigateway:*"
      ],
      "Resource": "*"
    },
    {
      "Sid": "WAFPermissions",
      "Effect": "Allow",
      "Action": [
        "wafv2:*"
      ],
      "Resource": "*"
    },
    {
      "Sid": "BackupPermissions",
      "Effect": "Allow",
      "Action": [
        "backup:*"
      ],
      "Resource": "*"
    },
    {
      "Sid": "IAMPermissions",
      "Effect": "Allow",
      "Action": [
        "iam:CreateRole",
        "iam:DeleteRole",
        "iam:GetRole",
        "iam:UpdateRole",
        "iam:PassRole",
        "iam:AttachRolePolicy",
        "iam:DetachRolePolicy",
        "iam:PutRolePolicy",
        "iam:DeleteRolePolicy",
        "iam:GetRolePolicy",
        "iam:ListRolePolicies",
        "iam:ListAttachedRolePolicies",
        "iam:CreateInstanceProfile",
        "iam:DeleteInstanceProfile",
        "iam:GetInstanceProfile",
        "iam:AddRoleToInstanceProfile",
        "iam:RemoveRoleFromInstanceProfile",
        "iam:TagRole",
        "iam:UntagRole",
        "iam:CreateServiceLinkedRole"
      ],
      "Resource": "*"
    },
    {
      "Sid": "KMSPermissions",
      "Effect": "Allow",
      "Action": [
        "kms:*"
      ],
      "Resource": "*"
    },
    {
      "Sid": "ApplicationAutoScalingPermissions",
      "Effect": "Allow",
      "Action": [
        "application-autoscaling:*"
      ],
      "Resource": "*"
    }
  ]
}
```

---

## Setting Up GitHub OIDC Provider (If Not Already Set Up)

If you chose GitHub Actions OIDC authentication, you need to create the OIDC provider first:

### Via AWS Console:

1. Go to **IAM** → **Identity providers**
2. Click **Add provider**
3. Select **OpenID Connect**
4. Provider URL: `https://token.actions.githubusercontent.com`
5. Audience: `sts.amazonaws.com`
6. Click **Get thumbprint**
7. Click **Add provider**

### Via AWS CLI:

```bash
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1
```

---

## Configure GitHub Actions to Use the Role

Update your GitHub Actions workflow (`.github/workflows/staging.yml`):

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      id-token: write  # Required for OIDC
      contents: read
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::875486186130:role/ITrack-Staging-Environment-Role
          aws-region: us-east-1
          role-session-name: GitHubActions-Deployment
```

---

## Verification Steps

### 1. Test Role Assumption

```bash
# Using AWS CLI
aws sts assume-role \
  --role-arn arn:aws:iam::875486186130:role/ITrack-Staging-Environment-Role \
  --role-session-name test-session
```

### 2. Verify Permissions

Test a few key permissions:

```bash
# List ECS clusters
aws ecs list-clusters

# List ECR repositories
aws ecr describe-repositories

# List S3 buckets
aws s3 ls
```

### 3. Test in GitHub Actions

Create a test workflow or run the existing deployment workflow and check the logs.

---

## Security Best Practices

1. **Least Privilege:** Review and restrict permissions to only what's needed
2. **Resource Restrictions:** Add resource-level restrictions where possible:
   ```json
   {
     "Resource": "arn:aws:ecs:us-east-1:875486186130:cluster/itrack-*"
   }
   ```
3. **Condition Keys:** Add conditions to limit actions:
   ```json
   {
     "Condition": {
       "StringEquals": {
         "aws:RequestedRegion": "us-east-1"
       }
     }
   }
   ```
4. **Regular Audits:** Review CloudTrail logs for role usage
5. **Rotate Credentials:** If using access keys, rotate them regularly
6. **Enable MFA:** For sensitive operations (optional)

---

## Troubleshooting

### Issue: "User is not authorized to assume role"

**Solution:** Check the trust policy allows your identity:
```bash
aws iam get-role --role-name ITrack-Staging-Environment-Role --query 'Role.AssumeRolePolicyDocument'
```

### Issue: "Access Denied" for specific action

**Solution:** Verify the policy includes the required permission:
```bash
aws iam get-role-policy \
  --role-name ITrack-Staging-Environment-Role \
  --policy-name ITrack-Staging-Deployment-Policy
```

### Issue: OIDC provider not found

**Solution:** Create the GitHub OIDC provider (see section above)

---

## Cleanup (If Needed)

To delete the role:

```bash
# Detach policies
aws iam detach-role-policy \
  --role-name ITrack-Staging-Environment-Role \
  --policy-arn arn:aws:iam::875486186130:policy/ITrack-Staging-Deployment-Policy

# Delete the role
aws iam delete-role --role-name ITrack-Staging-Environment-Role

# Delete the policy
aws iam delete-policy \
  --policy-arn arn:aws:iam::875486186130:policy/ITrack-Staging-Deployment-Policy
```

---

## Additional Resources

- [AWS IAM Best Practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)
- [GitHub Actions OIDC with AWS](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services)
- [AWS IAM Policy Reference](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies.html)

---

## Support

For issues or questions, contact the DevOps team or refer to the main architecture documentation.
