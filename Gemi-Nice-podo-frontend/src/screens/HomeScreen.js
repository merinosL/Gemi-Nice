import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, Image, TouchableOpacity,
  FlatList, ActivityIndicator, ScrollView, TextInput,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { usePetStore } from '../store/usePetStore';
import { getAnimal, getTasks, updateAnimalName, feedAnimal } from '../services/api';

const petImages = {
  whatsup: require('../../assets/podo/whatsup.gif'),
  wink: require('../../assets/podo/wink.gif'),
  cold: require('../../assets/podo/cold.gif'),
  anger: require('../../assets/podo/anger.gif'),
  'up-balloon': require('../../assets/podo/up-balloon.gif'),
};

const statusToPetState = {
  happy: 'wink',
  normal: 'whatsup',
  sick: 'cold',
  critical: 'anger',
  gone: 'cold',
};

const statusLabel = {
  happy: '😄 Mutlu',
  normal: '😐 Normal',
  sick: '🤧 Hasta',
  critical: '😱 Kritik',
  gone: '💀 Gitmiş',
};

export default function HomeScreen({ navigation }) {
  const { bones, petState, setPetState } = usePetStore();
  const [tasks, setTasks] = useState([]);
  const [coins, setCoins] = useState(0);
  const [animalName, setAnimalName] = useState('Podo');
  const [isEditingName, setIsEditingName] = useState(false);
  const [animalStatus, setAnimalStatus] = useState('happy');
  const [loading, setLoading] = useState(true);

  const handleNameSave = async () => {
    setIsEditingName(false);
    try {
      await updateAnimalName(animalName);
    } catch (e) {
      console.log('İsim kaydedilemedi', e);
    }
  };

  const handleFeed = async () => {
    if (coins <= 0) {
      alert("Podo'ya vermek için yeterli kemiğin yok. Sınav çözerek kazanabilirsin!");
      return;
    }
    if (animalStatus === 'happy') {
      alert("Podo zaten çok mutlu! Daha fazla yiyemez.");
      return;
    }
    try {
      const result = await feedAnimal();
      if (result.success) {
        setCoins(result.bonesRemaining);
        setAnimalStatus(result.status);
        if (statusToPetState[result.status]) {
          setPetState(statusToPetState[result.status]);
        }
      }
    } catch (e) {
      alert(e.response?.data?.error || "Beslerken hata oluştu");
    }
  };

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        setLoading(true);
        try {
          const [animalRes, tasksRes] = await Promise.all([
            getAnimal(),
            getTasks(),
          ]);

          const animal = animalRes.animal || animalRes;
          if (animal?.status && statusToPetState[animal.status]) {
            setPetState(statusToPetState[animal.status]);
            setAnimalStatus(animal.status);
          }
          if (animal?.name) setAnimalName(animal.name);
          setCoins(animal?.coin_balance ?? animal?.coins ?? 0);

          const taskList = tasksRes.tasks || tasksRes || [];
          setTasks(taskList);
        } catch (error) {
          console.log('API error, offline mode:', error.message);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }, [])
  );

  const renderTask = ({ item }) => {
    const completed = !!item.completed_at || item.completed || item.is_completed;
    const questions =
      typeof item.questions === 'string'
        ? JSON.parse(item.questions)
        : item.questions || [];

    return (
      <View style={[styles.taskItem, completed && styles.taskItemDone]}>
        <View style={styles.taskHeader}>
          <Text style={styles.taskDifficulty}>
            {item.difficulty === 'easy' ? '🟢' : item.difficulty === 'hard' ? '🔴' : '🟡'}{' '}
            {item.difficulty?.toUpperCase()}
          </Text>
          {item.deadline && (
            <Text style={styles.taskDeadline}>
              ⏰ {new Date(item.deadline).toLocaleDateString('tr-TR')}
            </Text>
          )}
        </View>

        <Text style={[styles.taskTitle, completed && styles.taskTitleDone]}>
          {completed ? '✅ ' : '📌 '}
          {item.title}
        </Text>

        {item.description ? (
          <Text style={styles.taskDesc} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}

        {!completed && (
          <TouchableOpacity
            style={styles.quizButton}
            onPress={() =>
              navigation.navigate('Quiz', {
                taskId: item.id,
                questions,
                taskData: item,
              })
            }
          >
            <Text style={styles.quizButtonText}>📝 Sınavı Başlat</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🐾 Podo'ya Hoş Geldin!</Text>

      {/* Stats bar */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>🍖 {coins}</Text>
      </View>

      {/* Pet */}
      <View style={styles.petContainer}>
        <Image
          source={petImages[petState] || petImages.whatsup}
          style={styles.petImage}
          resizeMode="contain"
        />
        {isEditingName ? (
          <TextInput
            style={[styles.petName, { borderBottomWidth: 1, borderColor: '#aaa' }]}
            value={animalName}
            onChangeText={setAnimalName}
            onBlur={handleNameSave}
            onSubmitEditing={handleNameSave}
            autoFocus
          />
        ) : (
          <TouchableOpacity onPress={() => setIsEditingName(true)}>
            <Text style={styles.petName}>{animalName} ✏️</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.petStatus}>{statusLabel[animalStatus] || '😄 Mutlu'}</Text>
        <TouchableOpacity style={styles.feedButton} onPress={handleFeed}>
          <Text style={styles.feedButtonText}>🍖 Kemik Ver</Text>
        </TouchableOpacity>
      </View>

      {/* Task list */}
      {loading ? (
        <ActivityIndicator size="large" color="#4caf50" style={{ marginVertical: 20 }} />
      ) : tasks.length > 0 ? (
        <View style={styles.taskSection}>
          <Text style={styles.sectionTitle}>📋 Görevlerim</Text>
          {tasks.map((item) => (
            <View key={String(item.id)}>{renderTask({ item })}</View>
          ))}
        </View>
      ) : (
        <Text style={styles.noTaskText}>Henüz görev yok. Yeni bir tane ekle!</Text>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('UploadTask')}
      >
        <Text style={styles.buttonText}>➕ Yeni Görev Yükle</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f0f8ff',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 40,
  },
  title: { fontSize: 26, fontWeight: 'bold', marginTop: 10, marginBottom: 15, color: '#333' },
  statsContainer: {
    flexDirection: 'row',
    gap: 20,
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  statsText: { fontSize: 20, fontWeight: 'bold', color: '#ff6b6b' },
  petContainer: { alignItems: 'center', marginBottom: 20 },
  petImage: { width: 200, height: 200 },
  petName: { fontSize: 20, fontWeight: 'bold', color: '#333', marginTop: 5 },
  petStatus: { fontSize: 14, color: '#666', marginTop: 2 },
  taskSection: { width: '100%', marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  taskItem: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 4,
  },
  taskItemDone: { opacity: 0.6 },
  taskHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  taskDifficulty: { fontSize: 12, color: '#888', fontWeight: '600' },
  taskDeadline: { fontSize: 12, color: '#888' },
  taskTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  taskTitleDone: { textDecorationLine: 'line-through', color: '#999' },
  taskDesc: { fontSize: 13, color: '#666', marginBottom: 8 },
  quizButton: {
    backgroundColor: '#ff6b6b',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  quizButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  noTaskText: { color: '#999', fontSize: 15, marginVertical: 20 },
  button: {
    backgroundColor: '#4caf50',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 10,
  },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
  feedButton: {
    backgroundColor: '#ff9800',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 12,
  },
  feedButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});