# EUPHORIA Mobile App - React Native with Expo

This is a React Native mobile version of the EUPHORIA application using Expo and Expo Go.

## Project Structure

```
mobile/
├── src/
│   ├── screens/          # All app screens
│   ├── components/       # Reusable components
│   ├── context/          # React Context for state management
│   ├── services/         # API service calls
│   └── utils/            # Utility functions
├── App.js                # Main app component with navigation
├── app.json              # Expo configuration
├── package.json          # Dependencies
└── index.js              # Entry point
```

## Features

- User Authentication (Login/Signup)
- Dashboard with quick access to all features
- Pre-Cycle Phase Tracking
- Active Cycle Tracking
- Nutrient Diet Recommendations
- Cycle Calendar View
- Symptom Suggestions
- AI Chat Companion
- Persistent authentication with AsyncStorage

## Prerequisites

Before running the app, make sure you have:

1. **Node.js and npm** installed ([Download](https://nodejs.org/))
2. **Expo CLI** installed globally:
   ```
   npm install -g expo-cli
   ```
3. **Expo Go app** on your phone ([iOS](https://apps.apple.com/us/app/expo-go/id982107779) or [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))
4. **Backend Server** running on `http://localhost:5000`

## Installation

1. Navigate to the mobile directory:
   ```cmd
   cd mobile
   ```

2. Install dependencies:
   ```cmd
   npm install
   ```

## Running the App

### Using Expo Go (Recommended for development)

1. Start the Expo development server:
   ```cmd
   npm start
   ```

2. Scan the QR code with:
   - **Android**: Use the Expo Go app
   - **iOS**: Use the Camera app and open the link in Expo Go

### Android Emulator

```cmd
npm run android
```

### iOS Simulator (macOS only)

```cmd
npm run ios
```

### Web (for testing)

```cmd
npm run web
```

## Configuration

The app connects to the backend API at `http://localhost:5000`. If you need to change this:

1. Edit `src/services/api.js`
2. Change the `API_URL` variable

For production builds, update the `extra.apiUrl` in `app.json`.

## Key Files

- **App.js** - Main navigation setup with authentication flow
- **src/context/AuthContext.js** - Authentication state management
- **src/services/api.js** - API service with axios
- **src/screens/** - All screen components

## Available Screens

### Unauthenticated Screens
- Home - Welcome page
- Login - User login
- Signup - New user registration

### Authenticated Screens
- Dashboard - Main menu with quick access
- PreCycle - Pre-cycle phase tracking
- During - Active cycle tracking
- Food - Meal recommendations
- Calendar - Cycle calendar view
- SymptomSuggestions - Health tips
- Chat - AI Chat companion

## API Endpoints Used

The app communicates with these backend endpoints:

- `POST /api/auth/login` - Login
- `POST /api/auth/signup` - Register
- `GET /api/health` - Health check
- `POST /api/chat` - Send chat message
- `GET /api/chat/history` - Get chat history
- `GET /api/cycle/active` - Get active cycle
- `POST /api/cycle/active` - Update active cycle
- `GET /api/pre-cycle` - Get pre-cycle data
- `POST /api/pre-cycle` - Update pre-cycle data

## Troubleshooting

### App won't connect to backend
- Ensure backend is running on `http://localhost:5000`
- Check if your phone/emulator can reach your computer's IP
- For Android emulator, try `http://10.0.2.2:5000`

### Clear cache and rebuild
```cmd
npm start -- --clear
```

### Install specific package
```cmd
npm install <package-name>
```

## Development Notes

- Uses React Navigation for routing
- AsyncStorage for local data persistence
- Axios for API calls
- React Context for state management

## Building for Production

For Android:
```cmd
eas build --platform android
```

For iOS:
```cmd
eas build --platform ios
```

(Requires Expo Account: https://expo.dev)

## Support

For more information about Expo, visit [Expo Documentation](https://docs.expo.dev/)
