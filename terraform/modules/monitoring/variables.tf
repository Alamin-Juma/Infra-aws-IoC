variable "environment" {
  description = "Environment name (e.g., dev, prod)"
  type        = string
}

variable "project_name" {
  description = "Project name"
  type        = string
}

variable "cluster_name" {
  description = "ECS Cluster name"
  type        = string
}

variable "service_names" {
  description = "List of ECS service names"
  type        = list(string)
  default     = []
}

variable "notification_emails" {
  description = "List of emails for SNS notifications"
  type        = list(string)
  default     = []
}

variable "create_dashboard" {
  description = "Whether to create the CloudWatch dashboard"
  type        = bool
  default     = true
}

variable "cpu_threshold" {
  description = "CPU threshold percentage for alarms"
  type        = number
  default     = 80
}

variable "alarm_period" {
  description = "Period in seconds for alarm evaluation"
  type        = number
  default     = 300
}

variable "alarm_evaluation_periods" {
  description = "Number of periods to evaluate the alarm"
  type        = number
  default     = 2
}
