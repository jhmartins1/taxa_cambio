import {TouchableOpacity, Text} from "react-native";
import {styles} from "./styles";

export function Button({variant = "primary", onPress, currency, isSelected}) {
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