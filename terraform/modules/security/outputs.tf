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
