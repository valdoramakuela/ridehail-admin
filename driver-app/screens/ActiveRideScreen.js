// screens/ActiveRideScreen.js
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function ActiveRideScreen({ route, navigation }) {
  const { ride } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Active Ride</Text>
      <Text>Pickup: {ride.pickup.lat.toFixed(6)}, {ride.pickup.lng.toFixed(6)}</Text>
      <Text>Destination: {ride.to}</Text>
      <Button
        title="Send Message"
        onPress={() => navigation.navigate('Chat', { rideId: ride.id })}
        color="#FF9500"
      />
      <Button
        title="End Ride"
        onPress={() => navigation.goBack()}
        color="#FF3B30"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 }
});  
