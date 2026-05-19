import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './src/screens/HomeScreen';
import UploadTaskScreen from './src/screens/UploadTaskScreen';
import QuizScreen from './src/screens/QuizScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Podo' }} />
        <Stack.Screen name="UploadTask" component={UploadTaskScreen} options={{ title: 'Görev Yükle' }} />
        <Stack.Screen name="Quiz" component={QuizScreen} options={{ title: 'Sınav Zamanı!' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}