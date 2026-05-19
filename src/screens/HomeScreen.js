import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { usePetStore } from '../store/usePetStore';

const petImages = {
  'whatsup': require('../../assets/podo/whatsup.gif'),
  'wink': require('../../assets/podo/wink.gif'),
  'cold': require('../../assets/podo/cold.gif'),
  'anger': require('../../assets/podo/anger.gif'),
  'up-balloon': require('../../assets/podo/up-balloon.gif'),
};

export default function HomeScreen({ navigation }) {
  const { bones, petState } = usePetStore();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Podo'ya Hoş Geldin!</Text>
      
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>🍖 Kemik: {bones}</Text>
      </View>

      <Image 
        source={petImages[petState]} 
        style={styles.petImage} 
        resizeMode="contain" 
      />

      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('UploadTask')}
      >
        <Text style={styles.buttonText}>Yeni Görev Yükle</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f8ff', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  statsContainer: { backgroundColor: '#fff', padding: 10, borderRadius: 20, marginBottom: 40, elevation: 5 },
  statsText: { fontSize: 18, fontWeight: 'bold', color: '#ff6b6b' },
  petImage: { width: 250, height: 250, marginBottom: 40 },
  button: { backgroundColor: '#4caf50', paddingVertical: 15, paddingHorizontal: 30, borderRadius: 25 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});