import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { createStyles } from './styles';
import { useTheme } from '../../contexts/ThemeContext';
import { Calculator } from '../Calculator';
import { calculateAmount } from '../../utils/convertCurrency';

export function Input({ value, onChangeText, symbol, onSubmitEditing }) {
    const { colors } = useTheme();
    const [focused, setFocused] = useState(false);
    const styles = createStyles(colors);
    const calculation = calculateAmount(value);
    const isExpression = /[+*/()×÷−-]/.test(value);
    return (
        <View><View style={[styles.container, focused && { borderBottomColor: colors.primary }]}>
            <Text style={styles.symbol}>{symbol}</Text>
            <TextInput
                accessibilityLabel="Valor a converter"
                style={[styles.input, value.length > 12 && { fontSize: 26, letterSpacing: -0.5 }]}
                placeholder="0,00"
                placeholderTextColor={colors.muted}
                selectionColor={colors.primary}
                value={value}
                onChangeText={onChangeText}
                keyboardType="decimal-pad"
                returnKeyType="done"
                maxLength={120}
                autoCorrect={false}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onSubmitEditing={onSubmitEditing}
            />
        </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <Text accessibilityLiveRegion="polite" style={{ color: colors.textSecondary, fontSize: 12, flex: 1 }}>{isExpression && Number.isFinite(calculation.value) ? `Total: ${calculation.value.toLocaleString('pt-BR', { maximumFractionDigits: 10 })}` : 'Digite um valor ou uma conta'}</Text>
                <Calculator value={value} onApply={onChangeText} />
            </View>
        </View>
    );
}
