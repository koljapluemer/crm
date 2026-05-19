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
  notes: Note[]
  log: LogEntry[]
  lastEditedAt?: string
}
