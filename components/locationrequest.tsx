import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, Button } from 'react-native';
import * as Location from 'expo-location';
import { useCoordinateContext } from './CoordinateContext';
import places from '../assets/places.json';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const haversineDistance = (coords1: [number, number], coords2: [number, number]) => {
  const toRad = (x: number) => x * Math.PI / 180;

  const lat1 = coords1[1];
  const lon1 = coords1[0];
  const lat2 = coords2[1];
  const lon2 = coords2[0];

  const R = 6371; // Earth distance
  const x1 = lat2 - lat1;
  const dLat = toRad(x1);
  const x2 = lon2 - lon1;
  const dLon = toRad(x2);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;

  return d * 1000; // distance in meters
};

const ButtonLocation = () => {
  const { setCoordinates } = useCoordinateContext();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [nearestPlace, setNearestPlace] = useState<{ name: string, distance: number } | null>(null);

  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permission to access location was denied');
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    setLocation(location);
    setCoordinates(location.coords); // Actualizar el contexto con las coordenadas
    console.log(location);
  };

  const findNearestPlace = useCallback(() => {
    if (location) {
      let minDistance = Infinity;
      let closestPlace: { name: string, distance: number } | null = null;

      places.features.forEach((place: any) => {
        const distance = haversineDistance(
          [location.coords.longitude, location.coords.latitude],
          place.geometry.coordinates
        );

        if (distance < minDistance) {
          minDistance = distance;
          closestPlace = {
            name: place.properties.name,
            distance: distance
          };
        }
      });

      setNearestPlace(closestPlace);
    }
  }, [location]);

  useEffect(() => {
    findNearestPlace();
  }, [location, findNearestPlace]);
  

  return (
    <View style={styles.container}>
      <Text>Welcome!</Text>
      <View style={{ marginTop: 10, padding: 10, borderRadius: 10, width: '40%' }}>
        <Button title="Get Location" onPress={getLocation} />
      </View>
      {location && (
        <>
          <Text>Latitude: {location.coords.latitude}</Text>
          <Text>Longitude: {location.coords.longitude}</Text>
          {nearestPlace && (
            <>
              <Text>Nearest Place: {nearestPlace.name}</Text>
              <Text>Distance: {nearestPlace.distance.toFixed(2)} meters</Text>
            </>
          )}
        </>
      )}
    </View>
  );
};

export default ButtonLocation;
