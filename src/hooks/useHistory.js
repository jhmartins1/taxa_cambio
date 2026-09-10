import { useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { currencies } from '../constants/currencies';
import { createHistoryStore } from '../services/historyStore';

const store = createHistoryStore({ storage: AsyncStorage, codes: currencies.map(currency => currency.code) });

export function useHistory() {
    const [entries, setEntries] = useState([]);
    const [busy, setBusy] = useState(true);
    const [error, setError] = useState('');
    const mounted = useRef(false);
    const revision = useRef(0);

    async function run(action, failureMessage) {
        const id = ++revision.current;
        setBusy(true);
        setError('');
        try {
            const next = await action();
            if (mounted.current && id === revision.current) setEntries(next);
            return true;
        } catch {
            if (mounted.current && id === revision.current) setError(failureMessage);
            return false;
        } finally {
            if (mounted.current && id === revision.current) setBusy(false);
        }
    }

    useEffect(() => {
        mounted.current = true;
        run(store.read, 'Não foi possível carregar o histórico. Tente abrir novamente.');
        return () => { mounted.current = false; };
    }, []);

    return {
        entries, busy, error,
        refresh: () => run(store.read, 'Não foi possível carregar o histórico. Tente novamente.'),
        add: entry => run(() => store.add(entry), 'A conversão foi concluída, mas não foi possível salvar no histórico.'),
        remove: id => run(() => store.remove(id), 'Não foi possível excluir a conversão.'),
        clear: () => run(store.clear, 'Não foi possível limpar o histórico.'),
        restore: entries => run(() => store.restore(entries), 'Não foi possível desfazer. Tente novamente.'),
    };
}
