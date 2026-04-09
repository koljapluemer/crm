# simplest-crm

A minimal personal CRM built with Tauri 2, Vue 3, TypeScript, and Tailwind CSS.

## Data

Contacts are stored as JSON files in a user-chosen folder (one file per contact). The folder is selected on first launch via a native dialog and remembered across sessions.

Each contact file contains actions, notes, and an append-only log.

## Features

- **Contacts** — listed in the sidebar; yellow if they have due actions, red if due actions exist and nothing was logged in the past 3 weeks
- **Actions** — tabular list with progress and finish buttons (both open a comment modal and write to the log); inline edit and delete; optional repeat interval per action with a due/not-due badge
- **Notes** — freeform notes, add/edit/delete, no log interaction
- **Log** — read-only append log of progress and finish events with timestamps

## Stack

- [Tauri 2](https://tauri.app)
- [Vue 3](https://vuejs.org) + TypeScript (`<script setup>`)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Lucide](https://lucide.dev) icons

## Dev

```bash
npm install
npm run tauri dev
```

## Build & install (Ubuntu / Debian)

Install system dependencies required by Tauri on Linux (once):

```bash
sudo apt install libwebkit2gtk-4.1-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev
```

Build a `.deb` package:

```bash
npm run tauri:build:deb
```

The package is written to `src-tauri/target/release/bundle/deb/`. Install it with:

```bash
sudo dpkg -i src-tauri/target/release/bundle/deb/simplest-crm_*.deb
```

After installation the app appears in your application launcher. To uninstall:

```bash
sudo dpkg -r simplest-crm
```
