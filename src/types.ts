export interface Action {
  id: string
  content: string
  intervalDays?: number
  lastProgressAt?: string
}

export interface Note {
  id: string
  content: string
}

export interface LogEntry {
  timestamp: string
  message: string
}

export interface Contact {
  name: string
  actions: Action[]
  notes: Note[]
  log: LogEntry[]
}

export type ContactColor = 'none' | 'yellow' | 'red'
