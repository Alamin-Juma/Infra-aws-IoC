output "repository_urls" {
  description = "Map of repository names to repository URLs"
  value = { for name in var.repositories : name => aws_ecr_repository.repos[name].repository_url }
}
