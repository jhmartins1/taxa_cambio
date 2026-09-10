export function parseCurrencyAmount(amount) {
    if (typeof amount === 'number') return Number.isFinite(amount) && amount >= 0 ? amount : NaN;
    const input = String(amount).trim();
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

export function convertMultipleCurrencies(amount, rates, codes) {
    return codes.map(code => ({ code, result: convertCurrency(amount, rates[code]) }));
}

// Recursive-descent arithmetic parser. User input is never executed as JavaScript.
export function calculateAmount(expression) {
    const input = String(expression).trim().replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
    if (!input) return { value: null, error: '' };
    try {
        if (input.length > 120) throw new Error('Use uma conta com até 120 caracteres.');
        if (/[^\d.,+*/()\s-]/.test(input)) throw new Error('Use números, +, −, ×, ÷ e parênteses.');
        const tokens = input.match(/[\d.,]+|[+*/()-]/g) || [];
        let position = 0;

        function checked(value) {
            if (!Number.isFinite(value) || Math.abs(value) > Number.MAX_SAFE_INTEGER) throw new Error('O valor é muito alto. Reduza a conta.');
            // Suppress binary floating-point artifacts such as 0.1 + 0.2.
            return Number(value.toPrecision(15));
        }

        function factor(depth) {
            if (depth > 32) throw new Error('A conta tem parênteses demais.');
            const token = tokens[position++];
            if (token === '+' || token === '-') return checked((token === '-' ? -1 : 1) * factor(depth + 1));
            if (token === '(') {
                const value = sum(depth + 1);
                if (tokens[position++] !== ')') throw new Error('Feche os parênteses da conta.');
                return value;
            }
            if (!token || token === ')') throw new Error('Complete a conta antes de converter.');
            const value = parseCurrencyAmount(/^[.,]/.test(token) ? `0${token}` : token);
            if (!Number.isFinite(value)) throw new Error('Confira os números da conta. Exemplo: 35 + 18,50.');
            return checked(value);
        }

        function product(depth) {
            let value = factor(depth);
            while (tokens[position] === '*' || tokens[position] === '/') {
                const operation = tokens[position++];
                const right = factor(depth);
                if (operation === '/' && right === 0) throw new Error('Não é possível dividir por zero.');
                value = checked(operation === '*' ? value * right : value / right);
            }
            return value;
        }

        function sum(depth) {
            let value = product(depth);
            while (tokens[position] === '+' || tokens[position] === '-') {
                const operation = tokens[position++];
                const right = product(depth);
                value = checked(operation === '+' ? value + right : value - right);
            }
            return value;
        }

        const value = sum(0);
        if (position !== tokens.length) throw new Error('Separe os valores com uma operação, como + ou ×.');
        if (value < 0) throw new Error('O total não pode ser negativo.');
        return { value: Object.is(value, -0) ? 0 : value, error: '' };
    } catch (error) {
        return { value: null, error: error.message };
    }
}
