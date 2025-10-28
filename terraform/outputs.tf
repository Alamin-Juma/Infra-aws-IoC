# VPC Outputs
output "vpc_id" {
  description = "ID of the VPC"
  value       = module.vpc.vpc_id
}

# ECS Outputs
output "ecs_cluster_name" {
  description = "Name of the ECS cluster"
  value       = module.ecs.cluster_name
}

output "ecs_backend_service_name" {
  description = "Name of the backend ECS service"
  value       = module.ecs.backend_service_name
}

# Frontend outputs - DISABLED (using S3 + CloudFront instead)
# output "ecs_frontend_service_name" {
#   description = "Name of the frontend ECS service"
#   value       = module.ecs.frontend_service_name
# }

output "backend_task_definition" {
  description = "Family name of the backend task definition"
  value       = module.ecs.backend_task_definition_family
}

# output "frontend_task_definition" {
#   description = "Family name of the frontend task definition"
#   value       = module.ecs.frontend_task_definition_family
# }

# ALB Outputs
output "alb_name" {
  description = "Name of the Application Load Balancer"
  value       = module.ecs.alb_name
}

output "alb_dns_name" {
  description = "DNS name of the Application Load Balancer"
  value       = module.ecs.alb_dns_name
}

output "alb_arn" {
  description = "ARN of the Application Load Balancer"
  value       = module.ecs.alb_arn
}

# ECR Outputs
output "ecr_repository_urls" {
  description = "URLs of the ECR repositories"
  value       = module.ecr.repository_urls
}

output "ecr_backend_repository_url" {
  description = "URL of the backend ECR repository"
  value       = module.ecr.repository_urls["${var.project_name}-api"]
}

output "ecr_frontend_repository_url" {
  description = "URL of the frontend ECR repository"
  value       = module.ecr.repository_urls["${var.project_name}-ui"]
}

# RDS Outputs
output "rds_endpoint" {
  description = "Endpoint of the RDS instance"
  value       = module.rds.db_instance_endpoint
  sensitive   = true
}

output "rds_instance_id" {
  description = "ID of the RDS instance"
  value       = module.rds.db_instance_id
}

# API Gateway Outputs - DISABLED (using ECS backend directly)
# output "api_gateway_url" {
#   description = "URL of the API Gateway"
#   value       = module.api_gateway.invoke_url
# }
# 
# output "api_gateway_id" {
#   description = "ID of the API Gateway"
#   value       = module.api_gateway.api_id
# }

# CloudFront Outputs
output "cloudfront_domain_name" {
  description = "Domain name of the CloudFront distribution"
  value       = module.cloudfront.domain_name
}

output "cloudfront_distribution_id" {
  description = "ID of the CloudFront distribution"
  value       = module.cloudfront.distribution_id
}

# S3 Outputs
output "s3_bucket_id" {
  description = "ID of the S3 bucket for static assets"
  value       = module.s3_hosting.bucket_id
}

# DynamoDB Outputs
output "dynamodb_table_names" {
  description = "Names of the DynamoDB tables"
  value       = module.dynamodb.table_names
}

# Backup Outputs
output "backup_vault_arn" {
  description = "ARN of the backup vault"
  value       = module.backup.backup_vault_arn
}
