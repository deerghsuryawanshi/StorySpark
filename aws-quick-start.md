# AWS Quick Start Guide - StoryMagic Deployment

## Step 1: Get Ready (5 minutes)

### Prerequisites Check
1. **AWS Account**: Sign up at https://aws.amazon.com
2. **OpenAI API Key**: Get valid key from https://platform.openai.com
3. **Code Repository**: Upload your code to GitHub

### Important Notes
- Use your real OpenAI API key (current one is invalid)
- Choose region closest to your users (e.g., us-east-1, eu-west-1)
- Set up billing alerts to avoid unexpected charges

## Step 2: Create Database (10 minutes)

### RDS PostgreSQL Setup
1. Go to **AWS Console → RDS**
2. Click **"Create database"**
3. Choose **"Standard create"**
4. Select **PostgreSQL** (latest version)
5. Template: **"Free tier"** (for testing) or **"Production"**

### Database Configuration
```
DB Instance identifier: storymagic-db
Master username: storymagic
Master password: [Create secure 12+ character password]
DB name: storymagic

VPC: Default VPC
Subnet group: Default
Public access: Yes (temporary - we'll secure this later)
Security group: Create new "storymagic-db-sg"
```

6. Click **"Create database"**
7. **Save the endpoint URL** - you'll need it later

## Step 3: Launch Web Server (15 minutes)

### EC2 Instance Setup
1. Go to **AWS Console → EC2**
2. Click **"Launch Instance"**
3. Name: `storymagic-web`
4. AMI: **Ubuntu Server 22.04 LTS** (free tier eligible)
5. Instance type: **t2.micro** (free tier) or **t3.small** (production)
6. Key pair: Create new or select existing
7. Security group: Create new **"storymagic-web-sg"**

### Security Group Rules for Web Server
```
Inbound Rules:
- SSH (22): My IP
- HTTP (80): Anywhere (0.0.0.0/0)
- HTTPS (443): Anywhere (0.0.0.0/0)
```

8. Click **"Launch Instance"**
9. Wait for instance to be **"Running"**

### Update Database Security
1. Go to **EC2 → Security Groups**
2. Find **"storymagic-db-sg"**
3. Edit inbound rules:
   - Type: **PostgreSQL (5432)**
   - Source: **storymagic-web-sg** (select the security group)

## Step 4: Setup Application (20 minutes)

### Connect to Server
```bash
# Download your key pair and connect
chmod 400 your-key-pair.pem
ssh -i "your-key-pair.pem" ubuntu@YOUR_EC2_PUBLIC_IP
```

### Install Dependencies
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs git nginx

# Install PM2 process manager
sudo npm install -g pm2

# Verify installations
node --version
npm --version
```

### Deploy Application
```bash
# Clone your repository
git clone https://github.com/YOUR_USERNAME/storymagic-app.git
cd storymagic-app

# Install dependencies
npm install

# Build application
npm run build
```

### Configure Environment
```bash
# Create environment file
nano .env

# Add these variables (replace with your actual values):
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://storymagic:YOUR_DB_PASSWORD@YOUR_RDS_ENDPOINT:5432/storymagic
OPENAI_API_KEY=your_real_openai_api_key_here
```

### Initialize Database
```bash
# Setup database tables
npm run db:push
```

## Step 5: Configure Web Server (10 minutes)

### Setup Nginx
```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/storymagic

# Add this configuration:
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
}

# Enable the site
sudo ln -s /etc/nginx/sites-available/storymagic /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test and restart Nginx
sudo nginx -t
sudo systemctl restart nginx
```

### Start Application
```bash
# Create PM2 configuration
nano ecosystem.config.js

# Add this content:
module.exports = {
  apps: [{
    name: 'storymagic',
    script: 'server/index.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
# Follow the instructions shown
```

## Step 6: Test Your Deployment (5 minutes)

### Quick Tests
1. Visit `http://YOUR_EC2_PUBLIC_IP`
2. Try creating a story
3. Test the audio feature
4. Check the story library

### Check Application Status
```bash
# Check PM2 status
pm2 status

# View logs if there are issues
pm2 logs storymagic

# Check Nginx status
sudo systemctl status nginx
```

## Step 7: Secure with HTTPS (Optional - 15 minutes)

### If You Have a Domain
1. **AWS Certificate Manager**:
   - Request public certificate for your domain
   - Add DNS validation records

2. **Application Load Balancer**:
   - Create ALB pointing to your EC2 instance
   - Add HTTPS listener with your certificate
   - Update security groups

3. **Route 53** (if using AWS for DNS):
   - Create hosted zone for your domain
   - Add A record pointing to ALB

## Troubleshooting

### App Won't Start
```bash
# Check logs
pm2 logs storymagic

# Common issues:
# 1. Wrong DATABASE_URL format
# 2. Invalid OpenAI API key
# 3. Port 3000 already in use
```

### Database Connection Failed
```bash
# Test database connection
psql -h YOUR_RDS_ENDPOINT -U storymagic -d storymagic

# If fails, check:
# 1. Security group allows connection
# 2. Database is running
# 3. Credentials are correct
```

### Can't Access Website
```bash
# Check if Nginx is running
sudo systemctl status nginx

# Check security group allows HTTP/HTTPS
# Check if port 3000 app is running: netstat -tulpn | grep :3000
```

## Cost Monitoring

### Set Up Billing Alerts
1. Go to **AWS Billing Dashboard**
2. Create billing alarm for $10, $25, $50
3. Monitor daily usage

### Free Tier Usage
- Check free tier usage in billing dashboard
- Monitor hours used for EC2 and RDS

## Next Steps

Once basic deployment works:
1. Set up automated backups
2. Configure monitoring with CloudWatch
3. Add auto-scaling if needed
4. Implement proper CI/CD pipeline

Your StoryMagic app is now live on AWS! 🎉

**Access your app**: `http://YOUR_EC2_PUBLIC_IP`