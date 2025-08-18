import {Text, View} from "react-native";
import {currencies} from "../../constants/currencies";
import {createStyles} from "./styles";
import {useTheme} from "../../contexts/ThemeContext";

export function ResultCard({exchangeRate,
                               result,
                               fromCurrency,
                               toCurrency,
                               currencies,}) {
    // Usando o contexto de tema
    const { colors } = useTheme();
    
    // Criando os estilos com as cores do tema atual
    const styles = createStyles(colors);
    if(!result || !exchangeRate) return null;

    const toSymbol = currencies.find(currency => currency.code === toCurrency).symbol

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Resultado:</Text>
            <Text style={styles.amount}>{toSymbol} {result}</Text>
            <Text style={styles.rate}>Taxa de Câmbio 1: {fromCurrency} = {exchangeRate.toFixed(4)} {toCurrency}</Text>
        </View>
    )
}