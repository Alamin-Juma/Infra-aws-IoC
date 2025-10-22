# modules/monitoring/main.tf

# SNS Topic for alarms (always present in module)
resource "aws_sns_topic" "alarms" {
  name = "${var.project_name}-alarms-${var.environment}"

  tags = {
    Name        = "${var.project_name}-alarms"
    Environment = var.environment
  }
}

# SNS Topic subscriptions for email notifications (if any)
resource "aws_sns_topic_subscription" "email_subscriptions" {
  count     = length(var.notification_emails)
  topic_arn = aws_sns_topic.alarms.arn
  protocol  = "email"
  endpoint  = var.notification_emails[count.index]
}

# CloudWatch Log Groups (always present so outputs can safely reference)
resource "aws_cloudwatch_log_group" "ecs_frontend" {
  name              = "/ecs/${var.project_name}-frontend-${var.environment}"
  retention_in_days = var.log_retention_days

  tags = {
    Name        = "${var.project_name}-frontend-logs"
    Environment = var.environment
    CostCenter  = "monitoring"
  }
}

resource "aws_cloudwatch_log_group" "ecs_backend" {
  name              = "/ecs/${var.project_name}-backend-${var.environment}"
  retention_in_days = var.log_retention_days

  tags = {
    Name        = "${var.project_name}-backend-logs"
    Environment = var.environment
    CostCenter  = "monitoring"
  }
}

# ECS alarms (only created when enable_all_alarms = true)
resource "aws_cloudwatch_metric_alarm" "ecs_cpu" {
  for_each = var.enable_all_alarms ? toset(var.service_names) : toset([])
  alarm_name          = "${each.value}-cpu-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "CPU utilization is too high for service ${each.value}"

  dimensions = {
    ClusterName = var.cluster_name
    ServiceName = each.value
  }

  alarm_actions = [aws_sns_topic.alarms.arn]
  ok_actions    = [aws_sns_topic.alarms.arn]

  tags = {
    Name        = "${each.value}-cpu-alarm"
    Environment = var.environment
  }
}

resource "aws_cloudwatch_metric_alarm" "ecs_memory" {
  for_each = var.enable_all_alarms ? toset(var.service_names) : toset([])
  alarm_name          = "${each.value}-memory-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "MemoryUtilization"
  namespace           = "AWS/ECS"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "Memory utilization is too high for service ${each.value}"

  dimensions = {
    ClusterName = var.cluster_name
    ServiceName = each.value
  }

  alarm_actions = [aws_sns_topic.alarms.arn]
  ok_actions    = [aws_sns_topic.alarms.arn]

  tags = {
    Name        = "${each.value}-memory-alarm"
    Environment = var.environment
  }
}

# RDS alarms controlled by db_instance_id and enable_all_alarms
resource "aws_cloudwatch_metric_alarm" "rds_cpu" {
  count = var.db_instance_id != "" ? 1 : 0

  alarm_name          = "${var.project_name}-rds-cpu-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "CPU utilization is too high for RDS instance"

  dimensions = {
    DBInstanceIdentifier = var.db_instance_id
  }

  alarm_actions = [aws_sns_topic.alarms.arn]
  ok_actions    = [aws_sns_topic.alarms.arn]

  tags = {
    Name        = "${var.project_name}-rds-cpu-alarm"
    Environment = var.environment
  }
}

resource "aws_cloudwatch_metric_alarm" "rds_freeable_memory" {
  count = var.db_instance_id != "" && var.enable_all_alarms ? 1 : 0

  alarm_name          = "${var.project_name}-rds-memory-${var.environment}"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 3
  metric_name         = "FreeableMemory"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  threshold           = 1000000000  # 1GB in bytes
  alarm_description   = "Freeable memory is too low for RDS instance"

  dimensions = {
    DBInstanceIdentifier = var.db_instance_id
  }

  alarm_actions = [aws_sns_topic.alarms.arn]
  ok_actions    = [aws_sns_topic.alarms.arn]

  tags = {
    Name        = "${var.project_name}-rds-memory-alarm"
    Environment = var.environment
  }
}

resource "aws_cloudwatch_metric_alarm" "rds_disk_queue_depth" {
  count = var.db_instance_id != "" && var.enable_all_alarms ? 1 : 0

  alarm_name          = "${var.project_name}-rds-disk-queue-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "DiskQueueDepth"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  threshold           = 10
  alarm_description   = "Disk queue depth is too high for RDS instance"

  dimensions = {
    DBInstanceIdentifier = var.db_instance_id
  }

  alarm_actions = [aws_sns_topic.alarms.arn]
  ok_actions    = [aws_sns_topic.alarms.arn]

  tags = {
    Name        = "${var.project_name}-rds-disk-queue-alarm"
    Environment = var.environment
  }
}

# Lambda alarms
