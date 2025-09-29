variable "environment" {
  description = "Environment name"
  type        = string
}

variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "db_subnet_group_name" {
  description = "Name of the DB subnet group"
  type        = string
}

variable "vpc_security_group_ids" {
  description = "List of security group IDs for RDS"
  type        = list(string)
}

variable "db_name" {
  description = "Name of the database"
  type        = string
}

variable "db_username" {
  description = "Username for the database"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "Password for the database"
  type        = string
  sensitive   = true
}

variable "db_instance_class" {
  description = "Instance class for the RDS instance"
  type        = string
  default     = "db.t3.small"
}

variable "multi_az" {
  description = "Whether to create a multi-AZ deployment"
  type        = bool
  default     = false
}

variable "engine" {
  description = "Database engine"
  type        = string
  default     = "postgres"
}

variable "engine_version" {
  description = "Database engine version"
  type        = string
  default     = "14"
}

variable "allocated_storage" {
  description = "Allocated storage in GB"
  type        = number
  default     = 20
}

variable "storage_type" {
  description = "Storage type"
  type        = string
  default     = "gp3"
}

variable "backup_retention_period" {
  description = "Backup retention period in days"
  type        = number
  default     = 7
}

variable "deletion_protection" {
  description = "Enable deletion protection"
  type        = bool
  default     = true
}

# Random password for master user if not provided
resource "random_password" "master" {
  count   = var.db_password == "" ? 1 : 0
  length  = 16
  special = false
}

# Store password in AWS Secrets Manager
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

# DB parameter group
resource "aws_db_parameter_group" "main" {
  name        = "${var.project_name}-${var.environment}-pg"
  family      = "${var.engine}${replace(var.engine_version, ".", "")}"
  description = "Parameter group for ${var.project_name} ${var.environment}"
  
  # PostgreSQL specific parameters
  dynamic "parameter" {
    for_each = var.engine == "postgres" ? [1] : []
    content {
      name  = "log_statement"
      value = "ddl"
    }
  }
  
  # MySQL specific parameters
  dynamic "parameter" {
    for_each = var.engine == "mysql" ? [1] : []
    content {
      name  = "character_set_server"
      value = "utf8mb4"
    }
  }
  
  tags = {
    Name        = "${var.project_name}-${var.environment}-pg"
    Environment = var.environment
  }
}

# DB option group
resource "aws_db_option_group" "main" {
  count                   = var.engine == "mysql" ? 1 : 0
  name                    = "${var.project_name}-${var.environment}-og"
  option_group_description = "Option group for ${var.project_name} ${var.environment}"
  engine_name             = var.engine
  major_engine_version    = var.engine_version
  
  tags = {
    Name        = "${var.project_name}-${var.environment}-og"
    Environment = var.environment
  }
}

# RDS instance
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
  parameter_group_name    = aws_db_parameter_group.main.name
  option_group_name       = var.engine == "mysql" ? aws_db_option_group.main[0].name : null
  skip_final_snapshot     = var.environment != "production"
  final_snapshot_identifier = "${var.project_name}-db-${var.environment}-final-snapshot"
  copy_tags_to_snapshot   = true
  backup_retention_period = var.backup_retention_period
  backup_window           = "03:00-06:00"
  maintenance_window      = "Sun:00:00-Sun:03:00"
  auto_minor_version_upgrade = true
  publicly_accessible     = false
  deletion_protection     = var.deletion_protection && var.environment == "production"
  performance_insights_enabled = var.environment == "production"
  
  # Enhanced monitoring
  monitoring_interval     = 60
  monitoring_role_arn     = aws_iam_role.rds_monitoring_role.arn
  
  tags = {
    Name        = "${var.project_name}-db"
    Environment = var.environment
  }
  
  # Lifecycle management - prevent_destroy is set statically
  # For production, manually change this to true before deployment
  lifecycle {
    prevent_destroy = false
  }
}

# IAM role for enhanced monitoring
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

# CloudWatch alarm for high CPU
resource "aws_cloudwatch_metric_alarm" "db_cpu" {
  alarm_name          = "${var.project_name}-db-cpu-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "This alarm monitors ${var.project_name} database CPU utilization"
  
  dimensions = {
    DBInstanceIdentifier = aws_db_instance.main.id
  }
  
  alarm_actions = var.environment == "production" ? [aws_sns_topic.db_alarms[0].arn] : []
  ok_actions    = var.environment == "production" ? [aws_sns_topic.db_alarms[0].arn] : []
}

# CloudWatch alarm for low storage
resource "aws_cloudwatch_metric_alarm" "db_storage" {
  alarm_name          = "${var.project_name}-db-storage-${var.environment}"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 1
  metric_name         = "FreeStorageSpace"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  threshold           = 2000000000  # 2GB in bytes
  alarm_description   = "This alarm monitors ${var.project_name} database free storage space"
  
  dimensions = {
    DBInstanceIdentifier = aws_db_instance.main.id
  }
  
  alarm_actions = var.environment == "production" ? [aws_sns_topic.db_alarms[0].arn] : []
  ok_actions    = var.environment == "production" ? [aws_sns_topic.db_alarms[0].arn] : []
}

# SNS topic for alarms (only created in production)
resource "aws_sns_topic" "db_alarms" {
  count = var.environment == "production" ? 1 : 0
  name  = "${var.project_name}-db-alarms-${var.environment}"
  
  tags = {
    Name        = "${var.project_name}-db-alarms"
    Environment = var.environment
  }
}

# Outputs
output "db_instance_id" {
  description = "ID of the RDS instance"
  value       = aws_db_instance.main.id
}

output "db_instance_address" {
  description = "Address of the RDS instance"
  value       = aws_db_instance.main.address
}

output "db_instance_endpoint" {
  description = "Endpoint of the RDS instance"
  value       = aws_db_instance.main.endpoint
}

output "db_secret_arn" {
  description = "ARN of the secret containing database credentials"
  value       = aws_secretsmanager_secret.db_password.arn
}