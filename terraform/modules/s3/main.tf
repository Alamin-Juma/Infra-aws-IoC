resource "aws_s3_bucket" "main" {
  bucket = var.bucket_name
  
  tags = {
    Name        = var.bucket_name
    Environment = var.environment
    Project     = var.project_name
  }

  # Prevent accidental bucket deletion
  lifecycle {
    prevent_destroy = true
  }
}

# Block public access by default
resource "aws_s3_bucket_public_access_block" "main" {
  bucket = aws_s3_bucket.main.id
  
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Server-side encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "main" {
  bucket = aws_s3_bucket.main.id
  
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Versioning
resource "aws_s3_bucket_versioning" "main" {
  bucket = aws_s3_bucket.main.id
  
  versioning_configuration {
    status = "Enabled"
  }
}

# Website configuration (if enabled)
resource "aws_s3_bucket_website_configuration" "main" {
  count = var.enable_website ? 1 : 0
  
  bucket = aws_s3_bucket.main.id
  
  index_document {
    suffix = "index.html"
  }
  
  error_document {
    key = "error.html"
  }
}

# CORS Configuration
resource "aws_s3_bucket_cors_configuration" "main" {
  bucket = aws_s3_bucket.main.id
  
  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "HEAD"]
    allowed_origins = var.cors_allowed_origins
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

# Lifecycle Rules
resource "aws_s3_bucket_lifecycle_configuration" "main" {
  count = length(var.lifecycle_rules) > 0 ? 1 : 0
  
  bucket = aws_s3_bucket.main.id
  
  dynamic "rule" {
    for_each = var.lifecycle_rules
    
    content {
      id     = rule.value.id
      status = rule.value.enabled ? "Enabled" : "Disabled"
      
      dynamic "filter" {
        for_each = rule.value.prefix != null ? [rule.value.prefix] : []
        content {
          prefix = filter.value
        }
      }
      
      dynamic "transition" {
        for_each = rule.value.transition_rules != null ? rule.value.transition_rules : []
        
        content {
          days          = transition.value.days
          storage_class = transition.value.storage_class
        }
      }
      
      dynamic "expiration" {
        for_each = rule.value.expiration_days != null ? [rule.value.expiration_days] : []
        
        content {
          days = expiration.value
        }
      }
      
      dynamic "noncurrent_version_expiration" {
        for_each = rule.value.noncurrent_version_expiration_days != null ? [rule.value.noncurrent_version_expiration_days] : []
        
        content {
          noncurrent_days = noncurrent_version_expiration.value
        }
      }
      
      dynamic "abort_incomplete_multipart_upload" {
        for_each = rule.value.abort_incomplete_multipart_upload_days != null ? [rule.value.abort_incomplete_multipart_upload_days] : []
        
        content {
          days_after_initiation = abort_incomplete_multipart_upload.value
        }
      }
    }
  }
}

