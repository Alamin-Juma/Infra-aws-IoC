variable "repositories" {
  description = "List of ECR repository names to create"
  type        = list(string)
}

variable "environment" {
  description = "Environment name"
  type        = string
}

# Data source for AWS account ID
data "aws_caller_identity" "current" {}

# ECR Repositories
resource "aws_ecr_repository" "repos" {
  for_each             = toset(var.repositories)
  name                 = each.key
  image_tag_mutability = "MUTABLE"
  
  image_scanning_configuration {
    scan_on_push = true
  }
  
  tags = {
    Name        = each.key
    Environment = var.environment
  }
}

# Repository Policies
resource "aws_ecr_repository_policy" "policy" {
  for_each   = toset(var.repositories)
  repository = aws_ecr_repository.repos[each.key].name
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowPushPull"
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"
        }
        Action = [
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "ecr:BatchCheckLayerAvailability",
          "ecr:PutImage",
          "ecr:InitiateLayerUpload",
          "ecr:UploadLayerPart",
          "ecr:CompleteLayerUpload"
        ]
      }
    ]
  })
}

# Lifecycle Policies
resource "aws_ecr_lifecycle_policy" "policy" {
  for_each   = toset(var.repositories)
  repository = aws_ecr_repository.repos[each.key].name
  
  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last 10 images"
        selection = {
          tagStatus     = "untagged"
          countType     = "imageCountMoreThan"
          countNumber   = 10
        }
        action = {
          type = "expire"
        }
      },
      {
        rulePriority = 2
        description  = "Keep production images"
        selection = {
          tagStatus     = "tagged"
          tagPrefixList = ["prod", "production"]
          countType     = "imageCountMoreThan"
          countNumber   = 5
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}

# Output
output "repository_urls" {
  description = "Map of repository names to repository URLs"
  value = { for name in var.repositories : name => aws_ecr_repository.repos[name].repository_url }
}