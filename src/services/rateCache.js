export const RATE_CACHE_KEY = '@TaxaCambio:rates:v1';

// A complete USD snapshot lets offline conversions use any supported base currency.
export function createRateRepository({ storage, fetchRates, codes, now = Date.now }) {
    function validDate(value) {
        if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
        const date = new Date(`${value}T00:00:00Z`);
        return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
    }

    function validate(snapshot) {
        return snapshot?.version === 1 && snapshot.base === 'USD'
            && Number.isFinite(snapshot.savedAt) && snapshot.savedAt > 0
            && Number.isFinite(new Date(snapshot.savedAt).getTime())
            && (snapshot.date === null || validDate(snapshot.date))
            && snapshot.rates?.USD === 1
            && codes.every(code => Number.isFinite(snapshot.rates?.[code]) && snapshot.rates[code] > 0);
    }

    async function readCache() {
        try {
            const snapshot = JSON.parse(await storage.getItem(RATE_CACHE_KEY));
            return validate(snapshot) ? snapshot : null;
        } catch {
            return null;
        }
    }

    function rebase(snapshot, base, source, persisted = true) {
        if (!codes.includes(base)) throw new Error('Moeda de origem inválida.');
        const rates = Object.fromEntries(codes.map(code => [code, snapshot.rates[code] / snapshot.rates[base]]));
        if (Object.values(rates).some(rate => !Number.isFinite(rate) || rate <= 0)) {
            throw new Error('Cotação inválida.');
        }
        return { ...snapshot, base, rates, source, persisted };
    }

    async function getRates(base, { offline = false } = {}) {
        if (!codes.includes(base)) throw new Error('Moeda de origem inválida.');
        if (!offline) {
            try {
                const data = await fetchRates('USD');
                if (data.base && data.base !== 'USD') throw new Error('Moeda de referência inesperada.');
                const snapshot = {
                    version: 1,
                    base: 'USD',
                    rates: Object.fromEntries(codes.map(code => [code, code === 'USD' ? 1 : data.rates?.[code]])),
                    date: validDate(data.date) ? data.date : null,
                    savedAt: now(),
                };
                if (!validate(snapshot)) throw new Error('Cotação incompleta.');
                let persisted = true;
                try {
                    await storage.setItem(RATE_CACHE_KEY, JSON.stringify(snapshot));
                } catch {
                    persisted = false;
                }
                return rebase(snapshot, base, 'network', persisted);
            } catch {
                // A failed refresh never overwrites the last complete snapshot.
            }
        }
        const snapshot = await readCache();
        if (!snapshot) {
            throw new Error(offline
                ? 'Nenhuma cotação salva. Faça uma conversão com internet para ativar o uso offline.'
                : 'Não foi possível atualizar e não há cotação salva. Conecte-se à internet e tente novamente.');
        }
        return rebase(snapshot, base, 'cache');
    }

    return { getRates, readCache };
}
