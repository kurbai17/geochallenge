// context/UserContext.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

type UserContextType = {
  stars: number;
  addStars: (n: number) => Promise<void>;
  resetStars: () => Promise<void>;
  reloadStars: () => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [stars, setStars] = useState(0);

  const loadStars = async () => {
    try {
      const stored = await AsyncStorage.getItem('@stars');
      if (stored !== null) {
        setStars(parseInt(stored, 10));
      } else {
        setStars(0);
      }
    } catch (err) {
      console.error('Error al cargar estrellas:', err);
    }
  };

  useEffect(() => {
    loadStars();
  }, []);

  const addStars = async (n: number) => {
    try {
      const current = await AsyncStorage.getItem('@stars');
      const previous = current ? parseInt(current, 10) : 0;
      const newTotal = previous + n;
      await AsyncStorage.setItem('@stars', newTotal.toString());
      setStars(newTotal);
    } catch (err) {
      console.error('Error al guardar estrellas:', err);
    }
  };

  const resetStars = async () => {
    try {
      await AsyncStorage.setItem('@stars', '0');
      setStars(0);
    } catch (err) {
      console.error('Error al reiniciar estrellas:', err);
    }
  };

  return (
    <UserContext.Provider value={{ stars, addStars, resetStars, reloadStars: loadStars }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);

  // ⚠️ Protección contra fallos del contexto (para builds de producción)
  return context ?? {
    stars: 0,
    addStars: async () => {},
    resetStars: async () => {},
    reloadStars: async () => {},
  };
};
