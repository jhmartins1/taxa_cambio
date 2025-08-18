import {StyleSheet} from "react-native";
// Removendo a importação direta das cores, pois usaremos o contexto de tema

// Criando uma função para gerar estilos com base no tema atual
export const createStyles = (colors) => StyleSheet.create({
    button: {
        backgroundColor: colors.inputBackground,
        paddingHorizontal: 16,
        paddingVertical: 8,
        margin: 4,
        borderRadius: 8,
    },
    buttonText: {
        color: colors.text,
        fontWeight: '500',
    },
    buttonPrimary: {
        backgroundColor: colors.primary,
    },
    buttonSecondary: {
        backgroundColor: colors.secondary,
    }
})