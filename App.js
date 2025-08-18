import React, { useState } from 'react';
import { TouchableOpacity, Text } from 'react-native';
import Home from './src/components/Home';
import { Theme } from './src/components/Theme';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';

// Componente de navegação simples
function AppContent() {
    const [currentScreen, setCurrentScreen] = useState('home');
    const { colors } = useTheme();
    
    // Estilos para o botão de navegação
    const navButtonStyle = {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: colors.primary,
        padding: 12,
        borderRadius: 30,
        zIndex: 100,
    };
    
    const navTextStyle = {
        color: '#ffffff',
        fontWeight: 'bold',
    };
    
    // Alternar entre as telas
    const toggleScreen = () => {
        setCurrentScreen(currentScreen === 'home' ? 'theme' : 'home');
    };
    
    return (
        <>
            {currentScreen === 'home' ? <Home /> : <Theme />}
            
            <TouchableOpacity style={navButtonStyle} onPress={toggleScreen}>
                <Text style={navTextStyle}>
                    {currentScreen === 'home' ? 'Temas' : 'Início'}
                </Text>
            </TouchableOpacity>
        </>
    );
}

export default function App() {
    return (
        <ThemeProvider>
            <AppContent />
        </ThemeProvider>
    );
}
