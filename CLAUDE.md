# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NodeLink is an Electron-based SSH client (similar to Termius) built with electron-vite, React 19, and TypeScript. It uses a multi-process architecture: main process for SSH/storage, renderer for UI, and a preload script for secure IPC bridging.

## Commands

| Task | Command |
|------|---------|
| Dev server | `pnpm dev` |
| Build | `pnpm build` |
| Build (Mac) | `pnpm build:mac` |
| Typecheck | `pnpm typecheck` |
| Typecheck (main only) | `pnpm typecheck:node` |
| Typecheck (renderer only) | `pnpm typecheck:web` |
| Lint | `pnpm lint` |
| Format | `pnpm format` |

No test runner is configured.

## Architecture

### Process Model

- **Main process** (`src/main/`): Electron lifecycle, IPC handlers, SSH connections (`ssh2`), JSON file storage
- **Preload** (`src/preload/`): Context bridge exposing `window.api` to renderer
- **Renderer** (`src/renderer/`): React UI with xterm.js terminal emulation
- **Shared** (`src/shared/types.ts`): Type definitions used across all processes

### IPC Communication

All IPC goes through the preload context bridge. Channels follow a `domain:action` pattern:

- **CRUD**: `hosts:{getAll,create,update,delete}`, `keychain:{getAll,create,update,delete}`
- **SSH**: `ssh:{connect,input,resize,disconnect}` (renderer→main), `ssh:{data,closed}` (main→renderer events)

When adding new IPC channels, update three files: `src/main/index.ts` (handler), `src/preload/index.ts` (bridge), and `src/preload/index.d.ts` (types).

### Data Model

Hosts reference keychain entries via `keychainId`. Storage is a flat JSON file (`data.json` in Electron's `userData` directory), managed by `src/main/store.ts`.

### Navigation

No router library — view state is managed via `useAppNavigation()` hook in `src/renderer/src/hooks/`. Views: `empty`, `host-form`, `keychain-form`, `terminal`. Sidebar tabs: `hosts` | `keychain`.

### Terminal

Uses `@xterm/xterm` with fit and unicode11 addons. Bidirectional data flows through IPC: renderer sends `ssh:input`, main sends `ssh:data` events.

## Path Aliases

- `@shared/*` → `src/shared/*` (available in both main and renderer)
- `@renderer/*` → `src/renderer/src/*` (renderer only)

## UI Guidelines

- Use **daisyUI** (Tailwind CSS component classes) for all styling — no raw CSS or CSS modules
- Use **Radix UI** for complex interactive patterns (dialogs, dropdowns, toggles)
- Dark theme by default
- When creating or modifying UI components, invoke the `ui-components` skill
