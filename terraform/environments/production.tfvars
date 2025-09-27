# Common Variables (Non-Sensitive)
# Environment: Production

# AWS Configuration
aws_region = "us-east-1"
environment = "production"
project_name = "prodready-infra"

# VPC Configuration
vpc_cidr = "10.0.0.0/16"
az_count = 3  # More AZs for production
public_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
private_subnets = ["10.0.10.0/24", "10.0.11.0/24", "10.0.12.0/24"]

# Application Configuration
app_port = 8080
health_check_path = "/health"

# Security Configuration (VPN/Bastion access only)
allowed_ips = ["10.0.100.0/24"]  # VPN subnet only
allowed_domains = ["prodready-infra.com"]

# Database Configuration (Non-Sensitive)
db_name = "prodready_infra_production"
db_instance_class = "db.r5.large"  # Larger instance for production

# ECS Configuration (Production scale)
ecs_desired_count = 3
ecs_cpu = 1024
ecs_memory = 2048

# Notification
notification_emails = ["ops-alerts@prodready-infra.com", "devops@prodready-infra.com"]

# DNS Configuration
domain_names = ["prodready-infra.com", "www.prodready-infra.com"]

# CloudFront Cache Settings
cloudfront_cache_settings = {
  static = {
    min_ttl     = 86400    # 1 day
    default_ttl = 604800   # 1 week
    max_ttl     = 31536000 # 1 year
  }
  dynamic = {
    min_ttl     = 0
    default_ttl = 0
    max_ttl     = 86400    # 1 day
  }
}

# Backup Configuration
enable_cross_region_backup = true
backup_retention_days = 30
cross_region_backup_region = "us-west-2"