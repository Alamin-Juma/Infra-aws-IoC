variable "environment" {
  description = "Environment name"
  type        = string
}

variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "vpc_id" {
  description = "ID of the VPC"
  type        = string
}

variable "public_subnet_ids" {
  description = "IDs of public subnets for ALB"
  type        = list(string)
}

variable "private_subnet_ids" {
  description = "IDs of private subnets for ECS tasks"
  type        = list(string)
}

variable "security_group_ids" {
  description = "Map of security group IDs"
  type        = map(string)
}

variable "backend_image" {
  description = "Docker image for backend service"
  type        = string
}

variable "frontend_image" {
  description = "Docker image for frontend service"
  type        = string
}

variable "container_port" {
  description = "Port that the container exposes"
  type        = number
}

variable "desired_count" {
  description = "Desired count of tasks"
  type        = number
  default     = 2
}

variable "cpu" {
  description = "CPU units for task"
  type        = number
  default     = 256
}

variable "memory" {
  description = "Memory for task (in MiB)"
  type        = number
  default     = 512
}

variable "health_check_path" {
  description = "Path for health check"
  type        = string
  default     = "/health"
}

variable "cloudwatch_logs" {
  description = "Enable CloudWatch logs"
  type        = bool
  default     = true
}

variable "database_url" {
  description = "Database connection URL"
  type        = string
  sensitive   = true
}

variable "db_host" {
  description = "Database host"
  type        = string
  default     = ""
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = ""
}

variable "db_user" {
  description = "Database username"
  type        = string
  default     = "postgres"
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
  default     = ""
}

variable "jwt_secret" {
  description = "JWT secret for authentication"
  type        = string
  sensitive   = true
  default     = ""
}

variable "admin_email" {
  description = "Admin email for initial setup"
  type        = string
  default     = ""
}

variable "admin_password" {
  description = "Admin password for initial setup"
  type        = string
  sensitive   = true
  default     = ""
}

variable "certificate_arn" {
  description = "ARN of the ACM certificate for HTTPS"
  type        = string
  default     = ""
}


variable "frontend_url" {
  description = "Base URL of the react frontend application"
  type        = string
  default     = "https://itrack-frontend-staging.thejitutech.com"
}


variable "frontend_prod_url" {
  description = "Production URL of the react frontend application"
  type        = string
  default     = "https://itrack-frontend-staging.thejitutech.com"
}

variable "api_base_url" {
  description = "Base URL of the backend application"
  type        = string
  default     = "https://itrack-api-staging.thejitutech.com"
}


variable "api_base_url_prod" {
  description = "Production URL of the backend application"
  type        = string
  default     = "https://itrack-api-staging.thejitutech.com"
}
