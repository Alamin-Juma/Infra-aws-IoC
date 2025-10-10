# modules/ecr/main.tf

# -------------------------------
# Variables
# -------------------------------
variable "repositories" {
  description = "List of ECR repository names to reference"
  type        = list(string)
}

variable "environment" {
  description = "Environment name (e.g. staging, production)"
  type        = string
}

variable "project_name" {
  description = "Project name prefix for tagging"
  type        = string
  default     = "prodready-infra"
}

# -------------------------------
# Data Sources
# -------------------------------

# Get current AWS account info
data "aws_caller_identity" "current" {}

# Get existing ECR repositories
data "aws_ecr_repository" "repos" {
  for_each = toset(var.repositories)
  name     = each.key
}

# -------------------------------
# Outputs
# -------------------------------

output "repository_urls" {
  description = "Map of repository names to repository URLs"
  value = {
    for name in var.repositories : name => data.aws_ecr_repository.repos[name].repository_url
  }
}

output "repository_arns" {
  description = "Map of repository names to repository ARNs"
  value = {
    for name in var.repositories : name => data.aws_ecr_repository.repos[name].arn
  }
}
