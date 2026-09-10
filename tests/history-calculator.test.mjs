import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';

async function loadModule(path) {
    const source = await readFile(new URL(path, import.meta.url), 'utf8');
    return import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
}
const { calculateAmount, convertCurrency } = await loadModule('../src/utils/convertCurrency.js');
const { createHistoryStore, HISTORY_KEY, HISTORY_LIMIT } = await loadModule('../src/services/historyStore.js');

test('calculator respects precedence, parentheses and native keypad symbols', () => {
    for (const [expression, expected] of [['35 + 18 + 12', 65], ['10 + 2 × 3', 16], ['(10 + 2) × 3', 36], ['20 ÷ 4 − 2', 3], ['10 - -2', 12], ['-(2 - 5)', 3]]) {
        assert.deepEqual(calculateAmount(expression), { value: expected, error: '' }, expression);
    }
});

test('calculator accepts Brazilian decimals and grouping without floating point artifacts', () => {
    assert.equal(calculateAmount('1.234,56 + 0,44').value, 1235);
    assert.equal(calculateAmount('0.1 + 0.2').value, 0.3);
    assert.equal(calculateAmount(',5 + .5').value, 1);
    assert.equal(convertCurrency(calculateAmount('35 + 18,50').value, 5), '267.50');
    assert.equal(convertCurrency(calculateAmount('1 / 10000000').value, 1), '0.00');
});

test('calculator blocks zero division, invalid, incomplete, negative and oversized expressions', () => {
    assert.match(calculateAmount('10 / (3-3)').error, /zero/);
    assert.match(calculateAmount('1 - 2').error, /negativo/);
    for (const input of ['1 2', '2(3)', '1+', '(2+3', '1,2,3', '1**2', 'alert(1)', 'globalThis.x=1', '1e3', '9'.repeat(40), '1+'.repeat(100)]) {
        assert.equal(calculateAmount(input).value, null, input);
        assert.ok(calculateAmount(input).error, input);
    }
    assert.deepEqual(calculateAmount(''), { value: null, error: '' });
    assert.equal(calculateAmount('2 - 2').value, 0);
});

const codes = ['USD', 'BRL', 'EUR'];
function memoryStorage() {
    const values = new Map();
    return { getItem: async key => values.get(key) ?? null, setItem: async (key, value) => { values.set(key, value); } };
}
function makeStore(storage) {
    let clock = Date.UTC(2026, 8, 9, 16);
    let count = 0;
    return createHistoryStore({ storage, codes, now: () => ++clock, makeId: () => `conversion-${++count}` });
}
const entry = () => ({ expression: '35 + 18 + 12', amount: 65, fromCurrency: 'USD', toCurrency: 'BRL', mode: 'single', source: 'cache', quoteDate: '2026-09-08', quoteSavedAt: Date.UTC(2026, 8, 8), results: [{ code: 'BRL', result: '325.00', rate: 5 }] });

test('history persists the expression, result, rate and offline provenance across restarts', async () => {
    const storage = memoryStorage();
    const [saved] = await makeStore(storage).add(entry());
    const [restored] = await makeStore(storage).read();
    assert.deepEqual(restored, saved);
    assert.equal(restored.expression, '35 + 18 + 12');
    assert.equal(restored.source, 'cache');
    assert.equal(restored.quoteDate, '2026-09-08');
    assert.deepEqual(restored.results, [{ code: 'BRL', result: '325.00', rate: 5 }]);
});

test('history stores all simultaneous results and rejects partial snapshots', async () => {
    const store = makeStore(memoryStorage());
    const multiple = { ...entry(), mode: 'multiple', results: [...entry().results, { code: 'EUR', rate: 0.8, result: '52.00' }] };
    const [saved] = await store.add(multiple);
    assert.equal(saved.results.length, 2);
    await assert.rejects(store.add({ ...entry(), mode: 'multiple' }));
    assert.equal((await store.read()).length, 1);
});

test('concurrent additions are serialized and history keeps the newest 50 entries', async () => {
    const store = makeStore(memoryStorage());
    await Promise.all(Array.from({ length: 55 }, (_, i) => store.add({ ...entry(), expression: String(i) })));
    const saved = await store.read();
    assert.equal(saved.length, HISTORY_LIMIT);
    assert.equal(saved[0].expression, '54');
    assert.equal(saved[49].expression, '5');
});

test('opening history waits for pending saves', async () => {
    const store = makeStore(memoryStorage());
    const saving = store.add(entry());
    const opening = store.read();
    await saving;
    assert.equal((await opening).length, 1);
});

test('delete and clear can be undone without losing newly added conversions', async () => {
    const store = makeStore(memoryStorage());
    const [first] = await store.add(entry());
    await store.remove(first.id);
    assert.deepEqual(await store.read(), []);
    await store.add({ ...entry(), expression: '100' });
    const restored = await store.restore([first]);
    assert.equal(restored.length, 2);
    assert.equal((await store.restore([first])).length, 2);
    await store.clear();
    assert.deepEqual(await store.read(), []);
    assert.equal((await store.restore(restored)).length, 2);
});

test('invalid stored entries are skipped and failed storage writes do not poison the queue', async () => {
    const storage = memoryStorage();
    const store = makeStore(storage);
    const [valid] = await store.add(entry());
    await storage.setItem(HISTORY_KEY, JSON.stringify([null, {}, valid, { ...valid, id: 'bad', results: [{ code: 'BRL', result: 'NaN', rate: 0 }] }]));
    assert.equal((await store.read()).length, 1);
    const write = storage.setItem;
    storage.setItem = async () => { throw new Error('disk full'); };
    await assert.rejects(store.add(entry()), /disk full/);
    storage.setItem = write;
    assert.equal((await store.add(entry())).length, 2);
});
