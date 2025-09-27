variable "environment" {
  description = "Environment name"
  type        = string
}

variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "secrets" {
  description = "Map of secrets to store in AWS Secrets Manager"
  type = map(object({
    description = string
    secret_value = string
  }))
  sensitive = true
}

# Secrets Manager secrets
resource "aws_secretsmanager_secret" "app_secrets" {
  for_each = var.secrets
  
  name        = "${var.project_name}/${var.environment}/${each.key}"
  description = each.value.description
  
  tags = {
    Name        = "${var.project_name}-${each.key}"
    Environment = var.environment
  }
}

resource "aws_secretsmanager_secret_version" "app_secrets" {
  for_each = var.secrets
  
  secret_id     = aws_secretsmanager_secret.app_secrets[each.key].id
  secret_string = each.value.secret_value
}

# IAM role for ECS tasks to access secrets
resource "aws_iam_role" "secrets_access_role" {
  name = "${var.project_name}-secrets-access-${var.environment}"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = [
            "ecs-tasks.amazonaws.com",
            "lambda.amazonaws.com"
          ]
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "secrets_access_policy" {
  name = "${var.project_name}-secrets-access-policy-${var.environment}"
  role = aws_iam_role.secrets_access_role.id
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ]
        Resource = [
          for secret in aws_secretsmanager_secret.app_secrets :
          secret.arn
        ]
      }
    ]
  })
}

# Output secret ARNs for use by other modules
output "secret_arns" {
  description = "ARNs of the created secrets"
  value = {
    for k, v in aws_secretsmanager_secret.app_secrets :
    k => v.arn
  }
}

output "secrets_access_role_arn" {
  description = "ARN of the IAM role for accessing secrets"
  value       = aws_iam_role.secrets_access_role.arn
}