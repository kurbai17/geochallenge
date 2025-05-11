import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useRef, useState } from 'react';
import { useUser } from '../context/UserContext';

import {
    Dimensions,
    Image,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import MapView, { Marker, Polyline, UrlTile } from 'react-native-maps';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import countries from '../assets/data/countries.json';
import monuments from '../assets/data/monuments.json';
import monumentImages from '../assets/images/monuments/monumentImages';
import { RootStackParamList } from '../navigation/AppNavigator';
import { saveDailyStars } from '../storage/dailyChallengeStorage';

const { height } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type ChallengeItem =
  | { type: 'monument'; name: string; latitude: number; longitude: number; image: string }
  | { type: 'flag'; country: string; latitude: number; longitude: number; flag: string };

export default function DailyChallengeGameScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { addStars } = useUser(); // 👈 así accedes a la función


  const [currentItem, setCurrentItem] = useState<ChallengeItem | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [distances, setDistances] = useState<number[]>([]);
  const [results, setResults] = useState<{ name: string; distance: number }[]>([]);

  const redMarkerScale = useSharedValue(0);
  const mapRef = useRef<MapView | null>(null);

  useEffect(() => {
    loadNextItem();

    const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
      
            // Si no se respondió, se registra como incorrecto (opcional)
            if (currentItem && selectedLocation === null) {
              const name = currentItem.type === 'monument'
                ? currentItem.name
                : `Capital de ${currentItem.country}`;
              setResults(prev => [...prev, { name, distance: 9999 }]);
              setDistances(prev => [...prev, 9999]);
            }
      
            finishChallenge();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      

    return () => clearInterval(timer);
  }, []);

  const finishChallenge = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      await saveDailyStars(today, score);
      await addStars(score); // ⭐ suma al contador global
    } catch (e) {
      console.error('Error al guardar las estrellas del reto diario', e);
    }
  
    navigation.navigate('DailyChallengeResults', {
      score,
      distances,
      results,
      answers: results.length,
    });
  };
  
  const loadNextItem = () => {
    const random = Math.random() < 0.5;
    if (random) {
      const item = monuments[Math.floor(Math.random() * monuments.length)];
      setCurrentItem({
        type: 'monument',
        name: item.name,
        latitude: item.latitude,
        longitude: item.longitude,
        image: item.image,
      });
    } else {
      const item = countries[Math.floor(Math.random() * countries.length)];
      setCurrentItem({
        type: 'flag',
        country: item.name,
        latitude: item.latitude,
        longitude: item.longitude,
        flag: item.flag,
      });
    }

    setSelectedLocation(null);
    setDistance(null);
    redMarkerScale.value = 0;
  };

  const handleMapPress = ({ nativeEvent }: { nativeEvent: { coordinate: { latitude: number; longitude: number } } }) => {
    const { latitude, longitude } = nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });
    redMarkerScale.value = withSpring(1, { damping: 5 });

    if (!currentItem) return;

    const correct = {
      latitude: currentItem.latitude,
      longitude: currentItem.longitude,
    };
    const dist = haversineDistance({ latitude, longitude }, correct);
    setDistance(dist);
    setDistances(prev => [...prev, dist]);

    const name = currentItem.type === 'monument'
      ? currentItem.name
      : `Capital de ${currentItem.country}`;
    setResults(prev => [...prev, { name, distance: dist }]);

    if (dist <= 100) {
      setScore(prev => prev + 1);
    }

    mapRef.current?.fitToCoordinates([correct, { latitude, longitude }], {
      edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
      animated: true,
    });

    setTimeout(() => {
      loadNextItem();
    }, 1000);
  };

  const haversineDistance = (
    coord1: { latitude: number; longitude: number },
    coord2: { latitude: number; longitude: number }
  ) => {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(coord2.latitude - coord1.latitude);
    const dLon = toRad(coord2.longitude - coord1.longitude);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(coord1.latitude)) *
      Math.cos(toRad(coord2.latitude)) *
      Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  };

  const animatedMarkerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: redMarkerScale.value }],
  }));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topSection}>
        {currentItem && (
          <>
            {currentItem.type === 'monument' ? (
              <Image
                source={monumentImages[currentItem.image]}
                style={styles.image}
                resizeMode="contain"
              />
            ) : (
              <Image
                source={{ uri: currentItem.flag }}
                style={styles.image}
                resizeMode="contain"
              />
            )}
            <Text style={styles.question}>
              ¿Dónde está {currentItem.type === 'monument' ? currentItem.name : `la capital de ${currentItem.country}`}?
            </Text>
            <Text style={styles.timer}>⏳ {timeLeft}s</Text>
          </>
        )}
      </View>

      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: 20,
          longitude: 0,
          latitudeDelta: 100,
          longitudeDelta: 100,
        }}
        onPress={handleMapPress}
      >
        <UrlTile urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png" maximumZ={19} />

        {selectedLocation && (
          <Marker coordinate={selectedLocation}>
            <Animated.View style={[styles.animatedMarker, animatedMarkerStyle]}>
              <View style={styles.innerRedCircle} />
            </Animated.View>
          </Marker>
        )}

        {selectedLocation && currentItem && distance !== null && (
          <>
            <Marker
              coordinate={{
                latitude: currentItem.latitude,
                longitude: currentItem.longitude,
              }}
            >
              <View style={styles.blackMarker} />
            </Marker>

            <Polyline
              coordinates={[
                selectedLocation,
                {
                  latitude: currentItem.latitude,
                  longitude: currentItem.longitude,
                },
              ]}
              strokeColor="black"
              strokeWidth={2}
              lineDashPattern={[10, 5]}
            />
          </>
        )}
      </MapView>

      <View style={styles.bottomBar}>
        <Text style={styles.bottomText}>⭐ {score} estrella{score !== 1 ? 's' : ''}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topSection: {
    height: height * 0.25,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#ffffffcc',
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  blackMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'black',
    borderWidth: 2,
    borderColor: '#fff',
  },
  image: {
    width: 120,
    height: 70,
    marginBottom: 10,
  },
  question: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  timer: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  map: {
    flex: 1,
  },
  bottomBar: {
    backgroundColor: '#fff',
    padding: 15,
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  bottomText: {
    fontSize: 16,
    fontWeight: '600',
  },
  animatedMarker: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerRedCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'red',
    borderWidth: 2,
    borderColor: '#fff',
  },
});
