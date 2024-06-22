import { StyleSheet } from 'react-native';
import { CoordinateProvider } from '@/components/CoordinateContext';
import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';
import ButtonLocation from '@/components/locationrequest'



export default function TabOneScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My map</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <EditScreenInfo path="app/(tabs)/index.tsx" />
      <Text>Hello, world!</Text>
      <CoordinateProvider>
        <ButtonLocation/>
      </CoordinateProvider>
      
    </View>
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
