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

# Cost optimization variables
variable "log_retention_days" {
  description = "CloudWatch log retention in days (reduce to save costs)"
  type        = number
  default     = 7  # Balanced: enough for debugging, within free tier
}

variable "enable_s3_log_archive" {
  description = "Enable S3 log archiving for cost-effective long-term storage"
  type        = bool
  default     = false  # Disabled by default, enable when needed
}

variable "s3_log_transition_days" {
  description = "Days before moving logs from CloudWatch to S3"
  type        = number
  default     = 7
}

variable "s3_log_expiration_days" {
  description = "Days before deleting archived logs from S3"
  type        = number
  default     = 90
}

variable "enable_detailed_monitoring" {
  description = "Enable detailed monitoring (costs extra, disable for savings)"
  type        = bool
  default     = false
}

variable "enable_all_alarms" {
  description = "Enable all alarms (true for prod, false for dev/staging to save costs)"
  type        = bool
  default     = true
}