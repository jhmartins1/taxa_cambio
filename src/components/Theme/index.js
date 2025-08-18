import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { createStyles } from "./styles";
import { useTheme } from '../../contexts/ThemeContext';

// Componente de botão de tema
function ThemeButton({ themeName, currentTheme, onPress, styles }) {
    const isSelected = themeName === currentTheme;
    const { themes } = useTheme();
    
    // Obtendo as cores de fundo de cada tema
    const themeColors = {
        dark: themes.dark.background,
        light: themes.light.background,
        blue: themes.blue.background,
        green: themes.green.background
    };
    
    return (
        <TouchableOpacity
            onPress={() => onPress(themeName)}
            style={[
                styles.themeButton,
                { backgroundColor: themeColors[themeName] },
                isSelected && styles.themeButtonSelected
            ]}
        >
            <Text style={[styles.themeButtonText, isSelected && styles.themeButtonTextSelected]}>
                {themeName.charAt(0).toUpperCase() + themeName.slice(1)}
            </Text>
        </TouchableOpacity>
    );
}

export function Theme() {
    // Usando o contexto de tema
    const { currentTheme, changeTheme, availableThemes, colors } = useTheme();
    
    // Criando os estilos com as cores do tema atual
    const styles = createStyles(colors);
    
    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView style={styles.scrollView}>
                <View style={styles.content}>
                    <StatusBar style={currentTheme === 'light' ? 'dark' : 'light'} />
                    <View style={styles.header}>
                        <Text style={styles.title}>Temas:</Text>
                        <Text style={styles.maded}>Made By: iJH8</Text>
                    </View>
                    <View style={styles.card}>
                        <Text style={styles.themeLabel}>Escolha um tema:</Text>
                        <View style={styles.themeGrid}>
                            {availableThemes.map((themeName) => (
                                <ThemeButton
                                    key={themeName}
                                    themeName={themeName}
                                    currentTheme={currentTheme}
                                    onPress={changeTheme}
                                    styles={styles}
                                />
                            ))}
                        </View>
                        <Text style={styles.themeDescription}>
                            Tema atual: <Text style={styles.themeHighlight}>{currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1)}</Text>
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}