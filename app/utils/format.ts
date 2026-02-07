export function formatCategoryName(name: string): string {
  if (!name) return ''
  return name.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}


export function formatPrice(price: number): string {
  return `฿${price}`
}

export function formatDiscount(value: number | null | undefined): string {
  return value != null ? `${value}%` : '—'
}
