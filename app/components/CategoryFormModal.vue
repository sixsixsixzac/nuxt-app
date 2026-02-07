<template>
  <Dialog v-model:visible="isOpen" :header="dialogTitle" modal :style="{ width: '28rem' }"
    :dismissable-mask="!submitting" :closable="!submitting"
    @update:visible="handleDialogVisibilityChange">
    <form :key="`category-form-${props.visible}-${props.category?.id ?? 'new'}`" class="flex flex-col gap-4" @submit.prevent="handleSubmit">
      <div class="field">
        <label for="category-name" class="block text-sm font-medium text-gray-700 mb-1">
          Name *
        </label>
        <InputText
          id="category-name"
          v-model="form.name"
          class="w-full"
          placeholder="e.g. smart-phones"
          :invalid="!!fieldError"
        />
        <small v-if="fieldError" class="text-red-500 text-sm mt-1">{{ fieldError }}</small>
      </div>

      <div class="flex justify-end gap-2 pt-2">
        <button type="button" class="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          @click="isOpen = false">
          Cancel
        </button>
        <button type="submit" class="rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          :disabled="submitting">
          {{ props.category ? 'Update' : 'Add' }}
        </button>
      </div>
    </form>
  </Dialog>
</template>

<script setup lang="ts">
import type { Category } from '../composables/useCategories'

const props = defineProps<{
  visible: boolean
  category: Category | null
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  submit: [payload: { id?: number; name: string }]
}>()

const isOpen = computed({
  get: () => props.visible,
  set: (v) => emit('update:visible', v),
})

const dialogTitle = computed(() => (props.category ? 'Edit category' : 'Add category'))

const form = ref({ name: '' })
const fieldError = ref('')
const submitting = ref(false)

function resetForm() {
  const name = props.category
    ? props.category.name.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : ''
  form.value = { name }
  fieldError.value = ''
}

watch([() => props.visible, () => props.category], () => {
  if (props.visible) resetForm()
}, { immediate: true })

function handleDialogVisibilityChange(visible: boolean) {
  if (!visible) fieldError.value = ''
}

async function handleSubmit() {
  const raw = form.value.name.trim()
  if (!raw) {
    fieldError.value = 'Name is required'
    return
  }
  fieldError.value = ''
  submitting.value = true
  try {
    const name = raw.toLowerCase().replace(/\s+/g, '-')
    emit('submit', props.category ? { id: props.category.id, name } : { name })
  } finally {
    submitting.value = false
  }
}
</script>
