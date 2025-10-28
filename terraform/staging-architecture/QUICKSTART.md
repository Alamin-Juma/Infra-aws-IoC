# Quick Start: Creating ITrack-Staging-Environment-Role

This guide provides the fastest way to create the IAM role needed for deploying the ITrack staging infrastructure.

## ⚡ 5-Minute Setup (Using Terraform)

### Prerequisites
- AWS CLI configured with admin permissions
- Terraform installed

### Steps

1. **Navigate to the directory:**
   ```bash
   cd terraform/staging-architecture
   ```

2. **Initialize Terraform:**
   ```bash
   terraform init
   ```

3. **Review the plan:**
   ```bash
   terraform plan
   ```

4. **Create the role:**
   ```bash
   terraform apply
   ```
   Type `yes` when prompted.

5. **Save the output:**
   ```bash
   terraform output deployment_role_arn
   ```
   Copy the ARN - you'll need it for GitHub Actions.

### What Gets Created?
- ✅ GitHub OIDC provider
- ✅ IAM role: `ITrack-Staging-Environment-Role`
- ✅ IAM policy: `ITrack-Staging-Deployment-Policy` (with 18 service permissions)
- ✅ Policy attachment to role

---

## 🖱️ Alternative: AWS Console (15 Minutes)

### Step 1: Create OIDC Provider
1. Go to **IAM** → **Identity providers** → **Add provider**
2. Select **OpenID Connect**
3. Provider URL: `https://token.actions.githubusercontent.com`
4. Audience: `sts.amazonaws.com`
5. Click **Add provider**

### Step 2: Create Policy
1. Go to **IAM** → **Policies** → **Create policy**
2. Click **JSON** tab
3. Copy content from `deployment-policy.json`
4. Paste it
5. Name: `ITrack-Staging-Deployment-Policy`
6. Click **Create policy**

### Step 3: Create Role
1. Go to **IAM** → **Roles** → **Create role**
2. Select **Web identity**
3. Identity provider: token.actions.githubusercontent.com
4. Audience: sts.amazonaws.com
5. GitHub organization: `GRIFFINGlobalTech`
6. GitHub repository: `rs-feb-25`
7. Click **Next**
8. Search and select `ITrack-Staging-Deployment-Policy`
9. Click **Next**
10. Role name: `ITrack-Staging-Environment-Role`
11. Click **Create role**

### Step 4: Get Role ARN
1. Search for: `ITrack-Staging-Environment-Role`
2. Copy the ARN
3. Save it for GitHub Actions configuration

---

## 🔧 Configure GitHub Actions

### Update Workflow File

Edit `.github/workflows/staging.yml`:

```yaml
jobs:
  terraform-plan:
    name: Terraform Plan
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
          role-session-name: GitHubActions-Staging
```

**Important:** Add `permissions` block with `id-token: write` for OIDC to work!

---

## ✅ Verify Setup

Test the role:

```bash
# Assume the role (test)
aws sts assume-role \
  --role-arn arn:aws:iam::875486186130:role/ITrack-Staging-Environment-Role \
  --role-session-name test

# Test ECS permissions
aws ecs list-clusters --region us-east-1

# Test ECR permissions
aws ecr describe-repositories --region us-east-1
```

---

## 🎯 Next Steps

1. ✅ Role created
2. ✅ GitHub Actions configured
3. **Now:** Deploy infrastructure
   ```bash
   cd terraform
   terraform init -backend-config="environments/staging.backend.conf"
   terraform apply -var-file="environments/staging.tfvars"
   ```

---

## 📖 Need More Details?

- **Full Architecture:** See `ARCHITECTURE.md`
- **Detailed IAM Setup:** See `IAM-ROLE-SETUP.md`
- **Complete Guide:** See `README.md`

---

## 🆘 Troubleshooting

### Error: "No OIDC provider found"
**Fix:** Create the OIDC provider first (see Alternative Step 1)

### Error: "Access Denied"
**Fix:** Ensure your AWS user has IAM permissions to create roles and policies

### Error: "Invalid trust policy"
**Fix:** Use the exact trust policy from `iam-role.tf` or `IAM-ROLE-SETUP.md`

---

## 📋 Command Cheatsheet

```bash
# Create role with Terraform
cd terraform/staging-architecture
terraform init && terraform apply

# Get role ARN
terraform output deployment_role_arn

# Verify role
aws iam get-role --role-name ITrack-Staging-Environment-Role

# List attached policies
aws iam list-attached-role-policies --role-name ITrack-Staging-Environment-Role

# Test role assumption
aws sts assume-role \
  --role-arn $(terraform output -raw deployment_role_arn) \
  --role-session-name test-session
```

---

**Time to Complete:** 5-15 minutes  
**Difficulty:** Easy  
**Prerequisites:** AWS access, Terraform (optional)
