import { useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { currencies } from '../constants/currencies';
import { FAVORITES_KEY, normalizeFavorites, toggleFavorite } from '../utils/favorites';

const codes = currencies.map(currency => currency.code);

export function useFavorites() {
    const [favorites, setFavorites] = useState([]);
    const [ready, setReady] = useState(false);
    const [error, setError] = useState('');
    const current = useRef([]);
    const saveQueue = useRef(Promise.resolve());
    const mounted = useRef(true);
    const revision = useRef(0);

    useEffect(() => {
        mounted.current = true;
        async function load() {
            try {
                const raw = await AsyncStorage.getItem(FAVORITES_KEY);
                const saved = normalizeFavorites(JSON.parse(raw), codes);
                if (mounted.current) {
                    current.current = saved;
                    setFavorites(saved);
                }
            } catch {
                if (mounted.current) setError('Não foi possível carregar os favoritos deste dispositivo.');
            } finally {
                if (mounted.current) setReady(true);
            }
        }
        load();
        return () => { mounted.current = false; };
    }, []);

    function persist(next) {
        const id = ++revision.current;
        setError('');
        // Preserve tap order even when storage writes take different amounts of time.
        saveQueue.current = saveQueue.current.then(async () => {
            try {
                await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
            } catch {
                if (mounted.current && id === revision.current) {
                    setError('Favoritos apenas nesta sessão. Toque aqui para tentar salvar novamente.');
                }
            }
        });
    }

    function toggle(code) {
        if (!ready || !codes.includes(code)) return;
        const next = toggleFavorite(current.current, code);
        current.current = next;
        setFavorites(next);
        persist(next);
    }

    return { favorites, ready, error, toggle, retry: () => persist(current.current) };
}
