import { Platform, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Feather from '@expo/vector-icons/Feather';
import { createStyles } from './styles';
import { useTheme } from '../../contexts/ThemeContext';
import { Credit } from '../Credit';

const themeDetails = {
    dark: { name: 'Grafite', description: 'Um clássico com um toque de energia.' },
    light: { name: 'Areia', description: 'Leve, claro e naturalmente simples.' },
    blue: { name: 'Oceano', description: 'Novos horizontes em tons de azul.' },
    green: { name: 'Floresta', description: 'Um respiro de verde no seu dia.' },
};

export function Theme({ onClose }) {
    const { currentTheme, changeTheme, availableThemes, colors, themes } = useTheme();
    const styles = createStyles(colors);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style={currentTheme === 'light' ? 'dark' : 'light'} />
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.content}>
                    <View style={styles.navigation}>
                        <TouchableOpacity style={styles.backButton} onPress={onClose} accessibilityRole="button" accessibilityLabel="Voltar ao conversor">
                            <Feather name="arrow-left" size={21} color={colors.text} />
                        </TouchableOpacity>
                        <Text style={styles.navigationTitle}>APARÊNCIA</Text>
                        <View style={styles.navigationSpacer} />
                    </View>
                    <View style={styles.header}>
                        <Text accessibilityRole="header" style={styles.title}>Do seu jeito<Text style={{ color: colors.primary }}>.</Text></Text>
                        <Text style={styles.subtitle}>Escolha as cores da sua próxima viagem.</Text>
                    </View>
                    <View style={styles.themeGrid}>
                        {availableThemes.map(themeName => {
                            const palette = themes[themeName];
                            const selected = currentTheme === themeName;
                            return (
                                <TouchableOpacity
                                    key={themeName}
                                    style={[styles.themeOption, selected && { borderColor: colors.primary }]}
                                    onPress={() => changeTheme(themeName)}
                                    accessibilityRole="radio"
                                    accessibilityState={{ checked: selected }}
                                    accessibilityLabel={themeDetails[themeName].name}
                                    activeOpacity={0.8}
                                >
                                    <View style={[styles.preview, { backgroundColor: palette.background }]} accessible={false} {...(Platform.OS === 'web' ? { 'aria-hidden': true } : {})}>
                                        <View style={styles.previewHeader}><View style={[styles.previewLogo, { backgroundColor: palette.primary }]} /><View style={[styles.previewLine, { backgroundColor: palette.text }]} /></View>
                                        <View style={[styles.previewCard, { backgroundColor: palette.cardBackground, borderColor: palette.border }]}>
                                            <View style={[styles.previewLine, { backgroundColor: palette.textSecondary, width: '40%' }]} />
                                            <View style={[styles.previewValue, { backgroundColor: palette.text }]} />
                                            <View style={[styles.previewRule, { backgroundColor: palette.border }]} />
                                            <View style={[styles.previewValue, { backgroundColor: palette.primary, width: '65%' }]} />
                                            <View style={[styles.previewCta, { backgroundColor: palette.primary }]} />
                                        </View>
                                    </View>
                                    <View style={styles.optionHeading}>
                                        <Text style={styles.themeName}>{themeDetails[themeName].name}</Text>
                                        <View style={[styles.radio, selected && { backgroundColor: colors.primary, borderColor: colors.primary }]}>
                                            {selected && <Feather name="check" size={12} color={colors.onPrimary} />}
                                        </View>
                                    </View>
                                    <Text style={styles.description}>{themeDetails[themeName].description}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                    <View style={styles.savedNote}><Feather name="check-circle" size={15} color={colors.primary} /><Text style={styles.savedText}>Seu tema é salvo automaticamente neste dispositivo.</Text></View>
                    <View style={styles.footer}><Credit /></View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
