  
// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens
import DriverAuthScreen from './screens/DriverAuthScreen';
import DriverVerificationScreen from './screens/DriverVerificationScreen';
import VerificationPendingScreen from './screens/VerificationPendingScreen';
import DriverHome from './screens/DriverHome';
import NavigationScreen from './screens/NavigationScreen';
import ActiveRideScreen from './screens/ActiveRideScreen';
import ChatScreen from './screens/ChatScreen';
import RideHistoryScreen from './screens/RideHistoryScreen';
import EarningsScreen from './screens/EarningsScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="DriverAuth"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#007AFF',
          },
          headerTintColor: 'white',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="DriverAuth" 
          component={DriverAuthScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="DriverVerification" 
          component={DriverVerificationScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="VerificationPending" 
          component={VerificationPendingScreen}
          options={{ 
            title: 'Verification Status',
            headerLeft: null,
            gestureEnabled: false
          }}
        />
        <Stack.Screen 
          name="DriverHome" 
          component={DriverHome}
          options={{ 
            title: 'Driver Dashboard',
            headerLeft: null,
            gestureEnabled: false
          }}
        />
        <Stack.Screen 
          name="Navigation" 
          component={NavigationScreen}
          options={{ title: 'Navigate to Pickup' }}
        />
        <Stack.Screen 
          name="ActiveRide" 
          component={ActiveRideScreen}
          options={{ title: 'Active Ride' }}
        />
        <Stack.Screen 
          name="Chat" 
          component={ChatScreen}
          options={{ title: 'Chat with Rider' }}
        />
        <Stack.Screen 
          name="RideHistory" 
          component={RideHistoryScreen}
          options={{ title: 'Ride History' }}
        />
        <Stack.Screen 
          name="Earnings" 
          component={EarningsScreen}
          options={{ title: 'Earnings' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
