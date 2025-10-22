# S3 bucket for cost-effective log archiving (optional)
resource "aws_s3_bucket" "logs_archive" {
  count  = var.enable_s3_log_archive ? 1 : 0
  bucket = "${var.project_name}-logs-archive-${var.environment}"
  
  tags = {
    Name        = "${var.project_name}-logs-archive"
    Environment = var.environment
    Purpose     = "Cost-effective log storage"
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "logs_lifecycle" {
  count  = var.enable_s3_log_archive ? 1 : 0
  bucket = aws_s3_bucket.logs_archive[0].id

  rule {
    id     = "archive-old-logs"
    status = "Enabled"

    transition {
      days          = 30
      storage_class = "GLACIER"
    }

    expiration {
      days = var.s3_log_expiration_days
    }
  }
}

resource "aws_s3_bucket_versioning" "logs_versioning" {
  count  = var.enable_s3_log_archive ? 1 : 0
  bucket = aws_s3_bucket.logs_archive[0].id

  versioning_configuration {
    status = "Disabled"
  }
}

resource "aws_s3_bucket_public_access_block" "logs_public_access" {
  count  = var.enable_s3_log_archive ? 1 : 0
  bucket = aws_s3_bucket.logs_archive[0].id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}