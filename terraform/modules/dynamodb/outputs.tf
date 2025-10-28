output "table_names" {
  description = "Names of the created DynamoDB tables"
  value = { for name, table in aws_dynamodb_table.tables : name => table.name }
}

output "table_arns" {
  description = "ARNs of the created DynamoDB tables"
  value = { for name, table in aws_dynamodb_table.tables : name => table.arn }
}
