import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Modal, Text, TextInput, Button, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import * as Location from 'expo-location';
import { useCoordinateContext } from './CoordinateContext';

const API_URL = 'http://193.196.36.78:8080/geoserver/MobileGIS/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=MobileGIS:group_1_data&maxFeatures=50&outputformat=application/json';

// Function to fetch places from the GeoServer
const fetchPlaces = async () => {  //a function that performs tasks that might take some time to complete without blocking the execution 
                                   //of the rest of the code
  try {
    // Make an HTTP GET request to the specified API URL
    const response = await fetch(API_URL);
    // Check if the response status is not OK
    if (!response.ok) {
      // Throw an error with the HTTP status code
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    // Parse the response body as JSON
    const data = await response.json();
    // Log the fetched data to the console for debugging
    console.log('Fetched data:', data);
    // Return the 'features' property of the fetched data
    return data.features;
  } catch (error) {
    // Log any errors that occur during the fetch process to the console
    console.error('Error fetching places:', error);
    // Throw the error again to be handled by the calling code
    throw error;
  }
};

// Define the type for the props of the Map component
interface MapProps {
  nearestPlaces: any[];
}

// Define a functional component named Map that accepts props of type MapProps
const Map: React.FC<MapProps> = ({ nearestPlaces }) => {

  // Create a reference for the MapView component, initialized to null

  const mapRef = useRef<MapView | null>(null); // Use the custom CoordinateContext to get and set the coordinates
  const { coordinates, setCoordinates } = useCoordinateContext(); // Define a state variable to store the user's current location, initialized with the context coordinates
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(coordinates); // Define a state variable to track the current place index, initialized to 0
  const [currentPlaceIndex, setCurrentPlaceIndex] = useState(0); // Define a state variable to manage the visibility of the modal, initialized to false
  const [modalVisible, setModalVisible] = useState(false); // Define a state variable to store the user's answer, initialized to an empty string
  const [answer, setAnswer] = useState(''); // Define a state variable to indicate if the data is still loading, initialized to true
  const [loading, setLoading] = useState(true); // Define a state variable to store the list of places fetched from the API, initialized to an empty array
  const [places, setPlaces] = useState<any[]>([]); // Define a state variable to store the set of visited places' IDs, initialized to an empty set
  const [visitedPlaces, setVisitedPlaces] = useState<Set<string>>(new Set()); // Define a state variable to store any error messages, initialized to null
  const [error, setError] = useState<string | null>(null);  // Define a state variable to store the currently selected place, initialized to null
  const [selectedPlace, setSelectedPlace] = useState<any | null>(null);

  useEffect(() => {
    /*This useEffect ensures that the places are fetched and set in the state once the component mounts, 
    handling any errors that may occur during the process.*/

    // Define an async function to load places from the API
    const loadPlaces = async () => {
      try {
        const fetchedPlaces = await fetchPlaces(); // Update the state with the fetched places
        setPlaces(fetchedPlaces);
        setLoading(false);
      } catch (err) {
        setError('Failed to load places');
        setLoading(false);
      }
    };
    loadPlaces();
  }, []);

  useEffect(() => {
    /*This useEffect ensures that whenever the coordinates state changes, the location state is updated and the map camera is 
    animated to the new coordinates. This keeps the map view in sync with the current coordinates.*/

    if (coordinates) {
      setLocation({ latitude: coordinates.latitude, longitude: coordinates.longitude });
      // If the map reference is set, animate the camera to the new coordinates
      if (mapRef.current) {
        mapRef.current.animateCamera({
          center: {
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
          },
        });
      }
    }
  }, [coordinates]);


 // Check for answers
  const handleSubmit = () => {
    /*This function handles the answer submission, providing feedback to the user, updating the state of visited places, 
    and managing the visibility of the modal based on the correctness of the user's answer.*/

    // Check if a place is selected, the selected place has an answer property,
    // and the user's answer matches the correct answer (case-insensitive)
    if (selectedPlace && selectedPlace.properties.answer && answer.toUpperCase() === String(selectedPlace.properties.answer).toUpperCase()) {
      // Show an alert indicating the answer is correct
      Alert.alert('Correct!');
      // Add the selected place's ID to the set of visited places
      setVisitedPlaces(prevVisitedPlaces => new Set([...prevVisitedPlaces, selectedPlace.properties.place]));
      // Close the modal
      setModalVisible(false);
      // Clear the answer input
      setAnswer('');
    } else {
      // Show an alert indicating the answer is incorrect
      Alert.alert('Sorry, try again');
    }
  };


// Function to handle the event when a marker is pressed
const handleMarkerPress = (place: any) => {
  // Set the selectedPlace state to the place associated with the pressed marker
  setSelectedPlace(place);
  // Set the modalVisible state to true to show the modal
  setModalVisible(true);
};

// Asynchronous function to handle GPS functionality
const handleGPS = async () => {
  // Request foreground location permissions from the user
  let { status } = await Location.requestForegroundPermissionsAsync();
  // Check if the permission was not granted
  if (status !== 'granted') {
    // Show an alert indicating that permission to access location was denied
    Alert.alert('Permission to access location was denied');
    // Exit the function early since permission was not granted
    return;
    // If permission is granted, further code to get the location and update the map will be added here
  }

  // Request the device's current position asynchronously
  let location = await Location.getCurrentPositionAsync({});

  // Update the location state with the current position's coordinates
  setLocation(location.coords);
  // Update the global coordinates context with the current position's coordinates
  setCoordinates(location.coords);

  // Check if the map reference is set
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

// Conditional rendering: if loading is true, show a loading indicator
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
  <Marker
    key={index}
    coordinate={{
      latitude: place.geometry.coordinates[1],
      longitude: place.geometry.coordinates[0],
    }}
    pinColor={visitedPlaces.has(place.properties.place) ? "green" : "red"}
  >
    <Callout>
      <Text>{`${index + 1}-${place.properties.place} (${place.properties.place})`}</Text>
    </Callout>
  </Marker>
))}

{places.map((place, index) => (
  <Marker
    key={`place-${index}`}
    coordinate={{
      latitude: place.geometry.coordinates[1],
      longitude: place.geometry.coordinates[0],
    }}
    pinColor={visitedPlaces.has(place.properties.place) ? "green" : "red"}
    onPress={() => handleMarkerPress(place)}
  >
    <Callout>
      <Text>{`${index + 1}-${place.properties.place}`}</Text>
    </Callout>
  </Marker>
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
            <Text>{selectedPlace.properties.name}</Text>
            <Text>{selectedPlace.properties.question}</Text>
            <TextInput style={styles.input} onChangeText={setAnswer} value={answer} />
            <Button title="Submit" onPress={handleSubmit} />
            <Button title="Close" onPress={() => setModalVisible(false)} disabled={!selectedPlace.properties.answer || answer.toUpperCase() !== String(selectedPlace.properties.answer).toUpperCase()} />
          </View>
        </Modal>
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
});

export default Map;
