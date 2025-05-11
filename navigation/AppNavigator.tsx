import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import DailyChallengeGameScreen from '../screens/DailyChallengeGameScreen';
import DailyChallengeResultsScreen from '../screens/DailyChallengeResultsScreen';
import DailyChallengeScreen from '../screens/DailyChallengeScreen';

import { enableScreens } from 'react-native-screens';
import FlagsGameScreen from '../screens/FlagsGameScreen';
import FlagsResultsScreen from '../screens/FlagsResultsScreen';
import MainMenuScreen from '../screens/MainMenuScreen';
import MonumentsGameScreen from '../screens/MonumentsGameScreen';
import MonumentsResultsScreen from '../screens/MonumentsResultsScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
enableScreens();

export type RootStackParamList = {
  Welcome: undefined;
  MainMenu: undefined;

  // Juego de banderas
  FlagsGame: { difficulty: 'easy' | 'medium' | 'hard' };
  FlagsResults: {
    results: {
      country: string;
      flag: string;
      distance: number;
    }[];
  };

  // Juego de monumentos
  MonumentsGame: undefined;
  MonumentsResults: {
    results: {
      name: string;
      image: string;
      distance: number;
    }[];
  };

  // Reto diario
  DailyChallenge: undefined;
  DailyChallengeGame: undefined;
  DailyChallengeResults: {
    score: number;
    answers: number;
    distances: number[];
    results: { name: string; distance: number }[];
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="MainMenu" component={MainMenuScreen} />
        <Stack.Screen name="FlagsGame" component={FlagsGameScreen} />
        <Stack.Screen name="FlagsResults" component={FlagsResultsScreen} />
        <Stack.Screen name="MonumentsGame" component={MonumentsGameScreen} />
        <Stack.Screen name="MonumentsResults" component={MonumentsResultsScreen} />
        <Stack.Screen name="DailyChallenge" component={DailyChallengeScreen} />
        <Stack.Screen name="DailyChallengeGame" component={DailyChallengeGameScreen} />
        <Stack.Screen name="DailyChallengeResults" component={DailyChallengeResultsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
