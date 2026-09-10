export const FAVORITES_KEY = '@TaxaCambio:favorites:v1';

export function normalizeFavorites(value, codes) {
    if (!Array.isArray(value)) return [];
    return [...new Set(value.filter(code => codes.includes(code)))];
}

export function toggleFavorite(favorites, code) {
    return favorites.includes(code) ? favorites.filter(item => item !== code) : [...favorites, code];
}

export function favoriteFirst(currencies, favorites) {
    return [...currencies].sort((a, b) => Number(favorites.includes(b.code)) - Number(favorites.includes(a.code)));
}
