// screens/NavigationScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { rideAPI } from '../lib/api';
import socket from '../lib/socket';

export default function NavigationScreen({ route, navigation }) {
  const { ride, pickup } = route.params;
  const [currentLocation, setCurrentLocation] = useState(null);
  const [region, setRegion] = useState(null);
  const [directions, setDirections] = useState([]);
  const [rideStatus, setRideStatus] = useState(ride?.status || 'accepted');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUserData();
    requestLocationPermission();
    setupSocketListeners();
    
    return () => {
      socket.off('rideCancelled');
      socket.off('rideStatusUpdate');
    };
  }, []);

  const loadUserData = async () => {
    try {
      const driverData = await AsyncStorage.getItem('driverData');
      if (driverData) {
        setUser(JSON.parse(driverData));
      }
    } catch (error) {
      console.log('Error loading user data:', error);
    }
  };

  const requestLocationPermission = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Location permission is required for navigation');
        return;
      }

      let loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      const current = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude
      };
      
      setCurrentLocation(current);

      // Set map region to show both driver and pickup
      setRegion({
        latitude: (current.latitude + pickup.lat) / 2,
        longitude: (current.longitude + pickup.lng) / 2,
        latitudeDelta: Math.abs(current.latitude - pickup.lat) * 2 + 0.01,
        longitudeDelta: Math.abs(current.longitude - pickup.lng) * 2 + 0.01,
      });

      // Start location tracking
      Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000, // Update every 5 seconds
          distanceInterval: 10, // Update every 10 meters
        },
        (newLocation) => {
          setCurrentLocation({
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude
          });
        }
      );

      // Get directions to pickup
      fetchDirections(current, { lat: pickup.lat, lng: pickup.lng });
      
    } catch (error) {
      console.log('Location error:', error);
    }
  };

  const setupSocketListeners = () => {
    socket.on('rideCancelled', (data) => {
      if (data.rideId === ride._id) {
        Alert.alert(
          'Ride Cancelled',
          'The rider has cancelled this ride.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('DriverHome')
            }
          ]
        );
      }
    });

    socket.on('rideStatusUpdate', (data) => {
      if (data.rideId === ride._id) {
        setRideStatus(data.status);
      }
    });
  };

  const fetchDirections = async (origin, destination) => {
    try {
      const API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY'; // Add to your .env
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.lat},${destination.lng}&key=${API_KEY}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const points = data.routes[0].overview_polyline.points;
        const decoded = decodePolyline(points);
        setDirections(decoded);
      }
    } catch (error) {
      console.log('Directions error:', error);
    }
  };

  const decodePolyline = (encoded) => {
    let poly = [];
    let index = 0, len = encoded.length;
    let lat = 0, lng = 0;

    while (index < len) {
      let b, shift = 0, result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += dlng;

      poly.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
    }
    return poly;
  };

  const updateRideStatus = async (newStatus) => {
    setIsLoading(true);
    try {
      const response = await rideAPI.updateRideStatus(ride._id, newStatus);
      
      if (response.data.success) {
        setRideStatus(newStatus);
        
        if (newStatus === 'arrived') {
          Alert.alert('Status Updated', 'Rider has been notified you arrived.');
        } else if (newStatus === 'started') {
          Alert.alert('Ride Started', 'Navigate to destination.');
          // Here you could fetch directions to destination
          if (ride.dropoff) {
            fetchDirections(currentLocation, ride.dropoff);
          }
        } else if (newStatus === 'completed') {
          Alert.alert(
            'Ride Completed!', 
            'The ride has been completed successfully.',
            [
              {
                text: 'OK',
                onPress: () => navigation.navigate('DriverHome')
              }
            ]
          );
        }
      }
    } catch (error) {
      console.log('Status update error:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to update status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmergency = () => {
    Alert.alert(
      'Emergency',
      'Contact emergency services or RideHail support?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Emergency Services', onPress: () => {} }, // Add phone call functionality
        { text: 'RideHail Support', onPress: () => {} } // Add support contact
      ]
    );
  };

  const getStatusActions = () => {
    switch (rideStatus) {
      case 'accepted':
        return (
          <TouchableOpacity 
            style={styles.statusButton}
            onPress={() => updateRideStatus('arrived')}
            disabled={isLoading}
          >
            <Text style={styles.statusButtonText}>
              {isLoading ? 'Updating...' : 'I Have Arrived'}
            </Text>
          </TouchableOpacity>
        );
      
      case 'arrived':
        return (
          <TouchableOpacity 
            style={styles.statusButton}
            onPress={() => updateRideStatus('started')}
            disabled={isLoading}
          >
            <Text style={styles.statusButtonText}>
              {isLoading ? 'Starting...' : 'Start Ride'}
            </Text>
          </TouchableOpacity>
        );
      
      case 'started':
        return (
          <TouchableOpacity 
            style={[styles.statusButton, { backgroundColor: '#34C759' }]}
            onPress={() => updateRideStatus('completed')}
            disabled={isLoading}
          >
            <Text style={styles.statusButtonText}>
              {isLoading ? 'Completing...' : 'Complete Ride'}
            </Text>
          </TouchableOpacity>
        );
      
      default:
        return null;
    }
  };

  if (!region || !currentLocation) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading navigation...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Status Bar */}
      <View style={styles.statusBar}>
        <Text style={styles.statusTitle}>
          {rideStatus === 'accepted' ? 'Navigate to Pickup' : 
           rideStatus === 'arrived' ? 'Passenger Pickup' :
           rideStatus === 'started' ? 'Ride in Progress' : 'Ride Status'}
        </Text>
        <Text style={styles.statusSubtitle}>
          {pickup.address || `${pickup.lat.toFixed(4)}, ${pickup.lng.toFixed(4)}`}
        </Text>
      </View>

      {/* Map */}
      <MapView
        style={styles.map}
        region={region}
        showsUserLocation
        followsUserLocation
      >
        {/* Driver location */}
        <Marker 
          coordinate={currentLocation} 
          title="Your Location" 
          pinColor="blue"
        />
        
        {/* Pickup location */}
        <Marker 
          coordinate={{ latitude: pickup.lat, longitude: pickup.lng }} 
          title="Pickup Location" 
          pinColor="green"
        />
        
        {/* Destination (if available) */}
        {ride.dropoff && (
          <Marker 
            coordinate={{ latitude: ride.dropoff.lat, longitude: ride.dropoff.lng }} 
            title="Destination" 
            pinColor="red"
          />
        )}

        {/* Route polyline */}
        {directions.length > 0 && (
          <Polyline 
            coordinates={directions} 
            strokeColor="#007AFF" 
            strokeWidth={4}
          />
        )}
      </MapView>

      {/* Bottom Action Panel */}
      <View style={styles.actionPanel}>
        <View style={styles.rideInfo}>
          <Text style={styles.rideInfoText}>
            Ride ID: {ride._id?.slice(-6) || 'N/A'}
          </Text>
          <Text style={styles.rideInfoText}>
            Status: {rideStatus.toUpperCase()}
          </Text>
        </View>

        <View style={styles.actionButtons}>
          {getStatusActions()}
          
          <TouchableOpacity 
            style={styles.chatButton}
            onPress={() => navigation.navigate('Chat', { rideId: ride._id })}
          >
            <Text style={styles.chatButtonText}>Message Rider</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.emergencyContainer}>
          <TouchableOpacity 
            style={styles.emergencyButton}
            onPress={handleEmergency}
          >
            <Text style={styles.emergencyButtonText}>Emergency</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9'
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16
  },
  statusBar: {
    backgroundColor: 'white',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  statusSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4
  },
  map: {
    flex: 1
  },
  actionPanel: {
    backgroundColor: 'white',
    padding: 20,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: '#eee'
  },
  rideInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15
  },
  rideInfoText: {
    fontSize: 14,
    color: '#666'
  },
  actionButtons: {
    marginBottom: 15
  },
  statusButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 18,
    alignItems: 'center',
    marginBottom: 10
  },
  statusButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  chatButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center'
  },
  chatButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600'
  },
  emergencyContainer: {
    alignItems: 'center'
  },
  emergencyButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24
  },
  emergencyButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold'
  }
});
