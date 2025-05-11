import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { RootStackParamList } from '../navigation/AppNavigator';

// Reemplazamos expo-auth-session con react-native-app-auth
import { authorize } from 'react-native-app-auth';

// Reemplazamos expo-linear-gradient con react-native-linear-gradient
import LinearGradient from 'react-native-linear-gradient';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

export default function WelcomeScreen({ navigation }: Props) {
  const redirectUri = 'geochallenge://redirect'; // El URI para redirección

  const config = {
    clientId: 'YOUR_CLIENT_ID', // Reemplázalo con tu clientId de Google
    redirectUrl: redirectUri,
    scopes: ['openid', 'profile', 'email'],
    serviceConfiguration: {
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/auth',
      tokenEndpoint: 'https://oauth2.googleapis.com/token',
    },
  };

  // Función para manejar el login con Google
  const handleLogin = async () => {
    try {
      const result = await authorize(config);  // Usamos directamente authorize
      console.log(result); // Aquí puedes guardar el token y los datos del usuario
      navigation.navigate('MainMenu');
    } catch (error) {
      Alert.alert('Error', 'Hubo un problema al iniciar sesión.');
      console.error('Google login error:', error);
    }
  };

  return (
    <LinearGradient colors={['#B388EB', '#ADD8E6']} style={styles.container}>
      <Image
        source={require('../assets/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Iniciar sesión con Google</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { marginTop: 20 }]}
        onPress={() => navigation.navigate('MainMenu')}
      >
        <Text style={styles.buttonText}>Entrar sin iniciar sesión</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 25,
    elevation: 5,
  },
  buttonText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 18,
    color: '#333',
  },
});
