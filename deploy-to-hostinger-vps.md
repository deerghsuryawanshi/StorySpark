# Complete Hostinger VPS Deployment Guide

## Prerequisites
- Hostinger VPS hosting plan
- Valid OpenAI API key from https://platform.openai.com
- Basic SSH knowledge

## Step 1: Set Up Hostinger VPS

### 1.1 Access Your VPS
1. Log into Hostinger control panel
2. Go to "VPS" section
3. Click "Manage" on your VPS
4. Note down your VPS IP address
5. Use the provided SSH credentials or set up SSH keys

### 1.2 Connect to VPS
```bash
# Connect via SSH
ssh root@YOUR_VPS_IP
# Enter password when prompted
```

## Step 2: Server Setup

### 2.1 Update System
```bash
# Update package manager
apt update && apt upgrade -y

# Install required packages
apt install -y curl wget git nginx postgresql postgresql-contrib
```

### 2.2 Install Node.js
```bash
# Install Node.js 18+ (recommended)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

# Verify installation
node --version
npm --version
```

### 2.3 Install PM2 (Process Manager)
```bash
npm install -g pm2
```

## Step 3: Database Setup

### 3.1 Configure PostgreSQL
```bash
# Start PostgreSQL service
systemctl start postgresql
systemctl enable postgresql

# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE storymagic;
CREATE USER storymagic WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE storymagic TO storymagic;
\q
EOF
```

### 3.2 Configure PostgreSQL for Remote Access
```bash
# Edit PostgreSQL configuration
nano /etc/postgresql/*/main/postgresql.conf

# Find and modify:
listen_addresses = 'localhost'

# Edit access control
nano /etc/postgresql/*/main/pg_hba.conf

# Add line:
local   storymagic    storymagic                    md5

# Restart PostgreSQL
systemctl restart postgresql
```

## Step 4: Deploy Application

### 4.1 Clone Your Repository
```bash
# Navigate to web directory
cd /var/www

# Clone your repository (replace with your GitHub URL)
git clone https://github.com/YOUR_USERNAME/storymagic-app.git
cd storymagic-app

# Set proper permissions
chown -R www-data:www-data /var/www/storymagic-app
```

### 4.2 Install Dependencies
```bash
# Install Node.js dependencies
npm install

# Build the application
npm run build
```

### 4.3 Set Up Environment Variables
```bash
# Create environment file
nano .env

# Add these variables:
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://storymagic:your_secure_password@localhost:5432/storymagic
OPENAI_API_KEY=your_openai_api_key_here
```

### 4.4 Initialize Database
```bash
# Push database schema
npm run db:push
```

## Step 5: Configure Nginx

### 5.1 Create Nginx Configuration
```bash
# Create site configuration
nano /etc/nginx/sites-available/storymagic

# Add this configuration:
server {
    listen 80;
    server_name YOUR_DOMAIN_OR_IP;

    location / {
        proxy_pass http://localhost:5000;
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
```

### 5.2 Enable Site
```bash
# Enable the site
ln -s /etc/nginx/sites-available/storymagic /etc/nginx/sites-enabled/

# Test Nginx configuration
nginx -t

# Restart Nginx
systemctl restart nginx
```

## Step 6: Start Application with PM2

### 6.1 Create PM2 Configuration
The PM2 configuration file (ecosystem.config.js) is already included in your project. It's configured to:
- Run in cluster mode for better performance
- Use port 5000 (matching your app configuration)
- Handle automatic restarts and logging
- Restart on high memory usage

If you need to modify it, the file is already set up correctly for your application.

### 6.2 Start Application
```bash
# Create logs directory
mkdir logs

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Set up PM2 to start on boot
pm2 startup
```

## Step 7: SSL Certificate (Optional but Recommended)

### 7.1 Install Certbot
```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx
```

### 7.2 Get SSL Certificate
```bash
# Get certificate (replace YOUR_DOMAIN)
certbot --nginx -d YOUR_DOMAIN

# Set up auto-renewal
crontab -e

# Add this line:
0 12 * * * /usr/bin/certbot renew --quiet
```

## Step 8: Firewall Configuration

### 8.1 Set Up UFW Firewall
```bash
# Enable firewall
ufw enable

# Allow necessary ports
ufw allow ssh
ufw allow 'Nginx Full'
ufw allow 5432  # PostgreSQL (if needed for external access)

# Check status
ufw status
```

## Step 9: Monitoring and Maintenance

### 9.1 Monitor Application
```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs storymagic

# Monitor system resources
pm2 monit
```

### 9.2 Application Updates
```bash
# Update application
cd /var/www/storymagic-app
git pull origin main
npm install
npm run build
pm2 restart storymagic
```

## Step 10: Backup Strategy

### 10.1 Database Backup
```bash
# Create backup script
nano /root/backup-db.sh

# Add this content:
#!/bin/bash
BACKUP_DIR="/root/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

pg_dump -U storymagic -h localhost storymagic > $BACKUP_DIR/storymagic_$DATE.sql

# Keep only last 7 days of backups
find $BACKUP_DIR -name "storymagic_*.sql" -mtime +7 -delete

# Make executable
chmod +x /root/backup-db.sh

# Add to crontab for daily backups
crontab -e
# Add: 0 2 * * * /root/backup-db.sh
```

## Troubleshooting

### Common Issues:

**Application won't start:**
```bash
# Check PM2 logs
pm2 logs storymagic

# Check if port is in use
netstat -tulpn | grep :5000
```

**Database connection issues:**
```bash
# Test database connection
psql -U storymagic -h localhost -d storymagic

# Check PostgreSQL status
systemctl status postgresql
```

**Nginx errors:**
```bash
# Check Nginx logs
tail -f /var/log/nginx/error.log

# Test configuration
nginx -t
```

## Performance Optimization

### 10.1 Node.js Optimization
```bash
# In your .env file, add:
NODE_OPTIONS="--max-old-space-size=1024"
```

### 10.2 Nginx Caching
```bash
# Add to Nginx config:
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

Your StoryMagic app will be accessible at `http://YOUR_VPS_IP` or your domain name!

## Cost Estimation
- Hostinger VPS: $3.99-$77.99/month depending on plan
- Domain name: ~$10-15/year
- SSL certificate: Free with Let's Encrypt