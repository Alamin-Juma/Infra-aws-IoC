# Common Variables (Non-Sensitive)
# Environment: Staging

# AWS Configuration
aws_region = "us-east-1"
environment = "staging"
project_name = "prodready-infra"

# VPC Configuration
vpc_cidr = "10.1.0.0/16"  # Different CIDR for staging
az_count = 2
public_subnets = ["10.1.1.0/24", "10.1.2.0/24"]
private_subnets = ["10.1.10.0/24", "10.1.11.0/24"]

# Application Configuration
app_port = 8080
health_check_path = "/health"

# Security Configuration (Restricted for staging)
allowed_ips = ["10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16"]  # Private networks only
allowed_domains = ["staging.prodready-infra.com"]

# Database Configuration (Non-Sensitive)
db_name = "prodready_infra_staging"
db_instance_class = "db.t3.micro"  # Smaller instance for staging

# ECS Configuration (Smaller for staging)
ecs_desired_count = 1
ecs_cpu = 256
ecs_memory = 512

# Notification
notification_emails = ["dev-alerts@prodready-infra.com"]

# DNS Configuration
domain_names = ["staging.prodready-infra.com"]

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