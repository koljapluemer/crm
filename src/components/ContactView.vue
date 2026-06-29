<script setup lang="ts">
import type { Contact } from '../types'
import NotesSection from './NotesSection.vue'
import LogSection from './LogSection.vue'

const props = defineProps<{ contact: Contact }>()
const emit = defineEmits<{ update: [contact: Contact] }>()

function toggle(field: 'acuteTaskOpen' | 'uncontacted') {
  emit('update', { ...props.contact, [field]: !props.contact[field] })
}
</script>

<template>
  <div class="flex flex-col h-full overflow-y-auto">
    <div class="px-8 py-6 border-b border-gray-100">
      <h2 class="text-xl font-semibold text-gray-900">{{ contact.name }}</h2>
      <div class="flex items-center gap-2 mt-3">
        <button
          @click="toggle('acuteTaskOpen')"
          :class="[
            'px-3 py-1 rounded-full text-xs font-medium transition-colors border',
            contact.acuteTaskOpen
              ? 'bg-orange-500 text-white border-orange-500'
              : 'bg-white text-gray-400 border-gray-200 hover:border-orange-300 hover:text-orange-400'
          ]"
        >
          Acute task open
        </button>
        <button
          @click="toggle('uncontacted')"
          :class="[
            'px-3 py-1 rounded-full text-xs font-medium transition-colors border',
            contact.uncontacted
              ? 'bg-gray-300 text-gray-600 border-gray-300'
              : 'bg-white text-gray-400 border-gray-200 hover:border-gray-400 hover:text-gray-500'
          ]"
        >
          Uncontacted
        </button>
      </div>
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
