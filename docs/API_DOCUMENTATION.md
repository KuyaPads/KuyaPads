# KuyaPads API Documentation

## Base URL
```
Development: http://localhost:5000/api
Production: https://api.kuyapads.com/api
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Response Format
All API responses follow this format:
```json
{
  "success": true,
  "message": "Success message",
  "data": {}, // Response data
  "error": null // Error details if any
}
```

## Error Handling
Error responses include:
```json
{
  "success": false,
  "message": "Error message",
  "error": {
    "code": "ERROR_CODE",
    "details": "Detailed error information"
  }
}
```

## Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

---

# Authentication Endpoints

## Register User
Register a new user account.

**POST** `/auth/register`

### Request Body
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

### Response
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "fullName": "John Doe",
    "avatar": "",
    "bio": "",
    "isVerified": false,
    "isOnline": false,
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
}
```

## Login User
Authenticate a user and get access token.

**POST** `/auth/login`

### Request Body
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

### Response
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "isOnline": true,
    "lastSeen": "2023-01-01T00:00:00.000Z"
  }
}
```

## Get Current User
Get the current authenticated user's information.

**GET** `/auth/me`

### Headers
```
Authorization: Bearer <token>
```

### Response
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "friends": ["507f1f77bcf86cd799439012"],
    "friendRequests": [],
    "settings": {
      "privacy": {
        "profileVisibility": "public",
        "showOnlineStatus": true,
        "allowFriendRequests": true
      },
      "notifications": {
        "email": true,
        "push": true,
        "friendRequests": true,
        "messages": true
      }
    }
  }
}
```

## Logout User
Logout the current user.

**POST** `/auth/logout`

### Headers
```
Authorization: Bearer <token>
```

### Response
```json
{
  "message": "Logout successful"
}
```

---

# User Management Endpoints

## Get User Profile
Get a user's profile information.

**GET** `/users/{userId}`

### Headers
```
Authorization: Bearer <token>
```

### Response
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "firstName": "John",
    "lastName": "Doe",
    "avatar": "https://example.com/avatar.jpg",
    "bio": "Software developer and coffee enthusiast",
    "location": {
      "city": "Manila",
      "country": "Philippines"
    },
    "isVerified": true,
    "isOnline": true,
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
}
```

## Update User Profile
Update the current user's profile information.

**PUT** `/users/profile`

### Headers
```
Authorization: Bearer <token>
```

### Request Body
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "bio": "Updated bio",
  "location": {
    "city": "Cebu",
    "country": "Philippines"
  }
}
```

### Response
```json
{
  "message": "Profile updated successfully",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "bio": "Updated bio",
    "location": {
      "city": "Cebu",
      "country": "Philippines"
    }
  }
}
```

## Search Users
Search for users by username or name.

**GET** `/users/search/{query}`

### Headers
```
Authorization: Bearer <token>
```

### Query Parameters
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 10)

### Response
```json
{
  "users": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "username": "john_doe",
      "firstName": "John",
      "lastName": "Doe",
      "avatar": "https://example.com/avatar.jpg",
      "bio": "Software developer",
      "isVerified": true,
      "isOnline": true
    }
  ],
  "pagination": {
    "page": 1,
    "pages": 5,
    "total": 50
  }
}
```

## Send Friend Request
Send a friend request to another user.

**POST** `/users/friend-request/{userId}`

### Headers
```
Authorization: Bearer <token>
```

### Response
```json
{
  "message": "Friend request sent successfully"
}
```

## Respond to Friend Request
Accept or reject a friend request.

**POST** `/users/friend-request/{requestId}/{action}`

### Headers
```
Authorization: Bearer <token>
```

### URL Parameters
- `requestId`: ID of the friend request
- `action`: "accept" or "reject"

### Response
```json
{
  "message": "Friend request accepted successfully"
}
```

---

# Posts Endpoints

## Create Post
Create a new post.

**POST** `/posts`

### Headers
```
Authorization: Bearer <token>
```

### Request Body
```json
{
  "content": {
    "text": "This is my first post!",
    "images": [
      {
        "url": "https://example.com/image1.jpg",
        "caption": "Beautiful sunset"
      }
    ]
  },
  "type": "text",
  "privacy": "public",
  "tags": ["travel", "sunset"],
  "location": {
    "name": "Boracay, Philippines",
    "coordinates": {
      "lat": 11.9674,
      "lng": 121.9248
    }
  }
}
```

### Response
```json
{
  "message": "Post created successfully",
  "post": {
    "_id": "507f1f77bcf86cd799439011",
    "author": {
      "_id": "507f1f77bcf86cd799439012",
      "username": "john_doe",
      "firstName": "John",
      "lastName": "Doe",
      "avatar": "https://example.com/avatar.jpg"
    },
    "content": {
      "text": "This is my first post!",
      "images": [
        {
          "url": "https://example.com/image1.jpg",
          "caption": "Beautiful sunset"
        }
      ]
    },
    "likes": [],
    "comments": [],
    "likeCount": 0,
    "commentCount": 0,
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
}
```

## Get Feed
Get posts for the user's feed.

**GET** `/posts/feed`

### Headers
```
Authorization: Bearer <token>
```

### Query Parameters
- `page` (optional): Page number (default: 1)
- `limit` (optional): Posts per page (default: 10)

### Response
```json
{
  "posts": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "author": {
        "_id": "507f1f77bcf86cd799439012",
        "username": "john_doe",
        "firstName": "John",
        "lastName": "Doe",
        "avatar": "https://example.com/avatar.jpg"
      },
      "content": {
        "text": "This is my first post!"
      },
      "likes": [],
      "comments": [],
      "likeCount": 0,
      "commentCount": 0,
      "createdAt": "2023-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "hasMore": true
  }
}
```

## Like/Unlike Post
Toggle like on a post.

**POST** `/posts/{postId}/like`

### Headers
```
Authorization: Bearer <token>
```

### Response
```json
{
  "message": "Post liked",
  "isLiked": true,
  "likeCount": 5
}
```

## Add Comment
Add a comment to a post.

**POST** `/posts/{postId}/comments`

### Headers
```
Authorization: Bearer <token>
```

### Request Body
```json
{
  "content": "Great post!",
  "parentComment": null // Optional: ID of parent comment for replies
}
```

### Response
```json
{
  "message": "Comment added successfully",
  "comments": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "author": {
        "_id": "507f1f77bcf86cd799439012",
        "username": "john_doe",
        "firstName": "John",
        "lastName": "Doe",
        "avatar": "https://example.com/avatar.jpg"
      },
      "content": "Great post!",
      "likes": [],
      "replies": [],
      "createdAt": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

---

# Groups Endpoints

## Create Group
Create a new group.

**POST** `/groups`

### Headers
```
Authorization: Bearer <token>
```

### Request Body
```json
{
  "name": "Filipino Developers",
  "description": "A community for Filipino software developers",
  "privacy": "public",
  "category": "technology",
  "tags": ["programming", "philippines", "developers"],
  "rules": [
    {
      "title": "Be respectful",
      "description": "Treat all members with respect and kindness"
    }
  ]
}
```

### Response
```json
{
  "message": "Group created successfully",
  "group": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Filipino Developers",
    "description": "A community for Filipino software developers",
    "creator": {
      "_id": "507f1f77bcf86cd799439012",
      "username": "john_doe",
      "firstName": "John",
      "lastName": "Doe",
      "avatar": "https://example.com/avatar.jpg"
    },
    "privacy": "public",
    "category": "technology",
    "memberCount": 1,
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
}
```

## Get Groups
Get all groups (public groups + user's groups).

**GET** `/groups`

### Headers
```
Authorization: Bearer <token>
```

### Query Parameters
- `page` (optional): Page number (default: 1)
- `limit` (optional): Groups per page (default: 10)
- `category` (optional): Filter by category
- `search` (optional): Search query

### Response
```json
{
  "groups": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Filipino Developers",
      "description": "A community for Filipino software developers",
      "creator": {
        "_id": "507f1f77bcf86cd799439012",
        "username": "john_doe",
        "firstName": "John",
        "lastName": "Doe",
        "avatar": "https://example.com/avatar.jpg"
      },
      "privacy": "public",
      "category": "technology",
      "memberCount": 150,
      "createdAt": "2023-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pages": 5,
    "total": 50,
    "hasMore": true
  }
}
```

## Join Group
Join a group.

**POST** `/groups/{groupId}/join`

### Headers
```
Authorization: Bearer <token>
```

### Request Body (optional)
```json
{
  "message": "I'm excited to join this community!"
}
```

### Response
```json
{
  "message": "Successfully joined the group"
}
```

---

# Chat Endpoints

## Send Message
Send a message to a user or group.

**POST** `/chat`

### Headers
```
Authorization: Bearer <token>
```

### Request Body
```json
{
  "recipient": "507f1f77bcf86cd799439011", // For direct messages
  "group": null, // For group messages
  "content": {
    "text": "Hello! How are you?",
    "images": [],
    "files": []
  },
  "type": "text",
  "replyTo": null // Optional: ID of message being replied to
}
```

### Response
```json
{
  "message": "Message sent successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "sender": {
      "_id": "507f1f77bcf86cd799439012",
      "username": "john_doe",
      "firstName": "John",
      "lastName": "Doe",
      "avatar": "https://example.com/avatar.jpg"
    },
    "recipient": {
      "_id": "507f1f77bcf86cd799439013",
      "username": "jane_doe",
      "firstName": "Jane",
      "lastName": "Doe",
      "avatar": "https://example.com/avatar2.jpg"
    },
    "content": {
      "text": "Hello! How are you?"
    },
    "type": "text",
    "isRead": false,
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
}
```

## Get Conversation
Get messages between two users.

**GET** `/chat/conversation/{userId}`

### Headers
```
Authorization: Bearer <token>
```

### Query Parameters
- `page` (optional): Page number (default: 1)
- `limit` (optional): Messages per page (default: 50)

### Response
```json
{
  "messages": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "sender": {
        "_id": "507f1f77bcf86cd799439012",
        "username": "john_doe",
        "firstName": "John",
        "lastName": "Doe",
        "avatar": "https://example.com/avatar.jpg"
      },
      "content": {
        "text": "Hello! How are you?"
      },
      "type": "text",
      "isRead": true,
      "createdAt": "2023-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "hasMore": false
  }
}
```

## Get Conversations
Get all conversations for the current user.

**GET** `/chat/conversations`

### Headers
```
Authorization: Bearer <token>
```

### Response
```json
{
  "conversations": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "participant": {
        "_id": "507f1f77bcf86cd799439012",
        "username": "jane_doe",
        "firstName": "Jane",
        "lastName": "Doe",
        "avatar": "https://example.com/avatar2.jpg",
        "isOnline": true
      },
      "lastMessage": {
        "_id": "507f1f77bcf86cd799439013",
        "content": {
          "text": "See you tomorrow!"
        },
        "createdAt": "2023-01-01T00:00:00.000Z"
      },
      "unreadCount": 2
    }
  ]
}
```

---

# Socket.io Events

## Connection Events
```javascript
// Client connects
socket.on('connection', (socket) => {
  console.log('User connected:', socket.id);
});

// User joins their room
socket.emit('join', userId);

// User disconnects
socket.on('disconnect', () => {
  console.log('User disconnected');
});
```

## Message Events
```javascript
// Send private message
socket.emit('private_message', {
  recipientId: 'user_id',
  senderId: 'sender_id',
  message: 'Hello!'
});

// Receive private message
socket.on('private_message', (data) => {
  console.log('New message:', data);
});

// Send group message
socket.emit('group_message', {
  groupId: 'group_id',
  senderId: 'sender_id',
  message: 'Hello everyone!'
});

// Receive group message
socket.on('group_message', (data) => {
  console.log('New group message:', data);
});
```

## Status Events
```javascript
// Update user status
socket.emit('status_update', {
  userId: 'user_id',
  status: 'online' // or 'offline', 'away', 'busy'
});

// Receive status update
socket.on('user_status', (data) => {
  console.log('User status changed:', data);
});
```

---

# Rate Limiting

Most endpoints are rate-limited to prevent abuse:
- **General API**: 100 requests per 15 minutes per IP
- **Authentication**: 5 requests per 15 minutes per IP
- **Password Reset**: 3 requests per hour per IP
- **File Upload**: 10 requests per minute per user

When rate limit is exceeded, you'll receive a `429 Too Many Requests` response.

---

# Error Codes

| Code | Description |
|------|-------------|
| `AUTH_001` | Invalid credentials |
| `AUTH_002` | Token expired |
| `AUTH_003` | Insufficient permissions |
| `USER_001` | User not found |
| `USER_002` | Username already taken |
| `USER_003` | Email already registered |
| `POST_001` | Post not found |
| `POST_002` | Cannot edit post |
| `GROUP_001` | Group not found |
| `GROUP_002` | Already a member |
| `GROUP_003` | Not a member |
| `CHAT_001` | Cannot send message |
| `CHAT_002` | Message not found |
| `VALIDATION_001` | Invalid input data |
| `RATE_LIMIT_001` | Too many requests |

---

# SDK Examples

## JavaScript/Node.js
```javascript
const KuyaPadsAPI = require('kuyapads-sdk');

const api = new KuyaPadsAPI({
  baseURL: 'https://api.kuyapads.com',
  apiKey: 'your-api-key'
});

// Login
const { user, token } = await api.auth.login('email@example.com', 'password');

// Create post
const post = await api.posts.create({
  content: { text: 'Hello, KuyaPads!' },
  privacy: 'public'
});

// Send message
const message = await api.chat.sendMessage({
  recipient: 'user-id',
  content: { text: 'Hello!' }
});
```

## Python
```python
from kuyapads import KuyaPadsAPI

api = KuyaPadsAPI(base_url='https://api.kuyapads.com', api_key='your-api-key')

# Login
user, token = api.auth.login('email@example.com', 'password')

# Create post
post = api.posts.create(content={'text': 'Hello, KuyaPads!'}, privacy='public')

# Send message
message = api.chat.send_message(recipient='user-id', content={'text': 'Hello!'})
```

---

For more examples and detailed implementation guides, please refer to our [GitHub repository](https://github.com/KuyaPads/KuyaPads) and [developer documentation](https://docs.kuyapads.com).