import React, { useState } from 'react';
import { StyleSheet, View, Text, FlatList, Image } from 'react-native';
import { CoordinateProvider } from '@/components/CoordinateContext';
import ButtonLocation from '@/components/locationrequest';

export default function TabOneScreen() {
  const [nearestPlaces, setNearestPlaces] = useState<any[]>([]);

  return (
    <CoordinateProvider>
      <View style={styles.container}>
        <Image 
          source={require('@/assets/images/logo.png')}
          style={styles.logo}
        />
        <Text style={styles.title}>Nearest places</Text>
        <View style={styles.separator} />
        <ButtonLocation
          onLocationUpdated={(location: any) => console.log('Location updated', location)}
          onNearestPlaces={(places: any[]) => setNearestPlaces(places)}
        />
        <FlatList
          data={nearestPlaces}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <Text style={styles.placeItem}>
              {index + 1}. {item.properties.place} - {item.distance.toFixed(1)} meters
            </Text>
          )}
        />
      </View>
    </CoordinateProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
    backgroundColor: '#eee',
  },
  placeItem: {
    fontSize: 16,
    marginVertical: 4,
  },
});
