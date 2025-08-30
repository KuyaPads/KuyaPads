# KuyaPads - Collaborative Document Platform

KuyaPads is a real-time collaborative document editing platform built with Node.js, React, and PostgreSQL. It allows teams to create, edit, and share documents collaboratively with real-time synchronization.

## ✨ Features

### Core Features
- **Real-time Collaboration**: Multiple users can edit documents simultaneously with live updates
- **Rich Text Editor**: Full-featured text editor with formatting options
- **User Authentication**: Secure user registration and login system
- **Document Management**: Create, update, delete, and organize documents
- **Access Control**: Public and private documents with collaboration permissions
- **Version History**: Track changes and document versions
- **Responsive Design**: Works on desktop, tablet, and mobile devices

### Technical Features
- **WebSocket Support**: Real-time communication using Socket.IO
- **PostgreSQL Database**: Robust and scalable database with full ACID compliance
- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: API protection against abuse
- **Docker Support**: Easy deployment with Docker containers
- **RESTful API**: Well-structured API endpoints
- **Error Handling**: Comprehensive error handling and logging

## 🛠 Technology Stack

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web application framework
- **Socket.IO**: Real-time bidirectional event-based communication
- **PostgreSQL**: Primary database
- **Knex.js**: SQL query builder and database migrations
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT token generation and verification
- **Joi**: Data validation

### Frontend
- **React 18**: Frontend library with hooks
- **Vite**: Build tool and development server
- **React Router**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **React Quill**: Rich text editor
- **Axios**: HTTP client
- **Socket.IO Client**: Real-time updates

### DevOps
- **Docker**: Containerization
- **Docker Compose**: Multi-container orchestration
- **Nginx**: Reverse proxy and static file serving

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+
- **PostgreSQL** 12+
- **Docker** and **Docker Compose** (recommended)

### Option 1: Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/KuyaPads/KuyaPads.git
   cd KuyaPads
   ```

2. **Start with Docker Compose**
   ```bash
   # For development with hot reload
   docker-compose -f docker-compose.dev.yml up

   # For production
   docker-compose up -d
   ```

3. **Run database setup**
   ```bash
   # Wait for services to start, then run migrations
   sleep 30
   docker-compose exec backend npm run migrate
   docker-compose exec backend npm run seed
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Health Check: http://localhost:5000/health

### Option 2: Local Development

1. **Set up PostgreSQL database**
   ```bash
   # Create database and user
   createdb kuyapads_db
   psql kuyapads_db -c "CREATE USER kuyapads_user WITH ENCRYPTED PASSWORD 'your_password';"
   psql kuyapads_db -c "GRANT ALL PRIVILEGES ON DATABASE kuyapads_db TO kuyapads_user;"
   ```

2. **Backend setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your database credentials
   npm run migrate
   npm run seed
   npm run dev
   ```

3. **Frontend setup** (in a new terminal)
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 🧪 Testing the Platform

### Default Test Users
After running the seed command, you can login with:

1. **Admin User**
   - Email: `admin@kuyapads.com`
   - Password: `password123`

2. **Test Users**
   - Email: `john@example.com` / Password: `password123`
   - Email: `jane@example.com` / Password: `password123`

### Test Real-time Collaboration
1. Open two browser windows
2. Login with different users
3. Create a new pad
4. Share it with the other user
5. Edit simultaneously to see real-time updates

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info

### Pad Endpoints
- `POST /api/pads` - Create a new pad
- `GET /api/pads` - Get user's pads
- `GET /api/pads/:id` - Get pad by ID
- `PUT /api/pads/:id` - Update pad
- `DELETE /api/pads/:id` - Delete pad
- `POST /api/pads/:id/collaborators` - Add collaborator

### Health Check
- `GET /health` - Service health status

## 🗄 Database Schema

The platform uses PostgreSQL with the following main tables:

- **users**: User accounts and profiles
- **pads**: Document storage and metadata
- **pad_collaborators**: User permissions for pads
- **pad_versions**: Document version history

## 🐳 Deployment

### Production Deployment Steps

1. **Server Setup**
   ```bash
   # Install Docker and Docker Compose on your server
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo curl -L "https://github.com/docker/compose/releases/download/v2.21.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

2. **Deploy Application**
   ```bash
   # Clone and configure
   git clone https://github.com/KuyaPads/KuyaPads.git
   cd KuyaPads

   # Set production environment variables
   export JWT_SECRET="$(openssl rand -base64 32)"
   export DB_PASSWORD="$(openssl rand -base64 16)"

   # Start services
   docker-compose up -d

   # Run database setup
   sleep 30
   docker-compose exec backend npm run migrate
   docker-compose exec backend npm run seed
   ```

3. **Verify Deployment**
   ```bash
   # Check service status
   docker-compose ps

   # Test API health
   curl http://localhost:5000/health

   # View logs if needed
   docker-compose logs backend
   docker-compose logs frontend
   ```

### Environment Configuration

#### Backend (.env)
```env
NODE_ENV=production
PORT=5000
DB_HOST=postgres
DB_PORT=5432
DB_NAME=kuyapads_db
DB_USER=kuyapads_user
DB_PASSWORD=your_secure_password
JWT_SECRET=your_super_secure_jwt_secret
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
```

## 🔧 Development

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Test specific endpoints
npm test -- --grep "auth"
```

### Database Operations
```bash
# Create new migration
cd backend
npx knex migrate:make migration_name

# Run migrations
npm run migrate

# Create seed file
npx knex seed:make seed_name

# Run seeds
npm run seed
```

## 🛡 Security Features

- **Password Hashing**: bcrypt with 12 salt rounds
- **JWT Authentication**: Secure token-based auth with expiration
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: Joi schema validation on all inputs
- **SQL Injection Protection**: Knex.js parameterized queries
- **XSS Protection**: Helmet security headers
- **CORS Configuration**: Controlled cross-origin requests

## 📊 What's Included

### Complete Backend
✅ Express.js server with middleware  
✅ PostgreSQL database with migrations  
✅ JWT authentication system  
✅ Real-time WebSocket support  
✅ RESTful API endpoints  
✅ Input validation and error handling  
✅ Rate limiting and security headers  

### Complete Frontend
✅ React application with modern hooks  
✅ Responsive Tailwind CSS design  
✅ Rich text editor (Quill)  
✅ Real-time collaboration UI  
✅ User authentication flow  
✅ Document management interface  
✅ Toast notifications  

### DevOps & Deployment
✅ Docker containerization  
✅ Docker Compose orchestration  
✅ Production and development configs  
✅ Nginx reverse proxy setup  
✅ Database initialization scripts  

### Testing & Documentation
✅ Backend API tests  
✅ Sample data seeds  
✅ Comprehensive documentation  
✅ Environment configuration examples  
✅ Deployment instructions  

## 🚨 Known Requirements

### Before Deployment Checklist

1. **Environment Variables**
   - [ ] Set strong JWT_SECRET in production
   - [ ] Configure secure database password
   - [ ] Set correct FRONTEND_URL

2. **Database Setup**
   - [ ] PostgreSQL server running
   - [ ] Database and user created
   - [ ] Migrations executed
   - [ ] Seeds run (optional for production)

3. **Security Considerations**
   - [ ] Enable HTTPS in production
   - [ ] Configure firewall rules
   - [ ] Set up SSL certificates
   - [ ] Review rate limiting settings

4. **Monitoring**
   - [ ] Set up log monitoring
   - [ ] Configure health checks
   - [ ] Set up database backups
   - [ ] Monitor resource usage

## 📝 Next Steps for Production

1. **SSL/HTTPS Setup**
   ```bash
   # Use Certbot for Let's Encrypt certificates
   sudo apt-get install certbot
   sudo certbot --nginx
   ```

2. **Reverse Proxy Configuration**
   ```nginx
   # Add to Nginx config
   server {
       server_name yourdomain.com;
       location / {
           proxy_pass http://localhost:3000;
       }
       location /api/ {
           proxy_pass http://localhost:5000/api/;
       }
   }
   ```

3. **Database Backup**
   ```bash
   # Daily backup script
   pg_dump kuyapads_db > backup_$(date +%Y%m%d).sql
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 💬 Support

For support or questions:
- Create an issue in GitHub
- Email: support@kuyapads.com

---

**KuyaPads** - Built with ❤️ for collaborative productivity