import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import * as DocumentPicker from 'expo-document-picker'; 

export default function UploadTaskScreen({ navigation }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const BACKEND_URL = 'http://localhost:3000/api/tasks'; 
  
  const TEMP_TOKEN = 'BURAYA_POSTMANDEN_ALACAGINIZ_TOKEN_GELECEK';

  const pickDocument = async () => {
    let result = await DocumentPicker.getDocumentAsync({
      type: '*/*', 
      copyToCacheDirectory: true,
    });

    if (result.canceled === false) {
      setSelectedFile(result.assets[0]);
    }
  };

const handleUpload = async () => {
    if (!selectedFile || !title) {
      alert('Lütfen görev başlığı girin ve dosya seçin!');
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('deadline', deadline || new Date().toISOString());
      formData.append('pdf', {
        uri: selectedFile.uri,
        name: selectedFile.name,
        type: selectedFile.mimeType || 'application/pdf',
      });

      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${TEMP_TOKEN}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Sunucu hatası: ${response.status}`);
      }

      const result = await response.json();
      setIsLoading(false);
      navigation.navigate('Quiz', { taskData: result });

    } catch (error) {
      console.log('Sunucuya bağlanılamadı, Test Modu devreye giriyor...', error);
      
      
      setTimeout(() => {
        setIsLoading(false);
        
        const mockTaskData = {
          title: title,
          questions: [
            { 
              id: 1, 
              text: `${title} içeriğine göre: Malzeme analizinde X-Işını kırınımı (XRD) temel olarak hangi amaçla kullanılır?`, 
              options: ["Kristal yapı tayini", "Renk ölçümü", "Elektriksel iletkenlik", "Sıcaklık kontrolü"], 
              correct: 0 
            },
            { 
              id: 2, 
              text: "Üretken yapay zeka projelerinde 'Agentic' yapıların ana ayırt edici özelliği nedir?", 
              options: ["Sadece hazır metin dönmesi", "Otonom karar alma ve araç kullanma yeteneği", "Hızlı veri tabanı sorgusu", "Yüksek grafik kalitesi"], 
              correct: 1 
            },
            { 
              id: 3, 
              text: "Podo'nun motivasyonunu yüksek tutmak için baraj puanı minimum kaç olmalıdır?", 
              options: ["%50", "%60", "%70", "%80"], 
              correct: 2 
            }
          ]
        };

        alert('Podo dosyayı analiz etti! (Çevrimdışı Test Modu)');
        navigation.navigate('Quiz', { taskData: mockTaskData });
      }, 1500); 
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Yeni Görev Yükle</Text>

      <TextInput
        style={styles.input}
        placeholder="Görev Başlığı (Örn: Fizik Vizesi)"
        value={title}
        onChangeText={setTitle}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Son Tarih (Örn: 2026-05-25)"
        value={deadline}
        onChangeText={setDeadline}
      />

      <TouchableOpacity style={styles.selectButton} onPress={pickDocument}>
        <Text style={styles.buttonText}>{selectedFile ? '📄 Başka Dosya Seç' : '📄 Dosya Seç (Zorunlu)'}</Text>
      </TouchableOpacity>

      {selectedFile && <Text style={styles.fileName}>Seçilen: {selectedFile.name}</Text>}
      
      {selectedFile && (
        <TouchableOpacity style={styles.uploadButton} onPress={handleUpload} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>🚀 Görevi Başlat</Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f8ff', alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  input: { width: '100%', backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#ddd' },
  selectButton: { backgroundColor: '#2196F3', padding: 15, borderRadius: 10, marginBottom: 10, width: '100%', alignItems: 'center' },
  uploadButton: { backgroundColor: '#4caf50', padding: 15, borderRadius: 10, marginTop: 20, width: '100%', alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  fileName: { fontSize: 14, fontStyle: 'italic', color: '#555', marginTop: 5, marginBottom: 10 }
});