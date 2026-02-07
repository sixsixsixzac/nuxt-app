export interface Product {
  id: number
  title: string
  thumbnail?: string
  brand?: string
  category?: string
  categoryId?: number
  price: number
  discountPercentage?: number
  stock?: number
}

interface ProductsResponse {
  products: Product[]
  total: number
  skip: number
  limit: number
}

export function useProducts(options: {
  limit: number
  skip: MaybeRefOrGetter<number>
  categoryIds?: MaybeRefOrGetter<number[]>
}) {
  const config = useRuntimeConfig()
  const base = config.public.apiBase as string
  const skipRef = computed(() => toValue(options.skip))
  const categoryIdsRef = computed(() => toValue(options.categoryIds ?? []) ?? [])

  const { data, pending, error, refresh } = useAsyncData(
    () => `products-${options.limit}-${skipRef.value}-${categoryIdsRef.value.join(',')}`,
    () =>
      $fetch<ProductsResponse>(`${base}/products`, {
        params: {
          limit: options.limit,
          skip: skipRef.value,
          ...(categoryIdsRef.value.length > 0 ? { categoryId: categoryIdsRef.value } : {}),
        },
      }),
    { watch: [skipRef, categoryIdsRef] },
  )

  const products = computed(() => data.value?.products ?? [])
  const total = computed(() => data.value?.total ?? 0)

  function prependProduct(product: Product) {
    if (data.value) {
      data.value = {
        ...data.value,
        products: [product, ...data.value.products],
        total: data.value.total + 1,
      }
    }
  }

  function replaceProduct(id: number, product: Product) {
    if (data.value) {
      data.value = {
        ...data.value,
        products: data.value.products.map((p) => (p.id === id ? product : p)),
      }
    }
  }

  function removeProduct(id: number) {
    if (data.value) {
      data.value = {
        ...data.value,
        products: data.value.products.filter((p) => p.id !== id),
        total: Math.max(0, data.value.total - 1),
      }
    }
  }

  return {
    products,
    total,
    pending,
    error,
    refresh,
    prependProduct,
    replaceProduct,
    removeProduct,
  }
}

export interface ProductFormPayload {
  id?: number
  title: string
  thumbnail?: string
  brand?: string
  categoryId: number
  price: number
  discountPercentage?: number
  stock?: number
}

export async function createProduct(payload: Omit<ProductFormPayload, 'id'>): Promise<Product> {
  const config = useRuntimeConfig()
  const base = config.public.apiBase as string
  return $fetch<Product>(`${base}/products`, {
    method: 'POST',
    body: payload,
  })
}

export async function updateProduct(id: number, payload: Omit<ProductFormPayload, 'id'>): Promise<Product> {
  const config = useRuntimeConfig()
  const base = config.public.apiBase as string
  return $fetch<Product>(`${base}/products/${id}`, {
    method: 'PUT',
    body: payload,
  })
}

export async function deleteProduct(id: number): Promise<void> {
  const config = useRuntimeConfig()
  const base = config.public.apiBase as string
  await $fetch(`${base}/products/${id}`, { method: 'DELETE' })
}
