# Common Variables (Non-Sensitive)
# Environment: Staging

# AWS Configuration
aws_region = "us-east-1"
aws_account_id = "875486186130"
environment = "staging"
project_name = "prodready-infra"

# VPC Configuration
vpc_cidr = "10.1.0.0/16"  # Different CIDR for staging
az_count = 2
public_subnets = ["10.1.1.0/24", "10.1.2.0/24"]
private_subnets = ["10.1.10.0/24", "10.1.11.0/24"]

# Application Configuration
app_port = 8080
health_check_path = "/api/health"

# Security Configuration (Restricted for staging)
allowed_ips = ["10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16"]  # Private networks only
allowed_domains = ["staging.prodready-infra.com"]

# Database Configuration (Non-Sensitive)
db_name = "prodready_infra_staging"
db_instance_class = "db.t3.micro"  # Smaller instance for staging
# Note: db_password should be set via environment variable or AWS Secrets Manager
# Export TF_VAR_db_password="your_password_here" or use AWS Secrets Manager

# ECS Configuration (Smaller for staging)
ecs_desired_count = 1
ecs_cpu = 256
ecs_memory = 512

# Notification
notification_emails = ["dev-alerts@prodready-infra.com"]

# DNS Configuration (disabled for initial deployment)
domain_names = []

# CloudFront Cache Settings
cloudfront_cache_settings = {
  static = {
    min_ttl     = 60      # Shorter cache for staging
    default_ttl = 300     # 5 minutes
    max_ttl     = 3600    # 1 hour
  }
  dynamic = {
    min_ttl     = 0
    default_ttl = 0
    max_ttl     = 300     # 5 minutes
  }
}

# Database User Configuration (Sensitive data via environment variables)
db_username = "appadmin"
db_password = "TempPassword123!"  # Temporary password for staging deployment
# Note: Set TF_VAR_db_password environment variable for production

# Lambda Functions Configuration
lambda_functions = [
  {
    name        = "prodready-infra-api-handler"
    runtime     = "nodejs16.x"
    handler     = "index.handler"
    timeout     = 30
    memory_size = 128
    zip_file    = "../lambda/prodready-infra-api-handler.zip"
    environment_variables = {
      DYNAMODB_TABLE = "prodready-infra-items"
    }
  }
]

# DynamoDB Tables Configuration
dynamodb_tables = [
  {
    name           = "prodready-infra-items"
    hash_key       = "id"
    range_key      = ""
    billing_mode   = "PAY_PER_REQUEST"
    read_capacity  = 0
    write_capacity = 0
    attributes = [
      {
        name = "id"
        type = "S"
      }
    ]
    global_secondary_indexes = []
  }
]

# Backup Configuration
backup_retention_days = 7
enable_cross_region_backup = false
cross_region_backup_region = "us-west-2"

# WAF Configuration
waf_rate_limit = 10000
waf_allowed_countries = ["US", "CA", "GB", "AU"]

# ACM Certificate (empty for initial deployment)
acm_certificate_arn = ""

# Existing variables (keep these)
project_name = "prodready-infra"
environment  = "production"
aws_region   = "us-east-1"

# Cost-optimized monitoring for production
log_retention_days         = 7      # 7 days in CloudWatch (free tier)
enable_s3_log_archive      = true   # Archive to S3 for compliance
s3_log_transition_days     = 7      # Move to S3 after 7 days
s3_log_expiration_days     = 365    # Keep for 1 year
enable_detailed_monitoring = false  # Still disabled to save costs
enable_all_alarms          = true   # All alarms for production

# Notification emails
notification_emails = ["your-email@example.com", "team@example.com"]