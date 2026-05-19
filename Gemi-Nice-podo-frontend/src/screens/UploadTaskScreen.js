import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ActivityIndicator, Platform, ScrollView,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { createTask } from '../services/api';

export default function UploadTaskScreen({ navigation }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf', // PDF only — backend rejects others
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const file = result.assets[0];
        if (!file.name.toLowerCase().endsWith('.pdf') && file.mimeType !== 'application/pdf') {
          alert('Lütfen yalnızca PDF dosyası seçin!');
          return;
        }
        setSelectedFile(file);
      }
    } catch (err) {
      console.log('Document picker error:', err.message);
      alert('Dosya seçilirken hata oluştu.');
    }
  };

  const handleUpload = async () => {
    if (!title.trim()) {
      alert('Lütfen görev başlığı girin!');
      return;
    }
    if (!selectedFile) {
      alert('Lütfen bir PDF dosyası seçin!');
      return;
    }

    setIsLoading(true);
    setLoadingStep('PDF yükleniyor...');

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('deadline', deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString());

      if (Platform.OS === 'web' && selectedFile.file) {
        formData.append('pdf', selectedFile.file);
      } else {
        formData.append('pdf', {
          uri: selectedFile.uri,
          name: selectedFile.name,
          type: 'application/pdf',
        });
      }

      setLoadingStep('Gemini belgeyi analiz ediyor... (1-2 dk)');
      const result = await createTask(formData);

      const taskId = result.task?.id || result.id;
      const questions =
        typeof result.task?.questions === 'string'
          ? JSON.parse(result.task.questions)
          : result.task?.questions ||
          (typeof result.questions === 'string'
            ? JSON.parse(result.questions)
            : result.questions) ||
          [];

      alert('Görev başarıyla eklendi! Sınavı ana ekrandaki listeden başlatabilirsin.');
      navigation.navigate('Home');
    } catch (error) {
      console.log('Upload error:', error.message);
      alert(`Hata: ${error.message}\n\nBackend çalışıyor mu ve GEMINI_API_KEY doğru mu?`);
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📚 Yeni Görev Yükle</Text>
      <Text style={styles.subtitle}>
        PDF'ini yükle, Gemini soru üretsin, cevapla ve Podo'nu besle!
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Görev Başlığı (Örn: Fizik Vizesi)"
        value={title}
        onChangeText={setTitle}
        editable={!isLoading}
      />

      <TextInput
        style={styles.input}
        placeholder="Son Tarih (Örn: 2026-05-25) — boş bırakılabilir"
        value={deadline}
        onChangeText={setDeadline}
        editable={!isLoading}
      />

      <TouchableOpacity
        style={[styles.selectButton, isLoading && styles.disabled]}
        onPress={pickDocument}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {selectedFile ? '📄 Başka PDF Seç' : '📄 PDF Dosyası Seç'}
        </Text>
      </TouchableOpacity>

      {selectedFile && (
        <View style={styles.fileInfo}>
          <Text style={styles.fileName}>✅ {selectedFile.name}</Text>
          <Text style={styles.fileSize}>
            {selectedFile.size ? `${(selectedFile.size / 1024).toFixed(1)} KB` : ''}
          </Text>
        </View>
      )}

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4caf50" />
          <Text style={styles.loadingText}>{loadingStep}</Text>
          <Text style={styles.loadingHint}>Gemini API yanıt süresi 1-2 dakika olabilir.</Text>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.uploadButton, !selectedFile && styles.disabled]}
          onPress={handleUpload}
          disabled={!selectedFile}
        >
          <Text style={styles.buttonText}>🚀 Görevi Başlat</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f0f8ff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8, color: '#333' },
  subtitle: { fontSize: 13, color: '#888', textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 15,
  },
  selectButton: {
    backgroundColor: '#2196F3',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  uploadButton: {
    backgroundColor: '#4caf50',
    padding: 15,
    borderRadius: 10,
    marginTop: 16,
    width: '100%',
    alignItems: 'center',
  },
  disabled: { opacity: 0.5 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  fileInfo: { alignItems: 'center', marginVertical: 6 },
  fileName: { fontSize: 13, color: '#4caf50', fontWeight: '600' },
  fileSize: { fontSize: 12, color: '#999' },
  loadingContainer: { alignItems: 'center', marginTop: 24, gap: 10 },
  loadingText: { fontSize: 15, color: '#555', fontWeight: '600', textAlign: 'center' },
  loadingHint: { fontSize: 12, color: '#999', textAlign: 'center' },
});