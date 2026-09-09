import { Platform, StyleSheet } from 'react-native';

export const createStyles = colors => StyleSheet.create({
    container: { flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1, borderBottomColor: 'transparent', marginTop: 18, paddingBottom: 6 },
    symbol: { fontSize: 27, fontWeight: '400', color: colors.textSecondary },
    input: { flex: 1, minWidth: 0, padding: 0, fontSize: 44, fontWeight: '500', letterSpacing: -1.5, color: colors.text, fontVariant: ['tabular-nums'], ...Platform.select({ web: { outlineStyle: 'none' } }) },
});
