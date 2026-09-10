import { useState } from 'react';
import { ActivityIndicator, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { useTheme } from '../../contexts/ThemeContext';
import { HISTORY_LIMIT } from '../../services/historyStore';

const formatAmount = value => Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 10 });
const formatTime = value => new Date(value).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

function HistoryEntry({ entry, onReuse, onRemove, disabled, styles, colors }) {
    const [expanded, setExpanded] = useState(false);
    const multiple = entry.mode === 'multiple';
    const result = entry.results[0];
    return (
        <View style={styles.card}>
            <View style={styles.row}><Text style={styles.date}>{formatTime(entry.createdAt)}</Text><TouchableOpacity style={styles.iconButton} onPress={onRemove} disabled={disabled} accessibilityRole="button" accessibilityLabel={`Excluir conversão de ${entry.expression} ${entry.fromCurrency}`}><Feather name="trash-2" size={16} color={colors.muted} /></TouchableOpacity></View>
            <Text style={styles.amount}>{formatAmount(entry.amount)} <Text style={styles.currency}>{entry.fromCurrency}</Text></Text>
            <Text style={styles.expression}>Valor digitado: {entry.expression}</Text>
            {!multiple && <Text style={styles.result}>→ {formatAmount(result.result)} {result.code}</Text>}
            <View style={styles.meta}><Feather name={entry.source === 'cache' ? 'wifi-off' : 'clock'} size={12} color={colors.primary} /><Text style={styles.metaText}>{entry.source === 'cache' ? 'Cotação salva' : entry.source === 'identity' ? 'Mesma moeda' : 'Consulta online'}{entry.quoteDate ? ` · Cotação de ${entry.quoteDate.split('-').reverse().join('/')}` : ''}</Text></View>
            {!multiple && <Text style={styles.rate}>1 {entry.fromCurrency} = {result.rate.toLocaleString('pt-BR', { maximumFractionDigits: 6 })} {result.code}</Text>}
            {multiple && <TouchableOpacity style={styles.expand} onPress={() => setExpanded(!expanded)} accessibilityRole="button" accessibilityState={{ expanded }}><Text style={styles.expandText}>{expanded ? 'Ocultar resultados' : `Ver ${entry.results.length} resultados`}</Text><Feather name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={colors.primary} /></TouchableOpacity>}
            {multiple && expanded && entry.results.map(item => <View key={item.code} style={styles.detail}><View style={{ flex: 1 }}><Text style={styles.detailCode}>{item.code}</Text><Text style={styles.rate}>1 {entry.fromCurrency} = {item.rate.toLocaleString('pt-BR', { maximumFractionDigits: 6 })} {item.code}</Text></View><Text style={styles.detailAmount}>{formatAmount(item.result)}</Text></View>)}
            <TouchableOpacity style={styles.reuse} onPress={() => onReuse(entry)} accessibilityRole="button" accessibilityLabel={`Usar novamente ${entry.expression} ${entry.fromCurrency}`}><Feather name="rotate-ccw" size={14} color={colors.primary} /><Text style={styles.reuseText}>Usar novamente</Text><Feather name="arrow-up-right" size={14} color={colors.primary} /></TouchableOpacity>
        </View>
    );
}

export function History({ history, onClose, onReuse }) {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const [confirmClear, setConfirmClear] = useState(false);
    const [undo, setUndo] = useState([]);

    async function remove(entry) {
        if (await history.remove(entry.id)) setUndo([entry]);
    }

    async function clear() {
        const previous = history.entries;
        if (await history.clear()) { setUndo(previous); setConfirmClear(false); }
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={styles.content}>
                    <View style={styles.navigation}><TouchableOpacity style={styles.iconButton} onPress={onClose} accessibilityRole="button" accessibilityLabel="Fechar histórico"><Feather name="arrow-left" size={22} color={colors.text} /></TouchableOpacity><Text style={styles.eyebrow}>SUAS CONVERSÕES</Text><TouchableOpacity style={styles.iconButton} disabled={history.busy || !history.entries.length} onPress={() => setConfirmClear(true)} accessibilityRole="button" accessibilityLabel="Limpar histórico"><Feather name="trash-2" size={18} color={!history.entries.length ? colors.muted : colors.text} /></TouchableOpacity></View>
                    <Text accessibilityRole="header" style={styles.title}>Seu histórico<Text style={{ color: colors.primary }}>.</Text></Text>
                    <Text style={styles.subtitle}>As últimas {HISTORY_LIMIT} conversões neste dispositivo. Os resultados mantêm a cotação usada naquele momento.</Text>
                    {history.error !== '' && <TouchableOpacity onPress={history.refresh} style={styles.notice} accessibilityRole="button"><Text accessibilityRole="alert" style={{ color: colors.error }}>{history.error}</Text><Text style={styles.reuseText}>Tentar carregar novamente</Text></TouchableOpacity>}
                    {confirmClear && <View style={styles.notice}><Text style={styles.confirmTitle}>Limpar todas as conversões?</Text><Text style={styles.subtitle}>Você pode desfazer enquanto esta tela estiver aberta.</Text><View style={styles.row}><TouchableOpacity style={styles.reuse} onPress={() => setConfirmClear(false)} accessibilityRole="button"><Text style={styles.reuseText}>Cancelar</Text></TouchableOpacity><TouchableOpacity style={styles.reuse} disabled={history.busy} onPress={clear} accessibilityRole="button" accessibilityLabel="Confirmar limpeza do histórico"><Text style={{ color: colors.error }}>Limpar histórico</Text></TouchableOpacity></View></View>}
                    {undo.length > 0 && <View style={styles.undo}><Text style={styles.metaText}>{undo.length === 1 ? 'Conversão excluída.' : 'Histórico limpo.'}</Text><TouchableOpacity style={styles.reuse} disabled={history.busy} onPress={async () => { if (await history.restore(undo)) setUndo([]); }} accessibilityRole="button"><Text style={styles.reuseText}>Desfazer</Text></TouchableOpacity></View>}
                    {history.busy && <ActivityIndicator color={colors.primary} style={{ marginBottom: 18 }} />}
                    {!history.entries.length && !history.busy && <View style={styles.empty}><Feather name="clock" size={34} color={colors.primary} /><Text style={styles.emptyTitle}>Cada conversão tem uma história.</Text><Text style={styles.emptyText}>Converta um valor para encontrar o resultado aqui, mesmo sem internet.</Text><TouchableOpacity style={styles.reuse} onPress={onClose} accessibilityRole="button"><Text style={styles.reuseText}>Ir para o conversor</Text></TouchableOpacity></View>}
                    {history.entries.map(entry => <HistoryEntry key={entry.id} entry={entry} onReuse={onReuse} onRemove={() => remove(entry)} disabled={history.busy} styles={styles} colors={colors} />)}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const createStyles = colors => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
    scroll: { flexGrow: 1, alignItems: 'center' },
    content: { width: '100%', maxWidth: 520, padding: 24, paddingBottom: 36 },
    navigation: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 30 },
    iconButton: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
    eyebrow: { fontSize: 10, letterSpacing: 2, color: colors.muted, fontWeight: '600' },
    title: { fontSize: 36, fontWeight: '600', letterSpacing: -1.5, color: colors.text },
    subtitle: { fontSize: 12, lineHeight: 19, color: colors.textSecondary, marginTop: 10, marginBottom: 22 },
    card: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.cardBackground, padding: 18, borderRadius: 22, marginBottom: 14 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    date: { fontSize: 11, color: colors.muted },
    amount: { color: colors.text, fontSize: 26, fontWeight: '600', marginTop: 3 },
    currency: { fontSize: 15, color: colors.textSecondary },
    expression: { color: colors.muted, fontSize: 11, marginTop: 8, lineHeight: 16 },
    result: { color: colors.primary, fontSize: 23, fontWeight: '500', marginTop: 16 },
    meta: { flexDirection: 'row', gap: 6, alignItems: 'center', marginTop: 18 },
    metaText: { fontSize: 10, lineHeight: 16, color: colors.textSecondary, flexShrink: 1 },
    rate: { color: colors.muted, fontSize: 10, lineHeight: 16, marginTop: 5 },
    reuse: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 5, marginTop: 6 },
    reuseText: { color: colors.primary, fontSize: 12, fontWeight: '600' },
    expand: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
    expandText: { fontSize: 13, color: colors.primary },
    detail: { flexDirection: 'row', gap: 10, alignItems: 'center', paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.border },
    detailCode: { fontSize: 12, color: colors.text },
    detailAmount: { color: colors.primary, fontSize: 16, flexShrink: 1 },
    notice: { padding: 16, borderRadius: 16, backgroundColor: colors.cardBackground, marginBottom: 16 },
    confirmTitle: { color: colors.text, fontSize: 15, fontWeight: '600' },
    undo: { paddingHorizontal: 14, backgroundColor: colors.accentSoft, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
    empty: { paddingVertical: 60, alignItems: 'center', gap: 14 },
    emptyTitle: { fontSize: 19, color: colors.text, fontWeight: '500', textAlign: 'center' },
    emptyText: { color: colors.textSecondary, textAlign: 'center', fontSize: 12, lineHeight: 19 },
});
