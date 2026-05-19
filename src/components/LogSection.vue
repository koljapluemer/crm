<script setup lang="ts">
import { ref } from 'vue'
import type { Contact, LogEntry } from '../types'

const props = defineProps<{ contact: Contact }>()
const emit = defineEmits<{ update: [contact: Contact] }>()

const newLogMessage = ref('')

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function reversed(log: LogEntry[]): LogEntry[] {
  return [...log].reverse()
}

function addLog() {
  const message = newLogMessage.value.trim()
  if (!message) return
  emit('update', {
    ...props.contact,
    log: [
      ...props.contact.log,
      { timestamp: new Date().toISOString(), message },
    ],
  })
  newLogMessage.value = ''
}
</script>

<template>
  <section>
    <h3 class="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Logs</h3>
    <div class="mb-4 flex items-center gap-3">
      <input
        v-model="newLogMessage"
        class="flex-1 text-sm text-gray-700 border-b border-transparent focus:border-gray-300 focus:outline-none py-0.5"
        @keydown.enter="addLog"
      />
      <button
        class="px-3 py-1.5 text-sm text-white bg-gray-800 rounded hover:bg-gray-700"
        @click="addLog"
      >
        Add
      </button>
    </div>
    <div class="space-y-1">
      <div
        v-for="(entry, i) in reversed(contact.log)"
        :key="i"
        class="flex items-start gap-3 text-sm"
      >
        <span class="text-gray-400 text-xs whitespace-nowrap mt-0.5 shrink-0">
          {{ formatTimestamp(entry.timestamp) }}
        </span>
        <span class="text-gray-600">{{ entry.message }}</span>
      </div>
    </div>
  </section>
</template>
