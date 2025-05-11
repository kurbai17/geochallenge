import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useRef, useState } from 'react';
import {
    Dimensions,
    Image,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import MapView, {
    Marker,
    Polyline,
    UrlTile,
} from 'react-native-maps';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import monuments from '../assets/data/monuments.json';
import monumentImages from '../assets/images/monuments/monumentImages';
import { RootStackParamList } from '../navigation/AppNavigator';

const { height } = Dimensions.get('window');

type Monument = {
  name: string;
  latitude: number;
  longitude: number;
  image: string;
  radius: number;
};

type RoundResult = {
  name: string;
  image: string;
  distance: number;
};

type RouteProps = RouteProp<RootStackParamList, 'MonumentsGame'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

function haversineDistance(coord1: { latitude: number; longitude: number }, coord2: { latitude: number; longitude: number }) {
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
}

export default function MonumentsGameScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavigationProp>();

  const [countdown, setCountdown] = useState(10);
  const [currentMonument, setCurrentMonument] = useState<Monument | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [results, setResults] = useState<RoundResult[]>([]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mapRef = useRef<MapView | null>(null);
  const redMarkerScale = useSharedValue(0);

  useEffect(() => {
    startNewRound();
  }, []);

  const startNewRound = () => {
    const available = monuments.filter(m => !results.find(r => r.name === m.name));
  
    if (results.length === 10 || available.length === 0) {
      navigation.navigate('MonumentsResults', {
        results: results.map(r => ({
          name: r.name,
          image: r.image,
          distance: r.distance,
        })),
      });
      return;
    }
  
    const random = available[Math.floor(Math.random() * available.length)];
    setCurrentMonument(random);
    setCountdown(10);
    setSelectedLocation(null);
    setDistance(null);
    redMarkerScale.value = 0;
  
    if (timerRef.current) clearInterval(timerRef.current);
  
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        const next = prev - 1;
  
        if (next <= 0) {
          clearInterval(timerRef.current!);
  
          if (!selectedLocation && random) {
            // Usuario no tocó el mapa
            setResults(prev => [
              ...prev,
              {
                name: random.name,
                image: random.image,
                distance: 9999, // una distancia muy alta para marcar como incorrecta
              },
            ]);
  
            setTimeout(() => {
              startNewRound();
            }, 1500);
          }
        }
  
        return next;
      });
    }, 1000);
  
    mapRef.current?.animateToRegion({
      latitude: 20,
      longitude: 0,
      latitudeDelta: 100,
      longitudeDelta: 100,
    }, 1000);
  };
  
  const handleMapPress = ({ nativeEvent }: { nativeEvent: { coordinate: { latitude: number; longitude: number } } }) => {
    const { latitude, longitude } = nativeEvent.coordinate;
    const tapped = { latitude, longitude };
    setSelectedLocation(tapped);
    redMarkerScale.value = 0;
    redMarkerScale.value = withSpring(1, { damping: 5 });

    if (currentMonument) {
      const correct = {
        latitude: currentMonument.latitude,
        longitude: currentMonument.longitude,
      };
      const dist = haversineDistance(tapped, correct);
      setDistance(dist);

      setResults(prev => [
        ...prev,
        {
          name: currentMonument.name,
          image: currentMonument.image,
          distance: dist,
        },
      ]);

      mapRef.current?.fitToCoordinates([tapped, correct], {
        edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
        animated: true,
      });

      setTimeout(() => {
        startNewRound();
      }, 2000);
    }
  };

  const animatedMarkerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: redMarkerScale.value }],
  }));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topSection}>
        {currentMonument && (
          <>
            <Image
              source={monumentImages[currentMonument.image]} // ← imagen estática
              style={styles.image}
              resizeMode="contain"
            />
            <Text style={styles.question}>
              ¿Dónde está {currentMonument.name}?
            </Text>
            <Text style={styles.timer}>⏳ {countdown}s</Text>
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

        {currentMonument && selectedLocation && (
          <>
            <Marker
              coordinate={{
                latitude: currentMonument.latitude,
                longitude: currentMonument.longitude,
              }}
            >
              <View style={styles.blackMarker} />
            </Marker>
            <Polyline
              coordinates={[
                selectedLocation,
                {
                  latitude: currentMonument.latitude,
                  longitude: currentMonument.longitude,
                },
              ]}
              strokeColor="black"
              strokeWidth={2}
              lineDashPattern={[10, 5]}
            />
          </>
        )}
      </MapView>

      {distance !== null && (
        <View style={styles.bottomBar}>
          <Text style={styles.bottomText}>
            📏 Te has quedado a {distance} km del monumento
          </Text>
        </View>
      )}
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
  blackMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'black',
    borderWidth: 2,
    borderColor: '#fff',
  },
});
