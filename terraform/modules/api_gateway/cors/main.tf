variable "api_id" {
  description = "ID of the API Gateway"
  type        = string
}

variable "api_resource_id" {
  description = "ID of the API resource"
  type        = string
}

variable "allow_origin" {
  description = "Allowed origins for CORS"
  type        = string
  default     = "*"
}

variable "allow_headers" {
  description = "Allowed headers for CORS"
  type        = list(string)
  default     = ["Content-Type", "X-Amz-Date", "Authorization", "X-Api-Key"]
}

variable "allow_methods" {
  description = "Allowed methods for CORS"
  type        = list(string)
  default     = ["GET", "OPTIONS", "POST", "PUT", "DELETE"]
}

variable "allow_credentials" {
  description = "Allow credentials for CORS"
  type        = bool
  default     = false
}

# OPTIONS method for CORS
resource "aws_api_gateway_method" "options" {
  rest_api_id   = var.api_id
  resource_id   = var.api_resource_id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

# Mock integration for OPTIONS
resource "aws_api_gateway_integration" "options" {
  rest_api_id = var.api_id
  resource_id = var.api_resource_id
  http_method = aws_api_gateway_method.options.http_method
  
  type = "MOCK"
  
  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

# CORS response headers
resource "aws_api_gateway_method_response" "options" {
  rest_api_id = var.api_id
  resource_id = var.api_resource_id
  http_method = aws_api_gateway_method.options.http_method
  status_code = "200"
  
  response_models = {
    "application/json" = "Empty"
  }
  
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true,
    "method.response.header.Access-Control-Allow-Methods" = true,
    "method.response.header.Access-Control-Allow-Origin"  = true,
    "method.response.header.Access-Control-Allow-Credentials" = true
  }
}

# CORS integration response
resource "aws_api_gateway_integration_response" "options" {
  rest_api_id = var.api_id
  resource_id = var.api_resource_id
  http_method = aws_api_gateway_method.options.http_method
  status_code = aws_api_gateway_method_response.options.status_code
  
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'${join(",", var.allow_headers)}'",
    "method.response.header.Access-Control-Allow-Methods" = "'${join(",", var.allow_methods)}'",
    "method.response.header.Access-Control-Allow-Origin"  = "'${var.allow_origin}'",
    "method.response.header.Access-Control-Allow-Credentials" = "'${var.allow_credentials}'"
  }
}