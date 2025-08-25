// screens/RideRequestScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import socket from '../lib/socket';

export default function RideRequestScreen({ route, navigation }) {
  const { pickup } = route.params;
  const [driver, setDriver] = useState(null);

  useEffect(() => {
    socket.on('rideAccepted', (data) => {
      setDriver(data.driver);
      Alert.alert('Driver Found!', `${data.driver} is on the way!`);
      navigation.navigate('ActiveRide', { driver: data.driver, rideId: data.rideId });
    });

    socket.on('rideCancelled', () => {
      Alert.alert('Ride Cancelled', 'Driver cancelled the ride.');
      navigation.goBack();
    });

    return () => {
      socket.off('rideAccepted');
      socket.off('rideCancelled');
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Finding a Driver...</Text>
      <Text>From: {pickup.latitude.toFixed(6)}, {pickup.longitude.toFixed(6)}</Text>
      {driver && <Text style={styles.driver}>✅ {driver} is coming!</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#f9f9f9' },
  title: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  driver: { marginTop: 20, fontSize: 18, color: 'green', textAlign: 'center' }
});  
