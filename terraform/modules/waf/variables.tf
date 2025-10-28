variable "environment" {
  description = "Environment name"
  type        = string
}

variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "api_gateway_arn" {
  description = "ARN of the API Gateway to protect"
  type        = string
}

variable "allowed_countries" {
  description = "List of allowed country codes (ISO 3166-1 alpha-2)"
  type        = list(string)
  default     = ["US", "CA", "GB", "AU"]
}

variable "rate_limit" {
  description = "Rate limit per 5-minute window"
  type        = number
  default     = 10000
}
