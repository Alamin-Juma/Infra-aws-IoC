output "alarms_topic_arn" {
  description = "ARN of the SNS topic for alarms"
  value       = aws_sns_topic.alarms.arn
}

output "dashboard_name" {
  description = "Name of the CloudWatch dashboard"
  value       = var.create_dashboard ? aws_cloudwatch_dashboard.main[0].dashboard_name : null
}

output "backend_log_group_name" {
  description = "Backend CloudWatch log group name"
  value       = aws_cloudwatch_log_group.ecs_backend.name
}

output "frontend_log_group_name" {
  description = "Frontend CloudWatch log group name"
  value       = aws_cloudwatch_log_group.ecs_frontend.name
}

output "logs_archive_bucket" {
  description = "S3 bucket for log archiving (if enabled)"
  value       = var.enable_s3_log_archive ? aws_s3_bucket.logs_archive[0].id : null
}