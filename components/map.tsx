import React, { useEffect, useRef } from 'react';
import MapView, { Callout, Marker, PROVIDER_GOOGLE, Camera } from 'react-native-maps';
import { Alert, StyleSheet, Text, View, Button } from 'react-native';
import { useCoordinateContext } from './CoordinateContext';
import { markers } from '../assets/market';

const INITIAL_REGION = {
  latitude: 49.01,
  longitude: 8.40,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

const MapComponent = () => {
  const { coordinates } = useCoordinateContext();
  const mapRef = useRef<MapView | null>(null);

  useEffect(() => {
    if (coordinates) {
      mapRef.current?.animateToRegion({
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    }
  }, [coordinates]);

  const zoomIn = () => {
    mapRef.current?.getCamera().then((camera: Camera) => {
      if (camera.zoom !== undefined) {
        camera.zoom += 1;
        mapRef.current?.animateCamera(camera);
      }
    });
  };

  const zoomOut = () => {
    mapRef.current?.getCamera().then((camera: Camera) => {
      if (camera.zoom !== undefined) {
        camera.zoom -= 1;
        mapRef.current?.animateCamera(camera);
      }
    });
  };

  const onMarkerSelected = (marker: any) => {
    Alert.alert(marker.name);
  };

  const calloutPressed = (ev: any) => {
    console.log(ev);
  };

  const onRegionChange = (region: any) => {
    console.log(region);
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={INITIAL_REGION}
        showsUserLocation
        showsMyLocationButton
        onRegionChangeComplete={(region) => onRegionChange(region)}
      >
        {markers.map((marker, index) => (
          <Marker
            key={index}
            title={marker.name}
            coordinate={marker}
            onPress={() => onMarkerSelected(marker)}
          >
            <Callout onPress={calloutPressed}>
              <View style={{ padding: 10 }}>
                <Text style={{ fontSize: 24 }}>Hello</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
      <View style={styles.buttonContainer}>
        <Button title="Zoom In" onPress={zoomIn} />
        <Button title="Zoom Out" onPress={zoomOut} />
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
});

export default MapComponent;
