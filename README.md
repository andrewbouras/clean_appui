# Next.js + Express Authentication App

A full-stack application using Next.js for the frontend and Express for the backend, featuring Google OAuth authentication.

## Prerequisites

- Node.js (v18 or higher)
- MongoDB database
- Google OAuth credentials

## Setup

1. Clone the repository:
```bash
git clone <your-repo-url>
cd <your-repo-name>
```

2. Install dependencies:
```bash
npm install
```

3. Create environment files:

Create `.env` in the root directory:
```env
MONGODB_URI=your_mongodb_connection_string
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback
BASE_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000

# Auth secrets
COOKIE_KEY=your_cookie_key
SESSION_SECRET=your_session_secret
JWT_SECRET=your_jwt_secret

# Other configurations
PORT=3001
CORS_ORIGIN=http://localhost:3000
```

Create `.env.local` in the root directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

4. Set up Google OAuth:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select an existing one
   - Enable the Google+ API
   - Go to Credentials > Create Credentials > OAuth Client ID
   - Set up the OAuth consent screen
   - Add authorized redirect URI: `http://localhost:3001/auth/google/callback`
   - Copy the Client ID and Client Secret to your `.env` file

## Running the Application

### Development Mode
To run both frontend and backend servers concurrently:
```bash
npm run dev:all
```

This will start:
- Frontend server on http://localhost:3000
- Backend server on http://localhost:3001

### Individual Commands
To run servers separately:

Frontend only:
```bash
npm run dev
```

Backend only:
```bash
npm run server
```

## Project Structure

```
├── src/
│   ├── components/     # React components
│   ├── lib/           # Utility functions
│   └── app/           # Next.js pages
├── routes/            # Express routes
├── config/           # Backend configuration
├── models/           # MongoDB models
└── server.js         # Express server
```

## Features

- Google OAuth Authentication
- JWT-based session management
- MongoDB user storage
- Secure HTTP-only cookies
- Protected routes
- Responsive UI

## Environment Variables

### Backend (.env)
- `MONGODB_URI`: MongoDB connection string
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
- `GOOGLE_CALLBACK_URL`: OAuth callback URL
- `BASE_URL`: Backend server URL
- `FRONTEND_URL`: Frontend server URL
- `COOKIE_KEY`: Cookie encryption key
- `SESSION_SECRET`: Session secret
- `JWT_SECRET`: JWT signing secret
- `PORT`: Backend server port
- `CORS_ORIGIN`: Allowed CORS origin

### Frontend (.env.local)
- `NEXT_PUBLIC_API_URL`: Backend API URL

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details

git add .
git commit -m "message"
git push origin main

git reset --hard origin/main