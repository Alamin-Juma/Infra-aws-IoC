# ProdReady_Infra Setup Guide

## 🏗️ Complete AWS Infrastructure Deployment Setup

This guide provides step-by-step instructions for setting up and deploying the ProdReady_Infra project, a production-ready AWS infrastructure using Terraform and GitHub Actions CI/CD.

## 📋 Prerequisites

- AWS Account with appropriate permissions
- GitHub repository
- Local development environment with:
  - AWS CLI
  - Terraform
  - Git
  - Node.js (for frontend/backend development)

## 🔐 AWS Authentication Setup

### Step 1: Getting AWS Access Keys from IAM

Before configuring AWS CLI, you need to obtain access keys from the AWS IAM console:

#### Option A: AWS Lab Environment (Learner Lab)
1. **Login to AWS Lab**: Access your AWS Learner Lab or Sandbox environment
2. **Start Lab**: Click the "Start Lab" button and wait for the AWS icon to turn green
3. **Get AWS CLI Credentials**: Click on "AWS Details" → "AWS CLI" 
4. **Copy Credentials**: Copy the provided access key ID and secret access key

#### Option B: Regular AWS Account - Create IAM User
1. **Login to AWS Console**: Navigate to AWS Management Console
2. **Go to IAM Service**: Search for "IAM" in the services menu
3. **Create New User**:
   ```
   IAM → Users → Add User
   - Username: terraform-user (or your preferred name)
   - Access type: ✅ Programmatic access
   ```
4. **Attach Permissions**:
   ```
   Attach existing policies directly:
   - ✅ AdministratorAccess (for full access)
   OR create custom policy with specific permissions
   ```
5. **Download Credentials**:
   - Download the CSV file with Access Key ID and Secret Access Key
   - ⚠️ **IMPORTANT**: This is the ONLY time you can see the secret key!

#### Option C: Existing IAM User - Create New Access Keys
1. **Navigate to IAM**: Go to IAM → Users → [Your Username]
2. **Security Credentials Tab**: Click on "Security credentials"
3. **Create Access Key**:
   ```
   Access keys section → Create access key
   - Use case: ✅ Command Line Interface (CLI)
   - Confirmation: ✅ I understand the above recommendation
   - Description: "Terraform deployment keys" (optional)
   ```
4. **Download Keys**: Save the Access Key ID and Secret Access Key

### Step 2: Configure AWS CLI

Configure your AWS CLI with the obtained credentials:

```bash
# Check current AWS configuration
aws configure list

# Method 1: Interactive configuration
aws configure
# Enter when prompted:
# AWS Access Key ID: AKIAZGHWLJCCJVBFDQIE
# AWS Secret Access Key: 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
# Default region name: us-east-1
# Default output format: json

# Method 2: Direct configuration (if interactive fails)
aws configure set aws_access_key_id "AKIAZGHWLJCCJVBFDQIE"
aws configure set aws_secret_access_key "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"
aws configure set default.region "us-east-1"
aws configure set default.output "json"

# Verify credentials are working
aws sts get-caller-identity
```

**Expected Output:**
```json
{
    "UserId": "AIDAZGHWLJCCGFYIKIJ4V",
    "Account": "631876831364",
    "Arn": "arn:aws:iam::631876831364:user/kk_labs_user_209976"
}
```

**Actual Terminal Output Example:**
```bash
AzureAD+AlaminJumaMagoti@DESKTOP-8OQV8SV MINGW64 /c/dev/sides/NewArchitecture (main)
$ aws configure
AWS Access Key ID [****************DQIE]: AKIAZGHWLJCCJVBFDQIE
AWS Secret Access Key [****************vx5!]: 
Default region name [us-east-1]:

AzureAD+AlaminJumaMagoti@DESKTOP-8OQV8SV MINGW64 /c/dev/sides/NewArchitecture (main)
$ aws configure set aws_access_key_id "AKIAZGHWLJCCJVBFDQIE"

AzureAD+AlaminJumaMagoti@DESKTOP-8OQV8SV MINGW64 /c/dev/sides/NewArchitecture (main)
$ aws configure set aws_secret_access_key "TPkm/1NvVnSks7VDXnWGWZmHbnD5d6dEU7NvTvGa"

AzureAD+AlaminJumaMagoti@DESKTOP-8OQV8SV MINGW64 /c/dev/sides/NewArchitecture (main)
$ aws sts get-caller-identity
{
    "UserId": "AIDAZGHWLJCCGFYIKIJ4V",
    "Account": "631876831364",
    "Arn": "arn:aws:iam::631876831364:user/kk_labs_user_209976"
}
```

### Step 3: Create SSH Keys for Bastion Host

#### 🔐 Why SSH Keys Are Critical

SSH keys are essential for secure infrastructure access because they provide:

1. **🛡️ Enhanced Security**: 
   - Much stronger than password authentication
   - Nearly impossible to brute force
   - Eliminates password-based attacks

2. **🔒 Secure Bastion Host Access**: 
   - Your bastion host is the secure gateway to your private infrastructure
   - SSH keys ensure only authorized personnel can access critical systems
   - Required for compliance and security best practices

3. **🤖 Automated Deployments**: 
   - CI/CD pipelines need programmatic access to deploy applications
   - SSH keys enable secure automated connections
   - No manual password entry required during deployments

4. **📊 Audit Trail**: 
   - Each key pair can be tracked and monitored
   - Better logging and accountability
   - Easy to revoke access when needed

#### Generate SSH Key Pair

Generate SSH key pair for secure bastion host access:

```bash
# Generate SSH key pair (4096-bit RSA for maximum security)
ssh-keygen -t rsa -b 4096 -f ~/.ssh/prodready_infra_key -N ""

# View private key (needed for GitHub secrets)
cat ~/.ssh/prodready_infra_key

# View public key (needed for GitHub secrets)
cat ~/.ssh/prodready_infra_key.pub
```

**Actual Terminal Output:**
```bash
AzureAD+AlaminJumaMagoti@DESKTOP-8OQV8SV MINGW64 /c/dev/sides/NewArchitecture (main)
$ ssh-keygen -t rsa -b 4096 -f ~/.ssh/prodready_infra_key -N ""
Generating public/private rsa key pair.
Your identification has been saved in /c/Users/AlaminJumaMagoti/.ssh/prodready_infra_key
Your public key has been saved in /c/Users/AlaminJumaMagoti/.ssh/prodready_infra_key.pub
The key fingerprint is:
SHA256:JyFvOCTLJyAdpbJXyEB985fCuesyW9SDUBJgr9bUmPg AzureAD+AlaminJumaMagoti@DESKTOP-8OQV8SV
The key's randomart image is:
+---[RSA 4096]----+
|o.o+oo..         |
| +.=oo*          |
|o *.+**.o .      |
| + +=+.Oo+       |
|. .o+E+oSo.      |
| ..  o.+ o.      |
|       ..        |
|     o..         |
|     .=.         |
+----[SHA256]-----+
```

#### 🔑 SSH Key Components Explained

- **Private Key** (`~/.ssh/prodready_infra_key`): 
  - Keep this SECRET and secure
  - Used by GitHub Actions to connect to bastion host
  - Never share publicly or commit to version control

- **Public Key** (`~/.ssh/prodready_infra_key.pub`): 
  - Safe to share and store in GitHub secrets
  - Installed on the bastion host to allow connections
  - Acts as the "lock" that the private key "unlocks"

- **Key Fingerprint**: 
  - Unique identifier for verification
  - Helps ensure you're connecting to the right server
  - Used for security auditing

### Step 4: Create Terraform State S3 Bucket

### Step 4: Create Terraform State S3 Bucket

#### 🗄️ Why Terraform State Management Is Critical

Terraform state files are crucial because they:

1. **📊 Track Infrastructure State**: 
   - Maps real-world resources to your configuration
   - Tracks metadata and resource dependencies
   - Enables Terraform to know what it has created

2. **🤝 Enable Team Collaboration**: 
   - Shared state allows multiple team members to work together
   - Prevents conflicting changes and resource duplication
   - Central source of truth for infrastructure state

3. **🔒 Remote State Security**: 
   - Local state files can be lost or corrupted
   - S3 provides durability, versioning, and backup
   - Access can be controlled via IAM policies

4. **🔄 State Locking**: 
   - Prevents concurrent modifications
   - Avoids corrupted state from simultaneous operations
   - Ensures data consistency

#### Create and Configure S3 Bucket

```bash
# Create S3 bucket for Terraform state
aws s3 mb s3://prodready-infra-terraform-state-631876831364 --region us-east-1

# Enable versioning on the bucket (crucial for state recovery)
aws s3api put-bucket-versioning \
  --bucket prodready-infra-terraform-state-631876831364 \
  --versioning-configuration Status=Enabled

# Verify bucket creation
aws s3 ls | grep prodready-infra-terraform-state
```

**Actual Terminal Output:**
```bash
AzureAD+AlaminJumaMagoti@DESKTOP-8OQV8SV MINGW64 /c/dev/sides/NewArchitecture (main)
$ aws s3 mb s3://prodready-infra-terraform-state-631876831364 --region us-east-1
make_bucket: prodready-infra-terraform-state-631876831364

AzureAD+AlaminJumaMagoti@DESKTOP-8OQV8SV MINGW64 /c/dev/sides/NewArchitecture (main)
$ aws s3api put-bucket-versioning --bucket prodready-infra-terraform-state-631876831364 --versioning-configuration Status=Enabled

AzureAD+AlaminJumaMagoti@DESKTOP-8OQV8SV MINGW64 /c/dev/sides/NewArchitecture (main)
$ aws s3 ls | grep prodready-infra-terraform-state
2025-09-29 XX:XX:XX prodready-infra-terraform-state-631876831364
```

#### 🔐 S3 Bucket Security Best Practices

- **Bucket Naming**: Includes account ID to ensure global uniqueness
- **Versioning**: Enabled to recover from accidental state corruption
- **Region**: Same as your infrastructure to minimize latency
- **Access Control**: Only accessible via IAM credentials used for Terraform

## 🔑 GitHub Secrets Configuration

### Required GitHub Repository Secrets

Navigate to your GitHub repository secrets page:
1. **Direct Link**: `https://github.com/Alamin-Juma/<Repo-Name>/settings/secrets/actions`
   - Replace `<Repo-Name>` with your actual repository name (e.g., `Terraform-101`)
   - Example: `https://github.com/Alamin-Juma/Terraform-101/settings/secrets/actions`

2. **Or navigate manually**: Go to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** for each of the following:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `AWS_ACCESS_KEY_ID` | `AKIAZGHWLJCCJVBFDQIE` | AWS access key for authentication |
| `AWS_SECRET_ACCESS_KEY` | `TPkm/1NvVnSks7VDXnWGWZmHbnD5d6dEU7NvTvGa` | AWS secret key for authentication |
| `AWS_ACCOUNT_ID` | `631876831364` | Your AWS account ID |
| `AWS_TF_STATE_BUCKET_NAME` | `prodready-infra-terraform-state-631876831364` | S3 bucket for Terraform state |

### **SSH Keys for Bastion Host:**

**🔐 Why These SSH Keys Are Essential:**
- **Security**: Bastion hosts are your gateway to private infrastructure - SSH keys provide military-grade security
- **Automation**: CI/CD pipelines need these keys to deploy applications securely
- **Compliance**: Many security frameworks require key-based authentication
- **Auditability**: SSH keys provide better logging and access tracking than passwords

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `AWS_SSH_KEY_PRIVATE` | Contents of `~/.ssh/prodready_infra_key` | Private SSH key for bastion host |
| `AWS_SSH_KEY_PUBLIC` | Contents of `~/.ssh/prodready_infra_key.pub` | Public SSH key for bastion host |

### SSH Key Format Examples

**Private Key Format:**
```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAACFwAAAAdzc2gtcn
NhAAAAAwEAAQAAAgEAmQHH4ZPSAiS4ekmx44AHwutd7ywPA5Fh62p2XkdfimQRmJQe1gJj
MSPaUcyJrMB9Yq5eTWNVfKRPaTvvrIfB71h/Btq43SLNW3Cx6HpDqKQph4MjoRYAH5iTiB
... (full private key content) ...
-----END OPENSSH PRIVATE KEY-----
```

**Public Key Format:**
```
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQCZAcfhk9ICJLh6SbHjgAfC613vLA8DkWHranZeR1+KZBGYlB7WAmMxI9pRzImswH1irl5NY1V8pE9pO++sh8HvWH8G2rjdIs1bcLHoekOopCmHgyOhFgAfmJOIEcppHscY3pfWI/VTpO82W8AViCNxG7F2GaT4sULBrnepAq9fHSU7vJDMIN9nJK7UvqC+VBv74Aw2dH6cSehvBPAmd3G2M1GQ3qbx/YJE+AMVLclZJEm8Ln2bV4Su5b2uaT+7uxcuxJBonG9QdyA7OpNI8GkLRHqAL/mahudfbfZf9M7SkZZ1RfBviIUh5iA8BrBFfX7J9ZYs7PY3EopuSl0Yy8Bny6N81GXdNBu9ezqpmdP91T765xUQzG6RApItwB64p71OMXfJ702gO+arq6/sFsphSqsve7m5p1Ezka/qu1jJMtVSzQVvJcVjtAFF3gMgEQLxKN35AmfFHFNuXY5Ji0NouojPGfgpD+PZOLZO+VMHNxFuGi5pYzAF5j7HANE+/6N7twEe0LNkIKViUoT/EZkKxHsANaT7jEIIDdy9SyxDxH8amZnytvTE11tIWyMGW9vd7m09SdEq3IIc6sC2+XFGEUd33NA1l3UDC1P94HhSkFicJSDgcVfH8kccnBkhBRUOu40B1SHn7VV1ytYpbZx36gyBHNLVbp+72lQZpNHf5Q== AzureAD+AlaminJumaMagoti@DESKTOP-8OQV8SV
```

## 🚀 Terraform Deployment

### Step 1: Initialize Terraform

```bash
# Navigate to terraform directory
cd terraform

# Initialize Terraform (downloads providers and modules)
terraform init

# Validate configuration
terraform validate

# Check formatting
terraform fmt -check
```

### Step 2: Plan Deployment

```bash
# Create staging environment plan
terraform plan -var-file="environments/staging.tfvars" -out=staging.tfplan

# Review the plan (optional)
terraform show staging.tfplan
```

### Step 3: Deploy Infrastructure

```bash
# Deploy to staging environment
terraform apply staging.tfplan

# For production deployment
terraform plan -var-file="environments/production.tfvars" -out=production.tfplan
terraform apply production.tfplan
```

## 🏗️ Infrastructure Components

### Core AWS Services Deployed

1. **Networking**
   - VPC with public/private subnets
   - Internet Gateway & NAT Gateways
   - Route Tables & Security Groups

2. **Compute**
   - ECS Fargate clusters
   - Application Load Balancers
   - Auto Scaling Groups

3. **Storage**
   - RDS PostgreSQL (Multi-AZ for production)
   - DynamoDB tables
   - S3 buckets for static assets

4. **Security**
   - AWS WAF for application protection
   - Cognito for user authentication
   - Secrets Manager for sensitive data
   - Bastion host for secure access

5. **Monitoring & Backup**
   - CloudWatch monitoring
   - AWS Backup for automated backups
   - Cross-region backup replication

6. **Content Delivery**
   - CloudFront CDN
   - Route53 DNS management

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

The CI/CD pipeline automatically:

1. **Test Phase**
   - Runs unit tests for backend/frontend
   - Validates Terraform configurations
   - Security scanning with Trivy

2. **Build Phase**
   - Builds Docker images
   - Pushes to Amazon ECR
   - Creates deployment artifacts

3. **Deploy Phase**
   - Deploys to staging environment
   - Runs integration tests
   - Manual approval for production
   - Blue-green deployment to production

### Triggering Deployments

- **Automatic**: Push to `main` or `develop` branches
- **Manual**: Dispatch workflow from GitHub Actions tab

## 🛠️ Development Workflow

### Local Development

```bash
# Start frontend development server
cd frontend
npm install
npm start

# Start backend development server
cd backend
npm install
npm start

# Run tests
make test

# Build Docker images locally
make build

# Deploy to staging
make deploy-staging
```

## 🔍 Monitoring & Troubleshooting

### Health Checks

```bash
# Check application health
curl https://your-domain/health

# Check infrastructure status
aws ecs describe-services --cluster prodready-infra-cluster

# Check RDS status
aws rds describe-db-instances --db-instance-identifier prodready-infra-db
```

### Common Issues

1. **Terraform State Lock**
   ```bash
   # Force unlock if needed
   terraform force-unlock <LOCK_ID>
   ```

2. **ECR Authentication**
   ```bash
   # Login to ECR
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 631876831364.dkr.ecr.us-east-1.amazonaws.com
   ```

3. **Bastion Host Access**
   ```bash
   # Connect to bastion host
   ssh -i ~/.ssh/prodready_infra_key ec2-user@<bastion-ip>
   ```

## 🏷️ Environment Management

### Staging Environment
- **Purpose**: Testing and validation
- **Resources**: Smaller instance sizes, single AZ
- **Access**: Development team
- **Auto-scaling**: Limited

### Production Environment
- **Purpose**: Live application serving users
- **Resources**: Production-grade instance sizes, Multi-AZ
- **Access**: Restricted, requires approval
- **Auto-scaling**: Full capability
- **Backup**: Daily automated backups

## 📝 Maintenance Tasks

### Regular Tasks

1. **Weekly**
   - Review CloudWatch metrics
   - Check security scan results
   - Validate backup completion

2. **Monthly**
   - Update dependencies
   - Review and rotate secrets
   - Capacity planning review

3. **Quarterly**
   - Security audit
   - Cost optimization review
   - Disaster recovery testing

## 🆘 Emergency Procedures

### Rollback Deployment

```bash
# Rollback to previous version
terraform apply -var-file="environments/production.tfvars" -target=module.ecs

# Or use GitHub Actions to redeploy previous version
```

### Disaster Recovery

1. **Database Recovery**
   ```bash
   # Restore from backup
   aws rds restore-db-instance-from-db-snapshot --db-instance-identifier prodready-infra-db-restored --db-snapshot-identifier <snapshot-id>
   ```

2. **Cross-Region Failover**
   - Update Route53 records to secondary region
   - Restore data from cross-region backups
   - Update application configuration

## 🔧 Troubleshooting Common Issues

### AWS Authentication Problems

#### Issue: "InvalidClientTokenId" Error
```bash
An error occurred (InvalidClientTokenId) when calling the GetCallerIdentity operation: 
The security token included in the request is invalid.
```

**Solutions:**
1. **Check if credentials are set:**
   ```bash
   aws configure list
   ```

2. **Reconfigure credentials:**
   ```bash
   aws configure set aws_access_key_id "YOUR_ACCESS_KEY"
   aws configure set aws_secret_access_key "YOUR_SECRET_KEY"
   ```

3. **Verify credentials work:**
   ```bash
   aws sts get-caller-identity
   ```

#### Issue: "SignatureDoesNotMatch" Error
```bash
An error occurred (SignatureDoesNotMatch) when calling the GetCallerIdentity operation: 
The request signature we calculated does not match the signature you provided.
```

**Solutions:**
1. **Double-check secret access key** - no extra spaces or characters
2. **Regenerate access keys** from IAM console if keys are corrupted
3. **Check system clock** - AWS requires accurate time synchronization

#### Issue: SSH Key Permission Denied
```bash
Permission denied (publickey)
```

**Solutions:**
1. **Check key permissions:**
   ```bash
   chmod 600 ~/.ssh/prodready_infra_key
   chmod 644 ~/.ssh/prodready_infra_key.pub
   ```

2. **Verify key format** - ensure no extra characters in GitHub secrets
3. **Test SSH connection:**
   ```bash
   ssh -i ~/.ssh/prodready_infra_key -o ConnectTimeout=10 ec2-user@<bastion-ip>
   ```

### Terraform State Issues

#### Issue: State File Locked
```bash
Error: Error locking state: Error acquiring the state lock
```

**Solutions:**
1. **Wait for lock to expire** (usually 15 minutes)
2. **Force unlock** (use with caution):
   ```bash
   terraform force-unlock <LOCK_ID>
   ```

#### Issue: State File Corrupted
**Solutions:**
1. **Restore from S3 version:**
   ```bash
   aws s3api list-object-versions --bucket prodready-infra-terraform-state-631876831364 --prefix terraform.tfstate
   aws s3api get-object --bucket prodready-infra-terraform-state-631876831364 --key terraform.tfstate --version-id <VERSION_ID> terraform.tfstate.backup
   ```

### GitHub Actions Failures

#### Issue: Secrets Not Found
**Check:**
1. Secrets are properly named (case-sensitive)
2. All required secrets are added to repository
3. Repository has correct permissions

#### Issue: ECR Authentication Failed
**Solution:**
```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 631876831364.dkr.ecr.us-east-1.amazonaws.com
```

### Infrastructure Access Issues

#### Issue: Cannot Connect to RDS
**Check:**
1. Security group allows connection from your IP/bastion
2. Database is in correct subnet group
3. VPC networking is properly configured

#### Issue: Load Balancer Health Check Failing
**Solutions:**
1. **Check application health endpoint:**
   ```bash
   curl http://localhost:3000/health
   ```
2. **Verify security group rules**
3. **Check CloudWatch logs for application errors**

## 📚 Additional Resources

- [Terraform AWS Provider Documentation](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [ECS Best Practices](https://docs.aws.amazon.com/AmazonECS/latest/bestpracticesguide/)

## 📞 Support

For issues or questions:
- Check GitHub Issues for known problems
- Review CloudWatch logs for application errors
- Contact DevOps team for infrastructure issues

---

**Last Updated**: September 29, 2025  
**Version**: 1.0  
**Maintained by**: DevOps Team