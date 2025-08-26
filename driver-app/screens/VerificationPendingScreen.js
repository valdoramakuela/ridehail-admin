// screens/VerificationPendingScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, RefreshControl, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { driverAPI } from '../lib/api';

export default function VerificationPendingScreen({ navigation }) {
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [user, setUser] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadUserData();
    checkVerificationStatus();
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

  const checkVerificationStatus = async () => {
    try {
      const response = await driverAPI.getProfile();
      
      if (response.data.success) {
        const driver = response.data.driver;
        
        // Update stored user data
        await AsyncStorage.setItem('driverData', JSON.stringify(driver));
        setUser(driver);
        
        if (driver.isVerified) {
          Alert.alert(
            'Verification Approved!',
            'Your documents have been approved. You can now start driving!',
            [
              {
                text: 'Start Driving',
                onPress: () => navigation.replace('DriverHome')
              }
            ]
          );
        }
      }
    } catch (error) {
      console.log('Verification status check error:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await checkVerificationStatus();
    setRefreshing(false);
  };

  const getStatusInfo = () => {
    if (!user) {
      return {
        title: 'Loading...',
        message: 'Checking verification status...',
        color: '#666'
      };
    }

    if (user.isVerified) {
      return {
        title: 'Verification Approved!',
        message: 'Your documents have been approved. You can start driving!',
        color: '#34C759'
      };
    }

    return {
      title: 'Verification Pending',
      message: 'Your documents are being reviewed by our team. This usually takes 24-48 hours.',
      color: '#FF9500'
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Driver Verification</Text>
        {user && <Text style={styles.welcomeText}>Hello, {user.fullName}</Text>}
      </View>

      <View style={styles.statusContainer}>
        <View style={[styles.statusIcon, { backgroundColor: statusInfo.color }]}>
          <Text style={styles.statusIconText}>
            {user?.isVerified ? '✓' : '⏳'}
          </Text>
        </View>
        
        <Text style={[styles.statusTitle, { color: statusInfo.color }]}>
          {statusInfo.title}
        </Text>
        
        <Text style={styles.statusMessage}>
          {statusInfo.message}
        </Text>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>What happens next?</Text>
        
        <View style={styles.stepContainer}>
          <View style={styles.step}>
            <View style={[styles.stepIcon, user?.isVerified ? styles.stepCompleted : styles.stepPending]}>
              <Text style={styles.stepNumber}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Document Review</Text>
              <Text style={styles.stepDescription}>
                Our team reviews your submitted documents for authenticity and compliance.
              </Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={[styles.stepIcon, user?.isVerified ? styles.stepCompleted : styles.stepWaiting]}>
              <Text style={styles.stepNumber}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Background Check</Text>
              <Text style={styles.stepDescription}>
                We verify your license and vehicle registration with authorities.
              </Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={[styles.stepIcon, user?.isVerified ? styles.stepCompleted : styles.stepWaiting]}>
              <Text style={styles.stepNumber}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Approval & Activation</Text>
              <Text style={styles.stepDescription}>
                Once approved, you can start accepting ride requests immediately.
              </Text>
            </div>
          </View>
        </View>
      </View>

      <View style={styles.actionSection}>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={checkVerificationStatus}
        >
          <Text style={styles.refreshButtonText}>Check Status</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.supportButton}
          onPress={() => Alert.alert('Support', 'Contact support at support@ridehail.com')}
        >
          <Text style={styles.supportButtonText}>Need Help?</Text>
        </TouchableOpacity>

        {user?.isVerified && (
          <TouchableOpacity 
            style={styles.continueButton}
            onPress={() => navigation.replace('DriverHome')}
          >
            <Text style={styles.continueButtonText}>Start Driving</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9'
  },
  header: {
    backgroundColor: 'white',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333'
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
    marginTop: 8
  },
  statusContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
    padding: 30,
    alignItems: 'center'
  },
  statusIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  statusIconText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold'
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8
  },
  statusMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24
  },
  infoSection: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
    padding: 20
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20
  },
  stepContainer: {
    gap: 20
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  stepIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15
  },
  stepCompleted: {
    backgroundColor: '#34C759'
  },
  stepPending: {
    backgroundColor: '#FF9500'
  },
  stepWaiting: {
    backgroundColor: '#E5E5EA'
  },
  stepNumber: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold'
  },
  stepContent: {
    flex: 1
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20
  },
  actionSection: {
    padding: 20,
    gap: 12
  },
  refreshButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center'
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  },
  supportButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center'
  },
  supportButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600'
  },
  continueButton: {
    backgroundColor: '#34C759',
    borderRadius: 8,
    padding: 18,
    alignItems: 'center'
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  }
});
