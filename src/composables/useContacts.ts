import { invoke } from '@tauri-apps/api/core'
import type { Contact, Action, ContactColor } from '../types'

export async function getDataFolder(): Promise<string | null> {
  return invoke<string | null>('get_data_folder')
}

export async function setDataFolder(path: string): Promise<void> {
  return invoke('set_data_folder', { path })
}

export async function listContacts(folder: string): Promise<string[]> {
  return invoke<string[]>('list_contacts', { folder })
}

export async function loadContact(folder: string, name: string): Promise<Contact> {
  return invoke<Contact>('load_contact', { folder, name })
}

export async function saveContact(
  folder: string,
  contact: Contact,
  oldName?: string
): Promise<void> {
  return invoke('save_contact', { folder, contact, oldName: oldName ?? null })
}

export async function deleteContact(folder: string, name: string): Promise<void> {
  return invoke('delete_contact', { folder, name })
}

export function isActionDue(action: Action): boolean {
  if (!action.intervalDays) return true
  if (!action.lastProgressAt) return true
  const ms = Date.now() - new Date(action.lastProgressAt).getTime()
  return ms >= action.intervalDays * 86_400_000
}

export function contactColor(contact: Contact): ContactColor {
  const hasDueAction = contact.actions.some(isActionDue)
  if (!hasDueAction) return 'none'

  const threeWeeksAgo = Date.now() - 21 * 86_400_000
  const hasRecentLog = contact.log.some(
    (e) => new Date(e.timestamp).getTime() >= threeWeeksAgo
  )
  return hasRecentLog ? 'yellow' : 'red'
}
