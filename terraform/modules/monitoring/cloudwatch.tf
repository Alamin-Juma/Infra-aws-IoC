# CloudWatch Log Groups for ECS with cost-optimized retention
resource "aws_cloudwatch_log_group" "ecs_backend" {
  name              = "/ecs/${var.project_name}-backend-${var.environment}"
  retention_in_days = var.log_retention_days
  
  tags = {
    Name        = "${var.project_name}-backend-logs"
    Environment = var.environment
    CostCenter  = "monitoring"
  }
}

resource "aws_cloudwatch_log_group" "ecs_frontend" {
  name              = "/ecs/${var.project_name}-frontend-${var.environment}"
  retention_in_days = var.log_retention_days
  
  tags = {
    Name        = "${var.project_name}-frontend-logs"
    Environment = var.environment
    CostCenter  = "monitoring"
  }
}

# Optional: Custom metric filter for critical errors only
resource "aws_cloudwatch_log_metric_filter" "critical_errors" {
  count          = var.enable_detailed_monitoring ? 1 : 0
  name           = "${var.project_name}-critical-errors-${var.environment}"
  log_group_name = aws_cloudwatch_log_group.ecs_backend.name
  pattern        = "[level=ERROR] OR [level=FATAL]"
  
  metric_transformation {
    name      = "CriticalErrorCount"
    namespace = "${var.project_name}/Application"
    value     = "1"
    unit      = "Count"
  }
}