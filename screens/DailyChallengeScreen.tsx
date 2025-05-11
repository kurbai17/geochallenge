import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    FlatList,
    Image,
    Modal,
    Pressable,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '../context/UserContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import { getMonthDays, getTodayKey } from '../utils/dateUtils';

// Reemplazamos expo-linear-gradient por react-native-linear-gradient
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

// Definimos boxSize como una constante aquí
const boxSize = width / 9.3; // Ajusta el tamaño de las celdas en función del ancho de la pantalla

const giftThresholds = [20, 40, 80, 160];
const giftIcon = require('../assets/gift.png');
const logo = require('../assets/logo.png');
const brainIcon = require('../assets/brain.png');
const closeIcon = require('../assets/close.png');

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function DailyChallengeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [starsByDay, setStarsByDay] = useState<Record<string, number>>({});
  const [totalStars, setTotalStars] = useState(0);
  const [showResultModal, setShowResultModal] = useState(false);
  const [todayStars, setTodayStars] = useState(0);
  const [distanceSum, setDistanceSum] = useState(0);
  const [answersCount, setAnswersCount] = useState(0);
  const { stars } = useUser();

  const today = new Date();
  const todayKey = getTodayKey();

  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  const days = getMonthDays(selectedYear, selectedMonth);

  useEffect(() => {
    console.log('DÍAS DEL MES:', days);
  }, [days]);
  
  useEffect(() => {
    const loadStars = async () => {
      let total = 0;
      const newStars: Record<string, number> = {};
      for (const key of days) {
        if (!key) continue;
        const value = await AsyncStorage.getItem(`@dailyStars:${key}`);
        if (value) {
          const num = parseInt(value, 10);
          newStars[key] = num;
          total += num;
        }
      }
      setStarsByDay(newStars);
      setTotalStars(total);
    };

    loadStars();
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    const loadTodayResults = async () => {
      const raw = await AsyncStorage.getItem(`@dailyResult:${todayKey}`);
      if (raw) {
        const data = JSON.parse(raw);
        setTodayStars(data.score);
        setDistanceSum(data.totalDistance);
        setAnswersCount(data.answers);
        setShowResultModal(true);
      }
    };
    loadTodayResults();
  }, []);

  const changeMonth = (direction: 'prev' | 'next') => {
    let newMonth = selectedMonth + (direction === 'next' ? 1 : -1);
    let newYear = selectedYear;

    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }

    const isFuture = newYear > today.getFullYear() || (newYear === today.getFullYear() && newMonth > today.getMonth());
    if (isFuture) return;

    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Hoy he conseguido ${todayStars} ⭐ y me he quedado a ${distanceSum} Km!`,
      });
      const updated = todayStars + 1;
      await AsyncStorage.setItem(`@dailyStars:${todayKey}`, String(updated));
      await AsyncStorage.mergeItem(`@dailyResult:${todayKey}`, JSON.stringify({ score: updated }));
      setTodayStars(updated);
      setTotalStars(prev => prev + 1);
      setShowResultModal(false);
    } catch (e) {
      console.error('Error al compartir resultado', e);
    }
  };

  const renderItem = ({ item }: { item: string }) => {
    // Validar que el item tenga una fecha válida
    if (!item || item.length < 8) {
      return (
        <View style={[styles.dayBox, { backgroundColor: 'transparent' }]} />
      );
    }
  
    const stars = starsByDay[item] || 0;
    const date = new Date(item);
    const isToday = item === todayKey;
    const isFutureDay = date > today;
  
    return (
      <View style={[styles.dayBox, isToday && styles.todayBox]}>
        <Text
          style={[
            styles.dayText,
            isToday && styles.todayText,
            isFutureDay && styles.futureText,
          ]}
        >
          {date.getDate()}
        </Text>
        {stars > 0 && !isFutureDay && (
          <Text style={styles.starText}>⭐ {stars}</Text>
        )}
      </View>
    );
  };
      
  const progressPercent = Math.min(totalStars / giftThresholds[giftThresholds.length - 1], 1);

  return (
    <LinearGradient colors={['#B388EB', '#ADD8E6']} style={styles.container}>
      <SafeAreaView style={styles.safeContainer}>
        <View style={styles.topBar}>
          <View style={styles.topLeft}>
            <Image source={brainIcon} style={styles.brainIcon} />
            <Text style={styles.starsText}>⭐ {stars}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('MainMenu')}>
            <Text style={styles.closeEmoji}>✖️</Text>
          </TouchableOpacity>
        </View>

        <Image source={logo} style={styles.logo} />

        <View style={styles.calendarCard}>
          <View style={styles.monthHeader}>
            <TouchableOpacity onPress={() => changeMonth('prev')}>
              <Text style={styles.arrow}>{'‹'}</Text>
            </TouchableOpacity>
            <Text style={styles.monthLabel}>
              {new Date(selectedYear, selectedMonth).toLocaleString('default', {
                month: 'long',
                year: 'numeric',
              }).toUpperCase()}
            </Text>
            <TouchableOpacity onPress={() => changeMonth('next')}>
              <Text style={styles.arrow}>{'›'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.weekRow}>
            {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d, i) => (
              <Text key={i} style={styles.weekDay}>{d}</Text>
            ))}
          </View>
          <FlatList
            data={days}
            renderItem={renderItem}
            keyExtractor={(item, index) => item + index}
            numColumns={7}
            contentContainerStyle={styles.calendar}
          />
        </View>

        <View style={styles.progressWrapper}>
          <Text style={styles.progressStart}>⭐</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progressPercent * 100}%` }]} />
          </View>
          {giftThresholds.map((threshold, idx) => (
            <View key={idx} style={styles.giftWrapper}>
              <Image source={giftIcon} style={styles.giftIcon} />
              <Text style={styles.giftLabel}>{threshold}</Text>
            </View>
          ))}
        </View>

        <Pressable style={styles.playButtonWrapper} onPress={() => navigation.navigate('DailyChallengeGame')}>
          <View style={styles.playButton}>
            <Text style={styles.playText}>RETO DIARIO</Text>
          </View>
        </Pressable>

        <Modal visible={showResultModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>¡Resumen del reto diario!</Text>
              <Text style={styles.modalText}>⭐ {todayStars} estrellas</Text>
              <Text style={styles.modalText}>📍 {distanceSum} km en {answersCount} respuestas</Text>
              <Pressable style={styles.shareButton} onPress={handleShare}>
                <Text style={styles.shareText}>📤 Comparte tu resultado y gana 1 ⭐</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
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
    justifyContent: 'space-between',
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
  topLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brainIcon: {
    width: 30,
    height: 30,
  },
  starsText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  closeIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    tintColor: '#fff',
  },
  logo: {
    width: 308,
    height: 110,
    resizeMode: 'contain',
    marginBottom: 16,
  },
  calendarCard: {
    backgroundColor: '#ffffffee',
    borderRadius: 20,
    padding: 16,
    width: width * 0.92,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    marginBottom: 20,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  arrow: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00cc44',
    paddingHorizontal: 10,
  },
  monthLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingBottom: 6,
    paddingHorizontal: 10,
  },
  weekDay: {
    width: boxSize,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#666',
  },
  calendar: {
    alignItems: 'flex-start', // antes era 'center'
  },
  
  dayBox: {
    width: boxSize,
    height: boxSize,
    margin: 1,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  todayBox: {
    backgroundColor: '#d6f5e9',
    borderWidth: 2,
    borderColor: '#00cc44',
  },
  dayText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  todayText: {
    color: '#00cc44',
  },
  starText: {
    fontSize: 12,
    marginTop: 2,
    color: '#ffa500',
  },
  progressWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    width: width * 0.9,
    paddingHorizontal: 10,
    gap: 6,
    marginBottom: 20,
  },
  progressStart: {
    fontSize: 20,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#ffffffaa',
    borderRadius: 4,
    overflow: 'hidden',
    marginHorizontal: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ffd700',
  },
  giftWrapper: {
    alignItems: 'center',
  },
  giftIcon: {
    width: 28,
    height: 28,
  },
  giftLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 2,
  },
  playButtonWrapper: {
    marginBottom: 20,
  },
  playButton: {
    backgroundColor: '#00cc44',
    paddingVertical: 14,
    paddingHorizontal: 50,
    borderRadius: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  playText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    width: '80%',
  },
  futureText: {
    color: '#ccc',
  },
  closeEmoji: {
    fontSize: 24,
    color: '#000',
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
  },
  shareButton: {
    backgroundColor: '#00cc44',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 15,
  },
  shareText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
