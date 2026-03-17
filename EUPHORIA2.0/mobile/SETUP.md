# EUPHORIA Mobile Setup Guide

Complete setup guide for running the React Native Expo mobile app.

## Step 1: Prerequisites Installation

### Install Node.js and npm
1. Download from [nodejs.org](https://nodejs.org/)
2. Install LTS version (recommended)
3. Verify installation in cmd:
   ```cmd
   node --version
   npm --version
   ```

### Install Expo CLI Globally
In cmd, run:
```cmd
npm install -g expo-cli
```

### Install Expo Go on Your Phone
- **Android**: [Download from Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
- **iOS**: [Download from App Store](https://apps.apple.com/us/app/expo-go/id982107779)

## Step 2: Prepare Backend

Make sure your backend is running:

```cmd
cd ..\backend
npm install
npm start
```

Backend should run on `http://localhost:5000`

## Step 3: Setup Mobile App

### Navigate to mobile directory
```cmd
cd mobile
```

### Install Dependencies
```cmd
npm install --legacy-peer-deps
```

This installs all required packages. The `--legacy-peer-deps` flag resolves dependency conflicts.

## Step 4: Run the App

### Option 1: Using Expo Go (Easiest for Development)

1. Start Expo development server:
   ```cmd
   npm start
   ```

2. You'll see a QR code in the terminal

3. **On Android Phone**:
   - Open Expo Go app
   - Tap "Scan QR code"
   - Scan the code in terminal
   - App loads automatically

4. **On iOS Phone**:
   - Open Camera app
   - Point at QR code
   - Tap the Expo Go notification
   - App loads automatically

### Option 2: Android Emulator
```cmd
npm run android
```
(Requires Android Studio and emulator setup)

### Option 3: iOS Simulator
```cmd
npm run ios
```
(Requires macOS and Xcode)

### Option 4: Web Browser
```cmd
npm run web
```

## Step 5: Quick Start with Batch Script

Windows users can use the provided batch script:
```cmd
START.bat
```

This provides a menu for easy access to all commands.

## Troubleshooting

### 1. "Cannot find module" errors
```cmd
npm install --legacy-peer-deps
```

### 2. Backend connection fails
- Ensure backend is running: `npm start` in backend folder
- Backend must be on `http://localhost:5000`
- For Android Emulator, backend should be accessible

### 3. Clear all and reinstall
```cmd
npm cache clean --force
rmdir /s /q node_modules
del package-lock.json
npm install --legacy-peer-deps
```

### 4. Port already in use
If port 5000 (backend) is busy:
- Find process: `netstat -ano | findstr :5000`
- Kill process: `taskkill /PID <PID> /F`

### 5. "expo command not found"
Reinstall Expo CLI:
```cmd
npm install -g expo-cli
```

## Project Structure

```
mobile/
├── src/
│   ├── screens/              # Screen components
│   │   ├── HomeScreen.js
│   │   ├── LoginScreen.js
│   │   ├── SignupScreen.js
│   │   ├── DashboardScreen.js
│   │   ├── PreCycleScreen.js
│   │   ├── DuringScreen.js
│   │   ├── FoodScreen.js
│   │   ├── CalendarScreen.js
│   │   ├── SymptomSuggestionsScreen.js
│   │   └── ChatScreen.js
│   ├── components/           # Reusable components
│   ├── context/              # Auth context
│   │   └── AuthContext.js
│   ├── services/             # API services
│   │   └── api.js
│   └── utils/                # Utilities
├── App.js                    # Main app with navigation
├── app.json                  # Expo configuration
├── package.json              # Dependencies
├── index.js                  # Entry point
├── START.bat                 # Quick start script
├── MOBILE_README.md          # Detailed readme
└── SETUP.md                  # This file
```

## Key Features

✅ User Authentication (Login/Signup)
✅ Dashboard with navigation
✅ Cycle tracking features
✅ Nutrient diet recommendations
✅ Cycle calendar
✅ Symptom suggestions
✅ AI Chat companion
✅ Persistent authentication

## Available Commands

```cmd
npm start              # Start Expo dev server
npm run android        # Run on Android emulator
npm run ios            # Run on iOS simulator
npm run web            # Run in web browser
npm install            # Install dependencies
npm run eject          # Eject from Expo (not recommended)
```

## API Endpoints

The app connects to:

```
http://localhost:5000/api/

- POST   /auth/login
- POST   /auth/signup
- GET    /health
- POST   /chat
- GET    /chat/history
- GET    /cycle/active
- POST   /cycle/active
- GET    /pre-cycle
- POST   /pre-cycle
```

## Configuration

To change backend URL:

Edit `src/services/api.js`:
```javascript
const API_URL = 'http://YOUR_SERVER:5000/api';
```

## For Production

### Build APK for Android
```cmd
eas build --platform android
```

### Build IPA for iOS
```cmd
eas build --platform ios
```

(Requires Expo account at https://expo.dev)

## Getting Help

- Expo Documentation: https://docs.expo.dev/
- React Native Docs: https://reactnative.dev/
- React Navigation: https://reactnavigation.org/

## Tips

1. **Hot Reload**: Changes are automatically reloaded during development
2. **Debugging**: Press `d` in terminal to open debugger
3. **Network Issues**: Restart Expo server if connection issues
4. **Storage**: App data is stored locally using AsyncStorage
5. **JWT Tokens**: Stored securely in AsyncStorage

## Support

If you encounter issues:

1. Check that backend is running on port 5000
2. Clear cache: `npm start -- --clear`
3. Reinstall: `npm install --legacy-peer-deps`
4. Check network connectivity
5. Review backend logs for API errors

---

**Happy coding! 🚀**
