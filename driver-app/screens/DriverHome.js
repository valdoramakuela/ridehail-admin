// screens/DriverHome.js
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, Switch } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { driverAPI, rideAPI } from '../lib/api';
import socket from '../lib/socket';
import { registerForPushNotificationsAsync } from '../lib/fcm';

export default function DriverHome({ navigation }) {
  const [user, setUser] = useState(null);
  const [location, setLocation] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [activeRides, setActiveRides] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadDriverData();
    requestLocationPermission();
    setupPushNotifications();
    setupSocketListeners();
    
    return () => {
      socket.off('rideRequest');
      socket.off('rideCancelled');
    };
  }, []);

  useEffect(() => {
    // Update location when online status changes
    if (location && user) {
      updateDriverStatus();
    }
  }, [isOnline, location]);

  const loadDriverData = async () => {
    try {
      const driverData = await AsyncStorage.getItem('driverData');
      if (driverData) {
        const driver = JSON.parse(driverData);
        setUser(driver);
        
        // Check if driver is verified
        if (!driver.isVerified) {
          Alert.alert(
            'Verification Required',
            'You need to complete verification before you can start driving.',
            [
              {
                text: 'Complete Verification',
                onPress: () => navigation.replace('DriverVerification')
              }
            ]
          );
        }
      } else {
        navigation.replace('DriverAuth');
      }
    } catch (error) {
      console.log('Error loading driver data:', error);
      navigation.replace('DriverAuth');
    }
  };

  const requestLocationPermission = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'Location access is required to receive ride requests and navigate to passengers.'
        );
        return;
      }

      // Get current location
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation(loc.coords);

      // Start watching location if online
      Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000, // Update every 10 seconds
          distanceInterval: 50, // Update every 50 meters
        },
        (newLocation) => {
          setLocation(newLocation.coords);
        }
      );
    } catch (error) {
      console.log('Location error:', error);
    }
  };

  const setupPushNotifications = async () => {
    try {
      const token = await registerForPushNotificationsAsync();
      if (token && user) {
        await authAPI.updatePushToken(token, 'driver');
      }
    } catch (error) {
      console.log('Error setting up push notifications:', error);
    }
  };

  const setupSocketListeners = () => {
    socket.on('rideRequest', (rideData) => {
      if (!isOnline || !user?.isVerified) return;
      
      console.log('New ride request received:', rideData);
      
      Alert.alert(
        'New Ride Request',
        `Pickup: ${rideData.pickup.address || 'Location'}\nEstimated Fare: R${rideData.estimatedFare || 'TBD'}`,
        [
          { text: 'Decline', style: 'cancel' },
          {
            text: 'Accept',
            onPress: () => acceptRide(rideData.rideId)
          }
        ]
      );
    });

    socket.on('rideCancelled', (data) => {
      Alert.alert('Ride Cancelled', 'The rider has cancelled the ride.');
      loadActiveRides(); // Refresh active rides
    });
  };

  const updateDriverStatus = async () => {
    if (!location || !user) return;
    
    try {
      await driverAPI.updateLocation(
        location.latitude,
        location.longitude,
        isOnline
      );
      
      // Also emit to Socket.IO for real-time updates
      socket.emit('driverUpdate', {
        id: user.id,
        location: {
          lat: location.latitude,
          lng: location.longitude
        },
        available: isOnline
      });
    } catch (error) {
      console.log('Error updating driver status:', error);
    }
  };

  const toggleOnlineStatus = async () => {
    if (!user?.isVerified) {
      Alert.alert('Verification Required', 'You must be verified before going online.');
      return;
    }

    if (!location) {
      Alert.alert('Location Required', 'Location access is required to go online.');
      return;
    }

    setIsOnline(!isOnline);
  };

  const acceptRide = async (rideId) => {
    setIsLoading(true);
    try {
      const response = await rideAPI.acceptRide(rideId);
      
      if (response.data.success) {
        Alert.alert('Ride Accepted!', 'Navigate to pickup location.');
        navigation.navigate('Navigation', { 
          ride: response.data.ride,
          pickup: response.data.ride.pickup
        });
      }
    } catch (error) {
      console.log('Accept ride error:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to accept ride');
    } finally {
      setIsLoading(false);
    }
  };

  const loadActiveRides = async () => {
    try {
      const response = await rideAPI.getActiveRides();
      if (response.data.success) {
        setActiveRides(response.data.rides);
      }
    } catch (error) {
      console.log('Error loading active rides:', error);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          onPress: async () => {
            await AsyncStorage.clear();
            navigation.replace('DriverAuth');
          }
        }
      ]
    );
  };

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome back!</Text>
          <Text style={styles.driverName}>{user.fullName}</Text>
          <Text style={styles.statusText}>
            Status: {user.isVerified ? 'Verified' : 'Pending Verification'}
          </Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Online/Offline Toggle */}
      <View style={styles.statusContainer}>
        <View style={styles.statusToggle}>
          <Text style={styles.statusLabel}>
            {isOnline ? 'Online - Ready for rides' : 'Offline'}
          </Text>
          <Switch
            value={isOnline}
            onValueChange={toggleOnlineStatus}
            trackColor={{ false: '#767577', true: '#34C759' }}
            thumbColor={isOnline ? '#ffffff' : '#f4f3f4'}
            disabled={!user.isVerified}
          />
        </View>
        {!user.isVerified && (
          <Text style={styles.verificationWarning}>
            Complete verification to go online
          </Text>
        )}
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        {location ? (
          <MapView
            style={styles.map}
            region={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            showsUserLocation
            followsUserLocation
          >
            <Marker 
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude
              }} 
              title="Your Location" 
              pinColor={isOnline ? "green" : "gray"}
            />
          </MapView>
        ) : (
          <View style={styles.loadingMap}>
            <Text>Loading map...</Text>
          </View>
        )}
      </View>

      {/* Stats and Actions */}
      <View style={styles.bottomPanel}>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.rating || 5.0}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.totalRides || 0}</Text>
            <Text style={styles.statLabel}>Total Rides</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{activeRides.length}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('RideHistory')}
          >
            <Text style={styles.actionButtonText}>Ride History</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Earnings')}
          >
            <Text style={styles.actionButtonText}>Earnings</Text>
          </TouchableOpacity>
        </View>

        {isOnline && (
          <View style={styles.onlineIndicator}>
            <Text style={styles.onlineText}>You're online and ready for rides!</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: {
    backgroundColor: 'white',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  welcomeText: {
    fontSize: 16,
    color: '#666'
  },
  driverName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333'
  },
  statusText: {
    fontSize: 14,
    color: user?.isVerified ? '#34C759' : '#FF9500',
    marginTop: 2
  },
  logoutButton: {
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 6
  },
  logoutText: {
    color: '#FF3B30',
    fontWeight: '600'
  },
  statusContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  statusToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  statusLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333'
  },
  verificationWarning: {
    fontSize: 14,
    color: '#FF9500',
    marginTop: 8,
    textAlign: 'center'
  },
  mapContainer: {
    flex: 1
  },
  map: {
    flex: 1
  },
  loadingMap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0'
  },
  bottomPanel: {
    backgroundColor: 'white',
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: '#eee'
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20
  },
  statItem: {
    alignItems: 'center'
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333'
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 15,
    marginHorizontal: 5,
    borderRadius: 8,
    alignItems: 'center'
  },
  actionButtonText: {
    color: '#007AFF',
    fontWeight: '600'
  },
  onlineIndicator: {
    backgroundColor: '#e8f5e8',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  onlineText: {
    color: '#2d7d2d',
    fontWeight: '600'
  }
});
