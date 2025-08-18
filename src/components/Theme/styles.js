import { StyleSheet } from "react-native";
// Removendo a importação direta das cores, pois usaremos o contexto de tema

// Criando uma função para gerar estilos com base no tema atual
export const createStyles = (colors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background
    },
    scrollView: {
        flexGrow: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 80,
        paddingBottom: 24,
    },
    header: {
        marginBottom: 28,
    },
    title: {
        fontSize: 26,
        fontWeight: "bold",
        color: colors.text,
        marginBottom: 8,
    },
    maded: {
        fontSize: 10,
        color: colors.text,
        textAlign: "right",
    },
    card: {
        backgroundColor: colors.cardBackground,
        borderRadius: 16,
        padding: 24,
        marginBottom: 24,
    },
    themeLabel: {
        fontSize: 16,
        fontWeight: "500",
        color: colors.text,
        marginBottom: 16,
    },
    themeGrid: {
        flexDirection: "row",
        flexWrap: 'wrap',
        marginHorizontal: -4,
        marginBottom: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    themeButton: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        margin: 8,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: 'transparent',
        minWidth: 100,
        alignItems: 'center',
    },
    themeButtonSelected: {
        borderColor: colors.primary,
    },
    themeButtonText: {
        color: '#ffffff',
        fontWeight: '500',
        fontSize: 14,
    },
    themeButtonTextSelected: {
        fontWeight: 'bold',
    },
    themeDescription: {
        color: colors.textSecondary,
        fontSize: 14,
        textAlign: 'center',
        marginTop: 8,
    },
    themeHighlight: {
        color: colors.primary,
        fontWeight: 'bold',
    },
})