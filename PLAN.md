# Termius Mock - Implementation Plan

## Context
Build a simplified Termius mock desktop app for managing SSH hosts and keychain credentials, with a real embedded SSH terminal to connect to remote hosts.

## Tech Stack
- **Electron + React + TypeScript** via `electron-vite` (react-ts template)
- **Tailwind CSS v4 + daisyUI v5** for styling (dark theme via daisyUI theme) — must use compatible versions
- **Radix UI** for headless primitives (dialog, dropdown, toggle)
- **@xterm/xterm** + **@xterm/addon-fit** for terminal emulation in the renderer (v5+ package names)
- **ssh2** for SSH connections in the main process
- **Local JSON file** in `app.getPath('userData')` for persistence (plaintext — acceptable for mock scope; swap to `electron-safeStorage` for production)
- **uuid** for generating IDs

## Data Models (`src/shared/types.ts`)

Shared types live in `src/shared/types.ts` (used by both main and renderer processes).

```typescript
interface Host {
  id: string; name: string; address: string; port: number; // default 22
  username: string; keychainId: string | null;
  createdAt: string; updatedAt: string;
}

interface KeychainEntry {
  id: string; label: string; username: string;
  authType: 'password' | 'key'; // discriminator: determines which field is used
  password: string; sshKey: string;
  createdAt: string; updatedAt: string;
}

interface AppData { hosts: Host[]; keychain: KeychainEntry[]; }
```

## Architecture
- **Main process** (`src/main/store.ts`): JSON file I/O + CRUD functions
- **Main process** (`src/main/ssh.ts`): SSH session manager using ssh2 — manages sessions via `Map<sessionId, {client, stream}>`, connects to hosts, creates shell streams, relays I/O over IPC
- **IPC**: CRUD handlers + SSH session handlers (all SSH IPC messages include a `sessionId`)
- **Preload** (`src/preload/index.ts`): `contextBridge.exposeInMainWorld('api', ...)` including SSH methods
- **Renderer**: React app with state in `App.tsx`, custom hooks for IPC calls
- **SSH host key verification**: Auto-accept for mock scope (explicitly configured in ssh.ts)

## SSH Terminal Flow
1. User double-clicks a host in the sidebar → opens a terminal tab with "Connecting..." spinner
2. Renderer sends `ssh:connect` IPC with `sessionId` + host details (address, port, username, credentials from keychain)
3. Main process creates an ssh2 `Client`, authenticates (password or private key based on `authType`), opens a shell stream
4. Main process stores session in `Map<sessionId, {client, stream}>` and relays shell stdout → renderer via IPC event `ssh:data` (with `sessionId`)
5. Renderer sends keystrokes → main process via `ssh:input` IPC (with `sessionId`)
6. Terminal resizes via `ssh:resize` IPC (with `sessionId`)
7. Disconnect via `ssh:disconnect`, shell stream close, or app quit (graceful cleanup of all sessions on app close)
8. After disconnect, terminal shows "Disconnected" message with a "Reconnect" button

## UI Layout
Two-column dark theme: fixed sidebar (280px) + main content area.

### Sidebar
- Tab nav (Hosts / Keychain) with clear active indicator
- Item list with host name (bold) + address/username (muted secondary text)
- Connected hosts show a green status dot
- "Add" button context changes per active tab (Add Host / Add Keychain Entry)
- Right-click context menu on items (edit, delete, duplicate) via Radix DropdownMenu
- Hosts sorted alphabetically

### Main Content Area
- Host/Keychain form (create/edit) with inline validation errors
- Embedded xterm.js terminal with toolbar (host info + disconnect button)
- Distinct empty states per context:
  - No hosts yet → CTA to add first host
  - No keychain entries yet → CTA to add first entry
  - Nothing selected → welcome/instructions

### Forms
- Host form: port defaults to 22, keychain dropdown populated from keychain entries (in Phase 4)
- Keychain form: password toggle (show/hide), auth type selector (password vs SSH key), textarea for SSH key input with optional file picker
- Inline validation: required fields, port range 1-65535, address format
- Proper form labels (not placeholder-only)

## Implementation Steps

### Phase 1: Scaffold ✅
1. Scaffold with `pnpm create @quick-start/electron . -- --template react-ts`
2. Install deps: `uuid`, `@types/uuid`, `tailwindcss@4`, `@tailwindcss/vite`, `daisyui@5`, Radix UI packages (`@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-toggle`), `@xterm/xterm`, `@xterm/addon-fit`, `ssh2`, `@types/ssh2`
3. Configure Tailwind v4 + daisyUI v5 (dark theme) in Vite config and CSS
4. Verify `pnpm dev` works, clean out template demo content

### Phase 2: Data Layer
5. Create `src/shared/types.ts` with Host, KeychainEntry, AppData interfaces (shared between main and renderer)
6. Create `src/main/store.ts` — JSON read/write + 8 CRUD functions
7. Register IPC handlers in `src/main/index.ts`
8. Update preload to expose API via contextBridge + add type declarations

### Phase 3: UI Shell
9. Set up Tailwind entry CSS with daisyUI dark theme
10. Build `App.tsx` with two-column layout using daisyUI classes + state management
11. Build `Sidebar.tsx` with Hosts/Keychain tab navigation (daisyUI tabs/menu)

### Phase 4: Hosts Feature
12. Build `useHosts.ts` hook
13. Build `HostList.tsx` (sidebar list with secondary text, context menu) and `HostForm.tsx` (create/edit with keychain dropdown, port default 22)
14. Build distinct `EmptyState.tsx` components (no hosts, nothing selected)

### Phase 5: Keychain Feature
15. Build `useKeychain.ts` hook
16. Build `KeychainList.tsx` and `KeychainForm.tsx` (with auth type selector, password toggle, SSH key textarea)

### Phase 6: SSH Terminal
17. Create `src/main/ssh.ts` — SSH session manager with `Map<sessionId, {client, stream}>`, connect/disconnect/cleanup, auto-accept host keys, 10s connection timeout
18. Register SSH IPC handlers in main process: `ssh:connect`, `ssh:data`, `ssh:input`, `ssh:resize`, `ssh:disconnect` (all include `sessionId`)
19. Expose SSH methods in preload
20. Build `Terminal.tsx` component — xterm.js instance with fit addon, toolbar (host info + disconnect button), connecting/disconnected states with reconnect option
21. Add connect action to host list items (double-click or button) that opens the terminal view
22. Handle connection errors (display in terminal area: auth failure, timeout, unreachable host)
23. Add graceful cleanup: disconnect all SSH sessions on app quit

### Phase 7: Integration & Polish
24. Add delete confirmation (Radix UI Dialog) + inline form validation
25. Handle cascading: deleting a keychain entry nulls out linked hosts' keychainId
26. Add connection status indicator in sidebar (connected hosts get a green dot)
27. Handle edge case: connecting to a host whose keychain entry was deleted (prompt or show error)

## Verification
1. `pnpm dev` launches dark-themed Electron window
2. Full CRUD for hosts and keychain entries
3. Keychain dropdown in host form works, linking persists
4. Data persists across app restart
5. Deleting linked keychain entry cleans up host references
6. Double-clicking a host shows "Connecting..." then opens an SSH terminal session
7. Can type commands in the terminal and see output
8. Terminal resizes properly when window is resized
9. Disconnecting closes the SSH session cleanly, shows "Disconnected" with reconnect option
10. Connection errors display clearly (wrong password, unreachable host, timeout)
11. Both password and SSH key authentication work
12. App quit gracefully disconnects all active SSH sessions
