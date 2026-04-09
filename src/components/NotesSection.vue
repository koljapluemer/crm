<script setup lang="ts">
import { ref } from 'vue'
import { Pencil, Trash2, Check, X } from 'lucide-vue-next'
import type { Contact, Note } from '../types'

const props = defineProps<{ contact: Contact }>()
const emit = defineEmits<{ update: [contact: Contact] }>()

const editingId = ref<string | null>(null)
const editContent = ref('')
const newNoteContent = ref('')

function startEdit(note: Note) {
  editingId.value = note.id
  editContent.value = note.content
}

function commitEdit(note: Note) {
  if (!editContent.value.trim()) {
    cancelEdit()
    return
  }
  const updated = {
    ...props.contact,
    notes: props.contact.notes.map((n) =>
      n.id === note.id ? { ...n, content: editContent.value.trim() } : n
    ),
  }
  editingId.value = null
  emit('update', updated)
}

function cancelEdit() {
  editingId.value = null
  editContent.value = ''
}

function deleteNote(note: Note) {
  const updated = {
    ...props.contact,
    notes: props.contact.notes.filter((n) => n.id !== note.id),
  }
  emit('update', updated)
}

function addNote() {
  const content = newNoteContent.value.trim()
  if (!content) return
  const updated = {
    ...props.contact,
    notes: [...props.contact.notes, { id: crypto.randomUUID(), content }],
  }
  newNoteContent.value = ''
  emit('update', updated)
}
</script>

<template>
  <section>
    <h3 class="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Notes</h3>

    <div class="space-y-1">
      <div
        v-for="note in contact.notes"
        :key="note.id"
        class="group flex items-start gap-2 py-1"
      >
        <div class="flex-1 min-w-0">
          <template v-if="editingId === note.id">
            <div class="flex items-center gap-2">
              <input
                v-model="editContent"
                class="flex-1 border border-gray-300 rounded px-2 py-0.5 text-sm focus:outline-none focus:border-gray-500"
                @keydown.enter="commitEdit(note)"
                @keydown.escape="cancelEdit"
                autofocus
              />
              <button @click="commitEdit(note)" class="text-green-600 hover:text-green-800">
                <Check :size="15" />
              </button>
              <button @click="cancelEdit" class="text-gray-400 hover:text-gray-600">
                <X :size="15" />
              </button>
            </div>
          </template>
          <template v-else>
            <span class="text-sm text-gray-700">{{ note.content }}</span>
          </template>
        </div>

        <div
          v-if="editingId !== note.id"
          class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
        >
          <button @click="startEdit(note)" class="text-gray-400 hover:text-gray-700">
            <Pencil :size="15" />
          </button>
          <button @click="deleteNote(note)" class="text-gray-400 hover:text-red-500">
            <Trash2 :size="15" />
          </button>
        </div>
      </div>

      <!-- New note -->
      <div class="flex items-center gap-2 pt-1">
        <input
          v-model="newNoteContent"
          placeholder="Add note…"
          class="flex-1 text-sm text-gray-700 placeholder-gray-300 border-b border-transparent focus:border-gray-300 focus:outline-none py-0.5"
          @keydown.enter="addNote"
        />
      </div>
    </div>
  </section>
</template>
