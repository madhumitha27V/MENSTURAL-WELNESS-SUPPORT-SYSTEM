import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { authService } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = React.useReducer(
    (prevState, action) => {
      switch (action.type) {
        case 'RESTORE_TOKEN':
          return {
            ...prevState,
            userToken: action.token,
            user: action.user,
            isLoading: false,
          };
        case 'SIGN_IN':
          return {
            ...prevState,
            isSignout: false,
            userToken: action.token,
            user: action.user,
          };
        case 'SIGN_OUT':
          return {
            ...prevState,
            isSignout: true,
            userToken: null,
            user: null,
          };
        case 'SIGN_UP':
          return {
            ...prevState,
            isSignout: false,
            userToken: action.token,
            user: action.user,
          };
      }
    },
    {
      isLoading: true,
      isSignout: false,
      userToken: null,
      user: null,
    }
  );

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const userStr = await AsyncStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;

        if (token && user) {
          dispatch({ type: 'RESTORE_TOKEN', token, user });
        } else {
          dispatch({ type: 'RESTORE_TOKEN', token: null, user: null });
        }
      } catch (e) {
        console.error('Failed to restore token', e);
        dispatch({ type: 'RESTORE_TOKEN', token: null, user: null });
      }
    };

    bootstrapAsync();
  }, []);

  const authContext = {
    signIn: async (phone, password) => {
      try {
        const response = await authService.login(phone, password);
        const { token, user } = response.data;

        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('user', JSON.stringify(user));

        dispatch({
          type: 'SIGN_IN',
          token,
          user,
        });

        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.message || 'Login failed',
        };
      }
    },

    signUp: async (name, phone, password) => {
      try {
        const response = await authService.signup(name, phone, password);
        const { token, user } = response.data;

        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('user', JSON.stringify(user));

        dispatch({
          type: 'SIGN_UP',
          token,
          user,
        });

        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.message || 'Signup failed',
        };
      }
    },

    signOut: async () => {
      try {
        await authService.logout();
        dispatch({ type: 'SIGN_OUT' });
      } catch (error) {
        console.error('Logout error:', error);
      }
    },

    isLoading: state.isLoading,
    isSignout: state.isSignout,
    userToken: state.userToken,
    user: state.user,
  };

  return (
    <AuthContext.Provider value={authContext}>
      {children}
    </AuthContext.Provider>
  );
};
