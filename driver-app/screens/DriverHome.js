// screens/DriverHome.js
import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import socket from '../lib/socket';

export default function DriverHome({ navigation }) {
  const [available, setAvailable] = useState(false);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
    })();
  }, []);

  useEffect(() => {
    if (location && available) {
      socket.emit('driverUpdate', { id: 'DRV123', location, available });
    }
  }, [location, available]);

  useEffect(() => {
    socket.on('rideRequest', (ride) => {
      Alert.alert(
        'New Ride Request',
        `${ride.pickup.lat.toFixed(6)}, ${ride.pickup.lng.toFixed(6)} → ${ride.to}`,
        [
          { text: 'Decline' },
          {
            text: 'Accept',
            onPress: () => {
				navigation.navigate('Navigation', { pickup: ride.pickup });
              socket.emit('acceptRide', { rideId: ride.id, driverId: 'DRV123', driver: 'Alex' });
              navigation.navigate('ActiveRide', { ride });
            }
          }
        ]
      );
    });
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {location && (
        <MapView
          style={{ flex: 1 }}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Marker coordinate={location} title="You" pinColor="green" />
        </MapView>
      )}
      <View style={styles.buttonContainer}>
        <Button
          title={available ? 'Go Offline' : 'Go Online'}
          onPress={() => setAvailable(!available)}
          color={available ? '#FF3B30' : '#34C759'}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: { padding: 10, backgroundColor: 'white' }
});  
