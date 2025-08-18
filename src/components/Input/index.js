import {Text, TextInput, View} from "react-native";
import {createStyles} from "./styles";
import {useTheme} from "../../contexts/ThemeContext";

export function Input({value, onChangeText, label}) {
    // Usando o contexto de tema
    const { colors } = useTheme();
    
    // Criando os estilos com as cores do tema atual
    const styles = createStyles(colors);
    return (
        <View style={styles.container}>
            <Text style={styles.label}>
                {label}
            </Text>
                <TextInput
                    style={styles.input}
                    placeholder="0.00"
                    placeholderTextColor="#94a3b8"
                    value={value}
                    onChangeText={onChangeText}
                    keyboardType="numeric"
                />
        </View>
    )
}