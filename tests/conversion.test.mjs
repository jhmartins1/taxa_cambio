import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';

// Load the app's ES modules without changing Expo's package/module configuration.
async function loadModule(path) {
    const source = await readFile(new URL(path, import.meta.url), 'utf8');
    return import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
}

const { parseCurrencyAmount, convertCurrency } = await loadModule('../src/utils/convertCurrency.js');
const { exchangeRateApi } = await loadModule('../src/services/api.js');

test('converts Brazilian decimal input without dropping centavos', () => {
    assert.equal(convertCurrency('100,50', 5.1), '512.55');
    assert.equal(convertCurrency('1.234,56', 2), '2469.12');
    assert.equal(convertCurrency('100.50', 5.1), '512.55');
});

test('accepts zero and whitespace and rounds to two decimal places', () => {
    assert.equal(convertCurrency('0', 5.1), '0.00');
    assert.equal(convertCurrency(' 10,25 ', 1), '10.25');
    assert.equal(convertCurrency('10', 0.333333), '3.33');
});

test('rejects malformed values instead of silently parsing only a prefix', () => {
    for (const amount of ['', ' ', '-20', '100abc', '1,2,3', 'Infinity', '1e3', '1.2.3', '12.34,56']) {
        assert.ok(Number.isNaN(parseCurrencyAmount(amount)), amount);
        assert.throws(() => convertCurrency(amount, 2));
    }
});

test('rejects invalid and missing exchange rates', () => {
    for (const rate of [undefined, null, NaN, Infinity, 0, -1, '5']) {
        assert.throws(() => convertCurrency('100', rate));
    }
});

test('returns the API data and requests the selected base currency', async t => {
    const expected = { rates: { BRL: 5.1 }, date: '2026-09-09' };
    t.mock.method(globalThis, 'fetch', async (url, options) => {
        assert.equal(url, 'https://api.exchangerate-api.com/v4/latest/USD');
        assert.ok(options.signal instanceof AbortSignal);
        return { ok: true, json: async () => expected };
    });
    assert.deepEqual(await exchangeRateApi('USD'), expected);
});

test('propagates HTTP, malformed response and connection failures', async t => {
    const mockedFetch = t.mock.method(globalThis, 'fetch', async () => ({ ok: false }));
    await assert.rejects(exchangeRateApi('USD'));
    mockedFetch.mock.mockImplementation(async () => ({ ok: true, json: async () => ({}) }));
    await assert.rejects(exchangeRateApi('USD'));
    mockedFetch.mock.mockImplementation(async () => { throw new Error('offline'); });
    await assert.rejects(exchangeRateApi('USD'), /offline/);
});
