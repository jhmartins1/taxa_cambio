import { StyleSheet } from 'react-native';

export const createStyles = colors => StyleSheet.create({
    container: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 18, minHeight: 59 },
    symbol: { fontSize: 27, color: colors.textSecondary },
    amount: { flex: 1, fontSize: 44, fontWeight: '500', letterSpacing: -1.5, color: colors.primary, fontVariant: ['tabular-nums'] },
});
