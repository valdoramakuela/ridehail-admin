// screens/ActiveRideScreen.js
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function ActiveRideScreen({ route, navigation }) {
  const { driver, rideId } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ride In Progress</Text>
      <Text>Driver: {driver}</Text>
      <Text>Ride ID: {rideId}</Text>
      <Button
        title="Open Chat"
        onPress={() => navigation.navigate('Chat', { rideId })}
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
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#f9f9f9' },
  title: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 }
});  
