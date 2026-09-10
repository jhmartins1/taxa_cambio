import AsyncStorage from '@react-native-async-storage/async-storage';
import { currencies } from '../constants/currencies';
import { exchangeRateApi } from './api';
import { createRateRepository } from './rateCache';

export const exchangeRates = createRateRepository({
    storage: AsyncStorage,
    fetchRates: exchangeRateApi,
    codes: currencies.map(currency => currency.code),
});
