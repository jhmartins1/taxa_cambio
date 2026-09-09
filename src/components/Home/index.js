import { useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Keyboard, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { useTheme } from '../../contexts/ThemeContext';
import { createStyles } from './styles';
import { currencies } from '../../constants/currencies';
import { Input } from '../Input';
import { ResultCard } from '../ResultCard';
import { CurrencyPicker } from '../CurrencyPicker';
import { Credit } from '../Credit';
import { exchangeRateApi } from '../../services/api';
import { convertCurrency, parseCurrencyAmount } from '../../utils/convertCurrency';

export default function Home({ onOpenThemes }) {
    const [amount, setAmount] = useState('');
    const [fromCurrency, setFromCurrency] = useState('USD');
    const [toCurrency, setToCurrency] = useState('BRL');
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);
    const [exchangeRate, setExchangeRate] = useState(null);
    const [rateDate, setRateDate] = useState(null);
    const [error, setError] = useState('');
    const requestId = useRef(0);
    const { currentTheme, colors } = useTheme();
    const styles = createStyles(colors);
    const from = currencies.find(currency => currency.code === fromCurrency);
    const to = currencies.find(currency => currency.code === toCurrency);
    const validAmount = Number.isFinite(parseCurrencyAmount(amount));
    const invalidAmount = amount.trim() !== '' && !validAmount;

    function clearResult() {
        requestId.current += 1;
        setResult('');
        setExchangeRate(null);
        setRateDate(null);
        setError('');
        setLoading(false);
    }

    async function fetchExchangeRate() {
        if (!validAmount || loading) return;
        Keyboard.dismiss();
        const id = ++requestId.current;
        setLoading(true);
        setError('');
        try {
            const data = fromCurrency === toCurrency ? { rates: { [toCurrency]: 1 } } : await exchangeRateApi(fromCurrency);
            const rate = data.rates[toCurrency];
            const convertedAmount = convertCurrency(amount, rate);
            if (id !== requestId.current) return;
            setExchangeRate(rate);
            setResult(convertedAmount);
            setRateDate(data.date || null);
        } catch {
            if (id !== requestId.current) return;
            setResult('');
            setExchangeRate(null);
            setRateDate(null);
            setError('Não foi possível buscar a cotação. Verifique sua conexão e tente novamente.');
        } finally {
            if (id === requestId.current) setLoading(false);
        }
    }

    function swapCurrency() {
        clearResult();
        setFromCurrency(toCurrency);
        setToCurrency(fromCurrency);
    }

    const displayDate = rateDate && /^\d{4}-\d{2}-\d{2}$/.test(rateDate) ? rateDate.split('-').reverse().join('/') : null;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style={currentTheme === 'light' ? 'dark' : 'light'} />
            <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView style={styles.flex} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    <View style={styles.content}>
                        <View style={styles.header}>
                            <View style={styles.brand}>
                                <View style={styles.brandIcon}><Feather name="repeat" size={22} color={colors.onPrimary} /></View>
                                <Text style={styles.wordmark}>câmbio<Text style={{ color: colors.primary }}>.</Text></Text>
                            </View>
                            <TouchableOpacity style={styles.themeButton} onPress={onOpenThemes} accessibilityRole="button" accessibilityLabel="Personalizar aparência" activeOpacity={0.7}>
                                <Feather name="sliders" size={19} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.hero}>
                            <View style={styles.eyebrowRow}><View style={styles.dot} /><Text style={styles.eyebrow}>MENOS CONTAS. MAIS POSSIBILIDADES.</Text></View>
                            <Text accessibilityRole="header" style={styles.title}>Seu dinheiro,{ '\n' }<Text style={styles.titleAccent}>sem fronteiras.</Text></Text>
                            <Text style={styles.subtitle}>Converta moedas. Simplifique seus planos.</Text>
                        </View>

                        <View style={styles.card}>
                            <View style={styles.fieldHeader}>
                                <Text style={styles.label}>Você converte</Text>
                                <CurrencyPicker label="Moeda de origem" value={fromCurrency} onChange={code => { clearResult(); setFromCurrency(code); }} />
                            </View>
                            <Input symbol={from.symbol} value={amount} onChangeText={value => { clearResult(); setAmount(value); }} onSubmitEditing={fetchExchangeRate} />
                            <Text style={styles.currencyName}>{from.name}</Text>

                            <View style={styles.dividerRow}>
                                <View style={styles.divider} />
                                <TouchableOpacity style={styles.swapButton} onPress={swapCurrency} accessibilityRole="button" accessibilityLabel="Inverter moedas" activeOpacity={0.7}>
                                    <Feather name="repeat" size={19} color={colors.primary} style={{ transform: [{ rotate: '90deg' }] }} />
                                </TouchableOpacity>
                                <View style={styles.divider} />
                            </View>

                            <View style={styles.fieldHeader}>
                                <Text style={styles.label}>Você recebe</Text>
                                <CurrencyPicker label="Moeda de destino" value={toCurrency} onChange={code => { clearResult(); setToCurrency(code); }} />
                            </View>
                            <ResultCard result={result} symbol={to.symbol} loading={loading} />
                            <Text style={styles.currencyName}>{to.name}</Text>

                            {invalidAmount && <Text accessibilityRole="alert" style={styles.validation}>Digite um valor válido, como 100,50.</Text>}
                            {error !== '' && <View style={styles.error}><Feather name="alert-circle" size={17} color={colors.error} /><Text accessibilityRole="alert" style={styles.errorText}>{error}</Text></View>}

                            <TouchableOpacity
                                style={[styles.convertButton, (!validAmount || loading) && styles.convertButtonDisabled]}
                                onPress={fetchExchangeRate}
                                disabled={!validAmount || loading}
                                accessibilityRole="button"
                                accessibilityState={{ disabled: !validAmount || loading, busy: loading }}
                                activeOpacity={0.8}
                            >
                                {loading ? <ActivityIndicator color={colors.onPrimary} /> : <Feather name="refresh-cw" size={18} color={colors.onPrimary} />}
                                <Text style={styles.convertButtonText}>{loading ? 'Convertendo...' : 'Converter valor'}</Text>
                                {!loading && <Feather name="arrow-right" size={20} color={colors.onPrimary} />}
                            </TouchableOpacity>
                        </View>

                        <View style={styles.rateInfo} accessibilityLiveRegion="polite">
                            <View style={styles.infoIcon}><Feather name={exchangeRate ? 'check' : 'globe'} size={18} color={colors.primary} /></View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoTitle}>{exchangeRate ? `1 ${fromCurrency} = ${exchangeRate.toLocaleString('pt-BR', { maximumFractionDigits: 4 })} ${toCurrency}` : 'O próximo destino é você quem escolhe.'}</Text>
                                <Text style={styles.infoText}>{exchangeRate ? (displayDate ? `Cotação de ${displayDate} · ExchangeRate-API` : fromCurrency === toCurrency ? 'Conversão entre a mesma moeda' : 'Cotação de referência · ExchangeRate-API') : '8 moedas para trazer seus planos para mais perto.'}</Text>
                            </View>
                        </View>

                        <View style={styles.footer}>
                            <Text style={styles.disclaimer}>Cotações de referência. Taxas e impostos não inclusos.</Text>
                            <View style={styles.footerLine} />
                            <Credit />
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
