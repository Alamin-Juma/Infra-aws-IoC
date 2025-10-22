# ✅ COST-OPTIMIZED: CloudWatch Dashboard (only if create_dashboard = true)
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
          width  = 24
          height = 1
          properties = {
            markdown = "# ${var.project_name} - ${upper(var.environment)} Environment Dashboard"
          }
        }
      ],

      # ECS Widgets
      (length(var.service_names) > 0 ? [
        {
          type = "text"
          x    = 0
          y    = 1
          width  = 24
          height = 1
          properties = {
            markdown = "## ECS Services"
          }
        },
        {
          type = "metric"
          x    = 0
          y    = 2
          width  = 12
          height = 6
          properties = {
            metrics = [
              for service in var.service_names : [
                "AWS/ECS", "CPUUtilization",
                "ClusterName", var.cluster_name,
                "ServiceName", service
              ]
            ]
            view    = "timeSeries"
            stacked = false
            region  = "us-east-1"
            title   = "ECS CPU Utilization"
            period  = 300
            stat    = "Average"
          }
        },
        {
          type = "metric"
          x    = 12
          y    = 2
          width  = 12
          height = 6
          properties = {
            metrics = [
              for service in var.service_names : [
                "AWS/ECS", "MemoryUtilization",
                "ClusterName", var.cluster_name,
                "ServiceName", service
              ]
            ]
            view    = "timeSeries"
            stacked = false
            region  = "us-east-1"
            title   = "ECS Memory Utilization"
            period  = 300
            stat    = "Average"
          }
        }
      ] : tolist([])),

      # RDS Widgets
      (var.db_instance_id != "" ? [
        {
          type = "text"
          x    = 0
          y    = 8
          width  = 24
          height = 1
          properties = {
            markdown = "## RDS Database"
          }
        },
        {
          type = "metric"
          x    = 0
          y    = 9
          width  = 12
          height = 6
          properties = {
            metrics = [
              ["AWS/RDS", "CPUUtilization", "DBInstanceIdentifier", var.db_instance_id]
            ]
            view    = "timeSeries"
            stacked = false
            region  = "us-east-1"
            title   = "RDS CPU Utilization"
            period  = 300
            stat    = "Average"
          }
        },
        {
          type = "metric"
          x    = 12
          y    = 9
          width  = 12
          height = 6
          properties = {
            metrics = [
              ["AWS/RDS", "FreeableMemory", "DBInstanceIdentifier", var.db_instance_id]
            ]
            view    = "timeSeries"
            stacked = false
            region  = "us-east-1"
            title   = "RDS Freeable Memory"
            period  = 300
            stat    = "Average"
          }
        }
      ] : tolist([])),

      # Lambda Widgets
      (length(var.lambda_function_names) > 0 ? [
        {
          type = "text"
          x    = 0
          y    = 15
          width  = 24
          height = 1
          properties = {
            markdown = "## Lambda Functions"
          }
        },
        {
          type = "metric"
          x    = 0
          y    = 16
          width  = 8
          height = 6
          properties = {
            metrics = [
              for lambda in var.lambda_function_names : [
                "AWS/Lambda", "Invocations",
                "FunctionName", lambda
              ]
            ]
            view    = "timeSeries"
            stacked = false
            region  = "us-east-1"
            title   = "Lambda Invocations"
            period  = 300
            stat    = "Sum"
          }
        },
        {
          type = "metric"
          x    = 8
          y    = 16
          width  = 8
          height = 6
          properties = {
            metrics = [
              for lambda in var.lambda_function_names : [
                "AWS/Lambda", "Errors",
                "FunctionName", lambda
              ]
            ]
            view    = "timeSeries"
            stacked = false
            region  = "us-east-1"
            title   = "Lambda Errors"
            period  = 300
            stat    = "Sum"
          }
        },
        {
          type = "metric"
          x    = 16
          y    = 16
          width  = 8
          height = 6
          properties = {
            metrics = [
              for lambda in var.lambda_function_names : [
                "AWS/Lambda", "Duration",
                "FunctionName", lambda
              ]
            ]
            view    = "timeSeries"
            stacked = false
            region  = "us-east-1"
            title   = "Lambda Duration"
            period  = 300
            stat    = "Average"
          }
        }
      ] : tolist([]))
    )
  })
}
