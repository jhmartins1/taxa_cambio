import { useState } from 'react';
import { Linking, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { useTheme } from '../../contexts/ThemeContext';

const INSTAGRAM_URL = 'https://www.instagram.com/jh.martins1/';

export function Credit() {
    const { colors } = useTheme();
    const [error, setError] = useState(false);
    async function openInstagram() {
        try {
            setError(false);
            await Linking.openURL(INSTAGRAM_URL);
        } catch {
            setError(true);
        }
    }
    return (
        <View style={styles.container}>
            <TouchableOpacity
                accessibilityRole="link"
                accessibilityLabel="Made by 0xJHM. Abrir Instagram"
                {...(Platform.OS === 'web' ? { href: INSTAGRAM_URL, hrefAttrs: { target: '_blank', rel: 'noopener noreferrer' } } : { onPress: openInstagram })}
                style={styles.link}
                activeOpacity={0.7}
            >
                <Text style={[styles.text, { color: colors.muted }]}>Made by <Text style={{ color: colors.text, fontWeight: '600' }}>0xJHM</Text></Text>
                <Feather name="instagram" size={14} color={colors.muted} />
                <Feather name="arrow-up-right" size={12} color={colors.muted} />
            </TouchableOpacity>
            {error && <Text accessibilityRole="alert" style={{ color: colors.error, fontSize: 12 }}>Não foi possível abrir. Tente novamente.</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { alignItems: 'center' },
    link: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, paddingHorizontal: 16 },
    text: { fontSize: 12, letterSpacing: 0.3 },
});
