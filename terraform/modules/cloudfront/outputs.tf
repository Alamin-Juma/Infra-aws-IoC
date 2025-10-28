output "distribution_id" {
  description = "ID of the CloudFront distribution"
  value       = aws_cloudfront_distribution.main.id
}

output "domain_name" {
  description = "Domain name of the CloudFront distribution"
  value       = aws_cloudfront_distribution.main.domain_name
}

output "hosted_zone_id" {
  description = "Route 53 hosted zone ID of the CloudFront distribution"
  value       = aws_cloudfront_distribution.main.hosted_zone_id
}

output "origin_access_identity" {
  description = "CloudFront Origin Access Identity"
  value       = aws_cloudfront_origin_access_identity.main.cloudfront_access_identity_path
}

output "s3_policy_document" {
  description = "IAM policy document for S3 bucket"
  value       = data.aws_iam_policy_document.s3_cloudfront_access.json
}
