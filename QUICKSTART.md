# Quick Start Guide - EUPHORIA 2.0

## Running All Components

### Terminal 1: Backend Server

```cmd
cd backend
npm start
```

The backend will run on `http://localhost:5000`

### Terminal 2: Frontend (Web App)

```cmd
cd frontend
npm start
```

The web app will open on `http://localhost:3000`

### Terminal 3: Mobile App (React Native)

```cmd
cd mobile
npm start
```

Follow the on-screen instructions:
- Press `a` for Android emulator
- Press `i` for iOS simulator  
- Scan QR code with Expo Go app on your phone

## Using Separate Command Prompts (CMD)

### For Windows Users - Open 3 Command Prompts

**Command Prompt 1 - Backend:**
```cmd
cd c:\Users\91638\Downloads\EUPHORIA2.0\EUPHORIA2.0\backend
npm start
```

**Command Prompt 2 - Frontend:**
```cmd
cd c:\Users\91638\Downloads\EUPHORIA2.0\EUPHORIA2.0\frontend
npm start
```

**Command Prompt 3 - Mobile:**
```cmd
cd c:\Users\91638\Downloads\EUPHORIA2.0\EUPHORIA2.0\mobile
npm start
```

## What Each Component Does

### Backend (Port 5000)
- REST API endpoints
- User authentication
- Database operations
- Chat/AI integration

### Frontend (Port 3000)
- Web-based UI
- React routing
- Dashboard and cycle tracking
- Chat interface

### Mobile (Expo)
- Native mobile app
- iOS and Android support
- Same features as web
- Works with Expo Go

## Database Setup

Before running, setup your database:

```cmd
cd backend
node setup-db.js
```

This creates all necessary tables in MySQL.

## Accessing the Apps

### Web App
- URL: `http://localhost:3000`
- Works on desktop/laptop browsers

### Mobile App
1. Install Expo Go on your phone
2. Run `npm start` in mobile directory
3. Scan the QR code
4. App loads in Expo Go

### Test Credentials
Use these for testing (after signup):
- Phone: Any number
- Password: Any password (min 6 chars)

## Environment Variables

### Backend (.env)
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=euphoria
PORT=5000
JWT_SECRET=your_secret_key
```

## Common Issues

**Port Already in Use:**
```cmd
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

**Mobile App Won't Connect:**
- Ensure backend is running
- Check API URL in `src/services/api.js`

**Dependencies Issues:**
```cmd
npm install --legacy-peer-deps
```

## File Locations

```
c:\Users\91638\Downloads\EUPHORIA2.0\EUPHORIA2.0\
├── backend\       → Backend API
├── frontend\      → Web app
├── mobile\        → Mobile app
└── README.md      → Project info
```

## Next Steps

1. ✅ Start backend: `cd backend && npm start`
2. ✅ Start frontend: `cd frontend && npm start`
3. ✅ Start mobile: `cd mobile && npm start`
4. ✅ Login/Signup and test features

## Support

- Backend issues: Check server.js logs
- Frontend issues: Check browser console (F12)
- Mobile issues: Check Expo CLI output

---

**All systems ready!** 🚀
