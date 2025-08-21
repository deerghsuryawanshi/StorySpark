# AWS Deployment Checklist for StoryMagic

## Pre-Deployment Requirements ✅

### 1. AWS Account Setup
- [ ] Valid AWS account with billing enabled
- [ ] AWS CLI installed (optional but recommended)
- [ ] Basic understanding of EC2, RDS, and security groups

### 2. External Requirements
- [ ] Valid OpenAI API key from https://platform.openai.com
- [ ] GitHub repository with your code
- [ ] Domain name (optional but recommended)

### 3. Cost Planning
- [ ] Understand AWS pricing model
- [ ] Set up billing alerts
- [ ] Choose appropriate instance sizes for your budget

## AWS Services We'll Use

### Core Infrastructure
- **RDS PostgreSQL** - Managed database service
- **EC2** - Virtual server for application hosting
- **Security Groups** - Firewall rules
- **VPC** - Virtual private cloud (default)

### Optional Enhancements
- **Application Load Balancer** - High availability and SSL termination
- **CloudFront** - Global CDN for faster content delivery
- **Route 53** - DNS management
- **Certificate Manager** - Free SSL certificates
- **Auto Scaling** - Automatic scaling based on demand

## Step-by-Step Deployment Order

### Phase 1: Database Setup (15 minutes)
1. Create RDS PostgreSQL instance
2. Configure security groups for database
3. Test database connectivity

### Phase 2: Web Server Setup (30 minutes)
1. Launch EC2 instance
2. Configure security groups for web server
3. Install Node.js, Nginx, PM2
4. Clone and setup application

### Phase 3: Application Configuration (20 minutes)
1. Set environment variables
2. Initialize database schema
3. Start application with PM2
4. Configure Nginx reverse proxy

### Phase 4: Load Balancer & SSL (30 minutes)
1. Create Application Load Balancer
2. Request SSL certificate
3. Configure HTTPS listeners
4. Update security groups

### Phase 5: CDN & Domain (20 minutes)
1. Set up CloudFront distribution
2. Configure Route 53 (if using custom domain)
3. Update DNS records

### Phase 6: Monitoring & Backups (15 minutes)
1. Configure CloudWatch monitoring
2. Set up automated RDS backups
3. Create application backup scripts
4. Set up CloudWatch alarms

## Estimated Costs

### Free Tier (First 12 months)
- EC2 t2.micro: $0/month
- RDS db.t3.micro: $0/month
- 750 hours each per month

### After Free Tier / Production
- EC2 t3.small: ~$15/month
- RDS db.t3.small: ~$25/month
- Application Load Balancer: ~$16/month
- CloudFront: ~$1-10/month
- Route 53: ~$0.50/month per domain

**Total**: ~$0.50/month (free tier) or ~$60-80/month (production)

## Security Considerations

### Database Security
- Private subnets for RDS
- Security groups allowing only EC2 access
- Encrypted storage and backups
- Strong passwords

### Web Server Security
- SSH key-based authentication
- Firewall rules (security groups)
- Regular security updates
- HTTPS-only access

### Application Security
- Environment variables for secrets
- Input validation and sanitization
- Rate limiting
- Content Security Policy headers

## Backup Strategy

### Automated Backups
- RDS automated backups (7-35 days retention)
- Daily application file backups
- CloudWatch log retention

### Manual Backups
- Database snapshots before major changes
- Application deployment backups
- Configuration file backups

## Monitoring Setup

### CloudWatch Metrics
- CPU utilization
- Memory usage
- Database connections
- Application response times

### Alerts
- High CPU/memory usage
- Database connection failures
- Application errors
- SSL certificate expiration

## Post-Deployment Testing

### Functionality Tests
- [ ] Story generation works
- [ ] Database saves stories correctly
- [ ] Text-to-speech audio works
- [ ] Mobile responsiveness
- [ ] English and Hindi language support

### Performance Tests
- [ ] Page load times under 3 seconds
- [ ] Story generation under 30 seconds
- [ ] Audio playback works smoothly
- [ ] Multiple concurrent users

### Security Tests
- [ ] HTTPS redirects work
- [ ] Database not accessible from internet
- [ ] SSH access restricted to your IP
- [ ] Environment variables secure

## Troubleshooting Common Issues

### Database Connection Issues
- Check security group rules
- Verify connection string format
- Test with psql command

### Application Won't Start
- Check PM2 logs: `pm2 logs`
- Verify environment variables
- Check port availability

### Load Balancer Issues
- Check target group health
- Verify security group rules
- Check application health endpoint

### SSL Certificate Issues
- Verify domain ownership
- Check DNS validation records
- Wait for certificate issuance

Ready to start? Follow the complete guide in `deploy-to-aws.md`!