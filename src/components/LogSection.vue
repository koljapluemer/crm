<script setup lang="ts">
import type { LogEntry } from '../types'

const props = defineProps<{ log: LogEntry[] }>()

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

// Newest first
const reversed = () => [...props.log].reverse()
</script>

<template>
  <section>
    <h3 class="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Log</h3>
    <div v-if="log.length === 0" class="text-sm text-gray-300 italic">No entries yet.</div>
    <div v-else class="space-y-1">
      <div
        v-for="(entry, i) in reversed()"
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
