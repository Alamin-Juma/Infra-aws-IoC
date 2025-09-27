variable "environment" {
  description = "Environment name"
  type        = string
}

variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "cluster_name" {
  description = "Name of the ECS cluster"
  type        = string
}

variable "service_names" {
  description = "List of ECS service names"
  type        = list(string)
  default     = []
}

variable "db_instance_id" {
  description = "ID of the RDS instance"
  type        = string
  default     = ""
}

variable "lambda_function_names" {
  description = "List of Lambda function names"
  type        = list(string)
  default     = []
}

variable "api_gateway_name" {
  description = "Name of the API Gateway"
  type        = string
  default     = ""
}

variable "create_dashboard" {
  description = "Whether to create a CloudWatch dashboard"
  type        = bool
  default     = true
}

variable "notification_emails" {
  description = "List of email addresses for notifications"
  type        = list(string)
  default     = []
}

# SNS Topic for alarms
resource "aws_sns_topic" "alarms" {
  name = "${var.project_name}-alarms-${var.environment}"
  
  tags = {
    Name        = "${var.project_name}-alarms"
    Environment = var.environment
  }
}

# SNS Topic subscriptions for email notifications
resource "aws_sns_topic_subscription" "email_subscriptions" {
  count     = length(var.notification_emails)
  topic_arn = aws_sns_topic.alarms.arn
  protocol  = "email"
  endpoint  = var.notification_emails[count.index]
}

# ECS Alarms
resource "aws_cloudwatch_metric_alarm" "ecs_cpu" {
  for_each = toset(var.service_names)
  
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
  for_each = toset(var.service_names)
  
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

# RDS Alarms
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
  count = var.db_instance_id != "" ? 1 : 0
  
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
  count = var.db_instance_id != "" ? 1 : 0
  
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

# Lambda Alarms
resource "aws_cloudwatch_metric_alarm" "lambda_errors" {
  for_each = toset(var.lambda_function_names)
  
  alarm_name          = "${each.value}-errors-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  period              = 300
  statistic           = "Sum"
  threshold           = 3
  alarm_description   = "Error count is too high for Lambda function ${each.value}"
  treat_missing_data  = "notBreaching"
  
  dimensions = {
    FunctionName = each.value
  }
  
  alarm_actions = [aws_sns_topic.alarms.arn]
  ok_actions    = [aws_sns_topic.alarms.arn]
  
  tags = {
    Name        = "${each.value}-errors-alarm"
    Environment = var.environment
  }
}

resource "aws_cloudwatch_metric_alarm" "lambda_throttles" {
  for_each = toset(var.lambda_function_names)
  
  alarm_name          = "${each.value}-throttles-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "Throttles"
  namespace           = "AWS/Lambda"
  period              = 300
  statistic           = "Sum"
  threshold           = 5
  alarm_description   = "Throttle count is too high for Lambda function ${each.value}"
  treat_missing_data  = "notBreaching"
  
  dimensions = {
    FunctionName = each.value
  }
  
  alarm_actions = [aws_sns_topic.alarms.arn]
  ok_actions    = [aws_sns_topic.alarms.arn]
  
  tags = {
    Name        = "${each.value}-throttles-alarm"
    Environment = var.environment
  }
}

# API Gateway Alarms
resource "aws_cloudwatch_metric_alarm" "api_5xx_errors" {
  count = var.api_gateway_name != "" ? 1 : 0
  
  alarm_name          = "${var.project_name}-api-5xx-errors-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "5XXError"
  namespace           = "AWS/ApiGateway"
  period              = 300
  statistic           = "Sum"
  threshold           = 5
  alarm_description   = "5XX error count is too high for API Gateway"
  treat_missing_data  = "notBreaching"
  
  dimensions = {
    ApiName = var.api_gateway_name
  }
  
  alarm_actions = [aws_sns_topic.alarms.arn]
  ok_actions    = [aws_sns_topic.alarms.arn]
  
  tags = {
    Name        = "${var.project_name}-api-5xx-errors-alarm"
    Environment = var.environment
  }
}

resource "aws_cloudwatch_metric_alarm" "api_4xx_errors" {
  count = var.api_gateway_name != "" ? 1 : 0
  
  alarm_name          = "${var.project_name}-api-4xx-errors-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "4XXError"
  namespace           = "AWS/ApiGateway"
  period              = 300
  statistic           = "Sum"
  threshold           = 50
  alarm_description   = "4XX error count is too high for API Gateway"
  treat_missing_data  = "notBreaching"
  
  dimensions = {
    ApiName = var.api_gateway_name
  }
  
  alarm_actions = [aws_sns_topic.alarms.arn]
  ok_actions    = [aws_sns_topic.alarms.arn]
  
  tags = {
    Name        = "${var.project_name}-api-4xx-errors-alarm"
    Environment = var.environment
  }
}

resource "aws_cloudwatch_metric_alarm" "api_latency" {
  count = var.api_gateway_name != "" ? 1 : 0
  
  alarm_name          = "${var.project_name}-api-latency-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "Latency"
  namespace           = "AWS/ApiGateway"
  period              = 300
  statistic           = "p90"
  threshold           = 5000  # 5 seconds in ms
  alarm_description   = "API Gateway latency is too high"
  treat_missing_data  = "notBreaching"
  
  dimensions = {
    ApiName = var.api_gateway_name
  }
  
  alarm_actions = [aws_sns_topic.alarms.arn]
  ok_actions    = [aws_sns_topic.alarms.arn]
  
  tags = {
    Name        = "${var.project_name}-api-latency-alarm"
    Environment = var.environment
  }
}

# CloudWatch Dashboard
resource "aws_cloudwatch_dashboard" "main" {
  count          = var.create_dashboard ? 1 : 0
  dashboard_name = "${var.project_name}-dashboard-${var.environment}"
  
  dashboard_body = jsonencode({
    widgets = concat(
      # Title Widget
      [
        {
          type = "text"
          x    = 0
          y    = 0
          width = 24
          height = 1
          properties = {
            markdown = "# ${var.project_name} - ${upper(var.environment)} Environment Dashboard"
          }
        }
      ],
      # ECS Widgets
      length(var.service_names) > 0 ? [
        {
          type = "text"
          x    = 0
          y    = 1
          width = 24
          height = 1
          properties = {
            markdown = "## ECS Services"
          }
        },
        {
          type = "metric"
          x    = 0
          y    = 2
          width = 12
          height = 6
          properties = {
            metrics = [
              for service in var.service_names : [
                "AWS/ECS", "CPUUtilization",
                "ClusterName", var.cluster_name,
                "ServiceName", service
              ]
            ],
            view = "timeSeries",
            stacked = false,
            region = "us-east-1",
            title = "ECS CPU Utilization",
            period = 300,
            stat = "Average"
          }
        },
        {
          type = "metric"
          x    = 12
          y    = 2
          width = 12
          height = 6
          properties = {
            metrics = [
              for service in var.service_names : [
                "AWS/ECS", "MemoryUtilization",
                "ClusterName", var.cluster_name,
                "ServiceName", service
              ]
            ],
            view = "timeSeries",
            stacked = false,
            region = "us-east-1",
            title = "ECS Memory Utilization",
            period = 300,
            stat = "Average"
          }
        }
      ] : [],
      # RDS Widgets
      var.db_instance_id != "" ? [
        {
          type = "text"
          x    = 0
          y    = 1 # Fixed y-coordinate
          width = 24
          height = 1
          properties = {
            markdown = "## RDS Database"
          }
        },
        {
          type = "metric"
          x    = 0
          y    = 2 # Fixed y-coordinate
          width = 8
          height = 6
          properties = {
            metrics = [
              [
                "AWS/RDS", "CPUUtilization",
                "DBInstanceIdentifier", var.db_instance_id
              ]
            ],
            view = "timeSeries",
            stacked = false,
            region = "us-east-1",
            title = "RDS CPU Utilization",
            period = 300,
            stat = "Average"
          }
        },
        {
          type = "metric"
          x    = 8
          y    = 2 # Fixed y-coordinate
          width = 8
          height = 6
          properties = {
            metrics = [
              [
                "AWS/RDS", "FreeableMemory",
                "DBInstanceIdentifier", var.db_instance_id
              ]
            ],
            view = "timeSeries",
            stacked = false,
            region = "us-east-1",
            title = "RDS Freeable Memory",
            period = 300,
            stat = "Average"
          }
        },
        {
          type = "metric"
          x    = 16
          y    = 2 # Fixed y-coordinate
          width = 8
          height = 6
          properties = {
            metrics = [
              [
                "AWS/RDS", "ReadIOPS",
                "DBInstanceIdentifier", var.db_instance_id
              ],
              [
                "AWS/RDS", "WriteIOPS",
                "DBInstanceIdentifier", var.db_instance_id
              ]
            ],
            view = "timeSeries",
            stacked = false,
            region = "us-east-1",
            title = "RDS IOPS",
            period = 300,
            stat = "Average"
          }
        }
      ] : [],
      # Lambda Widgets
      length(var.lambda_function_names) > 0 ? [
        {
          type = "text"
          x    = 0
          y    = 8 # Fixed y-coordinate
          width = 24
          height = 1
          properties = {
            markdown = "## Lambda Functions"
          }
        },
        {
          type = "metric"
          x    = 0
          y    = 9 # Fixed y-coordinate
          width = 8
          height = 6
          properties = {
            metrics = [
              for lambda in var.lambda_function_names : [
                "AWS/Lambda", "Invocations",
                "FunctionName", lambda
              ]
            ],
            view = "timeSeries",
            stacked = false,
            region = "us-east-1",
            title = "Lambda Invocations",
            period = 300,
            stat = "Sum"
          }
        },
        {
          type = "metric"
          x    = 8
          y    = 9 # Fixed y-coordinate
          width = 8
          height = 6
          properties = {
            metrics = [
              for lambda in var.lambda_function_names : [
                "AWS/Lambda", "Errors",
                "FunctionName", lambda
              ]
            ],
            view = "timeSeries",
            stacked = false,
            region = "us-east-1",
            title = "Lambda Errors",
            period = 300,
            stat = "Sum"
          }
        },
        {
          type = "metric"
          x    = 16
          y    = 9 # Fixed y-coordinate
          width = 8
          height = 6
          properties = {
            metrics = [
              for lambda in var.lambda_function_names : [
                "AWS/Lambda", "Duration",
                "FunctionName", lambda
              ]
            ],
            view = "timeSeries",
            stacked = false,
            region = "us-east-1",
            title = "Lambda Duration",
            period = 300,
            stat = "Average"
          }
        }
      ] : [],
      # API Gateway Widgets
      var.api_gateway_name != "" ? [
        {
          type = "text"
          x    = 0
          y    = 15 # Fixed y-coordinate
          width = 24
          height = 1
          properties = {
            markdown = "## API Gateway"
          }
        },
        {
          type = "metric"
          x    = 0
          y    = 16 # Fixed y-coordinate
          width = 8
          height = 6
          properties = {
            metrics = [
              [
                "AWS/ApiGateway", "Count",
                "ApiName", var.api_gateway_name
              ]
            ],
            view = "timeSeries",
            stacked = false,
            region = "us-east-1",
            title = "API Gateway Requests",
            period = 300,
            stat = "Sum"
          }
        },
        {
          type = "metric"
          x    = 8
          y    = 16 # Fixed y-coordinate
          width = 8
          height = 6
          properties = {
            metrics = [
              [
                "AWS/ApiGateway", "4XXError",
                "ApiName", var.api_gateway_name
              ],
              [
                "AWS/ApiGateway", "5XXError",
                "ApiName", var.api_gateway_name
              ]
            ],
            view = "timeSeries",
            stacked = false,
            region = "us-east-1",
            title = "API Gateway Errors",
            period = 300,
            stat = "Sum"
          }
        },
        {
          type = "metric"
          x    = 16
          y    = 16 # Fixed y-coordinate
          width = 8
          height = 6
          properties = {
            metrics = [
              [
                "AWS/ApiGateway", "Latency",
                "ApiName", var.api_gateway_name
              ]
            ],
            view = "timeSeries",
            stacked = false,
            region = "us-east-1",
            title = "API Gateway Latency",
            period = 300,
            stat = "p90"
          }
        }
      ] : []
    )
  })
}

# Outputs
output "alarms_topic_arn" {
  description = "ARN of the SNS topic for alarms"
  value       = aws_sns_topic.alarms.arn
}

output "dashboard_name" {
  description = "Name of the CloudWatch dashboard"
  value       = var.create_dashboard ? aws_cloudwatch_dashboard.main[0].dashboard_name : null
}