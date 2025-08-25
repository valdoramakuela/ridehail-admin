// screens/LoginScreen.js
import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation }) {
  const [phone, setPhone] = useState('');

  const login = async () => {
    if (!phone) {
      Alert.alert("Phone Required", "Please enter your phone number");
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/driver/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });

      const data = await res.json();
      if (data.token) {
        await AsyncStorage.setItem('driverToken', data.token);
        navigation.navigate('Home');
      } else {
        Alert.alert('Error', data.error);
      }
    } catch (err) {
      Alert.alert('Network Error', 'Could not connect to server');
    }
  };
  const token = (await Notifications.getExpoPushTokenAsync()).data;
await AsyncStorage.setItem('driverToken', token);

// Send to backend
await fetch('http://localhost:5000/api/driver/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ driverId: 'DRV123', token })
});

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Driver Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      <Button title="Login" onPress={login} color="#007AFF" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#f9f9f9' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 5 }
});  
