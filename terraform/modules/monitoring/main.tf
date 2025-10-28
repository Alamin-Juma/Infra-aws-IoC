resource "aws_cloudwatch_log_group" "ecs_logs" {
  name              = "/ecs/${var.project_name}-${var.environment}"
  retention_in_days = 7

  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}

# SNS Topic for Alarms
resource "aws_sns_topic" "alarms" {
  name = "${var.project_name}-alarms-${var.environment}"

  tags = {
    Name        = "${var.project_name}-alarms"
    Environment = var.environment
  }
}

# SNS Topic Subscriptions
resource "aws_sns_topic_subscription" "email_subscriptions" {
  count     = length(var.notification_emails)
  topic_arn = aws_sns_topic.alarms.arn
  protocol  = "email"
  endpoint  = var.notification_emails[count.index]
}

# ECS Combined CPU Alarm
resource "aws_cloudwatch_metric_alarm" "ecs_combined_cpu" {
  alarm_name          = "${var.project_name}-ecs-high-cpu-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = var.alarm_evaluation_periods
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = var.alarm_period
  statistic           = "Average"
  threshold           = var.cpu_threshold
  alarm_description   = "This metric monitors ECS CPU utilization"
  alarm_actions       = [aws_sns_topic.alarms.arn]

  dimensions = {
    ClusterName = var.cluster_name
  }

  tags = {
    Name        = "${var.project_name}-ecs-cpu-alarm"
    Environment = var.environment
  }
}

# CloudWatch Dashboard
resource "aws_cloudwatch_dashboard" "ecs_dashboard" {
  dashboard_name = "${var.project_name}-ecs-${var.environment}"

  dashboard_body = jsonencode({
    widgets = [
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/ECS", "CPUUtilization", { stat = "Average" }],
            [".", "MemoryUtilization", { stat = "Average" }]
          ]
          period = 300
          stat   = "Average"
          region = "us-east-1"
          title  = "ECS Metrics"
        }
      }
    ]
  })
}




