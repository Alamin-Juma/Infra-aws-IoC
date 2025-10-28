variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "bucket_name" {
  description = "Name of the S3 bucket"
  type        = string
}

variable "enable_website" {
  description = "Enable static website hosting"
  type        = bool
  default     = false
}

variable "cors_allowed_origins" {
  description = "List of CORS allowed origins"
  type        = list(string)
  default     = ["*"]
}

variable "lifecycle_rules" {
  description = "Lifecycle rules for the S3 bucket"
  type = list(object({
    id                                     = string
    enabled                                = bool
    prefix                                 = optional(string)
    expiration_days                        = optional(number)
    noncurrent_version_expiration_days     = optional(number)
    abort_incomplete_multipart_upload_days = optional(number)
    transition_rules = optional(list(object({
      days          = number
      storage_class = string
    })))
  }))
  default = []
}
