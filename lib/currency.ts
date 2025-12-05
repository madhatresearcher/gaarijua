export function formatCurrency(value: number | string | undefined | null, currency?: string) {
  if (value === undefined || value === null || value === '') return ''
  const amount = typeof value === 'string' ? Number(value) : value
  if (Number.isNaN(amount)) return String(value)

  const curr = (currency || 'UGX').toString().toUpperCase()

  try {
    if (curr === 'UGX') {
      return new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX', maximumFractionDigits: 0 }).format(amount)
    }
    // Default formatting for other currencies (USD, etc.)
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: curr }).format(amount)
  } catch (e) {
    // Fallback: simple prefix
    if (curr === 'UGX') return `UGX ${amount}`
    if (curr === 'USD') return `$${amount}`
    return `${curr} ${amount}`
  }
}

export function detectCurrencyFromRecord(rec: any, keys = ['currency', 'price_currency', 'pricePerDayCurrency', 'price_per_day_currency', 'price_buy_currency', 'priceBuyCurrency']) {
  if (!rec) return undefined
  for (const k of keys) {
    if (k in rec && rec[k]) return String(rec[k]).toUpperCase()
  }
  return undefined
}
