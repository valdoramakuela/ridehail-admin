// screens/ChatScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';
import socket from '../lib/socket';

export default function ChatScreen({ route }) {
  const { rideId } = route.params;
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.emit('joinChat', { rideId });

    socket.on('newMessage', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off('newMessage');
    };
  }, []);

  const send = () => {
    if (!message.trim()) return;
    socket.emit('sendMessage', { rideId, sender: 'rider', message }); // Change to 'driver' in driver app
    setMessage('');
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item, i) => i.toString()}
        renderItem={({ item }) => (
          <View style={[
            styles.messageBubble,
            item.sender === 'rider' ? styles.riderBubble : styles.driverBubble
          ]}>
            <Text style={styles.messageText}>{item.message}</Text>
            <Text style={styles.timeText}>{new Date(item.time).toLocaleTimeString()}</Text>
          </View>
        )}
      />
      <View style={styles.inputContainer}>
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message"
          style={styles.input}
        />
        <Button title="Send" onPress={send} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#f9f9f9' },
  messageBubble: { padding: 10, borderRadius: 8, marginBottom: 5, maxWidth: '80%' },
  riderBubble: { backgroundColor: '#007AFF', alignSelf: 'flex-end' },
  driverBubble: { backgroundColor: '#C7C7CC', alignSelf: 'flex-start' },
  messageText: { color: 'white' },
  timeText: { fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  inputContainer: { flexDirection: 'row', marginTop: 10 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 10 }
}); 
