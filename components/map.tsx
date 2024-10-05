import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Modal, Text, TextInput, Button, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import * as Location from 'expo-location';
import { useCoordinateContext } from './CoordinateContext';

const API_URL = 'http://ec2-13-51-201-42.eu-north-1.compute.amazonaws.com:8080/geoserver/mobileGIS/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=mobileGIS%3AMobileGIS&maxFeatures=50&outputFormat=application/json';

// Function to fetch places from the GeoServer
const fetchPlaces = async () => {
  try {
    // Make a request to the API to get the data
    const response = await fetch(API_URL);
    // Check if the request was not successful
    if (!response.ok) {
      // Throw an error with the status code if the request failed
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    // Convert the response data to JSON format
    const data = await response.json();
    // Log the fetched data to the console for debugging
    console.log('Fetched data:', data);
    // Return the list of places from the fetched data
    return data.features;
  } catch (error) {
    // Log any errors that occur during the fetch process
    console.error('Error fetching places:', error);
    // Throw the error so it can be handled elsewhere
    throw error;
  }
};

/* The next lines are important because they help TypeScript understand
 the structure of data we're working with, ensuring that we use
 the correct types and catch errors early in the development process.*/

// Define the types of properties that the Map component will receive
interface MapProps {
  // nearestPlaces is an array of any type
  nearestPlaces: any[];
}
// Define a type for coordinates with latitude and longitude as numbers
interface Coordinates {
  latitude: number;
  longitude: number;
}


// Define the Map component as a functional React component with MapProps type
const Map: React.FC<MapProps> = ({ nearestPlaces }) => {
   // Create a reference to the MapView component, initially set to null
  const mapRef = useRef<MapView | null>(null); 
    // Use the coordinates context to get and set the current coordinates
  const { coordinates, setCoordinates } = useCoordinateContext(); 
  // Define a state variable for the user's location, initially set to the context coordinates
  const [location, setLocation] = useState<Coordinates | null>(coordinates);
  // Define a state variable to keep track of the current place index, initially set to 0
  const [currentPlaceIndex, setCurrentPlaceIndex] = useState(0);
  // Define a state variable to control the visibility of a modal, initially set to false
  const [modalVisible, setModalVisible] = useState(false);
  // Define a state variable to store the user's answer, initially set to an empty string
  const [answer, setAnswer] = useState('');
  // Define a state variable to indicate if data is still loading, initially set to true
  const [loading, setLoading] = useState(true);
  // Define a state variable to store the list of places, initially set to an empty array
  const [places, setPlaces] = useState<any[]>([]);
  // Define a state variable to keep track of visited places, initially set to an empty set
  const [visitedPlaces, setVisitedPlaces] = useState<Set<string>>(new Set());
  // Define a state variable to store any error messages, initially set to null
  const [error, setError] = useState<string | null>(null);
  // Define a state variable to store the currently selected place, initially set to null
  const [selectedPlace, setSelectedPlace] = useState<any | null>(null);
  // Define a state variable to track which questions have been answered correctly, initially set to an empty array
  const [allAnswered, setAllAnswered] = useState<boolean[]>([]);
  // Define a state variable to control the visibility of the restart button, initially set to false
  const [showRestartButton, setShowRestartButton] = useState(false);

  // useEffect hook to load places when the component mounts
useEffect(() => {
  // Define an async function to fetch places from the API
  const loadPlaces = async () => {
    try {
      // Fetch the places from the API
      const fetchedPlaces = await fetchPlaces();
      // Update the state with the fetched places
      setPlaces(fetchedPlaces);
      // Initialize allAnswered array with 'false' values, one for each place
      setAllAnswered(new Array(fetchedPlaces.length).fill(false));
      // Set loading to false since fetching is complete
      setLoading(false);
    } catch (err) {
      // If there's an error, set an error message
      setError('Failed to load places');
      // Set loading to false since fetching is complete, even though it failed
      setLoading(false);
    }
  };

  // Call the async function to load places
  loadPlaces();
}, []); // Empty dependency array means this effect runs only once when the component mounts

// useEffect hook to update the location and map view when coordinates change
useEffect(() => {
  // Check if coordinates are available
  if (coordinates) {
    // Update the location state with the new coordinates
    setLocation({ latitude: coordinates.latitude, longitude: coordinates.longitude });
    // Check if the mapRef reference is set (i.e., the MapView component is available)
    if (mapRef.current) {
      // Animate the map camera to center on the new coordinates
      mapRef.current.animateCamera({
        center: {
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
        },
      });
    }
  }
}, [coordinates]); // Dependency array with coordinates means this effect runs whenever coordinates change


  // Function to handle the submission of the user's answer
const handleSubmit = () => {
  // Check if a place is selected, the place has an answer property,
  // and the user's answer matches the correct answer (case-insensitive)
  if (selectedPlace && selectedPlace.properties.Answer && answer.toUpperCase() === String(selectedPlace.properties.Answer).toUpperCase()) {
    // Show an alert indicating the answer is correct
    Alert.alert('Correct!');
    // Add the selected place's ID to the set of visited places
    setVisitedPlaces(prevVisitedPlaces => new Set([...prevVisitedPlaces, selectedPlace.properties.Place]));
    // Find the index of the selected place in the places array
    const placeIndex = places.findIndex(place => place.properties.Place === selectedPlace.properties.Place);
    // Create a new array to update the allAnswered state
    const newAllAnswered = [...allAnswered]; //... spread Operator. creates a new array with the same elements as allAnswered. 
    // Mark the place as answered correctly
    newAllAnswered[placeIndex] = true;
    // Update the state with the new allAnswered array
    setAllAnswered(newAllAnswered);
    // Close the modal
    setModalVisible(false);
    // Clear the answer input
    setAnswer('');
    // Check if all places have been answered correctly
    if (newAllAnswered.every(Boolean)) {
      // Show a congratulatory alert if all answers are correct
      Alert.alert('You are a Karlsruher now! Herzliche Glückwünsche');
      // Display the restart button after a short delay
      setTimeout(() => setShowRestartButton(true), 1000);
    }
  } else {
    // Show an alert indicating the answer is incorrect
    Alert.alert('Sorry, try again');
  }
};


// Function to handle when a marker on the map is pressed
const handleMarkerPress = (place: any) => {
  // Update the state to set the selected place to the place associated with the pressed marker
  setSelectedPlace(place);
  // Update the state to make the modal visible
  setModalVisible(true);
};


// Function to handle GPS functionality
const handleGPS = async () => {
  // Request permission to access the user's location
  let { status } = await Location.requestForegroundPermissionsAsync();
  // Check if the permission was not granted
  if (status !== 'granted') {
    // Show an alert indicating that permission to access location was denied
    Alert.alert('Permission to access location was denied');
    // Exit the function early since permission was not granted
    return;
  }
  // Get the current position of the user
  let location = await Location.getCurrentPositionAsync({});
  // Update the state with the current position's coordinates
  setLocation(location.coords as Coordinates);
  setCoordinates(location.coords as Coordinates);
  // Check if the map reference is set (i.e., the MapView component is available)
  if (mapRef.current) {
    // Animate the map camera to center on the current position's coordinates
    mapRef.current.animateCamera({
      center: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      },
    });
  }
};


  // Function to restart the game
const restartGame = () => {
  // Reset the set of visited places to an empty set
  setVisitedPlaces(new Set());
  // Reset the array of answered questions to all 'false' values, one for each place
  setAllAnswered(new Array(places.length).fill(false));
  // Hide the restart button
  setShowRestartButton(false);
};


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: location?.latitude || 49.0092265,
          longitude: location?.longitude || 8.4038802,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {nearestPlaces.map((place, index) => (
          !visitedPlaces.has(place.properties.Place) && (
            <Marker
              key={index}
              coordinate={{
                latitude: place.geometry.coordinates[1],
                longitude: place.geometry.coordinates[0],
              }}
              pinColor="red"
            >
              <Callout>
                <Text>{`${index + 1}-${place.properties.Place} (${place.properties.Place})`}</Text>
              </Callout>
            </Marker>
          )
        ))}
        {places.map((place, index) => (
          !visitedPlaces.has(place.properties.Place) && (
            <Marker
              key={`place-${index}`}
              coordinate={{
                latitude: place.geometry.coordinates[1],
                longitude: place.geometry.coordinates[0],
              }}
              pinColor="red"
              onPress={() => handleMarkerPress(place)}
            >
              <Callout>
                <Text>{`${index + 1}-${place.properties.Place}`}</Text>
              </Callout>
            </Marker>
          )
        ))}
        {location && (
          <>
            <Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title="Your Location"
              pinColor="blue"
            />
            {nearestPlaces[currentPlaceIndex] && (
              <MapViewDirections
                origin={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                }}
                destination={{
                  latitude: nearestPlaces[currentPlaceIndex].geometry.coordinates[1],
                  longitude: nearestPlaces[currentPlaceIndex].geometry.coordinates[0],
                }}
                apikey="AIzaSyDi7GzLT9GeT5uI9PKFlRKCiMaUfj5iUBs"
                strokeWidth={3}
                strokeColor="blue"
              />
            )}
          </>
        )}
      </MapView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleGPS}>
          <Text style={styles.buttonText}>GPS</Text>
        </TouchableOpacity>
      </View>

      {selectedPlace && (
        <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalView}>
            <Text>{selectedPlace.properties.Place}</Text>
            <Text>{selectedPlace.properties.Question}</Text>
            <TextInput style={styles.input} onChangeText={setAnswer} value={answer} />
            <Button title="Submit" onPress={handleSubmit} />
            <Button title="Close" onPress={() => setModalVisible(false)} />
          </View>
        </Modal>
      )}

      {showRestartButton && (
        <TouchableOpacity style={styles.restartButton} onPress={restartGame}>
          <Text style={styles.restartButtonText}>Restart</Text>
        </TouchableOpacity>
      )}
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
    color: 'blue',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    width: '100%',
    paddingHorizontal: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 18,
  },
  restartButton: {
    backgroundColor: 'green',
    padding: 15,
    borderRadius: 10,
    position: 'absolute',
    bottom: 50,
  },
  restartButtonText: {
    color: 'white',
    fontSize: 18,
  },
});

export default Map;
