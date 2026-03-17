import React, { useContext, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View } from 'react-native';

import { AuthContext, AuthProvider } from './src/context/AuthContext';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import PreCycleScreen from './src/screens/PreCycleScreen';
import DuringScreen from './src/screens/DuringScreen';
import FoodScreen from './src/screens/FoodScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import SymptomSuggestionsScreen from './src/screens/SymptomSuggestionsScreen';
import ChatScreen from './src/screens/ChatScreen';

const Stack = createStackNavigator();

const RootNavigator = () => {
  const { userToken, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#8b5cf6" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
        cardStyle: { backgroundColor: '#fff' },
      }}
    >
      {userToken ? (
        <>
          <Stack.Screen
            name="Dashboard"
            component={DashboardScreen}
            options={{ animationEnabled: false }}
          />
          <Stack.Screen
            name="PreCycle"
            component={PreCycleScreen}
            options={{ animationEnabled: true }}
          />
          <Stack.Screen
            name="During"
            component={DuringScreen}
            options={{ animationEnabled: true }}
          />
          <Stack.Screen
            name="Food"
            component={FoodScreen}
            options={{ animationEnabled: true }}
          />
          <Stack.Screen
            name="Calendar"
            component={CalendarScreen}
            options={{ animationEnabled: true }}
          />
          <Stack.Screen
            name="SymptomSuggestions"
            component={SymptomSuggestionsScreen}
            options={{ animationEnabled: true }}
          />
          <Stack.Screen
            name="Chat"
            component={ChatScreen}
            options={{ animationEnabled: true }}
          />
        </>
      ) : (
        <>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ animationEnabled: false }}
          />
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ animationEnabled: true }}
          />
          <Stack.Screen
            name="Signup"
            component={SignupScreen}
            options={{ animationEnabled: true }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
