# EUPHORIA 2.0 - Complete Application Suite

A full-stack application with **3 platforms**: React Web Frontend, React Native Mobile App, and Node.js/Express Backend.

## 🚀 Project Structure

```
EUPHORIA2.0/
├── frontend/              # React web application
│   ├── src/
│   ├── public/
│   └── package.json
├── mobile/                # React Native Expo mobile app ⭐ NEW
│   ├── src/
│   │   ├── screens/       (10 screens)
│   │   ├── context/       (Auth state management)
│   │   ├── services/      (API integration)
│   │   └── utils/
│   ├── App.js
│   ├── app.json
│   ├── package.json
│   ├── SETUP.md           (Mobile setup guide)
│   ├── MOBILE_README.md   (Mobile documentation)
│   └── START.bat          (Windows quick start)
├── backend/               # Node.js/Express API
│   ├── routes/
│   ├── middleware/
│   ├── database/
│   ├── server.js
│   └── package.json
├── QUICKSTART.md          (Quick reference)
├── CONVERSION_SUMMARY.md  (Conversion details)
└── README.md              (This file)
```

## 💻 Tech Stack

### Frontend (Web)
- **React 18.2** - UI library
- **React Router 6** - Client-side routing
- **Axios** - HTTP client
- **CSS** - Styling

### Mobile App ⭐ NEW
- **React Native** - Mobile framework
- **Expo 50** - Development & distribution platform
- **React Navigation 6** - Mobile navigation
- **AsyncStorage** - Local data persistence
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **MySQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Ollama** - AI chatbot

## 📋 Prerequisites

- **Node.js v14+** - https://nodejs.org/
- **npm** - Comes with Node.js
- **MySQL 5.7+** - https://www.mysql.com/
- **Expo Go App** (for mobile testing) - iOS or Android

## ⚡ Quick Start

### Install All Dependencies

```cmd
cd backend && npm install
cd ../frontend && npm install
cd ../mobile && npm install --legacy-peer-deps
```

### Run All 3 Applications

**Open 3 separate CMD windows and run:**

**Window 1 - Backend (Port 5000):**
```cmd
cd c:\Users\91638\Downloads\EUPHORIA2.0\EUPHORIA2.0\backend
npm start
```

**Window 2 - Frontend Web (Port 3000):**
```cmd
cd c:\Users\91638\Downloads\EUPHORIA2.0\EUPHORIA2.0\frontend
npm start
```

**Window 3 - Mobile App (Expo):**
```cmd
cd c:\Users\91638\Downloads\EUPHORIA2.0\EUPHORIA2.0\mobile
npm start
```

Then scan the QR code with **Expo Go** app on your phone.

## 📱 Mobile App (NEW!)

### Features
✅ User authentication (login/signup)
✅ Dashboard with 6 feature modules
✅ Pre-cycle phase tracking
✅ Active cycle tracking
✅ Nutrient diet recommendations
✅ Cycle calendar view
✅ AI chatbot companion
✅ Symptom suggestions
✅ Persistent authentication

### Screens Implemented
1. Home - Landing page
2. Login - User authentication
3. Signup - User registration
4. Dashboard - Main menu
5. PreCycle - Pre-cycle phase
6. During - Active cycle
7. Food - Meal recommendations
8. Calendar - Cycle calendar
9. SymptomSuggestions - Health tips
10. Chat - AI companion

### Run Mobile App
```cmd
cd mobile
npm start
```

**For specific platforms:**
```cmd
npm run android    # Android emulator
npm run ios        # iOS simulator
npm run web        # Web browser
```

Or use the **START.bat** script for an interactive menu!

## 🌐 Web Application

```cmd
cd frontend
npm start
```
Runs on `http://localhost:3000`

## 🔧 Backend Setup

### Initial Database Setup
```cmd
cd backend
node setup-db.js
```

This creates all necessary tables in MySQL.

### Start Backend
```cmd
npm start
```
Runs on `http://localhost:5000`

### Configuration (.env)
```
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=euphoria
JWT_SECRET=your_secret_key
```

## 📡 API Endpoints

All endpoints use `http://localhost:5000/api/`

```
Authentication:
  POST   /auth/login
  POST   /auth/signup

Health:
  GET    /health

Chat:
  POST   /chat
  GET    /chat/history

Cycle Management:
  GET    /cycle/active
  POST   /cycle/active
  GET    /cycle/symptoms
  GET    /cycle/active/suggestions

Pre-Cycle:
  GET    /pre-cycle
  POST   /pre-cycle
  GET    /pre-cycle/suggestions
```

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [QUICKSTART.md](./QUICKSTART.md) | Quick reference for running all apps |
| [CONVERSION_SUMMARY.md](./CONVERSION_SUMMARY.md) | Web → Mobile conversion details |
| [mobile/SETUP.md](./mobile/SETUP.md) | Detailed mobile setup guide |
| [mobile/MOBILE_README.md](./mobile/MOBILE_README.md) | Mobile app documentation |

## 🛠️ Troubleshooting

### Backend won't start
```cmd
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Dependencies issues
```cmd
npm cache clean --force
npm install --legacy-peer-deps
```

### Mobile app connection fails
- Ensure backend is running on port 5000
- Check API URL in `mobile/src/services/api.js`
- Network connectivity between phone/emulator and computer

### Clear everything and reinstall
```cmd
cd <any-folder>
rmdir /s /q node_modules
del package-lock.json
npm install --legacy-peer-deps
```

## 🔐 Security

- JWT token-based authentication
- Secure password hashing (bcryptjs)
- CORS enabled for frontend & mobile
- AsyncStorage for secure local storage

## 📦 Deployment

### Mobile App
```cmd
cd mobile
eas build --platform android   # Build APK
eas build --platform ios       # Build IPA
```

### Frontend
```cmd
cd frontend
npm build
```

### Backend
Use standard Node.js deployment (Heroku, AWS, etc.)

## ✨ What's New

✅ **Mobile app created** using React Native + Expo
✅ **10 complete screens** with full functionality
✅ **Authentication system** integrated with backend
✅ **Navigation** fully implemented
✅ **API integration** with Axios
✅ **Local storage** with AsyncStorage
✅ **Responsive UI** for all screen sizes
✅ **Windows batch script** for easy startup

## 💡 Development Tips

1. **Hot Reload**: Changes auto-reload in dev mode
2. **Clear Cache**: `npm start -- --clear` for mobile
3. **Debugging**: Press `d` in Expo terminal
4. **Testing**: All 3 apps run simultaneously

## 📝 Getting Started Checklist

- [ ] Install Node.js
- [ ] Install MySQL
- [ ] Install Expo Go app on phone
- [ ] Run `npm install` in all 3 folders
- [ ] Update backend `.env` file
- [ ] Run `node setup-db.js` in backend
- [ ] Start all 3 applications
- [ ] Test login/signup
- [ ] Test all features

## 📞 Support

- **Expo**: https://docs.expo.dev/
- **React Native**: https://reactnative.dev/
- **React**: https://react.dev/

---

**Ready to go!** Start with the 3-terminal setup above. 🚀
