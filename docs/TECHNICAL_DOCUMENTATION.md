# KuyaPads Network Platform - Technical Documentation

## Overview
KuyaPads is a modern social networking platform designed to connect Filipino communities worldwide. Built with Node.js, Express, MongoDB, React, and TypeScript.

## Architecture

### Backend Architecture
- **Framework**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.io for live chat and notifications
- **Security**: Helmet, CORS, Rate limiting, Input validation
- **File Upload**: Multer for handling media files

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom theme
- **State Management**: React Context API
- **Routing**: React Router DOM
- **Forms**: React Hook Form with validation
- **HTTP Client**: Axios with interceptors
- **Notifications**: React Hot Toast

## Database Schema

### User Model
```javascript
{
  username: String (unique, 3-30 chars)
  email: String (unique, validated)
  password: String (hashed with bcrypt)
  firstName: String
  lastName: String
  avatar: String (URL)
  bio: String (max 500 chars)
  location: { city, country, coordinates }
  friends: [ObjectId] (references User)
  friendRequests: [{ from: ObjectId, status, createdAt }]
  groups: [ObjectId] (references Group)
  settings: { privacy, notifications }
  isVerified: Boolean
  isOnline: Boolean
  lastSeen: Date
}
```

### Post Model
```javascript
{
  author: ObjectId (references User)
  content: { text, images, videos }
  type: 'text' | 'image' | 'video' | 'link' | 'poll'
  privacy: 'public' | 'friends' | 'private'
  likes: [{ user: ObjectId, createdAt }]
  comments: [{ author, content, likes, replies }]
  shares: [{ user, comment, createdAt }]
  tags: [String]
  location: { name, coordinates }
  group: ObjectId (references Group)
  isEdited: Boolean
  editHistory: [{ content, editedAt }]
}
```

### Group Model
```javascript
{
  name: String
  description: String
  creator: ObjectId (references User)
  members: [{ user: ObjectId, role, joinedAt }]
  privacy: 'public' | 'private' | 'secret'
  category: String
  rules: [{ title, description }]
  settings: { allowMemberInvites, requireApproval }
  stats: { totalPosts, totalMembers }
}
```

### Message Model
```javascript
{
  sender: ObjectId (references User)
  recipient: ObjectId (references User) // for direct messages
  group: ObjectId (references Group)    // for group messages
  content: { text, images, files }
  type: 'text' | 'image' | 'file' | 'sticker' | 'gif'
  isRead: Boolean
  reactions: [{ user, emoji, createdAt }]
  replyTo: ObjectId (references Message)
}
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/search/:query` - Search users
- `POST /api/users/friend-request/:userId` - Send friend request
- `POST /api/users/friend-request/:requestId/:action` - Accept/reject friend request

### Posts
- `POST /api/posts` - Create new post
- `GET /api/posts/feed` - Get user's feed
- `GET /api/posts/:id` - Get specific post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/like` - Like/unlike post
- `POST /api/posts/:id/comments` - Add comment

### Groups
- `POST /api/groups` - Create new group
- `GET /api/groups` - Get all groups
- `GET /api/groups/:id` - Get specific group
- `POST /api/groups/:id/join` - Join group
- `POST /api/groups/:id/leave` - Leave group
- `GET /api/groups/:id/posts` - Get group posts

### Chat
- `POST /api/chat` - Send message
- `GET /api/chat/conversation/:userId` - Get conversation
- `GET /api/chat/conversations` - Get all conversations
- `PUT /api/chat/:messageId` - Update message
- `DELETE /api/chat/:messageId` - Delete message

## Security Features

### Authentication & Authorization
- JWT tokens with expiration
- Password hashing with bcrypt
- Protected routes with middleware
- Role-based access control for groups

### Input Validation
- Joi schema validation for all inputs
- Rate limiting on API endpoints
- CORS configuration
- Helmet for security headers

### Privacy Controls
- User privacy settings (public/friends/private)
- Group privacy levels
- Content visibility controls
- Friend request permissions

## Real-time Features

### Socket.io Events
- `connection` - User connects
- `join` - Join user room
- `private_message` - Send private message
- `group_message` - Send group message
- `status_update` - Update user status
- `typing` - Typing indicators
- `notification` - Real-time notifications

## Frontend Features

### Authentication
- Login/Register forms with validation
- Password visibility toggle
- Remember me functionality
- Automatic token refresh

### User Interface
- Responsive design with Tailwind CSS
- Dark/light theme support
- Mobile-first approach
- Accessibility features

### State Management
- React Context for global state
- Local state for component data
- Optimistic updates
- Error handling

## Development Setup

### Prerequisites
```bash
Node.js 18+
MongoDB 4.4+
Git
```

### Installation
```bash
# Clone repository
git clone https://github.com/KuyaPads/KuyaPads.git
cd KuyaPads

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Environment Variables
Create `.env` files in both backend and frontend directories:

**Backend (.env)**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/kuyapads
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

**Frontend (.env)**
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Running the Application
```bash
# Start backend (in backend directory)
npm run dev

# Start frontend (in frontend directory)
npm start
```

## Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

## Deployment

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
```dockerfile
# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

### Environment Variables for Production
- Use strong JWT secrets
- Configure proper CORS origins
- Set up MongoDB Atlas or managed database
- Configure file upload storage (AWS S3, Cloudinary)
- Set up email service for notifications

## Performance Optimizations

### Backend
- Database indexing for frequently queried fields
- Pagination for large datasets
- Caching with Redis
- File compression with gzip
- Rate limiting to prevent abuse

### Frontend
- Code splitting with React.lazy
- Image optimization and lazy loading
- Service worker for offline functionality
- Bundle size optimization
- Memory leak prevention

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## License

MIT License - see LICENSE file for details.