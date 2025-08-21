# Complete AWS Deployment Guide

## Prerequisites
- AWS Account with billing enabled
- Valid OpenAI API key from https://platform.openai.com
- Basic AWS knowledge
- AWS CLI installed (optional but recommended)

## Deployment Architecture
- **EC2**: Web server hosting
- **RDS**: PostgreSQL database
- **CloudFront**: CDN for static assets
- **Route 53**: DNS management (optional)
- **Load Balancer**: High availability (optional)

## Step 1: Set Up RDS PostgreSQL Database

### 1.1 Create RDS Instance
1. Go to AWS Console → RDS
2. Click "Create database"
3. Choose "Standard create"
4. Engine: PostgreSQL (latest version)
5. Templates: "Free tier" (for testing) or "Production" (for live)

### 1.2 Database Configuration
```
DB Instance identifier: storymagic-db
Master username: storymagic
Master password: [Create secure password]
DB name: storymagic
VPC: Default VPC
Subnet group: Default
Public access: Yes (for initial setup)
VPC security group: Create new (storymagic-db-sg)
```

### 1.3 Security Group Configuration
1. Go to EC2 → Security Groups
2. Find "storymagic-db-sg"
3. Add inbound rule:
   - Type: PostgreSQL
   - Port: 5432
   - Source: Custom (your EC2 security group - will create next)

## Step 2: Launch EC2 Instance

### 2.1 Create EC2 Instance
1. Go to AWS Console → EC2
2. Click "Launch Instance"
3. Choose AMI: "Ubuntu Server 22.04 LTS"
4. Instance type: t2.micro (free tier) or t3.small (production)
5. Key pair: Create new or use existing

### 2.2 Security Group for EC2
Create security group "storymagic-web-sg":
```
Inbound Rules:
- SSH (22) - Your IP
- HTTP (80) - Anywhere IPv4
- HTTPS (443) - Anywhere IPv4
- Custom TCP (3000) - Anywhere IPv4 (temporary)
```

### 2.3 Connect to EC2
```bash
# Connect via SSH
ssh -i "your-key-pair.pem" ubuntu@YOUR_EC2_PUBLIC_IP
```

## Step 3: Server Setup on EC2

### 3.1 Update System
```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y curl wget git nginx postgresql-client
```

### 3.2 Install Node.js
```bash
# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2
```

### 3.3 Clone and Setup Application
```bash
# Clone repository
cd /home/ubuntu
git clone https://github.com/YOUR_USERNAME/storymagic-app.git
cd storymagic-app

# Install dependencies
npm install

# Build application
npm run build
```

## Step 4: Environment Configuration

### 4.1 Create Environment File
```bash
# Create .env file
nano .env

# Add these variables (replace with your values):
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://storymagic:YOUR_DB_PASSWORD@YOUR_RDS_ENDPOINT:5432/storymagic
OPENAI_API_KEY=your_openai_api_key_here
```

### 4.2 Initialize Database
```bash
# Push database schema
npm run db:push
```

## Step 5: Configure Application Load Balancer (Optional)

### 5.1 Create Target Group
1. Go to EC2 → Target Groups
2. Create target group:
   - Type: Instances
   - Name: storymagic-targets
   - Protocol: HTTP, Port: 3000
   - Health check path: /
3. Register your EC2 instance

### 5.2 Create Application Load Balancer
1. Go to EC2 → Load Balancers
2. Create Application Load Balancer:
   - Name: storymagic-alb
   - Scheme: Internet-facing
   - Listeners: HTTP (80) and HTTPS (443)
   - Security groups: Create new or use existing
3. Configure routing to target group

## Step 6: Set Up CloudFront CDN

### 6.1 Create CloudFront Distribution
1. Go to CloudFront → Create Distribution
2. Origin domain: Your ALB domain or EC2 public IP
3. Protocol: HTTP only (initially)
4. Viewer protocol policy: Redirect HTTP to HTTPS
5. Caching behavior: Customize for static assets

### 6.2 CloudFront Configuration
```
Origin Settings:
- Origin domain: your-alb-domain.elb.amazonaws.com
- Protocol: HTTP only
- HTTP port: 80

Default Cache Behavior:
- Viewer protocol policy: Redirect HTTP to HTTPS
- Allowed HTTP methods: GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE
- Cache policy: CachingDisabled (for dynamic content)

Additional Behavior (for static assets):
- Path pattern: *.js, *.css, *.png, *.jpg, *.gif, *.ico
- Cache policy: CachingOptimized
```

## Step 7: Configure Nginx on EC2

### 7.1 Nginx Configuration
```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/storymagic

# Add configuration:
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static file caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/storymagic /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

## Step 8: Start Application with PM2

### 8.1 PM2 Configuration
```bash
# Create PM2 config
nano ecosystem.config.js

module.exports = {
  apps: [{
    name: 'storymagic',
    script: 'server/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}

# Create logs directory
mkdir logs

# Start application
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Follow the instructions to set up auto-start
```

## Step 9: SSL Certificate with AWS Certificate Manager

### 9.1 Request SSL Certificate
1. Go to AWS Certificate Manager
2. Request a public certificate
3. Add domain names (e.g., storymagic.com, www.storymagic.com)
4. Choose DNS validation
5. Create CNAME records in your DNS

### 9.2 Configure HTTPS on Load Balancer
1. Go to EC2 → Load Balancers
2. Edit your ALB
3. Add HTTPS listener (port 443)
4. Select your SSL certificate
5. Forward to target group

## Step 10: Domain Configuration with Route 53

### 10.1 Create Hosted Zone
1. Go to Route 53 → Hosted zones
2. Create hosted zone for your domain
3. Note the name servers

### 10.2 DNS Records
Create these records:
```
Type: A
Name: (empty or @)
Alias: Yes
Target: Your CloudFront distribution

Type: A
Name: www
Alias: Yes
Target: Your CloudFront distribution
```

## Step 11: Auto Scaling (Optional)

### 11.1 Create Launch Template
1. Go to EC2 → Launch Templates
2. Create template based on your configured instance
3. Include user data script for automatic setup

### 11.2 Auto Scaling Group
1. Create Auto Scaling Group
2. Use your launch template
3. Set desired capacity: 2
4. Set minimum: 1, maximum: 5
5. Attach to your target group

## Step 12: Monitoring and Logging

### 12.1 CloudWatch Setup
```bash
# Install CloudWatch agent
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i -E ./amazon-cloudwatch-agent.deb

# Configure CloudWatch agent
sudo nano /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json

{
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/home/ubuntu/storymagic-app/logs/combined.log",
            "log_group_name": "storymagic-app",
            "log_stream_name": "application"
          }
        ]
      }
    }
  }
}

# Start CloudWatch agent
sudo systemctl start amazon-cloudwatch-agent
```

### 12.2 Set Up Alarms
1. Go to CloudWatch → Alarms
2. Create alarms for:
   - High CPU usage
   - High memory usage
   - Application errors
   - Database connections

## Step 13: Backup Strategy

### 13.1 RDS Automated Backups
1. Go to RDS → Your database
2. Modify database
3. Enable automated backups
4. Set backup retention period (7-35 days)
5. Set backup window

### 13.2 Application Code Backup
```bash
# Create backup script
nano /home/ubuntu/backup-app.sh

#!/bin/bash
BACKUP_DIR="/home/ubuntu/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup application files
tar -czf $BACKUP_DIR/storymagic_$DATE.tar.gz /home/ubuntu/storymagic-app

# Upload to S3 (optional)
# aws s3 cp $BACKUP_DIR/storymagic_$DATE.tar.gz s3://your-backup-bucket/

# Keep only last 7 days
find $BACKUP_DIR -name "storymagic_*.tar.gz" -mtime +7 -delete

chmod +x /home/ubuntu/backup-app.sh

# Add to crontab
crontab -e
# Add: 0 2 * * * /home/ubuntu/backup-app.sh
```

## Step 14: Security Hardening

### 14.1 Update Security Groups
Remove temporary rules:
- Remove port 3000 access from internet
- Restrict SSH to your IP only
- Database should only allow EC2 security group

### 14.2 IAM Roles (if needed)
Create IAM role for EC2 with minimal permissions:
- CloudWatch logs write access
- S3 access for backups (if using)

## Cost Estimation (Monthly)

### Free Tier Eligible:
- EC2 t2.micro: $0 (first year)
- RDS db.t3.micro: $0 (first year)
- CloudFront: 50GB free per month
- Route 53: $0.50 per hosted zone

### Production Costs:
- EC2 t3.small: ~$15/month
- RDS db.t3.small: ~$25/month
- Application Load Balancer: ~$16/month
- CloudFront: ~$1-10/month (depending on usage)
- Route 53: $0.50/month per hosted zone
- Data transfer: Variable

### Total Estimated Cost:
- Free tier: ~$0.50/month
- Production: ~$60-80/month

## Troubleshooting

### Common Issues:

**Database connection failed:**
```bash
# Test connection
psql -h YOUR_RDS_ENDPOINT -U storymagic -d storymagic

# Check security groups
# Ensure RDS security group allows EC2 security group
```

**Application not accessible:**
```bash
# Check PM2 status
pm2 status

# Check Nginx
sudo systemctl status nginx

# Check load balancer health
# Go to EC2 → Target Groups → Check health status
```

**SSL certificate issues:**
- Ensure DNS validation is complete
- Check CloudFront distribution settings
- Verify certificate is attached to load balancer

Your StoryMagic app will be accessible via CloudFront URL or your custom domain!