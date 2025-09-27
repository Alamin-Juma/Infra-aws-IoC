variable "vpc_id" {
  description = "ID of the VPC"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "allowed_ips" {
  description = "List of allowed IPs for administrative access"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "container_ports" {
  description = "List of ports that containers use"
  type        = list(number)
  default     = [8080]
}

# Security Group for Load Balancer
resource "aws_security_group" "lb" {
  name        = "${var.project_name}-lb-sg"
  description = "Controls access to the ALB"
  vpc_id      = var.vpc_id

  ingress {
    protocol    = "tcp"
    from_port   = 80
    to_port     = 80
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTP traffic from the internet"
  }

  ingress {
    protocol    = "tcp"
    from_port   = 443
    to_port     = 443
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTPS traffic from the internet"
  }

  egress {
    protocol    = "-1"
    from_port   = 0
    to_port     = 0
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic"
  }

  tags = {
    Name        = "${var.project_name}-lb-sg"
    Environment = var.environment
  }
}

# Security Group for ECS Tasks
resource "aws_security_group" "ecs" {
  name        = "${var.project_name}-ecs-sg"
  description = "Controls access to the ECS containers"
  vpc_id      = var.vpc_id

  dynamic "ingress" {
    for_each = var.container_ports
    content {
      protocol        = "tcp"
      from_port       = ingress.value
      to_port         = ingress.value
      security_groups = [aws_security_group.lb.id]
      description     = "Traffic from the ALB"
    }
  }

  egress {
    protocol    = "-1"
    from_port   = 0
    to_port     = 0
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic"
  }

  tags = {
    Name        = "${var.project_name}-ecs-sg"
    Environment = var.environment
  }
}

# Security Group for RDS
resource "aws_security_group" "db" {
  name        = "${var.project_name}-db-sg"
  description = "Controls access to RDS instances"
  vpc_id      = var.vpc_id

  ingress {
    protocol        = "tcp"
    from_port       = 5432  # PostgreSQL
    to_port         = 5432
    security_groups = [aws_security_group.ecs.id]
    description     = "PostgreSQL access from ECS tasks"
  }

  ingress {
    protocol        = "tcp"
    from_port       = 3306  # MySQL
    to_port         = 3306
    security_groups = [aws_security_group.ecs.id]
    description     = "MySQL access from ECS tasks"
  }

  # Admin access to DB
  dynamic "ingress" {
    for_each = length(var.allowed_ips) > 0 && var.environment != "production" ? [1] : []
    content {
      protocol    = "tcp"
      from_port   = 5432
      to_port     = 5432
      cidr_blocks = var.allowed_ips
      description = "PostgreSQL admin access"
    }
  }

  dynamic "ingress" {
    for_each = length(var.allowed_ips) > 0 && var.environment != "production" ? [1] : []
    content {
      protocol    = "tcp"
      from_port   = 3306
      to_port     = 3306
      cidr_blocks = var.allowed_ips
      description = "MySQL admin access"
    }
  }

  egress {
    protocol    = "-1"
    from_port   = 0
    to_port     = 0
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic"
  }

  tags = {
    Name        = "${var.project_name}-db-sg"
    Environment = var.environment
  }
}

# Security Group for Lambda Functions
resource "aws_security_group" "lambda" {
  name        = "${var.project_name}-lambda-sg"
  description = "Controls access to Lambda functions"
  vpc_id      = var.vpc_id

  egress {
    protocol    = "-1"
    from_port   = 0
    to_port     = 0
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic"
  }

  tags = {
    Name        = "${var.project_name}-lambda-sg"
    Environment = var.environment
  }
}

# Security Group for Redis (ElastiCache)
resource "aws_security_group" "redis" {
  name        = "${var.project_name}-redis-sg"
  description = "Controls access to Redis clusters"
  vpc_id      = var.vpc_id

  ingress {
    protocol        = "tcp"
    from_port       = 6379
    to_port         = 6379
    security_groups = [aws_security_group.ecs.id, aws_security_group.lambda.id]
    description     = "Redis access from ECS tasks and Lambda functions"
  }

  egress {
    protocol    = "-1"
    from_port   = 0
    to_port     = 0
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic"
  }

  tags = {
    Name        = "${var.project_name}-redis-sg"
    Environment = var.environment
  }
}

# Outputs
output "lb_security_group_id" {
  description = "ID of the load balancer security group"
  value       = aws_security_group.lb.id
}

output "ecs_security_group_id" {
  description = "ID of the ECS tasks security group"
  value       = aws_security_group.ecs.id
}

output "db_security_group_id" {
  description = "ID of the database security group"
  value       = aws_security_group.db.id
}

output "lambda_security_group_id" {
  description = "ID of the Lambda functions security group"
  value       = aws_security_group.lambda.id
}

output "redis_security_group_id" {
  description = "ID of the Redis security group"
  value       = aws_security_group.redis.id
}