// screens/RideRequestScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, Alert, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { rideAPI } from '../lib/api';
import socket from '../lib/socket';

export default function RideRequestScreen({ route, navigation }) {
  const { ride, pickup, dropoff } = route.params;
  const [rideStatus, setRideStatus] = useState(ride?.status || 'requested');
  const [driver, setDriver] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUserData();
    setupSocketListeners();
    
    return () => {
      socket.off('rideAccepted');
      socket.off('rideStatusUpdate');
      socket.off('rideCancelled');
    };
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.log('Error loading user data:', error);
    }
  };

  const setupSocketListeners = () => {
    // Listen for ride acceptance
    socket.on('rideAccepted', (data) => {
      if (data.rideId === ride._id) {
        console.log('Ride accepted by driver:', data.driver);
        setDriver(data.driver);
        setRideStatus('accepted');
        
        Alert.alert(
          'Driver Found!', 
          `${data.driver.name} is on the way to pick you up!\nRating: ${data.driver.rating}/5`,
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('ActiveRide', { 
                ride: ride,
                driver: data.driver,
                rideId: data.rideId
              })
            }
          ]
        );
      }
    });

    // Listen for status updates
    socket.on('rideStatusUpdate', (data) => {
      if (data.rideId === ride._id) {
        console.log('Ride status updated:', data.status);
        setRideStatus(data.status);
        
        if (data.status === 'arrived') {
          Alert.alert('Driver Arrived', 'Your driver has arrived at the pickup location!');
        } else if (data.status === 'started') {
          Alert.alert('Ride Started', 'Your ride has begun. Enjoy your trip!');
        }
      }
    });

    // Listen for ride cancellation
    socket.on('rideCancelled', (data) => {
      if (data.rideId === ride._id) {
        console.log('Ride cancelled:', data);
        Alert.alert(
          'Ride Cancelled', 
          `Your ride was cancelled by the ${data.cancelledBy}.`,
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Home')
            }
          ]
        );
      }
    });
  };

  const cancelRide = async () => {
    Alert.alert(
      'Cancel Ride',
      'Are you sure you want to cancel this ride?',
      [
        {
          text: 'No',
          style: 'cancel'
        },
        {
          text: 'Yes',
          onPress: performCancelRide
        }
      ]
    );
  };

  const performCancelRide = async () => {
    setIsLoading(true);
    try {
      const response = await rideAPI.cancelRide(ride._id, 'Rider cancelled');
      
      if (response.data.success) {
        Alert.alert('Ride Cancelled', 'Your ride has been cancelled successfully.');
        navigation.navigate('Home');
      }
    } catch (error) {
      console.log('Cancel ride error:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to cancel ride');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshRideStatus = async () => {
    setIsLoading(true);
    try {
      const response = await rideAPI.getRide(ride._id);
      
      if (response.data.success) {
        const updatedRide = response.data.ride;
        setRideStatus(updatedRide.status);
        
        if (updatedRide.driverId && !driver) {
          setDriver({
            id: updatedRide.driverId._id,
            name: updatedRide.driverId.fullName,
            phone: updatedRide.driverId.phone,
            rating: updatedRide.driverId.rating
          });
        }
        
        if (updatedRide.status === 'accepted' && driver) {
          navigation.navigate('ActiveRide', { 
            ride: updatedRide,
            driver: driver,
            rideId: ride._id
          });
        }
      }
    } catch (error) {
      console.log('Refresh status error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusMessage = () => {
    switch (rideStatus) {
      case 'requested':
        return 'Looking for nearby drivers...';
      case 'accepted':
        return 'Driver found! Preparing your ride...';
      case 'arrived':
        return 'Driver has arrived at pickup location';
      case 'started':
        return 'Ride in progress';
      case 'completed':
        return 'Ride completed';
      case 'cancelled':
        return 'Ride cancelled';
      default:
        return 'Processing your request...';
    }
  };

  const getStatusColor = () => {
    switch (rideStatus) {
      case 'requested':
        return '#007AFF';
      case 'accepted':
      case 'arrived':
      case 'started':
        return '#34C759';
      case 'completed':
        return '#34C759';
      case 'cancelled':
        return '#FF3B30';
      default:
        return '#007AFF';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Ride Request</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.statusText}>{rideStatus.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.statusMessage}>{getStatusMessage()}</Text>
        
        {isLoading && (
          <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
        )}

        <View style={styles.rideDetails}>
          <View style={styles.locationRow}>
            <Text style={styles.locationLabel}>From:</Text>
            <Text style={styles.locationText}>
              {pickup.address || `${pickup.lat.toFixed(6)}, ${pickup.lng.toFixed(6)}`}
            </Text>
          </View>
          
          <View style={styles.locationRow}>
            <Text style={styles.locationLabel}>To:</Text>
            <Text style={styles.locationText}>
              {dropoff.address || `${dropoff.lat.toFixed(6)}, ${dropoff.lng.toFixed(6)}`}
            </Text>
          </View>
          
          {ride.fare?.estimated && (
            <View style={styles.locationRow}>
              <Text style={styles.locationLabel}>Estimated Fare:</Text>
              <Text style={styles.fareText}>R{ride.fare.estimated}</Text>
            </View>
          )}
        </View>

        {driver && (
          <View style={styles.driverInfo}>
            <Text style={styles.driverTitle}>Your Driver</Text>
            <Text style={styles.driverName}>{driver.name}</Text>
            <Text style={styles.driverRating}>Rating: {driver.rating}/5</Text>
            <Text style={styles.driverPhone}>Phone: {driver.phone}</Text>
          </View>
        )}

        {rideStatus === 'requested' && (
          <View style={styles.waitingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.waitingText}>
              Searching for available drivers nearby...
            </Text>
            <Text style={styles.waitingSubtext}>
              This usually takes 1-3 minutes
            </Text>
          </View>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={refreshRideStatus}
          disabled={isLoading}
        >
          <Text style={styles.refreshButtonText}>Refresh Status</Text>
        </TouchableOpacity>

        {['requested', 'accepted'].includes(rideStatus) && (
          <TouchableOpacity 
            style={[styles.cancelButton, isLoading && styles.buttonDisabled]}
            onPress={cancelRide}
            disabled={isLoading}
          >
            <Text style={styles.cancelButtonText}>
              {isLoading ? 'Cancelling...' : 'Cancel Ride'}
            </Text>
          </TouchableOpacity>
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
  header: {
    backgroundColor: 'white',
    padding: 20,
    paddingTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  title: { 
    fontSize: 20, 
    fontWeight: 'bold',
    color: '#333'
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold'
  },
  content: {
    flex: 1,
    padding: 20
  },
  statusMessage: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: '#333',
    marginBottom: 20
  },
  loader: {
    marginVertical: 20
  },
  rideDetails: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#eee'
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  locationLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    flex: 2,
    textAlign: 'right'
  },
  fareText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    flex: 1,
    textAlign: 'right'
  },
  driverInfo: {
    backgroundColor: '#e8f5e8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#c6e6c6'
  },
  driverTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d7d2d',
    marginBottom: 8
  },
  driverName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4
  },
  driverRating: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4
  },
  driverPhone: {
    fontSize: 14,
    color: '#666'
  },
  waitingContainer: {
    alignItems: 'center',
    padding: 40
  },
  waitingText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8
  },
  waitingSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center'
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: 40
  },
  refreshButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 8,
    padding: 15,
    marginBottom: 12
  },
  refreshButtonText: {
    color: '#007AFF',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600'
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    padding: 15
  },
  cancelButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold'
  },
  buttonDisabled: {
    backgroundColor: '#ccc'
  }
});
