<script setup lang="ts">
import { computed } from 'vue'
import { UserPlus, FolderOpen } from 'lucide-vue-next'
import type { Contact } from '../types'
import { contactRowStyle } from '../composables/useContacts'

const props = defineProps<{
  contactNames: string[]
  selectedName: string | null
  contactsMap: Record<string, Contact>
}>()

const emit = defineEmits<{
  select: [name: string]
  create: []
  changeFolder: []
}>()

const sortedContactNames = computed(() => {
  const acute = props.contactNames.filter(n => props.contactsMap[n]?.acuteTaskOpen)
  const normal = props.contactNames.filter(n => !props.contactsMap[n]?.acuteTaskOpen && !props.contactsMap[n]?.uncontacted)
  const uncontacted = props.contactNames.filter(n => !props.contactsMap[n]?.acuteTaskOpen && props.contactsMap[n]?.uncontacted)
  return [...acute, ...normal, ...uncontacted]
})

function itemStyle(name: string): Record<string, string> {
  const contact = props.contactsMap[name]
  if (!contact) return {}
  return contactRowStyle(contact)
}
</script>

<template>
  <aside class="w-56 bg-gray-50 border-r border-gray-200 flex flex-col h-full">
    <div class="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
      <h1 class="text-sm font-semibold text-gray-500 uppercase tracking-wider">Contacts</h1>
      <button
        @click="emit('changeFolder')"
        title="Change folder"
        class="text-gray-400 hover:text-gray-700 transition-colors"
      >
        <FolderOpen :size="15" />
      </button>
    </div>
    <div class="flex-1 overflow-y-auto py-1">
      <button
        v-for="name in sortedContactNames"
        :key="name"
        @click="emit('select', name)"
        :class="[
          'mx-2 my-0.5 w-[calc(100%-1rem)] rounded-md text-left px-4 py-2 text-sm transition-colors',
          selectedName === name
            ? 'font-medium ring-2 ring-black/20'
            : 'hover:ring-1 hover:ring-black/8'
        ]"
        :style="itemStyle(name)"
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
