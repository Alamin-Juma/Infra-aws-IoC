variable "user_pool_name" {
  description = "Name of the Cognito User Pool"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "allowed_domains" {
  description = "List of domains allowed for email sign-up"
  type        = list(string)
  default     = []
}

# Cognito User Pool
resource "aws_cognito_user_pool" "main" {
  name = var.user_pool_name
  
  # Username attributes and aliases
  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]
  
  # Password policy
  password_policy {
    minimum_length                   = 8
    require_lowercase                = true
    require_uppercase                = true
    require_numbers                  = true
    require_symbols                  = true
    temporary_password_validity_days = 7
  }
  
  # MFA configuration
  mfa_configuration = "OPTIONAL"
  
  software_token_mfa_configuration {
    enabled = true
  }
  
  # Account recovery setting
  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }
  
  # Email configuration
  email_configuration {
    email_sending_account = "COGNITO_DEFAULT"
  }
  
  # Advanced security features
  user_pool_add_ons {
    advanced_security_mode = "AUDIT"
  }
  
  # Schema attributes
  schema {
    name                     = "email"
    attribute_data_type      = "String"
    developer_only_attribute = false
    mutable                  = true
    required                 = true
    
    string_attribute_constraints {
      min_length = 5
      max_length = 255
    }
  }
  
  schema {
    name                     = "name"
    attribute_data_type      = "String"
    developer_only_attribute = false
    mutable                  = true
    required                 = false
    
    string_attribute_constraints {
      min_length = 1
      max_length = 255
    }
  }
  
  schema {
    name                     = "role"
    attribute_data_type      = "String"
    developer_only_attribute = false
    mutable                  = true
    required                 = false
    
    string_attribute_constraints {
      min_length = 1
      max_length = 255
    }
  }
  
  # Lambda triggers if needed
  # lambda_config {
  #   pre_sign_up = aws_lambda_function.pre_sign_up.arn
  # }
  
  tags = {
    Name        = var.user_pool_name
    Environment = var.environment
  }
}

# App Client
resource "aws_cognito_user_pool_client" "client" {
  name                = "${var.project_name}-client"
  user_pool_id        = aws_cognito_user_pool.main.id
  
  # OAuth settings
  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_flows                  = ["code", "implicit"]
  allowed_oauth_scopes                 = ["phone", "email", "openid", "profile", "aws.cognito.signin.user.admin"]
  callback_urls                        = ["https://example.com/callback", "http://localhost:3000/callback"]
  logout_urls                          = ["https://example.com/logout", "http://localhost:3000/logout"]
  
  # Token configuration
  id_token_validity                     = 60 # minutes
  access_token_validity                 = 60 # minutes
  refresh_token_validity                = 30 # days
  prevent_user_existence_errors         = "ENABLED"
  enable_token_revocation               = true
  
  # Auth flows
  explicit_auth_flows = [
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_ADMIN_USER_PASSWORD_AUTH"
  ]
  
  # Read/write attributes
  read_attributes  = ["email", "email_verified", "name", "role", "updated_at"]
  write_attributes = ["email", "name", "role", "updated_at"]
  
  # Don't generate a client secret for web applications
  generate_secret = false
}

# User Pool Domain
resource "aws_cognito_user_pool_domain" "main" {
  domain       = "${var.project_name}-${var.environment}"
  user_pool_id = aws_cognito_user_pool.main.id
}

# Resource server for custom scopes
resource "aws_cognito_resource_server" "resource" {
  identifier   = "https://api.${var.project_name}.com"
  name         = "${var.project_name}-api"
  user_pool_id = aws_cognito_user_pool.main.id
  
  scope {
    scope_name        = "read"
    scope_description = "Read access"
  }
  
  scope {
    scope_name        = "write"
    scope_description = "Write access"
  }
  
  scope {
    scope_name        = "admin"
    scope_description = "Admin access"
  }
}

# User group for admins
resource "aws_cognito_user_group" "admin" {
  name         = "admin"
  user_pool_id = aws_cognito_user_pool.main.id
  description  = "Admin users"
  precedence   = 1
}

# User group for standard users
resource "aws_cognito_user_group" "user" {
  name         = "user"
  user_pool_id = aws_cognito_user_pool.main.id
  description  = "Standard users"
  precedence   = 2
}

# Outputs
output "user_pool_id" {
  description = "ID of the Cognito User Pool"
  value       = aws_cognito_user_pool.main.id
}

output "user_pool_arn" {
  description = "ARN of the Cognito User Pool"
  value       = aws_cognito_user_pool.main.arn
}

output "user_pool_client_id" {
  description = "ID of the Cognito User Pool Client"
  value       = aws_cognito_user_pool_client.client.id
}

output "user_pool_domain" {
  description = "Domain of the Cognito User Pool"
  value       = aws_cognito_user_pool_domain.main.domain
}