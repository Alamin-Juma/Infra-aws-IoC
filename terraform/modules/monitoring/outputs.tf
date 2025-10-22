# modules/monitoring/outputs.tf
output "alarms_topic_arn" {
  description = "SNS topic ARN for alarms"
  value       = aws_sns_topic.alarms.arn
}

output "backend_log_group_name" {
  description = "Backend CloudWatch Log Group name"
  value       = aws_cloudwatch_log_group.ecs_backend.name
}

output "frontend_log_group_name" {
  description = "Frontend CloudWatch Log Group name"
  value       = aws_cloudwatch_log_group.ecs_frontend.name
}

output "dashboard_name" {
  description = "CloudWatch dashboard name (if created)"
  value       = length(aws_cloudwatch_dashboard.main) > 0 ? aws_cloudwatch_dashboard.main[0].dashboard_name : ""
}
