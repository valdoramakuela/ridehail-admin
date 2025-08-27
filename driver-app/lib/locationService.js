// lib/locationService.js (Driver App only)
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { driverAPI } from './api';

const LOCATION_TASK_NAME = 'background-location-task';

class LocationTrackingService {
  constructor() {
    this.isTracking = false;
    this.lastLocationUpdate = null;
    this.watchId = null;
  }

  // Start tracking when driver goes online
  async startTracking() {
    try {
      // Check permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Location permission not granted');
      }

      const backgroundStatus = await Location.requestBackgroundPermissionsAsync();
      if (backgroundStatus.status !== 'granted') {
        console.warn('Background location permission not granted - tracking will stop when app is closed');
      }

      // Start location watching
      this.watchId = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000, // Update every 10 seconds
          distanceInterval: 20, // Update every 20 meters
        },
        (location) => {
          this.handleLocationUpdate(location);
        }
      );

      // Start background tracking if permissions allow
      if (backgroundStatus.status === 'granted') {
        await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 30000, // Background: every 30 seconds
          distanceInterval: 50, // Background: every 50 meters
          foregroundService: {
            notificationTitle: 'RideHail Driver',
            notificationBody: 'Tracking location to find nearby ride requests',
          },
        });
      }

      this.isTracking = true;
      console.log('Location tracking started');
      
    } catch (error) {
      console.error('Failed to start location tracking:', error);
      throw error;
    }
  }

  // Stop tracking when driver goes offline
  async stopTracking() {
    try {
      if (this.watchId) {
        this.watchId.remove();
        this.watchId = null;
      }

      // Stop background tracking
      const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
      if (hasStarted) {
        await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      }

      // Send offline status to backend
      if (this.lastLocationUpdate) {
        await driverAPI.updateLocation(
          this.lastLocationUpdate.coords.latitude,
          this.lastLocationUpdate.coords.longitude,
          false // available = false
        );
      }

      this.isTracking = false;
      console.log('Location tracking stopped');
      
    } catch (error) {
      console.error('Failed to stop location tracking:', error);
    }
  }

  // Handle location updates
  async handleLocationUpdate(location) {
    try {
      this.lastLocationUpdate = location;
      
      // Throttle updates - don't send if location hasn't changed much
      if (this.shouldSkipUpdate(location)) {
        return;
      }

      // Send to backend
      await driverAPI.updateLocation(
        location.coords.latitude,
        location.coords.longitude,
        true // available = true
      );

      // Store locally for offline handling
      await AsyncStorage.setItem('lastLocation', JSON.stringify({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: location.timestamp
      }));

      console.log('Location updated:', location.coords.latitude, location.coords.longitude);
      
    } catch (error) {
      console.error('Failed to handle location update:', error);
    }
  }

  // Check if we should skip this location update
  shouldSkipUpdate(newLocation) {
    if (!this.lastLocationUpdate) return false;

    const lastCoords = this.lastLocationUpdate.coords;
    const newCoords = newLocation.coords;

    // Skip if less than 10 meters difference
    const distance = this.calculateDistance(
      lastCoords.latitude,
      lastCoords.longitude,
      newCoords.latitude,
      newCoords.longitude
    );

    return distance < 0.01; // 10 meters
  }

  // Calculate distance between two points in km
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Get current location once
  async getCurrentLocation() {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      return location;
    } catch (error) {
      console.error('Failed to get current location:', error);
      throw error;
    }
  }

  // Check if currently tracking
  isCurrentlyTracking() {
    return this.isTracking;
  }
}

// Background task for location updates
TaskManager.defineTask(LOCATION_TASK_NAME, ({ data, error }) => {
  if (error) {
    console.error('Background location task error:', error);
    return;
  }

  if (data) {
    const { locations } = data;
    const location = locations[0];
    
    if (location) {
      // Handle background location update
      locationService.handleLocationUpdate(location);
    }
  }
});

// Export singleton instance
const locationService = new LocationTrackingService();
export default locationService;
