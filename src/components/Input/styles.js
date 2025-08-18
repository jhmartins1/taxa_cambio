import {StyleSheet} from 'react-native';
// Removendo a importação direta das cores, pois usaremos o contexto de tema

// Criando uma função para gerar estilos com base no tema atual
export const createStyles = (colors) => StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        color: colors.textSecondary,
        marginBottom: 8,
        fontSize: 14,
    },
    input: {
        backgroundColor: colors.inputBackground,
        color: colors.text,
        fontSize: 24,
        fontWeight: 'bold',
        padding: 16,
        borderRadius: 8
    }
})