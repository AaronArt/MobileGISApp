import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Button } from 'react-native';
import * as Location from 'expo-location';
import { useCoordinateContext } from './CoordinateContext';

// Function to calculate the Haversine distance between two sets of coordinates
const haversineDistance = (coords1: [number, number], coords2: [number, number]) => {
  
  // Helper function to convert degrees to radians
  const toRad = (x: number) => x * Math.PI / 180;
  // Extract latitude and longitude from the first set of coordinates
  const lat1 = coords1[1];
  const lon1 = coords1[0];
  // Extract latitude and longitude from the second set of coordinates
  const lat2 = coords2[1];
  const lon2 = coords2[0];
  const R = 6371; // Earth's radius in kilometers
  // Calculate the differences in latitude and longitude in radians
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  // Haversine formula to calculate the distance
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // Return the distance in meters
  return R * c * 1000;
};


interface ButtonLocationProps {
  onLocationUpdated: (location: Location.LocationObject) => void;
  onNearestPlaces: (places: any[]) => void;
}

const ButtonLocation: React.FC<ButtonLocationProps> = ({ onLocationUpdated, onNearestPlaces }) => {
  const { setCoordinates } = useCoordinateContext();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [places, setPlaces] = useState<any[]>([]);

  useEffect(() => {
    // Define an async function to fetch places from the GeoServer
    const fetchPlaces = async () => {
      try {
        // Make a network request to fetch places data from the specified URL
        const response = await fetch('http://193.196.36.78:8080/geoserver/MobileGIS/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=MobileGIS:group_1_data&maxFeatures=50&outputformat=application/json');
        // Parse the response as JSON
        const data = await response.json();
        // Update the state with the fetched places data
        setPlaces(data.features);
      } catch (error) {
        // Log any errors that occur during the fetch process to the console
        console.error('Error fetching places:', error);
      }
    };
    // Call the fetchPlaces function to fetch and set places
    fetchPlaces();
  }, []); // The empty dependency array ensures this effect runs only once after the initial render
  

// Asynchronous function to get the user's current location
const getLocation = async () => {
  // Request foreground location permissions from the user
  let { status } = await Location.requestForegroundPermissionsAsync();
  // Check if the permission was not granted
  if (status !== 'granted') {
    // Log a message indicating that permission to access location was denied
    console.log('Permission to access location was denied');
  
    // Exit the function early since permission was not granted
    return;
  }
  // Request the device's current position asynchronously
  let location = await Location.getCurrentPositionAsync({});
  // Update the location state with the current position
  setLocation(location);
  // Update the global coordinates context with the current position's coordinates
  setCoordinates(location.coords);
  // Call the function passed as a prop to update the location
  onLocationUpdated(location);
  // Calculate distances from the current location to each place and sort them by distance
  const sortedPlaces = places.map(place => {
    const distance = haversineDistance(
      [location.coords.longitude, location.coords.latitude],
      place.geometry.coordinates
    );
    return { ...place, distance };
  }).sort((a, b) => a.distance - b.distance);

  // Call the function passed as a prop to update the nearest places
  onNearestPlaces(sortedPlaces);

  // Log the sorted nearest places to the console
  console.log('Nearest Places:', sortedPlaces);
};


  return (
    <View style={styles.container}>
      <Button title="Get Location" onPress={getLocation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    width: '40%',
  },
});

export default ButtonLocation;
