import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator,
} from 'react-native';
import { usePetStore } from '../store/usePetStore';
import { submitQuiz } from '../services/api';

export default function QuizScreen({ route, navigation }) {
  const { taskId, questions: routeQuestions, taskData } = route.params || {};

  const questions =
    routeQuestions ||
    (typeof taskData?.questions === 'string'
      ? JSON.parse(taskData.questions)
      : taskData?.questions) ||
    [];

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState(Array(questions.length || 10).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const { addBone, setPetState } = usePetStore();

  const updateAnswer = (letter) => {
    const copy = [...answers];
    copy[currentQuestionIndex] = letter;
    setAnswers(copy);
  };

  const handleNext = () => {
    if (!answers[currentQuestionIndex]?.trim()) {
      alert('Lütfen bir seçenek seçin!');
      return;
    }
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const data = await submitQuiz(taskId, answers);
      setResult(data);

      // addBone() kaldırıldı, çünkü artık kemikler veritabanındaki bakiyeden (bonesEarned) geliyor.

      // Backend'den gelen yeni duruma göre Podo'nun animasyonunu güncelle
      const petMapping = {
        happy: 'wink',
        normal: 'whatsup',
        sick: 'anger',
        critical: 'up-balloon',
        gone: 'cold',
      };

      if (data.animalStatus && petMapping[data.animalStatus]) {
        setPetState(petMapping[data.animalStatus]);
      }
    } catch (error) {
      console.log('Quiz submit error:', error.message);
      alert('Sınav sonucu gönderilemedi. Backend çalışıyor mu?');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Result screen ---
  if (result) {
    // Backend already returns score as 0–100 percentage — use directly
    const score = result.score ?? 0;
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.resultEmoji}>{result.passed ? '🎉' : '😢'}</Text>
        <Text style={styles.resultTitle}>
          {result.passed ? 'Tebrikler! Sınavı Geçtin!' : 'Maalesef Barajı Geçemedin'}
        </Text>
        <View style={styles.resultCard}>
          <Text style={styles.resultRow}>📊 Skor: <Text style={styles.resultValue}>%{score.toFixed(0)}</Text></Text>
          {result.bonesEarned > 0 && (
            <Text style={styles.resultRow}>🍖 Kazanılan: <Text style={styles.resultValue}>{result.bonesEarned} kemik</Text></Text>
          )}
          {result.animalStatus && (
            <Text style={styles.resultRow}>🐾 Podo'nun durumu: <Text style={styles.resultValue}>{result.animalStatus}</Text></Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.homeButtonText}>🏠 Ana Sayfaya Dön</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // --- No questions ---
  if (questions.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.questionText}>Soru bulunamadı.</Text>
        <TouchableOpacity style={styles.nextButton} onPress={() => navigation.goBack()}>
          <Text style={styles.nextButtonText}>Geri Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const current = questions[currentQuestionIndex];
  const questionText =
    current?.question_text || current?.text || current?.question || String(current);

  const progressPct = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Progress */}
      <Text style={styles.progressLabel}>
        Soru {currentQuestionIndex + 1} / {questions.length}
      </Text>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
      </View>

      {/* Question */}
      <Text style={styles.questionText}>{questionText}</Text>

      {/* Options */}
      {current?.options?.length > 0 ? (
        current.options.map((option, index) => {
          const letter = option.charAt(0); // 'A', 'B', 'C', 'D'
          const selected = answers[currentQuestionIndex] === letter;
          return (
            <TouchableOpacity
              key={index}
              style={[styles.optionButton, selected && styles.optionButtonSelected]}
              onPress={() => updateAnswer(letter)}
            >
              <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                {option}
              </Text>
            </TouchableOpacity>
          );
        })
      ) : (
        <Text style={styles.noOptions}>Bu soru için seçenek yok.</Text>
      )}

      {/* Next / Submit */}
      <TouchableOpacity
        style={[styles.nextButton, isLoading && { opacity: 0.7 }]}
        onPress={handleNext}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.nextButtonText}>
            {currentQuestionIndex === questions.length - 1 ? '✅ Sınavı Bitir' : 'Sonraki Soru ➡️'}
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f0f8ff',
    padding: 20,
    justifyContent: 'center',
  },
  progressLabel: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 6 },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#ddd',
    borderRadius: 4,
    marginBottom: 24,
    overflow: 'hidden',
  },
  progressFill: { height: 8, backgroundColor: '#4caf50', borderRadius: 4 },
  questionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 26,
  },
  optionButton: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: '#ddd',
  },
  optionButtonSelected: {
    backgroundColor: '#e0f7fa',
    borderColor: '#00bcd4',
    borderWidth: 2,
  },
  optionText: { fontSize: 15, color: '#333' },
  optionTextSelected: { fontWeight: 'bold', color: '#0097a7' },
  nextButton: {
    backgroundColor: '#ff6b6b',
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
    alignItems: 'center',
  },
  nextButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  noOptions: { color: '#999', textAlign: 'center', marginBottom: 20 },

  // Result styles
  resultEmoji: { fontSize: 72, textAlign: 'center', marginBottom: 10 },
  resultTitle: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', color: '#333', marginBottom: 20 },
  resultCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    width: '100%',
    marginBottom: 30,
    elevation: 3,
    gap: 10,
  },
  resultRow: { fontSize: 16, color: '#555' },
  resultValue: { fontWeight: 'bold', color: '#333' },
  homeButton: {
    backgroundColor: '#4caf50',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  homeButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});