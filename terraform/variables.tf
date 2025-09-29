variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-east-1"
}

variable "aws_account_id" {
  description = "AWS account ID"
  type        = string
}

variable "environment" {
  description = "Environment name (e.g., dev, staging, production)"
  type        = string
  default     = "production"
}

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "prodready-infra"
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "az_count" {
  description = "Number of availability zones to use"
  type        = number
  default     = 2
}

variable "public_subnets" {
  description = "CIDR blocks for public subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnets" {
  description = "CIDR blocks for private subnets"
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.11.0/24"]
}

variable "allowed_ips" {
  description = "List of IPs allowed to access resources"
  type        = list(string)
  default     = ["0.0.0.0/0"] # For production, restrict to company IPs or VPN
}

variable "app_port" {
  description = "Port the application runs on"
  type        = number
  default     = 8080
}

variable "health_check_path" {
  description = "Path for health check endpoint"
  type        = string
  default     = "/health"
}

variable "allowed_domains" {
  description = "Domains allowed for Cognito user pool"
  type        = list(string)
  default     = ["example.com"]
}

variable "dynamodb_tables" {
  description = "DynamoDB tables configuration"
  type = list(object({
    name           = string
    hash_key       = string
    range_key      = optional(string)
    billing_mode   = string
    read_capacity  = optional(number)
    write_capacity = optional(number)
    attributes = list(object({
      name = string
      type = string
    }))
    global_secondary_indexes = optional(list(object({
      name               = string
      hash_key           = string
      range_key          = optional(string)
      projection_type    = string
      non_key_attributes = optional(list(string))
      read_capacity      = optional(number)
      write_capacity     = optional(number)
    })))
  }))
  default = [
    {
      name         = "prodready-infra-items"
      hash_key     = "id"
      range_key    = "type"
      billing_mode = "PAY_PER_REQUEST"
      attributes = [
        {
          name = "id"
          type = "S"
        },
        {
          name = "type"
          type = "S"
        }
      ]
    }
  ]
}

variable "db_name" {
  description = "Name of the RDS database"
  type        = string
  default     = "prodready_infra"
}

variable "db_username" {
  description = "Username for RDS database"
  type        = string
  default     = "admin"
  sensitive   = true
}

variable "db_password" {
  description = "Password for RDS database"
  type        = string
  sensitive   = true
}

variable "db_instance_class" {
  description = "RDS instance type"
  type        = string
  default     = "db.t3.small"
}

variable "lambda_functions" {
  description = "Lambda functions configuration"
  type = list(object({
    name          = string
    runtime       = string
    handler       = string
    timeout       = number
    memory_size   = number
    zip_file      = string
    environment_variables = optional(map(string))
  }))
  default = [
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
}

variable "ecs_desired_count" {
  description = "Desired number of ECS tasks"
  type        = number
  default     = 2
}

variable "ecs_cpu" {
  description = "CPU units for ECS task"
  type        = number
  default     = 256
}

variable "ecs_memory" {
  description = "Memory for ECS task (in MiB)"
  type        = number
  default     = 512
}

variable "notification_emails" {
  description = "Emails to receive CloudWatch notifications"
  type        = list(string)
  default     = []
}

variable "cloudfront_cache_settings" {
  description = "CloudFront cache settings"
  type = map(object({
    min_ttl     = number
    default_ttl = number
    max_ttl     = number
  }))
  default = {
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
}

variable "acm_certificate_arn" {
  description = "ARN of ACM certificate for CloudFront"
  type        = string
  default     = ""
}

variable "domain_names" {
  description = "Domain names for the application"
  type        = list(string)
  default     = []
}

# Backup and Disaster Recovery Variables
variable "enable_cross_region_backup" {
  description = "Enable cross-region backup"
  type        = bool
  default     = false
}

variable "cross_region_backup_region" {
  description = "Region for cross-region backups"
  type        = string
  default     = "us-west-2"
}

variable "backup_retention_days" {
  description = "Number of days to retain backups"
  type        = number
  default     = 30
}

# WAF Variables
variable "waf_rate_limit" {
  description = "Rate limit per 5-minute window for WAF"
  type        = number
  default     = 10000
}

variable "waf_allowed_countries" {
  description = "List of allowed country codes for WAF"
  type        = list(string)
  default     = ["US", "CA", "GB", "AU"]
}

# Secrets Manager Variables
variable "sensitive_secrets" {
  description = "Sensitive secrets to store in AWS Secrets Manager"
  type = map(object({
    description = string
    value       = string
  }))
  sensitive = true
  default = {
    db_password = {
      description = "RDS database password"
      value       = "changeme"
    }
    jwt_secret = {
      description = "JWT secret for authentication"
      value       = "changeme"
    }
    api_key = {
      description = "External API key"
      value       = "changeme"
    }
  }
}