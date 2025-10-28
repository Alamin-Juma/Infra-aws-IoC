resource "aws_dynamodb_table" "tables" {
  for_each = { for idx, table in var.tables : table.name => table }
  
  name         = "${var.project_name}-${each.value.name}-${var.environment}"
  billing_mode = each.value.billing_mode
  hash_key     = each.value.hash_key
  range_key    = each.value.range_key
  
  # Provisioned capacity if not using on-demand
  read_capacity  = each.value.billing_mode == "PROVISIONED" ? each.value.read_capacity : null
  write_capacity = each.value.billing_mode == "PROVISIONED" ? each.value.write_capacity : null
  
  # Attributes
  dynamic "attribute" {
    for_each = each.value.attributes
    content {
      name = attribute.value.name
      type = attribute.value.type
    }
  }
  
  # Global Secondary Indexes
  dynamic "global_secondary_index" {
    for_each = each.value.global_secondary_indexes != null ? each.value.global_secondary_indexes : []
    content {
      name               = global_secondary_index.value.name
      hash_key           = global_secondary_index.value.hash_key
      range_key          = global_secondary_index.value.range_key
      projection_type    = global_secondary_index.value.projection_type
      non_key_attributes = global_secondary_index.value.non_key_attributes
      
      # Provisioned capacity if not using on-demand
      read_capacity  = each.value.billing_mode == "PROVISIONED" ? global_secondary_index.value.read_capacity : null
      write_capacity = each.value.billing_mode == "PROVISIONED" ? global_secondary_index.value.write_capacity : null
    }
  }
  
  # Time to Live (disabled due to permission restrictions)
  # ttl {
  #   attribute_name = "TTL"
  #   enabled        = true
  # }
  
  # Enable point-in-time recovery for production
  point_in_time_recovery {
    enabled = var.environment == "production" ? true : false
  }
  
  # Enable server-side encryption
  server_side_encryption {
    enabled = true
  }
  
  tags = {
    Name        = "${var.project_name}-${each.value.name}"
    Environment = var.environment
  }
}

