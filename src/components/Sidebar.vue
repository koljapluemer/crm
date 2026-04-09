<script setup lang="ts">
import { UserPlus } from 'lucide-vue-next'
import type { Contact, ContactColor } from '../types'
import { contactColor } from '../composables/useContacts'

const props = defineProps<{
  contactNames: string[]
  selectedName: string | null
  contactsMap: Record<string, Contact>
}>()

const emit = defineEmits<{
  select: [name: string]
  create: []
}>()

function colorClass(name: string): string {
  const contact = props.contactsMap[name]
  if (!contact) return ''
  const color: ContactColor = contactColor(contact)
  if (color === 'red') return 'bg-red-200 hover:bg-red-300'
  if (color === 'yellow') return 'bg-yellow-100 hover:bg-yellow-200'
  return 'hover:bg-gray-100'
}
</script>

<template>
  <aside class="w-56 bg-gray-50 border-r border-gray-200 flex flex-col h-full">
    <div class="px-4 py-3 border-b border-gray-200">
      <h1 class="text-sm font-semibold text-gray-500 uppercase tracking-wider">Contacts</h1>
    </div>
    <div class="flex-1 overflow-y-auto py-1">
      <button
        v-for="name in contactNames"
        :key="name"
        @click="emit('select', name)"
        :class="[
          'w-full text-left px-4 py-2 text-sm transition-colors',
          colorClass(name),
          selectedName === name ? 'font-medium text-gray-900' : 'text-gray-700'
        ]"
      >
        {{ name }}
      </button>
    </div>
    <div class="border-t border-gray-200 p-2">
      <button
        @click="emit('create')"
        class="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
      >
        <UserPlus :size="15" />
        New contact
      </button>
    </div>
  </aside>
</template>
