export function parseCurrencyAmount(amount) {
    const input = String(amount).trim();
    // Accept decimal points and Brazilian decimals/grouping without silently truncating input.
    if (!/^(?:\d+(?:\.\d*)?|\d+,\d*|\d{1,3}(?:\.\d{3})+,\d*)$/.test(input)) return NaN;
    const normalized = input.includes(',') ? input.replace(/\./g, '').replace(',', '.') : input;
    const value = Number(normalized);
    return Number.isFinite(value) && value >= 0 ? value : NaN;
}

export function convertCurrency(amount, rate) {
    const value = parseCurrencyAmount(amount);
    if (!Number.isFinite(value) || !Number.isFinite(rate) || rate <= 0 || !Number.isFinite(value * rate)) {
        throw new Error('Valor ou cotação inválidos');
    }
    return (value * rate).toFixed(2);
}
