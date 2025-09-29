variable "environment" {
  description = "Environment name"
  type        = string
}

variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "backup_retention_days" {
  description = "Number of days to retain backups"
  type        = number
  default     = 30
}

variable "enable_cross_region_backup" {
  description = "Enable cross-region backup"
  type        = bool
  default     = false
}

variable "cross_region_backup_region" {
  description = "Region for cross-region backups"
  type        = string
  default     = "us-west-2"
}

variable "rds_instance_id" {
  description = "RDS instance identifier for backups"
  type        = string
  default     = ""
}

variable "dynamodb_table_names" {
  description = "List of DynamoDB table names to backup"
  type        = list(string)
  default     = []
}

# AWS Backup Vault
resource "aws_backup_vault" "main" {
  name        = "${var.project_name}-backup-vault-${var.environment}"
  kms_key_arn = aws_kms_key.backup_key.arn
  
  tags = {
    Name        = "${var.project_name}-backup-vault"
    Environment = var.environment
  }
}

# KMS Key for backup encryption
resource "aws_kms_key" "backup_key" {
  description             = "KMS key for backup encryption"
  deletion_window_in_days = 7
  
  tags = {
    Name        = "${var.project_name}-backup-key"
    Environment = var.environment
  }
}

resource "aws_kms_alias" "backup_key_alias" {
  name          = "alias/${var.project_name}-backup-${var.environment}"
  target_key_id = aws_kms_key.backup_key.key_id
}

# Cross-region backup vault (if enabled)
resource "aws_backup_vault" "cross_region" {
  count    = var.enable_cross_region_backup ? 1 : 0
  provider = aws.backup_region
  
  name        = "${var.project_name}-backup-vault-cross-region-${var.environment}"
  kms_key_arn = aws_kms_key.backup_key_cross_region[0].arn
  
  tags = {
    Name        = "${var.project_name}-backup-vault-cross-region"
    Environment = var.environment
  }
}

resource "aws_kms_key" "backup_key_cross_region" {
  count    = var.enable_cross_region_backup ? 1 : 0
  provider = aws.backup_region
  
  description             = "KMS key for cross-region backup encryption"
  deletion_window_in_days = 7
  
  tags = {
    Name        = "${var.project_name}-backup-key-cross-region"
    Environment = var.environment
  }
}

# IAM Role for AWS Backup
resource "aws_iam_role" "backup_role" {
  name = "${var.project_name}-backup-role-${var.environment}"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "backup.amazonaws.com"
        }
      }
    ]
  })
}

# Attach AWS managed backup policy
resource "aws_iam_role_policy_attachment" "backup_policy" {
  role       = aws_iam_role.backup_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSBackupServiceRolePolicyForBackup"
}

resource "aws_iam_role_policy_attachment" "backup_restore_policy" {
  role       = aws_iam_role.backup_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSBackupServiceRolePolicyForRestores"
}

# Backup Plan
resource "aws_backup_plan" "main" {
  name = "${var.project_name}-backup-plan-${var.environment}"
  
  rule {
    rule_name         = "daily_backups"
    target_vault_name = aws_backup_vault.main.name
    schedule          = "cron(0 5 ? * * *)"  # Daily at 5 AM UTC
    
    lifecycle {
      cold_storage_after = 30
      delete_after       = var.backup_retention_days
    }
    
    recovery_point_tags = {
      BackupType  = "Daily"
      Environment = var.environment
    }
    
    # Copy to cross-region vault if enabled
    dynamic "copy_action" {
      for_each = var.enable_cross_region_backup ? [1] : []
      content {
        destination_vault_arn = aws_backup_vault.cross_region[0].arn
        
        lifecycle {
          cold_storage_after = 30
          delete_after       = var.backup_retention_days
        }
      }
    }
  }
  
  rule {
    rule_name         = "weekly_backups"
    target_vault_name = aws_backup_vault.main.name
    schedule          = "cron(0 5 ? * SUN *)"  # Weekly on Sundays at 5 AM UTC
    
    lifecycle {
      cold_storage_after = 30
      delete_after       = 365  # Keep weekly backups for 1 year
    }
    
    recovery_point_tags = {
      BackupType  = "Weekly"
      Environment = var.environment
    }
  }
  
  tags = {
    Name        = "${var.project_name}-backup-plan"
    Environment = var.environment
  }
}

# Backup Selection for RDS (disabled for initial deployment to avoid count dependency)
# resource "aws_backup_selection" "rds_backup" {
#   count = var.rds_instance_id != "" ? 1 : 0
#   
#   iam_role_arn = aws_iam_role.backup_role.arn
#   name         = "${var.project_name}-rds-backup-selection-${var.environment}"
#   plan_id      = aws_backup_plan.main.id
#   
#   resources = [
#     "arn:aws:rds:*:*:db:${var.rds_instance_id}"
#   ]
#   
#   condition {
#     string_equals {
#       key   = "aws:ResourceTag/Environment"
#       value = var.environment
#     }
#   }
# }

# Backup Selection for DynamoDB
resource "aws_backup_selection" "dynamodb_backup" {
  count = length(var.dynamodb_table_names) > 0 ? 1 : 0
  
  iam_role_arn = aws_iam_role.backup_role.arn
  name         = "${var.project_name}-dynamodb-backup-selection-${var.environment}"
  plan_id      = aws_backup_plan.main.id
  
  resources = [
    for table in var.dynamodb_table_names :
    "arn:aws:dynamodb:*:*:table/${table}"
  ]
}

# DynamoDB Point-in-Time Recovery (PITR)
resource "aws_dynamodb_table_replica" "cross_region_replica" {
  for_each = var.enable_cross_region_backup ? toset(var.dynamodb_table_names) : toset([])
  provider = aws.backup_region
  
  global_table_arn   = "arn:aws:dynamodb::${data.aws_caller_identity.current.account_id}:table/${each.value}"
  
  tags = {
    Name        = "${each.value}-replica"
    Environment = var.environment
    ReplicaType = "CrossRegion"
  }
}

data "aws_caller_identity" "current" {}

# CloudWatch Alarms for Backup Status
resource "aws_cloudwatch_metric_alarm" "backup_failed" {
  alarm_name          = "${var.project_name}-backup-failed-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "NumberOfBackupJobsFailed"
  namespace           = "AWS/Backup"
  period              = "86400"  # 24 hours
  statistic           = "Sum"
  threshold           = "0"
  alarm_description   = "Backup job failed"
  
  dimensions = {
    BackupVaultName = aws_backup_vault.main.name
  }
  
  tags = {
    Name        = "${var.project_name}-backup-failed-alarm"
    Environment = var.environment
  }
}

# Outputs
output "backup_vault_arn" {
  description = "ARN of the backup vault"
  value       = aws_backup_vault.main.arn
}

output "backup_plan_arn" {
  description = "ARN of the backup plan"
  value       = aws_backup_plan.main.arn
}

output "cross_region_vault_arn" {
  description = "ARN of the cross-region backup vault"
  value       = var.enable_cross_region_backup ? aws_backup_vault.cross_region[0].arn : null
}