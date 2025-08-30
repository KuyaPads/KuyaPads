# KuyaPads Platform

A comprehensive Django-based gaming platform with PostgreSQL backend, designed for gamers to organize sessions, participate in tournaments, and manage their gaming experience.

## 🎮 Features

- **User Management**: Extended user profiles with gaming preferences
- **Game Library**: Comprehensive game database with metadata
- **Gaming Sessions**: Create and join gaming sessions with other players  
- **Tournaments**: Organize and participate in gaming tournaments
- **Game Pad Configurations**: Save and share controller configurations
- **Achievements System**: Track gaming achievements and progress
- **REST API**: Full-featured API with authentication and documentation
- **Admin Interface**: Django admin for easy management

## 🏗️ Architecture

- **Backend**: Django 4.2.7 with Django REST Framework
- **Database**: PostgreSQL with optimized queries
- **Cache**: Redis for session management and caching
- **Authentication**: JWT tokens with OAuth2 support
- **API Documentation**: Swagger/OpenAPI with drf-yasg
- **File Storage**: Support for image uploads (avatars, game covers, etc.)
- **Containerization**: Docker and docker-compose for easy deployment

## 📋 Requirements

- Python 3.12+
- PostgreSQL 13+
- Redis 6+
- Docker & Docker Compose (for containerized deployment)

## 🚀 Quick Start

### Option 1: Docker Deployment (Recommended)

1. **Clone the repository**:
   ```bash
   git clone https://github.com/KuyaPads/KuyaPads.git
   cd KuyaPads
   ```

2. **Start the services**:
   ```bash
   # For development
   docker-compose up -d

   # For production
   docker-compose --profile production up -d
   ```

3. **Initialize the database**:
   ```bash
   # Run migrations
   docker-compose exec web python manage.py migrate

   # Load sample data (optional)
   docker-compose exec web python manage.py load_sample_data
   ```

4. **Access the platform**:
   - API: http://localhost:8000/api/
   - Admin: http://localhost:8000/admin/
   - API Docs: http://localhost:8000/api/docs/

### Option 2: Manual Installation

1. **Set up the environment**:
   ```bash
   # Install PostgreSQL and Redis
   # Ubuntu/Debian:
   sudo apt-get install postgresql postgresql-contrib redis-server
   
   # Create database
   sudo -u postgres createdb kuyapads_db
   sudo -u postgres createuser kuyapads_user
   sudo -u postgres psql -c "ALTER USER kuyapads_user PASSWORD 'kuyapads123';"
   sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE kuyapads_db TO kuyapads_user;"
   ```

2. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment**:
   ```bash
   # Copy environment file
   cp .env.example .env
   
   # Edit .env with your settings
   nano .env
   ```

4. **Run migrations and setup**:
   ```bash
   python manage.py migrate
   python manage.py collectstatic
   python manage.py load_sample_data
   ```

5. **Start the development server**:
   ```bash
   python manage.py runserver
   ```

## 🔧 Configuration

### Environment Variables

Key environment variables in `.env`:

```bash
# Django Settings
DEBUG=True
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1,your-domain.com

# Database (PostgreSQL)
DB_NAME=kuyapads_db
DB_USER=kuyapads_user
DB_PASSWORD=your-secure-password
DB_HOST=localhost
DB_PORT=5432

# Redis
REDIS_URL=redis://localhost:6379/0

# Security (Production)
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
```

### Production Deployment

1. **Server Requirements**:
   - Ubuntu 20.04+ or similar Linux distribution
   - 2+ GB RAM
   - 20+ GB storage
   - Domain name with SSL certificate

2. **Using Docker (Production)**:
   ```bash
   # Clone and setup
   git clone https://github.com/KuyaPads/KuyaPads.git
   cd KuyaPads
   
   # Configure production environment
   cp .env.example .env
   # Edit .env for production settings
   
   # Start production services
   docker-compose --profile production up -d
   
   # Initialize database
   docker-compose exec web-prod python manage.py migrate
   docker-compose exec web-prod python manage.py collectstatic --noinput
   docker-compose exec web-prod python manage.py load_sample_data
   ```

3. **Manual Production Setup**:
   ```bash
   # Install system dependencies
   sudo apt-get update
   sudo apt-get install python3.12 python3-pip postgresql redis-server nginx
   
   # Setup database
   sudo -u postgres createdb kuyapads_db
   sudo -u postgres createuser kuyapads_user
   
   # Install Python dependencies
   pip3 install -r requirements.txt
   
   # Setup gunicorn service
   sudo cp deployment/kuyapads.service /etc/systemd/system/
   sudo systemctl enable kuyapads
   sudo systemctl start kuyapads
   
   # Configure nginx
   sudo cp nginx.conf /etc/nginx/sites-available/kuyapads
   sudo ln -s /etc/nginx/sites-available/kuyapads /etc/nginx/sites-enabled/
   sudo systemctl restart nginx
   ```

## 📚 API Documentation

The platform provides a comprehensive REST API:

### Authentication
- `POST /api/auth/login/` - Login and get JWT tokens
- `POST /api/auth/refresh/` - Refresh JWT token

### Users
- `GET /api/users/` - List users
- `GET /api/users/profile/` - Get current user profile
- `PATCH /api/users/update_profile/` - Update user profile
- `GET /api/users/dashboard/` - Get user dashboard data

### Games
- `GET /api/games/` - List games
- `GET /api/games/{id}/` - Get game details

### Gaming Sessions
- `GET /api/sessions/` - List sessions
- `POST /api/sessions/` - Create session
- `POST /api/sessions/{id}/join/` - Join session
- `POST /api/sessions/{id}/leave/` - Leave session

### Tournaments
- `GET /api/tournaments/` - List tournaments
- `POST /api/tournaments/` - Create tournament
- `POST /api/tournaments/{id}/register/` - Register for tournament

### Complete API documentation available at `/api/docs/`

## 🧪 Testing

```bash
# Run tests
python manage.py test

# Run with coverage
coverage run --source='.' manage.py test
coverage report
coverage html
```

## 🔍 Monitoring & Logs

- **Application logs**: `logs/django.log`
- **Database**: PostgreSQL logs
- **Cache**: Redis monitoring
- **Web server**: Nginx access/error logs

## 🛠️ Development

### Adding New Features

1. Create new Django app:
   ```bash
   python manage.py startapp new_feature
   ```

2. Add to `INSTALLED_APPS` in settings.py

3. Create models, views, serializers

4. Add URL patterns

5. Create and run migrations:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

### Database Backup & Restore

```bash
# Backup
pg_dump -h localhost -U kuyapads_user kuyapads_db > backup.sql

# Restore
psql -h localhost -U kuyapads_user kuyapads_db < backup.sql
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes and add tests
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the API documentation at `/api/docs/`
- Review the logs for error details

## 🔄 Updates & Migration

To update the platform:

```bash
# Pull latest changes
git pull origin main

# Update dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Collect static files
python manage.py collectstatic --noinput

# Restart services
sudo systemctl restart kuyapads
```

---

**KuyaPads Platform** - Built with ❤️ for the gaming community