import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';

const HomeScreen = ({ navigation }) => {
  const authContext = useContext(AuthContext);

  useEffect(() => {
    if (authContext?.state?.userToken) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Dashboard' }],
      });
    }
  }, [authContext?.state?.userToken, navigation]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerSection}>
        <Text style={styles.appName}>🌺 EUPHORIA</Text>
        <Text style={styles.tagline}>Your Wellness Companion</Text>
      </View>

      <View style={styles.heroSection}>
        <Text style={styles.heroTitle}>
          Welcome to{'\n'}
          <Text style={styles.gradientText}>EUPHORIA</Text>
        </Text>
        <Text style={styles.heroSubtitle}>
          Your next-generation menstrual health platform
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={() => navigation.navigate('Signup')}
        >
          <Text style={styles.primaryButtonText}>Get Started</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.secondaryButtonText}>Login</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.featuresSection}>
        <Text style={styles.featuresTitle}>✨ Features</Text>
        <Text style={styles.featureItem}>📅 Cycle Tracking</Text>
        <Text style={styles.featureItem}>❤️ Health Monitoring</Text>
        <Text style={styles.featureItem}>🍎 Nutrition Tips</Text>
        <Text style={styles.featureItem}>💬 AI Chat Support</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#f5f5f5',
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#8b5cf6',
    marginBottom: 4,
  },
  tagline: {
    fontSize: 12,
    color: '#666',
  },
  heroSection: {
    paddingHorizontal: 20,
    paddingVertical: 60,
    backgroundColor: '#fff',
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    lineHeight: 44,
  },
  gradientText: {
    color: '#8b5cf6',
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#8b5cf6',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  secondaryButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  featuresSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  featureItem: {
    fontSize: 16,
    color: '#555',
    marginBottom: 12,
    lineHeight: 24,
  },
});

export default HomeScreen;
