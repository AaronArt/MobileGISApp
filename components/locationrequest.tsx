import React, { useState } from 'react';
import { StyleSheet, View, Text, Button } from 'react-native';
import * as Location from 'expo-location';
import { useCoordinateContext } from './CoordinateContext';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const ButtonLocation = () => {
  const { setCoordinates } = useCoordinateContext();
  const [location, setLocation] = useState<any>(null);

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
        </>
      )}
    </View>
  );
};

export default ButtonLocation;
