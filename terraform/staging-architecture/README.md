# ITrack Staging Architecture Documentation

This folder contains comprehensive documentation and configuration files for the ITrack staging environment infrastructure.

## 📁 Contents

| File | Description |
|------|-------------|
| `ARCHITECTURE.md` | Complete AWS infrastructure architecture documentation with diagrams and component details |
| `IAM-ROLE-SETUP.md` | Step-by-step guide to create the IAM role for CI/CD deployments |
| `deployment-policy.json` | IAM policy with all required permissions for deployment |
| `iam-role.tf` | Terraform configuration to create the IAM role automatically |
| `README.md` | This file - overview and quick start guide |

## 🚀 Quick Start

### 1. Review the Architecture

Read [`ARCHITECTURE.md`](./ARCHITECTURE.md) to understand:
- Complete infrastructure components
- Network topology
- Security configurations
- Data flow and interactions
- High availability setup

### 2. Create the IAM Role

You have three options to create the required IAM role:

#### Option A: AWS Console (Easiest)
Follow the step-by-step instructions in [`IAM-ROLE-SETUP.md`](./IAM-ROLE-SETUP.md#option-1-create-role-via-aws-console-recommended-for-beginners)

#### Option B: AWS CLI (Fast)
```bash
# 1. Create trust policy (see IAM-ROLE-SETUP.md for content)
# 2. Run commands from IAM-ROLE-SETUP.md
```

#### Option C: Terraform (Recommended)
```bash
cd terraform/staging-architecture
terraform init
terraform plan
terraform apply
```

### 3. Configure GitHub Actions

After creating the role, update your GitHub repository:

1. **Add the Role ARN to GitHub Secrets** (if not using OIDC):
   - Go to repository Settings → Secrets and variables → Actions
   - Add secret: `AWS_ROLE_ARN` with value from role creation

2. **Update Workflow** (if using OIDC):
   ```yaml
   - name: Configure AWS credentials
     uses: aws-actions/configure-aws-credentials@v4
     with:
       role-to-assume: arn:aws:iam::875486186130:role/ITrack-Staging-Environment-Role
       aws-region: us-east-1
   ```

### 4. Deploy Infrastructure

```bash
cd terraform
terraform init -backend-config="environments/staging.backend.conf"
terraform plan -var-file="environments/staging.tfvars"
terraform apply -var-file="environments/staging.tfvars"
```

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                     AWS Cloud                           │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │               CloudFront CDN                      │ │
│  │         (Global Distribution)                     │ │
│  └───────────────────┬───────────────────────────────┘ │
│                      │                                  │
│  ┌───────────────────▼───────────────────────────────┐ │
│  │         Application Load Balancer                 │ │
│  └───────────┬───────────────────┬───────────────────┘ │
│              │                   │                      │
│  ┌───────────▼─────────┐  ┌─────▼──────────────────┐  │
│  │   ECS Backend       │  │   ECS Frontend         │  │
│  │   (Node.js)         │  │   (ReactJS)            │  │
│  └───────────┬─────────┘  └────────────────────────┘  │
│              │                                          │
│  ┌───────────▼───────────────────────────────────────┐ │
│  │         RDS PostgreSQL (Multi-AZ)                 │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 🔐 IAM Role: ITrack-Staging-Environment-Role

### Purpose
CI/CD deployment role for GitHub Actions with permissions to manage all AWS resources required for the ITrack staging environment.

### Key Permissions
- ✅ ECS (Container orchestration)
- ✅ ECR (Container registry)
- ✅ EC2/VPC (Networking)
- ✅ ALB (Load balancing)
- ✅ RDS (Database)
- ✅ S3 (Storage)
- ✅ CloudFront (CDN)
- ✅ Route 53 (DNS)
- ✅ CloudWatch (Monitoring)
- ✅ Secrets Manager (Credentials)
- ✅ Lambda (Serverless functions)
- ✅ DynamoDB (NoSQL database)
- ✅ API Gateway (REST API)
- ✅ WAF (Security)
- ✅ AWS Backup (DR)
- ✅ IAM (Role management)
- ✅ KMS (Encryption)

See [`IAM-ROLE-SETUP.md`](./IAM-ROLE-SETUP.md) for complete permission details.

## 🏗️ Infrastructure Components

### Core Services
- **VPC**: 10.0.0.0/16 with public/private subnets across 2 AZs
- **ECS Cluster**: Container orchestration for backend and frontend
- **RDS PostgreSQL**: Multi-AZ database with automated backups
- **Application Load Balancer**: HTTPS traffic distribution
- **CloudFront**: Global CDN with WAF protection

### Supporting Services
- **ECR**: Container image registry
- **S3**: Static assets and backups
- **Route 53**: DNS management
- **CloudWatch**: Logs and monitoring
- **SNS**: Alarm notifications
- **Secrets Manager**: Secure credential storage
- **Lambda**: Serverless functions
- **DynamoDB**: Session and cache storage
- **API Gateway**: REST API endpoints
- **AWS Backup**: Automated backup management

## 📝 Documentation Files Explained

### ARCHITECTURE.md
Comprehensive documentation including:
- Visual architecture diagrams
- Detailed component descriptions
- Network topology
- Security configurations
- Data flow diagrams
- High availability setup
- Disaster recovery plan
- Cost optimization strategies
- Deployment procedures
- Maintenance guidelines

### IAM-ROLE-SETUP.md
Complete guide for creating the deployment IAM role:
- Three creation methods (Console, CLI, Terraform)
- Step-by-step instructions with screenshots references
- Complete policy JSON
- GitHub OIDC setup
- Verification steps
- Security best practices
- Troubleshooting guide

### deployment-policy.json
Ready-to-use IAM policy JSON file with all required permissions for:
- Infrastructure provisioning
- Application deployment
- Resource management
- Monitoring and logging
- Backup and recovery

### iam-role.tf
Terraform configuration to automatically create:
- GitHub OIDC provider
- IAM role with trust policy
- IAM policy from JSON file
- Policy attachment
- Useful outputs (ARNs, names)

## 🔧 Prerequisites

### For Infrastructure Deployment
- AWS Account (Account ID: 875486186130)
- AWS CLI installed and configured
- Terraform >= 1.5.0
- Appropriate AWS permissions to create resources

### For IAM Role Creation
- AWS Console access OR
- AWS CLI with IAM permissions OR
- Terraform with IAM permissions

### For GitHub Actions
- GitHub repository access (GRIFFINGlobalTech/rs-feb-25)
- GitHub Actions enabled
- Secrets configured (see `.github/SECRETS.md`)

## 🚦 Deployment Steps

### Initial Setup

1. **Create IAM Role** (One-time):
   ```bash
   cd terraform/staging-architecture
   terraform init
   terraform apply
   # Note the role ARN from output
   ```

2. **Configure GitHub Secrets**:
   - Follow `.github/SECRETS.md`
   - Add all 15 required secrets

3. **Deploy Infrastructure**:
   ```bash
   cd terraform
   terraform init -backend-config="environments/staging.backend.conf"
   terraform apply -var-file="environments/staging.tfvars"
   ```

### CI/CD Deployment

Once set up, GitHub Actions will automatically:
1. Build Docker images
2. Push to ECR
3. Update ECS task definitions
4. Deploy new containers
5. Run health checks

## 📋 Checklist

Use this checklist for initial setup:

- [ ] Read ARCHITECTURE.md
- [ ] Create IAM role (ITrack-Staging-Environment-Role)
- [ ] Set up GitHub OIDC provider
- [ ] Configure GitHub secrets (15 secrets)
- [ ] Initialize Terraform backend
- [ ] Deploy VPC and networking
- [ ] Deploy RDS database
- [ ] Deploy ECS cluster
- [ ] Deploy ALB and target groups
- [ ] Deploy CloudFront distribution
- [ ] Configure Route 53 DNS
- [ ] Set up CloudWatch monitoring
- [ ] Configure SNS notifications
- [ ] Test CI/CD pipeline
- [ ] Verify health checks
- [ ] Review CloudWatch dashboards

## 🔍 Verification

After deployment, verify:

```bash
# Check ECS cluster
aws ecs list-clusters
aws ecs describe-clusters --clusters itrack-cluster-production

# Check ECR repositories
aws ecr describe-repositories

# Check RDS instance
aws rds describe-db-instances

# Check ALB
aws elbv2 describe-load-balancers --names itrack-alb-production

# Check S3 buckets
aws s3 ls
```

## 🆘 Troubleshooting

### Common Issues

**IAM Role Issues:**
- See [IAM-ROLE-SETUP.md - Troubleshooting](./IAM-ROLE-SETUP.md#troubleshooting)

**Terraform Issues:**
- Check backend configuration
- Verify AWS credentials
- Review terraform.tfstate

**GitHub Actions Issues:**
- Verify all 15 secrets are set
- Check OIDC provider is configured
- Review workflow logs

**Deployment Issues:**
- Check ECS task logs in CloudWatch
- Verify security group rules
- Check target group health

## 📚 Additional Resources

- [AWS Documentation](https://docs.aws.amazon.com/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [ECS Best Practices](https://docs.aws.amazon.com/AmazonECS/latest/bestpracticesguide/)

## 🤝 Support

For questions or issues:
1. Check the troubleshooting sections in documentation
2. Review CloudWatch logs
3. Contact DevOps team
4. Review architecture documentation

## 📌 Important Notes

- **Region**: All resources deployed in `us-east-1`
- **Environment**: Staging (production-grade setup)
- **Cost**: Monitor AWS Cost Explorer regularly
- **Security**: All traffic encrypted (HTTPS/TLS)
- **Backups**: Daily automated backups enabled
- **HA**: Multi-AZ deployment for critical components

## 📄 License

Internal documentation for GRIFFINGlobalTech ITrack project.

---

**Last Updated**: October 23, 2025  
**Maintained By**: DevOps Team  
**Version**: 1.0
