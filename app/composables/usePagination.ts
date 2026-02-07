export function usePagination(options: {
  pageSize: number
  total: MaybeRefOrGetter<number>
  currentPage: MaybeRefOrGetter<number>
}) {
  const total = computed(() => toValue(options.total))
  const currentPage = computed(() => toValue(options.currentPage))

  const totalPages = computed(() => Math.max(1, Math.ceil(total.value / options.pageSize)))
  const rangeStart = computed(() =>
    total.value === 0 ? 0 : (currentPage.value - 1) * options.pageSize + 1,
  )
  const rangeEnd = computed(() =>
    Math.min(currentPage.value * options.pageSize, total.value),
  )
  const skip = computed(() => (currentPage.value - 1) * options.pageSize)

  const pageNumbers = computed(() => {
    const totalP = totalPages.value
    if (totalP <= 7) return Array.from({ length: totalP }, (_, i) => i + 1)
    const p = currentPage.value
    const pages: (number | '…')[] = []
    pages.push(1)
    if (p > 3) pages.push('…')
    for (let i = Math.max(2, p - 1); i <= Math.min(totalP - 1, p + 1); i++) {
      if (!pages.includes(i)) pages.push(i)
    }
    if (p < totalP - 2) pages.push('…')
    if (totalP > 1) pages.push(totalP)
    return pages
  })

  return {
    totalPages,
    rangeStart,
    rangeEnd,
    skip,
    pageNumbers,
  }
}
