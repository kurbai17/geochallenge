import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// Reemplazamos expo-linear-gradient con react-native-linear-gradient
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '../context/UserContext';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const buttons = [
  { id: '1', icon: require('../assets/icon-calendar.png'), label: 'Reto diario' },
  { id: '2', icon: require('../assets/icon-flags.png'), label: 'Banderas y capitales' },
  { id: '3', icon: require('../assets/icon-monuments.png'), label: 'Monumentos' },
  { id: '4', icon: require('../assets/icon-battle.png'), label: 'Batalla' },
];

function AnimatedMenuButton({
  icon,
  label,
  onPress,
}: {
  icon: any;
  label: string;
  onPress?: () => void;
}) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <TouchableWithoutFeedback
      onPressIn={() => (scale.value = withSpring(0.95))}
      onPressOut={() => {
        scale.value = withSpring(1);
        onPress?.();
      }}
    >
      <Animated.View style={[styles.menuButton, animatedStyle]}>
        <Image source={icon} style={styles.buttonIcon} />
        <Text style={styles.buttonText}>{label}</Text>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

export default function MainMenuScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [showDifficultyModal, setShowDifficultyModal] = useState(false);
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);
  const user = useUser();
  const stars = user?.stars ?? 0;

  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  const scaleComing = useSharedValue(0.8);
  const opacityComing = useSharedValue(0);

  useEffect(() => {
    if (showDifficultyModal) {
      scale.value = withTiming(1, { duration: 200 });
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      scale.value = 0.8;
      opacity.value = 0;
    }
  }, [showDifficultyModal]);

  useEffect(() => {
    if (showComingSoonModal) {
      scaleComing.value = withTiming(1, { duration: 200 });
      opacityComing.value = withTiming(1, { duration: 200 });
    } else {
      scaleComing.value = 0.8;
      opacityComing.value = 0;
    }
  }, [showComingSoonModal]);

  const animatedModalStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const animatedComingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleComing.value }],
    opacity: opacityComing.value,
  }));

  const handleButtonPress = (id: string) => {
    if (id === '1') {
      navigation.navigate('DailyChallenge');
    } else if (id === '2') {
      setShowDifficultyModal(true);
    } else if (id === '3') {
      navigation.navigate('MonumentsGame');
    } else if (id === '4') {
      setShowComingSoonModal(true);
    }
  };

  const goToCalendar = () => {
    navigation.navigate('DailyChallenge');
  };

  const selectDifficulty = (level: 'easy' | 'medium' | 'hard') => {
    setShowDifficultyModal(false);
    navigation.navigate('FlagsGame', { difficulty: level });
  };

  return (
    <LinearGradient colors={['#B388EB', '#ADD8E6']} style={styles.gradient}>
      <StatusBar backgroundColor="transparent" barStyle="dark-content" translucent />
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={goToCalendar}>
            <Image source={require('../assets/brain.png')} style={styles.topIcon} />
          </TouchableOpacity>
          <Text style={styles.stars}>⭐ {stars}</Text>
        </View>

        <Image source={require('../assets/logo.png')} style={styles.logo} />

        <FlatList
          data={buttons}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AnimatedMenuButton
              icon={item.icon}
              label={item.label}
              onPress={() => handleButtonPress(item.id)}
            />
          )}
          contentContainerStyle={[styles.menuList, { flexGrow: 1, justifyContent: 'center' }]}
        />
      </SafeAreaView>

      {/* Modal dificultad */}
      <Modal
        transparent
        visible={showDifficultyModal}
        animationType="none"
        onRequestClose={() => setShowDifficultyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Animated.View style={[styles.modalWrapper, animatedModalStyle]}>
              <Text style={styles.modalTitle}>Selecciona el nivel:</Text>
              <Pressable style={styles.modalButton} onPress={() => selectDifficulty('easy')}>
                <Text style={styles.modalButtonText}>Nivel fácil</Text>
              </Pressable>
              <Pressable style={styles.modalButton} onPress={() => selectDifficulty('medium')}>
                <Text style={styles.modalButtonText}>Nivel intermedio</Text>
              </Pressable>
              <Pressable style={styles.modalButton} onPress={() => selectDifficulty('hard')}>
                <Text style={styles.modalButtonText}>Nivel difícil</Text>
              </Pressable>
              <Pressable onPress={() => setShowDifficultyModal(false)} style={styles.cancelButton}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </Pressable>
            </Animated.View>
          </View>
        </View>
      </Modal>

      {/* Modal "Próximamente" */}
      <Modal
        transparent
        visible={showComingSoonModal}
        animationType="none"
        onRequestClose={() => setShowComingSoonModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Animated.View style={[styles.modalWrapper, animatedComingStyle]}>
              <Text style={styles.modalTitle}>🛠 Próximamente</Text>
              <Text style={styles.modalMessage}>
                Estamos trabajando en este modo de juego. ¡Muy pronto disponible!
              </Text>
              <Pressable onPress={() => setShowComingSoonModal(false)} style={styles.cancelButton}>
                <Text style={styles.cancelText}>Cerrar</Text>
              </Pressable>
            </Animated.View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safeArea: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  topIcon: { width: 40, height: 40 },
  stars: { fontSize: 18, fontWeight: 'bold' },
  logo: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 10,
  },
  menuList: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 10,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 15,
    marginBottom: 15,
    borderRadius: 12,
    elevation: 3,
  },
  buttonIcon: { width: 40, height: 40, marginRight: 15 },
  buttonText: {
    fontSize: 18,
    fontFamily: 'Nunito_700Bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    maxWidth: 350,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
  },
  modalWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4a70b3',
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#ADD8E6',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 20,
    alignItems: 'center',
    width: '100%',
  },
  modalButtonText: {
    color: '#1c3f60',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  cancelText: {
    color: '#777',
    fontSize: 16,
    fontWeight: '600',
  },
  modalMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 15,
    color: '#333',
  },
});

