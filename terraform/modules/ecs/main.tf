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

# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "${var.project_name}-cluster-${var.environment}"
  
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
  
  tags = {
    Name        = "${var.project_name}-cluster"
    Environment = var.environment
  }
}

# CloudWatch Log Groups
resource "aws_cloudwatch_log_group" "backend" {
  count = var.cloudwatch_logs ? 1 : 0
  name  = "/ecs/${var.project_name}-backend-${var.environment}"
  
  # retention_in_days = 30  # Disabled due to permission restrictions
  
  tags = {
    Name        = "${var.project_name}-backend-logs"
    Environment = var.environment
  }
}

resource "aws_cloudwatch_log_group" "frontend" {
  count = var.cloudwatch_logs ? 1 : 0
  name  = "/ecs/${var.project_name}-frontend-${var.environment}"
  
  # retention_in_days = 30  # Disabled due to permission restrictions
  
  tags = {
    Name        = "${var.project_name}-frontend-logs"
    Environment = var.environment
  }
}

# Task Execution Role
resource "aws_iam_role" "task_execution_role" {
  name = "${var.project_name}-task-execution-role-${var.environment}"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
  
  tags = {
    Name        = "${var.project_name}-task-execution-role"
    Environment = var.environment
  }
}

# Policy attachment for task execution role
resource "aws_iam_role_policy_attachment" "task_execution_role_policy" {
  role       = aws_iam_role.task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# Task Role
resource "aws_iam_role" "task_role" {
  name = "${var.project_name}-task-role-${var.environment}"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
  
  tags = {
    Name        = "${var.project_name}-task-role"
    Environment = var.environment
  }
}

# DynamoDB access policy for task role
resource "aws_iam_policy" "dynamodb_policy" {
  name        = "${var.project_name}-dynamodb-policy-${var.environment}"
  description = "Policy for ECS tasks to access DynamoDB"
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:DeleteItem",
          "dynamodb:UpdateItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ]
        Resource = [
          "arn:aws:dynamodb:*:*:table/${var.project_name}-*-${var.environment}"
        ]
      }
    ]
  })
}

# Attach DynamoDB policy to task role
resource "aws_iam_role_policy_attachment" "task_dynamodb_policy" {
  role       = aws_iam_role.task_role.name
  policy_arn = aws_iam_policy.dynamodb_policy.arn
}

# Additional permissions for task role (disabled due to IAM permissions)
# resource "aws_iam_policy" "task_policy" {
#   name        = "${var.project_name}-task-policy-${var.environment}"
#   description = "Policy for ECS tasks"
#   
#   policy = jsonencode({
#     Version = "2012-10-17"
#     Statement = [
#       {
#         Effect = "Allow"
#         Action = [
#           "ssm:GetParameters",
#           "ssm:GetParameter",
#           "ssm:GetParametersByPath"
#         ]
#         Resource = [
#           "arn:aws:ssm:*:*:parameter/${var.project_name}/${var.environment}/*"
#         ]
#       },
#       {
#         Effect = "Allow"
#         Action = [
#           "cognito-idp:AdminInitiateAuth",
#           "cognito-idp:AdminCreateUser"
#         ]
#         Resource = [
#           "arn:aws:cognito-idp:*:*:userpool/*"
#         ]
#       }
#     ]
#   })
# }

# resource "aws_iam_role_policy_attachment" "task_role_policy" {
#   role       = aws_iam_role.task_role.name
#   policy_arn = aws_iam_policy.task_policy.arn
# }

# Application Load Balancer
resource "aws_lb" "main" {
  name               = "${var.project_name}-alb-${var.environment}"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [var.security_group_ids.lb]
  subnets            = var.public_subnet_ids
  
  enable_deletion_protection = var.environment == "production" ? true : false
  
  tags = {
    Name        = "${var.project_name}-alb"
    Environment = var.environment
  }
}

# Target Groups
resource "aws_lb_target_group" "backend" {
  name        = "pinfra-be-tg-${var.environment}"
  port        = var.container_port
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"
  
  health_check {
    path                = var.health_check_path
    interval            = 30
    timeout             = 10
    healthy_threshold   = 3
    unhealthy_threshold = 3
    matcher             = "200-299"
  }
  
  tags = {
    Name        = "${var.project_name}-backend-tg"
    Environment = var.environment
  }
}

resource "aws_lb_target_group" "frontend" {
  name        = "pinfra-fe-tg-${var.environment}"
  port        = 80
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"
  
  health_check {
    path                = "/"
    interval            = 30
    timeout             = 10
    healthy_threshold   = 3
    unhealthy_threshold = 3
    matcher             = "200-299"
  }
  
  tags = {
    Name        = "${var.project_name}-frontend-tg"
    Environment = var.environment
  }
}

# Listeners
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"
  
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.frontend.arn
  }
}

resource "aws_lb_listener_rule" "backend" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 10

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend.arn
  }

  condition {
    path_pattern {
      values = ["/api/*"]
    }
  }
}

# Backend Task Definition
resource "aws_ecs_task_definition" "backend" {
  family                   = "${var.project_name}-backend-${var.environment}"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.cpu
  memory                   = var.memory
  execution_role_arn       = aws_iam_role.task_execution_role.arn
  task_role_arn            = aws_iam_role.task_role.arn
  
  container_definitions = jsonencode([
    {
      name      = "${var.project_name}-backend"
      image     = var.backend_image
      essential = true
      
      portMappings = [
        {
          containerPort = var.container_port
          hostPort      = var.container_port
          protocol      = "tcp"
        }
      ]
      
      environment = [
        {
          name  = "PORT"
          value = tostring(var.container_port)
        },
        {
          name  = "NODE_ENV"
          value = var.environment
        },
        {
          name  = "DYNAMODB_TABLE_NAME"
          value = "${var.project_name}-items-${var.environment}"
        }
      ]
      
      logConfiguration = var.cloudwatch_logs ? {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.backend[0].name
          awslogs-region        = "us-east-1"
          awslogs-stream-prefix = "ecs"
        }
      } : null
      
      healthCheck = {
        command     = ["CMD-SHELL", "curl -f http://localhost:${var.container_port}${var.health_check_path} || exit 1"]
        interval    = 30
        timeout     = 10
        retries     = 3
        startPeriod = 60
      }
    }
  ])
  
  tags = {
    Name        = "${var.project_name}-backend-task"
    Environment = var.environment
  }
}

# Frontend Task Definition
resource "aws_ecs_task_definition" "frontend" {
  family                   = "${var.project_name}-frontend-${var.environment}"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.cpu
  memory                   = var.memory
  execution_role_arn       = aws_iam_role.task_execution_role.arn
  task_role_arn            = aws_iam_role.task_role.arn
  
  container_definitions = jsonencode([
    {
      name      = "${var.project_name}-frontend"
      image     = var.frontend_image
      essential = true
      
      portMappings = [
        {
          containerPort = 80
          hostPort      = 80
          protocol      = "tcp"
        }
      ]
      
      environment = [
        {
          name  = "NODE_ENV"
          value = var.environment
        },
        {
          name  = "REACT_APP_API_URL"
          value = "https://api.example.com"
        }
      ]
      
      logConfiguration = var.cloudwatch_logs ? {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.frontend[0].name
          awslogs-region        = "us-east-1"
          awslogs-stream-prefix = "ecs"
        }
      } : null
      
      healthCheck = {
        command     = ["CMD-SHELL", "curl -f http://localhost/ || exit 1"]
        interval    = 30
        timeout     = 10
        retries     = 3
        startPeriod = 60
      }
    }
  ])
  
  tags = {
    Name        = "${var.project_name}-frontend-task"
    Environment = var.environment
  }
}

# Backend Service
resource "aws_ecs_service" "backend" {
  name                               = "${var.project_name}-backend-service-${var.environment}"
  cluster                            = aws_ecs_cluster.main.id
  task_definition                    = aws_ecs_task_definition.backend.arn
  desired_count                      = var.desired_count
  launch_type                        = "FARGATE"
  health_check_grace_period_seconds  = 120
  
  network_configuration {
    subnets          = var.public_subnet_ids
    security_groups  = [var.security_group_ids.ecs]
    assign_public_ip = true
  }
  
  load_balancer {
    target_group_arn = aws_lb_target_group.backend.arn
    container_name   = "${var.project_name}-backend"
    container_port   = var.container_port
  }
  
  deployment_controller {
    type = "ECS"
  }
  
  tags = {
    Name        = "${var.project_name}-backend-service"
    Environment = var.environment
  }
  
  depends_on = [aws_lb_listener_rule.backend]
}

# Frontend Service
resource "aws_ecs_service" "frontend" {
  name                               = "${var.project_name}-frontend-service-${var.environment}"
  cluster                            = aws_ecs_cluster.main.id
  task_definition                    = aws_ecs_task_definition.frontend.arn
  desired_count                      = var.desired_count
  launch_type                        = "FARGATE"
  health_check_grace_period_seconds  = 120
  
  network_configuration {
    subnets          = var.public_subnet_ids
    security_groups  = [var.security_group_ids.ecs]
    assign_public_ip = true
  }
  
  load_balancer {
    target_group_arn = aws_lb_target_group.frontend.arn
    container_name   = "${var.project_name}-frontend"
    container_port   = 80
  }
  
  deployment_controller {
    type = "ECS"
  }
  
  tags = {
    Name        = "${var.project_name}-frontend-service"
    Environment = var.environment
  }
  
  depends_on = [aws_lb_listener.http]
}

# Auto Scaling for Backend
resource "aws_appautoscaling_target" "backend" {
  max_capacity       = 10
  min_capacity       = var.desired_count
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.backend.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "backend_cpu" {
  name               = "${var.project_name}-backend-cpu-scaling-${var.environment}"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.backend.resource_id
  scalable_dimension = aws_appautoscaling_target.backend.scalable_dimension
  service_namespace  = aws_appautoscaling_target.backend.service_namespace
  
  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    
    target_value       = 70.0
    scale_in_cooldown  = 300
    scale_out_cooldown = 60
  }
}

# Auto Scaling for Frontend
resource "aws_appautoscaling_target" "frontend" {
  max_capacity       = 10
  min_capacity       = var.desired_count
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.frontend.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "frontend_cpu" {
  name               = "${var.project_name}-frontend-cpu-scaling-${var.environment}"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.frontend.resource_id
  scalable_dimension = aws_appautoscaling_target.frontend.scalable_dimension
  service_namespace  = aws_appautoscaling_target.frontend.service_namespace
  
  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    
    target_value       = 70.0
    scale_in_cooldown  = 300
    scale_out_cooldown = 60
  }
}

# Outputs
output "cluster_name" {
  description = "Name of the ECS cluster"
  value       = aws_ecs_cluster.main.name
}

output "service_names" {
  description = "Names of the ECS services"
  value       = [aws_ecs_service.backend.name, aws_ecs_service.frontend.name]
}

output "lb_dns_name" {
  description = "DNS name of the load balancer"
  value       = aws_lb.main.dns_name
}

output "backend_target_group_arn" {
  description = "ARN of the backend target group"
  value       = aws_lb_target_group.backend.arn
}

output "frontend_target_group_arn" {
  description = "ARN of the frontend target group"
  value       = aws_lb_target_group.frontend.arn
}