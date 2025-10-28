output "db_instance_id" {
  description = "RDS instance ID"
  value       = aws_db_instance.main.id
}

output "db_instance_endpoint" {
  description = "RDS instance endpoint"
  value       = aws_db_instance.main.endpoint
}

output "db_secret_arn" {
  description = "ARN of the DB credentials secret"
  value       = aws_secretsmanager_secret.db_password.arn
}
