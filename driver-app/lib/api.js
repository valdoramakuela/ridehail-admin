// lib/api.js (for both apps)
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = process.env.API_BASE_URL || 'https://ridehail-backend.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
});

// Add auth token to all requests
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
      // Redirect to login would happen in app navigation
    }
    return Promise.reject(error);
  }
);

// Authentication APIs
export const authAPI = {
  // Driver auth
  driverRegister: (data) => api.post('/driver/register', data),
  driverLogin: (data) => api.post('/driver/login', data),
  driverProfile: () => api.get('/driver/profile'),
  
  // Rider auth  
  riderRegister: (data) => api.post('/rider/register', data),
  riderLogin: (data) => api.post('/rider/login', data),
  riderProfile: () => api.get('/rider/profile'),
  
  // Push tokens
  updatePushToken: (pushToken, role) => {
    const endpoint = role === 'driver' ? '/driver/push-token' : '/rider/push-token';
    return api.post(endpoint, { pushToken });
  }
};

// Driver specific APIs
export const driverAPI = {
  // Location updates
  updateLocation: (latitude, longitude, available) => 
    api.post('/driver/location', { latitude, longitude, available }),
  
  // Verification
  submitVerification: (formData) => api.post('/verification/submit', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  // Ride management
  acceptRide: (rideId) => api.post('/ride/accept', { rideId }),
  updateRideStatus: (rideId, status) => api.patch(`/ride/${rideId}/status`, { status }),
  getActiveRides: () => api.get('/ride/active'),
  getRideHistory: (userId, page = 1) => api.get(`/ride/history/${userId}?page=${page}`)
};

// Rider specific APIs
export const riderAPI = {
  // Ride requests
  requestRide: (pickup, dropoff, estimatedFare, estimatedDistance, estimatedDuration) => 
    api.post('/ride/request', { pickup, dropoff, estimatedFare, estimatedDistance, estimatedDuration }),
  
  getActiveRides: () => api.get('/ride/active'),
  getRideHistory: (userId, page = 1) => api.get(`/ride/history/${userId}?page=${page}`)
};

// Shared APIs
export const rideAPI = {
  getRide: (rideId) => api.get(`/ride/${rideId}`),
  cancelRide: (rideId, reason) => api.post(`/ride/${rideId}/cancel`, { reason })
};

export default api;
