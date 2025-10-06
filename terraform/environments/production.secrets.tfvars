# Sensitive Production Variables
# DO NOT COMMIT TO VERSION CONTROL

# Database credentials
db_username = "postgres"
db_password = "alamindev254"

# Secrets Manager variables
sensitive_secrets = {
  db_password = {
    description = "RDS database password"
    value       = "alamindev254"
  }
  jwt_secret = {
    description = "JWT secret for authentication"
    value       = "jitu-itrack-jwt-secret"
  }
  api_key = {
    description = "External API key"
    value       = "your-api-key-here"
  }
  admin_password = {
    description = "Admin user password"
    value       = "123456Nairobi!"
  }
  email_password = {
    description = "Email service password"
    value       = "123456Nairobi!"
  }
}