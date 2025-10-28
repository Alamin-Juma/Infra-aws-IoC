variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "lb_domain_name" {
  description = "Domain name of the load balancer for API origin"
  type        = string
}

variable "s3_domain_name" {
  description = "Domain name of the S3 bucket for static assets origin"
  type        = string
}

variable "s3_bucket_id" {
  description = "ID of the S3 bucket for static assets"
  type        = string
}

variable "s3_bucket_arn" {
  description = "ARN of the S3 bucket for static assets"
  type        = string
}

variable "cache_settings" {
  description = "Cache settings for different paths"
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

variable "allowed_methods" {
  description = "HTTP methods to allow"
  type        = list(string)
  default     = ["GET", "HEAD"]
}

variable "acm_certificate_arn" {
  description = "ARN of the ACM certificate for CloudFront"
  type        = string
  default     = ""
}

variable "domain_names" {
  description = "Domain names for the CloudFront distribution"
  type        = list(string)
  default     = []
}

variable "price_class" {
  description = "CloudFront price class"
  type        = string
  default     = "PriceClass_100" # Use PriceClass_All for global presence
}
