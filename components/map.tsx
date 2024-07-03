import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Dimensions, TouchableOpacity, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import MapViewDirections from 'react-native-maps-directions';
import { useCoordinateContext } from './CoordinateContext';
import places from '../assets/places.json';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const Map = () => {
  const { coordinates, setCoordinates } = useCoordinateContext();
  const [location, setLocation] = useState<{ latitude: number, longitude: number } | null>(null);
  const [nearestPlace, setNearestPlace] = useState<any>(null);
  const mapRef = useRef<MapView | null>(null);

  useEffect(() => {
    const fetchLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      setCoordinates(location.coords);
    };

    fetchLocation();
  }, []);

  useEffect(() => {
    if (location) {
      findNearestPlace();
    }
  }, [location]);

  const haversineDistance = (coords1: [number, number], coords2: [number, number]) => {
    const toRad = (x: number) => x * Math.PI / 180;
    const lat1 = coords1[1];
    const lon1 = coords1[0];
    const lat2 = coords2[1];
    const lon2 = coords2[0];
    const R = 6371; // Earth radius in kilometers
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 1000; // Distance in meters
  };

  const findNearestPlace = () => {
    if (location) {
      let minDistance = Infinity;
      let closestPlace = null;

      places.features.forEach((place: any) => {
        const distance = haversineDistance(
          [location.longitude, location.latitude],
          place.geometry.coordinates
        );

        if (distance < minDistance) {
          minDistance = distance;
          closestPlace = {
            ...place,
            distance,
          };
        }
      });

      setNearestPlace(closestPlace);
    }
  };

  const handleZoom = (factor: number) => {
    if (mapRef.current) {
      mapRef.current.getCamera().then((camera) => {
        camera.zoom += factor;
        mapRef.current?.animateCamera(camera, { duration: 1000 }); // Smooth zoom
      });
    }
  };

  const handleCenterLocation = () => {
    if (location && mapRef.current) {
      mapRef.current.animateCamera({
        center: {
          latitude: location.latitude,
          longitude: location.longitude,
        },
      });
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: location ? location.latitude : 37.78825,
          longitude: location ? location.longitude : -122.4324,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        }}
        showsUserLocation={true}
        showsMyLocationButton={false} // We'll use a custom button
      >
        {location && (
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title="Current Location"
          />
        )}
        {location && nearestPlace && (
          <>
            <Marker
              coordinate={{
                latitude: nearestPlace.geometry.coordinates[1],
                longitude: nearestPlace.geometry.coordinates[0],
              }}
              title={nearestPlace.properties.name}
              description={`Distance: ${nearestPlace.distance.toFixed(2)} meters`}
            />
            <MapViewDirections
              origin={location}
              destination={{
                latitude: nearestPlace.geometry.coordinates[1],
                longitude: nearestPlace.geometry.coordinates[0],
              }}
              apikey="AIzaSyDi7GzLT9GeT5uI9PKFlRKCiMaUfj5iUBs" // Replace with your Google Maps API Key
              strokeWidth={3}
              strokeColor="blue"
            />
          </>
        )}
      </MapView>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => handleZoom(1)}>
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => handleZoom(-1)}>
          <Text style={styles.buttonText}>-</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleCenterLocation}>
          <Text style={styles.buttonText}>GPS</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginVertical: 20,
    backgroundColor: 'transparent',
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    padding: 10,
    marginHorizontal: 10,
    borderRadius: 5,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default Map;
