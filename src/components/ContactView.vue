<script setup lang="ts">
import type { Contact } from '../types'
import NotesSection from './NotesSection.vue'
import LogSection from './LogSection.vue'

const props = defineProps<{ contact: Contact }>()
const emit = defineEmits<{ update: [contact: Contact] }>()
</script>

<template>
  <div class="flex flex-col h-full overflow-y-auto">
    <div class="px-8 py-6 border-b border-gray-100">
      <h2 class="text-xl font-semibold text-gray-900">{{ contact.name }}</h2>
    </div>

    <div class="flex-1 px-8 py-6 space-y-8">
      <NotesSection
        :contact="contact"
        @update="emit('update', $event)"
      />
      <hr class="border-gray-100" />
      <LogSection
        :contact="contact"
        @update="emit('update', $event)"
      />
    </div>
  </div>
</template>
