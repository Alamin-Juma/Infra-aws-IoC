variable "environment" {
  description = "Environment name"
  type        = string
}

variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "vpc_id" {
  description = "ID of the VPC"
  type        = string
}

variable "subnet_ids" {
  description = "IDs of subnets where Lambda functions will run"
  type        = list(string)
}

variable "security_group_ids" {
  description = "Security group IDs for Lambda functions"
  type        = list(string)
}

variable "lambda_functions" {
  description = "Lambda functions configuration"
  type = list(object({
    name          = string
    runtime       = string
    handler       = string
    timeout       = number
    memory_size   = number
    zip_file      = string
    environment_variables = optional(map(string))
  }))
}

variable "dynamo_table_arns" {
  description = "ARNs of DynamoDB tables that Lambda functions can access"
  type        = list(string)
  default     = []
}

variable "api_gateway_id" {
  description = "ID of the API Gateway"
  type        = string
}

variable "cognito_authorizer_id" {
  description = "ID of the Cognito authorizer for API Gateway"
  type        = string
  default     = ""
}

variable "api_gateway_root_resource_id" {
  description = "ID of the root resource of the API Gateway"
  type        = string
}

variable "aws_region" {
  description = "AWS region where resources are created"
  type        = string
  default     = "us-east-1"
}

variable "aws_account_id" {
  description = "AWS account ID"
  type        = string
}

# IAM role for Lambda functions
resource "aws_iam_role" "lambda_role" {
  name = "${var.project_name}-lambda-role-${var.environment}"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
  
  tags = {
    Name        = "${var.project_name}-lambda-role"
    Environment = var.environment
  }
}

# Lambda basic execution policy
resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Lambda VPC execution policy
resource "aws_iam_role_policy_attachment" "lambda_vpc" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

# Custom policy for DynamoDB access
resource "aws_iam_policy" "lambda_dynamodb_policy" {
  name        = "${var.project_name}-lambda-dynamodb-policy-${var.environment}"
  description = "IAM policy for Lambda to access DynamoDB tables"
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:Scan",
          "dynamodb:BatchGetItem",
          "dynamodb:BatchWriteItem",
        ]
        Effect   = "Allow"
        Resource = length(var.dynamo_table_arns) > 0 ? var.dynamo_table_arns : ["*"]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_dynamodb" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = aws_iam_policy.lambda_dynamodb_policy.arn
}

# Lambda functions
resource "aws_lambda_function" "functions" {
  for_each = { for func in var.lambda_functions : func.name => func }
  
  function_name = "${var.project_name}-${each.key}-${var.environment}"
  role          = aws_iam_role.lambda_role.arn
  handler       = each.value.handler
  runtime       = each.value.runtime
  filename      = each.value.zip_file
  timeout       = each.value.timeout
  memory_size   = each.value.memory_size
  
  vpc_config {
    subnet_ids         = var.subnet_ids
    security_group_ids = var.security_group_ids
  }
  
  dynamic "environment" {
    for_each = each.value.environment_variables != null ? [1] : []
    content {
      variables = each.value.environment_variables
    }
  }
  
  tracing_config {
    mode = "Active"
  }
  
  tags = {
    Name        = "${var.project_name}-${each.key}"
    Environment = var.environment
  }
}

# CloudWatch Log Groups for Lambda functions
resource "aws_cloudwatch_log_group" "lambda_logs" {
  for_each = { for func in var.lambda_functions : func.name => func }
  
  name              = "/aws/lambda/${var.project_name}-${each.key}-${var.environment}"
  retention_in_days = 14
  
  tags = {
    Name        = "${var.project_name}-${each.key}-logs"
    Environment = var.environment
  }
}

# API Gateway Integration
# We'll use the API Gateway ID directly without the data source

# Create API resource path
resource "aws_api_gateway_resource" "lambda_resource" {
  for_each    = { for func in var.lambda_functions : func.name => func }
  
  rest_api_id = var.api_gateway_id
  parent_id   = var.api_gateway_root_resource_id
  path_part   = each.key
}

# HTTP Methods for each Lambda function
resource "aws_api_gateway_method" "lambda_method" {
  for_each      = { for func in var.lambda_functions : func.name => func }
  
  rest_api_id   = var.api_gateway_id
  resource_id   = aws_api_gateway_resource.lambda_resource[each.key].id
  http_method   = "ANY"
  authorization = "COGNITO_USER_POOLS"
  
  # Get the authorizer ID from the API Gateway outputs instead of using data source
  authorizer_id = var.cognito_authorizer_id
}

# Lambda Integration with API Gateway
resource "aws_api_gateway_integration" "lambda_integration" {
  for_each                = { for func in var.lambda_functions : func.name => func }
  
  rest_api_id             = var.api_gateway_id
  resource_id             = aws_api_gateway_resource.lambda_resource[each.key].id
  http_method             = aws_api_gateway_method.lambda_method[each.key].http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.functions[each.key].invoke_arn
}

# Permission for API Gateway to invoke Lambda
resource "aws_lambda_permission" "api_gateway" {
  for_each      = { for func in var.lambda_functions : func.name => func }
  
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.functions[each.key].function_name
  principal     = "apigateway.amazonaws.com"
  
  # Allow invocation from any stage of the API Gateway
  source_arn = "arn:aws:execute-api:${var.aws_region}:${var.aws_account_id}:${var.api_gateway_id}/*/*/${each.key}"
}

# Outputs
output "function_names" {
  description = "Names of the created Lambda functions"
  value       = [for func in aws_lambda_function.functions : func.function_name]
}

output "function_arns" {
  description = "ARNs of the created Lambda functions"
  value       = [for func in aws_lambda_function.functions : func.arn]
}

output "lambda_role_arn" {
  description = "ARN of the Lambda IAM role"
  value       = aws_iam_role.lambda_role.arn
}