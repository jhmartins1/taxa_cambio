import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { createStyles } from './styles';
import { useTheme } from '../../contexts/ThemeContext';

export function Input({ value, onChangeText, symbol, onSubmitEditing }) {
    const { colors } = useTheme();
    const [focused, setFocused] = useState(false);
    const styles = createStyles(colors);
    return (
        <View style={[styles.container, focused && { borderBottomColor: colors.primary }]}>
            <Text style={styles.symbol}>{symbol}</Text>
            <TextInput
                accessibilityLabel="Valor a converter"
                style={styles.input}
                placeholder="0,00"
                placeholderTextColor={colors.muted}
                selectionColor={colors.primary}
                value={value}
                onChangeText={onChangeText}
                keyboardType="decimal-pad"
                returnKeyType="done"
                maxLength={16}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onSubmitEditing={onSubmitEditing}
            />
        </View>
    );
}
