import {StyleSheet} from 'react-native';
// Removendo a importação direta das cores, pois usaremos o contexto de tema

// Criando uma função para gerar estilos com base no tema atual
export const createStyles = (colors) => StyleSheet.create({
    container: {
        backgroundColor: colors.cardBackground,
        borderRadius: 16,
        padding: 24,
    },
    label: {
        color: colors.textSecondary,
        marginBottom: 8,
        fontSize: 18,
    },
    amount: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 14,
    },
    rate: {
        color: colors.textSecondary,
        fontSize: 14,
    }
})