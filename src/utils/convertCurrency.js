export function convertCurrency(amount, rate) {
    return (parseFloat(amount) * rate).toFixed(2)
}