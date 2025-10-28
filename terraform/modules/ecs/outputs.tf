output "cluster_name" {
  description = "Name of the ECS cluster"
  value       = aws_ecs_cluster.main.name
}

output "service_names" {
  description = "Names of the ECS services"
  value       = [aws_ecs_service.backend.name]  # Frontend removed - using S3+CloudFront
}

output "backend_service_name" {
  description = "Name of the backend ECS service"
  value       = aws_ecs_service.backend.name
}

# Frontend outputs - DISABLED (using S3 + CloudFront instead)
# output "frontend_service_name" {
#   description = "Name of the frontend ECS service"
#   value       = aws_ecs_service.frontend.name
# }

output "backend_task_definition_family" {
  description = "Family name of the backend task definition"
  value       = aws_ecs_task_definition.backend.family
}

# output "frontend_task_definition_family" {
#   description = "Family name of the frontend task definition"
#   value       = aws_ecs_task_definition.frontend.family
# }

output "lb_dns_name" {
  description = "DNS name of the load balancer"
  value       = aws_lb.main.dns_name
}

output "alb_dns_name" {
  description = "DNS name of the Application Load Balancer"
  value       = aws_lb.main.dns_name
}

output "alb_name" {
  description = "Name of the Application Load Balancer"
  value       = aws_lb.main.name
}

output "alb_arn" {
  description = "ARN of the Application Load Balancer"
  value       = aws_lb.main.arn
}

output "backend_target_group_arn" {
  description = "ARN of the backend target group"
  value       = aws_lb_target_group.backend.arn
}

# output "frontend_target_group_arn" {
#   description = "ARN of the frontend target group"
#   value       = aws_lb_target_group.frontend.arn
# }
