# EUPHORIA 2.0

A full-stack application with React Frontend, React Native Mobile App, and Node.js/Express Backend.

## Project Structure

```
EUPHORIA2.0/
├── frontend/          # React web application
│   ├── public/
│   ├── src/
│   └── package.json
├── mobile/            # React Native Expo mobile app
│   ├── src/
│   ├── App.js
│   ├── app.json
│   ├── package.json
│   ├── SETUP.md       # Mobile setup guide
│   └── MOBILE_README.md
├── backend/           # Node.js/Express API
│   ├── server.js
│   ├── routes/
│   ├── middleware/
│   ├── database/
│   └── package.json
└── README.md
```

## Tech Stack

### Frontend (Web)
- **React 18.2** - UI library
- **React Router 6** - Client-side routing
- **Axios** - HTTP client for API calls
- **CSS** - Styling

### Mobile App
- **React Native** - Mobile framework
- **Expo** - Development platform
- **React Navigation** - Mobile navigation
- **Axios** - HTTP client
- **AsyncStorage** - Local data persistence

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **MySQL** - Relational database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing
- **Ollama** - AI/LLM integration for chatbot

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MySQL Server (v5.7 or higher)
- For mobile: Android emulator, iOS simulator, or Expo Go app

### Installation

**Backend:**
```bash
cd backend
npm install
```

**Frontend (Web):**
```bash
cd frontend
npm install
```

**Mobile App:**
```bash
cd mobile
npm install --legacy-peer-deps
```
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### Running the Application

#### Start Backend Server
```bash
cd backend
npm run dev
```
Backend will run on: http://localhost:5000

#### Start Frontend (in a new terminal)
```bash
cd frontend
npm start
```
Frontend will run on: http://localhost:3000

## Environment Variables

Configure the backend by editing `backend/.env`:
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `DB_HOST` - MySQL host (default: localhost)
- `DB_USER` - MySQL username (default: root)
- `DB_PASSWORD` - MySQL password
- `DB_NAME` - Database name (default: euphoria)
- `JWT_SECRET` - Secret key for JWT tokens

### Database Setup

Create the MySQL database:
```sql
CREATE DATABASE euphoria;
```

Update the credentials in `backend/.env` file.

## API Endpoints

- `GET /` - Welcome message
- `GET /api/health` - Health check endpoint

## Development

### Backend Scripts
- `npm start` - Start server (production)
- `npm run dev` - Start server with nodemon (development)

### Frontend Scripts
- `npm start` - Start development server
- `npm build` - Create production build
- `npm test` - Run tests

## Next Steps

1. Install and start MySQL Server
2. Create database: `CREATE DATABASE euphoria;`
3. Update MySQL credentials in `backend/.env`
4. Build your components in `frontend/src/`
5. Create API routes and database tables in `backend/`
6. Add authentication logic
7. Create your application features!

## Notes

- Frontend proxy is configured to forward API requests to backend
- CORS is enabled for cross-origin requests
- Hot reload is enabled for both frontend and backend (dev mode)
