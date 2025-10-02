# iTrack AWS Architecture

This project implements a production-ready AWS architecture for the iTrack application as shown in the architecture diagram. The implementation uses Terraform for infrastructure as code and follows best practices for security, scalability, and maintainability.

## Architecture Components

The architecture consists of the following components:

- **VPC with public and private subnets**: Secure network isolation with public subnets for internet-facing resources and private subnets for backend resources.
- **API Gateway**: Managed API endpoint with authentication, rate limiting, and WAF protection.
- **Cognito**: User authentication and authorization service.
- **Lambda Functions**: Serverless compute for API handlers.
- **DynamoDB**: NoSQL database for storing application data.
- **RDS**: Relational database for structured data.
- **ECS/Fargate**: Container orchestration for the backend Node.js application.
- **S3 + CloudFront**: Hosting and content delivery for the frontend React application.
- **CloudWatch**: Monitoring, logging, and alerting.

## Project Structure

```
NewArchitecture/
  ├── terraform/                # Terraform infrastructure code
  │   ├── main.tf              # Main Terraform configuration
  │   ├── variables.tf         # Variable definitions
  │   └── modules/             # Reusable Terraform modules
  │       ├── vpc/             # VPC and networking
  │       ├── security/        # Security groups and IAM
  │       ├── cognito/         # User authentication
  │       ├── api_gateway/     # API Gateway with CORS
  │       ├── dynamodb/        # NoSQL database
  │       ├── ecr/             # Container registry
  │       └── ...              # Other modules
  ├── backend/                 # Node.js backend application
  │   ├── app.js              # Main application file
  │   ├── package.json        # Node.js dependencies
  │   └── Dockerfile          # Container definition
  └── frontend/               # React frontend application
      ├── src/                # React source code
      │   ├── components/     # Reusable React components
      │   ├── pages/          # Page components
      │   ├── App.js          # Main React application
      │   └── index.js        # Entry point
      ├── package.json        # Frontend dependencies
      └── Dockerfile          # Frontend container definition
```

## Deployment Instructions

### Prerequisites

1. AWS CLI configured with appropriate credentials
2. Terraform CLI installed
3. Node.js and npm installed
4. Docker installed

### Setup Steps

1. **Bootstrap Terraform remote state (S3 + DynamoDB)**:
   ```bash
   make setup-state ENVIRONMENT=staging AWS_REGION=us-east-1
   make setup-state ENVIRONMENT=production AWS_REGION=us-east-1
   ```

2. **Initialize Terraform**:
   ```bash
   cd terraform
   terraform init
   ```

3. **Create `terraform.tfvars` file**:
   ```
   aws_region     = "us-east-1"
   environment    = "production"
   project_name   = "itrack"
   db_username    = "appadmin"
   db_password    = "secure-password-here"
   ```

4. **Plan and apply infrastructure**:
   ```bash
   terraform plan -out=tfplan
   terraform apply tfplan
   ```

5. **Build and push Docker images**:
   ```bash
   # Build and push backend image
   cd ../backend
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <aws-account-id>.dkr.ecr.us-east-1.amazonaws.com
   docker build -t itrack-backend .
   docker tag itrack-backend:latest <aws-account-id>.dkr.ecr.us-east-1.amazonaws.com/itrack-backend:latest
   docker push <aws-account-id>.dkr.ecr.us-east-1.amazonaws.com/itrack-backend:latest
   
   # Build and push frontend image
   cd ../frontend
   docker build -t itrack-frontend .
   docker tag itrack-frontend:latest <aws-account-id>.dkr.ecr.us-east-1.amazonaws.com/itrack-frontend:latest
   docker push <aws-account-id>.dkr.ecr.us-east-1.amazonaws.com/itrack-frontend:latest
   ```

## Security Considerations

The architecture implements multiple security layers:

1. **Network Security**: 
   - Private subnets for sensitive resources
   - Security groups limiting access
   - VPC flow logs for traffic monitoring

2. **Application Security**:
   - Cognito for authentication
   - WAF for API Gateway protection
   - CORS configuration
   - HTTPS/TLS encryption

3. **Data Security**:
   - Encrypted data at rest (DynamoDB, RDS, S3)
   - Encrypted data in transit (HTTPS)
   - Least privilege IAM policies

4. **Operational Security**:
   - CloudWatch monitoring and alarms
   - Centralized logging
   - State file encryption and locking

## Maintenance and Scaling

The architecture is designed for easy maintenance and scaling:

1. **Horizontal Scaling**:
   - ECS tasks can scale based on demand
   - DynamoDB can scale read/write capacity
   - API Gateway scales automatically

2. **High Availability**:
   - Multi-AZ deployment
   - RDS multi-AZ for database failover
   - CloudFront for global content delivery

3. **Monitoring**:
   - CloudWatch dashboards and alarms
   - Performance metrics collection
   - Health checks for all components

## Future Improvements

1. Add CI/CD pipeline with GitHub Actions or AWS CodePipeline
2. Implement automated testing and deployment
3. Add blue-green deployment for zero-downtime updates
4. Implement disaster recovery strategy
5. Add API versioning strategy

## Cost Optimization

The architecture includes several cost optimization strategies:

1. **Auto-scaling resources**:
   - ECS tasks scale based on demand
   - DynamoDB on-demand capacity
   - Scale down resources during off-hours

2. **Storage optimization**:
   - S3 lifecycle policies for cheaper storage tiers
   - RDS storage auto-scaling
   - CloudFront caching to reduce origin requests

3. **Reserved capacity options**:
   - Reserved Instances for predictable workloads
   - Savings Plans for compute resources
   - Reserved Capacity for RDS instances

4. **Monitoring costs**:
   - CloudWatch custom metrics and dashboards
   - Budget alerts and anomaly detection
   - Resource tagging for cost allocation

## CloudWatch Monitoring

The monitoring module includes:

1. **Dashboards**:
   - Service-specific dashboards for ECS, RDS, Lambda, and API Gateway
   - System-wide overview dashboard
   - Custom metrics for application performance

2. **Alarms**:
   - CPU and memory utilization
   - Error rates and latency
   - Database connection and performance metrics
   - Lambda execution and error metrics

3. **Notification system**:
   - SNS topics for alerting
   - Email notifications for critical events
   - Integration with on-call systems (optional)

4. **Log management**:
   - Centralized logging
   - Log retention policies
   - Log insights for troubleshooting