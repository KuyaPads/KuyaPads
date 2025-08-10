# VS Code Setup Guide for KuyaPads

This guide will help you set up VS Code with GitHub Copilot and all necessary extensions for optimal development experience with the KuyaPads project.

## Prerequisites

1. **VS Code**: Download and install [Visual Studio Code](https://code.visualstudio.com/)
2. **GitHub Copilot Subscription**: You need an active [GitHub Copilot subscription](https://github.com/features/copilot)
3. **Node.js**: Ensure you have Node.js 18+ installed
4. **Git**: Make sure Git is installed and configured

## Quick Setup

### Method 1: Using the Workspace File (Recommended)

1. Open the `KuyaPads.code-workspace` file in VS Code:
   ```bash
   code KuyaPads.code-workspace
   ```

2. VS Code will automatically prompt you to install recommended extensions. Click "Install All" to install:
   - GitHub Copilot
   - GitHub Copilot Chat
   - TypeScript Language Server
   - Tailwind CSS IntelliSense
   - Prettier Code Formatter
   - ESLint
   - And more...

### Method 2: Manual Setup

1. Open the project folder in VS Code:
   ```bash
   code /path/to/KuyaPads
   ```

2. Install the recommended extensions by pressing `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac) and typing "Extensions: Show Recommended Extensions"

## GitHub Copilot Setup

### 1. Sign in to GitHub Copilot

1. Open VS Code
2. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
3. Type "GitHub Copilot: Sign In"
4. Follow the authentication flow to sign in with your GitHub account

### 2. Verify Copilot is Working

1. Create a new JavaScript/TypeScript file
2. Start typing a function, for example:
   ```javascript
   // Function to calculate fibonacci number
   function fibonacci(
   ```
3. Copilot should provide suggestions in gray text
4. Press `Tab` to accept suggestions

### 3. Using Copilot Chat

1. Press `Ctrl+Shift+P` and type "GitHub Copilot: Open Chat"
2. Ask questions about your code or request help with specific tasks
3. You can also use inline chat by pressing `Ctrl+I` (or `Cmd+I` on Mac)

## Development Workflow

### Starting the Application

Use the built-in tasks to start the development servers:

1. **Install Dependencies**:
   - Press `Ctrl+Shift+P`
   - Type "Tasks: Run Task"
   - Select "Install All Dependencies"

2. **Start Full Application**:
   - Press `Ctrl+Shift+P`
   - Type "Tasks: Run Task"
   - Select "Start Full Application"

This will start both the frontend (React) and backend (Node.js) servers in parallel.

### Debugging

The workspace includes pre-configured debug configurations:

1. **Debug Frontend**: Debug React application
2. **Debug Backend**: Debug Node.js server
3. **Launch Full Application**: Debug both frontend and backend

To start debugging:
1. Go to the Debug view (`Ctrl+Shift+D`)
2. Select a configuration from the dropdown
3. Press `F5` to start debugging

### Available Tasks

Press `Ctrl+Shift+P` and type "Tasks: Run Task" to access:

- **Install All Dependencies**: Install packages for both frontend and backend
- **Start Full Application**: Start both servers in development mode
- **Build Frontend**: Create production build of React app
- **Run All Tests**: Execute tests for both frontend and backend
- **Lint Frontend**: Run ESLint on frontend code
- **Docker: Build and Start**: Start the application using Docker
- **Docker: Stop**: Stop Docker containers

## GitHub Copilot Tips for KuyaPads Development

### 1. Context-Aware Suggestions

Copilot works better when you provide context. For example:

```javascript
// Create a React component for user profile card with Tailwind CSS
const UserProfileCard = ({ user, onEdit }) => {
  // Copilot will suggest relevant React/Tailwind code
```

### 2. API Development

When working on the backend, describe what you want:

```javascript
// Express route to get user posts with pagination and filtering
app.get('/api/users/:userId/posts', async (req, res) => {
  // Copilot will suggest MongoDB queries and Express patterns
```

### 3. TypeScript Support

Copilot excels with TypeScript. Define interfaces first:

```typescript
interface User {
  id: string;
  username: string;
  email: string;
  profile: UserProfile;
}

// Function to update user profile
const updateUserProfile = (userId: string, updates: Partial<UserProfile>) => {
  // Copilot will provide type-safe suggestions
```

### 4. Testing

Copilot can help generate tests:

```javascript
// Test for user authentication function
describe('User Authentication', () => {
  // Copilot will suggest test cases and assertions
```

## Keyboard Shortcuts

Essential shortcuts for VS Code development:

- `Ctrl+Shift+P`: Command Palette
- `Ctrl+`` `: Toggle Terminal
- `Ctrl+Shift+D`: Debug View
- `Ctrl+Shift+E`: Explorer View
- `Ctrl+Shift+F`: Search Across Files
- `F5`: Start Debugging
- `Ctrl+F5`: Run Without Debugging
- `Tab`: Accept Copilot suggestion
- `Ctrl+I`: Inline Copilot Chat
- `Ctrl+Right Arrow`: Accept word from suggestion

## Troubleshooting

### Copilot Not Working

1. Check that you're signed in: `Ctrl+Shift+P` → "GitHub Copilot: Sign In"
2. Verify your subscription is active
3. Check Copilot status in the status bar (bottom right)
4. Restart VS Code if needed

### Extensions Not Loading

1. Go to Extensions view (`Ctrl+Shift+X`)
2. Check that all recommended extensions are installed and enabled
3. Reload the window: `Ctrl+Shift+P` → "Developer: Reload Window"

### TypeScript Errors

1. Ensure TypeScript extension is installed
2. Check that `tsconfig.json` files are properly configured
3. Restart TypeScript server: `Ctrl+Shift+P` → "TypeScript: Restart TS Server"

### Environment Setup

1. Make sure you have the required `.env` files in both `frontend` and `backend` directories
2. Copy from `.env.example` files and configure with your settings
3. Install dependencies in both directories before starting

## Additional Resources

- [GitHub Copilot Documentation](https://docs.github.com/en/copilot)
- [VS Code Documentation](https://code.visualstudio.com/docs)
- [TypeScript in VS Code](https://code.visualstudio.com/docs/languages/typescript)
- [Debugging in VS Code](https://code.visualstudio.com/docs/editor/debugging)

## Contributing

When contributing to the project:

1. Use the configured code formatting (Prettier)
2. Follow ESLint rules
3. Write TypeScript when possible
4. Use Copilot to help generate tests for new features
5. Leverage Copilot Chat for code reviews and explanations

The VS Code configuration will automatically format your code on save and run linting to ensure consistency across the project.