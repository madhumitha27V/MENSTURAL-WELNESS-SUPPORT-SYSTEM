# 🌺 EUPHORIA - Menstrual Health & Wellness App

## Hackathon Submission Package

**Project Type:** React Native Mobile Application with Node.js Backend  
**Submission Date:** January 31, 2026  
**Status:** ✅ Complete & Ready for Testing

---

## 📋 Quick Summary

EUPHORIA is a comprehensive menstrual health and wellness platform that helps users:
- Track their menstrual cycle with visual calendar interface
- Monitor pre-cycle symptoms and health patterns
- Receive AI-powered nutritional and health recommendations
- Access 24/7 AI chatbot support for health queries
- Log daily activities and symptom progression
- Get personalized wellness suggestions

---

## 🚀 Quick Start (2 Minutes)

### Option 1: Run the Development Server (Recommended)
```bash
cd EUPHORIA2.0/mobile
node dev-server.js
```

**Then scan the QR code with Expo Go app** (download from App Store/Play Store)

### Option 2: Run Backend API Server
```bash
cd EUPHORIA2.0/backend
npm install
npm start
```

Backend runs on `http://localhost:5000`

---

## 📱 Features

### 1. **Authentication**
- User registration with phone number & password
- JWT token-based authentication
- Persistent login with AsyncStorage

### 2. **Dashboard**
- Main hub with 6 quick-access cards:
  - Pre-Cycle Symptoms Tracking
  - Active Cycle Monitoring
  - Nutrition Recommendations
  - Health Tips & Suggestions
  - Cycle Calendar
  - AI Chat Support

### 3. **Cycle Tracking**
- **Pre-Cycle Phase:** Log symptoms before cycle starts
- **Active Cycle:** Track current phase with daily symptoms
- **Calendar View:** Visual monthly cycle calendar with phase highlighting

### 4. **Health Recommendations**
- AI-powered nutrition suggestions based on cycle phase
- Symptom-specific health tips
- Daily wellness recommendations

### 5. **AI Chatbot**
- 24/7 health query support
- Real-time message chat interface
- Backend LLaMA integration for health advice

### 6. **Data Management**
- All data synced to backend database
- SQLite database with phone number-based user lookup
- RESTful API for all operations

---

## 🛠️ Tech Stack

### Frontend (Mobile)
- **React Native 0.73.4** - Cross-platform mobile framework
- **Expo 50.0.2** - Development platform for easy testing
- **React Navigation 6.1.9** - Stack-based navigation
- **AsyncStorage** - Local data persistence
- **Axios 1.6.2** - HTTP client for API calls

### Backend
- **Node.js & Express** - REST API server
- **SQLite** - Database
- **JWT** - Authentication
- **LLaMA** - AI chatbot (optional integration)

---

## 📂 Project Structure

```
EUPHORIA2.0/
├── mobile/                          # React Native App
│   ├── src/
│   │   ├── screens/                 # 10 app screens
│   │   │   ├── HomeScreen.js
│   │   │   ├── LoginScreen.js
│   │   │   ├── SignupScreen.js
│   │   │   ├── DashboardScreen.js
│   │   │   ├── PreCycleScreen.js
│   │   │   ├── DuringScreen.js
│   │   │   ├── FoodScreen.js
│   │   │   ├── CalendarScreen.js
│   │   │   ├── SymptomSuggestionsScreen.js
│   │   │   └── ChatScreen.js
│   │   ├── context/
│   │   │   └── AuthContext.js       # Global auth state
│   │   ├── services/
│   │   │   └── api.js               # API integration
│   │   └── utils/
│   ├── App.js                       # Main app with navigation
│   ├── index.js                     # Entry point
│   ├── app.json                     # Expo config
│   ├── package.json
│   ├── dev-server.js                # Custom dev server
│   └── node_modules/
│
├── backend/                         # Node.js API Server
│   ├── server.js                    # Main server
│   ├── middleware/
│   │   └── auth.js                  # JWT middleware
│   ├── routes/
│   │   ├── auth.js                  # Login/Signup
│   │   ├── cycle.js                 # Cycle data
│   │   ├── preCycleSymptoms.js      # Pre-cycle tracking
│   │   ├── activeCycle.js           # Active cycle phase
│   │   └── chat.js                  # Chat messages
│   ├── database/
│   │   └── schema.sql               # Database schema
│   ├── package.json
│   └── setup-db.js
│
├── README.md                        # Main documentation
├── FRONTEND_SETUP.md
├── LLAMA_SETUP.md
└── HACKATHON_SUBMISSION.md         # This file
```

---

## 🎬 How to Test

### Test Account
Use any phone number and password to sign up:
- **Phone:** `9876543210` (or any number)
- **Password:** `password123`

### Test Workflow
1. **Sign Up** → Enter phone & password
2. **Dashboard** → View all 6 feature cards
3. **Pre-Cycle** → Log symptoms with date
4. **Calendar** → View cycle visualization
5. **During** → Track active cycle symptoms
6. **Food** → See nutrition recommendations
7. **Tips** → Get health suggestions
8. **Chat** → Ask health questions to AI

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Cycle Management
- `POST /api/cycle/start` - Start cycle
- `GET /api/cycle/current` - Get current cycle info
- `POST /api/cycle/end` - End cycle

### Pre-Cycle Symptoms
- `POST /api/pre-cycle/symptoms` - Log pre-cycle symptoms
- `GET /api/pre-cycle/symptoms` - Get symptom history

### Active Cycle
- `POST /api/active-cycle/log` - Log active cycle symptoms
- `GET /api/active-cycle/suggestions` - Get health suggestions

### Chat
- `POST /api/chat/message` - Send message
- `GET /api/chat/history` - Get chat history

---

## 💾 Database Schema

### Users
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  phone_number VARCHAR(20) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Cycles
```sql
CREATE TABLE cycles (
  id INTEGER PRIMARY KEY,
  user_id INTEGER,
  start_date DATE,
  end_date DATE,
  FOREIGN KEY(user_id) REFERENCES users(id)
);
```

### Chat History
```sql
CREATE TABLE chat_history (
  id INTEGER PRIMARY KEY,
  user_id INTEGER,
  message TEXT,
  response TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id)
);
```

---

## 🎯 Key Features Implemented

✅ **10 Complete Screens**
- Home (with backend health check)
- Login with validation
- Signup with registration
- Dashboard with 6-card navigation
- Pre-Cycle tracking
- Active Cycle monitoring
- Food recommendations
- Cycle Calendar with visualization
- Health tips suggestions
- AI Chat interface

✅ **State Management**
- React Context API for authentication
- JWT token handling
- AsyncStorage persistence
- Automatic session restoration

✅ **API Integration**
- All endpoints connected
- Token-based authentication
- Error handling & validation
- CORS support on backend

✅ **UI/UX**
- Native React Native components
- Responsive design
- Touch-optimized interfaces
- Loading states and error messages

---

## 🔧 Installation & Running

### Prerequisites
- Node.js 18+ (or v24 for latest)
- npm/yarn package manager
- Expo Go app (for mobile testing)

### Step 1: Clone/Extract Project
```bash
cd EUPHORIA2.0
```

### Step 2: Setup Backend (Optional but Recommended)
```bash
cd backend
npm install
node setup-db.js
npm start
```

### Step 3: Setup Mobile App
```bash
cd ../mobile
npm install --legacy-peer-deps
node dev-server.js
```

### Step 4: Test on Phone
1. Download **Expo Go** app
2. Scan the QR code from terminal
3. App loads on your phone!

---

## 📊 Performance & Optimization

- **Fast Loading:** Lightweight React Native components
- **Efficient Bundling:** Metro bundler optimized
- **Network:** Axios with token caching
- **Storage:** AsyncStorage for offline capability
- **Database:** SQLite for quick queries

---

## 🐛 Troubleshooting

### "Cannot connect to backend"
- Ensure backend is running: `npm start` in `/backend`
- Check API URL in `mobile/src/services/api.js`
- Verify both are on same network

### "Expo connection timeout"
- Make sure phone is on same WiFi as computer
- Run: `node dev-server.js` in `/mobile`
- Scan QR code again

### "Database error"
- Run: `node setup-db.js` in `/backend`
- This creates fresh database tables

---

## 🏆 Hackathon Highlights

1. **Full-Stack Solution** - Mobile app + Backend API
2. **Production Ready** - Error handling, validation, auth
3. **Database Integration** - Real data persistence
4. **AI Integration** - LLaMA chatbot support (optional)
5. **Complete UI/UX** - 10 screens with full functionality
6. **Quick Setup** - Run in minutes, not hours

---

## 📞 Support & Contact

For hackathon judges or questions about the submission:
- Backend API: `localhost:5000`
- Mobile App: Scan QR code from dev server
- Database: SQLite (auto-created)

---

## ✨ Future Enhancements

- Push notifications for cycle reminders
- Cloud sync across devices
- Health data analytics
- Integration with wearables
- Multi-language support
- Social features & community

---

## 📄 License

This project is submitted for hackathon evaluation.

**Thank you for reviewing EUPHORIA!** 🌺
