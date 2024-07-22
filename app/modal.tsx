import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet } from 'react-native';
import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';

export default function ModalScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>How to Play</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <Text style={styles.tutorialText}>
        1. Allow the app to access your location when prompted. This is necessary to find your current position on the map.
      </Text>
      <Text style={styles.tutorialText}>
        2. Use the GPS button to center the map on your current location.
      </Text>
      <Text style={styles.tutorialText}>
        3. Explore the map to find nearby touristic places marked with red pins.
      </Text>
      <Text style={styles.tutorialText}>
        4. Tap on a pin to view more details about the place and answer a question related to it.
      </Text>
      <Text style={styles.tutorialText}>
        5. If you answer the question correctly, the pin will disappear from the map.
      </Text>
      <Text style={styles.tutorialText}>
        6. Continue visiting and answering questions at all marked places.
      </Text>
      <Text style={styles.tutorialText}>
        7. Once you have correctly answered all questions, a message will congratulate you and you will see a button to restart the game.
      </Text>
      <Text style={styles.tutorialText}>
        8. Press the restart button to play again with all the places available.
      </Text>
      <Text style={styles.developerInfo}>
        Developed by Group 1: Aaron, Michael, Rania, Shilpa, Swathi.
      </Text>
      <Text style={styles.developerInfo}>
        All rights reserved ®.
      </Text>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  tutorialText: {
    fontSize: 16,
    textAlign: 'left',
    marginBottom: 10,
  },
  developerInfo: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 30,
    color: 'gray',
  },
});
