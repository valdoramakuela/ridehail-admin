// lib/socket.js (for both apps)
import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SOCKET_URL = process.env.SOCKET_URL || 'https://ridehail-backend.onrender.com';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  // Initialize socket connection
  connect() {
    try {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
      });

      this.setupEventListeners();
      
    } catch (error) {
      console.error('Socket connection error:', error);
    }
  }

  // Setup basic socket event listeners
  setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from server:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.log('Max reconnection attempts reached');
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('Reconnected after', attemptNumber, 'attempts');
    });
  }

  // Driver-specific event listeners
  setupDriverListeners(callbacks = {}) {
    if (!this.socket) return;

    // Listen for ride requests
    this.socket.on('rideRequest', (rideData) => {
      console.log('New ride request received:', rideData);
      if (callbacks.onRideRequest) {
        callbacks.onRideRequest(rideData);
      }
    });

    // Listen for ride cancellations
    this.socket.on('rideCancelled', (data) => {
      console.log('Ride cancelled:', data);
      if (callbacks.onRideCancelled) {
        callbacks.onRideCancelled(data);
      }
    });
  }

  // Rider-specific event listeners  
  setupRiderListeners(callbacks = {}) {
    if (!this.socket) return;

    // Listen for ride acceptance
    this.socket.on('rideAccepted', (data) => {
      console.log('Ride accepted:', data);
      if (callbacks.onRideAccepted) {
        callbacks.onRideAccepted(data);
      }
    });

    // Listen for ride status updates
    this.socket.on('rideStatusUpdate', (data) => {
      console.log('Ride status update:', data);
      if (callbacks.onRideStatusUpdate) {
        callbacks.onRideStatusUpdate(data);
      }
    });

    // Listen for ride cancellations
    this.socket.on('rideCancelled', (data) => {
      console.log('Ride cancelled:', data);
      if (callbacks.onRideCancelled) {
        callbacks.onRideCancelled(data);
      }
    });
  }

  // Join user-specific room for targeted messages
  async joinUserRoom() {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData && this.socket) {
        const user = JSON.parse(userData);
        this.socket.emit('joinRoom', user.id);
        console.log('Joined user room:', user.id);
      }
    } catch (error) {
      console.error('Error joining user room:', error);
    }
  }

  // Send driver location update (for real-time tracking)
  updateDriverLocation(location) {
    if (this.socket && this.isConnected) {
      this.socket.emit('driverLocationUpdate', {
        latitude: location.latitude,
        longitude: location.longitude,
        timestamp: Date.now()
      });
    }
  }

  // Send chat message
  sendChatMessage(rideId, message, senderRole) {
    if (this.socket && this.isConnected) {
      this.socket.emit('sendMessage', {
        rideId,
        message,
        sender: senderRole,
        timestamp: Date.now()
      });
    }
  }

  // Listen for chat messages
  onChatMessage(callback) {
    if (this.socket) {
      this.socket.on('newMessage', callback);
    }
  }

  // Remove specific event listener
  off(eventName, callback) {
    if (this.socket) {
      this.socket.off(eventName, callback);
    }
  }

  // Remove all listeners
  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Check connection status
  isSocketConnected() {
    return this.isConnected && this.socket?.connected;
  }

  // Get socket instance for custom events
  getSocket() {
    return this.socket;
  }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;
