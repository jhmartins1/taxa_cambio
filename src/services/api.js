const BASE_URL = 'https://api.exchangerate-api.com/v4/latest';

export async function exchangeRateApi(fromCurrency) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
        const response = await fetch(`${BASE_URL}/${fromCurrency}`, { signal: controller.signal });
        if (!response.ok) throw new Error('Não foi possível obter a cotação');
        const data = await response.json();
        if (!data.rates) throw new Error('Resposta de cotação inválida');
        return data;
    } finally {
        clearTimeout(timeout);
    }
}
