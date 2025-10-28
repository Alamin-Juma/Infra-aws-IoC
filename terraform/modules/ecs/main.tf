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

# Frontend Target Group - DISABLED (using S3 + CloudFront instead)
# resource "aws_lb_target_group" "frontend" {
#   name        = "pinfra-fe-tg-${var.environment}"
#   port        = 80
#   protocol    = "HTTP"
#   vpc_id      = var.vpc_id
#   target_type = "ip"
#   
#   health_check {
#     path                = "/"
#     interval            = 30
#     timeout             = 10
#     healthy_threshold   = 3
#     unhealthy_threshold = 3
#     matcher             = "200-299"
#   }
#   
#   tags = {
#     Name        = "${var.project_name}-frontend-tg"
#     Environment = var.environment
#   }
# }

# Listeners
# HTTP Listener - Redirect to HTTPS
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"
  
  default_action {
    type = "redirect"
    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

# HTTPS Listener
resource "aws_lb_listener" "https" {
  count             = var.certificate_arn != "" ? 1 : 0
  load_balancer_arn = aws_lb.main.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = var.certificate_arn
  
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend.arn
  }
}


# Optional: Frontend listener rule (disabled for now - backend only deployment)
# resource "aws_lb_listener_rule" "frontend" {
#   listener_arn = aws_lb_listener.http.arn
#   priority     = 20
#
#   action {
#     type             = "forward"
#     target_group_arn = aws_lb_target_group.frontend.arn
#   }
#
#   condition {
#     host_header {
#       values = ["www.itrack.com", "itrack.com"]
#     }
#   }
# }

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
        },
        {
          name  = "DATABASE_URL"
          value = var.database_url
        },
        {
          name  = "POSTGRES_HOST"
          value = var.db_host
        },
        {
          name  = "POSTGRES_DB"
          value = var.db_name
        },
        {
          name  = "POSTGRES_USER"
          value = var.db_user
        },
        {
          name  = "POSTGRES_PASSWORD"
          value = var.db_password
        },
        {
          name  = "JWT_SECRET"
          value = var.jwt_secret != "" ? var.jwt_secret : "change-this-secret-in-production-${var.environment}"
        },
        {
          name  = "ADMIN_EMAIL"
          value = var.admin_email != "" ? var.admin_email : "admin@itrack.com"
        },
        {
          name  = "ADMIN_PASSWORD"
          value = var.admin_password != "" ? var.admin_password : "ChangeMe123!"
        },
        {
          name  = "DEFAULT_USER_PASSWORD"
          value = var.admin_password != "" ? var.admin_password : "ChangeMe123!"
        },
        {
          name  = "FRONTEND_URL"
          value = var.frontend_url
        },
         {
          name  = "FRONTEND_URL_PROD"
          value = var.frontend_prod_url
        },
        {
          name  = "API_BASE_URL"
          value = var.api_base_url
        },
        {
          name  = "API_BASE_URL_PROD"
          value = var.api_base_url_prod
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

# Frontend Task Definition - DISABLED (using S3 + CloudFront instead)
# resource "aws_ecs_task_definition" "frontend" {
#   family                   = "${var.project_name}-frontend-${var.environment}"
#   network_mode             = "awsvpc"
#   requires_compatibilities = ["FARGATE"]
#   cpu                      = var.cpu
#   memory                   = var.memory
#   execution_role_arn       = aws_iam_role.task_execution_role.arn
#   task_role_arn            = aws_iam_role.task_role.arn
#   
#   container_definitions = jsonencode([
#     {
#       name      = "${var.project_name}-frontend"
#       image     = var.frontend_image
#       essential = true
#       
#       portMappings = [
#         {
#           containerPort = 80
#           hostPort      = 80
#           protocol      = "tcp"
#         }
#       ]
#       
#       environment = [
#         {
#           name  = "NODE_ENV"
#           value = var.environment
#         },
#         {
#           name  = "REACT_APP_API_URL"
#           value = "https://api.example.com"
#         }
#       ]
#       
#       logConfiguration = var.cloudwatch_logs ? {
#         logDriver = "awslogs"
#         options = {
#           awslogs-group         = aws_cloudwatch_log_group.frontend[0].name
#           awslogs-region        = "us-east-1"
#           awslogs-stream-prefix = "ecs"
#         }
#       } : null
#       
#       healthCheck = {
#         command     = ["CMD-SHELL", "curl -f http://localhost/ || exit 1"]
#         interval    = 30
#         timeout     = 10
#         retries     = 3
#         startPeriod = 60
#       }
#     }
#   ])
#   
#   tags = {
#     Name        = "${var.project_name}-frontend-task"
#     Environment = var.environment
#   }
# }

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
  
  depends_on = [aws_lb_listener.http]
}

# Frontend Service - DISABLED (using S3 + CloudFront instead)
# resource "aws_ecs_service" "frontend" {
#   name                               = "${var.project_name}-frontend-service-${var.environment}"
#   cluster                            = aws_ecs_cluster.main.id
#   task_definition                    = aws_ecs_task_definition.frontend.arn
#   desired_count                      = var.desired_count
#   launch_type                        = "FARGATE"
#   health_check_grace_period_seconds  = 120
#   
#   network_configuration {
#     subnets          = var.public_subnet_ids
#     security_groups  = [var.security_group_ids.ecs]
#     assign_public_ip = true
#   }
#   
#   load_balancer {
#     target_group_arn = aws_lb_target_group.frontend.arn
#     container_name   = "${var.project_name}-frontend"
#     container_port   = 80
#   }
#   
#   deployment_controller {
#     type = "ECS"
#   }
#   
#   tags = {
#     Name        = "${var.project_name}-frontend-service"
#     Environment = var.environment
#   }
#   
#   depends_on = [aws_lb_listener.http]
# }

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

# Auto Scaling for Frontend - DISABLED (using S3 + CloudFront instead)
# resource "aws_appautoscaling_target" "frontend" {
#   max_capacity       = 10
#   min_capacity       = var.desired_count
#   resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.frontend.name}"
#   scalable_dimension = "ecs:service:DesiredCount"
#   service_namespace  = "ecs"
# }
# 
# resource "aws_appautoscaling_policy" "frontend_cpu" {
#   name               = "${var.project_name}-frontend-cpu-scaling-${var.environment}"
#   policy_type        = "TargetTrackingScaling"
#   resource_id        = aws_appautoscaling_target.frontend.resource_id
#   scalable_dimension = aws_appautoscaling_target.frontend.scalable_dimension
#   service_namespace  = aws_appautoscaling_target.frontend.service_namespace
#   
#   target_tracking_scaling_policy_configuration {
#     predefined_metric_specification {
#       predefined_metric_type = "ECSServiceAverageCPUUtilization"
#     }
#     
#     target_value       = 70.0
#     scale_in_cooldown  = 300
#     scale_out_cooldown = 60
#   }
# }

