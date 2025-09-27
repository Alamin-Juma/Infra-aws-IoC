variable "environment" {
  description = "Environment name"
  type        = string
}

variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "api_gateway_arn" {
  description = "ARN of the API Gateway to protect"
  type        = string
}

variable "allowed_countries" {
  description = "List of allowed country codes (ISO 3166-1 alpha-2)"
  type        = list(string)
  default     = ["US", "CA", "GB", "AU"]
}

variable "rate_limit" {
  description = "Rate limit per 5-minute window"
  type        = number
  default     = 10000
}

# WAF Web ACL
resource "aws_wafv2_web_acl" "api_protection" {
  name  = "${var.project_name}-api-waf-${var.environment}"
  scope = "REGIONAL"
  
  default_action {
    allow {}
  }

  # Rule 1: Rate limiting
  rule {
    name     = "RateLimitRule"
    priority = 1
    
    override_action {
      none {}
    }
    
    statement {
      rate_based_statement {
        limit              = var.rate_limit
        aggregate_key_type = "IP"
      }
    }
    
    action {
      block {}
    }
    
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                 = "${var.project_name}RateLimit"
      sampled_requests_enabled    = true
    }
  }

  # Rule 2: AWS Managed Core Rule Set
  rule {
    name     = "AWSManagedRulesCommonRuleSet"
    priority = 2
    
    override_action {
      none {}
    }
    
    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesCommonRuleSet"
        vendor_name = "AWS"
      }
    }
    
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                 = "${var.project_name}CommonRuleSet"
      sampled_requests_enabled    = true
    }
  }

  # Rule 3: SQL Injection Protection
  rule {
    name     = "AWSManagedRulesSQLiRuleSet"
    priority = 3
    
    override_action {
      none {}
    }
    
    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesSQLiRuleSet"
        vendor_name = "AWS"
      }
    }
    
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                 = "${var.project_name}SQLiRuleSet"
      sampled_requests_enabled    = true
    }
  }

  # Rule 4: Geographic restriction
  rule {
    name     = "GeoRestrictionRule"
    priority = 4
    
    action {
      block {}
    }
    
    statement {
      geo_match_statement {
        country_codes = var.allowed_countries
      }
    }
    
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                 = "${var.project_name}GeoRestriction"
      sampled_requests_enabled    = true
    }
  }

  # Rule 5: IP Reputation List
  rule {
    name     = "AWSManagedRulesAmazonIpReputationList"
    priority = 5
    
    override_action {
      none {}
    }
    
    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesAmazonIpReputationList"
        vendor_name = "AWS"
      }
    }
    
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                 = "${var.project_name}IpReputationList"
      sampled_requests_enabled    = true
    }
  }

  tags = {
    Name        = "${var.project_name}-waf-${var.environment}"
    Environment = var.environment
  }
  
  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                 = "${var.project_name}WebACL"
    sampled_requests_enabled    = true
  }
}

# Associate WAF with API Gateway
resource "aws_wafv2_web_acl_association" "api_gateway_association" {
  resource_arn = var.api_gateway_arn
  web_acl_arn  = aws_wafv2_web_acl.api_protection.arn
}

# CloudWatch Log Group for WAF logs
resource "aws_cloudwatch_log_group" "waf_logs" {
  name              = "/aws/wafv2/${var.project_name}-${var.environment}"
  retention_in_days = 30
  
  tags = {
    Name        = "${var.project_name}-waf-logs"
    Environment = var.environment
  }
}

# WAF Logging Configuration
resource "aws_wafv2_web_acl_logging_configuration" "waf_logging" {
  resource_arn            = aws_wafv2_web_acl.api_protection.arn
  log_destination_configs = [aws_cloudwatch_log_group.waf_logs.arn]
}

# Outputs
output "web_acl_id" {
  description = "The ID of the WAF WebACL"
  value       = aws_wafv2_web_acl.api_protection.id
}

output "web_acl_arn" {
  description = "The ARN of the WAF WebACL"
  value       = aws_wafv2_web_acl.api_protection.arn
}