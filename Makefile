# Makefile for ProdReady_Infra Application Deployment

# Variables
AWS_REGION ?= us-east-1
ENVIRONMENT ?= staging
TF_DIR = terraform
BACKEND_DIR = backend
FRONTEND_DIR = frontend
PROJECT_NAME = prodready-infra

# AWS Account ID (dynamically fetched)
AWS_ACCOUNT_ID := $(shell aws sts get-caller-identity --query Account --output text)

# ECR Repository URLs
BACKEND_ECR_REPO = $(AWS_ACCOUNT_ID).dkr.ecr.$(AWS_REGION).amazonaws.com/$(PROJECT_NAME)-backend
FRONTEND_ECR_REPO = $(AWS_ACCOUNT_ID).dkr.ecr.$(AWS_REGION).amazonaws.com/$(PROJECT_NAME)-frontend

# Backend configuration based on environment
BACKEND_CONFIG = backends/$(ENVIRONMENT).conf

# Target to display help information
.PHONY: help
help:
	@echo "ProdReady_Infra Application Deployment Makefile"
	@echo ""
	@echo "Usage:"
	@echo "  make [target] ENVIRONMENT=[staging|production]"
	@echo ""
	@echo "Targets:"
	@echo "  init              Initialize Terraform with environment-specific backend"
	@echo "  plan              Create Terraform plan for specified environment"
	@echo "  apply             Apply Terraform changes for specified environment"
	@echo "  destroy           Destroy infrastructure for specified environment"
	@echo "  build-backend     Build backend Docker image"
	@echo "  build-frontend    Build frontend Docker image"
	@echo "  push-backend      Push backend Docker image to ECR"
	@echo "  push-frontend     Push frontend Docker image to ECR"
	@echo "  deploy            Deploy entire application (infrastructure + containers)"
	@echo "  clean             Clean temporary files"
	@echo "  setup-state       Create S3 bucket and DynamoDB table for Terraform state"
	@echo "  test              Run all tests (backend + frontend)"
	@echo "  security-scan     Run security vulnerability scans"
	@echo "  validate          Validate Terraform configuration"
	@echo ""
	@echo "Variables:"
	@echo "  AWS_REGION        AWS region (default: us-east-1)"
	@echo "  ENVIRONMENT       Environment name (default: staging)"
	@echo ""
	@echo "Examples:"
	@echo "  make plan ENVIRONMENT=staging"
	@echo "  make deploy ENVIRONMENT=production"
	@echo ""

# Terraform targets
.PHONY: init plan apply destroy validate
init:
	cd $(TF_DIR) && terraform init -backend-config=$(BACKEND_CONFIG)

plan:
	cd $(TF_DIR) && terraform plan -var-file=environments/$(ENVIRONMENT).tfvars -out=$(ENVIRONMENT).tfplan

apply:
	cd $(TF_DIR) && terraform apply $(ENVIRONMENT).tfplan

destroy:
	cd $(TF_DIR) && terraform destroy -var-file=environments/$(ENVIRONMENT).tfvars

validate:
	cd $(TF_DIR) && terraform fmt -check -recursive
	cd $(TF_DIR) && terraform validate

# Testing targets
.PHONY: test test-backend test-frontend
test: test-backend test-frontend

test-backend:
	cd $(BACKEND_DIR) && npm test
	cd $(BACKEND_DIR) && npm audit --audit-level high

test-frontend:
	cd $(FRONTEND_DIR) && npm test -- --coverage --watchAll=false
	cd $(FRONTEND_DIR) && npm audit --audit-level high

# Security scanning
.PHONY: security-scan
security-scan:
	# Scan for vulnerabilities using Trivy
	docker run --rm -v $(PWD):/workspace aquasec/trivy:latest fs /workspace
	
	# Scan dependencies
	cd $(BACKEND_DIR) && npm audit --audit-level moderate
	cd $(FRONTEND_DIR) && npm audit --audit-level moderate

# Docker build targets
.PHONY: build-backend build-frontend build-all
build-backend:
	cd $(BACKEND_DIR) && docker build -t $(PROJECT_NAME)-backend:latest .
	docker tag $(PROJECT_NAME)-backend:latest $(BACKEND_ECR_REPO):latest
	docker tag $(PROJECT_NAME)-backend:latest $(BACKEND_ECR_REPO):$(shell git rev-parse --short HEAD)

build-frontend:
	cd $(FRONTEND_DIR) && docker build -t $(PROJECT_NAME)-frontend:latest .
	docker tag $(PROJECT_NAME)-frontend:latest $(FRONTEND_ECR_REPO):latest  
	docker tag $(PROJECT_NAME)-frontend:latest $(FRONTEND_ECR_REPO):$(shell git rev-parse --short HEAD)

build-all: build-backend build-frontend

# ECR push targets
.PHONY: login-ecr push-backend push-frontend push-all
login-ecr:
	aws ecr get-login-password --region $(AWS_REGION) | docker login --username AWS --password-stdin $(AWS_ACCOUNT_ID).dkr.ecr.$(AWS_REGION).amazonaws.com

push-backend: login-ecr
	docker push $(BACKEND_ECR_REPO):latest
	docker push $(BACKEND_ECR_REPO):$(shell git rev-parse --short HEAD)

push-frontend: login-ecr
	docker push $(FRONTEND_ECR_REPO):latest
	docker push $(FRONTEND_ECR_REPO):$(shell git rev-parse --short HEAD)

push-all: push-backend push-frontend

# Setup state storage in AWS for each environment
.PHONY: setup-state setup-state-staging setup-state-production
setup-state: setup-state-$(ENVIRONMENT)

setup-state-staging:
	aws s3 mb s3://$(PROJECT_NAME)-terraform-state-staging --region $(AWS_REGION) || true
	aws dynamodb create-table \
		--table-name terraform-state-lock-staging \
		--attribute-definitions AttributeName=LockID,AttributeType=S \
		--key-schema AttributeName=LockID,KeyType=HASH \
		--billing-mode PAY_PER_REQUEST \
		--region $(AWS_REGION) || true
	@echo "Terraform state storage for staging created!"

setup-state-production:
	aws s3 mb s3://$(PROJECT_NAME)-terraform-state-production --region $(AWS_REGION) || true
	aws dynamodb create-table \
		--table-name terraform-state-lock-production \
		--attribute-definitions AttributeName=LockID,AttributeType=S \
		--key-schema AttributeName=LockID,KeyType=HASH \
		--billing-mode PAY_PER_REQUEST \
		--region $(AWS_REGION) || true
	@echo "Terraform state storage for production created!"

# Secrets management
.PHONY: create-secrets update-secrets
create-secrets:
	@echo "Creating secrets in AWS Secrets Manager for $(ENVIRONMENT)..."
	aws secretsmanager create-secret \
		--name "$(PROJECT_NAME)/$(ENVIRONMENT)/db_password" \
		--description "Database password for $(ENVIRONMENT)" \
		--secret-string "$(DB_PASSWORD)" \
		--region $(AWS_REGION) || true
	
	aws secretsmanager create-secret \
		--name "$(PROJECT_NAME)/$(ENVIRONMENT)/jwt_secret" \
		--description "JWT secret for $(ENVIRONMENT)" \
		--secret-string "$(JWT_SECRET)" \
		--region $(AWS_REGION) || true

# Environment promotion
.PHONY: promote-to-production
promote-to-production:
	@echo "Promoting staging to production..."
	@echo "1. Running tests..."
	$(MAKE) test
	@echo "2. Building and pushing images..."
	$(MAKE) build-all push-all
	@echo "3. Deploying to production..."
	$(MAKE) deploy ENVIRONMENT=production
	@echo "4. Running post-deployment health checks..."
	$(MAKE) health-check ENVIRONMENT=production

# Health checks
.PHONY: health-check
health-check:
	@echo "Running health checks for $(ENVIRONMENT)..."
	# Add health check commands here
	curl -f "https://api-$(ENVIRONMENT).prodready-infra.com/health" || echo "Health check failed"

# Deploy everything with proper order
.PHONY: deploy deploy-infra deploy-apps
deploy-infra: validate init plan apply

deploy-apps: build-all push-all
	@echo "Updating ECS services..."
	aws ecs update-service \
		--cluster $(PROJECT_NAME)-ecs-cluster-$(ENVIRONMENT) \
		--service $(PROJECT_NAME)-backend-service-$(ENVIRONMENT) \
		--force-new-deployment
	aws ecs update-service \
		--cluster $(PROJECT_NAME)-ecs-cluster-$(ENVIRONMENT) \
		--service $(PROJECT_NAME)-frontend-service-$(ENVIRONMENT) \
		--force-new-deployment

deploy: deploy-infra deploy-apps

# Clean up temporary files
.PHONY: clean
clean:
	rm -f $(TF_DIR)/*.tfplan
	rm -f $(TF_DIR)/.terraform.lock.hcl
	rm -rf $(TF_DIR)/.terraform
	docker system prune -f