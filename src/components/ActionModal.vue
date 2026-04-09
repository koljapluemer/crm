<script setup lang="ts">
import { ref } from 'vue'
import { X } from 'lucide-vue-next'

const props = defineProps<{
  title: string
}>()

const emit = defineEmits<{
  confirm: [comment: string]
  cancel: []
}>()

const comment = ref('')

function confirm() {
  emit('confirm', comment.value.trim())
  comment.value = ''
}

function cancel() {
  comment.value = ''
  emit('cancel')
}
</script>

<template>
  <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50" @click.self="cancel">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-800">{{ props.title }}</h2>
        <button @click="cancel" class="text-gray-400 hover:text-gray-600">
          <X :size="18" />
        </button>
      </div>
      <textarea
        v-model="comment"
        placeholder="Add a comment (optional)"
        rows="3"
        class="w-full border border-gray-200 rounded px-3 py-2 text-sm text-gray-700 resize-none focus:outline-none focus:border-gray-400"
        autofocus
        @keydown.ctrl.enter="confirm"
      />
      <div class="flex justify-end gap-2 mt-4">
        <button
          @click="cancel"
          class="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded"
        >Cancel</button>
        <button
          @click="confirm"
          class="px-4 py-2 text-sm bg-gray-800 text-white rounded hover:bg-gray-700"
        >Confirm</button>
      </div>
    </div>
  </div>
</template>
