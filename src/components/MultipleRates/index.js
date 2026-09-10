import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { currencies } from '../../constants/currencies';
import { useTheme } from '../../contexts/ThemeContext';
import { favoriteFirst } from '../../utils/favorites';
import { FavoriteButton } from '../FavoriteButton';

export function MultipleRates({ results, base, favorites, onToggleFavorite, favoritesReady, loading }) {
    const [onlyFavorites, setOnlyFavorites] = useState(false);
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const options = favoriteFirst(currencies, favorites).filter(currency => currency.code !== base && (!onlyFavorites || favorites.includes(currency.code)));

    return (
        <View style={styles.container}>
            <View style={styles.heading}>
                <Text accessibilityRole="header" style={styles.title}>Um valor. Várias moedas.</Text>
                <Text style={styles.subtitle}>Compare os destinos. Favorite o que importa.</Text>
            </View>
            <View style={styles.filters}>
                {[{ value: false, label: 'Todas' }, { value: true, label: 'Favoritas' }].map(filter => (
                    <TouchableOpacity key={filter.label} accessibilityRole="button" accessibilityState={{ selected: onlyFavorites === filter.value }} onPress={() => setOnlyFavorites(filter.value)} style={[styles.filter, onlyFavorites === filter.value && { backgroundColor: colors.accentSoft }]}>
                        {filter.value && <Feather name="star" size={13} color={onlyFavorites ? colors.primary : colors.muted} />}
                        <Text style={[styles.filterText, onlyFavorites === filter.value && { color: colors.primary }]}>{filter.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>
            <View style={styles.list} accessibilityLiveRegion="polite">
                {options.map(currency => {
                    const result = results?.find(item => item.code === currency.code)?.result;
                    const formatted = result === undefined ? '—' : Number(result).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                    return (
                        <View key={currency.code} style={styles.row}>
                            <View style={styles.details}><Text style={styles.code}>{currency.code}</Text><Text style={styles.name}>{currency.name}</Text></View>
                            <Text style={styles.result} numberOfLines={1} adjustsFontSizeToFit accessibilityLabel={`${currency.code}: ${loading ? 'calculando' : formatted}`}>{currency.symbol} {loading ? '···' : formatted}</Text>
                            <FavoriteButton code={currency.code} selected={favorites.includes(currency.code)} disabled={!favoritesReady} onPress={() => onToggleFavorite(currency.code)} />
                        </View>
                    );
                })}
                {!options.length && <View style={styles.empty}><Feather name="star" size={22} color={colors.primary} /><Text style={styles.emptyText}>Marque outras moedas com a estrela em “Todas” para comparar suas favoritas.</Text></View>}
            </View>
        </View>
    );
}

const createStyles = colors => StyleSheet.create({
    container: { marginBottom: 28 },
    heading: { gap: 7, marginBottom: 15 },
    title: { fontSize: 21, color: colors.text, fontWeight: '600', letterSpacing: -0.6 },
    subtitle: { color: colors.muted, fontSize: 12, lineHeight: 18 },
    filters: { flexDirection: 'row', gap: 8, marginBottom: 14 },
    filter: { minHeight: 44, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, borderRadius: 22, borderWidth: 1, borderColor: colors.border },
    filterText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
    list: { borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.cardBackground, overflow: 'hidden' },
    row: { flexDirection: 'row', gap: 4, alignItems: 'center', paddingLeft: 15, paddingRight: 7, paddingVertical: 13, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
    details: { flex: 1, gap: 4 },
    code: { fontSize: 14, fontWeight: '600', color: colors.text },
    name: { fontSize: 10, lineHeight: 14, color: colors.muted },
    result: { flex: 1.15, textAlign: 'right', fontSize: 20, fontWeight: '500', color: colors.primary, fontVariant: ['tabular-nums'] },
    empty: { padding: 24, alignItems: 'center', gap: 12 },
    emptyText: { color: colors.textSecondary, textAlign: 'center', fontSize: 12, lineHeight: 19 },
});
