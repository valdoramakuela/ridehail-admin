// driver-app/screens/NavigationScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';

export default function NavigationScreen({ route, navigation }) {
  const { pickup } = route.params;
  const [region, setRegion] = useState(null);
  const [directions, setDirections] = useState([]);
  const [driverLocation, setDriverLocation] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      let loc = await Location.getCurrentPositionAsync({});
      const current = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude
      };
      setDriverLocation(current);

      // Set map view
      setRegion({
        latitude: (current.latitude + pickup.lat) / 2,
        longitude: (current.longitude + pickup.lng) / 2,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05
      });

      // Get directions
      fetchDirections(current, pickup);
    })();
  }, []);

  const fetchDirections = async (origin, dest) => {
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${dest.lat},${dest.lng}&key=AIzaSyBHGYla18wlILgHfqWYQm1-MfwkarMUbvA`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.routes.length > 0) {
      const points = data.routes[0].overview_polyline.points;
      const decoded = decodePolyline(points);
      setDirections(decoded);
    }
  };

  // Basic polyline decoder (or use library: `polyline`)
  const decodePolyline = (encoded) => {
    let poly = [];
    let index = 0, len = encoded.length;
    let lat = 0, lng = 0;
    while (index < len) {
      let b, shift = 0, result = 0;
      do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
      let dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += dlat;
      shift = 0; result = 0;
      do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
      let dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += dlng;
      poly.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
    }
    return poly;
  };

  if (!region || !driverLocation) return <Text>Loading map...</Text>;

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={region}
        showsUserLocation
        followsUserLocation
      >
        <Marker coordinate={driverLocation} title="You" pinColor="blue" />
        <Marker coordinate={pickup} title="Pickup" pinColor="green" />
        {directions.length > 0 && <Polyline coordinates={directions} strokeColor="black" strokeWidth={5} />}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 }
});