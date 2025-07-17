# Docker Deployment Quick Start

## Prerequisites
- Docker Engine 20.10+
- Docker Compose 2.0+

## Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/KuyaPads/KuyaPads.git
   cd KuyaPads
   ```

2. **Configure environment variables**
   ```bash
   # Copy environment files
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   
   # Edit the .env files with your configuration
   nano backend/.env
   nano frontend/.env
   ```

3. **Build and start all services**
   ```bash
   docker-compose up --build -d
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - MongoDB: localhost:27017
   - Redis: localhost:6379

## Services

### MongoDB
- **Image**: mongo:6.0
- **Port**: 27017
- **Volume**: mongodb_data
- **Credentials**: admin/password123

### Redis
- **Image**: redis:7-alpine
- **Port**: 6379
- **Volume**: redis_data
- **Persistence**: Enabled with AOF

### Backend API
- **Build**: From ./backend/Dockerfile
- **Port**: 5000
- **Environment**: Production
- **Dependencies**: MongoDB, Redis

### Frontend
- **Build**: From ./frontend/Dockerfile
- **Port**: 3000 (mapped to 80 in container)
- **Server**: Nginx
- **Dependencies**: Backend API

### Nginx Reverse Proxy (Optional)
- **Image**: nginx:alpine
- **Ports**: 80, 443
- **Purpose**: Load balancing, SSL termination

## Development Mode

For development with hot reloading:

```bash
# Start only database services
docker-compose up -d mongodb redis

# Run backend in development mode
cd backend
npm run dev

# Run frontend in development mode
cd frontend
npm start
```

## Production Deployment

1. **Update environment variables**
   ```bash
   # Set production values
   NODE_ENV=production
   MONGODB_URI=mongodb://admin:password123@mongodb:27017/kuyapads?authSource=admin
   JWT_SECRET=your-super-secure-production-secret
   FRONTEND_URL=https://your-domain.com
   ```

2. **Build and deploy**
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
   ```

3. **Set up SSL (if using nginx)**
   ```bash
   # Using Let's Encrypt
   docker run --rm -it \
     -v ./nginx/ssl:/etc/letsencrypt \
     -p 80:80 \
     certbot/certbot certonly --standalone -d your-domain.com
   ```

## Monitoring

### Health Checks
```bash
# Check all services
docker-compose ps

# Check specific service logs
docker-compose logs backend
docker-compose logs frontend

# Health check endpoints
curl http://localhost:5000/api/health
curl http://localhost:3000/health
```

### Database Operations
```bash
# Connect to MongoDB
docker exec -it kuyapads-mongodb mongo -u admin -p password123

# Backup database
docker exec kuyapads-mongodb mongodump --uri="mongodb://admin:password123@localhost:27017/kuyapads?authSource=admin" --out=/backup

# Restore database
docker exec -i kuyapads-mongodb mongorestore --uri="mongodb://admin:password123@localhost:27017/kuyapads?authSource=admin" /backup/kuyapads
```

## Scaling

### Horizontal Scaling
```bash
# Scale backend API
docker-compose up -d --scale backend=3

# Scale with load balancer
docker-compose -f docker-compose.yml -f docker-compose.scale.yml up -d
```

### Resource Limits
```yaml
# Add to docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

## Troubleshooting

### Common Issues

1. **Port conflicts**
   ```bash
   # Check port usage
   netstat -tulpn | grep :5000
   
   # Change ports in docker-compose.yml
   ports:
     - "5001:5000"  # Use different host port
   ```

2. **Database connection issues**
   ```bash
   # Check MongoDB logs
   docker-compose logs mongodb
   
   # Test connection
   docker exec -it kuyapads-backend npm run db:test
   ```

3. **Memory issues**
   ```bash
   # Check resource usage
   docker stats
   
   # Increase memory limits
   # Edit docker-compose.yml
   ```

### Cleanup
```bash
# Stop all services
docker-compose down

# Remove volumes (WARNING: This deletes all data)
docker-compose down -v

# Remove images
docker-compose down --rmi all

# Complete cleanup
docker system prune -a --volumes
```

## Security Notes

1. **Change default passwords**
   - MongoDB admin password
   - JWT secret key
   - Redis password (if enabled)

2. **Use environment variables**
   - Never commit secrets to version control
   - Use Docker secrets for sensitive data
   - Set up proper firewall rules

3. **Enable SSL**
   - Use Let's Encrypt for free SSL certificates
   - Configure proper SSL settings in nginx
   - Redirect HTTP to HTTPS

4. **Regular updates**
   - Keep Docker images updated
   - Update application dependencies
   - Monitor security advisories

## Support

For issues and support:
- GitHub Issues: https://github.com/KuyaPads/KuyaPads/issues
- Documentation: https://docs.kuyapads.com
- Community: https://discord.gg/kuyapads