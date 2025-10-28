output "zone_ids" {
  description = "Map of domain to zone ID"
  value = var.create_zone ? {
    (local.main_domain) = aws_route53_zone.main[0].zone_id
  } : {
    for domain in var.domain_names :
    domain => data.aws_route53_zone.selected[local.domain_zone_mapping[domain]].zone_id
  }
}

output "nameservers" {
  description = "Nameservers for the hosted zone if created"
  value       = var.create_zone ? aws_route53_zone.main[0].name_servers : null
}
