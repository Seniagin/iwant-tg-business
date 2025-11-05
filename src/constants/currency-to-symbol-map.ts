
export function getCurrencySymbol(currency?: string): string {
    if (!currency) return ''

    const symbol = currencyToSymbolMap[currency]
    return symbol || ''
}

export const currencyToSymbolMap: Record<string, string> = {
    'USD': '$',
    'EUR': '€',
    'UAH': '₴',
    'GBP': '£',
    'JPY': '¥',
    'KRW': '₩',
    'CNY': '¥',
    'INR': '₹',
    'BRL': 'R$',
    'MXN': 'MXN',
    'ARS': 'ARS',
    'CLP': 'CLP',
}