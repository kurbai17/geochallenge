import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// Reemplazamos expo-linear-gradient por react-native-linear-gradient
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    FlatList,
    Image,
    Pressable,
    Share,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../navigation/AppNavigator';
import { getTotalStars } from '../storage/dailyChallengeStorage';

const { width, height } = Dimensions.get('window');

const logo = require('../assets/logo.png');
const brainIcon = require('../assets/brain.png');

export default function DailyChallengeResultsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'DailyChallengeResults'>>();
  const { score, results = [] } = route.params;

  const [totalStars, setTotalStars] = useState<number>(0);

  useEffect(() => {
    const loadStars = async () => {
      const stars = await getTotalStars();
      setTotalStars(stars);
    };
    loadStars();
  }, []);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `¡He conseguido ${score} estrella${score !== 1 ? 's' : ''} en el reto diario de GeoChallenge! 🌍⭐`,
      });
    } catch (e) {
      console.error('Error al compartir resultado', e);
    }
  };

  return (
    <LinearGradient colors={['#B388EB', '#ADD8E6']} style={styles.container}>
      <SafeAreaView style={styles.safeContainer}>
        <View style={styles.topBar}>
          <View style={styles.leftTop}>
            <Image source={brainIcon} style={styles.brainIcon} />
            <Text style={styles.starCount}>⭐ {totalStars}</Text>
          </View>
          <Pressable onPress={() => navigation.navigate('MainMenu')}>
            <Text style={styles.closeEmoji}>✖️</Text>
          </Pressable>
        </View>

        <Image source={logo} style={styles.logo} />

        <View style={styles.card}>
          <Text style={styles.title}>¡Tus resultados!</Text>
          <Text style={styles.resultText}>⭐ {score} estrella{score !== 1 ? 's' : ''}</Text>

          <View style={styles.scrollContainer}>
            <FlatList
              data={results}
              keyExtractor={(_, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={styles.resultCard}>
                  <Text style={styles.resultItem}>📍 {item.name} — {item.distance} km</Text>
                </View>
              )}
              showsVerticalScrollIndicator={true}
              contentContainerStyle={styles.resultsContainer}
            />
          </View>

          <View style={styles.footerButtons}>
            <Pressable style={styles.shareButton} onPress={handleShare}>
              <Text style={styles.shareText}>📤 Compartir resultado</Text>
            </Pressable>

            <Pressable style={styles.backButton} onPress={() => navigation.navigate('DailyChallenge')}>
              <Text style={styles.backText}>⬅️ Volver al calendario</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 20,
    paddingBottom: 40,
  },
  topBar: {
    width: '100%',
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brainIcon: {
    width: 30,
    height: 30,
    marginRight: 8,
  },
  starCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeEmoji: {
    fontSize: 24,
    color: '#000',
  },
  logo: {
    width: 250,
    height: 250,
    resizeMode: 'contain',
    marginBottom: 0,
    marginTop: -30,
  },
  card: {
    backgroundColor: '#ffffffee',
    borderRadius: 20,
    padding: 24,
    width: width * 0.9,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    marginTop: -10,
    maxHeight: height * 0.75,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  resultText: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 4,
    color: '#444',
  },
  scrollContainer: {
    maxHeight: 200, // ✅ limita solo la parte del scroll
    width: '100%',
  },
  resultsContainer: {
    paddingBottom: 10,
  },
  resultCard: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    width: '100%',
  },
  resultItem: {
    fontSize: 15,
    fontWeight: '500',
  },
  footerButtons: {
    marginTop: 10,
    alignItems: 'center',
    width: '100%',
  },
  shareButton: {
    backgroundColor: '#00cc44',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 20,
    marginTop: 10,
  },
  shareText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  backText: {
    color: '#333',
    fontSize: 15,
    fontWeight: '600',
  },
});
