// lib/api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = 'https://ridehail-backend.onrender.com/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.log('Error getting auth token:', error);
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
      // You might want to redirect to login screen here
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  // Rider auth
  riderRegister: (data) => api.post('/rider/register', data),
  riderLogin: (data) => api.post('/rider/login', data),
  
  // Driver auth
  driverRegister: (data) => api.post('/driver/register', data),
  driverLogin: (data) => api.post('/driver/login', data),
  
  // Common
  updatePushToken: (pushToken, role) => {
    return role === 'driver' 
      ? api.post('/driver/push-token', { pushToken })
      : api.post('/rider/push-token', { pushToken });
  }
};

// Ride API
export const rideAPI = {
  // Request ride
  requestRide: (data) => api.post('/ride/request', data),
  
  // Accept ride (driver only)
  acceptRide: (rideId) => api.post('/ride/accept', { rideId }),
  
  // Update ride status (driver only)
  updateRideStatus: (rideId, status) => api.patch(`/ride/${rideId}/status`, { status }),
  
  // Get ride details
  getRide: (rideId) => api.get(`/ride/${rideId}`),
  
  // Get active rides
  getActiveRides: () => api.get('/ride/active'),
  
  // Get ride history
  getRideHistory: (userId, page = 1, limit = 20) => 
    api.get(`/ride/history/${userId}?page=${page}&limit=${limit}`),
  
  // Rate ride
  rateRide: (rideId, rating, comment = '') => 
    api.post(`/ride/${rideId}/rate`, { rating, comment }),
  
  // Cancel ride
  cancelRide: (rideId, reason = '') => 
    api.post(`/ride/${rideId}/cancel`, { reason })
};

// Driver specific API
export const driverAPI = {
  // Update location and online status
  updateLocation: (latitude, longitude, available) => 
    api.post('/driver/location', { latitude, longitude, available }),
  
  // Get profile
  getProfile: () => api.get('/driver/profile'),
  
  // Submit verification documents
  submitVerification: (formData) => api.post('/verification/submit', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  // Check verification status
  getVerificationStatus: () => api.get('/verification/status')
};

// Rider specific API
export const riderAPI = {
  // Get profile
  getProfile: () => api.get('/rider/profile'),
  
  // Get nearby drivers
  getNearbyDrivers: (latitude, longitude, radius = 5000) => 
    api.get(`/ride/nearby-drivers?latitude=${latitude}&longitude=${longitude}&radius=${radius}`)
};

export default api;
