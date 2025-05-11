import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// Reemplazamos expo-linear-gradient por react-native-linear-gradient
import React, { useEffect } from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import monumentImages from '../assets/images/monuments/monumentImages'; // ✅ Importa el mapa de imágenes
import { useUser } from '../context/UserContext';
import { RootStackParamList } from '../navigation/AppNavigator';

type MonumentsResultsRouteProp = RouteProp<RootStackParamList, 'MonumentsResults'>;

export default function MonumentsResultsScreen() {
  const route = useRoute<MonumentsResultsRouteProp>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { results } = route.params;

  const { addStars } = useUser();
  const score = results.filter((item) => item.distance <= 100).length;

  useEffect(() => {
    addStars(score);
  }, []);

  const getFeedback = (distance: number) => {
    if (distance <= 100) return { message: '¡Correcto!', color: 'green', emoji: '✅' };
    if (distance <= 500) return { message: '¡Casi!', color: 'orange', emoji: '😅' };
    return { message: 'Te has quedado lejos', color: 'red', emoji: '❌' };
  };

  return (
    <LinearGradient colors={['#B388EB', '#ADD8E6']} style={styles.gradient}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <Text style={styles.title}>Tus resultados:</Text>

        <FlatList
          data={results}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => {
            const feedback = getFeedback(item.distance);
            return (
              <View style={styles.resultCard}>
                <View style={styles.row}>
                  <Image
                    source={monumentImages[item.image]} // ✅ Reemplazo del require dinámico
                    style={styles.image}
                  />
                  <View>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={[styles.distance, { color: feedback.color }]}>
                      {item.distance} km - {feedback.message} {feedback.emoji}
                    </Text>
                  </View>
                </View>
              </View>
            );
          }}
          contentContainerStyle={styles.resultsContainer}
        />

        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>
            ⭐ Has ganado {score} estrella{score !== 1 ? 's' : ''} esta ronda
          </Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('MainMenu')}
        >
          <Text style={styles.buttonText}>Volver al menú principal</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    alignSelf: 'center',
    color: '#1c3f60',
  },
  resultsContainer: {
    paddingBottom: 20,
  },
  resultCard: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: 60,
    height: 40,
    marginRight: 15,
    borderRadius: 5,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  distance: {
    fontSize: 14,
    fontWeight: '500',
  },
  scoreContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1c3f60',
  },
  button: {
    marginTop: 10,
    backgroundColor: '#4a90e2',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
