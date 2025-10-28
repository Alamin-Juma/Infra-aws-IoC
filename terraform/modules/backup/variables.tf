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
