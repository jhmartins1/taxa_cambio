import { StyleSheet, TouchableOpacity } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { useTheme } from '../../contexts/ThemeContext';

export function FavoriteButton({ code, selected, onPress, disabled }) {
    const { colors } = useTheme();
    return (
        <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={`${selected ? 'Remover' : 'Adicionar'} ${code} ${selected ? 'dos' : 'aos'} favoritos`}
            accessibilityState={{ selected, disabled }}
            onPress={onPress}
            disabled={disabled}
            style={[styles.button, { backgroundColor: selected ? colors.accentSoft : 'transparent', opacity: disabled ? 0.4 : 1 }]}
        >
            <Feather name="star" size={18} color={selected ? colors.primary : colors.muted} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: { width: 44, height: 44, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
});
