terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.16"
    }
  }

  required_version = ">= 1.2.0"

  backend "s3" {
    bucket = "itrack-terraform-state"
    key    = "itrack/production/terraform.tfstate"
    region = "us-east-1"
    # Enable DynamoDB state locking
    dynamodb_table = "terraform-state-lock"
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region
  default_tags {
    tags = {
      Project     = "iTrack"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# Data sources
data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_caller_identity" "current" {}

# VPC and Networking
module "vpc" {
  source = "./modules/vpc"

  vpc_name            = "${var.project_name}-vpc"
  environment         = var.environment
  cidr_block          = var.vpc_cidr
  availability_zones  = slice(data.aws_availability_zones.available.names, 0, var.az_count)
  public_subnets      = var.public_subnets
  private_subnets     = var.private_subnets
  enable_nat_gateway  = true
  single_nat_gateway  = var.environment != "production" # Use multiple NAT gateways in production
  enable_vpn_gateway  = false
}

# Security Groups
module "security_groups" {
  source = "./modules/security"
  
  vpc_id          = module.vpc.vpc_id
  environment     = var.environment
  project_name    = var.project_name
  allowed_ips     = var.allowed_ips
  container_ports = [var.app_port]
}

# ECR Repositories
module "ecr" {
  source = "./modules/ecr"
  
  repositories = [
    "${var.project_name}-frontend",
    "${var.project_name}-backend"
  ]
  environment = var.environment
}

# Cognito for Authentication
module "cognito" {
  source = "./modules/cognito"
  
  user_pool_name  = "${var.project_name}-user-pool"
  environment     = var.environment
  project_name    = var.project_name
  allowed_domains = var.allowed_domains
}

# API Gateway
module "api_gateway" {
  source = "./modules/api_gateway"
  
  name         = "${var.project_name}-api"
  environment  = var.environment
  cognito_arn  = module.cognito.user_pool_arn
  depends_on   = [module.cognito]
}

# DynamoDB Tables
module "dynamodb" {
  source = "./modules/dynamodb"
  
  tables = var.dynamodb_tables
  environment = var.environment
  project_name = var.project_name
}

# RDS Database
module "rds" {
  source = "./modules/rds"
  
  environment           = var.environment
  project_name          = var.project_name
  db_subnet_group_name  = module.vpc.database_subnet_group_name
  vpc_security_group_ids = [module.security_groups.db_security_group_id]
  db_name               = var.db_name
  db_username           = var.db_username
  db_password           = var.db_password
  db_instance_class     = var.db_instance_class
  multi_az              = var.environment == "production" ? true : false
}

# Lambda Functions
module "lambda" {
  source = "./modules/lambda"
  
  environment     = var.environment
  project_name    = var.project_name
  vpc_id          = module.vpc.vpc_id
  subnet_ids      = module.vpc.private_subnets
  security_group_ids = [module.security_groups.lambda_security_group_id]
  lambda_functions = var.lambda_functions
  dynamo_table_arns = module.dynamodb.table_arns
  api_gateway_id    = module.api_gateway.api_id
}

# ECS Cluster, Services and Task Definitions
module "ecs" {
  source = "./modules/ecs"
  
  environment        = var.environment
  project_name       = var.project_name
  vpc_id             = module.vpc.vpc_id
  public_subnet_ids  = module.vpc.public_subnets
  private_subnet_ids = module.vpc.private_subnets
  security_group_ids = {
    lb      = module.security_groups.lb_security_group_id,
    ecs     = module.security_groups.ecs_security_group_id
  }
  backend_image      = "${module.ecr.repository_urls["${var.project_name}-backend"]}:latest"
  frontend_image     = "${module.ecr.repository_urls["${var.project_name}-frontend"]}:latest"
  container_port     = var.app_port
  desired_count      = var.ecs_desired_count
  cpu                = var.ecs_cpu
  memory             = var.ecs_memory
  health_check_path  = var.health_check_path
  cloudwatch_logs    = true
}

# CloudWatch Monitoring and Alarms
module "monitoring" {
  source = "./modules/monitoring"
  
  environment   = var.environment
  project_name  = var.project_name
  
  # ECS Alarms
  cluster_name  = module.ecs.cluster_name
  service_names = module.ecs.service_names
  
  # RDS Alarms
  db_instance_id = module.rds.db_instance_id
  
  # Lambda Alarms
  lambda_function_names = module.lambda.function_names
  
  # API Gateway Alarms
  api_gateway_name = module.api_gateway.api_name
  
  # Create appropriate dashboards and alerts
  create_dashboard = true
  notification_emails = var.notification_emails
}

# S3 Bucket for Frontend Assets (if needed)
module "s3_hosting" {
  source = "./modules/s3"
  
  environment     = var.environment
  project_name    = var.project_name
  bucket_name     = "${var.project_name}-assets-${var.environment}"
  enable_website  = false # We'll use CloudFront instead
}

# CloudFront for CDN 
module "cloudfront" {
  source = "./modules/cloudfront"
  
  environment     = var.environment
  project_name    = var.project_name
  
  # Origins
  lb_domain_name   = module.ecs.lb_dns_name
  s3_domain_name   = module.s3_hosting.bucket_domain_name
  
  # Cache policies
  cache_settings   = var.cloudfront_cache_settings
  allowed_methods  = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
  
  # HTTPS settings
  acm_certificate_arn = var.acm_certificate_arn
  domain_names       = var.domain_names
}

# Route53 for DNS (if needed)
module "route53" {
  count  = length(var.domain_names) > 0 ? 1 : 0
  source = "./modules/route53"
  
  domain_names       = var.domain_names
  cloudfront_domain  = module.cloudfront.domain_name
  cloudfront_zone_id = module.cloudfront.hosted_zone_id
}