variable "environment" {
  description = "Environment name"
  type        = string
}

variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "secrets" {
  description = "Map of secrets to store in AWS Secrets Manager"
  type = map(object({
    description = string
    secret_value = string
  }))
  sensitive = true
}
