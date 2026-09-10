import { useEffect, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Keyboard, KeyboardAvoidingView, Modal, Platform, SafeAreaView, ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { useTheme } from '../../contexts/ThemeContext';
import { createStyles } from './styles';
import { currencies } from '../../constants/currencies';
import { Input } from '../Input';
import { ResultCard } from '../ResultCard';
import { CurrencyPicker } from '../CurrencyPicker';
import { Credit } from '../Credit';
import { exchangeRates } from '../../services/exchangeRates';
import { calculateAmount, convertCurrency, convertMultipleCurrencies } from '../../utils/convertCurrency';
import { useFavorites } from '../../hooks/useFavorites';
import { MultipleRates } from '../MultipleRates';
import { useHistory } from '../../hooks/useHistory';
import { History } from '../History';

export default function Home({ onOpenThemes }) {
    const [amount, setAmount] = useState('');
    const [fromCurrency, setFromCurrency] = useState('USD');
    const [toCurrency, setToCurrency] = useState('BRL');
    const [mode, setMode] = useState('single');
    const [quote, setQuote] = useState(null);
    const [cache, setCache] = useState(null);
    const [offline, setOffline] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showHistory, setShowHistory] = useState(false);
    const [reused, setReused] = useState(false);
    const scrollRef = useRef(null);
    const history = useHistory();
    const requestId = useRef(0);
    const favoritesState = useFavorites();
    const { favorites, toggle: toggleFavorite, ready: favoritesReady } = favoritesState;
    const { currentTheme, colors } = useTheme();
    const styles = createStyles(colors);
    const from = currencies.find(currency => currency.code === fromCurrency);
    const to = currencies.find(currency => currency.code === toCurrency);
    const calculation = calculateAmount(amount);
    const validAmount = Number.isFinite(calculation.value);
    const invalidAmount = amount.trim() !== '' && !validAmount;
    const exchangeRate = quote?.rates[toCurrency];
    const result = quote && mode === 'single' ? convertCurrency(calculation.value, exchangeRate) : '';
    const multiResults = quote && mode === 'multiple'
        ? convertMultipleCurrencies(calculation.value, quote.rates, currencies.filter(currency => currency.code !== fromCurrency).map(currency => currency.code)) : null;
    const pickerFavorites = { favorites, onToggleFavorite: toggleFavorite, favoritesReady };

    useEffect(() => {
        let active = true;
        exchangeRates.readCache().then(saved => {
            if (active) setCache(current => current || saved);
        });
        return () => { active = false; requestId.current += 1; };
    }, []);

    function clearResult() {
        requestId.current += 1;
        setQuote(null);
        setError('');
        setLoading(false);
        setReused(false);
    }

    async function fetchExchangeRate() {
        if (!validAmount || loading) return;
        Keyboard.dismiss();
        const id = ++requestId.current;
        setLoading(true);
        setError('');
        setReused(false);
        try {
            const data = mode === 'single' && fromCurrency === toCurrency
                ? { rates: { [toCurrency]: 1 }, source: 'identity' }
                : await exchangeRates.getRates(fromCurrency, { offline });
            // Validate every displayed result before committing the snapshot to the screen.
            const results = convertMultipleCurrencies(calculation.value, data.rates, mode === 'single' ? [toCurrency] : currencies.filter(currency => currency.code !== fromCurrency).map(currency => currency.code));
            if (id !== requestId.current) return;
            setQuote(data);
            if (data.persisted) setCache(data);
            history.add({ expression: amount, amount: calculation.value, fromCurrency, toCurrency, mode,
                results: results.map(item => ({ ...item, rate: data.rates[item.code] })),
                source: data.source, quoteDate: data.date || null, quoteSavedAt: data.savedAt || null });
        } catch (failure) {
            if (id !== requestId.current) return;
            setQuote(null);
            setError(failure.message || 'Não foi possível converter. Tente novamente.');
        } finally {
            if (id === requestId.current) setLoading(false);
        }
    }

    function swapCurrency() {
        clearResult();
        setFromCurrency(toCurrency);
        setToCurrency(fromCurrency);
    }

    function reuseConversion(entry) {
        clearResult();
        setAmount(entry.expression);
        setFromCurrency(entry.fromCurrency);
        setToCurrency(entry.toCurrency);
        setMode(entry.mode);
        setReused(true);
        setShowHistory(false);
        scrollRef.current?.scrollTo({ y: 0, animated: true });
    }

    const displayDate = quote?.date ? quote.date.split('-').reverse().join('/') : null;
    const savedDate = cache?.savedAt ? new Date(cache.savedAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : null;
    const quoteDescription = quote?.source === 'identity' ? 'Conversão entre a mesma moeda'
        : quote ? `${displayDate ? `Cotação de ${displayDate}` : 'Cotação de referência'} · ExchangeRate-API` : 'Uma consulta salva as 8 moedas para usar sem internet.';

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style={currentTheme === 'light' ? 'dark' : 'light'} />
            <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView ref={scrollRef} style={styles.flex} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    <View style={styles.content}>
                        <View style={styles.header}>
                            <View style={styles.brand}>
                                <View style={styles.brandIcon}><Feather name="repeat" size={22} color={colors.onPrimary} /></View>
                                <Text style={styles.wordmark}>câmbio<Text style={{ color: colors.primary }}>.</Text></Text>
                            </View>
                            <View style={{ flexDirection: 'row', gap: 8 }}><TouchableOpacity style={styles.themeButton} onPress={() => { Keyboard.dismiss(); setShowHistory(true); history.refresh(); }} accessibilityRole="button" accessibilityLabel="Abrir histórico"><Feather name="clock" size={19} color={colors.text} /></TouchableOpacity>
                            <TouchableOpacity style={styles.themeButton} onPress={onOpenThemes} accessibilityRole="button" accessibilityLabel="Personalizar aparência" activeOpacity={0.7}>
                                <Feather name="sliders" size={19} color={colors.text} />
                            </TouchableOpacity></View>
                        </View>

                        <View style={styles.hero}>
                            <View style={styles.eyebrowRow}><View style={styles.dot} /><Text style={styles.eyebrow}>MENOS CONTAS. MAIS POSSIBILIDADES.</Text></View>
                            <Text accessibilityRole="header" style={styles.title}>Seu dinheiro,{ '\n' }<Text style={styles.titleAccent}>sem fronteiras.</Text></Text>
                            <Text style={styles.subtitle}>Converta moedas. Simplifique seus planos.</Text>
                        </View>

                        {favorites.length > 0 && <View style={styles.favoritesSection}>
                            <View style={styles.favoritesHeading}><Feather name="star" size={12} color={colors.primary} /><Text style={styles.favoritesLabel}>SUAS FAVORITAS</Text><Text style={styles.favoritesHint}>{mode === 'single' ? 'Toque para receber' : 'Toque para usar como origem'}</Text></View>
                            <View style={styles.favoriteChips}>{favorites.map(code => (
                                <TouchableOpacity key={code} accessibilityRole="button" accessibilityLabel={`Usar ${code} como ${mode === 'single' ? 'destino' : 'origem'}`} accessibilityState={{ selected: (mode === 'single' ? toCurrency : fromCurrency) === code }} style={[styles.favoriteChip, (mode === 'single' ? toCurrency : fromCurrency) === code && { backgroundColor: colors.accentSoft, borderColor: colors.primary }]} onPress={() => { clearResult(); mode === 'single' ? setToCurrency(code) : setFromCurrency(code); }}><Text style={styles.favoriteChipText}>{code}</Text></TouchableOpacity>
                            ))}</View>
                        </View>}
                        {favoritesState.error !== '' && <TouchableOpacity onPress={favoritesState.retry} accessibilityRole="button" style={styles.favoriteError}><Text accessibilityRole="alert" style={styles.errorText}>{favoritesState.error}</Text></TouchableOpacity>}

                        <View style={styles.modeSelector}>
                            {[{ key: 'single', label: 'Uma moeda', icon: 'repeat' }, { key: 'multiple', label: 'Várias moedas', icon: 'layers' }].map(option => (
                                <TouchableOpacity key={option.key} accessibilityRole="button" accessibilityState={{ selected: mode === option.key }} onPress={() => { if (mode !== option.key) { clearResult(); setMode(option.key); } }} style={[styles.modeButton, mode === option.key && styles.modeButtonActive]}>
                                    <Feather name={option.icon} size={15} color={mode === option.key ? colors.primary : colors.muted} /><Text style={[styles.modeText, mode === option.key && { color: colors.text }]}>{option.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <View style={styles.card}>
                            <View style={styles.fieldHeader}>
                                <Text style={styles.label}>Você converte</Text>
                                <CurrencyPicker {...pickerFavorites} label="Moeda de origem" value={fromCurrency} onChange={code => { clearResult(); setFromCurrency(code); }} />
                            </View>
                            <Input symbol={from.symbol} value={amount} onChangeText={value => { clearResult(); setAmount(value); }} onSubmitEditing={fetchExchangeRate} />
                            <Text style={styles.currencyName}>{from.name}</Text>

                            {mode === 'single' ? <><View style={styles.dividerRow}>
                                <View style={styles.divider} />
                                <TouchableOpacity style={styles.swapButton} onPress={swapCurrency} accessibilityRole="button" accessibilityLabel="Inverter moedas" activeOpacity={0.7}>
                                    <Feather name="repeat" size={19} color={colors.primary} style={{ transform: [{ rotate: '90deg' }] }} />
                                </TouchableOpacity>
                                <View style={styles.divider} />
                            </View>

                            <View style={styles.fieldHeader}>
                                <Text style={styles.label}>Você recebe</Text>
                                <CurrencyPicker {...pickerFavorites} label="Moeda de destino" value={toCurrency} onChange={code => { clearResult(); setToCurrency(code); }} />
                            </View>
                            <ResultCard result={result} symbol={to.symbol} loading={loading} />
                            <Text style={styles.currencyName}>{to.name}</Text></> : <View style={styles.multiHint}><Feather name="layers" size={16} color={colors.primary} /><Text style={styles.multiHintText}>O mesmo valor em outras {currencies.length - 1} moedas, de uma só vez.</Text></View>}

                            {invalidAmount && <Text accessibilityRole="alert" style={styles.validation}>{calculation.error}</Text>}
                            {reused && <Text accessibilityLiveRegion="polite" style={styles.multiHintText}>Conversão carregada. Toque em Converter para calcular com a cotação atual ou salva.</Text>}
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
                                <Text style={styles.convertButtonText}>{loading ? 'Convertendo...' : mode === 'multiple' ? 'Converter moedas' : 'Converter valor'}</Text>
                                {!loading && <Feather name="arrow-right" size={20} color={colors.onPrimary} />}
                            </TouchableOpacity>
                        </View>

                        {history.error !== '' && <Text accessibilityRole="alert" style={styles.validation}>{history.error}</Text>}
                        <View style={styles.offlinePanel}>
                            <View style={styles.offlineHeading}>
                                <Feather name="download-cloud" size={18} color={colors.primary} />
                                <View style={styles.infoContent}><Text style={styles.infoTitle}>Usar cotação salva</Text><Text style={styles.infoText}>{cache ? 'Converta sem consultar a internet.' : 'Disponível após a primeira consulta online.'}</Text></View>
                                <Switch accessibilityLabel="Usar cotação salva" value={offline} disabled={!cache} onValueChange={value => { clearResult(); setOffline(value); }} trackColor={{ false: colors.border, true: colors.primary }} thumbColor={offline ? colors.onPrimary : colors.textSecondary} />
                            </View>
                            {savedDate && <Text style={styles.savedDate}>Salva em {savedDate} · 8 moedas disponíveis</Text>}
                        </View>
                        {quote?.source === 'cache' && <View style={styles.cacheNotice} accessibilityLiveRegion="polite"><Feather name="wifi-off" size={17} color={colors.primary} /><Text style={styles.cacheNoticeText}>{offline ? 'Usando a cotação salva no dispositivo.' : 'Não foi possível atualizar. Usando a última cotação salva.'} Os valores podem estar desatualizados.</Text></View>}
                        {quote?.persisted === false && <Text accessibilityRole="alert" style={styles.validation}>Conversão atualizada, mas não foi possível salvar para uso offline neste dispositivo.</Text>}
                        <View style={styles.rateInfo} accessibilityLiveRegion="polite">
                            <View style={styles.infoIcon}><Feather name={quote ? 'check' : 'globe'} size={18} color={colors.primary} /></View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoTitle}>{quote ? mode === 'multiple' ? `${currencies.length - 1} moedas na mesma cotação de referência` : `1 ${fromCurrency} = ${exchangeRate.toLocaleString('pt-BR', { maximumFractionDigits: 4 })} ${toCurrency}` : 'Seus planos também funcionam offline.'}</Text>
                                <Text style={styles.infoText}>{quoteDescription}</Text>
                            </View>
                        </View>

                        {mode === 'multiple' && <MultipleRates results={multiResults} base={fromCurrency} favorites={favorites} onToggleFavorite={toggleFavorite} favoritesReady={favoritesReady} loading={loading} />}

                        <View style={styles.footer}>
                            <Text style={styles.disclaimer}>Cotações de referência. Taxas e impostos não inclusos.</Text>
                            <View style={styles.footerLine} />
                            <Credit />
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
            <Modal visible={showHistory} animationType="slide" onRequestClose={() => setShowHistory(false)}>
                <History history={history} onClose={() => setShowHistory(false)} onReuse={reuseConversion} />
            </Modal>
        </SafeAreaView>
    );
}
