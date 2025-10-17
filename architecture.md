# ProdReady Infra - Complete Architecture and Deployment Guide

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture Components](#architecture-components)
3. [Infrastructure Deep Dive](#infrastructure-deep-dive)
4. [Terraform Structure](#terraform-structure)
5. [Health Check Issues & Solutions](#health-check-issues--solutions)
6. [Port Configuration](#port-configuration)
7. [CI/CD Pipeline Deep Dive](#cicd-pipeline-deep-dive)
8. [Complete Deployment Timeline](#complete-deployment-timeline)
9. [State Management](#state-management)
10. [Troubleshooting Guide](#troubleshooting-guide)
11. [Best Practices](#best-practices)
12. [Deployment Checklist](#deployment-checklist)
13. [Quick Reference](#quick-reference)

---

## Overview

This document provides a comprehensive guide to understanding, deploying, and troubleshooting the **ProdReady_Infra** AWS infrastructure. It's designed as a teaching resource for:

- Modern cloud infrastructure with **Infrastructure as Code (IaC)**
- Containerized application deployment using **Docker** and **ECS Fargate**
- Automated **CI/CD pipelines** with **GitHub Actions**
- Production-ready **security** and **high availability** patterns

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | ReactJS | User interface |
| **Backend** | Node.js/Express | API server |
| **Container Registry** | AWS ECR | Docker image storage |
| **Orchestration** | ECS Fargate | Serverless container management |
| **Load Balancing** | Application Load Balancer | Traffic distribution |
| **Database** | RDS PostgreSQL | Relational data storage |
| **NoSQL** | DynamoDB | Document storage |
| **Authentication** | AWS Cognito | User management |
| **Infrastructure** | Terraform | Infrastructure as Code |
| **CI/CD** | GitHub Actions | Automated deployment |
| **Monitoring** | CloudWatch | Logs and metrics |
| **State Storage** | S3 + DynamoDB | Terraform state management |

---

## Architecture Components

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           AWS Cloud                                   │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                         Internet Gateway                      │   │
│  │                    (Public Route - 0.0.0.0/0)                │   │
│  └──────────────────────────────┬───────────────────────────────┘   │
│                                 │                                     │
│                                 ▼                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │          Application Load Balancer (ALB)                     │   │
│  │                    Port 80 → 8080                            │   │
│  │          Target Groups: Backend & Frontend                   │   │
│  └────────────────┬───────────────────────┬────────────────────┘   │
│                   │                       │                         │
│         ┌─────────▼─────────┐   ┌────────▼──────────┐               │
│         │  Backend Target   │   │ Frontend Target   │               │
│         │  Group (Port:8080)│   │  Group (Port:80)  │               │
│         └────────┬──────────┘   └────────┬──────────┘               │
│                  │                       │                         │
│         ┌────────▼──────────┐   ┌────────▼──────────┐               │
│         │ ECS Backend Tasks │   │ ECS Frontend Tasks│               │
│         │  (Node.js/Exp)    │   │   (ReactJS)       │               │
│         │  Desired: 1-3     │   │  Desired: 1-3     │               │
│         │  Memory: 512 MB   │   │  Memory: 256 MB   │               │
│         └────────┬──────────┘   └───────────────────┘               │
│                  │                                                   │
│    ┌─────────────┴────────────┐                                     │
│    │                          │                                     │
│    ▼                          ▼                                     │
│  ┌──────────────┐      ┌──────────────────────┐                    │
│  │ RDS Database │      │   DynamoDB Tables    │                    │
│  │  PostgreSQL  │      │  (NoSQL Storage)     │                    │
│  │ Multi-AZ     │      │  On-Demand Billing   │                    │
│  │ Encrypted    │      │  Point-in-Time Rec.  │                    │
│  └──────────────┘      └──────────────────────┘                    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

Legend:
  ▬▬▬▬▬  = Traffic Flow
  VPC with Multi-AZ deployment for High Availability
```

### Network Architecture

```
VPC CIDR: 10.1.0.0/16
│
├─ Public Subnets (AZ-1, AZ-2)
│  └─ CIDR: 10.1.0.0/24, 10.1.1.0/24
│  └─ Route Table → Internet Gateway
│  └─ Resources: ALB, NAT Gateway
│
├─ Private Subnets (AZ-1, AZ-2)
│  └─ CIDR: 10.1.2.0/24, 10.1.3.0/24
│  └─ Route Table → NAT Gateway
│  └─ Resources: ECS Tasks, Lambda, Application Servers
│
└─ Database Subnets (AZ-1, AZ-2)
   └─ CIDR: 10.1.4.0/24, 10.1.5.0/24
   └─ Route Table → NAT Gateway only
   └─ Resources: RDS Instance, DynamoDB (if VPC endpoint used)
```

### Traffic Flow

```
1. User Request
   │
   ├─ HTTP → ALB:80
   │  └─ ALB evaluates listener rules
   │
   ├─ Rules:
   │  ├─ Path /api/* → Backend Target Group:8080
   │  └─ Path /* → Frontend Target Group:80
   │
   ├─ Backend:
   │  └─ ALB:8080 → ECS Task:8080 (Node.js App)
   │     └─ App connects to RDS:5432 (PostgreSQL)
   │        └─ SQL Query executed
   │
   └─ Frontend:
      └─ ALB:80 → ECS Task:80 (ReactJS Server)
         └─ Serves static/bundled React app
```

---

## Infrastructure Deep Dive

### 1. Virtual Private Cloud (VPC)

**Purpose:** Isolated network environment for all resources

```hcl
# terraform/modules/vpc/main.tf
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true
  
  tags = {
    Name = "${var.vpc_name}-${var.environment}"
  }
}
```

**Configuration:**
- CIDR Block: `10.1.0.0/16` (65,536 usable IP addresses)
- DNS enabled for service discovery
- Multi-AZ deployment for high availability

---

### 2. Subnets & Availability Zones

**Public Subnets (DMZ):**
```hcl
resource "aws_subnet" "public" {
  count                   = length(var.availability_zones)
  vpc_id                  = aws_vpc.main.id
  cidr_block              = cidrsubnet(var.vpc_cidr, 8, count.index)
  availability_zone       = var.availability_zones[count.index]
  map_public_ip_on_launch = true  # Auto-assign public IPs
  
  tags = {
    Name = "${var.vpc_name}-public-${count.index + 1}"
  }
}
```

**Private Subnets (Application Layer):**
```hcl
resource "aws_subnet" "private" {
  count              = length(var.availability_zones)
  vpc_id             = aws_vpc.main.id
  cidr_block         = cidrsubnet(var.vpc_cidr, 8, count.index + 100)
  availability_zone  = var.availability_zones[count.index]
  
  tags = {
    Name = "${var.vpc_name}-private-${count.index + 1}"
  }
}
```

**Database Subnets:**
```hcl
resource "aws_db_subnet_group" "main" {
  name       = "${var.vpc_name}-db-subnet-group"
  subnet_ids = aws_subnet.database[*].id
  
  tags = {
    Name = "${var.vpc_name}-db-subnet-group"
  }
}
```

**Why Multiple AZs?**
- ✅ **High Availability:** Survives AZ failures
- ✅ **Disaster Recovery:** Data replicated across zones
- ✅ **Load Distribution:** Spread traffic across zones
- ✅ **Compliance:** Many regulations require multi-AZ

---

### 3. Security Groups (Firewalls)

**ALB Security Group:**
```hcl
resource "aws_security_group" "alb" {
  name        = "prodready-infra-alb-sg"
  description = "Security group for ALB"
  vpc_id      = aws_vpc.main.id

  # Inbound: HTTP from anywhere
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Inbound: HTTPS from anywhere
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Outbound: To ECS tasks
  egress {
    from_port       = 8080
    to_port         = 8080
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs.id]
  }
}
```

**ECS Security Group:**
```hcl
resource "aws_security_group" "ecs" {
  name        = "prodready-infra-ecs-sg"
  description = "Security group for ECS tasks"
  vpc_id      = aws_vpc.main.id

  # Inbound: Port 8080 from ALB only
  ingress {
    from_port       = 8080
    to_port         = 8080
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  # Outbound: To RDS
  egress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.rds.id]
  }

  # Outbound: External APIs
  egress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
```

**RDS Security Group:**
```hcl
resource "aws_security_group" "rds" {
  name        = "prodready-infra-rds-sg"
  description = "Security group for RDS"
  vpc_id      = aws_vpc.main.id

  # Inbound: PostgreSQL port 5432 from ECS only
  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs.id]
  }

  # No outbound rules (RDS doesn't initiate connections)
}
```

**Security Model:**
```
Internet
  │ (Unrestricted)
  ▼
ALB (0.0.0.0/0:80,443)
  │ (Restricted to ECS SG)
  ▼
ECS Tasks (8080)
  │ (Restricted to RDS SG)
  ▼
RDS (5432)
  │ (No outbound)
  ▼
Database
```

---

### 4. Application Load Balancer (ALB)

**Purpose:** Distribute traffic to ECS tasks with health checking

```hcl
resource "aws_lb" "main" {
  name               = "prodready-infra-alb-${var.environment}"
  internal           = false  # Public-facing
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = var.public_subnet_ids

  enable_deletion_protection = false
  enable_http2              = true

  tags = {
    Name = "prodready-infra-alb-${var.environment}"
  }
}

# HTTP Listener
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend.arn
  }
}

# Listener Rules for routing
resource "aws_lb_listener_rule" "api" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 1

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend.arn
  }

  condition {
    path_pattern {
      values = ["/api/*"]
    }
  }
}

resource "aws_lb_listener_rule" "frontend" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 2

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.frontend.arn
  }

  condition {
    path_pattern {
      values = ["/*"]
    }
  }
}
```

---

### 5. Target Groups & Health Checks

**Backend Target Group:**
```hcl
resource "aws_lb_target_group" "backend" {
  name        = "prodready-infra-be-tg-${var.environment}"
  port        = 8080
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"  # For Fargate (not EC2)

  health_check {
    healthy_threshold   = 2          # 2 successful checks = healthy
    unhealthy_threshold = 3          # 3 failed checks = unhealthy
    timeout             = 5          # Wait 5 seconds for response
    interval            = 30         # Check every 30 seconds
    path                = "/api/health"
    matcher             = "200"      # Accept HTTP 200
  }

  # Deregistration delay (connection draining)
  deregistration_delay = 30

  tags = {
    Name = "prodready-infra-be-tg-${var.environment}"
  }
}
```

**Health Check Flow:**
```
Every 30 seconds:
  │
  ├─ ALB → ECS Task:8080/api/health
  │  │
  │  ├─ Task responds with HTTP 200 → Healthy ✅
  │  └─ Task doesn't respond or HTTP 5xx → Unhealthy ❌
  │
  ├─ Count healthy responses
  │  ├─ 2+ healthy → Mark as HEALTHY
  │  ├─ Add to ALB target list
  │  ├─ Traffic routed to this target
  │
  └─ Count unhealthy responses
     ├─ 3+ unhealthy → Mark as UNHEALTHY
     ├─ Remove from ALB target list
     ├─ Initiate deregistration (30 second drain)
     └─ ECS may terminate and restart task
```

---

### 6. ECS Cluster & Services

**Cluster:**
```hcl
resource "aws_ecs_cluster" "main" {
  name = "prodready-infra-cluster-${var.environment}"

  setting {
    name  = "containerInsights"
    value = "enabled"  # CloudWatch Container Insights
  }

  tags = {
    Name = "prodready-infra-cluster-${var.environment}"
  }
}

# Cluster Capacity Providers
resource "aws_ecs_cluster_capacity_providers" "main" {
  cluster_name = aws_ecs_cluster.main.name
  capacity_providers = ["FARGATE", "FARGATE_SPOT"]
}
```

**Task Definition (Backend):**
```hcl
resource "aws_ecs_task_definition" "backend" {
  family                   = "prodready-infra-backend-task-${var.environment}"
  network_mode             = "awsvpc"          # Required for Fargate
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.cpu           # 256
  memory                   = var.memory        # 512 MB
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name      = "prodready-infra-backend"
      image     = var.backend_image
      essential = true
      
      portMappings = [
        {
          containerPort = 8080
          hostPort      = 8080
          protocol      = "tcp"
        }
      ]

      environment = [
        {
          name  = "PORT"
          value = "8080"
        },
        {
          name  = "NODE_ENV"
          value = var.environment
        },
        {
          name  = "DATABASE_URL"
          value = var.database_url
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.backend.name
          "awslogs-region"        = data.aws_region.current.name
          "awslogs-stream-prefix" = "ecs"
        }
      }

      healthCheck = {
        command     = ["CMD-SHELL", "curl -f http://localhost:8080/api/health || exit 1"]
        interval    = 30
        timeout     = 5
        retries     = 3
        startPeriod = 60
      }
    }
  ])
}
```

**Service:**
```hcl
resource "aws_ecs_service" "backend" {
  name                               = "prodready-infra-backend-service-${var.environment}"
  cluster                            = aws_ecs_cluster.main.id
  task_definition                    = aws_ecs_task_definition.backend.arn
  desired_count                      = var.desired_count
  launch_type                        = "FARGATE"
  platform_version                   = "LATEST"
  scheduling_strategy                = "REPLICA"
  force_new_deployment               = true

  # Deployment strategy: Rolling update
  deployment_maximum_percent         = 200      # Can have 2x tasks during deployment
  deployment_minimum_healthy_percent = 100      # Always keep 100% healthy

  network_configuration {
    subnets          = var.private_subnet_ids
    security_groups  = [aws_security_group.ecs.id]
    assign_public_ip = false  # Private subnets, no public IPs
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.backend.arn
    container_name   = "prodready-infra-backend"
    container_port   = 8080
  }

  # Deployment circuit breaker
  deployment_circuit_breaker {
    enable   = true
    rollback = true  # Automatic rollback on deployment failure
  }

  depends_on = [aws_lb_listener.http]

  tags = {
    Name = "prodready-infra-backend-service-${var.environment}"
  }
}
```

**Auto Scaling:**
```hcl
resource "aws_appautoscaling_target" "backend" {
  max_capacity       = 10
  min_capacity       = 2
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.backend.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "backend_cpu" {
  name               = "prodready-infra-backend-cpu-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.backend.resource_id
  scalable_dimension = aws_appautoscaling_target.backend.scalable_dimension
  service_namespace  = aws_appautoscaling_target.backend.service_namespace

  target_tracking_scaling_policy_configuration {
    target_value = 70.0  # Scale when CPU > 70%

    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }

    scale_in_cooldown  = 300   # Wait 5 minutes before scaling down
    scale_out_cooldown = 60    # Scale up immediately
  }
}
```

**Scaling Behavior:**
```
CPU Utilization < 70%:
  └─ After 300s (5 min) cooldown → Scale down
     └─ Minimum: 2 tasks (maintain availability)

CPU Utilization > 70%:
  └─ Immediately → Scale up
     └─ Maximum: 10 tasks (cost control)

Example Timeline:
  00:00 - Traffic surge starts
  00:01 - CPU hits 75% → Scale up to 3 tasks
  00:02 - CPU hits 75% → Scale up to 4 tasks
  00:03 - CPU hits 75% → Scale up to 5 tasks
  00:04 - CPU drops to 65% → Wait 5 minutes before scaling down
  05:04 - CPU still low → Scale down to 4 tasks
```

---

### 7. RDS PostgreSQL Database

```hcl
resource "aws_db_instance" "main" {
  identifier     = "prodready-infra-db-${var.environment}"
  engine         = "postgres"
  engine_version = "15.3"
  instance_class = var.db_instance_class  # db.t3.micro for staging

  db_name  = var.db_name
  username = var.db_username
  password = var.db_password  # From AWS Secrets Manager

  # Storage
  allocated_storage    = 20
  storage_encrypted    = true
  storage_type         = "gp2"

  # Multi-AZ (only for production)
  multi_az = var.environment == "production" ? true : false

  # Networking
  db_subnet_group_name   = aws_db_subnet_group.main.name
  publicly_accessible    = false
  vpc_security_group_ids = [aws_security_group.rds.id]

  # Backup & Recovery
  backup_retention_period = 7           # Keep 7 days of backups
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"

  # Copy snapshots to backup region
  copy_tags_to_snapshot = true

  # Deletion protection
  deletion_protection = var.environment == "production" ? true : false

  skip_final_snapshot       = false
  final_snapshot_identifier = "prodready-infra-db-${var.environment}-final-snapshot-${formatdate("YYYY-MM-DD-hhmm", timestamp())}"

  tags = {
    Name = "prodready-infra-db-${var.environment}"
  }
}
```

**Connection String:**
```
postgresql://postgres:password@prodready-infra-db-staging.xxxxx.us-east-1.rds.amazonaws.com:5432/prodready_infra_staging
```

---

### 8. DynamoDB Tables

```hcl
resource "aws_dynamodb_table" "items" {
  name           = "prodready-infra-items-${var.environment}"
  billing_mode   = "PAY_PER_REQUEST"  # On-demand pricing
  hash_key       = "id"

  attribute {
    name = "id"
    type = "S"  # String
  }

  ttl {
    attribute_name = "expiration_time"
    enabled        = true
  }

  server_side_encryption {
    enabled = true
  }

  point_in_time_recovery {
    enabled = true
  }

  tags = {
    Name = "prodready-infra-items-${var.environment}"
  }
}
```

---

### 9. CloudWatch Logging

```hcl
resource "aws_cloudwatch_log_group" "backend" {
  name              = "/ecs/prodready-infra-backend-${var.environment}"
  retention_in_days = 7

  tags = {
    Name = "prodready-infra-backend-logs-${var.environment}"
  }
}

resource "aws_cloudwatch_log_stream" "backend" {
  name           = "ecs-logs"
  log_group_name = aws_cloudwatch_log_group.backend.name
}
```

**Accessing Logs:**
```bash
# View real-time logs
aws logs tail /ecs/prodready-infra-backend-staging --follow

# View specific time range
aws logs get-log-events \
  --log-group-name /ecs/prodready-infra-backend-staging \
  --log-stream-name ecs-logs \
  --start-time $(date -d '1 hour ago' +%s)000
```

---

## Terraform Structure

### Directory Layout

```
terraform/
├── main.tf                          # Root configuration (all modules)
├── variables.tf                     # Input variables
├── outputs.tf                       # Root outputs
├── environments/
│   ├── staging.tfvars              # Staging variables
│   ├── staging.backend.conf        # Staging S3 backend config
│   ├── production.tfvars           # Production variables
│   └── production.backend.conf     # Production S3 backend config
└── modules/
    ├── vpc/
    │   ├── main.tf                 # VPC, subnets, gateways
    │   ├── variables.tf
    │   └── outputs.tf
    ├── security/
    │   ├── main.tf                 # Security groups
    │   ├── variables.tf
    │   └── outputs.tf
    ├── ecr/
    │   ├── main.tf                 # Container registries
    │   ├── variables.tf
    │   └── outputs.tf
    ├── ecs/
    │   ├── main.tf                 # Cluster, services, tasks
    │   ├── variables.tf
    │   └── outputs.tf
    ├── rds/
    │   ├── main.tf                 # PostgreSQL database
    │   ├── variables.tf
    │   └── outputs.tf
    └── dynamodb/
        ├── main.tf                 # DynamoDB tables
        ├── variables.tf
        └── outputs.tf
```

### Root main.tf Structure

```hcl
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.16"
    }
  }
  
  required_version = ">= 1.3.0"
  
  backend "s3" {
    bucket         = "prodready-infra-terraform-state-875486186130"
    key            = "prodready-infra/staging/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-state-lock-staging"
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region
}

# Data sources
data "aws_availability_zones" "available" {
  state = "available"
}

# Modules
module "vpc" { ... }
module "security_groups" { ... }
module "ecr" { ... }
module "ecs" { ... }
module "rds" { ... }
module "dynamodb" { ... }

# Outputs
output "cluster_name" { ... }
output "backend_service_name" { ... }
output "lb_dns_name" { ... }
```

### Terraform Execution Order

Terraform automatically resolves dependencies:

```
1. VPC (must exist first)
   ├── Availability Zones
   ├── Subnets
   ├── Internet Gateway
   └── NAT Gateway

2. Security Groups (depends on VPC)
   ├── ALB Security Group
   ├── ECS Security Group
   └── RDS Security Group

3. ECR (independent)
   └── Repositories

4. RDS (depends on VPC, Security Groups)
   ├── DB Subnet Group
   └── DB Instance

5. ECS (depends on VPC, Security Groups, ECR, RDS)
   ├── Cluster
   ├── Task Definitions
   ├── Services
   ├── Target Groups
   └── Load Balancer

6. CloudWatch (depends on ECS)
   └── Log Groups
```

---

## Health Check Issues & Solutions

### The Problem

Your deployment was failing with:
```
HTTP 502 - Bad Gateway
HTTP 503 - Service Unavailable
Timeout errors
Target deregistration issues
```

### Root Cause Analysis

#### Issue 1: Port Mismatch

| Component | Expected | Actual | Status |
|-----------|----------|--------|--------|
| Dockerfile | 8080 | 9000 | ❌ MISMATCH |
| [`api/app.js`](api/app.js ) | 8080 | 9000 | ❌ MISMATCH |
| ECS Task Definition | 8080 | 8080 | ✅ OK |
| Target Group | 8080 | 8080 | ✅ OK |
| ALB Health Check | 8080 | 8080 | ✅ OK |

**Why This Fails:**

```
1. ALB sends health check:
   curl http://container-ip:8080/api/health
   
2. Container is listening on port 9000:
   → Connection refused
   
3. Health check fails:
   → ECS marks task as unhealthy
   
4. ALB deregisters target:
   → No healthy targets available
   
5. Result:
   → 502/503 errors for all requests
```

#### Issue 2: Health Check Path Configuration

The health check was looking for `/api/health` but the endpoint wasn't properly exposed.

#### Issue 3: Target Deregistration Cycle

Logs showed:
```
14:18:41 - Target registered ✅
14:19:03 - Deregistration started (22 sec later)
14:19:03 - New target registered ✅
14:19:25 - Deregistration started again (22 sec later)
→ Infinite loop!
```

This indicates:
- Tasks start successfully
- Health checks fail immediately
- ECS constantly cycles tasks

---

## Port Configuration

### Understanding the Three Ports

#### 1. Container Port (ECS)

This is the port inside your Docker container:

```hcl
# terraform/modules/ecs/main.tf
port_mappings = [
  {
    containerPort = 8080
    hostPort      = 8080
    protocol      = "tcp"
  }
]
```

This tells ECS:
- Container listens on port 8080 inside the container
- Host (ECS task) exposes port 8080

#### 2. Application Port (Node.js)

Your application must listen on this port:

```javascript
// api/index.js
const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
```

#### 3. Docker Exposed Port

Your Dockerfile declares which port the app uses:

```dockerfile
# api/Dockerfile
EXPOSE 8080
```

### The Port Flow

```
User Request
  │
  └─ HTTP to ALB:80
     │
     └─ ALB evaluates path:
        │
        ├─ Path /api/* → Backend Target Group:8080
        │  │
        │  └─ ALB:8080 → ECS Task:8080
        │     │
        │     └─ ECS Task:8080 → Container:8080
        │        │
        │        └─ Node.js listening on port 8080
        │           │
        │           └─ Request processed
        │
        └─ Path /* → Frontend Target Group:80
```

### Fix: Ensure Port Alignment

**Step 1: Update Dockerfile**

```dockerfile
FROM node:22-alpine

# ...dependencies...

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npx prisma generate

# ✅ CORRECT: Port 8080
EXPOSE 8080

# ✅ Health check on correct port
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8080/api/health || exit 1

CMD ["npm", "run", "prod"]
```

**Step 2: Update Node.js Application**

```javascript
// api/index.js
const PORT = process.env.PORT || 8080;  // ✅ Default to 8080

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
```

**Step 3: Ensure Environment Variables**

```hcl
# terraform/modules/ecs/main.tf
environment = [
  {
    name  = "PORT"
    value = tostring(var.app_port)  # 8080
  },
  # ... other vars
]
```

**Step 4: Verify Health Check Endpoints**

```javascript
// api/app.js
import express from 'express';

const app = express();

// ✅ Health check BEFORE authentication middleware
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    port: process.env.PORT || 8080
  });
});

// Create router
const apiRouter = express.Router();

// ✅ API health check
apiRouter.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    path: '/api/health'
  });
});

// ✅ Unprotected routes before authentication
apiRouter.use('/auth', authRoutes);

// ✅ Apply authentication middleware
apiRouter.use(authenticateToken);

// ✅ Protected routes
apiRouter.use('/users', userRoutes);

app.use('/api', apiRouter);

export default app;
```

---

## CI/CD Pipeline Deep Dive

### Workflow Overview

Your [`.github/workflows/ci-cd.yml`](.github/workflows/ci-cd.yml ) has **3 main jobs**:

```
┌─ terraform-plan (PRs only)
│  └─ Validate changes before merge
│
├─ build-and-deploy (Main branch only)
│  ├─ Build Docker images
│  ├─ Apply Terraform
│  ├─ Update ECS services
│  ├─ Wait for stability
│  └─ Run health checks
│
└─ notify (Always)
   └─ Report success/failure
```

### Job 1: terraform-plan

**Triggers on:** Pull Requests to main or develop

**Purpose:** Validate infrastructure changes before merging

**Steps:**

```yaml
1. Checkout code
   └─ git clone + checkout branch

2. Configure AWS credentials
   └─ Use GitHub Secrets for AWS keys

3. Setup Terraform
   └─ Install Terraform 1.5.0

4. Terraform Format Check
   └─ terraform fmt -check -recursive
   └─ Ensures consistent formatting

5. Force unlock state (if needed)
   └─ terraform force-unlock
   └─ Clears any stale locks

6. Terraform Init
   └─ terraform init -backend-config="..."
   └─ Connects to S3 state backend

7. Terraform Validate
   └─ terraform validate
   └─ Checks syntax and structure

8. Terraform Plan
   └─ terraform plan -var-file="..."
   └─ Shows what would change
   └─ Output posted to PR for review
```

**Example terraform plan output:**

```
Plan: 5 to add, 2 to change, 0 to destroy.

+ aws_ecs_service.backend
  - name = "prodready-infra-backend-service-staging"
  - cluster = "arn:aws:ecs:..."
  - task_definition = "prodready-infra-backend-task-staging:5"
  - desired_count = 2

~ aws_ecs_task_definition.backend
  - image = "docker_image:old-tag" → "docker_image:new-tag"
```

### Job 2: build-and-deploy

**Triggers on:** Push to main branch

**Purpose:** Build, deploy, and validate the entire application

**Step-by-Step Execution:**

#### Step 1: Authentication Setup

```yaml
- name: Checkout code
  uses: actions/checkout@v4

- name: Configure AWS credentials
  uses: aws-actions/configure-aws-credentials@v4
  with:
    aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
    aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    aws-region: ${{ env.AWS_REGION }}

- name: Login to Amazon ECR
  uses: aws-actions/amazon-ecr-login@v2
```

**What Happens:**
- ✅ Repository code checked out
- ✅ AWS CLI configured with credentials
- ✅ Docker authenticated to push images to ECR

#### Step 2: Terraform Initialization

```yaml
- name: Setup Terraform
  uses: hashicorp/setup-terraform@v3
  with:
    terraform_version: 1.5.0
    terraform_wrapper: false

- name: Terraform Init
  run: |
    cd terraform
    terraform init -backend-config="environments/staging.backend.conf"
```

**What Happens:**
- ✅ Terraform 1.5.0 installed
- ✅ Backend S3 bucket configured
- ✅ DynamoDB lock table ready
- ✅ Terraform modules downloaded

#### Step 3: Clear Stale Locks

```yaml
- name: Clear stale Terraform locks
  run: |
    cd terraform
    echo "🔓 Clearing any stale Terraform locks..."
    if terraform plan ... 2>&1 | grep -q "Lock Info:"; then
      LOCK_ID=$(terraform plan ... 2>&1 | grep "ID:" | awk '{print $2}')
      terraform force-unlock -force "$LOCK_ID"
    else
      echo "No locks detected"
    fi
  continue-on-error: true
```

**Why This Matters:**

If a previous deployment crashed:
- DynamoDB lock remains
- Next deployment blocked: "Error acquiring lock"
- This step detects and clears it
- Deployment can proceed normally

**Important:** `continue-on-error: true` ensures workflow continues even if unlock fails

#### Step 4: Build Backend Docker Image

```yaml
- name: Build and push Backend image
  id: backend_image
  run: |
    cd api
    echo "🏗️ Building backend image..."
    
    # Generate unique tag
    IMAGE_TAG="${GITHUB_SHA:0:7}-$(date +%s)"
    # Example: a1b2c3d-1699876543
    
    # Build with tag
    docker build -t $ECR_REGISTRY/$BACKEND_REPOSITORY:$IMAGE_TAG .
    docker build -t $ECR_REGISTRY/$BACKEND_REPOSITORY:latest .
    
    # Push both tags
    echo "📤 Pushing to ECR..."
    docker push $ECR_REGISTRY/$BACKEND_REPOSITORY:$IMAGE_TAG
    docker push $ECR_REGISTRY/$BACKEND_REPOSITORY:latest
    
    # Output for next steps
    echo "image_tag=$IMAGE_TAG" >> $GITHUB_OUTPUT
    echo "image_uri=$ECR_REGISTRY/$BACKEND_REPOSITORY:$IMAGE_TAG" >> $GITHUB_OUTPUT
```

**What Happens:**

1. **Build image:**
   ```bash
   docker build -t 875486186130.dkr.ecr.us-east-1.amazonaws.com/prodready-infra-api:a1b2c3d-1699876543 .
   ```

2. **Tag with 'latest':**
   ```bash
   docker tag ... :latest
   ```

3. **Push to ECR:**
   ```bash
   docker push ... :a1b2c3d-1699876543
   docker push ... :latest
   ```

4. **Output variables:**
   - `image_tag` = a1b2c3d-1699876543
   - `image_uri` = full ECR URL with tag

**Same process for Frontend** in next step

#### Step 5: Terraform Apply

```yaml
- name: Terraform Apply
  id: apply
  run: |
    cd terraform
    echo "🚀 Applying Terraform changes..."
    terraform apply -auto-approve -var-file="environments/staging.tfvars"
    echo "✅ Infrastructure deployment complete"
  env:
    TF_VAR_db_password: ${{ secrets.DB_PASSWORD }}
```

**What Happens:**

Terraform applies all infrastructure changes:

```
Terraform State (Current)          Desired State (Code)
├─ VPC exists                      ├─ VPC: prodready-infra-vpc ✅
├─ Subnets: 10.1.0.0-10.1.5.0     ├─ Subnets: All present ✅
├─ ECS Cluster (old)               ├─ ECS Cluster: prodready-infra-cluster
├─ RDS Instance                    ├─ RDS: db.t3.micro
├─ Task Def Revision 4             ├─ Task Def: Revision 5 (new image)
└─ Service running old tasks       └─ Service: Force new deployment

Terraform compares and executes:
  1. Update Task Definition → Revision 5
  2. Update ECS Service → Use Revision 5
  3. Force new deployment
  4. Update any security group rules
  5. Update RDS if needed
  6. Commit new state to S3
```

#### Step 6: Get Terraform Outputs

```yaml
- name: Get Terraform Outputs
  id: tf_outputs
  run: |
    cd terraform
    echo "📋 Getting Terraform outputs..."
    
    CLUSTER_NAME=$(terraform output -raw cluster_name 2>/dev/null || echo "prodready-infra-cluster-staging")
    BACKEND_SERVICE=$(terraform output -raw backend_service_name 2>/dev/null || echo "prodready-infra-backend-service-staging")
    FRONTEND_SERVICE=$(terraform output -raw frontend_service_name 2>/dev/null || echo "prodready-infra-frontend-service-staging")
    
    echo "cluster_name=$CLUSTER_NAME" >> $GITHUB_OUTPUT
    echo "backend_service=$BACKEND_SERVICE" >> $GITHUB_OUTPUT
    echo "frontend_service=$FRONTEND_SERVICE" >> $GITHUB_OUTPUT
```

**Why This Matters:**
- Gets resource names from Terraform state
- Falls back to hardcoded names if outputs don't exist
- Passes to subsequent steps via `$GITHUB_OUTPUT`

#### Step 7: Update Task Definitions

```yaml
- name: Update Backend Task Definition
  id: backend_task_def
  run: |
    TASK_FAMILY="prodready-infra-backend-task-staging"
    
    # Get current task definition
    TASK_DEF=$(aws ecs describe-task-definition --task-definition "$TASK_FAMILY")
    
    # Update image in the definition
    NEW_TASK_DEF=$(echo "$TASK_DEF" | jq --arg IMAGE "${{ steps.backend_image.outputs.image_uri }}" '
      .taskDefinition |
      .containerDefinitions[0].image = $IMAGE |
      del(.taskDefinitionArn, .revision, .status, ...)
    ')
    
    # Register as new revision
    NEW_TASK_INFO=$(aws ecs register-task-definition --cli-input-json "$NEW_TASK_DEF")
    NEW_REVISION=$(echo "$NEW_TASK_INFO" | jq -r '.taskDefinition.revision')
    
    echo "revision=$NEW_REVISION" >> $GITHUB_OUTPUT
```

**What Happens:**

```
Task Definition Revision History:
├─ Revision 1: image=prodready-infra-api:old-commit-sha
├─ Revision 2: image=prodready-infra-api:a1b2c3d-1699876543 (new)
├─ Revision 3: image=prodready-infra-api:b2c3d4e-1699876544
└─ Revision 4: image=prodready-infra-api:c3d4e5f-1699876545

With new deployment:
└─ Register new revision with new image URI
   └─ Output: revision=<new-revision-number>
```

#### Step 8: Update ECS Services

```yaml
- name: Update ECS Services
  run: |
    echo "🔄 Forcing ECS services to redeploy..."
    
    # Backend
    aws ecs update-service \
      --cluster ${{ steps.tf_outputs.outputs.cluster_name }} \
      --service ${{ steps.tf_outputs.outputs.backend_service }} \
      --task-definition "${{ steps.backend_task_def.outputs.family }}:${{ steps.backend_task_def.outputs.revision }}" \
      --force-new-deployment \
      --region ${{ env.AWS_REGION }}
    
    # Frontend
    aws ecs update-service \
      --cluster ${{ steps.tf_outputs.outputs.cluster_name }} \
      --service ${{ steps.tf_outputs.outputs.frontend_service }} \
      --task-definition "${{ steps.frontend_task_def.outputs.family }}:${{ steps.frontend_task_def.outputs.revision }}" \
      --force-new-deployment \
      --region ${{ env.AWS_REGION }}
```

**What Happens:**

```
ECS Service Update Flow:

Before:
├─ Desired Count: 2
├─ Running Tasks: 2 (Revision 1)
└─ Deployment Status: COMPLETED

Update Command:
└─ aws ecs update-service --force-new-deployment --task-definition :Revision2

After Update (Rolling Deployment):
├─ Time 0s:   Start new task (Revision 2)
├─ Time 10s:  New task health check starts
├─ Time 20s:  New task passes health check ✅
├─ Time 30s:  Start draining old task (Revision 1)
├─ Time 40s:  Old task deregistered from ALB
├─ Time 60s:  Old task stopped
└─ Final:     2 tasks running (Revision 2) ✅
```

#### Step 9: Wait for Stability

```yaml
- name: Wait for Deployment
  run: |
    echo "⏳ Waiting for services to stabilize (max 10 minutes)..."
    
    timeout 600 aws ecs wait services-stable \
      --cluster ${{ steps.tf_outputs.outputs.cluster_name }} \
      --services ${{ steps.tf_outputs.outputs.backend_service }} \
      --region ${{ env.AWS_REGION }}
```

**What This Does:**

Polls ECS every 15 seconds:

```
Status Check Loop (10 minute timeout):
├─ Check 1: deploymentStatus=IN_PROGRESS → Continue
├─ Check 2: deploymentStatus=IN_PROGRESS → Continue
├─ Check 3: deploymentStatus=IN_PROGRESS → Continue
├─ Check 4: deploymentStatus=IN_PROGRESS → Continue
├─ Check 5: deploymentStatus=COMPLETED, runningCount=2, desiredCount=2 → Success ✅
```

**Service is "Stable" when:**
- `deploymentStatus == "COMPLETED"`
- `runningCount == desiredCount`
- All tasks passed health checks
- No pending/draining tasks

#### Step 10: Health Check Validation

```yaml
- name: Health Check
  run: |
    echo "🏥 Running health checks..."
    
    ALB_DNS=$(terraform output -raw lb_dns_name)
    HEALTH_URL="http://${ALB_DNS}/api/health"
    
    success=false
    for i in {1..30}; do
      echo "Attempt $i/30..."
      RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -m 10 "$HEALTH_URL" || echo "000")
      
      if [ "$RESPONSE" = "200" ]; then
        echo "✅ Health check passed!"
        success=true
        break
      else
        echo "⏳ Retrying in 15 seconds..."
        sleep 15
      fi
    done
    
    if [ "$success" != "true" ]; then
      echo "❌ Health check failed"
      exit 1
    fi
```

**Health Check Timing:**

```
Application Startup Timeline:

0-20s:   Container starting, dependencies loading
20-40s:  Application initialization
40-60s:  Database connection attempts
60s+:    Ready to accept requests

Health Check Attempts:
├─ Attempt 1: 0s - Container not ready (Connection refused)
├─ Attempt 2: 15s - Still loading (Connection refused)
├─ Attempt 3: 30s - Initializing (503 Service Unavailable)
├─ Attempt 4: 45s - Database connecting (500 Error)
├─ Attempt 5: 60s - Ready! (200 OK) ✅
```

**Why 30 attempts?**
- Each attempt waits 15 seconds
- 30 attempts × 15 seconds = 450 seconds (~7.5 minutes)
- Allows time for:
  - Container startup: 20-30 seconds
  - Application initialization: 10-20 seconds
  - Database connection: 5-10 seconds
  - **Total buffer: 60+ seconds**

#### Step 11: Deployment Summary

```yaml
- name: Deployment Summary
  if: always()
  run: |
    echo "📊 Deployment Summary"
    echo "===================="
    echo "Region: ${{ env.AWS_REGION }}"
    echo "Environment: ${{ env.ENVIRONMENT }}"
    echo "Commit: ${GITHUB_SHA:0:7}"
    echo "Backend Image: ${{ steps.backend_image.outputs.image_tag }}"
    echo "Frontend Image: ${{ steps.frontend_image.outputs.image_tag }}"
```

### Job 3: notify

```yaml
notify:
  name: Notify
  runs-on: ubuntu-latest
  needs: [build-and-deploy]
  if: ${{ always() }}
  
  steps:
    - name: Notify Success
      if: ${{ needs.build-and-deploy.result == 'success' }}
      run: echo "🎉 Deployment Successful!"
    
    - name: Notify Failure
      if: ${{ needs.build-and-deploy.result == 'failure' }}
      run: |
        echo "❌ Deployment Failed!"
        exit 1
```

**What Happens:**
- Runs regardless of previous job success (`if: always()`)
- Checks result of build-and-deploy job
- Can be extended to send Slack/email notifications
- Exit code 1 on failure marks workflow as failed

---

## Complete Deployment Timeline

### Typical Deployment Duration: 12-18 minutes

```
Time    Event
────────────────────────────────────────────────────────────
00:00   📌 Git push to main branch
00:01   🚀 GitHub Actions workflow triggered
00:02   📥 Checkout code complete
00:03   🔑 AWS credentials configured
00:04   📦 ECR login successful
00:05   🔄 Terraform init started
00:06   ✅ Terraform init complete
00:07   📋 Terraform plan started
00:08   ✅ Terraform plan complete (showing changes)
        
00:09   🏗️  Backend Docker build started
00:11   ✅ Backend image built (2 min build time)
00:12   📤 Backend pushed to ECR
        
00:13   🏗️  Frontend Docker build started
00:15   ✅ Frontend image built (2 min build time)
00:16   📤 Frontend pushed to ECR
        
00:17   🚀 Terraform apply started
00:20   ✅ Infrastructure updated (3 min apply time)
        ├─ Task definitions updated
        ├─ ECS services updated
        └─ ALB rules configured
        
00:21   📝 Backend task definition updated (Revision N+1)
00:22   📝 Frontend task definition updated (Revision M+1)
        
00:23   🔄 ECS service update initiated
00:24   ✅ Update confirmed
        
00:25   ⏳ Waiting for deployment (Rolling Update)
        ├─ 00:25 → Start new tasks
        ├─ 00:35 → Health checks pass
        ├─ 00:45 → Drain old tasks
        ├─ 00:55 → Stop old tasks
        
00:56   ⏳ Waiting for service stability check (ECS wait)
01:00   ✅ Services stable
        
01:01   🏥 Running health checks
        ├─ Attempt 1: Connection refused
        ├─ Attempt 2: 503 Service Unavailable
        ├─ Attempt 3: 500 Internal Error
        ├─ Attempt 4: 200 OK ✅
        
01:02   📊 Deployment summary generated
01:03   ✅ DEPLOYMENT COMPLETE
```

**Breakdown by Phase:**

| Phase | Duration | Details |
|-------|----------|---------|
| **Setup** | 1-2 min | Git checkout, AWS auth, Terraform init |
| **Build** | 4-5 min | Docker build for both images |
| **Deploy Infra** | 3-4 min | Terraform apply |
| **Update Services** | 1 min | Update task definitions |
| **Rolling Deployment** | 2-3 min | Start new tasks, drain old |
| **Wait & Stabilize** | 1 min | ECS stability check |
| **Health Check** | 1-2 min | HTTP health endpoint validation |
| **Total** | **12-18 min** | From push to production ready |

---

## State Management

### Terraform State File

**Location:** `s3://prodready-infra-terraform-state-875486186130/prodready-infra/staging/terraform.tfstate`

**Contents:**

```json
{
  "version": 4,
  "terraform_version": "1.5.0",
  "serial": 42,
  "lineage": "abc123...",
  
  "outputs": {
    "cluster_name": {
      "value": "prodready-infra-cluster-staging",
      "type": "string"
    },
    "lb_dns_name": {
      "value": "prodready-infra-alb-staging-212250592.us-east-1.elb.amazonaws.com",
      "type": "string"
    }
  },
  
  "resources": [
    {
      "module": "module.ecs",
      "mode": "managed",
      "type": "aws_ecs_cluster",
      "name": "main",
      "instances": [{
        "attributes": {
          "id": "arn:aws:ecs:us-east-1:875486186130:cluster/prodready-infra-cluster-staging",
          "name": "prodready-infra-cluster-staging",
          "arn": "...",
          "status": "ACTIVE"
        }
      }]
    }
  ]
}
```

### State Locking with DynamoDB

**Table:** `terraform-state-lock-staging`

**Why Locking is Critical:**

```
Without Locking:
  Dev A: terraform apply (reads state)
    ├─ Creates VPC
    ├─ Dev B: terraform apply (reads old state)
    │  ├─ Creates VPC (conflict!)
    │  ├─ Creates subnets
    │  └─ Updates state
    │
    └─ Updates state (overwrites Dev B's state!)
    
  Result: ❌ Conflicting infrastructure, inconsistent state

With Locking:
  Dev A: terraform apply
    └─ Acquires lock in DynamoDB
       ├─ Creates VPC
       ├─ Dev B: terraform apply (waits for lock)
       ├─ Creates subnets
       └─ Updates state, releases lock
    
  Dev B: terraform apply (acquires lock)
    ├─ Reads current state (with VPC)
    └─ No duplicate resources
    
  Result: ✅ Consistent state, no conflicts
```

**Lock Structure:**

```json
{
  "LockID": "prodready-infra-terraform-state-875486186130/prodready-infra/staging/terraform.tfstate-md5",
  "Info": {
    "ID": "abc-123-def-456",
    "Operation": "OperationTypeApply",
    "Who": "github-runner@ip-172-31-12-34",
    "Version": "1.5.0",
    "Created": "2024-10-16T10:30:00Z",
    "Path": "prodready-infra/staging/terraform.tfstate"
  }
}
```

### State Versioning with S3

S3 has **versioning enabled** - keeps history of all changes:

```
Version History:
├─ Version 1 (serial: 1, 2024-01-01)
│  └─ Initial infrastructure deployment
│
├─ Version 2 (serial: 2, 2024-01-05)
│  └─ Added RDS database
│
├─ Version 3 (serial: 3, 2024-02-01)
│  └─ Updated ECS desired count
│
├─ Version 4 (serial: 4, 2024-02-15)
│  └─ Added DynamoDB table (CURRENT)
│
└─ Version 5 (serial: 5, 2024-02-20)
   └─ Fixed security group rules

Rollback to Version 3:
  aws s3api copy-object \
    --copy-source bucket/key?versionId=xxx \
    --bucket prodready-infra-terraform-state-875486186130 \
    --key prodready-infra/staging/terraform.tfstate
  
  → terraform plan (shows what changed from Version 3)
  → terraform apply (restores Version 3 configuration)
```

### Backing Up State

**S3 Lifecycle Policy:**

```hcl
resource "aws_s3_bucket_lifecycle_configuration" "state" {
  bucket = aws_s3_bucket.terraform_state.id

  rule {
    id     = "archive-old-versions"
    status = "Enabled"

    noncurrent_version_transition {
      noncurrent_days = 30
      storage_class   = "GLACIER"
    }

    noncurrent_version_expiration {
      noncurrent_days = 365
    }
  }
}
```

**Backup Strategy:**

```
Daily:
  └─ S3 versioning maintains history
  └─ Every change creates new version

Weekly:
  └─ S3 cross-region replication
  └─ Copy state to backup region

Monthly:
  └─ S3 lifecycle → Archive to Glacier
  └─ Long-term archival

On-Demand:
  └─ Manual snapshot
  └─ For critical changes
```

---

## Troubleshooting Guide

### Issue 1: Health Checks Failing (502/503 Errors)

**Symptoms:**
```
curl: (22) The requested URL returned error: 502
curl: (22) The requested URL returned error: 503
Status: Targets draining
```

**Root Cause Analysis:**

```bash
# Step 1: Check task logs
aws logs tail /ecs/prodready-infra-backend-staging --follow

# Step 2: Check target health
aws elbv2 describe-target-health \
  --target-group-arn arn:aws:elasticloadbalancing:us-east-1:...

# Output example:
# {
#   "TargetHealthDescriptions": [{
#     "Target": {"Id": "10.1.2.100"},
#     "TargetHealth": {
#       "State": "unhealthy",
#       "Reason": "Health checks failed",
#       "Description": "Health checks have failed 3 times consecutively"
#     }
#   }]
# }
```

**Solution Checklist:**

1. ✅ **Fix Port Mismatch**
   ```bash
   # Verify Dockerfile exposes correct port
   grep EXPOSE api/Dockerfile  # Should be 8080
   
   # Verify app listens on correct port
   grep "PORT" api/index.js    # Should default to 8080
   
   # Verify ECS task definition# ProdReady Infra - Complete Architecture and Deployment Guide

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture Components](#architecture-components)
3. [Infrastructure Deep Dive](#infrastructure-deep-dive)
4. [Terraform Structure](#terraform-structure)
5. [Health Check Issues & Solutions](#health-check-issues--solutions)
6. [Port Configuration](#port-configuration)
7. [CI/CD Pipeline Deep Dive](#cicd-pipeline-deep-dive)
8. [Complete Deployment Timeline](#complete-deployment-timeline)
9. [State Management](#state-management)
10. [Troubleshooting Guide](#troubleshooting-guide)
11. [Best Practices](#best-practices)
12. [Deployment Checklist](#deployment-checklist)
13. [Quick Reference](#quick-reference)

---

## Overview

This document provides a comprehensive guide to understanding, deploying, and troubleshooting the **ProdReady_Infra** AWS infrastructure. It's designed as a teaching resource for:

- Modern cloud infrastructure with **Infrastructure as Code (IaC)**
- Containerized application deployment using **Docker** and **ECS Fargate**
- Automated **CI/CD pipelines** with **GitHub Actions**
- Production-ready **security** and **high availability** patterns

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | ReactJS | User interface |
| **Backend** | Node.js/Express | API server |
| **Container Registry** | AWS ECR | Docker image storage |
| **Orchestration** | ECS Fargate | Serverless container management |
| **Load Balancing** | Application Load Balancer | Traffic distribution |
| **Database** | RDS PostgreSQL | Relational data storage |
| **NoSQL** | DynamoDB | Document storage |
| **Authentication** | AWS Cognito | User management |
| **Infrastructure** | Terraform | Infrastructure as Code |
| **CI/CD** | GitHub Actions | Automated deployment |
| **Monitoring** | CloudWatch | Logs and metrics |
| **State Storage** | S3 + DynamoDB | Terraform state management |

---

## Architecture Components

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           AWS Cloud                                   │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                         Internet Gateway                      │   │
│  │                    (Public Route - 0.0.0.0/0)                │   │
│  └──────────────────────────────┬───────────────────────────────┘   │
│                                 │                                     │
│                                 ▼                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │          Application Load Balancer (ALB)                     │   │
│  │                    Port 80 → 8080                            │   │
│  │          Target Groups: Backend & Frontend                   │   │
│  └────────────────┬───────────────────────┬────────────────────┘   │
│                   │                       │                         │
│         ┌─────────▼─────────┐   ┌────────▼──────────┐               │
│         │  Backend Target   │   │ Frontend Target   │               │
│         │  Group (Port:8080)│   │  Group (Port:80)  │               │
│         └────────┬──────────┘   └────────┬──────────┘               │
│                  │                       │                         │
│         ┌────────▼──────────┐   ┌────────▼──────────┐               │
│         │ ECS Backend Tasks │   │ ECS Frontend Tasks│               │
│         │  (Node.js/Exp)    │   │   (ReactJS)       │               │
│         │  Desired: 1-3     │   │  Desired: 1-3     │               │
│         │  Memory: 512 MB   │   │  Memory: 256 MB   │               │
│         └────────┬──────────┘   └───────────────────┘               │
│                  │                                                   │
│    ┌─────────────┴────────────┐                                     │
│    │                          │                                     │
│    ▼                          ▼                                     │
│  ┌──────────────┐      ┌──────────────────────┐                    │
│  │ RDS Database │      │   DynamoDB Tables    │                    │
│  │  PostgreSQL  │      │  (NoSQL Storage)     │                    │
│  │ Multi-AZ     │      │  On-Demand Billing   │                    │
│  │ Encrypted    │      │  Point-in-Time Rec.  │                    │
│  └──────────────┘      └──────────────────────┘                    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

Legend:
  ▬▬▬▬▬  = Traffic Flow
  VPC with Multi-AZ deployment for High Availability
```

### Network Architecture

```
VPC CIDR: 10.1.0.0/16
│
├─ Public Subnets (AZ-1, AZ-2)
│  └─ CIDR: 10.1.0.0/24, 10.1.1.0/24
│  └─ Route Table → Internet Gateway
│  └─ Resources: ALB, NAT Gateway
│
├─ Private Subnets (AZ-1, AZ-2)
│  └─ CIDR: 10.1.2.0/24, 10.1.3.0/24
│  └─ Route Table → NAT Gateway
│  └─ Resources: ECS Tasks, Lambda, Application Servers
│
└─ Database Subnets (AZ-1, AZ-2)
   └─ CIDR: 10.1.4.0/24, 10.1.5.0/24
   └─ Route Table → NAT Gateway only
   └─ Resources: RDS Instance, DynamoDB (if VPC endpoint used)
```

### Traffic Flow

```
1. User Request
   │
   ├─ HTTP → ALB:80
   │  └─ ALB evaluates listener rules
   │
   ├─ Rules:
   │  ├─ Path /api/* → Backend Target Group:8080
   │  └─ Path /* → Frontend Target Group:80
   │
   ├─ Backend:
   │  └─ ALB:8080 → ECS Task:8080 (Node.js App)
   │     └─ App connects to RDS:5432 (PostgreSQL)
   │        └─ SQL Query executed
   │
   └─ Frontend:
      └─ ALB:80 → ECS Task:80 (ReactJS Server)
         └─ Serves static/bundled React app
```

---

## Infrastructure Deep Dive

### 1. Virtual Private Cloud (VPC)

**Purpose:** Isolated network environment for all resources

```hcl
# terraform/modules/vpc/main.tf
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true
  
  tags = {
    Name = "${var.vpc_name}-${var.environment}"
  }
}
```

**Configuration:**
- CIDR Block: `10.1.0.0/16` (65,536 usable IP addresses)
- DNS enabled for service discovery
- Multi-AZ deployment for high availability

---

### 2. Subnets & Availability Zones

**Public Subnets (DMZ):**
```hcl
resource "aws_subnet" "public" {
  count                   = length(var.availability_zones)
  vpc_id                  = aws_vpc.main.id
  cidr_block              = cidrsubnet(var.vpc_cidr, 8, count.index)
  availability_zone       = var.availability_zones[count.index]
  map_public_ip_on_launch = true  # Auto-assign public IPs
  
  tags = {
    Name = "${var.vpc_name}-public-${count.index + 1}"
  }
}
```

**Private Subnets (Application Layer):**
```hcl
resource "aws_subnet" "private" {
  count              = length(var.availability_zones)
  vpc_id             = aws_vpc.main.id
  cidr_block         = cidrsubnet(var.vpc_cidr, 8, count.index + 100)
  availability_zone  = var.availability_zones[count.index]
  
  tags = {
    Name = "${var.vpc_name}-private-${count.index + 1}"
  }
}
```

**Database Subnets:**
```hcl
resource "aws_db_subnet_group" "main" {
  name       = "${var.vpc_name}-db-subnet-group"
  subnet_ids = aws_subnet.database[*].id
  
  tags = {
    Name = "${var.vpc_name}-db-subnet-group"
  }
}
```

**Why Multiple AZs?**
- ✅ **High Availability:** Survives AZ failures
- ✅ **Disaster Recovery:** Data replicated across zones
- ✅ **Load Distribution:** Spread traffic across zones
- ✅ **Compliance:** Many regulations require multi-AZ

---

### 3. Security Groups (Firewalls)

**ALB Security Group:**
```hcl
resource "aws_security_group" "alb" {
  name        = "prodready-infra-alb-sg"
  description = "Security group for ALB"
  vpc_id      = aws_vpc.main.id

  # Inbound: HTTP from anywhere
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Inbound: HTTPS from anywhere
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Outbound: To ECS tasks
  egress {
    from_port       = 8080
    to_port         = 8080
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs.id]
  }
}
```

**ECS Security Group:**
```hcl
resource "aws_security_group" "ecs" {
  name        = "prodready-infra-ecs-sg"
  description = "Security group for ECS tasks"
  vpc_id      = aws_vpc.main.id

  # Inbound: Port 8080 from ALB only
  ingress {
    from_port       = 8080
    to_port         = 8080
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  # Outbound: To RDS
  egress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.rds.id]
  }

  # Outbound: External APIs
  egress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
```

**RDS Security Group:**
```hcl
resource "aws_security_group" "rds" {
  name        = "prodready-infra-rds-sg"
  description = "Security group for RDS"
  vpc_id      = aws_vpc.main.id

  # Inbound: PostgreSQL port 5432 from ECS only
  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs.id]
  }

  # No outbound rules (RDS doesn't initiate connections)
}
```

**Security Model:**
```
Internet
  │ (Unrestricted)
  ▼
ALB (0.0.0.0/0:80,443)
  │ (Restricted to ECS SG)
  ▼
ECS Tasks (8080)
  │ (Restricted to RDS SG)
  ▼
RDS (5432)
  │ (No outbound)
  ▼
Database
```

---

### 4. Application Load Balancer (ALB)

**Purpose:** Distribute traffic to ECS tasks with health checking

```hcl
resource "aws_lb" "main" {
  name               = "prodready-infra-alb-${var.environment}"
  internal           = false  # Public-facing
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = var.public_subnet_ids

  enable_deletion_protection = false
  enable_http2              = true

  tags = {
    Name = "prodready-infra-alb-${var.environment}"
  }
}

# HTTP Listener
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend.arn
  }
}

# Listener Rules for routing
resource "aws_lb_listener_rule" "api" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 1

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend.arn
  }

  condition {
    path_pattern {
      values = ["/api/*"]
    }
  }
}

resource "aws_lb_listener_rule" "frontend" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 2

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.frontend.arn
  }

  condition {
    path_pattern {
      values = ["/*"]
    }
  }
}
```

---

### 5. Target Groups & Health Checks

**Backend Target Group:**
```hcl
resource "aws_lb_target_group" "backend" {
  name        = "prodready-infra-be-tg-${var.environment}"
  port        = 8080
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"  # For Fargate (not EC2)

  health_check {
    healthy_threshold   = 2          # 2 successful checks = healthy
    unhealthy_threshold = 3          # 3 failed checks = unhealthy
    timeout             = 5          # Wait 5 seconds for response
    interval            = 30         # Check every 30 seconds
    path                = "/api/health"
    matcher             = "200"      # Accept HTTP 200
  }

  # Deregistration delay (connection draining)
  deregistration_delay = 30

  tags = {
    Name = "prodready-infra-be-tg-${var.environment}"
  }
}
```

**Health Check Flow:**
```
Every 30 seconds:
  │
  ├─ ALB → ECS Task:8080/api/health
  │  │
  │  ├─ Task responds with HTTP 200 → Healthy ✅
  │  └─ Task doesn't respond or HTTP 5xx → Unhealthy ❌
  │
  ├─ Count healthy responses
  │  ├─ 2+ healthy → Mark as HEALTHY
  │  ├─ Add to ALB target list
  │  ├─ Traffic routed to this target
  │
  └─ Count unhealthy responses
     ├─ 3+ unhealthy → Mark as UNHEALTHY
     ├─ Remove from ALB target list
     ├─ Initiate deregistration (30 second drain)
     └─ ECS may terminate and restart task
```

---

### 6. ECS Cluster & Services

**Cluster:**
```hcl
resource "aws_ecs_cluster" "main" {
  name = "prodready-infra-cluster-${var.environment}"

  setting {
    name  = "containerInsights"
    value = "enabled"  # CloudWatch Container Insights
  }

  tags = {
    Name = "prodready-infra-cluster-${var.environment}"
  }
}

# Cluster Capacity Providers
resource "aws_ecs_cluster_capacity_providers" "main" {
  cluster_name = aws_ecs_cluster.main.name
  capacity_providers = ["FARGATE", "FARGATE_SPOT"]
}
```

**Task Definition (Backend):**
```hcl
resource "aws_ecs_task_definition" "backend" {
  family                   = "prodready-infra-backend-task-${var.environment}"
  network_mode             = "awsvpc"          # Required for Fargate
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.cpu           # 256
  memory                   = var.memory        # 512 MB
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name      = "prodready-infra-backend"
      image     = var.backend_image
      essential = true
      
      portMappings = [
        {
          containerPort = 8080
          hostPort      = 8080
          protocol      = "tcp"
        }
      ]

      environment = [
        {
          name  = "PORT"
          value = "8080"
        },
        {
          name  = "NODE_ENV"
          value = var.environment
        },
        {
          name  = "DATABASE_URL"
          value = var.database_url
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.backend.name
          "awslogs-region"        = data.aws_region.current.name
          "awslogs-stream-prefix" = "ecs"
        }
      }

      healthCheck = {
        command     = ["CMD-SHELL", "curl -f http://localhost:8080/api/health || exit 1"]
        interval    = 30
        timeout     = 5
        retries     = 3
        startPeriod = 60
      }
    }
  ])
}
```

**Service:**
```hcl
resource "aws_ecs_service" "backend" {
  name                               = "prodready-infra-backend-service-${var.environment}"
  cluster                            = aws_ecs_cluster.main.id
  task_definition                    = aws_ecs_task_definition.backend.arn
  desired_count                      = var.desired_count
  launch_type                        = "FARGATE"
  platform_version                   = "LATEST"
  scheduling_strategy                = "REPLICA"
  force_new_deployment               = true

  # Deployment strategy: Rolling update
  deployment_maximum_percent         = 200      # Can have 2x tasks during deployment
  deployment_minimum_healthy_percent = 100      # Always keep 100% healthy

  network_configuration {
    subnets          = var.private_subnet_ids
    security_groups  = [aws_security_group.ecs.id]
    assign_public_ip = false  # Private subnets, no public IPs
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.backend.arn
    container_name   = "prodready-infra-backend"
    container_port   = 8080
  }

  # Deployment circuit breaker
  deployment_circuit_breaker {
    enable   = true
    rollback = true  # Automatic rollback on deployment failure
  }

  depends_on = [aws_lb_listener.http]

  tags = {
    Name = "prodready-infra-backend-service-${var.environment}"
  }
}
```

**Auto Scaling:**
```hcl
resource "aws_appautoscaling_target" "backend" {
  max_capacity       = 10
  min_capacity       = 2
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.backend.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "backend_cpu" {
  name               = "prodready-infra-backend-cpu-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.backend.resource_id
  scalable_dimension = aws_appautoscaling_target.backend.scalable_dimension
  service_namespace  = aws_appautoscaling_target.backend.service_namespace

  target_tracking_scaling_policy_configuration {
    target_value = 70.0  # Scale when CPU > 70%

    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }

    scale_in_cooldown  = 300   # Wait 5 minutes before scaling down
    scale_out_cooldown = 60    # Scale up immediately
  }
}
```

**Scaling Behavior:**
```
CPU Utilization < 70%:
  └─ After 300s (5 min) cooldown → Scale down
     └─ Minimum: 2 tasks (maintain availability)

CPU Utilization > 70%:
  └─ Immediately → Scale up
     └─ Maximum: 10 tasks (cost control)

Example Timeline:
  00:00 - Traffic surge starts
  00:01 - CPU hits 75% → Scale up to 3 tasks
  00:02 - CPU hits 75% → Scale up to 4 tasks
  00:03 - CPU hits 75% → Scale up to 5 tasks
  00:04 - CPU drops to 65% → Wait 5 minutes before scaling down
  05:04 - CPU still low → Scale down to 4 tasks
```

---

### 7. RDS PostgreSQL Database

```hcl
resource "aws_db_instance" "main" {
  identifier     = "prodready-infra-db-${var.environment}"
  engine         = "postgres"
  engine_version = "15.3"
  instance_class = var.db_instance_class  # db.t3.micro for staging

  db_name  = var.db_name
  username = var.db_username
  password = var.db_password  # From AWS Secrets Manager

  # Storage
  allocated_storage    = 20
  storage_encrypted    = true
  storage_type         = "gp2"

  # Multi-AZ (only for production)
  multi_az = var.environment == "production" ? true : false

  # Networking
  db_subnet_group_name   = aws_db_subnet_group.main.name
  publicly_accessible    = false
  vpc_security_group_ids = [aws_security_group.rds.id]

  # Backup & Recovery
  backup_retention_period = 7           # Keep 7 days of backups
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"

  # Copy snapshots to backup region
  copy_tags_to_snapshot = true

  # Deletion protection
  deletion_protection = var.environment == "production" ? true : false

  skip_final_snapshot       = false
  final_snapshot_identifier = "prodready-infra-db-${var.environment}-final-snapshot-${formatdate("YYYY-MM-DD-hhmm", timestamp())}"

  tags = {
    Name = "prodready-infra-db-${var.environment}"
  }
}
```

**Connection String:**
```
postgresql://postgres:password@prodready-infra-db-staging.xxxxx.us-east-1.rds.amazonaws.com:5432/prodready_infra_staging
```

---

### 8. DynamoDB Tables

```hcl
resource "aws_dynamodb_table" "items" {
  name           = "prodready-infra-items-${var.environment}"
  billing_mode   = "PAY_PER_REQUEST"  # On-demand pricing
  hash_key       = "id"

  attribute {
    name = "id"
    type = "S"  # String
  }

  ttl {
    attribute_name = "expiration_time"
    enabled        = true
  }

  server_side_encryption {
    enabled = true
  }

  point_in_time_recovery {
    enabled = true
  }

  tags = {
    Name = "prodready-infra-items-${var.environment}"
  }
}
```

---

### 9. CloudWatch Logging

```hcl
resource "aws_cloudwatch_log_group" "backend" {
  name              = "/ecs/prodready-infra-backend-${var.environment}"
  retention_in_days = 7

  tags = {
    Name = "prodready-infra-backend-logs-${var.environment}"
  }
}

resource "aws_cloudwatch_log_stream" "backend" {
  name           = "ecs-logs"
  log_group_name = aws_cloudwatch_log_group.backend.name
}
```

**Accessing Logs:**
```bash
# View real-time logs
aws logs tail /ecs/prodready-infra-backend-staging --follow

# View specific time range
aws logs get-log-events \
  --log-group-name /ecs/prodready-infra-backend-staging \
  --log-stream-name ecs-logs \
  --start-time $(date -d '1 hour ago' +%s)000
```

---

## Terraform Structure

### Directory Layout

```
terraform/
├── main.tf                          # Root configuration (all modules)
├── variables.tf                     # Input variables
├── outputs.tf                       # Root outputs
├── environments/
│   ├── staging.tfvars              # Staging variables
│   ├── staging.backend.conf        # Staging S3 backend config
│   ├── production.tfvars           # Production variables
│   └── production.backend.conf     # Production S3 backend config
└── modules/
    ├── vpc/
    │   ├── main.tf                 # VPC, subnets, gateways
    │   ├── variables.tf
    │   └── outputs.tf
    ├── security/
    │   ├── main.tf                 # Security groups
    │   ├── variables.tf
    │   └── outputs.tf
    ├── ecr/
    │   ├── main.tf                 # Container registries
    │   ├── variables.tf
    │   └── outputs.tf
    ├── ecs/
    │   ├── main.tf                 # Cluster, services, tasks
    │   ├── variables.tf
    │   └── outputs.tf
    ├── rds/
    │   ├── main.tf                 # PostgreSQL database
    │   ├── variables.tf
    │   └── outputs.tf
    └── dynamodb/
        ├── main.tf                 # DynamoDB tables
        ├── variables.tf
        └── outputs.tf
```

### Root main.tf Structure

```hcl
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.16"
    }
  }
  
  required_version = ">= 1.3.0"
  
  backend "s3" {
    bucket         = "prodready-infra-terraform-state-875486186130"
    key            = "prodready-infra/staging/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-state-lock-staging"
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region
}

# Data sources
data "aws_availability_zones" "available" {
  state = "available"
}

# Modules
module "vpc" { ... }
module "security_groups" { ... }
module "ecr" { ... }
module "ecs" { ... }
module "rds" { ... }
module "dynamodb" { ... }

# Outputs
output "cluster_name" { ... }
output "backend_service_name" { ... }
output "lb_dns_name" { ... }
```

### Terraform Execution Order

Terraform automatically resolves dependencies:

```
1. VPC (must exist first)
   ├── Availability Zones
   ├── Subnets
   ├── Internet Gateway
   └── NAT Gateway

2. Security Groups (depends on VPC)
   ├── ALB Security Group
   ├── ECS Security Group
   └── RDS Security Group

3. ECR (independent)
   └── Repositories

4. RDS (depends on VPC, Security Groups)
   ├── DB Subnet Group
   └── DB Instance

5. ECS (depends on VPC, Security Groups, ECR, RDS)
   ├── Cluster
   ├── Task Definitions
   ├── Services
   ├── Target Groups
   └── Load Balancer

6. CloudWatch (depends on ECS)
   └── Log Groups
```

---

## Health Check Issues & Solutions

### The Problem

Your deployment was failing with:
```
HTTP 502 - Bad Gateway
HTTP 503 - Service Unavailable
Timeout errors
Target deregistration issues
```

### Root Cause Analysis

#### Issue 1: Port Mismatch

| Component | Expected | Actual | Status |
|-----------|----------|--------|--------|
| Dockerfile | 8080 | 9000 | ❌ MISMATCH |
| [`api/app.js`](api/app.js ) | 8080 | 9000 | ❌ MISMATCH |
| ECS Task Definition | 8080 | 8080 | ✅ OK |
| Target Group | 8080 | 8080 | ✅ OK |
| ALB Health Check | 8080 | 8080 | ✅ OK |

**Why This Fails:**

```
1. ALB sends health check:
   curl http://container-ip:8080/api/health
   
2. Container is listening on port 9000:
   → Connection refused
   
3. Health check fails:
   → ECS marks task as unhealthy
   
4. ALB deregisters target:
   → No healthy targets available
   
5. Result:
   → 502/503 errors for all requests
```

#### Issue 2: Health Check Path Configuration

The health check was looking for `/api/health` but the endpoint wasn't properly exposed.

#### Issue 3: Target Deregistration Cycle

Logs showed:
```
14:18:41 - Target registered ✅
14:19:03 - Deregistration started (22 sec later)
14:19:03 - New target registered ✅
14:19:25 - Deregistration started again (22 sec later)
→ Infinite loop!
```

This indicates:
- Tasks start successfully
- Health checks fail immediately
- ECS constantly cycles tasks

---

## Port Configuration

### Understanding the Three Ports

#### 1. Container Port (ECS)

This is the port inside your Docker container:

```hcl
# terraform/modules/ecs/main.tf
port_mappings = [
  {
    containerPort = 8080
    hostPort      = 8080
    protocol      = "tcp"
  }
]
```

This tells ECS:
- Container listens on port 8080 inside the container
- Host (ECS task) exposes port 8080

#### 2. Application Port (Node.js)

Your application must listen on this port:

```javascript
// api/index.js
const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
```

#### 3. Docker Exposed Port

Your Dockerfile declares which port the app uses:

```dockerfile
# api/Dockerfile
EXPOSE 8080
```

### The Port Flow

```
User Request
  │
  └─ HTTP to ALB:80
     │
     └─ ALB evaluates path:
        │
        ├─ Path /api/* → Backend Target Group:8080
        │  │
        │  └─ ALB:8080 → ECS Task:8080
        │     │
        │     └─ ECS Task:8080 → Container:8080
        │        │
        │        └─ Node.js listening on port 8080
        │           │
        │           └─ Request processed
        │
        └─ Path /* → Frontend Target Group:80
```

### Fix: Ensure Port Alignment

**Step 1: Update Dockerfile**

```dockerfile
FROM node:22-alpine

# ...dependencies...

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npx prisma generate

# ✅ CORRECT: Port 8080
EXPOSE 8080

# ✅ Health check on correct port
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8080/api/health || exit 1

CMD ["npm", "run", "prod"]
```

**Step 2: Update Node.js Application**

```javascript
// api/index.js
const PORT = process.env.PORT || 8080;  // ✅ Default to 8080

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
```

**Step 3: Ensure Environment Variables**

```hcl
# terraform/modules/ecs/main.tf
environment = [
  {
    name  = "PORT"
    value = tostring(var.app_port)  # 8080
  },
  # ... other vars
]
```

**Step 4: Verify Health Check Endpoints**

```javascript
// api/app.js
import express from 'express';

const app = express();

// ✅ Health check BEFORE authentication middleware
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    port: process.env.PORT || 8080
  });
});

// Create router
const apiRouter = express.Router();

// ✅ API health check
apiRouter.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    path: '/api/health'
  });
});

// ✅ Unprotected routes before authentication
apiRouter.use('/auth', authRoutes);

// ✅ Apply authentication middleware
apiRouter.use(authenticateToken);

// ✅ Protected routes
apiRouter.use('/users', userRoutes);

app.use('/api', apiRouter);

export default app;
```

---

## CI/CD Pipeline Deep Dive

### Workflow Overview

Your [`.github/workflows/ci-cd.yml`](.github/workflows/ci-cd.yml ) has **3 main jobs**:

```
┌─ terraform-plan (PRs only)
│  └─ Validate changes before merge
│
├─ build-and-deploy (Main branch only)
│  ├─ Build Docker images
│  ├─ Apply Terraform
│  ├─ Update ECS services
│  ├─ Wait for stability
│  └─ Run health checks
│
└─ notify (Always)
   └─ Report success/failure
```

### Job 1: terraform-plan

**Triggers on:** Pull Requests to main or develop

**Purpose:** Validate infrastructure changes before merging

**Steps:**

```yaml
1. Checkout code
   └─ git clone + checkout branch

2. Configure AWS credentials
   └─ Use GitHub Secrets for AWS keys

3. Setup Terraform
   └─ Install Terraform 1.5.0

4. Terraform Format Check
   └─ terraform fmt -check -recursive
   └─ Ensures consistent formatting

5. Force unlock state (if needed)
   └─ terraform force-unlock
   └─ Clears any stale locks

6. Terraform Init
   └─ terraform init -backend-config="..."
   └─ Connects to S3 state backend

7. Terraform Validate
   └─ terraform validate
   └─ Checks syntax and structure

8. Terraform Plan
   └─ terraform plan -var-file="..."
   └─ Shows what would change
   └─ Output posted to PR for review
```

**Example terraform plan output:**

```
Plan: 5 to add, 2 to change, 0 to destroy.

+ aws_ecs_service.backend
  - name = "prodready-infra-backend-service-staging"
  - cluster = "arn:aws:ecs:..."
  - task_definition = "prodready-infra-backend-task-staging:5"
  - desired_count = 2

~ aws_ecs_task_definition.backend
  - image = "docker_image:old-tag" → "docker_image:new-tag"
```

### Job 2: build-and-deploy

**Triggers on:** Push to main branch

**Purpose:** Build, deploy, and validate the entire application

**Step-by-Step Execution:**

#### Step 1: Authentication Setup

```yaml
- name: Checkout code
  uses: actions/checkout@v4

- name: Configure AWS credentials
  uses: aws-actions/configure-aws-credentials@v4
  with:
    aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
    aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    aws-region: ${{ env.AWS_REGION }}

- name: Login to Amazon ECR
  uses: aws-actions/amazon-ecr-login@v2
```

**What Happens:**
- ✅ Repository code checked out
- ✅ AWS CLI configured with credentials
- ✅ Docker authenticated to push images to ECR

#### Step 2: Terraform Initialization

```yaml
- name: Setup Terraform
  uses: hashicorp/setup-terraform@v3
  with:
    terraform_version: 1.5.0
    terraform_wrapper: false

- name: Terraform Init
  run: |
    cd terraform
    terraform init -backend-config="environments/staging.backend.conf"
```

**What Happens:**
- ✅ Terraform 1.5.0 installed
- ✅ Backend S3 bucket configured
- ✅ DynamoDB lock table ready
- ✅ Terraform modules downloaded

#### Step 3: Clear Stale Locks

```yaml
- name: Clear stale Terraform locks
  run: |
    cd terraform
    echo "🔓 Clearing any stale Terraform locks..."
    if terraform plan ... 2>&1 | grep -q "Lock Info:"; then
      LOCK_ID=$(terraform plan ... 2>&1 | grep "ID:" | awk '{print $2}')
      terraform force-unlock -force "$LOCK_ID"
    else
      echo "No locks detected"
    fi
  continue-on-error: true
```

**Why This Matters:**

If a previous deployment crashed:
- DynamoDB lock remains
- Next deployment blocked: "Error acquiring lock"
- This step detects and clears it
- Deployment can proceed normally

**Important:** `continue-on-error: true` ensures workflow continues even if unlock fails

#### Step 4: Build Backend Docker Image

```yaml
- name: Build and push Backend image
  id: backend_image
  run: |
    cd api
    echo "🏗️ Building backend image..."
    
    # Generate unique tag
    IMAGE_TAG="${GITHUB_SHA:0:7}-$(date +%s)"
    # Example: a1b2c3d-1699876543
    
    # Build with tag
    docker build -t $ECR_REGISTRY/$BACKEND_REPOSITORY:$IMAGE_TAG .
    docker build -t $ECR_REGISTRY/$BACKEND_REPOSITORY:latest .
    
    # Push both tags
    echo "📤 Pushing to ECR..."
    docker push $ECR_REGISTRY/$BACKEND_REPOSITORY:$IMAGE_TAG
    docker push $ECR_REGISTRY/$BACKEND_REPOSITORY:latest
    
    # Output for next steps
    echo "image_tag=$IMAGE_TAG" >> $GITHUB_OUTPUT
    echo "image_uri=$ECR_REGISTRY/$BACKEND_REPOSITORY:$IMAGE_TAG" >> $GITHUB_OUTPUT
```

**What Happens:**

1. **Build image:**
   ```bash
   docker build -t 875486186130.dkr.ecr.us-east-1.amazonaws.com/prodready-infra-api:a1b2c3d-1699876543 .
   ```

2. **Tag with 'latest':**
   ```bash
   docker tag ... :latest
   ```

3. **Push to ECR:**
   ```bash
   docker push ... :a1b2c3d-1699876543
   docker push ... :latest
   ```

4. **Output variables:**
   - `image_tag` = a1b2c3d-1699876543
   - `image_uri` = full ECR URL with tag

**Same process for Frontend** in next step

#### Step 5: Terraform Apply

```yaml
- name: Terraform Apply
  id: apply
  run: |
    cd terraform
    echo "🚀 Applying Terraform changes..."
    terraform apply -auto-approve -var-file="environments/staging.tfvars"
    echo "✅ Infrastructure deployment complete"
  env:
    TF_VAR_db_password: ${{ secrets.DB_PASSWORD }}
```

**What Happens:**

Terraform applies all infrastructure changes:

```
Terraform State (Current)          Desired State (Code)
├─ VPC exists                      ├─ VPC: prodready-infra-vpc ✅
├─ Subnets: 10.1.0.0-10.1.5.0     ├─ Subnets: All present ✅
├─ ECS Cluster (old)               ├─ ECS Cluster: prodready-infra-cluster
├─ RDS Instance                    ├─ RDS: db.t3.micro
├─ Task Def Revision 4             ├─ Task Def: Revision 5 (new image)
└─ Service running old tasks       └─ Service: Force new deployment

Terraform compares and executes:
  1. Update Task Definition → Revision 5
  2. Update ECS Service → Use Revision 5
  3. Force new deployment
  4. Update any security group rules
  5. Update RDS if needed
  6. Commit new state to S3
```

#### Step 6: Get Terraform Outputs

```yaml
- name: Get Terraform Outputs
  id: tf_outputs
  run: |
    cd terraform
    echo "📋 Getting Terraform outputs..."
    
    CLUSTER_NAME=$(terraform output -raw cluster_name 2>/dev/null || echo "prodready-infra-cluster-staging")
    BACKEND_SERVICE=$(terraform output -raw backend_service_name 2>/dev/null || echo "prodready-infra-backend-service-staging")
    FRONTEND_SERVICE=$(terraform output -raw frontend_service_name 2>/dev/null || echo "prodready-infra-frontend-service-staging")
    
    echo "cluster_name=$CLUSTER_NAME" >> $GITHUB_OUTPUT
    echo "backend_service=$BACKEND_SERVICE" >> $GITHUB_OUTPUT
    echo "frontend_service=$FRONTEND_SERVICE" >> $GITHUB_OUTPUT
```

**Why This Matters:**
- Gets resource names from Terraform state
- Falls back to hardcoded names if outputs don't exist
- Passes to subsequent steps via `$GITHUB_OUTPUT`

#### Step 7: Update Task Definitions

```yaml
- name: Update Backend Task Definition
  id: backend_task_def
  run: |
    TASK_FAMILY="prodready-infra-backend-task-staging"
    
    # Get current task definition
    TASK_DEF=$(aws ecs describe-task-definition --task-definition "$TASK_FAMILY")
    
    # Update image in the definition
    NEW_TASK_DEF=$(echo "$TASK_DEF" | jq --arg IMAGE "${{ steps.backend_image.outputs.image_uri }}" '
      .taskDefinition |
      .containerDefinitions[0].image = $IMAGE |
      del(.taskDefinitionArn, .revision, .status, ...)
    ')
    
    # Register as new revision
    NEW_TASK_INFO=$(aws ecs register-task-definition --cli-input-json "$NEW_TASK_DEF")
    NEW_REVISION=$(echo "$NEW_TASK_INFO" | jq -r '.taskDefinition.revision')
    
    echo "revision=$NEW_REVISION" >> $GITHUB_OUTPUT
```

**What Happens:**

```
Task Definition Revision History:
├─ Revision 1: image=prodready-infra-api:old-commit-sha
├─ Revision 2: image=prodready-infra-api:a1b2c3d-1699876543 (new)
├─ Revision 3: image=prodready-infra-api:b2c3d4e-1699876544
└─ Revision 4: image=prodready-infra-api:c3d4e5f-1699876545

With new deployment:
└─ Register new revision with new image URI
   └─ Output: revision=<new-revision-number>
```

#### Step 8: Update ECS Services

```yaml
- name: Update ECS Services
  run: |
    echo "🔄 Forcing ECS services to redeploy..."
    
    # Backend
    aws ecs update-service \
      --cluster ${{ steps.tf_outputs.outputs.cluster_name }} \
      --service ${{ steps.tf_outputs.outputs.backend_service }} \
      --task-definition "${{ steps.backend_task_def.outputs.family }}:${{ steps.backend_task_def.outputs.revision }}" \
      --force-new-deployment \
      --region ${{ env.AWS_REGION }}
    
    # Frontend
    aws ecs update-service \
      --cluster ${{ steps.tf_outputs.outputs.cluster_name }} \
      --service ${{ steps.tf_outputs.outputs.frontend_service }} \
      --task-definition "${{ steps.frontend_task_def.outputs.family }}:${{ steps.frontend_task_def.outputs.revision }}" \
      --force-new-deployment \
      --region ${{ env.AWS_REGION }}
```

**What Happens:**

```
ECS Service Update Flow:

Before:
├─ Desired Count: 2
├─ Running Tasks: 2 (Revision 1)
└─ Deployment Status: COMPLETED

Update Command:
└─ aws ecs update-service --force-new-deployment --task-definition :Revision2

After Update (Rolling Deployment):
├─ Time 0s:   Start new task (Revision 2)
├─ Time 10s:  New task health check starts
├─ Time 20s:  New task passes health check ✅
├─ Time 30s:  Start draining old task (Revision 1)
├─ Time 40s:  Old task deregistered from ALB
├─ Time 60s:  Old task stopped
└─ Final:     2 tasks running (Revision 2) ✅
```

#### Step 9: Wait for Stability

```yaml
- name: Wait for Deployment
  run: |
    echo "⏳ Waiting for services to stabilize (max 10 minutes)..."
    
    timeout 600 aws ecs wait services-stable \
      --cluster ${{ steps.tf_outputs.outputs.cluster_name }} \
      --services ${{ steps.tf_outputs.outputs.backend_service }} \
      --region ${{ env.AWS_REGION }}
```

**What This Does:**

Polls ECS every 15 seconds:

```
Status Check Loop (10 minute timeout):
├─ Check 1: deploymentStatus=IN_PROGRESS → Continue
├─ Check 2: deploymentStatus=IN_PROGRESS → Continue
├─ Check 3: deploymentStatus=IN_PROGRESS → Continue
├─ Check 4: deploymentStatus=IN_PROGRESS → Continue
├─ Check 5: deploymentStatus=COMPLETED, runningCount=2, desiredCount=2 → Success ✅
```

**Service is "Stable" when:**
- `deploymentStatus == "COMPLETED"`
- `runningCount == desiredCount`
- All tasks passed health checks
- No pending/draining tasks

#### Step 10: Health Check Validation

```yaml
- name: Health Check
  run: |
    echo "🏥 Running health checks..."
    
    ALB_DNS=$(terraform output -raw lb_dns_name)
    HEALTH_URL="http://${ALB_DNS}/api/health"
    
    success=false
    for i in {1..30}; do
      echo "Attempt $i/30..."
      RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -m 10 "$HEALTH_URL" || echo "000")
      
      if [ "$RESPONSE" = "200" ]; then
        echo "✅ Health check passed!"
        success=true
        break
      else
        echo "⏳ Retrying in 15 seconds..."
        sleep 15
      fi
    done
    
    if [ "$success" != "true" ]; then
      echo "❌ Health check failed"
      exit 1
    fi
```

**Health Check Timing:**

```
Application Startup Timeline:

0-20s:   Container starting, dependencies loading
20-40s:  Application initialization
40-60s:  Database connection attempts
60s+:    Ready to accept requests

Health Check Attempts:
├─ Attempt 1: 0s - Container not ready (Connection refused)
├─ Attempt 2: 15s - Still loading (Connection refused)
├─ Attempt 3: 30s - Initializing (503 Service Unavailable)
├─ Attempt 4: 45s - Database connecting (500 Error)
├─ Attempt 5: 60s - Ready! (200 OK) ✅
```

**Why 30 attempts?**
- Each attempt waits 15 seconds
- 30 attempts × 15 seconds = 450 seconds (~7.5 minutes)
- Allows time for:
  - Container startup: 20-30 seconds
  - Application initialization: 10-20 seconds
  - Database connection: 5-10 seconds
  - **Total buffer: 60+ seconds**

#### Step 11: Deployment Summary

```yaml
- name: Deployment Summary
  if: always()
  run: |
    echo "📊 Deployment Summary"
    echo "===================="
    echo "Region: ${{ env.AWS_REGION }}"
    echo "Environment: ${{ env.ENVIRONMENT }}"
    echo "Commit: ${GITHUB_SHA:0:7}"
    echo "Backend Image: ${{ steps.backend_image.outputs.image_tag }}"
    echo "Frontend Image: ${{ steps.frontend_image.outputs.image_tag }}"
```

### Job 3: notify

```yaml
notify:
  name: Notify
  runs-on: ubuntu-latest
  needs: [build-and-deploy]
  if: ${{ always() }}
  
  steps:
    - name: Notify Success
      if: ${{ needs.build-and-deploy.result == 'success' }}
      run: echo "🎉 Deployment Successful!"
    
    - name: Notify Failure
      if: ${{ needs.build-and-deploy.result == 'failure' }}
      run: |
        echo "❌ Deployment Failed!"
        exit 1
```

**What Happens:**
- Runs regardless of previous job success (`if: always()`)
- Checks result of build-and-deploy job
- Can be extended to send Slack/email notifications
- Exit code 1 on failure marks workflow as failed

---

## Complete Deployment Timeline

### Typical Deployment Duration: 12-18 minutes

```
Time    Event
────────────────────────────────────────────────────────────
00:00   📌 Git push to main branch
00:01   🚀 GitHub Actions workflow triggered
00:02   📥 Checkout code complete
00:03   🔑 AWS credentials configured
00:04   📦 ECR login successful
00:05   🔄 Terraform init started
00:06   ✅ Terraform init complete
00:07   📋 Terraform plan started
00:08   ✅ Terraform plan complete (showing changes)
        
00:09   🏗️  Backend Docker build started
00:11   ✅ Backend image built (2 min build time)
00:12   📤 Backend pushed to ECR
        
00:13   🏗️  Frontend Docker build started
00:15   ✅ Frontend image built (2 min build time)
00:16   📤 Frontend pushed to ECR
        
00:17   🚀 Terraform apply started
00:20   ✅ Infrastructure updated (3 min apply time)
        ├─ Task definitions updated
        ├─ ECS services updated
        └─ ALB rules configured
        
00:21   📝 Backend task definition updated (Revision N+1)
00:22   📝 Frontend task definition updated (Revision M+1)
        
00:23   🔄 ECS service update initiated
00:24   ✅ Update confirmed
        
00:25   ⏳ Waiting for deployment (Rolling Update)
        ├─ 00:25 → Start new tasks
        ├─ 00:35 → Health checks pass
        ├─ 00:45 → Drain old tasks
        ├─ 00:55 → Stop old tasks
        
00:56   ⏳ Waiting for service stability check (ECS wait)
01:00   ✅ Services stable
        
01:01   🏥 Running health checks
        ├─ Attempt 1: Connection refused
        ├─ Attempt 2: 503 Service Unavailable
        ├─ Attempt 3: 500 Internal Error
        ├─ Attempt 4: 200 OK ✅
        
01:02   📊 Deployment summary generated
01:03   ✅ DEPLOYMENT COMPLETE
```

**Breakdown by Phase:**

| Phase | Duration | Details |
|-------|----------|---------|
| **Setup** | 1-2 min | Git checkout, AWS auth, Terraform init |
| **Build** | 4-5 min | Docker build for both images |
| **Deploy Infra** | 3-4 min | Terraform apply |
| **Update Services** | 1 min | Update task definitions |
| **Rolling Deployment** | 2-3 min | Start new tasks, drain old |
| **Wait & Stabilize** | 1 min | ECS stability check |
| **Health Check** | 1-2 min | HTTP health endpoint validation |
| **Total** | **12-18 min** | From push to production ready |

---

## State Management

### Terraform State File

**Location:** `s3://prodready-infra-terraform-state-875486186130/prodready-infra/staging/terraform.tfstate`

**Contents:**

```json
{
  "version": 4,
  "terraform_version": "1.5.0",
  "serial": 42,
  "lineage": "abc123...",
  
  "outputs": {
    "cluster_name": {
      "value": "prodready-infra-cluster-staging",
      "type": "string"
    },
    "lb_dns_name": {
      "value": "prodready-infra-alb-staging-212250592.us-east-1.elb.amazonaws.com",
      "type": "string"
    }
  },
  
  "resources": [
    {
      "module": "module.ecs",
      "mode": "managed",
      "type": "aws_ecs_cluster",
      "name": "main",
      "instances": [{
        "attributes": {
          "id": "arn:aws:ecs:us-east-1:875486186130:cluster/prodready-infra-cluster-staging",
          "name": "prodready-infra-cluster-staging",
          "arn": "...",
          "status": "ACTIVE"
        }
      }]
    }
  ]
}
```

### State Locking with DynamoDB

**Table:** `terraform-state-lock-staging`

**Why Locking is Critical:**

```
Without Locking:
  Dev A: terraform apply (reads state)
    ├─ Creates VPC
    ├─ Dev B: terraform apply (reads old state)
    │  ├─ Creates VPC (conflict!)
    │  ├─ Creates subnets
    │  └─ Updates state
    │
    └─ Updates state (overwrites Dev B's state!)
    
  Result: ❌ Conflicting infrastructure, inconsistent state

With Locking:
  Dev A: terraform apply
    └─ Acquires lock in DynamoDB
       ├─ Creates VPC
       ├─ Dev B: terraform apply (waits for lock)
       ├─ Creates subnets
       └─ Updates state, releases lock
    
  Dev B: terraform apply (acquires lock)
    ├─ Reads current state (with VPC)
    └─ No duplicate resources
    
  Result: ✅ Consistent state, no conflicts
```

**Lock Structure:**

```json
{
  "LockID": "prodready-infra-terraform-state-875486186130/prodready-infra/staging/terraform.tfstate-md5",
  "Info": {
    "ID": "abc-123-def-456",
    "Operation": "OperationTypeApply",
    "Who": "github-runner@ip-172-31-12-34",
    "Version": "1.5.0",
    "Created": "2024-10-16T10:30:00Z",
    "Path": "prodready-infra/staging/terraform.tfstate"
  }
}
```

### State Versioning with S3

S3 has **versioning enabled** - keeps history of all changes:

```
Version History:
├─ Version 1 (serial: 1, 2024-01-01)
│  └─ Initial infrastructure deployment
│
├─ Version 2 (serial: 2, 2024-01-05)
│  └─ Added RDS database
│
├─ Version 3 (serial: 3, 2024-02-01)
│  └─ Updated ECS desired count
│
├─ Version 4 (serial: 4, 2024-02-15)
│  └─ Added DynamoDB table (CURRENT)
│
└─ Version 5 (serial: 5, 2024-02-20)
   └─ Fixed security group rules

Rollback to Version 3:
  aws s3api copy-object \
    --copy-source bucket/key?versionId=xxx \
    --bucket prodready-infra-terraform-state-875486186130 \
    --key prodready-infra/staging/terraform.tfstate
  
  → terraform plan (shows what changed from Version 3)
  → terraform apply (restores Version 3 configuration)
```

### Backing Up State

**S3 Lifecycle Policy:**

```hcl
resource "aws_s3_bucket_lifecycle_configuration" "state" {
  bucket = aws_s3_bucket.terraform_state.id

  rule {
    id     = "archive-old-versions"
    status = "Enabled"

    noncurrent_version_transition {
      noncurrent_days = 30
      storage_class   = "GLACIER"
    }

    noncurrent_version_expiration {
      noncurrent_days = 365
    }
  }
}
```

**Backup Strategy:**

```
Daily:
  └─ S3 versioning maintains history
  └─ Every change creates new version

Weekly:
  └─ S3 cross-region replication
  └─ Copy state to backup region

Monthly:
  └─ S3 lifecycle → Archive to Glacier
  └─ Long-term archival

On-Demand:
  └─ Manual snapshot
  └─ For critical changes
```

---

## Troubleshooting Guide

### Issue 1: Health Checks Failing (502/503 Errors)

**Symptoms:**
```
curl: (22) The requested URL returned error: 502
curl: (22) The requested URL returned error: 503
Status: Targets draining
```

**Root Cause Analysis:**

```bash
# Step 1: Check task logs
aws logs tail /ecs/prodready-infra-backend-staging --follow

# Step 2: Check target health
aws elbv2 describe-target-health \
  --target-group-arn arn:aws:elasticloadbalancing:us-east-1:...

# Output example:
# {
#   "TargetHealthDescriptions": [{
#     "Target": {"Id": "10.1.2.100"},
#     "TargetHealth": {
#       "State": "unhealthy",
#       "Reason": "Health checks failed",
#       "Description": "Health checks have failed 3 times consecutively"
#     }
#   }]
# }
```

**Solution Checklist:**

1. ✅ **Fix Port Mismatch**
   ```bash
   # Verify Dockerfile exposes correct port
   grep EXPOSE api/Dockerfile  # Should be 8080
   
   # Verify app listens on correct port
   grep "PORT" api/index.js    # Should default to 8080
   
   # Verify ECS task definition