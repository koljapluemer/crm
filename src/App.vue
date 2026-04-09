<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { open } from '@tauri-apps/plugin-dialog'
import type { Contact } from './types'
import {
  getDataFolder, setDataFolder,
  listContacts, loadContact, saveContact,
} from './composables/useContacts'
import Sidebar from './components/Sidebar.vue'
import ContactView from './components/ContactView.vue'

const dataFolder = ref<string | null>(null)
const contactNames = ref<string[]>([])
const contactsMap = ref<Record<string, Contact>>({})
const selectedName = ref<string | null>(null)
const selectedContact = ref<Contact | null>(null)

onMounted(async () => {
  let folder = await getDataFolder()
  if (!folder) {
    const picked = await open({ directory: true, multiple: false, title: 'Choose CRM data folder' })
    if (!picked) return
    folder = picked as string
    await setDataFolder(folder)
  }
  dataFolder.value = folder
  await refreshContacts()
})

async function refreshContacts() {
  const folder = dataFolder.value
  if (!folder) return
  const names = await listContacts(folder)
  contactNames.value = names
  const map: Record<string, Contact> = {}
  await Promise.all(
    names.map(async (name) => {
      map[name] = await loadContact(folder, name)
    })
  )
  contactsMap.value = map
  if (selectedName.value && map[selectedName.value]) {
    selectedContact.value = map[selectedName.value]
  }
}

async function selectContact(name: string) {
  selectedName.value = name
  selectedContact.value = contactsMap.value[name] ?? null
}

async function createContact() {
  const name = prompt('Contact name:')?.trim()
  if (!name || !dataFolder.value) return
  const contact: Contact = { name, actions: [], notes: [], log: [] }
  await saveContact(dataFolder.value, contact)
  await refreshContacts()
  await selectContact(name)
}

async function onContactUpdate(updated: Contact) {
  if (!dataFolder.value || !selectedName.value) return
  const oldName = selectedName.value
  await saveContact(dataFolder.value, updated, oldName)
  selectedName.value = updated.name
  selectedContact.value = updated
  await refreshContacts()
}
</script>

<template>
  <div v-if="!dataFolder" class="flex items-center justify-center h-screen text-gray-400 text-sm">
    Waiting for folder selection…
  </div>

  <template v-else>
    <Sidebar
      :contactNames="contactNames"
      :selectedName="selectedName"
      :contactsMap="contactsMap"
      @select="selectContact"
      @create="createContact"
    />

    <main class="flex-1 overflow-hidden bg-white">
      <div v-if="!selectedContact" class="flex items-center justify-center h-full text-gray-300 text-sm">
        Select a contact
      </div>
      <ContactView
        v-else
        :contact="selectedContact"
        @update="onContactUpdate"
      />
    </main>
  </template>
</template>
