import { Text, View } from 'react-native';
import { createStyles } from './styles';
import { useTheme } from '../../contexts/ThemeContext';

export function ResultCard({ result, symbol, loading }) {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const formatted = result === '' ? '—' : Number(result).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return (
        <View style={styles.container} accessibilityLiveRegion="polite" accessibilityLabel={loading ? 'Calculando conversão' : `Resultado: ${symbol} ${formatted}`}>
            <Text style={styles.symbol}>{symbol}</Text>
            <Text adjustsFontSizeToFit numberOfLines={1} style={[styles.amount, result === '' && { color: colors.muted }]}>{loading ? '···' : formatted}</Text>
        </View>
    );
}
