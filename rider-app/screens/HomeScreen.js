// screens/HomeScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { authAPI, rideAPI } from '../lib/api';
import { registerForPushNotificationsAsync } from '../lib/fcm';
import socket from '../lib/socket';

export default function HomeScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [location, setLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });

  useEffect(() => {
    checkUserAuth();
    requestLocationPermission();
    setupPushNotifications();
  }, []);

  const checkUserAuth = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        setUser(JSON.parse(userData));
      } else {
        setShowLogin(true);
      }
    } catch (error) {
      console.log('Error checking auth:', error);
      setShowLogin(true);
    }
  };

  const requestLocationPermission = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Location permission is required to use this app');
        return;
      }

      let loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation(loc.coords);
    } catch (error) {
      console.log('Error getting location:', error);
      Alert.alert('Location Error', 'Unable to get your location');
    }
  };

  const setupPushNotifications = async () => {
    const token = await registerForPushNotificationsAsync();
    if (token && user) {
      try {
        await authAPI.updatePushToken(token, 'rider');
      } catch (error) {
        console.log('Error updating push token:', error);
      }
    }
  };

  const handleLogin = async () => {
    if (!loginData.email || !loginData.password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authAPI.riderLogin(loginData);
      
      if (response.data.success) {
        const { rider, token } = response.data;
        
        // Store auth data
        await AsyncStorage.setItem('authToken', token);
        await AsyncStorage.setItem('userData', JSON.stringify(rider));
        
        setUser(rider);
        setShowLogin(false);
        
        // Setup push notifications after login
        setupPushNotifications();
        
        Alert.alert('Success', 'Logged in successfully!');
      }
    } catch (error) {
      console.log('Login error:', error);
      Alert.alert('Error', error.response?.data?.error || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('userData');
    setUser(null);
    setShowLogin(true);
  };

  const requestRide = async () => {
    if (!location) {
      Alert.alert("Location Required", "Please enable location to request a ride");
      return;
    }

    if (!user) {
      Alert.alert("Authentication Required", "Please login to request a ride");
      return;
    }

    setIsLoading(true);
    try {
      // For demo purposes, using fixed destination - in real app, user would select
      const dropoffLocation = {
        lat: location.latitude + 0.01,
        lng: location.longitude + 0.01,
        address: 'Destination Address'
      };

      const rideData = {
        pickup: {
          lat: location.latitude,
          lng: location.longitude,
          address: 'Current Location'
        },
        dropoff: dropoffLocation,
        estimatedFare: 50,
        estimatedDistance: 2.5,
        estimatedDuration: 15
      };

      const response = await rideAPI.requestRide(rideData);
      
      if (response.data.success) {
        Alert.alert('Ride Requested', 'Looking for nearby drivers...');
        navigation.navigate('RideRequest', { 
          ride: response.data.ride,
          pickup: rideData.pickup,
          dropoff: rideData.dropoff
        });
      }
    } catch (error) {
      console.log('Ride request error:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to request ride');
    } finally {
      setIsLoading(false);
    }
  };

  // Login form
  if (showLogin) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>RideHail Rider</Text>
        <Text style={styles.subtitle}>Login to continue</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={loginData.email}
          onChangeText={(text) => setLoginData({...loginData, email: text})}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={loginData.password}
          onChangeText={(text) => setLoginData({...loginData, password: text})}
          secureTextEntry
        />
        
        <TouchableOpacity 
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Logging in...' : 'Login'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.linkButton}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.linkText}>Don't have an account? Register</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Main home screen
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {user?.fullName}!</Text>
      
      {location && (
        <View style={styles.locationContainer}>
          <Text style={styles.locationLabel}>Current Location:</Text>
          <Text style={styles.location}>
            {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
          </Text>
        </View>
      )}

      <TouchableOpacity 
        style={[styles.requestButton, (!location || isLoading) && styles.buttonDisabled]}
        onPress={requestRide}
        disabled={!location || isLoading}
      >
        <Text style={styles.requestButtonText}>
          {isLoading ? 'Requesting...' : 'Request Ride'}
        </Text>
      </TouchableOpacity>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('RideHistory')}
        >
          <Text style={styles.secondaryButtonText}>Ride History</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={handleLogout}
        >
          <Text style={styles.secondaryButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    justifyContent: 'center', 
    backgroundColor: '#f9f9f9' 
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    marginBottom: 10,
    color: '#333'
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 30
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    backgroundColor: 'white',
    fontSize: 16
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15
  },
  buttonDisabled: {
    backgroundColor: '#ccc'
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600'
  },
  linkButton: {
    padding: 10
  },
  linkText: {
    color: '#007AFF',
    textAlign: 'center',
    fontSize: 14
  },
  locationContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#eee'
  },
  locationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5
  },
  location: { 
    fontSize: 14,
    color: '#666'
  },
  requestButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 18,
    marginBottom: 20
  },
  requestButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold'
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    padding: 12
  },
  secondaryButtonText: {
    color: '#007AFF',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600'
  }
});
