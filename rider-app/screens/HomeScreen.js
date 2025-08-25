// screens/HomeScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import socket from '../lib/socket';
import { registerForPushNotificationsAsync } from '../lib/fcm';

export default function HomeScreen({ navigation }) {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location denied');
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
      registerForPushNotificationsAsync();
    })();
  }, []);

  const requestRide = () => {
    if (!location) {
      Alert.alert("Location", "Please get your location first");
      return;
    }

    socket.emit('rideRequest', {
      riderId: 'RDR123',
      pickup: location,
      to: 'City Center'
    });

    navigation.navigate('RideRequest', { pickup: location });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>HomeAsdf</Text>
      {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}
      {location && (
        <Text style={styles.location}>
          📍 {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
        </Text>
      )}
      <Button title="Request Ride" onPress={requestRide} color="#007AFF" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#f9f9f9' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  error: { color: 'red', marginBottom: 10 },
  location: { textAlign: 'center', marginBottom: 20, color: '#555' }
});  
