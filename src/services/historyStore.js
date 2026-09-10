export const HISTORY_KEY = '@TaxaCambio:history:v1';
export const HISTORY_LIMIT = 50;

export function createHistoryStore({ storage, codes, now = Date.now, makeId = () => `${now()}-${Math.random().toString(36).slice(2, 10)}` }) {
    let queue = Promise.resolve();
    const validTime = value => Number.isFinite(value) && value > 0 && Number.isFinite(new Date(value).getTime());
    const validDate = value => value === null || (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)));

    function valid(entry) {
        if (!entry || typeof entry.id !== 'string' || !validTime(entry.createdAt)
            || typeof entry.expression !== 'string' || !entry.expression.trim() || entry.expression.length > 120
            || !Number.isFinite(entry.amount) || entry.amount < 0
            || !codes.includes(entry.fromCurrency) || !codes.includes(entry.toCurrency)
            || !['single', 'multiple'].includes(entry.mode) || !['network', 'cache', 'identity'].includes(entry.source)
            || !validDate(entry.quoteDate) || !(entry.quoteSavedAt === null || validTime(entry.quoteSavedAt))
            || !Array.isArray(entry.results)) return false;
        const expected = entry.mode === 'single' ? [entry.toCurrency] : codes.filter(code => code !== entry.fromCurrency);
        return entry.results.length === expected.length
            && new Set(entry.results.map(result => result?.code)).size === expected.length
            && entry.results.every(result => result && expected.includes(result.code)
                && Number.isFinite(result.rate) && result.rate > 0
                && typeof result.result === 'string' && /^\d+\.\d{2}$/.test(result.result) && Number.isFinite(Number(result.result)));
    }

    function normalize(entries) {
        if (!Array.isArray(entries)) return [];
        const ids = new Set();
        return entries.filter(entry => {
            if (!valid(entry) || ids.has(entry.id)) return false;
            ids.add(entry.id);
            return true;
        }).sort((a, b) => b.createdAt - a.createdAt).slice(0, HISTORY_LIMIT);
    }

    async function read() {
        const raw = await storage.getItem(HISTORY_KEY);
        if (!raw) return [];
        try { return normalize(JSON.parse(raw)); } catch { return []; }
    }

    function update(transform) {
        const operation = queue.then(async () => {
            const current = await read();
            const next = normalize(transform(current));
            await storage.setItem(HISTORY_KEY, JSON.stringify(next));
            return next;
        });
        queue = operation.catch(() => {});
        return operation;
    }

    return {
        read: () => queue.then(read),
        add: entry => {
            const saved = { ...entry, id: makeId(), createdAt: now() };
            if (!valid(saved)) return Promise.reject(new Error('Conversão inválida para o histórico.'));
            return update(current => [saved, ...current]);
        },
        remove: id => update(current => current.filter(entry => entry.id !== id)),
        clear: () => update(() => []),
        restore: entries => update(current => [...current, ...entries]),
    };
}
