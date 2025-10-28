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
