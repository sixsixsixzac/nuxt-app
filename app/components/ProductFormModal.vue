<template>
  <Dialog v-model:visible="isOpen" :header="dialogTitle" modal :style="{ width: '32rem' }"
    :dismissable-mask="!submitting" :closable="!submitting" class="product-form-modal"
    @update:visible="handleDialogVisibilityChange">
    <form :key="`product-form-${props.visible}-${props.product?.id ?? 'new'}`" class="flex flex-col gap-4" @submit.prevent="handleSubmit">
      <div class="field">
        <label for="product-title" class="block text-sm font-medium text-gray-700 mb-1">
          Title *
        </label>
        <InputText
          id="product-title"
          v-model="form.title"
          class="w-full"
          placeholder="Product title"
          :invalid="!!fieldErrors.title"
        />
        <small v-if="fieldErrors.title" class="text-red-500 text-sm mt-1">{{ fieldErrors.title }}</small>
      </div>

      <div class="field">
        <label for="product-thumbnail" class="block text-sm font-medium text-gray-700 mb-1">
          Thumbnail URL
        </label>
        <InputText
          id="product-thumbnail"
          v-model="form.thumbnail"
          class="w-full"
          placeholder="https://..."
          :invalid="!!fieldErrors.thumbnail"
        />
        <small v-if="fieldErrors.thumbnail" class="text-red-500 text-sm mt-1">{{ fieldErrors.thumbnail }}</small>
      </div>

      <div class="field">
        <label for="product-brand" class="block text-sm font-medium text-gray-700 mb-1">
          Brand
        </label>
        <InputText
          id="product-brand"
          v-model="form.brand"
          class="w-full"
          placeholder="Brand name"
          :invalid="!!fieldErrors.brand"
        />
        <small v-if="fieldErrors.brand" class="text-red-500 text-sm mt-1">{{ fieldErrors.brand }}</small>
      </div>

      <div class="field">
        <label for="product-category" class="block text-sm font-medium text-gray-700 mb-1">
          Category *
        </label>
        <Select id="product-category" v-model="form.categoryId" :options="categoryOptions" option-label="label"
          option-value="id" placeholder="Select category" class="w-full" :invalid="!!fieldErrors.categoryId" />
        <small v-if="fieldErrors.categoryId" class="text-red-500 text-sm mt-1">
          {{ fieldErrors.categoryId }}
        </small>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div class="field">
          <label for="product-price" class="block text-sm font-medium text-gray-700 mb-1">
            Price *
          </label>
          <InputGroup>
            <InputGroupAddon>฿</InputGroupAddon>
            <InputNumber
              id="product-price"
              v-model="form.price"
              mode="decimal"
              :min-fraction-digits="2"
              class="w-full"
              :invalid="!!fieldErrors.price"
            />
          </InputGroup>
          <small v-if="fieldErrors.price" class="text-red-500 text-sm mt-1">
            {{ fieldErrors.price }}
          </small>
        </div>

        <div class="field">
          <label for="product-discount" class="block text-sm font-medium text-gray-700 mb-1">
            Discount %
          </label>
          <InputGroup>
            <InputNumber
              id="product-discount"
              v-model="form.discountPercentage"
              :min="0"
              :max="100"
              class="w-full"
              :invalid="!!fieldErrors.discountPercentage"
            />
            <InputGroupAddon>%</InputGroupAddon>
          </InputGroup>
          <small v-if="fieldErrors.discountPercentage" class="text-red-500 text-sm mt-1">
            {{ fieldErrors.discountPercentage }}
          </small>
        </div>
      </div>

      <div class="field">
        <label for="product-stock" class="block text-sm font-medium text-gray-700 mb-1">
          Stock
        </label>
        <InputNumber id="product-stock" v-model="form.stock" :min="0" class="w-full" :invalid="!!fieldErrors.stock" />
        <small v-if="fieldErrors.stock" class="text-red-500 text-sm mt-1">
          {{ fieldErrors.stock }}
        </small>
      </div>
    </form>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button label="Cancel" severity="secondary" :disabled="submitting" @click="handleCancel" />
        <Button :label="submitButtonLabel" :loading="submitting" :disabled="!isFormValid" @click="handleSubmit" />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import type { Product, ProductFormPayload } from '~/composables/useProducts'
import type { Category } from '~/composables/useCategories'

export type { ProductFormPayload }

interface Props {
  visible: boolean
  product?: Product | null
  categories?: Category[]
}

interface Emits {
  'update:visible': [value: boolean]
  submit: [payload: ProductFormPayload]
}

const props = withDefaults(defineProps<Props>(), {
  product: null,
  categories: () => [],
})

const emit = defineEmits<Emits>()

const submitting = ref(false)
const fieldErrors = ref<Record<string, string>>({})
const form = ref<ProductFormPayload>(createEmptyForm())

const isOpen = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value),
})

const isEditMode = computed(() => !!props.product)

const dialogTitle = computed(() => isEditMode.value ? 'Edit product' : 'Add product')

const submitButtonLabel = computed(() => isEditMode.value ? 'Update' : 'Add product')

const categoryOptions = computed(() =>
  props.categories.map(category => ({
    id: category.id,
    label: formatCategoryLabel(category),
  }))
)

const isFormValid = computed(() => {
  const { title, categoryId, price } = form.value
  return Boolean(
    title?.trim() &&
    categoryId != null &&
    categoryId > 0 &&
    price != null &&
    price >= 0
  )
})

function createEmptyForm(): ProductFormPayload {
  return {
    title: '',
    thumbnail: '',
    brand: '',
    categoryId: 0,
    price: 0,
    discountPercentage: undefined,
    stock: undefined,
  }
}

function formatCategoryLabel(category: Category): string {
  return `${formatCategoryName(category.name)} (${category.items})`
}

function findCategoryId(product: Product): number {
  const category = props.categories.find(cat => {
    const formattedName = cat.name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
    return formattedName === product.category || cat.name === product.category
  })
  return category?.id ?? props.categories[0]?.id ?? 0
}

function initializeForm(): void {
  if (props.product) {
    const p = props.product
    form.value = {
      id: p.id,
      title: p.title ?? '',
      thumbnail: p.thumbnail ?? '',
      brand: p.brand ?? '',
      categoryId: p.categoryId ?? findCategoryId(p),
      price: p.price ?? 0,
      discountPercentage: p.discountPercentage,
      stock: p.stock,
    }
  } else {
    form.value = createEmptyForm()
  }
  fieldErrors.value = {}
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value)
}

function isString(value: unknown): value is string {
  return typeof value === 'string'
}

function validateForm(): Record<string, string> {
  const errors: Record<string, string> = {}
  const { title, thumbnail, brand, categoryId, price, discountPercentage, stock } = form.value

  if (!isString(title) || title.trim().length === 0) {
    errors.title = 'Title is required and must be text.'
  }

  if (thumbnail != null && thumbnail !== '' && !isString(thumbnail)) {
    errors.thumbnail = 'Thumbnail must be text.'
  }

  if (brand != null && brand !== '' && !isString(brand)) {
    errors.brand = 'Brand must be text.'
  }

  if (!isNumber(categoryId) || !Number.isInteger(categoryId) || categoryId <= 0) {
    errors.categoryId = 'Please select a category.'
  }

  if (!isNumber(price) || Number.isNaN(price)) {
    errors.price = 'Price is required.'
  } else if (price < 0) {
    errors.price = 'Price must be 0 or greater.'
  }

  if (discountPercentage != null) {
    if (!isNumber(discountPercentage) || Number.isNaN(discountPercentage)) {
      errors.discountPercentage = 'Discount must be a number.'
    } else if (discountPercentage < 0 || discountPercentage > 100) {
      errors.discountPercentage = 'Discount must be between 0 and 100.'
    }
  }

  if (stock != null) {
    if (!isNumber(stock) || Number.isNaN(stock)) {
      errors.stock = 'Stock must be a number.'
    } else if (stock < 0 || !Number.isInteger(stock)) {
      errors.stock = 'Stock must be a whole number 0 or greater.'
    }
  }

  return errors
}

function handleDialogVisibilityChange(visible: boolean): void {
  if (visible) {
    initializeForm()
  }
}

function handleCancel(): void {
  isOpen.value = false
}

async function handleSubmit(): Promise<void> {
  const errors = validateForm()
  if (Object.keys(errors).length > 0) {
    fieldErrors.value = errors
    return
  }

  if (submitting.value) return

  fieldErrors.value = {}
  submitting.value = true

  try {
    const payload: ProductFormPayload = {
      title: String(form.value.title).trim(),
      thumbnail: form.value.thumbnail ? String(form.value.thumbnail).trim() : '',
      brand: form.value.brand ? String(form.value.brand).trim() : '',
      categoryId: Number(form.value.categoryId),
      price: Number(form.value.price),
      discountPercentage: form.value.discountPercentage != null
        ? Number(form.value.discountPercentage)
        : undefined,
      stock: form.value.stock != null
        ? Number(form.value.stock)
        : undefined,
    }

    if (isEditMode.value && form.value.id != null) {
      payload.id = form.value.id
    }

    emit('submit', payload)
    isOpen.value = false
  } finally {
    submitting.value = false
  }
}

watch(
  () => [props.visible, props.product] as const,
  ([visible]) => {
    if (visible) {
      initializeForm()
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.product-form-modal :deep(.p-dialog-content) {
  padding-top: 1.5rem;
}
</style>