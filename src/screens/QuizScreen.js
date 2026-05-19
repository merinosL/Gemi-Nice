import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { usePetStore } from '../store/usePetStore';

export default function QuizScreen({ route, navigation }) {
  // UploadTaskScreen'den gelen verileri alıyoruz
  const { taskData } = route.params || {};
  
  
  const questions = taskData?.questions || [
    { id: 1, text: "Podo'nun en sevdiği yiyecek nedir?", options: ["Havuç", "Kemik", "Elma", "Balık"], correct: 1 },
    { id: 2, text: "Bu hackathon hangi yapay zeka modelini zorunlu kılıyor?", options: ["GPT-4", "Claude", "Gemini", "Llama"], correct: 2 }
  ];

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const { addBone, setPetState } = usePetStore();

  const handleAnswer = (optionIndex) => {
    setSelectedOption(optionIndex);
    
    // Doğru cevap kontrolü
    if (optionIndex === questions[currentQuestionIndex].correct) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
    } else {
      
      const successRate = (score / questions.length) * 100;
      
      if (successRate >= 70) {
        addBone(); 
        setPetState('wink'); 
        alert(`Tebrikler! 🎉 Sınavı geçtin. Skorun: %${successRate.toFixed(0)}\nPodo'ya 1 Kemik kazandırdın!`);
      } else {
        setPetState('cold'); 
        alert(`Maalesef barajı geçemedin. 😢 Skorun: %${successRate.toFixed(0)}\nPodo acıktı ve hastalandı, daha çok çalışmalısın!`);
      }
      
      navigation.navigate('Home');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.progressText}>Soru: {currentQuestionIndex + 1} / {questions.length}</Text>
      
      <Text style={styles.questionText}>{questions[currentQuestionIndex].text}</Text>

      {questions[currentQuestionIndex].options.map((option, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.optionButton,
            selectedOption === index && styles.selectedOptionButton
          ]}
          onPress={() => handleAnswer(index)}
          disabled={selectedOption !== null}
        >
          <Text style={styles.optionText}>{option}</Text>
        </TouchableOpacity>
      ))}

      {selectedOption !== null && (
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {currentQuestionIndex === questions.length - 1 ? 'Sınavı Bitir' : 'Sonraki Soru ➡️'}
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#f0f8ff', padding: 20, justifyContent: 'center' },
  progressText: { fontSize: 16, color: '#666', marginBottom: 10, textAlign: 'center' },
  questionText: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 30, textAlign: 'center' },
  optionButton: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 12, borderWidth: 1, borderColor: '#ddd' },
  selectedOptionButton: { backgroundColor: '#ffe066', borderColor: '#fcc419' },
  optionText: { fontSize: 16, color: '#495057' },
  nextButton: { backgroundColor: '#ff6b6b', padding: 15, borderRadius: 10, marginTop: 20, alignItems: 'center' },
  nextButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});