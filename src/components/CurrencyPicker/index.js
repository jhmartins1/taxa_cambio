import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { currencies } from '../../constants/currencies';
import { useTheme } from '../../contexts/ThemeContext';

export function CurrencyPicker({ value, onChange, label, disabled }) {
    const { colors } = useTheme();
    const [visible, setVisible] = useState(false);
    const [search, setSearch] = useState('');
    const styles = createStyles(colors);
    const selected = currencies.find(currency => currency.code === value);
    const normalize = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const options = currencies.filter(currency => normalize(`${currency.code} ${currency.name}`).includes(normalize(search.trim())));
    return (
        <>
            <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={`${label}: ${selected.name}. Escolher moeda`}
                accessibilityState={{ expanded: visible, disabled }}
                disabled={disabled}
                onPress={() => { setSearch(''); setVisible(true); }}
                style={styles.trigger}
                activeOpacity={0.7}
            >
                <View style={styles.currencyIcon}><Text style={styles.symbol}>{selected.symbol}</Text></View>
                <Text style={styles.code}>{value}</Text>
                <Feather name="chevron-down" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
            <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
                <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                    <Pressable style={StyleSheet.absoluteFill} onPress={() => setVisible(false)} accessibilityRole="button" accessibilityLabel="Fechar seleção de moeda" />
                    <SafeAreaView style={styles.sheet} accessibilityViewIsModal>
                        <View style={styles.sheetContent}>
                            <View style={styles.heading}>
                                <View><Text style={styles.eyebrow}>{label.toUpperCase()}</Text><Text style={styles.title}>Escolha a moeda</Text></View>
                                <TouchableOpacity style={styles.close} onPress={() => setVisible(false)} accessibilityRole="button" accessibilityLabel="Fechar seleção de moeda"><Feather name="x" size={22} color={colors.text} /></TouchableOpacity>
                            </View>
                            <View style={styles.search}>
                                <Feather name="search" size={18} color={colors.textSecondary} />
                                <TextInput style={styles.searchInput} accessibilityLabel="Buscar moeda" placeholder="Buscar nome ou código" placeholderTextColor={colors.muted} value={search} onChangeText={setSearch} autoCorrect={false} />
                            </View>
                            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.options}>
                                {options.map(currency => (
                                    <TouchableOpacity key={currency.code} style={[styles.option, value === currency.code && { backgroundColor: colors.accentSoft }]} accessibilityRole="button" accessibilityState={{ selected: value === currency.code }} onPress={() => { onChange(currency.code); setVisible(false); }}>
                                        <View style={styles.optionIcon}><Text style={styles.symbol}>{currency.symbol}</Text></View>
                                        <View style={styles.optionName}><Text style={styles.code}>{currency.code}</Text><Text style={styles.name}>{currency.name}</Text></View>
                                        {value === currency.code && <Feather name="check" size={20} color={colors.primary} />}
                                    </TouchableOpacity>
                                ))}
                                {!options.length && <Text style={styles.empty}>Nenhuma moeda encontrada.</Text>}
                            </ScrollView>
                        </View>
                    </SafeAreaView>
                </KeyboardAvoidingView>
            </Modal>
        </>
    );
}

const createStyles = colors => StyleSheet.create({
    trigger: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: colors.inputBackground, borderRadius: 24, paddingLeft: 7, paddingRight: 12, borderWidth: 1, borderColor: colors.border },
    currencyIcon: { width: 29, height: 29, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.accentSoft },
    symbol: { color: colors.primary, fontSize: 14, fontWeight: '600' },
    code: { color: colors.text, fontSize: 15, fontWeight: '600' },
    overlay: { flex: 1, justifyContent: 'flex-end', alignItems: 'center', backgroundColor: '#00000099' },
    sheet: { width: '100%', maxWidth: 560, maxHeight: '90%', backgroundColor: colors.cardBackground, borderTopLeftRadius: 28, borderTopRightRadius: 28 },
    sheetContent: { padding: 24, paddingBottom: 30, flexShrink: 1 },
    heading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 },
    eyebrow: { fontSize: 10, color: colors.primary, letterSpacing: 2, marginBottom: 8, fontWeight: '700' },
    title: { fontSize: 24, color: colors.text, fontWeight: '600', letterSpacing: -0.5 },
    close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22, backgroundColor: colors.inputBackground },
    search: { flexDirection: 'row', gap: 12, alignItems: 'center', backgroundColor: colors.inputBackground, borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingHorizontal: 15, marginBottom: 16 },
    searchInput: { flex: 1, minHeight: 48, color: colors.text, fontSize: 15, ...Platform.select({ web: { outlineStyle: 'none' } }) },
    options: { gap: 4 },
    option: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 12, borderRadius: 14 },
    optionIcon: { height: 40, width: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: colors.inputBackground },
    optionName: { flex: 1, gap: 3 },
    name: { fontSize: 12, color: colors.textSecondary },
    empty: { color: colors.textSecondary, padding: 24, textAlign: 'center' },
});
