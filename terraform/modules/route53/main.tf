locals {
  main_domain = var.create_zone ? var.domain_names[0] : ""
  domain_zone_mapping = {
    for domain in var.domain_names :
    domain => join(".", slice(split(".", domain), length(split(".", domain)) - 2, length(split(".", domain))))
  }
}

# Hosted Zone (Optional)
resource "aws_route53_zone" "main" {
  count = var.create_zone ? 1 : 0
  name  = local.main_domain
}

# Find existing hosted zones
data "aws_route53_zone" "selected" {
  for_each     = toset([for domain in var.domain_names : join(".", slice(split(".", domain), length(split(".", domain)) - 2, length(split(".", domain))))])
  name         = each.key
  private_zone = false
}

# Records for each domain
resource "aws_route53_record" "alias" {
  for_each = toset(var.domain_names)
  
  zone_id = var.create_zone && each.value == local.main_domain ? aws_route53_zone.main[0].zone_id : data.aws_route53_zone.selected[local.domain_zone_mapping[each.value]].zone_id
  name    = each.value
  type    = "A"
  
  alias {
    name                   = var.cloudfront_domain
    zone_id                = var.cloudfront_zone_id
    evaluate_target_health = false
  }
}

# AAAA records for IPv6 support
resource "aws_route53_record" "alias_ipv6" {
  for_each = toset(var.domain_names)
  
  zone_id = var.create_zone && each.value == local.main_domain ? aws_route53_zone.main[0].zone_id : data.aws_route53_zone.selected[local.domain_zone_mapping[each.value]].zone_id
  name    = each.value
  type    = "AAAA"
  
  alias {
    name                   = var.cloudfront_domain
    zone_id                = var.cloudfront_zone_id
    evaluate_target_health = false
  }
}

