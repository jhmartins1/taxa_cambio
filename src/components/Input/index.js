import {Text, TextInput, View} from "react-native";
import {styles} from "./styles";

export function Input({value, onChangeText, label}) {
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