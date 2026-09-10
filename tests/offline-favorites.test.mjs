import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';

async function loadModule(path) {
    const source = await readFile(new URL(path, import.meta.url), 'utf8');
    return import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
}

const { createRateRepository, RATE_CACHE_KEY } = await loadModule('../src/services/rateCache.js');
const { normalizeFavorites, toggleFavorite, favoriteFirst } = await loadModule('../src/utils/favorites.js');
const { convertMultipleCurrencies } = await loadModule('../src/utils/convertCurrency.js');
const codes = ['USD', 'BRL', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF'];
const rates = { USD: 1, BRL: 5, EUR: 0.8, GBP: 0.7, JPY: 150, CAD: 1.4, AUD: 1.5, CHF: 0.9 };
const data = { base: 'USD', rates, date: '2026-09-09' };
const timestamp = Date.UTC(2026, 8, 9, 15);

function memoryStorage() {
    const values = new Map();
    return { getItem: async key => values.get(key) ?? null, setItem: async (key, value) => { values.set(key, value); } };
}

function repository(storage, fetchRates = async () => data) {
    return createRateRepository({ storage, fetchRates, codes, now: () => timestamp });
}

test('saves a complete snapshot and rebases one online request for any source', async () => {
    const storage = memoryStorage();
    const repo = repository(storage, async base => { assert.equal(base, 'USD'); return data; });
    const quote = await repo.getRates('EUR');
    assert.equal(quote.source, 'network');
    assert.equal(quote.persisted, true);
    assert.equal(quote.rates.BRL, 6.25);
    assert.equal(quote.rates.EUR, 1);
    assert.deepEqual((await repo.readCache()).rates, rates);
    assert.equal((await repo.readCache()).base, 'USD');
});

test('offline conversion survives a new repository and never calls the network', async () => {
    const storage = memoryStorage();
    await repository(storage).getRates('USD');
    const offlineRepo = repository(storage, () => assert.fail('Offline must not contact the API'));
    const quote = await offlineRepo.getRates('BRL', { offline: true });
    assert.equal(quote.rates.USD, 0.2);
    assert.equal(quote.rates.JPY, 30);
    assert.equal(quote.source, 'cache');
    assert.equal(quote.savedAt, timestamp);
    assert.equal(quote.date, '2026-09-09');
});

test('failed refresh falls back to the original saved quote without changing its age', async () => {
    const storage = memoryStorage();
    await repository(storage).getRates('USD');
    const quote = await repository(storage, async () => { throw new Error('offline'); }).getRates('GBP');
    assert.equal(quote.source, 'cache');
    assert.equal(quote.savedAt, timestamp);
    assert.equal(quote.rates.GBP, 1);
});

test('an incomplete or wrong-base refresh never replaces good saved rates', async () => {
    const storage = memoryStorage();
    await repository(storage).getRates('USD');
    const before = await storage.getItem(RATE_CACHE_KEY);
    for (const badData of [{ rates: { USD: 1, BRL: 6 } }, { ...data, base: 'EUR' }, { ...data, rates: { ...rates, EUR: -1 } }]) {
        const quote = await repository(storage, async () => badData).getRates('USD');
        assert.equal(quote.source, 'cache');
        assert.equal(await storage.getItem(RATE_CACHE_KEY), before);
    }
});

test('missing or corrupt cache gives actionable errors instead of invented rates', async () => {
    const storage = memoryStorage();
    const repo = repository(storage, async () => { throw new Error('offline'); });
    await assert.rejects(repo.getRates('USD', { offline: true }), /Nenhuma cotação salva/);
    await assert.rejects(repo.getRates('USD'), /não há cotação salva/);
    for (const raw of ['not json', 'null', '{}', JSON.stringify({ version: 1, base: 'USD', rates: { ...rates, BRL: '5' }, savedAt: timestamp })]) {
        await storage.setItem(RATE_CACHE_KEY, raw);
        assert.equal(await repo.readCache(), null);
        await assert.rejects(repo.getRates('USD', { offline: true }), /Nenhuma cotação salva/);
    }
});

test('storage write failure still returns live rates but does not promise offline availability', async () => {
    const storage = { getItem: async () => null, setItem: async () => { throw new Error('disk full'); } };
    const quote = await repository(storage).getRates('USD');
    assert.equal(quote.source, 'network');
    assert.equal(quote.persisted, false);
    assert.equal(quote.rates.BRL, 5);
});

test('invalid saved dates are rejected and undated API quotes still use the saved timestamp', async () => {
    const storage = memoryStorage();
    const repo = repository(storage, async () => ({ rates }));
    const quote = await repo.getRates('USD');
    assert.equal(quote.date, null);
    assert.equal(quote.savedAt, timestamp);
    const snapshot = await repo.readCache();
    for (const date of [{}, '2026-99-99', '2026-02-30']) {
        await storage.setItem(RATE_CACHE_KEY, JSON.stringify({ ...snapshot, date }));
        assert.equal(await repo.readCache(), null);
    }
});

test('invalid base is rejected before fetching or reading storage', async () => {
    const repo = repository(memoryStorage(), () => assert.fail('Invalid base must not fetch'));
    await assert.rejects(repo.getRates('XXX'), /Moeda de origem inválida/);
});

test('simultaneous conversion uses the same input and snapshot for every currency', () => {
    const results = convertMultipleCurrencies('100,50', rates, ['BRL', 'EUR', 'JPY']);
    assert.deepEqual(results, [{ code: 'BRL', result: '502.50' }, { code: 'EUR', result: '80.40' }, { code: 'JPY', result: '15075.00' }]);
    assert.throws(() => convertMultipleCurrencies('100', { BRL: 5 }, ['BRL', 'EUR']));
});

test('favorites can be added, removed and restored without duplicates or unsupported codes', () => {
    let favorites = normalizeFavorites(['BRL', 'EUR', 'BRL', 'XXX', null], codes);
    assert.deepEqual(favorites, ['BRL', 'EUR']);
    favorites = toggleFavorite(favorites, 'JPY');
    favorites = toggleFavorite(favorites, 'BRL');
    assert.deepEqual(normalizeFavorites(JSON.parse(JSON.stringify(favorites)), codes), ['EUR', 'JPY']);
    assert.deepEqual(normalizeFavorites({}, codes), []);
});

test('favorite ordering keeps the remaining currencies stable and does not mutate the source', () => {
    const currencies = codes.map(code => ({ code }));
    assert.deepEqual(favoriteFirst(currencies, ['JPY', 'EUR']).map(item => item.code), ['EUR', 'JPY', 'USD', 'BRL', 'GBP', 'CAD', 'AUD', 'CHF']);
    assert.deepEqual(currencies.map(item => item.code), codes);
});
