import { invoke } from '@tauri-apps/api/core'
import type { Contact } from '../types'

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

const DAY_MS = 86_400_000
const YEAR_DAYS = 365
const GREEN_HUE = 145
const RECENT_LIGHTNESS = 24
const STALE_LIGHTNESS = 84
const RECENT_SATURATION = 52
const STALE_SATURATION = 4
const DARK_TEXT = 'hsl(0 0% 12%)'
const LIGHT_TEXT = 'hsl(0 0% 98%)'

function startOfLocalDay(value: Date): number {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime()
}

function daysSinceCalendarDate(iso: string, now = new Date()): number {
  const edited = new Date(iso)
  if (Number.isNaN(edited.getTime())) return YEAR_DAYS
  const diff = startOfLocalDay(now) - startOfLocalDay(edited)
  return Math.max(0, Math.floor(diff / DAY_MS))
}

function saturationForAge(days: number): number {
  if (days <= 0) return RECENT_SATURATION
  if (days >= YEAR_DAYS) return STALE_SATURATION
  const progress = Math.log1p(days) / Math.log1p(YEAR_DAYS)
  return RECENT_SATURATION + (STALE_SATURATION - RECENT_SATURATION) * progress
}

function lightnessForAge(days: number): number {
  if (days <= 0) return RECENT_LIGHTNESS
  if (days >= YEAR_DAYS) return STALE_LIGHTNESS
  const progress = Math.log1p(days) / Math.log1p(YEAR_DAYS)
  return RECENT_LIGHTNESS + (STALE_LIGHTNESS - RECENT_LIGHTNESS) * progress
}

export function contactRowStyle(contact: Contact): Record<string, string> {
  const lastEditedAt = contact.lastEditedAt
  if (!lastEditedAt) {
    return {
      backgroundColor: `hsl(0 0% ${STALE_LIGHTNESS}%)`,
      color: DARK_TEXT,
    }
  }

  const days = daysSinceCalendarDate(lastEditedAt)
  const saturation = saturationForAge(days)
  const lightness = lightnessForAge(days)

  return {
    backgroundColor: `hsl(${GREEN_HUE} ${saturation}% ${lightness}%)`,
    color: lightness >= 58 ? DARK_TEXT : LIGHT_TEXT,
  }
}
