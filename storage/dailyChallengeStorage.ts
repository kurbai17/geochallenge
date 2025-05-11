import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@daily_challenge_results';

export async function saveDailyStars(date: string, stars: number) {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    const parsed = data ? JSON.parse(data) : {};

    parsed[date] = stars;

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
  } catch (error) {
    console.error('Error saving daily challenge result:', error);
  }
}

export async function getDailyStarsMap(): Promise<Record<string, number>> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error loading daily challenge data:', error);
    return {};
  }
}

// ✅ NUEVA FUNCIÓN: obtiene el total de estrellas acumuladas
export async function getTotalStars(): Promise<number> {
  try {
    const starsMap = await getDailyStarsMap();
    return Object.values(starsMap).reduce((sum, stars) => sum + stars, 0);
  } catch (error) {
    console.error('Error calculating total stars:', error);
    return 0;
  }
}
