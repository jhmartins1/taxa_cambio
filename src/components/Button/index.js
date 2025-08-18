import {TouchableOpacity, Text} from "react-native";
import {createStyles} from "./styles";
import {useTheme} from "../../contexts/ThemeContext";

export function Button({variant = "primary", onPress, currency, isSelected}) {
    // Usando o contexto de tema
    const { colors } = useTheme();
    
    // Criando os estilos com as cores do tema atual
    const styles = createStyles(colors);
    return (
        <TouchableOpacity
            onPress={onPress}
            style={
                [styles.button,
                    isSelected &&
                    (variant === 'primary' ?
                    styles.buttonPrimary
                : styles.buttonSecondary)]
            }>
            <Text style={styles.buttonText}>
                {currency.code}
            </Text>
        </TouchableOpacity>
    )
}