resource "random_password" "master" {
  count   = var.db_password == "" ? 1 : 0
  length  = 16
  special = false
}

resource "aws_secretsmanager_secret" "db_password" {
  name        = "${var.project_name}-db-password-${var.environment}"
  description = "Database password for ${var.project_name} ${var.environment}"
  tags = {
    Name        = "${var.project_name}-db-password"
    Environment = var.environment
  }
}

resource "aws_secretsmanager_secret_version" "db_password" {
  secret_id     = aws_secretsmanager_secret.db_password.id
  secret_string = jsonencode({
    username = var.db_username
    password = var.db_password == "" ? random_password.master[0].result : var.db_password
    engine   = var.engine
    host     = aws_db_instance.main.address
    port     = aws_db_instance.main.port
    dbname   = var.db_name
  })
}

# --- IAM role for enhanced monitoring ---
resource "aws_iam_role" "rds_monitoring_role" {
  name = "${var.project_name}-rds-monitoring-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "monitoring.rds.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name        = "${var.project_name}-rds-monitoring-role"
    Environment = var.environment
  }
}

resource "aws_iam_role_policy_attachment" "rds_monitoring" {
  role       = aws_iam_role.rds_monitoring_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
}

# --- SNS topic for alarms (only in production) ---
resource "aws_sns_topic" "db_alarms" {
  count = var.environment == "production" ? 1 : 0
  name  = "${var.project_name}-db-alarms-${var.environment}"

  tags = {
    Name        = "${var.project_name}-db-alarms"
    Environment = var.environment
  }
}

# --- Main RDS instance ---
resource "aws_db_instance" "main" {
  identifier              = "${var.project_name}-db-${var.environment}"
  engine                  = var.engine
  engine_version          = var.engine_version
  instance_class          = var.db_instance_class
  allocated_storage       = var.allocated_storage
  storage_type            = var.storage_type
  storage_encrypted       = true
  db_name                 = var.db_name
  username                = var.db_username
  password                = var.db_password == "" ? random_password.master[0].result : var.db_password
  multi_az                = var.multi_az
  db_subnet_group_name    = var.db_subnet_group_name
  vpc_security_group_ids  = var.vpc_security_group_ids
  skip_final_snapshot     = var.environment != "production"
  final_snapshot_identifier = "${var.project_name}-db-${var.environment}-final-snapshot"
  copy_tags_to_snapshot   = true
  backup_retention_period = var.environment == "production" ? var.backup_retention_period : 1
  backup_window           = "03:00-06:00"
  maintenance_window      = "Sun:00:00-Sun:03:00"
  auto_minor_version_upgrade = true
  publicly_accessible     = false
  deletion_protection     = var.environment == "production" ? var.deletion_protection : false
  performance_insights_enabled = var.environment == "production"

  # Cost optimization: Enhanced monitoring only for prod, lower granularity otherwise
  monitoring_interval     = var.environment == "production" ? 60 : 0
  monitoring_role_arn     = var.environment == "production" ? aws_iam_role.rds_monitoring_role.arn : null

  tags = {
    Name        = "${var.project_name}-db"
    Environment = var.environment
  }

  lifecycle {
    prevent_destroy = false
  }
}

# --- CloudWatch Alarms (only in production) ---
resource "aws_cloudwatch_metric_alarm" "db_cpu" {
  count                = var.environment == "production" ? 1 : 0
  alarm_name           = "${var.project_name}-db-cpu-${var.environment}"
  comparison_operator  = "GreaterThanThreshold"
  evaluation_periods   = 2
  metric_name          = "CPUUtilization"
  namespace            = "AWS/RDS"
  period               = 300
  statistic            = "Average"
  threshold            = 80
  alarm_description    = "High CPU on ${var.project_name} database"

  dimensions = {
    DBInstanceIdentifier = aws_db_instance.main.id
  }

  alarm_actions = [aws_sns_topic.db_alarms[0].arn]
  ok_actions    = [aws_sns_topic.db_alarms[0].arn]
}

resource "aws_cloudwatch_metric_alarm" "db_storage" {
  count                = var.environment == "production" ? 1 : 0
  alarm_name           = "${var.project_name}-db-storage-${var.environment}"
  comparison_operator  = "LessThanThreshold"
  evaluation_periods   = 1
  metric_name          = "FreeStorageSpace"
  namespace            = "AWS/RDS"
  period               = 300
  statistic            = "Average"
  threshold            = 2000000000 # 2 GB
  alarm_description    = "Low storage on ${var.project_name} database"

  dimensions = {
    DBInstanceIdentifier = aws_db_instance.main.id
  }

  alarm_actions = [aws_sns_topic.db_alarms[0].arn]
  ok_actions    = [aws_sns_topic.db_alarms[0].arn]
}

# --- Outputs ---
