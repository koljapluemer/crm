<script setup lang="ts">
import { ref } from 'vue'
import {
  Loader2, CheckCircle2, Pencil, Trash2, Check, X, Timer
} from 'lucide-vue-next'
import type { Action, Contact } from '../types'
import { isActionDue } from '../composables/useContacts'
import ActionModal from './ActionModal.vue'

const props = defineProps<{ contact: Contact }>()
const emit = defineEmits<{ update: [contact: Contact] }>()

// Modal state
const modal = ref<{ action: Action; mode: 'progress' | 'finish' } | null>(null)

// Inline edit state
const editingId = ref<string | null>(null)
const editContent = ref('')

// New action input
const newActionContent = ref('')

// Interval toggle UI state (which rows have the interval field open)
const intervalOpen = ref<Set<string>>(new Set())
const intervalDraft = ref<Record<string, string>>({})

function openModal(action: Action, mode: 'progress' | 'finish') {
  modal.value = { action, mode }
}

function onModalConfirm(comment: string) {
  if (!modal.value) return
  const { action, mode } = modal.value
  modal.value = null

  const updated = { ...props.contact }

  const logMsg = mode === 'progress'
    ? `Marked progress on '${action.content}'${comment ? ': ' + comment : ''}`
    : `Finished '${action.content}'${comment ? ': ' + comment : ''}`

  updated.log = [
    ...updated.log,
    { timestamp: new Date().toISOString(), message: logMsg },
  ]

  if (mode === 'progress') {
    updated.actions = updated.actions.map((a) =>
      a.id === action.id ? { ...a, lastProgressAt: new Date().toISOString() } : a
    )
  } else {
    updated.actions = updated.actions.filter((a) => a.id !== action.id)
  }

  emit('update', updated)
}

function startEdit(action: Action) {
  editingId.value = action.id
  editContent.value = action.content
}

function commitEdit(action: Action) {
  if (!editContent.value.trim()) {
    cancelEdit()
    return
  }
  const updated = {
    ...props.contact,
    actions: props.contact.actions.map((a) =>
      a.id === action.id ? { ...a, content: editContent.value.trim() } : a
    ),
  }
  editingId.value = null
  emit('update', updated)
}

function cancelEdit() {
  editingId.value = null
  editContent.value = ''
}

function deleteAction(action: Action) {
  const updated = {
    ...props.contact,
    actions: props.contact.actions.filter((a) => a.id !== action.id),
  }
  emit('update', updated)
}

function addAction() {
  const content = newActionContent.value.trim()
  if (!content) return
  const updated = {
    ...props.contact,
    actions: [
      ...props.contact.actions,
      { id: crypto.randomUUID(), content },
    ],
  }
  newActionContent.value = ''
  emit('update', updated)
}

function toggleInterval(action: Action) {
  const next = new Set(intervalOpen.value)
  if (next.has(action.id)) {
    // Close & clear interval
    next.delete(action.id)
    const updated = {
      ...props.contact,
      actions: props.contact.actions.map((a) =>
        a.id === action.id
          ? { ...a, intervalDays: undefined, lastProgressAt: undefined }
          : a
      ),
    }
    emit('update', updated)
  } else {
    next.add(action.id)
    intervalDraft.value[action.id] = String(action.intervalDays ?? '')
  }
  intervalOpen.value = next
}

function commitInterval(action: Action) {
  const val = parseInt(intervalDraft.value[action.id] ?? '')
  if (!val || val <= 0) return
  const updated = {
    ...props.contact,
    actions: props.contact.actions.map((a) =>
      a.id === action.id ? { ...a, intervalDays: val } : a
    ),
  }
  emit('update', updated)
  const next = new Set(intervalOpen.value)
  next.delete(action.id)
  intervalOpen.value = next
}
</script>

<template>
  <section>
    <h3 class="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Actions</h3>

    <div class="space-y-1">
      <div
        v-for="action in contact.actions"
        :key="action.id"
        class="group flex items-start gap-2 py-1.5"
      >
        <!-- Content / edit -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <template v-if="editingId === action.id">
              <input
                v-model="editContent"
                class="flex-1 border border-gray-300 rounded px-2 py-0.5 text-sm focus:outline-none focus:border-gray-500"
                @keydown.enter="commitEdit(action)"
                @keydown.escape="cancelEdit"
                autofocus
              />
              <button @click="commitEdit(action)" class="text-green-600 hover:text-green-800">
                <Check :size="15" />
              </button>
              <button @click="cancelEdit" class="text-gray-400 hover:text-gray-600">
                <X :size="15" />
              </button>
            </template>
            <template v-else>
              <span
                class="text-sm text-gray-800"
                :class="{ 'opacity-50': action.intervalDays && !isActionDue(action) }"
              >{{ action.content }}</span>

              <!-- Due badge (only when interval set) -->
              <span
                v-if="action.intervalDays"
                :class="isActionDue(action)
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-green-100 text-green-700'"
                class="text-xs px-1.5 py-0.5 rounded font-medium"
              >
                {{ isActionDue(action) ? 'due' : 'not due' }}
              </span>
            </template>
          </div>

          <!-- Interval field (when open) -->
          <div v-if="intervalOpen.has(action.id)" class="flex items-center gap-2 mt-1">
            <span class="text-xs text-gray-400">Repeat every</span>
            <input
              v-model="intervalDraft[action.id]"
              type="number"
              min="1"
              class="w-16 border border-gray-200 rounded px-2 py-0.5 text-xs focus:outline-none focus:border-gray-400"
              @keydown.enter="commitInterval(action)"
              @keydown.escape="() => intervalOpen.delete(action.id)"
            />
            <span class="text-xs text-gray-400">days</span>
            <button @click="commitInterval(action)" class="text-green-600 hover:text-green-800">
              <Check :size="13" />
            </button>
          </div>
        </div>

        <!-- Action buttons -->
        <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <!-- Interval toggle -->
          <button
            @click="toggleInterval(action)"
            :title="action.intervalDays ? 'Remove interval' : 'Set interval'"
            :class="action.intervalDays ? 'text-blue-500 hover:text-blue-700' : 'text-gray-300 hover:text-gray-500'"
          >
            <Timer :size="15" />
          </button>
          <!-- Progress -->
          <button
            @click="openModal(action, 'progress')"
            title="Mark progress"
            class="text-gray-400 hover:text-blue-600"
          >
            <Loader2 :size="15" />
          </button>
          <!-- Finish -->
          <button
            @click="openModal(action, 'finish')"
            title="Finish"
            class="text-gray-400 hover:text-green-600"
          >
            <CheckCircle2 :size="15" />
          </button>
          <!-- Edit -->
          <button
            v-if="editingId !== action.id"
            @click="startEdit(action)"
            title="Edit"
            class="text-gray-400 hover:text-gray-700"
          >
            <Pencil :size="15" />
          </button>
          <!-- Delete -->
          <button
            @click="deleteAction(action)"
            title="Delete"
            class="text-gray-400 hover:text-red-500"
          >
            <Trash2 :size="15" />
          </button>
        </div>
      </div>

      <!-- New action row -->
      <div class="flex items-center gap-2 pt-1">
        <input
          v-model="newActionContent"
          placeholder="Add action…"
          class="flex-1 text-sm text-gray-700 placeholder-gray-300 border-b border-transparent focus:border-gray-300 focus:outline-none py-0.5"
          @keydown.enter="addAction"
        />
      </div>
    </div>

    <!-- Modal -->
    <ActionModal
      v-if="modal"
      :title="modal.mode === 'progress' ? 'Mark progress' : 'Finish action'"
      @confirm="onModalConfirm"
      @cancel="modal = null"
    />
  </section>
</template>
