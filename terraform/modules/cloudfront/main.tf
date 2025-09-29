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

# Origin Request Policy for API
resource "aws_cloudfront_origin_request_policy" "api" {
  name    = "${var.project_name}-api-origin-request-policy"
  comment = "Origin Request Policy for API endpoints"
  
  cookies_config {
    cookie_behavior = "all"
  }
  
  headers_config {
    header_behavior = "whitelist"
    headers {
      items = ["Authorization", "Host", "Origin", "Referer"]
    }
  }
  
  query_strings_config {
    query_string_behavior = "all"
  }
}

# Cache Policy for static assets
resource "aws_cloudfront_cache_policy" "static" {
  name        = "${var.project_name}-static-cache-policy"
  comment     = "Cache policy for static assets"
  
  default_ttl = var.cache_settings["static"].default_ttl
  min_ttl     = var.cache_settings["static"].min_ttl
  max_ttl     = var.cache_settings["static"].max_ttl
  
  parameters_in_cache_key_and_forwarded_to_origin {
    enable_accept_encoding_brotli = true
    enable_accept_encoding_gzip   = true
    
    cookies_config {
      cookie_behavior = "none"
    }
    
    headers_config {
      header_behavior = "none"
    }
    
    query_strings_config {
      query_string_behavior = "none"
    }
  }
}

# Cache Policy for dynamic content
resource "aws_cloudfront_cache_policy" "dynamic" {
  name        = "${var.project_name}-dynamic-cache-policy"
  comment     = "Cache policy for dynamic content"
  
  default_ttl = var.cache_settings["dynamic"].default_ttl
  min_ttl     = var.cache_settings["dynamic"].min_ttl
  max_ttl     = var.cache_settings["dynamic"].max_ttl
  
  parameters_in_cache_key_and_forwarded_to_origin {
    enable_accept_encoding_brotli = true
    enable_accept_encoding_gzip   = true
    
    cookies_config {
      cookie_behavior = "all"
    }
    
    headers_config {
      header_behavior = "whitelist"
      headers {
        items = ["Authorization", "Host"]
      }
    }
    
    query_strings_config {
      query_string_behavior = "all"
    }
  }
}

# Response Headers Policy
resource "aws_cloudfront_response_headers_policy" "security_headers" {
  name    = "${var.project_name}-security-headers-policy"
  comment = "Security headers policy"
  
  security_headers_config {
    content_security_policy {
      content_security_policy = "default-src 'self'; img-src 'self' data:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self'; connect-src 'self' *.amazonaws.com;"
      override                = true
    }
    
    content_type_options {
      override = true
    }
    
    frame_options {
      frame_option = "DENY"
      override     = true
    }
    
    referrer_policy {
      referrer_policy = "same-origin"
      override        = true
    }
    
    strict_transport_security {
      access_control_max_age_sec = 31536000
      include_subdomains         = true
      preload                    = true
      override                   = true
    }
    
    xss_protection {
      mode_block = true
      protection = true
      override   = true
    }
  }
}

# CloudFront Distribution
resource "aws_cloudfront_distribution" "main" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "${var.project_name} distribution for ${var.environment}"
  default_root_object = "index.html"
  price_class         = var.price_class
  
  # API Origin
  origin {
    domain_name = var.lb_domain_name
    origin_id   = "api"
    
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only" # Change to https-only if ALB has HTTPS listener
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }
  
  # S3 Origin for static assets
  origin {
    domain_name = var.s3_domain_name
    origin_id   = "s3"
    
    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.main.cloudfront_access_identity_path
    }
  }
  
  # Default Behavior for frontend static assets
  default_cache_behavior {
    allowed_methods          = ["GET", "HEAD", "OPTIONS"]
    cached_methods           = ["GET", "HEAD", "OPTIONS"]
    target_origin_id         = "s3"
    viewer_protocol_policy   = "redirect-to-https"
    compress                 = true
    cache_policy_id          = aws_cloudfront_cache_policy.static.id
    response_headers_policy_id = aws_cloudfront_response_headers_policy.security_headers.id
  }
  
  # API Paths Behavior
  ordered_cache_behavior {
    path_pattern             = "/api/*"
    allowed_methods          = var.allowed_methods
    cached_methods           = ["GET", "HEAD", "OPTIONS"]
    target_origin_id         = "api"
    viewer_protocol_policy   = "redirect-to-https"
    compress                 = true
    cache_policy_id          = aws_cloudfront_cache_policy.dynamic.id
    origin_request_policy_id = aws_cloudfront_origin_request_policy.api.id
  }
  
  # Custom Error Responses for SPA routing
  custom_error_response {
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 10
  }
  
  custom_error_response {
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 10
  }
  
  # Domain Name Settings
  aliases = length(var.domain_names) > 0 && var.acm_certificate_arn != "" ? var.domain_names : []
  
  # SSL Certificate
  dynamic "viewer_certificate" {
    for_each = var.acm_certificate_arn != "" ? [1] : []
    
    content {
      acm_certificate_arn      = var.acm_certificate_arn
      ssl_support_method       = "sni-only"
      minimum_protocol_version = "TLSv1.2_2021"
    }
  }
  
  dynamic "viewer_certificate" {
    for_each = var.acm_certificate_arn == "" ? [1] : []
    
    content {
      cloudfront_default_certificate = true
    }
  }
  
  # Geo Restrictions
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
  
  tags = {
    Name        = "${var.project_name}-cloudfront"
    Environment = var.environment
  }
}

# Origin Access Identity for S3
resource "aws_cloudfront_origin_access_identity" "main" {
  comment = "OAI for ${var.project_name} ${var.environment} S3 bucket"
}

# S3 Bucket Policy to allow CloudFront access
data "aws_iam_policy_document" "s3_cloudfront_access" {
  statement {
    actions   = ["s3:GetObject"]
    resources = ["arn:aws:s3:::${var.s3_domain_name}/*"]
    
    principals {
      type        = "AWS"
      identifiers = [aws_cloudfront_origin_access_identity.main.iam_arn]
    }
  }
}

# Outputs
output "distribution_id" {
  description = "ID of the CloudFront distribution"
  value       = aws_cloudfront_distribution.main.id
}

output "domain_name" {
  description = "Domain name of the CloudFront distribution"
  value       = aws_cloudfront_distribution.main.domain_name
}

output "hosted_zone_id" {
  description = "Route 53 hosted zone ID of the CloudFront distribution"
  value       = aws_cloudfront_distribution.main.hosted_zone_id
}

output "origin_access_identity" {
  description = "CloudFront Origin Access Identity"
  value       = aws_cloudfront_origin_access_identity.main.cloudfront_access_identity_path
}

output "s3_policy_document" {
  description = "IAM policy document for S3 bucket"
  value       = data.aws_iam_policy_document.s3_cloudfront_access.json
}