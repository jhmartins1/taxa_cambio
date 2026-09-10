import { useRef, useState } from 'react';
import { Keyboard, Modal, Platform, Pressable, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { useTheme } from '../../contexts/ThemeContext';
import { calculateAmount } from '../../utils/convertCurrency';

const keys = ['C', '(', ')', '⌫', '7', '8', '9', '÷', '4', '5', '6', '×', '1', '2', '3', '−', '0', ',', '+', '='];
const labels = { C: 'Limpar conta', '⌫': 'Apagar último caractere', '÷': 'Dividir', '×': 'Multiplicar', '−': 'Subtrair', '+': 'Somar', '=': 'Resolver conta', '(': 'Abrir parênteses', ')': 'Fechar parênteses', ',': 'Vírgula decimal' };

export function Calculator({ value, onApply }) {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const [visible, setVisible] = useState(false);
    const [draft, setDraft] = useState('');
    const selection = useRef({ start: 0, end: 0 });
    const inputRef = useRef(null);
    const calculation = calculateAmount(draft);
    const valid = Number.isFinite(calculation.value);

    function open() {
        Keyboard.dismiss();
        setDraft(value);
        selection.current = { start: value.length, end: value.length };
        setVisible(true);
    }

    function keyPress(key) {
        if (key === '=') {
            if (valid) {
                const next = calculation.value.toLocaleString('pt-BR', { useGrouping: false, maximumFractionDigits: 15 });
                setDraft(next);
                selection.current = { start: next.length, end: next.length };
            }
            return;
        }
        if (key === 'C') { setDraft(''); selection.current = { start: 0, end: 0 }; return; }
        const { start, end } = selection.current;
        const left = key === '⌫' && start === end ? Math.max(0, start - 1) : start;
        const insertion = key === '⌫' ? '' : key;
        const next = draft.slice(0, left) + insertion + draft.slice(end);
        if (next.length > 120) return;
        setDraft(next);
        const cursor = left + insertion.length;
        selection.current = { start: cursor, end: cursor };
        inputRef.current?.setNativeProps({ selection: selection.current });
    }

    return (
        <>
            <TouchableOpacity style={styles.trigger} onPress={open} accessibilityRole="button" accessibilityLabel="Abrir calculadora">
                <Feather name="grid" size={14} color={colors.primary} /><Text style={styles.triggerText}>Calculadora</Text>
            </TouchableOpacity>
            <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
                <View style={styles.overlay}>
                    <Pressable style={StyleSheet.absoluteFill} onPress={() => setVisible(false)} accessibilityRole="button" accessibilityLabel="Fechar calculadora" />
                    <SafeAreaView style={styles.sheet} accessibilityViewIsModal>
                        <View style={styles.content}>
                            <View style={styles.heading}><Text style={styles.title}>Faça a conta.</Text><TouchableOpacity style={styles.close} onPress={() => setVisible(false)} accessibilityRole="button" accessibilityLabel="Voltar ao valor"><Feather name="x" size={21} color={colors.text} /></TouchableOpacity></View>
                            <TextInput ref={inputRef} accessibilityLabel="Conta da calculadora" style={styles.input} value={draft} onChangeText={text => { setDraft(text); selection.current = { start: text.length, end: text.length }; }} onSelectionChange={event => { selection.current = event.nativeEvent.selection; }} placeholder="35 + 18 + 12" placeholderTextColor={colors.muted} maxLength={120} showSoftInputOnFocus={false} autoCorrect={false} autoCapitalize="none" />
                            <Text accessibilityLiveRegion="polite" style={[styles.total, !valid && draft !== '' && { color: colors.error }]}>{valid ? `= ${calculation.value.toLocaleString('pt-BR', { maximumFractionDigits: 10 })}` : calculation.error || 'Some, subtraia, multiplique ou divida.'}</Text>
                            <View style={styles.keys}>{keys.map(key => (
                                <TouchableOpacity key={key} accessibilityRole="button" accessibilityLabel={labels[key] || key} disabled={key === '=' && !valid} onPress={() => keyPress(key)} style={[styles.key, /[+−×÷=]/.test(key) && styles.operator, key === '=' && !valid && { opacity: 0.4 }]}><Text style={[styles.keyText, /[+−×÷=]/.test(key) && { color: colors.primary }]}>{key}</Text></TouchableOpacity>
                            ))}</View>
                            <TouchableOpacity style={[styles.apply, !valid && { opacity: 0.4 }]} disabled={!valid} accessibilityRole="button" accessibilityState={{ disabled: !valid }} onPress={() => { onApply(draft); setVisible(false); }}><Text style={styles.applyText}>Usar na conversão</Text><Feather name="arrow-right" size={18} color={colors.onPrimary} /></TouchableOpacity>
                        </View>
                    </SafeAreaView>
                </View>
            </Modal>
        </>
    );
}

const createStyles = colors => StyleSheet.create({
    trigger: { minHeight: 44, flexDirection: 'row', gap: 7, alignItems: 'center', paddingHorizontal: 8 },
    triggerText: { color: colors.primary, fontSize: 12, fontWeight: '600' },
    overlay: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', backgroundColor: '#00000099' },
    sheet: { width: '100%', maxWidth: 520, backgroundColor: colors.cardBackground, borderTopLeftRadius: 28, borderTopRightRadius: 28 },
    content: { padding: 20, paddingBottom: Platform.OS === 'android' ? 32 : 20 },
    heading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
    title: { fontSize: 24, fontWeight: '600', color: colors.text, letterSpacing: -0.8 },
    close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
    input: { minHeight: 54, fontSize: 26, color: colors.text, backgroundColor: colors.inputBackground, borderRadius: 12, padding: 12, ...Platform.select({ web: { outlineStyle: 'none' } }) },
    total: { color: colors.primary, fontSize: 13, lineHeight: 19, minHeight: 42, paddingVertical: 10 },
    keys: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    key: { width: '22%', flexGrow: 1, height: 46, borderRadius: 12, backgroundColor: colors.inputBackground, alignItems: 'center', justifyContent: 'center' },
    operator: { backgroundColor: colors.accentSoft },
    keyText: { color: colors.text, fontSize: 22 },
    apply: { marginTop: 16, minHeight: 50, borderRadius: 14, backgroundColor: colors.primary, padding: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12 },
    applyText: { color: colors.onPrimary, fontSize: 14, fontWeight: '700' },
});
