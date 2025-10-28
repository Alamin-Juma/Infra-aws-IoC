output "ecs_log_group_name" {
  description = "ECS log group name"
  value       = aws_cloudwatch_log_group.ecs_logs.name
}

output "alarms_topic_arn" {
  description = "SNS Topic ARN for ECS alarms"
  value       = aws_sns_topic.alarms.arn
}

output "dashboard_name" {
  description = "Global ECS CloudWatch dashboard name"
  value       = var.create_dashboard ? aws_cloudwatch_dashboard.ecs_dashboard[0].dashboard_name : null
}
