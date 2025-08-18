import React, { createContext, useState, useContext, useEffect } from 'react';
import { themes } from '../styles/colors';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Chave para armazenar o tema no AsyncStorage
const THEME_STORAGE_KEY = '@TaxaCambio:theme';

// Criando o contexto de tema
const ThemeContext = createContext();

// Hook personalizado para usar o contexto de tema
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  return context;
}

// Provedor do contexto de tema
export function ThemeProvider({ children }) {
  // Estado para armazenar o tema atual
  const [currentTheme, setCurrentTheme] = useState('dark');
  // Estado para armazenar as cores do tema atual
  const [colors, setColors] = useState(themes.dark);

  // Função para alterar o tema
  const changeTheme = async (themeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName);
      setColors(themes[themeName]);
      
      // Salvar o tema no AsyncStorage apenas se estiver disponível
      if (AsyncStorage && typeof AsyncStorage.setItem === 'function') {
        try {
          await AsyncStorage.setItem(THEME_STORAGE_KEY, themeName);
        } catch (error) {
          console.error('Erro ao salvar o tema:', error);
        }
      }
    }
  };

  // Carregar o tema salvo ao iniciar o aplicativo
  useEffect(() => {
    const loadSavedTheme = async () => {
      // Verificar se o AsyncStorage está disponível
      if (AsyncStorage && typeof AsyncStorage.getItem === 'function') {
        try {
          const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
          if (savedTheme && themes[savedTheme]) {
            // Atualizar o tema sem tentar salvar novamente
            setCurrentTheme(savedTheme);
            setColors(themes[savedTheme]);
          }
        } catch (error) {
          console.error('Erro ao carregar o tema:', error);
        }
      }
    };

    loadSavedTheme();
  }, []);

  // Valores disponíveis no contexto
  const value = {
    currentTheme,
    colors,
    changeTheme,
    availableThemes: Object.keys(themes),
    themes // Exportando o objeto themes completo
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}