// screens/DriverAuthScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../lib/api';

export default function DriverAuthScreen({ navigation }) {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      Alert.alert('Error', 'Email and password are required');
      return false;
    }

    if (!isLogin) {
      if (!formData.fullName || !formData.phone) {
        Alert.alert('Error', 'All fields are required for registration');
        return false;
      }
      
      if (formData.password !== formData.confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        return false;
      }
      
      if (formData.password.length < 6) {
        Alert.alert('Error', 'Password must be at least 6 characters');
        return false;
      }
    }

    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await authAPI.driverLogin({
        email: formData.email,
        password: formData.password
      });

      if (response.data.success) {
        const { driver, token } = response.data;
        
        // Store auth data
        await AsyncStorage.setItem('authToken', token);
        await AsyncStorage.setItem('driverData', JSON.stringify(driver));
        
        Alert.alert('Success', 'Logged in successfully!');
        
        // Navigate based on verification status
        if (driver.isVerified) {
          navigation.replace('DriverHome');
        } else {
          navigation.replace('DriverVerification');
        }
      }
    } catch (error) {
      console.log('Login error:', error);
      Alert.alert('Error', error.response?.data?.error || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await authAPI.driverRegister({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });

      if (response.data.success) {
        const { driver, token } = response.data;
        
        // Store auth data
        await AsyncStorage.setItem('authToken', token);
        await AsyncStorage.setItem('driverData', JSON.stringify(driver));
        
        Alert.alert(
          'Registration Successful!', 
          'Please complete your verification to start driving.',
          [
            {
              text: 'Continue',
              onPress: () => navigation.replace('DriverVerification')
            }
          ]
        );
      }
    } catch (error) {
      console.log('Registration error:', error);
      Alert.alert('Error', error.response?.data?.error || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>RideHail Driver</Text>
        <Text style={styles.subtitle}>
          {isLogin ? 'Sign in to your account' : 'Create your driver account'}
        </Text>
      </View>

      <View style={styles.form}>
        {!isLogin && (
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={formData.fullName}
            onChangeText={(value) => handleInputChange('fullName', value)}
            autoCapitalize="words"
          />
        )}

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={formData.email}
          onChangeText={(value) => handleInputChange('email', value)}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {!isLogin && (
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            value={formData.phone}
            onChangeText={(value) => handleInputChange('phone', value)}
            keyboardType="phone-pad"
          />
        )}

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={formData.password}
          onChangeText={(value) => handleInputChange('password', value)}
          secureTextEntry
        />

        {!isLogin && (
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChangeText={(value) => handleInputChange('confirmPassword', value)}
            secureTextEntry
          />
        )}

        <TouchableOpacity 
          style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
          onPress={isLogin ? handleLogin : handleRegister}
          disabled={isLoading}
        >
          <Text style={styles.primaryButtonText}>
            {isLoading 
              ? (isLogin ? 'Signing In...' : 'Creating Account...') 
              : (isLogin ? 'Sign In' : 'Create Account')
            }
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.switchButton}
          onPress={() => setIsLogin(!isLogin)}
        >
          <Text style={styles.switchButtonText}>
            {isLogin 
              ? "Don't have an account? Sign Up" 
              : "Already have an account? Sign In"
            }
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9'
  },
  header: {
    backgroundColor: 'white',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center'
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center'
  },
  form: {
    padding: 20
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    backgroundColor: 'white',
    fontSize: 16
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 18,
    marginBottom: 15
  },
  buttonDisabled: {
    backgroundColor: '#ccc'
  },
  primaryButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold'
  },
  switchButton: {
    padding: 15
  },
  switchButtonText: {
    color: '#007AFF',
    textAlign: 'center',
    fontSize: 14
  }
});
