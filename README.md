# KuyaPads Network Platform

A modern social networking platform connecting Filipino communities worldwide.

![KuyaPads Login](https://github.com/user-attachments/assets/73a35e45-3d45-4f76-8fb9-4ba940cd119e)

## 🌟 Features

- **User Authentication**: Secure login/register with JWT tokens
- **User Profiles**: Customizable profiles with bio, location, and privacy settings
- **Social Feed**: Share posts with text, images, and videos
- **Real-time Chat**: Private messaging and group conversations
- **Groups**: Create and join communities with different privacy levels
- **Friend System**: Send and manage friend requests
- **Notifications**: Real-time updates for interactions
- **Mobile Responsive**: Works seamlessly on all devices
- **Modern UI**: Clean, intuitive design with Tailwind CSS

![KuyaPads Register](https://github.com/user-attachments/assets/523e78bb-dd26-41b1-a250-d6fc4bbe152c)

## 🚀 Tech Stack

### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Socket.io** for real-time communication
- **Bcrypt** for password hashing
- **Joi** for input validation
- **Multer** for file uploads
- **Helmet** for security headers

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **React Hook Form** for form handling
- **Axios** for API calls
- **Socket.io Client** for real-time features
- **React Hot Toast** for notifications

### Database Schema
- **Users**: Profiles, friends, settings, authentication
- **Posts**: Content, likes, comments, sharing
- **Groups**: Communities, members, permissions
- **Messages**: Private and group conversations
- **Notifications**: Real-time updates

## 📋 Prerequisites

- **Node.js** 18.0 or higher
- **MongoDB** 4.4 or higher
- **npm** or **yarn**
- **Git**

## 🛠️ Installation

### Option 1: Manual Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/KuyaPads/KuyaPads.git
   cd KuyaPads
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   cp .env.example .env
   # Edit .env with your API URL
   ```

4. **Set up environment variables**
   
   **Backend (.env):**
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/kuyapads
   JWT_SECRET=your-super-secret-jwt-key
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   ```

   **Frontend (.env):**
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

5. **Start the development servers**
   ```bash
   # Start backend (in backend directory)
   npm run dev
   
   # Start frontend (in frontend directory)
   npm start
   ```

### Option 2: Docker Setup

1. **Clone and configure**
   ```bash
   git clone https://github.com/KuyaPads/KuyaPads.git
   cd KuyaPads
   ```

2. **Start with Docker Compose**
   ```bash
   docker-compose up --build -d
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - MongoDB: localhost:27017

## 🎯 Usage

### User Registration
1. Visit the registration page
2. Fill in your details (name, username, email, password)
3. Complete account verification
4. Start connecting with the community!

### Creating Posts
1. Navigate to the home feed
2. Click "Create Post"
3. Add text, images, or videos
4. Set privacy level (public, friends, private)
5. Add tags and location (optional)
6. Share with the community

### Joining Groups
1. Go to the Groups page
2. Browse available communities
3. Click "Join" on groups that interest you
4. Participate in discussions and activities

### Real-time Chat
1. Navigate to the Chat section
2. Start conversations with friends
3. Send messages, images, and files
4. Create group chats
5. Use reactions and replies

## 🔧 API Documentation

The KuyaPads API follows RESTful conventions and includes:

- **Authentication**: `/api/auth/*`
- **Users**: `/api/users/*`
- **Posts**: `/api/posts/*`
- **Groups**: `/api/groups/*`
- **Chat**: `/api/chat/*`

### Example API Calls

```javascript
// Register a new user
POST /api/auth/register
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "firstName": "John",
  "lastName": "Doe"
}

// Create a post
POST /api/posts
{
  "content": {
    "text": "Hello, KuyaPads community!"
  },
  "privacy": "public",
  "tags": ["introduction", "hello"]
}

// Send a message
POST /api/chat
{
  "recipient": "user_id",
  "content": {
    "text": "Hello! How are you?"
  },
  "type": "text"
}
```

For complete API documentation, see [API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md).

## 🏗️ Project Structure

```
KuyaPads/
├── backend/                 # Node.js/Express API server
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── utils/             # Utility functions
│   └── server.js          # Main server file
├── frontend/               # React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts
│   │   ├── hooks/         # Custom hooks
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── types/         # TypeScript types
│   └── public/            # Static assets
├── docs/                   # Documentation
├── docker-compose.yml      # Docker configuration
└── README.md
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

### Integration Tests
```bash
npm run test:integration
```

## 🚀 Deployment

### Production Build
```bash
# Build frontend
cd frontend
npm run build

# Start backend in production
cd ../backend
NODE_ENV=production npm start
```

### Docker Deployment
```bash
# Production deployment
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Cloud Deployment
For detailed deployment instructions for various cloud providers, see [DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md).

## 🤝 Contributing

We welcome contributions from the community! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Add tests** for new features
5. **Commit your changes**
   ```bash
   git commit -m "Add amazing feature"
   ```
6. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

Please read [CONTRIBUTING.md](docs/CONTRIBUTING.md) for detailed guidelines.

## 📋 Development Guidelines

### Code Style
- Follow ESLint configuration
- Use TypeScript for type safety
- Write meaningful commit messages
- Add comments for complex logic

### Best Practices
- Keep components small and focused
- Use proper error handling
- Implement responsive design
- Follow accessibility guidelines
- Write comprehensive tests

## 🔒 Security

### Security Features
- JWT token authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting on API endpoints
- CORS configuration
- Security headers with Helmet

### Reporting Security Issues
Please report security vulnerabilities to: security@kuyapads.com

## 🌐 Internationalization

KuyaPads supports multiple languages:
- English (default)
- Filipino/Tagalog
- Cebuano
- Ilocano
- And more coming soon!

## 📱 Mobile Support

The platform is fully responsive and works on:
- iOS Safari
- Android Chrome
- Mobile browsers
- Progressive Web App (PWA) support

## 🎨 Design System

### Colors
- Primary: Blue (#0ea5e9)
- Secondary: Pink (#ec4899)
- Accent: Green (#10b981)
- Background: Gray (#f8fafc)

### Typography
- Headings: Inter font family
- Body: System font stack
- Code: Mono font family

## 📊 Analytics & Monitoring

### Performance Monitoring
- Core Web Vitals tracking
- API response time monitoring
- Database query optimization
- Real-time error tracking

### User Analytics
- User engagement metrics
- Feature usage statistics
- Geographic distribution
- Device and browser analytics

## 🔧 Configuration

### Environment Variables
See `.env.example` files for all configuration options.

### Feature Flags
Toggle features using environment variables:
```env
ENABLE_GROUPS=true
ENABLE_CHAT=true
ENABLE_NOTIFICATIONS=true
```

## 📈 Roadmap

### Version 1.1
- [ ] Video calling
- [ ] Story features
- [ ] Advanced search
- [ ] Content moderation tools

### Version 1.2
- [ ] Mobile applications
- [ ] API webhooks
- [ ] Third-party integrations
- [ ] Analytics dashboard

### Version 2.0
- [ ] AI-powered recommendations
- [ ] Blockchain integration
- [ ] Marketplace features
- [ ] Advanced privacy controls

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Filipino developer community
- Open source contributors
- Beta testers and early adopters
- Design inspiration from modern social platforms

## 📞 Support

### Community Support
- **GitHub Issues**: [Report bugs and request features](https://github.com/KuyaPads/KuyaPads/issues)
- **Discussions**: [Community Q&A](https://github.com/KuyaPads/KuyaPads/discussions)
- **Discord**: [Real-time community chat](https://discord.gg/kuyapads)

### Professional Support
- **Email**: support@kuyapads.com
- **Documentation**: [docs.kuyapads.com](https://docs.kuyapads.com)
- **Status Page**: [status.kuyapads.com](https://status.kuyapads.com)

### Resources
- [Technical Documentation](docs/TECHNICAL_DOCUMENTATION.md)
- [API Documentation](docs/API_DOCUMENTATION.md)
- [Deployment Guide](docs/DEPLOYMENT_GUIDE.md)
- [Contributing Guide](docs/CONTRIBUTING.md)
- [Docker Deployment](docs/DOCKER_DEPLOYMENT.md)

---

**KuyaPads** - *Connecting Filipino communities worldwide* 🇵🇭

Made with ❤️ by the Filipino developer community