variable "tables" {
  description = "DynamoDB tables configuration"
  type = list(object({
    name           = string
    hash_key       = string
    range_key      = optional(string)
    billing_mode   = string
    read_capacity  = optional(number)
    write_capacity = optional(number)
    attributes = list(object({
      name = string
      type = string
    }))
    global_secondary_indexes = optional(list(object({
      name               = string
      hash_key           = string
      range_key          = optional(string)
      projection_type    = string
      non_key_attributes = optional(list(string))
      read_capacity      = optional(number)
      write_capacity     = optional(number)
    })))
  }))
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "project_name" {
  description = "Name of the project"
  type        = string
}
