#!/bin/bash
# Bastion Host User Data Script

# Update system
yum update -y

# Install SSM Agent (usually pre-installed on Amazon Linux 2)
yum install -y amazon-ssm-agent
systemctl enable amazon-ssm-agent
systemctl start amazon-ssm-agent

# Install useful tools
yum install -y htop tree git mysql postgresql-client

# Install AWS CLI v2
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Create a welcome message
cat << 'EOF' > /etc/motd
=====================================
 ${project_name} Bastion Host - ${environment}
=====================================

This bastion host provides secure access to private resources.

Useful commands:
- aws --version                    # Check AWS CLI version
- mysql -h <rds-endpoint> -u admin # Connect to MySQL RDS
- psql -h <rds-endpoint> -U admin  # Connect to PostgreSQL RDS

Security reminders:
- This session is logged via CloudWatch
- All commands are audited
- Follow company security policies

=====================================
EOF

# Configure CloudWatch agent for custom metrics
cat << 'EOF' > /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json
{
  "agent": {
    "metrics_collection_interval": 60,
    "run_as_user": "cwagent"
  },
  "metrics": {
    "namespace": "CWAgent",
    "metrics_collected": {
      "cpu": {
        "measurement": [
          "cpu_usage_idle",
          "cpu_usage_iowait",
          "cpu_usage_user",
          "cpu_usage_system"
        ],
        "metrics_collection_interval": 60
      },
      "disk": {
        "measurement": [
          "used_percent"
        ],
        "metrics_collection_interval": 60,
        "resources": [
          "*"
        ]
      },
      "diskio": {
        "measurement": [
          "io_time"
        ],
        "metrics_collection_interval": 60,
        "resources": [
          "*"
        ]
      },
      "mem": {
        "measurement": [
          "mem_used_percent"
        ],
        "metrics_collection_interval": 60
      }
    }
  }
}
EOF

# Start CloudWatch agent
/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json -s

# Set up log rotation for session logs
cat << 'EOF' > /etc/logrotate.d/session-manager
/var/log/amazon/ssm/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 644 root root
}
EOF

# Create startup script for maintenance tasks
cat << 'EOF' > /usr/local/bin/bastion-startup.sh
#!/bin/bash
# Daily maintenance tasks

# Update SSM Agent
yum update -y amazon-ssm-agent

# Clean up old logs
find /var/log -name "*.log" -mtime +7 -exec rm -f {} \;

# Update system packages weekly
LAST_UPDATE=$(stat -c %Y /var/cache/yum/last_update 2>/dev/null || echo 0)
WEEK_AGO=$(($(date +%s) - 604800))
if [ $LAST_UPDATE -lt $WEEK_AGO ]; then
    yum update -y
    touch /var/cache/yum/last_update
fi
EOF

chmod +x /usr/local/bin/bastion-startup.sh

# Add to cron for daily execution
echo "0 2 * * * root /usr/local/bin/bastion-startup.sh" >> /etc/crontab

# Signal CloudFormation that the instance is ready
yum install -y aws-cfn-bootstrap
/opt/aws/bin/cfn-signal -e $? --stack ${AWS::StackName} --resource BastionAutoScalingGroup --region ${AWS::Region}

echo "Bastion host setup completed at $(date)" >> /var/log/bastion-setup.log