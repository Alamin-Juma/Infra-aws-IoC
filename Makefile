# Makefile for iTrack Application Deployment

# Variables
AWS_REGION ?= us-east-1
ENVIRONMENT ?= production
TF_DIR = terraform
BACKEND_DIR = backend
FRONTEND_DIR = frontend
PROJECT_NAME = itrack

# AWS Account ID (dynamically fetched)
AWS_ACCOUNT_ID := $(shell aws sts get-caller-identity --query Account --output text)

# ECR Repository URLs
BACKEND_ECR_REPO = $(AWS_ACCOUNT_ID).dkr.ecr.$(AWS_REGION).amazonaws.com/$(PROJECT_NAME)-backend
FRONTEND_ECR_REPO = $(AWS_ACCOUNT_ID).dkr.ecr.$(AWS_REGION).amazonaws.com/$(PROJECT_NAME)-frontend

# Target to display help information
.PHONY: help
help:
	@echo "iTrack Application Deployment Makefile"
	@echo ""
	@echo "Usage:"
	@echo "  make [target]"
	@echo ""
	@echo "Targets:"
	@echo "  init              Initialize Terraform"
	@echo "  plan              Create Terraform plan"
	@echo "  apply             Apply Terraform changes"
	@echo "  destroy           Destroy infrastructure"
	@echo "  build-backend     Build backend Docker image"
	@echo "  build-frontend    Build frontend Docker image"
	@echo "  push-backend      Push backend Docker image to ECR"
	@echo "  push-frontend     Push frontend Docker image to ECR"
	@echo "  deploy            Deploy entire application (infrastructure + containers)"
	@echo "  clean             Clean temporary files"
	@echo "  setup-state       Create S3 bucket and DynamoDB table for Terraform state"
	@echo ""
	@echo "Variables:"
	@echo "  AWS_REGION        AWS region (default: us-east-1)"
	@echo "  ENVIRONMENT       Environment name (default: production)"
	@echo ""

# Terraform targets
.PHONY: init plan apply destroy
init:
	cd $(TF_DIR) && terraform init

plan:
	cd $(TF_DIR) && terraform plan -out=tfplan -var-file=terraform.tfvars

apply:
	cd $(TF_DIR) && terraform apply tfplan

destroy:
	cd $(TF_DIR) && terraform destroy -var-file=terraform.tfvars

# Docker build targets
.PHONY: build-backend build-frontend
build-backend:
	cd $(BACKEND_DIR) && docker build -t $(PROJECT_NAME)-backend:latest .
	docker tag $(PROJECT_NAME)-backend:latest $(BACKEND_ECR_REPO):latest

build-frontend:
	cd $(FRONTEND_DIR) && docker build -t $(PROJECT_NAME)-frontend:latest .
	docker tag $(PROJECT_NAME)-frontend:latest $(FRONTEND_ECR_REPO):latest

# ECR push targets
.PHONY: login-ecr push-backend push-frontend
login-ecr:
	aws ecr get-login-password --region $(AWS_REGION) | docker login --username AWS --password-stdin $(AWS_ACCOUNT_ID).dkr.ecr.$(AWS_REGION).amazonaws.com

push-backend: login-ecr
	docker push $(BACKEND_ECR_REPO):latest

push-frontend: login-ecr
	docker push $(FRONTEND_ECR_REPO):latest

# Setup state storage in AWS
.PHONY: setup-state
setup-state:
	aws s3 mb s3://$(PROJECT_NAME)-terraform-state --region $(AWS_REGION)
	aws dynamodb create-table \
		--table-name terraform-state-lock \
		--attribute-definitions AttributeName=LockID,AttributeType=S \
		--key-schema AttributeName=LockID,KeyType=HASH \
		--billing-mode PAY_PER_REQUEST \
		--region $(AWS_REGION)
	@echo "Terraform state storage created!"
	@echo "Don't forget to update the backend configuration in terraform/main.tf"

# Deploy everything
.PHONY: deploy
deploy: init plan apply build-backend build-frontend push-backend push-frontend
	@echo "Deployment completed successfully!"

# Clean up temporary files
.PHONY: clean
clean:
	rm -f $(TF_DIR)/tfplan
	rm -f $(TF_DIR)/.terraform.lock.hcl
	rm -rf $(TF_DIR)/.terraform