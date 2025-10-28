output "web_acl_id" {
  description = "The ID of the WAF WebACL"
  value       = aws_wafv2_web_acl.api_protection.id
}

output "web_acl_arn" {
  description = "The ARN of the WAF WebACL"
  value       = aws_wafv2_web_acl.api_protection.arn
}
