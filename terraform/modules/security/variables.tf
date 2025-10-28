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
