# KuyaPads Network Platform

A modern social networking platform connecting Filipino communities worldwide.

## Features

- User authentication and profiles
- Real-time messaging and chat
- Community groups and forums
- Content sharing and media upload
- Friend connections and networking
- Event creation and management
- Mobile-responsive design

## Tech Stack

- **Frontend**: React 18+ with TypeScript
- **Backend**: Node.js with Express
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT tokens
- **Real-time**: Socket.io
- **Styling**: Tailwind CSS
- **Testing**: Jest and React Testing Library

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/KuyaPads/KuyaPads.git
cd KuyaPads
```

2. Install dependencies:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Set up environment variables:
```bash
# In backend directory
cp .env.example .env
# Edit .env with your MongoDB connection string and JWT secret
```

4. Start the development servers:
```bash
# Start backend (in backend directory)
npm run dev

# Start frontend (in frontend directory)
npm start
```

## Project Structure

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
│   ├── public/            # Static assets
│   ├── src/               # React source code
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API services
│   │   └── utils/         # Utility functions
│   └── package.json
├── docs/                   # Documentation
├── .gitignore
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support, email support@kuyapads.com or join our Discord community.