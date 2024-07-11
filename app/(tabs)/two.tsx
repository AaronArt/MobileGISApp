import React, { useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { CoordinateProvider } from '@/components/CoordinateContext';
import Map from '@/components/map';

export default function TabTwoScreen() {
  const [nearestPlaces, setNearestPlaces] = useState<any[]>([]);

  return (
    <CoordinateProvider>
      <View style={styles.container}>
        <Text style={styles.title}>Mapa</Text>
        <View style={styles.separator} />
        <Map nearestPlaces={nearestPlaces} />
      </View>
    </CoordinateProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
