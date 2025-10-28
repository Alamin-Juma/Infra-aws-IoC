# ITrack AWS Staging Architecture

## Overview

This document describes the AWS infrastructure architecture for the ITrack staging environment. The architecture is designed to be scalable, secure, and cost-effective while supporting both frontend (ReactJS) and backend (Node.js) applications.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              AWS Cloud (us-east-1)                          │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                    Virtual Private Cloud (VPC)                        │ │
│  │                         CIDR: 10.0.0.0/16                            │ │
│  │                                                                       │ │
│  │  ┌─────────────────────┐        ┌─────────────────────┐             │ │
│  │  │  Public Subnet 1    │        │  Public Subnet 2    │             │ │
│  │  │  10.0.1.0/24        │        │  10.0.2.0/24        │             │ │
│  │  │  AZ: us-east-1a     │        │  AZ: us-east-1b     │             │ │
│  │  │                     │        │                     │             │ │
│  │  │  ┌──────────────┐   │        │  ┌──────────────┐   │             │ │
│  │  │  │   NAT GW     │   │        │  │   NAT GW     │   │             │ │
│  │  │  └──────────────┘   │        │  └──────────────┘   │             │ │
│  │  │  ┌──────────────┐   │        │  ┌──────────────┐   │             │ │
│  │  │  │  Bastion     │   │        │  │              │   │             │ │
│  │  │  │   Host       │   │        │  │              │   │             │ │
│  │  │  └──────────────┘   │        │  └──────────────┘   │             │ │
│  │  └─────────────────────┘        └─────────────────────┘             │ │
│  │                                                                       │ │
│  │  ┌─────────────────────┐        ┌─────────────────────┐             │ │
│  │  │  Private Subnet 1   │        │  Private Subnet 2   │             │ │
│  │  │  10.0.3.0/24        │        │  10.0.4.0/24        │             │ │
│  │  │  AZ: us-east-1a     │        │  AZ: us-east-1b     │             │ │
│  │  │                     │        │                     │             │ │
│  │  │  ┌──────────────┐   │        │  ┌──────────────┐   │             │ │
│  │  │  │ ECS Task     │   │        │  │ ECS Task     │   │             │ │
│  │  │  │ (Backend)    │   │        │  │ (Backend)    │   │             │ │
│  │  │  └──────────────┘   │        │  └──────────────┘   │             │ │
│  │  │  ┌──────────────┐   │        │  ┌──────────────┐   │             │ │
│  │  │  │ ECS Task     │   │        │  │ ECS Task     │   │             │ │
│  │  │  │ (Frontend)   │   │        │  │ (Frontend)   │   │             │ │
│  │  │  └──────────────┘   │        │  └──────────────┘   │             │ │
│  │  └─────────────────────┘        └─────────────────────┘             │ │
│  │                                                                       │ │
│  │  ┌─────────────────────┐        ┌─────────────────────┐             │ │
│  │  │  Private Subnet 3   │        │  Private Subnet 4   │             │ │
│  │  │  10.0.5.0/24        │        │  10.0.6.0/24        │             │ │
│  │  │  AZ: us-east-1a     │        │  AZ: us-east-1b     │             │ │
│  │  │                     │        │                     │             │ │
│  │  │  ┌──────────────┐   │        │  ┌──────────────┐   │             │ │
│  │  │  │   RDS        │◄──┼────────┼─►│  RDS         │   │             │ │
│  │  │  │  Primary     │   │        │  │  Standby     │   │             │ │
│  │  │  │ (PostgreSQL) │   │        │  │ (PostgreSQL) │   │             │ │
│  │  │  └──────────────┘   │        │  └──────────────┘   │             │ │
│  │  └─────────────────────┘        └─────────────────────┘             │ │
│  │                                                                       │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                       Application Load Balancer                       │ │
│  │                   itrack-alb-production                      │ │
│  │                                                                       │ │
│  │  ┌─────────────────┐              ┌─────────────────┐               │ │
│  │  │  Target Group   │              │  Target Group   │               │ │
│  │  │   (Backend)     │              │   (Frontend)    │               │ │
│  │  │   Port: 3000    │              │   Port: 80      │               │ │
│  │  └─────────────────┘              └─────────────────┘               │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                            CloudFront CDN                             │ │
│  │                     (Global Content Distribution)                     │ │
│  │                                                                       │ │
│  │  • HTTPS/SSL Termination                                             │ │
│  │  • Origin: ALB                                                        │ │
│  │  • S3 Bucket for Static Assets                                       │ │
│  │  • WAF Integration                                                    │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                         Supporting Services                           │ │
│  │                                                                       │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │ │
│  │  │     ECR      │  │  Route 53    │  │   Secrets    │               │ │
│  │  │  (Container  │  │   (DNS)      │  │   Manager    │               │ │
│  │  │  Registry)   │  │              │  │              │               │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘               │ │
│  │                                                                       │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │ │
│  │  │  CloudWatch  │  │   Lambda     │  │  DynamoDB    │               │ │
│  │  │  (Logs &     │  │  (Functions) │  │  (NoSQL DB)  │               │ │
│  │  │  Monitoring) │  │              │  │              │               │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘               │ │
│  │                                                                       │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │ │
│  │  │   AWS WAF    │  │   AWS IAM    │  │   API GW     │               │ │
│  │  │  (Security)  │  │   (Access)   │  │  (REST API)  │               │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘               │ │
│  │                                                                       │ │
│  │  ┌──────────────┐  ┌──────────────┐                                 │ │
│  │  │     S3       │  │  AWS Backup  │                                 │ │
│  │  │  (Storage)   │  │  (DR & BCP)  │                                 │ │
│  │  └──────────────┘  └──────────────┘                                 │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │
                                    ▼
                            ┌───────────────┐
                            │   End Users   │
                            │   (Internet)  │
                            └───────────────┘
```

## Components

### 1. Network Layer (VPC)

**Module:** `terraform/modules/vpc/`

- **VPC CIDR:** 10.0.0.0/16
- **Availability Zones:** us-east-1a, us-east-1b
- **Subnets:**
  - **Public Subnets (2):** 10.0.1.0/24, 10.0.2.0/24
    - Internet Gateway attached
    - NAT Gateways for outbound traffic
    - Bastion host for secure SSH access
  - **Private Subnets for Apps (2):** 10.0.3.0/24, 10.0.4.0/24
    - ECS tasks (backend and frontend)
    - Route through NAT Gateway
  - **Private Subnets for Database (2):** 10.0.5.0/24, 10.0.6.0/24
    - RDS PostgreSQL instances
    - Multi-AZ deployment

### 2. Compute Layer (ECS)

**Module:** `terraform/modules/ecs/`

- **ECS Cluster:** itrack-cluster-production
- **Services:**
  - **Backend Service:** Node.js application
    - Task Definition: itrack-backend-production
    - Container Port: 3000
    - Desired Count: 2 (auto-scaling enabled)
    - CPU: 512, Memory: 1024 MB
  - **Frontend Service:** ReactJS application
    - Task Definition: itrack-frontend-production
    - Container Port: 80
    - Desired Count: 2 (auto-scaling enabled)
    - CPU: 256, Memory: 512 MB
- **Auto Scaling:**
  - CPU-based scaling (target: 70%)
  - Min: 2 tasks, Max: 10 tasks

### 3. Container Registry (ECR)

**Module:** `terraform/modules/ecr/`

- **Repositories:**
  - itrack-api (Backend images)
  - itrack-ui (Frontend images)
- **Image Scanning:** Enabled on push
- **Lifecycle Policy:** Keep last 10 images

### 4. Load Balancing (ALB)

**Module:** Included in `terraform/modules/ecs/`

- **Load Balancer:** itrack-alb-production
- **Target Groups:**
  - Backend: Port 3000, Health check: /api/health
  - Frontend: Port 80, Health check: /
- **Listeners:**
  - HTTP (80): Redirect to HTTPS
  - HTTPS (443): SSL/TLS termination

### 5. Database Layer (RDS)

**Module:** `terraform/modules/rds/`

- **Engine:** PostgreSQL 14.x
- **Instance Class:** db.t3.micro (staging)
- **Storage:** 20 GB (gp3)
- **Multi-AZ:** Enabled
- **Backup:**
  - Retention: 7 days
  - Automated backups: Daily
  - Backup window: 03:00-04:00 UTC
- **Security:**
  - Encrypted at rest (KMS)
  - Credentials stored in AWS Secrets Manager

### 6. Content Delivery (CloudFront)

**Module:** `terraform/modules/cloudfront/`

- **Distribution:** Global CDN
- **Origins:**
  - ALB (dynamic content)
  - S3 (static assets)
- **Features:**
  - HTTPS enforced
  - Caching policies
  - Geographic restrictions (if needed)
  - WAF integration

### 7. DNS (Route 53)

**Module:** `terraform/modules/route53/`

- **Hosted Zone:** Production domain
- **Records:**
  - A record → CloudFront distribution
  - CNAME records for subdomains
- **Health Checks:** Enabled

### 8. Storage (S3)

**Module:** `terraform/modules/s3/`

- **Buckets:**
  - Static assets (frontend build files)
  - Application logs
  - Backup storage
- **Features:**
  - Versioning enabled
  - Server-side encryption (AES-256)
  - Lifecycle policies
  - CORS configuration

### 9. Security Services

#### WAF (Web Application Firewall)
**Module:** `terraform/modules/waf/`

- **Protections:**
  - SQL injection
  - XSS attacks
  - Rate limiting
  - IP blacklisting/whitelisting
  - Bot protection

#### Security Groups
**Module:** `terraform/modules/security/`

- **ALB Security Group:** Allow HTTP/HTTPS from internet
- **ECS Security Group:** Allow traffic from ALB only
- **RDS Security Group:** Allow PostgreSQL from ECS only
- **Bastion Security Group:** Allow SSH from specific IPs

#### Secrets Manager
**Module:** `terraform/modules/secrets/`

- **Secrets Stored:**
  - Database credentials
  - API keys
  - JWT secrets
  - Third-party service credentials

### 10. Serverless (Lambda)

**Module:** `terraform/modules/lambda/`

- **Functions:**
  - Data processing
  - Scheduled tasks
  - Event-driven workflows
- **Runtime:** Node.js 18.x
- **Triggers:**
  - CloudWatch Events
  - S3 events
  - API Gateway

### 11. NoSQL Database (DynamoDB)

**Module:** `terraform/modules/dynamodb/`

- **Tables:**
  - Sessions table
  - Cache table
  - Application metadata
- **Billing Mode:** PAY_PER_REQUEST (on-demand)
- **Features:**
  - Point-in-time recovery
  - Global secondary indexes
  - DynamoDB Streams

### 12. API Gateway

**Module:** `terraform/modules/api_gateway/`

- **Type:** REST API
- **Integration:** Lambda functions
- **Features:**
  - Request/response transformation
  - API throttling
  - CORS enabled
  - Cognito authentication

### 13. Monitoring & Logging (CloudWatch)

**Module:** `terraform/modules/monitoring/`

- **CloudWatch Logs:**
  - ECS container logs
  - Application logs
  - VPC Flow Logs
  - Retention: 7 days
- **CloudWatch Metrics:**
  - ECS CPU/Memory utilization
  - ALB request count & latency
  - RDS connections & performance
- **Alarms:**
  - High CPU utilization (>80%)
  - High memory utilization (>80%)
  - ALB 5xx errors
  - RDS storage low
- **SNS Topics:** Email notifications for alarms

### 14. Backup & Disaster Recovery

**Module:** `terraform/modules/backup/`

- **AWS Backup Plans:**
  - Daily RDS snapshots (7 days retention)
  - Weekly full backups (30 days retention)
  - DynamoDB continuous backups
- **Backup Vault:** Encrypted with KMS

### 15. Bastion Host

**Module:** `terraform/modules/bastion/`

- **Purpose:** Secure SSH access to private resources
- **Instance Type:** t3.micro
- **Access:** SSH from specific IP addresses only
- **Key Pair:** Required for authentication

## IAM Role: ITrack-Staging-Environment-Role

### Role Purpose
This IAM role is used by GitHub Actions CI/CD pipeline to deploy and manage the ITrack staging infrastructure. It has the minimum required permissions following the principle of least privilege.

### Role Details
- **Role Name:** `ITrack-Staging-Environment-Role`
- **Trusted Entity:** GitHub Actions (via OIDC) or IAM User
- **Description:** Deployment role for ITrack staging environment with comprehensive AWS service permissions

### Required Permissions

The role requires permissions for the following AWS services:

#### 1. ECS (Elastic Container Service)
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecs:CreateCluster",
        "ecs:DeleteCluster",
        "ecs:DescribeClusters",
        "ecs:CreateService",
        "ecs:UpdateService",
        "ecs:DeleteService",
        "ecs:DescribeServices",
        "ecs:RegisterTaskDefinition",
        "ecs:DeregisterTaskDefinition",
        "ecs:DescribeTaskDefinition",
        "ecs:ListTaskDefinitions",
        "ecs:RunTask",
        "ecs:StopTask",
        "ecs:DescribeTasks",
        "ecs:ListTasks",
        "ecs:UpdateContainerAgent",
        "ecs:TagResource",
        "ecs:UntagResource"
      ],
      "Resource": "*"
    }
  ]
}
```

#### 2. ECR (Elastic Container Registry)
```json
{
  "Effect": "Allow",
  "Action": [
    "ecr:GetAuthorizationToken",
    "ecr:BatchCheckLayerAvailability",
    "ecr:GetDownloadUrlForLayer",
    "ecr:BatchGetImage",
    "ecr:PutImage",
    "ecr:InitiateLayerUpload",
    "ecr:UploadLayerPart",
    "ecr:CompleteLayerUpload",
    "ecr:CreateRepository",
    "ecr:DeleteRepository",
    "ecr:DescribeRepositories",
    "ecr:ListImages",
    "ecr:DescribeImages",
    "ecr:PutLifecyclePolicy",
    "ecr:GetLifecyclePolicy",
    "ecr:TagResource"
  ],
  "Resource": "*"
}
```

#### 3. EC2 (VPC, Security Groups, Load Balancers)
```json
{
  "Effect": "Allow",
  "Action": [
    "ec2:CreateVpc",
    "ec2:DeleteVpc",
    "ec2:DescribeVpcs",
    "ec2:CreateSubnet",
    "ec2:DeleteSubnet",
    "ec2:DescribeSubnets",
    "ec2:CreateInternetGateway",
    "ec2:DeleteInternetGateway",
    "ec2:AttachInternetGateway",
    "ec2:DetachInternetGateway",
    "ec2:CreateNatGateway",
    "ec2:DeleteNatGateway",
    "ec2:DescribeNatGateways",
    "ec2:AllocateAddress",
    "ec2:ReleaseAddress",
    "ec2:DescribeAddresses",
    "ec2:CreateRouteTable",
    "ec2:DeleteRouteTable",
    "ec2:DescribeRouteTables",
    "ec2:CreateRoute",
    "ec2:DeleteRoute",
    "ec2:AssociateRouteTable",
    "ec2:DisassociateRouteTable",
    "ec2:CreateSecurityGroup",
    "ec2:DeleteSecurityGroup",
    "ec2:DescribeSecurityGroups",
    "ec2:AuthorizeSecurityGroupIngress",
    "ec2:AuthorizeSecurityGroupEgress",
    "ec2:RevokeSecurityGroupIngress",
    "ec2:RevokeSecurityGroupEgress",
    "ec2:CreateTags",
    "ec2:DeleteTags",
    "ec2:DescribeTags",
    "ec2:RunInstances",
    "ec2:TerminateInstances",
    "ec2:DescribeInstances",
    "ec2:DescribeInstanceStatus",
    "ec2:CreateKeyPair",
    "ec2:DeleteKeyPair",
    "ec2:DescribeKeyPairs",
    "ec2:DescribeAvailabilityZones",
    "ec2:DescribeNetworkInterfaces",
    "ec2:CreateNetworkInterface",
    "ec2:DeleteNetworkInterface"
  ],
  "Resource": "*"
}
```

#### 4. ELB (Application Load Balancer)
```json
{
  "Effect": "Allow",
  "Action": [
    "elasticloadbalancing:CreateLoadBalancer",
    "elasticloadbalancing:DeleteLoadBalancer",
    "elasticloadbalancing:DescribeLoadBalancers",
    "elasticloadbalancing:CreateTargetGroup",
    "elasticloadbalancing:DeleteTargetGroup",
    "elasticloadbalancing:DescribeTargetGroups",
    "elasticloadbalancing:ModifyTargetGroup",
    "elasticloadbalancing:RegisterTargets",
    "elasticloadbalancing:DeregisterTargets",
    "elasticloadbalancing:DescribeTargetHealth",
    "elasticloadbalancing:CreateListener",
    "elasticloadbalancing:DeleteListener",
    "elasticloadbalancing:DescribeListeners",
    "elasticloadbalancing:ModifyListener",
    "elasticloadbalancing:CreateRule",
    "elasticloadbalancing:DeleteRule",
    "elasticloadbalancing:DescribeRules",
    "elasticloadbalancing:ModifyRule",
    "elasticloadbalancing:AddTags",
    "elasticloadbalancing:RemoveTags",
    "elasticloadbalancing:DescribeTags"
  ],
  "Resource": "*"
}
```

#### 5. RDS (Database)
```json
{
  "Effect": "Allow",
  "Action": [
    "rds:CreateDBInstance",
    "rds:DeleteDBInstance",
    "rds:DescribeDBInstances",
    "rds:ModifyDBInstance",
    "rds:CreateDBSubnetGroup",
    "rds:DeleteDBSubnetGroup",
    "rds:DescribeDBSubnetGroups",
    "rds:CreateDBParameterGroup",
    "rds:DeleteDBParameterGroup",
    "rds:DescribeDBParameterGroups",
    "rds:ModifyDBParameterGroup",
    "rds:CreateDBSnapshot",
    "rds:DeleteDBSnapshot",
    "rds:DescribeDBSnapshots",
    "rds:RestoreDBInstanceFromDBSnapshot",
    "rds:AddTagsToResource",
    "rds:RemoveTagsFromResource",
    "rds:ListTagsForResource"
  ],
  "Resource": "*"
}
```

#### 6. S3 (Storage)
```json
{
  "Effect": "Allow",
  "Action": [
    "s3:CreateBucket",
    "s3:DeleteBucket",
    "s3:ListBucket",
    "s3:GetBucketLocation",
    "s3:GetBucketVersioning",
    "s3:PutBucketVersioning",
    "s3:GetBucketAcl",
    "s3:PutBucketAcl",
    "s3:GetBucketCORS",
    "s3:PutBucketCORS",
    "s3:GetBucketPolicy",
    "s3:PutBucketPolicy",
    "s3:DeleteBucketPolicy",
    "s3:GetBucketPublicAccessBlock",
    "s3:PutBucketPublicAccessBlock",
    "s3:PutObject",
    "s3:GetObject",
    "s3:DeleteObject",
    "s3:PutObjectAcl",
    "s3:GetObjectAcl",
    "s3:PutBucketTagging",
    "s3:GetBucketTagging",
    "s3:PutEncryptionConfiguration",
    "s3:GetEncryptionConfiguration",
    "s3:PutLifecycleConfiguration",
    "s3:GetLifecycleConfiguration"
  ],
  "Resource": "*"
}
```

#### 7. CloudFront (CDN)
```json
{
  "Effect": "Allow",
  "Action": [
    "cloudfront:CreateDistribution",
    "cloudfront:GetDistribution",
    "cloudfront:UpdateDistribution",
    "cloudfront:DeleteDistribution",
    "cloudfront:ListDistributions",
    "cloudfront:CreateCloudFrontOriginAccessIdentity",
    "cloudfront:GetCloudFrontOriginAccessIdentity",
    "cloudfront:DeleteCloudFrontOriginAccessIdentity",
    "cloudfront:ListCloudFrontOriginAccessIdentities",
    "cloudfront:CreateInvalidation",
    "cloudfront:GetInvalidation",
    "cloudfront:ListInvalidations",
    "cloudfront:TagResource",
    "cloudfront:UntagResource"
  ],
  "Resource": "*"
}
```

#### 8. Route 53 (DNS)
```json
{
  "Effect": "Allow",
  "Action": [
    "route53:CreateHostedZone",
    "route53:GetHostedZone",
    "route53:DeleteHostedZone",
    "route53:ListHostedZones",
    "route53:ChangeResourceRecordSets",
    "route53:ListResourceRecordSets",
    "route53:GetChange",
    "route53:CreateHealthCheck",
    "route53:GetHealthCheck",
    "route53:DeleteHealthCheck",
    "route53:ListHealthChecks",
    "route53:ChangeTagsForResource",
    "route53:ListTagsForResource"
  ],
  "Resource": "*"
}
```

#### 9. CloudWatch (Monitoring & Logging)
```json
{
  "Effect": "Allow",
  "Action": [
    "logs:CreateLogGroup",
    "logs:DeleteLogGroup",
    "logs:DescribeLogGroups",
    "logs:PutRetentionPolicy",
    "logs:CreateLogStream",
    "logs:DeleteLogStream",
    "logs:DescribeLogStreams",
    "logs:PutLogEvents",
    "logs:GetLogEvents",
    "logs:FilterLogEvents",
    "cloudwatch:PutMetricAlarm",
    "cloudwatch:DeleteAlarms",
    "cloudwatch:DescribeAlarms",
    "cloudwatch:PutMetricData",
    "cloudwatch:GetMetricStatistics",
    "cloudwatch:ListMetrics",
    "cloudwatch:PutDashboard",
    "cloudwatch:GetDashboard",
    "cloudwatch:DeleteDashboards",
    "cloudwatch:ListDashboards"
  ],
  "Resource": "*"
}
```

#### 10. SNS (Notifications)
```json
{
  "Effect": "Allow",
  "Action": [
    "sns:CreateTopic",
    "sns:DeleteTopic",
    "sns:GetTopicAttributes",
    "sns:SetTopicAttributes",
    "sns:Subscribe",
    "sns:Unsubscribe",
    "sns:Publish",
    "sns:ListTopics",
    "sns:ListSubscriptionsByTopic",
    "sns:TagResource",
    "sns:UntagResource"
  ],
  "Resource": "*"
}
```

#### 11. Secrets Manager
```json
{
  "Effect": "Allow",
  "Action": [
    "secretsmanager:CreateSecret",
    "secretsmanager:DeleteSecret",
    "secretsmanager:DescribeSecret",
    "secretsmanager:GetSecretValue",
    "secretsmanager:PutSecretValue",
    "secretsmanager:UpdateSecret",
    "secretsmanager:ListSecrets",
    "secretsmanager:TagResource",
    "secretsmanager:UntagResource"
  ],
  "Resource": "*"
}
```

#### 12. Lambda
```json
{
  "Effect": "Allow",
  "Action": [
    "lambda:CreateFunction",
    "lambda:DeleteFunction",
    "lambda:GetFunction",
    "lambda:UpdateFunctionCode",
    "lambda:UpdateFunctionConfiguration",
    "lambda:ListFunctions",
    "lambda:InvokeFunction",
    "lambda:PublishVersion",
    "lambda:CreateAlias",
    "lambda:UpdateAlias",
    "lambda:DeleteAlias",
    "lambda:AddPermission",
    "lambda:RemovePermission",
    "lambda:TagResource",
    "lambda:UntagResource"
  ],
  "Resource": "*"
}
```

#### 13. DynamoDB
```json
{
  "Effect": "Allow",
  "Action": [
    "dynamodb:CreateTable",
    "dynamodb:DeleteTable",
    "dynamodb:DescribeTable",
    "dynamodb:UpdateTable",
    "dynamodb:ListTables",
    "dynamodb:PutItem",
    "dynamodb:GetItem",
    "dynamodb:UpdateItem",
    "dynamodb:DeleteItem",
    "dynamodb:Query",
    "dynamodb:Scan",
    "dynamodb:BatchWriteItem",
    "dynamodb:BatchGetItem",
    "dynamodb:TagResource",
    "dynamodb:UntagResource",
    "dynamodb:CreateBackup",
    "dynamodb:DeleteBackup",
    "dynamodb:DescribeBackup",
    "dynamodb:ListBackups"
  ],
  "Resource": "*"
}
```

#### 14. API Gateway
```json
{
  "Effect": "Allow",
  "Action": [
    "apigateway:GET",
    "apigateway:POST",
    "apigateway:PUT",
    "apigateway:DELETE",
    "apigateway:PATCH",
    "apigateway:CreateRestApi",
    "apigateway:DeleteRestApi",
    "apigateway:UpdateRestApi",
    "apigateway:CreateDeployment",
    "apigateway:GetDeployment",
    "apigateway:DeleteDeployment",
    "apigateway:CreateStage",
    "apigateway:GetStage",
    "apigateway:UpdateStage",
    "apigateway:DeleteStage",
    "apigateway:TagResource",
    "apigateway:UntagResource"
  ],
  "Resource": "*"
}
```

#### 15. WAF
```json
{
  "Effect": "Allow",
  "Action": [
    "wafv2:CreateWebACL",
    "wafv2:DeleteWebACL",
    "wafv2:GetWebACL",
    "wafv2:UpdateWebACL",
    "wafv2:ListWebACLs",
    "wafv2:AssociateWebACL",
    "wafv2:DisassociateWebACL",
    "wafv2:CreateRuleGroup",
    "wafv2:DeleteRuleGroup",
    "wafv2:GetRuleGroup",
    "wafv2:UpdateRuleGroup",
    "wafv2:TagResource",
    "wafv2:UntagResource"
  ],
  "Resource": "*"
}
```

#### 16. AWS Backup
```json
{
  "Effect": "Allow",
  "Action": [
    "backup:CreateBackupPlan",
    "backup:DeleteBackupPlan",
    "backup:GetBackupPlan",
    "backup:UpdateBackupPlan",
    "backup:CreateBackupSelection",
    "backup:DeleteBackupSelection",
    "backup:GetBackupSelection",
    "backup:CreateBackupVault",
    "backup:DeleteBackupVault",
    "backup:DescribeBackupVault",
    "backup:PutBackupVaultAccessPolicy",
    "backup:DeleteBackupVaultAccessPolicy",
    "backup:TagResource",
    "backup:UntagResource"
  ],
  "Resource": "*"
}
```

#### 17. IAM (For role and policy management)
```json
{
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
    "iam:UntagRole"
  ],
  "Resource": "*"
}
```

#### 18. KMS (Encryption)
```json
{
  "Effect": "Allow",
  "Action": [
    "kms:CreateKey",
    "kms:DescribeKey",
    "kms:EnableKeyRotation",
    "kms:DisableKeyRotation",
    "kms:GetKeyRotationStatus",
    "kms:CreateAlias",
    "kms:DeleteAlias",
    "kms:UpdateAlias",
    "kms:ListAliases",
    "kms:Encrypt",
    "kms:Decrypt",
    "kms:GenerateDataKey",
    "kms:TagResource",
    "kms:UntagResource"
  ],
  "Resource": "*"
}
```

## Data Flow

### 1. User Request Flow
```
End User → CloudFront → WAF → ALB → ECS Tasks (Frontend/Backend) → RDS/DynamoDB
```

### 2. CI/CD Deployment Flow
```
GitHub Actions → AWS Credentials → ECR (Push Images) → ECS (Update Tasks) → ALB (Health Check)
```

### 3. Logging & Monitoring Flow
```
ECS Tasks → CloudWatch Logs → CloudWatch Metrics → Alarms → SNS → Email Notifications
```

## Security Considerations

1. **Network Security:**
   - Private subnets for application and database layers
   - Security groups with least privilege access
   - NAT Gateways for outbound internet access
   - Bastion host for secure administrative access

2. **Data Security:**
   - Encryption at rest (RDS, S3, EBS, DynamoDB)
   - Encryption in transit (HTTPS, SSL/TLS)
   - Secrets stored in AWS Secrets Manager
   - KMS for key management

3. **Application Security:**
   - WAF rules to protect against common attacks
   - CloudFront with HTTPS enforcement
   - Security group rules limiting access
   - IAM roles with least privilege

4. **Access Control:**
   - IAM roles for service-to-service communication
   - MFA for administrative access
   - Bastion host with key-pair authentication
   - API Gateway with Cognito authentication

## High Availability & Disaster Recovery

1. **Multi-AZ Deployment:**
   - ECS tasks distributed across 2 AZs
   - RDS Multi-AZ for automatic failover
   - NAT Gateways in each AZ
   - ALB across multiple AZs

2. **Auto Scaling:**
   - ECS auto-scaling based on CPU utilization
   - Target tracking scaling policy (70% CPU)
   - Min: 2 tasks, Max: 10 tasks per service

3. **Backup Strategy:**
   - RDS automated backups (7 days retention)
   - DynamoDB point-in-time recovery
   - S3 versioning enabled
   - AWS Backup for centralized backup management

4. **Monitoring & Alerting:**
   - CloudWatch alarms for critical metrics
   - SNS notifications for incidents
   - CloudWatch dashboards for visibility
   - Log retention for troubleshooting

## Cost Optimization

1. **Right-sizing:**
   - Use appropriate instance sizes (t3.micro for bastion, db.t3.micro for RDS)
   - ECS Fargate for containerized workloads

2. **Storage Optimization:**
   - S3 lifecycle policies to move old data to cheaper tiers
   - ECR lifecycle policy to remove old images
   - RDS storage autoscaling

3. **Network Optimization:**
   - CloudFront caching to reduce ALB traffic
   - VPC endpoints for AWS service communication (future enhancement)

4. **Resource Cleanup:**
   - Automated cleanup of unused resources
   - Regular review of resource utilization

## Environment Variables

Key environment variables used across the infrastructure:

- `AWS_REGION`: us-east-1
- `AWS_ACCOUNT_ID`: 875486186130
- `ENVIRONMENT`: production (staging)
- `PROJECT_NAME`: itrack
- `VPC_CIDR`: 10.0.0.0/16

## Deployment Process

1. **Infrastructure Provisioning (Terraform):**
   ```bash
   cd terraform
   terraform init -backend-config="environments/staging.backend.conf"
   terraform plan -var-file="environments/staging.tfvars"
   terraform apply -var-file="environments/staging.tfvars"
   ```

2. **Application Deployment (GitHub Actions):**
   - Build Docker images
   - Push to ECR
   - Update ECS task definitions
   - Deploy new tasks
   - Health check validation

3. **Monitoring:**
   - Check CloudWatch dashboards
   - Review alarms
   - Monitor application logs

## Maintenance

- **Regular Updates:**
  - Security patches for EC2 instances
  - RDS minor version upgrades
  - ECS task definition updates
  - Lambda runtime updates

- **Backup Verification:**
  - Test backup restoration quarterly
  - Verify backup completion daily

- **Cost Review:**
  - Monthly cost analysis
  - Resource utilization review

## Contacts & Support

- **Infrastructure Team:** DevOps team
- **Application Team:** Development team
- **Security Team:** Security operations

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-10-23 | DevOps Team | Initial architecture documentation |

