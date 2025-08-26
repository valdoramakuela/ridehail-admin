// screens/DriverVerificationScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView, Image, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { driverAPI } from '../lib/api';

export default function DriverVerificationScreen({ navigation }) {
  const [formData, setFormData] = useState({
    licenseNumber: '',
    vehicleModel: '',
    plateNumber: ''
  });
  
  const [documents, setDocuments] = useState({
    idFront: null,
    licenseFront: null,
    licenseBack: null,
    vehicleRegistration: null,
    profileImage: null
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const driverData = await AsyncStorage.getItem('driverData');
      if (driverData) {
        setUser(JSON.parse(driverData));
      }
    } catch (error) {
      console.log('Error loading driver data:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const selectImage = (documentType) => {
    Alert.alert(
      'Select Image',
      'Choose how to add your document',
      [
        { text: 'Camera', onPress: () => openCamera(documentType) },
        { text: 'Gallery', onPress: () => openGallery(documentType) },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const openCamera = async (documentType) => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Required', 'Camera permission is needed to take photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setDocuments(prev => ({ 
        ...prev, 
        [documentType]: result.assets[0] 
      }));
    }
  };

  const openGallery = async (documentType) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setDocuments(prev => ({ 
        ...prev, 
        [documentType]: result.assets[0] 
      }));
    }
  };

  const validateSubmission = () => {
    if (!formData.licenseNumber || !formData.vehicleModel || !formData.plateNumber) {
      Alert.alert('Error', 'Please fill in all required fields');
      return false;
    }

    const requiredDocs = ['idFront', 'licenseFront', 'licenseBack', 'vehicleRegistration', 'profileImage'];
    const missingDocs = requiredDocs.filter(doc => !documents[doc]);
    
    if (missingDocs.length > 0) {
      Alert.alert('Error', `Please upload all required documents. Missing: ${missingDocs.join(', ')}`);
      return false;
    }

    return true;
  };

  const submitVerification = async () => {
    if (!validateSubmission()) return;

    setIsLoading(true);
    try {
      // Create FormData for file upload
      const uploadData = new FormData();
      
      // Add text fields
      uploadData.append('userId', user.id);
      uploadData.append('fullName', user.fullName);
      uploadData.append('licenseNumber', formData.licenseNumber);
      uploadData.append('vehicleModel', formData.vehicleModel);
      uploadData.append('plateNumber', formData.plateNumber);

      // Add image files
      Object.keys(documents).forEach(key => {
        if (documents[key]) {
          uploadData.append(key, {
            uri: documents[key].uri,
            type: documents[key].mimeType || 'image/jpeg',
            name: documents[key].fileName || `${key}.jpg`
          });
        }
      });

      const response = await driverAPI.submitVerification(uploadData);

      if (response.data.success) {
        Alert.alert(
          'Verification Submitted!',
          'Your documents have been submitted for review. You will be notified once approved.',
          [
            {
              text: 'OK',
              onPress: () => navigation.replace('VerificationPending')
            }
          ]
        );
      }
    } catch (error) {
      console.log('Verification submission error:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to submit verification');
    } finally {
      setIsLoading(false);
    }
  };

  const documentFields = [
    { key: 'idFront', label: 'ID Document Front', required: true },
    { key: 'licenseFront', label: 'License Front', required: true },
    { key: 'licenseBack', label: 'License Back', required: true },
    { key: 'vehicleRegistration', label: 'Vehicle Registration', required: true },
    { key: 'profileImage', label: 'Profile Photo', required: true }
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Driver Verification</Text>
        <Text style={styles.subtitle}>Complete your verification to start driving</Text>
        {user && <Text style={styles.welcomeText}>Welcome, {user.fullName}!</Text>}
      </View>

      <View style={styles.form}>
        <Text style={styles.sectionTitle}>Vehicle Information</Text>
        
        <TextInput
          style={styles.input}
          placeholder="License Number *"
          value={formData.licenseNumber}
          onChangeText={(value) => handleInputChange('licenseNumber', value)}
          autoCapitalize="characters"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Vehicle Model (e.g., Toyota Corolla) *"
          value={formData.vehicleModel}
          onChangeText={(value) => handleInputChange('vehicleModel', value)}
        />
        
        <TextInput
          style={styles.input}
          placeholder="License Plate Number *"
          value={formData.plateNumber}
          onChangeText={(value) => handleInputChange('plateNumber', value)}
          autoCapitalize="characters"
        />

        <Text style={styles.sectionTitle}>Required Documents</Text>
        
        {documentFields.map(({ key, label, required }) => (
          <View key={key} style={styles.documentContainer}>
            <Text style={styles.documentLabel}>
              {label} {required && <Text style={styles.required}>*</Text>}
            </Text>
            
            <TouchableOpacity
              style={[
                styles.documentUpload,
                documents[key] && styles.documentUploaded
              ]}
              onPress={() => selectImage(key)}
            >
              {documents[key] ? (
                <View style={styles.imageContainer}>
                  <Image 
                    source={{ uri: documents[key].uri }} 
                    style={styles.previewImage}
                  />
                  <Text style={styles.uploadedText}>Tap to change</Text>
                </View>
              ) : (
                <View style={styles.uploadPrompt}>
                  <Text style={styles.uploadIcon}>📷</Text>
                  <Text style={styles.uploadText}>Tap to upload {label.toLowerCase()}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity 
          style={[styles.submitButton, isLoading && styles.buttonDisabled]}
          onPress={submitVerification}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitButtonText}>Submit for Verification</Text>
          )}
        </TouchableOpacity>
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
    color: '#333',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center'
  },
  welcomeText: {
    fontSize: 14,
    color: '#007AFF',
    marginTop: 8
  },
  form: {
    padding: 20
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    marginTop: 10
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    backgroundColor: 'white',
    fontSize: 16
  },
  documentContainer: {
    marginBottom: 20
  },
  documentLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8
  },
  required: {
    color: '#FF3B30'
  },
  documentUpload: {
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 20,
    backgroundColor: '#fafafa',
    alignItems: 'center'
  },
  documentUploaded: {
    borderColor: '#34C759',
    borderStyle: 'solid',
    backgroundColor: '#f0f9f0'
  },
  imageContainer: {
    alignItems: 'center'
  },
  previewImage: {
    width: 120,
    height: 90,
    borderRadius: 8,
    marginBottom: 8
  },
  uploadedText: {
    fontSize: 12,
    color: '#34C759',
    fontWeight: '600'
  },
  uploadPrompt: {
    alignItems: 'center'
  },
  uploadIcon: {
    fontSize: 32,
    marginBottom: 8
  },
  uploadText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center'
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 18,
    marginTop: 20,
    marginBottom: 40
  },
  buttonDisabled: {
    backgroundColor: '#ccc'
  },
  submitButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold'
  }
});
