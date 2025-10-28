variable "domain_names" {
  description = "List of domain names"
  type        = list(string)
}

variable "cloudfront_domain" {
  description = "CloudFront distribution domain name"
  type        = string
}

variable "cloudfront_zone_id" {
  description = "CloudFront distribution hosted zone ID"
  type        = string
}

variable "create_zone" {
  description = "Create a new hosted zone"
  type        = bool
  default     = false
}
