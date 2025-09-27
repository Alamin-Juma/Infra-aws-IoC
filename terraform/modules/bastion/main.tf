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

variable "public_subnet_ids" {
  description = "IDs of public subnets for bastion host"
  type        = list(string)
}

variable "allowed_cidr_blocks" {
  description = "CIDR blocks allowed to access bastion host"
  type        = list(string)
  default     = ["0.0.0.0/0"]  # Restrict this in production
}

variable "key_name" {
  description = "Name of the EC2 Key Pair for bastion host access"
  type        = string
}

variable "instance_type" {
  description = "Instance type for bastion host"
  type        = string
  default     = "t3.micro"
}

# Data source for latest Amazon Linux 2 AMI
data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]
  
  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }
}

# Security Group for Bastion Host
resource "aws_security_group" "bastion" {
  name        = "${var.project_name}-bastion-sg-${var.environment}"
  description = "Security group for bastion host"
  vpc_id      = var.vpc_id

  # SSH access
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = var.allowed_cidr_blocks
    description = "SSH access to bastion host"
  }

  # Outbound internet access
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic"
  }

  tags = {
    Name        = "${var.project_name}-bastion-sg"
    Environment = var.environment
  }
}

# Security Group for Database Access from Bastion
resource "aws_security_group" "bastion_db_access" {
  name        = "${var.project_name}-bastion-db-access-${var.environment}"
  description = "Allow database access from bastion host"
  vpc_id      = var.vpc_id

  # PostgreSQL access from bastion
  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.bastion.id]
    description     = "PostgreSQL access from bastion"
  }

  # MySQL access from bastion  
  ingress {
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = [aws_security_group.bastion.id]
    description     = "MySQL access from bastion"
  }

  tags = {
    Name        = "${var.project_name}-bastion-db-access"
    Environment = var.environment
  }
}

# IAM Role for Bastion Host
resource "aws_iam_role" "bastion_role" {
  name = "${var.project_name}-bastion-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

# IAM Policy for Systems Manager Session Manager
resource "aws_iam_role_policy" "bastion_session_manager" {
  name = "${var.project_name}-bastion-session-manager-${var.environment}"
  role = aws_iam_role.bastion_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ssm:UpdateInstanceInformation",
          "ssmmessages:CreateControlChannel",
          "ssmmessages:CreateDataChannel",
          "ssmmessages:OpenControlChannel",
          "ssmmessages:OpenDataChannel",
          "ec2messages:GetMessages"
        ]
        Resource = "*"
      }
    ]
  })
}

# IAM Instance Profile
resource "aws_iam_instance_profile" "bastion_profile" {
  name = "${var.project_name}-bastion-profile-${var.environment}"
  role = aws_iam_role.bastion_role.name
}

# Launch Template for Auto Scaling
resource "aws_launch_template" "bastion" {
  name_prefix   = "${var.project_name}-bastion-${var.environment}-"
  image_id      = data.aws_ami.amazon_linux.id
  instance_type = var.instance_type
  key_name      = var.key_name

  vpc_security_group_ids = [aws_security_group.bastion.id]

  iam_instance_profile {
    name = aws_iam_instance_profile.bastion_profile.name
  }

  user_data = base64encode(templatefile("${path.module}/bastion-userdata.sh", {
    project_name = var.project_name
    environment  = var.environment
  }))

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name        = "${var.project_name}-bastion-${var.environment}"
      Environment = var.environment
      Type        = "BastionHost"
    }
  }

  tags = {
    Name        = "${var.project_name}-bastion-template"
    Environment = var.environment
  }
}

# Auto Scaling Group for High Availability
resource "aws_autoscaling_group" "bastion" {
  name                = "${var.project_name}-bastion-asg-${var.environment}"
  vpc_zone_identifier = var.public_subnet_ids
  min_size            = 1
  max_size            = 2
  desired_capacity    = 1
  health_check_type   = "EC2"
  health_check_grace_period = 300

  launch_template {
    id      = aws_launch_template.bastion.id
    version = "$Latest"
  }

  tag {
    key                 = "Name"
    value               = "${var.project_name}-bastion-asg"
    propagate_at_launch = false
  }

  tag {
    key                 = "Environment"
    value               = var.environment
    propagate_at_launch = true
  }
}

# CloudWatch Log Group for Session Manager logs
resource "aws_cloudwatch_log_group" "session_manager" {
  name              = "/aws/sessionmanager/${var.project_name}-${var.environment}"
  retention_in_days = 30

  tags = {
    Name        = "${var.project_name}-session-manager-logs"
    Environment = var.environment
  }
}

# Systems Manager Document for Session Manager logging
resource "aws_ssm_document" "session_manager_prefs" {
  name            = "${var.project_name}-SessionManagerRunShell-${var.environment}"
  document_type   = "Session"
  document_format = "JSON"

  content = jsonencode({
    schemaVersion = "1.0"
    description   = "Document to hold regional settings for Session Manager"
    sessionType   = "Standard_Stream"
    inputs = {
      s3BucketName                = ""
      s3KeyPrefix                 = ""
      s3EncryptionEnabled         = true
      cloudWatchLogGroupName      = aws_cloudwatch_log_group.session_manager.name
      cloudWatchEncryptionEnabled = true
      cloudWatchStreamingEnabled  = true
      idleSessionTimeout          = "20"
      maxSessionDuration          = "60"
      runAsEnabled                = false
      runAsDefaultUser            = ""
      shellProfile = {
        windows = "date"
        linux   = "pwd;ls"
      }
    }
  })

  tags = {
    Name        = "${var.project_name}-session-manager-document"
    Environment = var.environment
  }
}

# Outputs
output "bastion_security_group_id" {
  description = "ID of the bastion host security group"
  value       = aws_security_group.bastion.id
}

output "bastion_db_access_security_group_id" {
  description = "ID of the bastion database access security group"
  value       = aws_security_group.bastion_db_access.id
}

output "bastion_asg_name" {
  description = "Name of the bastion host auto scaling group"
  value       = aws_autoscaling_group.bastion.name
}