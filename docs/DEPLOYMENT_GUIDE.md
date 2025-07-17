# KuyaPads Network Platform - Deployment Guide

## Overview
This guide covers deploying the KuyaPads Network Platform to various cloud providers and environments.

## Prerequisites
- Node.js 18+
- MongoDB database
- Domain name (optional)
- SSL certificate (for HTTPS)

## Database Setup

### MongoDB Atlas (Recommended)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Add database user with readWrite permissions
4. Whitelist your application's IP addresses
5. Get connection string

### Self-hosted MongoDB
```bash
# Install MongoDB on Ubuntu
sudo apt update
sudo apt install -y mongodb-org

# Start MongoDB service
sudo systemctl start mongod
sudo systemctl enable mongod

# Create database and user
mongo
use kuyapads
db.createUser({
  user: "kuyapads_user",
  pwd: "secure_password",
  roles: ["readWrite"]
})
```

## Backend Deployment

### Using PM2 (Recommended for VPS)
```bash
# Install PM2 globally
npm install -g pm2

# Install dependencies
cd backend
npm install --production

# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'kuyapads-backend',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000,
      MONGODB_URI: 'your_mongodb_connection_string',
      JWT_SECRET: 'your_jwt_secret_key',
      FRONTEND_URL: 'https://your-domain.com'
    }
  }]
}
EOF

# Start application
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### Docker Deployment
```dockerfile
# Backend Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS runtime
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
EXPOSE 5000
USER node
CMD ["npm", "start"]
```

```bash
# Build and run Docker container
docker build -t kuyapads-backend .
docker run -d \
  --name kuyapads-backend \
  -p 5000:5000 \
  -e NODE_ENV=production \
  -e MONGODB_URI=your_mongodb_uri \
  -e JWT_SECRET=your_jwt_secret \
  kuyapads-backend
```

## Frontend Deployment

### Build for Production
```bash
cd frontend
npm run build
```

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/kuyapads/build;
    index index.html;

    # Handle client-side routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api {
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

    # Socket.io proxy
    location /socket.io/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;
}
```

### SSL Configuration with Let's Encrypt
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add line: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Cloud Platform Deployments

### Heroku Deployment
```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create applications
heroku create kuyapads-backend
heroku create kuyapads-frontend

# Deploy backend
cd backend
git init
git add .
git commit -m "Initial commit"
heroku git:remote -a kuyapads-backend
git push heroku main

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_jwt_secret
heroku config:set FRONTEND_URL=https://kuyapads-frontend.herokuapp.com

# Deploy frontend
cd ../frontend
# Update API URL in .env
echo "REACT_APP_API_URL=https://kuyapads-backend.herokuapp.com/api" > .env
npm run build
# Deploy using Heroku buildpack for static sites
```

### AWS Deployment
```bash
# Backend on EC2
# 1. Launch EC2 instance with Ubuntu
# 2. Install Node.js and PM2
# 3. Clone repository and setup as above
# 4. Configure security groups for ports 80, 443, 5000

# Frontend on S3 + CloudFront
aws s3 mb s3://kuyapads-frontend
aws s3 sync build/ s3://kuyapads-frontend --delete
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

### Digital Ocean Deployment
```bash
# Create droplet
doctl compute droplet create kuyapads \
  --image ubuntu-20-04-x64 \
  --size s-2vcpu-2gb \
  --region nyc1 \
  --ssh-keys your_ssh_key_id

# Setup similar to VPS deployment above
```

## Environment Configuration

### Production Environment Variables
```bash
# Backend
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/kuyapads
JWT_SECRET=your-super-secure-jwt-secret-key-here
FRONTEND_URL=https://your-domain.com

# Email configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# File upload (AWS S3)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_BUCKET_NAME=kuyapads-uploads
AWS_REGION=us-east-1

# Redis (for session storage)
REDIS_URL=redis://localhost:6379
```

### Frontend Environment Variables
```bash
REACT_APP_API_URL=https://api.your-domain.com/api
REACT_APP_SOCKET_URL=https://api.your-domain.com
REACT_APP_ENVIRONMENT=production
```

## Monitoring and Logging

### PM2 Monitoring
```bash
# Monitor processes
pm2 monit

# View logs
pm2 logs kuyapads-backend

# Restart application
pm2 restart kuyapads-backend
```

### Log Management
```bash
# Install Winston for backend logging
npm install winston winston-daily-rotate-file

# Configure log rotation
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

## Security Considerations

### Backend Security
- Use environment variables for secrets
- Implement rate limiting
- Enable CORS properly
- Use HTTPS in production
- Validate all inputs
- Keep dependencies updated

### Database Security
- Use MongoDB Atlas with IP whitelisting
- Enable authentication
- Use connection encryption
- Regular backups
- Monitor access logs

### Frontend Security
- Implement Content Security Policy
- Use HTTPS everywhere
- Validate user inputs
- Secure API endpoints
- Regular security audits

## Backup Strategy

### Database Backups
```bash
# MongoDB backup
mongodump --uri="mongodb+srv://user:password@cluster.mongodb.net/kuyapads" --out=/backups/$(date +%Y%m%d)

# Automated backup script
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
mongodump --uri="$MONGODB_URI" --out=$BACKUP_DIR/$DATE
tar -czf $BACKUP_DIR/kuyapads_backup_$DATE.tar.gz -C $BACKUP_DIR $DATE
rm -rf $BACKUP_DIR/$DATE
# Keep only last 7 days
find $BACKUP_DIR -name "kuyapads_backup_*.tar.gz" -mtime +7 -delete
```

### File Backups
```bash
# Application files backup
rsync -avz --delete /var/www/kuyapads/ user@backup-server:/backups/kuyapads/
```

## Troubleshooting

### Common Issues
1. **Database Connection**: Check MongoDB URI and network access
2. **CORS Errors**: Verify FRONTEND_URL environment variable
3. **Socket.io Issues**: Check proxy configuration
4. **Build Failures**: Ensure Node.js versions match
5. **Performance Issues**: Monitor memory usage and add caching

### Health Checks
```bash
# Backend health check
curl http://localhost:5000/api/health

# Frontend health check
curl http://localhost:3000

# Database connection check
mongo --eval "db.adminCommand('ping')"
```

## Scaling Considerations

### Horizontal Scaling
- Use load balancers (Nginx, HAProxy)
- Implement session sharing with Redis
- Database sharding for large datasets
- CDN for static assets

### Vertical Scaling
- Monitor resource usage
- Optimize database queries
- Implement caching strategies
- Use compression for responses

## Maintenance

### Regular Tasks
- Update dependencies monthly
- Monitor security vulnerabilities
- Check error logs daily
- Backup verification weekly
- Performance monitoring ongoing

### Update Process
1. Test updates in staging environment
2. Schedule maintenance window
3. Create backup before updates
4. Deploy updates with rollback plan
5. Monitor application post-deployment